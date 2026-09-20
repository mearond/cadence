import { pool } from '../config/db.js';

async function verifyEventOwnership(eventId, orgId) {
  const result = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, orgId]);
  return result.rows.length > 0;
}

export async function getTimelineItems(req, res) {
  const { eventId } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `SELECT ti.*, u.name AS responsible_person_name
       FROM timeline_items ti
       LEFT JOIN users u ON ti.responsible_person_id = u.id
       WHERE ti.event_id = $1
       ORDER BY ti.start_time, ti.sort_order`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch timeline items.' });
  }
}

export async function createTimelineItem(req, res) {
  const { eventId } = req.params;
  const { startTime, endTime, title, titleAm, description, responsiblePersonId, sortOrder } = req.body;

  if (!startTime || !title) {
    return res.status(400).json({ error: 'Start time and title are required.' });
  }

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `INSERT INTO timeline_items (event_id, start_time, end_time, title, title_am, description, responsible_person_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [eventId, startTime, endTime || null, title, titleAm || null, description || null, responsiblePersonId || null, sortOrder || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create timeline item.' });
  }
}

export async function updateTimelineItem(req, res) {
  const { eventId, id } = req.params;
  const { startTime, endTime, title, titleAm, description, responsiblePersonId, sortOrder } = req.body;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `UPDATE timeline_items SET
        start_time = COALESCE($1, start_time),
        end_time = COALESCE($2, end_time),
        title = COALESCE($3, title),
        title_am = COALESCE($4, title_am),
        description = COALESCE($5, description),
        responsible_person_id = COALESCE($6, responsible_person_id),
        sort_order = COALESCE($7, sort_order)
       WHERE id = $8 AND event_id = $9
       RETURNING *`,
      [startTime, endTime, title, titleAm, description, responsiblePersonId, sortOrder, id, eventId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline item not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update timeline item.' });
  }
}

export async function deleteTimelineItem(req, res) {
  const { eventId, id } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'DELETE FROM timeline_items WHERE id = $1 AND event_id = $2 RETURNING id',
      [id, eventId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timeline item not found.' });
    }
    res.json({ message: 'Timeline item deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete timeline item.' });
  }
}