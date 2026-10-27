import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db.js';
import { sendPasswordResetEmail } from '../lib/mailer.js';

export async function signup(req, res) {
  const { orgName, name, email, password } = req.body;

  if (!orgName || !name || !email || !password) {
    return res.status(400).json({ error: 'orgName, name, email, and password are required.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const orgResult = await pool.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      [orgName]
    );
    const orgId = orgResult.rows[0].id;

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (org_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'owner')`,
      [orgId, name, email, passwordHash]
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Could not create your account. Please try again.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, org_id, name, email, password_hash, role, preferred_language, must_change_password FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.org_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, must_change_password, ...rest } = user;
    const safeUser = { ...rest, mustChangePassword: must_change_password };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

export async function setPassword(req, res) {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, must_change_password = FALSE
       WHERE id = $2
       RETURNING id, org_id, name, email, role, preferred_language`,
      [passwordHash, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = { ...result.rows[0], mustChangePassword: false };
    return res.json({ user });
  } catch (err) {
    console.error('Set password error:', err);
    return res.status(500).json({ error: 'Could not update password. Please try again.' });
  }
}
// Returns the signed-in user as stored now, so the app can pick up role changes
// (e.g. the admin -> owner rename) without the person logging out and back in.
export async function getMe(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, org_id, name, email, role, preferred_language, must_change_password FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Account no longer exists.' });
    }
    const { must_change_password, ...rest } = result.rows[0];
    return res.json({ user: { ...rest, mustChangePassword: must_change_password } });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Could not load your account.' });
  }
}

const RESET_MINUTES = 60;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Step 1: email a one-time reset link. Always answers the same way, so the
// form can't be used to find out which emails have accounts.
export async function forgotPassword(req, res) {
  const email = String(req.body.email || '').trim();
  const generic = { message: 'If an account exists for that email, a reset link is on its way.' };

  if (!email) {
    return res.status(400).json({ error: 'Enter your email address.' });
  }

  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = result.rows[0];
    if (!user) return res.json(generic);

    // At most one email per minute per account.
    const recent = await pool.query(
      "SELECT 1 FROM password_reset_tokens WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 minute'",
      [user.id]
    );
    if (recent.rows.length > 0) return res.json(generic);

    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
      [user.id, hashToken(token), String(RESET_MINUTES)]
    );

    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${base}/reset-password?token=${token}`,
        minutes: RESET_MINUTES,
      });
    } catch (emailErr) {
      console.error('Could not send password reset email:', emailErr);
      return res.status(502).json({ error: 'We could not send the email right now. Please try again in a few minutes.' });
    }

    return res.json(generic);
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// Step 2: set a new password using the link's token.
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'This reset link is missing its code. Open the link from the email again.' });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [hashToken(String(token))]
    );
    if (found.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This reset link has expired or was already used. Ask for a new one.' });
    }
    const { id, user_id: userId } = found.rows[0];

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [passwordHash, userId]);
    await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [id]);
    // Any other outstanding links for this account stop working.
    await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2', [userId, id]);
    await client.query('COMMIT');

    return res.json({ message: 'Your password has been changed. You can sign in now.' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Could not change your password. Please try again.' });
  } finally {
    client.release();
  }
}
