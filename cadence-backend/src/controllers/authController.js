import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export async function signup(req, res) {
  const { orgName, name, email, password } = req.body;

  if (!orgName || !name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const orgResult = await pool.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id, name',
      [orgName]
    );
    const org = orgResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (org_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, name, email, role, org_id`,
      [org.id, name, email, passwordHash]
    );
    const user = userResult.rows[0];

    res.status(201).json({ message: 'Account created successfully.', organization: org, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating your account.' });
  }
}