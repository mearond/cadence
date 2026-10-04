import { pool } from '../config/db.js';

// Staff/admin: view a rating
export async function getEventRating(req, res) {
  const { eventId } = req.params;
  try {
    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, req.user.orgId]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ error: 'Event not found.' });

    const result = await pool.query('SELECT * FROM event_ratings WHERE event_id = $1', [eventId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch rating.' });
  }
}

// Client: view own rating
export async function getMyEventRating(req, res) {
  const { eventId } = req.params;
  try {
    const access = await pool.query('SELECT event_id FROM event_clients WHERE event_id = $1 AND client_id = $2', [eventId, req.user.userId]);
    if (access.rows.length === 0) return res.status(403).json({ error: 'You do not have access to this event.' });

    const result = await pool.query('SELECT * FROM event_ratings WHERE event_id = $1', [eventId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch rating.' });
  }
}

// Client: submit a rating, once, only after the event has ended
export async function submitEventRating(req, res) {
  const { eventId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const access = await pool.query(
      `SELECT e.id, e.status FROM events e
       JOIN event_clients ec ON ec.event_id = e.id
       WHERE e.id = $1 AND ec.client_id = $2`,
      [eventId, req.user.userId]
    );
    if (access.rows.length === 0) return res.status(403).json({ error: 'You do not have access to this event.' });
    if (access.rows[0].status !== 'completed') {
      return res.status(400).json({ error: 'You can only rate an event after it has ended.' });
    }

    const existing = await pool.query('SELECT id FROM event_ratings WHERE event_id = $1', [eventId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already rated this event.' });
    }

    const result = await pool.query(
      'INSERT INTO event_ratings (event_id, rating, comment) VALUES ($1, $2, $3) RETURNING *',
      [eventId, rating, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit rating.' });
  }
}