import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/db.js';

export async function inviteClientToEvent(req, res) {
  const { eventId } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const eventCheck = await pool.query(
      'SELECT id, org_id FROM events WHERE id = $1 AND org_id = $2',
      [eventId, req.user.orgId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const existing = await pool.query('SELECT id, role, org_id FROM users WHERE email = $1', [email]);

    let clientUser;
    let temporaryPassword = null;

    if (existing.rows.length > 0) {
      const foundUser = existing.rows[0];

      if (foundUser.role !== 'client') {
        return res.status(409).json({
          error: 'This email belongs to an existing staff account and cannot be used as a client.',
        });
      }
      if (foundUser.org_id !== req.user.orgId) {
        return res.status(409).json({
          error: 'This email is already registered as a client with a different agency.',
        });
      }

      clientUser = foundUser;
    } else {
      temporaryPassword = crypto.randomBytes(6).toString('hex');
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);

      const created = await pool.query(
        `INSERT INTO users (org_id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'client')
         RETURNING id, name, email, role, org_id`,
        [req.user.orgId, name, email, passwordHash]
      );
      clientUser = created.rows[0];
    }

    await pool.query('UPDATE events SET client_id = $1 WHERE id = $2', [clientUser.id, eventId]);

    res.status(200).json({
      message: temporaryPassword
        ? 'Client account created and linked to this event.'
        : 'Existing client linked to this event.',
      client: { id: clientUser.id, name: clientUser.name || name, email: clientUser.email || email },
      temporaryPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not invite client.' });
  }
}