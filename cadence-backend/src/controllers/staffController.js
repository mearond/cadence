import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/db.js';
import { sendStaffInviteEmail } from '../lib/mailer.js';
import { STAFF_ROLES, ASSIGNABLE_ROLES } from '../lib/permissions.js';

const ROLE_ERROR = `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}.`;

export async function getStaff(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, title, preferred_language
       FROM users
       WHERE org_id = $1 AND role = ANY($2)
       ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'manager' THEN 1 WHEN 'coordinator' THEN 2 ELSE 3 END, name`,
      [req.user.orgId, STAFF_ROLES]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch staff.' });
  }
}

export async function createStaff(req, res) {
  const { name, email, title, role = 'staff' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return res.status(400).json({ error: ROLE_ERROR });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const created = await pool.query(
      `INSERT INTO users (org_id, name, email, password_hash, role, title, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, name, email, role, title, preferred_language`,
      [req.user.orgId, name, email, passwordHash, role, title || null]
    );
    const staff = created.rows[0];

    let emailSent = false;
    try {
      const orgResult = await pool.query('SELECT name FROM organizations WHERE id = $1', [req.user.orgId]);
      const orgName = orgResult.rows[0]?.name || 'Cadence';

      await sendStaffInviteEmail({
        to: staff.email,
        staffName: staff.name,
        orgName,
        temporaryPassword,
        title: staff.title,
      });
      emailSent = true;
    } catch (emailErr) {
      console.error('Could not send staff invite email:', emailErr);
    }

    res.status(201).json({ staff, temporaryPassword, emailSent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create staff member.' });
  }
}

export async function updateStaff(req, res) {
  const { id } = req.params;
  const { name, title, role } = req.body;

  if (role !== undefined && !ASSIGNABLE_ROLES.includes(role)) {
    return res.status(400).json({ error: ROLE_ERROR });
  }

  try {
    const target = await pool.query(
      'SELECT role FROM users WHERE id = $1 AND org_id = $2 AND role = ANY($3)',
      [id, req.user.orgId, STAFF_ROLES]
    );
    if (target.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    // The owner's role is fixed; there is always exactly one owner per agency.
    if (role !== undefined && target.rows[0].role === 'owner' && role !== 'owner') {
      return res.status(400).json({ error: "The owner's role cannot be changed." });
    }

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        title = COALESCE($2, title),
        role = CASE WHEN role = 'owner' THEN role ELSE COALESCE($3, role) END
       WHERE id = $4 AND org_id = $5
       RETURNING id, name, email, role, title, preferred_language`,
      [name, title, role, id, req.user.orgId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update staff member.' });
  }
}

export async function deleteStaff(req, res) {
  const { id } = req.params;

  if (Number(id) === req.user.userId) {
    return res.status(400).json({ error: 'You cannot remove your own account.' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND org_id = $2 AND role = ANY($3) RETURNING id`,
      [id, req.user.orgId, ASSIGNABLE_ROLES]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.json({ message: 'Staff member removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove staff member.' });
  }
}
