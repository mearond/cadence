import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

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
       VALUES ($1, $2, $3, $4, 'admin')`,
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