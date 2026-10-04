import { pool } from '../config/db.js';

// Staff: list the clients linked to an event
export async function getEventClients(req, res) {
  const { eventId } = req.params;
  try {
    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, req.user.orgId]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ error: 'Event not found.' });

    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM event_clients ec
       JOIN users u ON u.id = ec.client_id
       WHERE ec.event_id = $1
       ORDER BY u.name`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch clients.' });
  }
}

// Staff: unlink a client from an event (does not delete the client account)
export async function removeEventClient(req, res) {
  const { eventId, clientId } = req.params;
  try {
    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, req.user.orgId]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ error: 'Event not found.' });

    const result = await pool.query(
      'DELETE FROM event_clients WHERE event_id = $1 AND client_id = $2 RETURNING event_id',
      [eventId, clientId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client is not linked to this event.' });

    res.json({ message: 'Client removed from this event.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove client.' });
  }
}