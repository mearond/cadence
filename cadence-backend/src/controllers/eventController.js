import { pool } from '../config/db.js';
import { effectiveStatusSql, EVENT_TYPES, MANUAL_STATUSES } from '../lib/eventStatus.js';

// `status` is the derived status the app displays; `manual_status` is what was
// stored (planning / confirmed / cancelled), used to prefill the edit form.
const EVENT_COLUMNS = `
  e.id, e.org_id, e.name, e.name_am, e.event_type, e.start_date, e.end_date,
  e.venue_id, e.guest_count, e.created_by, e.created_at,
  e.status AS manual_status,
  ${effectiveStatusSql('e')} AS status`;

async function findEvent(id, orgId) {
  const result = await pool.query(`SELECT ${EVENT_COLUMNS} FROM events e WHERE e.id = $1 AND e.org_id = $2`, [id, orgId]);
  return result.rows[0] || null;
}

function validateEventFields({ eventType, status, startDate, endDate }) {
  if (eventType !== undefined && !EVENT_TYPES.includes(eventType)) {
    return `eventType must be one of: ${EVENT_TYPES.join(', ')}.`;
  }
  if (status !== undefined && !MANUAL_STATUSES.includes(status)) {
    return `status must be one of: ${MANUAL_STATUSES.join(', ')}. In progress and completed are set from the dates.`;
  }
  if (startDate && endDate && endDate < startDate) {
    return 'End date cannot be before the start date.';
  }
  return null;
}

export async function getEvents(req, res) {
  try {
    const result = await pool.query(
      `SELECT ${EVENT_COLUMNS} FROM events e WHERE e.org_id = $1 ORDER BY e.start_date DESC`,
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch events.' });
  }
}

export async function getEventById(req, res) {
  try {
    const event = await findEvent(req.params.id, req.user.orgId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch event.' });
  }
}

export async function createEvent(req, res) {
  const { name, nameAm, eventType, startDate, endDate, venueId, guestCount } = req.body;

  if (!name || !eventType || !startDate || !endDate) {
    return res.status(400).json({ error: 'Name, event type, start date, and end date are required.' });
  }

  const validationError = validateEventFields({ eventType, startDate, endDate });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (org_id, name, name_am, event_type, start_date, end_date, venue_id, guest_count, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [req.user.orgId, name, nameAm || null, eventType, startDate, endDate, venueId || null, guestCount || null, req.user.userId]
    );
    res.status(201).json(await findEvent(result.rows[0].id, req.user.orgId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create event.' });
  }
}

export async function updateEvent(req, res) {
  const { id } = req.params;
  const { name, nameAm, eventType, status, startDate, endDate, venueId, guestCount } = req.body;

  const validationError = validateEventFields({ eventType, status, startDate, endDate });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

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
       RETURNING id`,
      [name, nameAm, eventType, status, startDate, endDate, venueId, guestCount, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(await findEvent(id, req.user.orgId));
  } catch (err) {
    // 23514 = check constraint, e.g. only one date sent and it lands on the wrong side of the other
    if (err.code === '23514') {
      return res.status(400).json({ error: 'End date cannot be before the start date.' });
    }
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
