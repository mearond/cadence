import { pool } from '../config/db.js';

export async function getEvents(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE org_id = $1 ORDER BY start_date DESC',
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch events.' });
  }
}

export async function getEventById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch event.' });
  }
}

export async function createEvent(req, res) {
  const { name, nameAm, eventType, startDate, endDate, venueId, guestCount } = req.body;

  if (!name || !eventType || !startDate) {
    return res.status(400).json({ error: 'Name, event type, and start date are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (org_id, name, name_am, event_type, start_date, end_date, venue_id, guest_count, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.orgId, name, nameAm || null, eventType, startDate, endDate || null, venueId || null, guestCount || null, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create event.' });
  }
}

export async function updateEvent(req, res) {
  const { id } = req.params;
  const { name, nameAm, eventType, status, startDate, endDate, venueId, guestCount } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events SET
        name = COALESCE($1, name),
        name_am = COALESCE($2, name_am),
        event_type = COALESCE($3, event_type),
        status = COALESCE($4, status),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        venue_id = COALESCE($7, venue_id),
        guest_count = COALESCE($8, guest_count)
       WHERE id = $9 AND org_id = $10
       RETURNING *`,
      [name, nameAm, eventType, status, startDate, endDate, venueId, guestCount, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update event.' });
  }
}

export async function deleteEvent(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete event.' });
  }
}