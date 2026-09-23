import { pool } from '../config/db.js';

async function verifyEventOwnership(eventId, orgId) {
  const result = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, orgId]);
  return result.rows.length > 0;
}

async function verifyClientAccess(eventId, userId) {
  const result = await pool.query(
    'SELECT id FROM events WHERE id = $1 AND client_id = $2',
    [eventId, userId]
  );
  return result.rows.length > 0;
}

// --- Staff side ---

export async function getApprovals(req, res) {
  const { eventId } = req.params;
  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'SELECT * FROM client_approvals WHERE event_id = $1 ORDER BY created_at DESC',
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch approvals.' });
  }
}

export async function createApprovalRequest(req, res) {
  const { eventId } = req.params;
  const { itemType, title, description } = req.body;

  if (!itemType || !title) {
    return res.status(400).json({ error: 'itemType and title are required.' });
  }

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `INSERT INTO client_approvals (event_id, item_type, title, description, requested_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [eventId, itemType, title, description || null, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create approval request.' });
  }
}

export async function deleteApprovalRequest(req, res) {
  const { eventId, id } = req.params;
  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'DELETE FROM client_approvals WHERE id = $1 AND event_id = $2 RETURNING id',
      [id, eventId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Approval not found.' });
    res.json({ message: 'Approval request deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete approval request.' });
  }
}

// --- Client side ---

export async function getMyEventAsClient(req, res) {
  const { eventId } = req.params;
  const hasAccess = await verifyClientAccess(eventId, req.user.userId);
  if (!hasAccess) return res.status(403).json({ error: 'You do not have access to this event.' });

  try {
    const eventResult = await pool.query(
      `SELECT e.id, e.name, e.name_am, e.event_type, e.status, e.start_date, e.end_date, e.guest_count,
              v.name AS venue_name, v.address AS venue_address
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       WHERE e.id = $1`,
      [eventId]
    );

    const timelineResult = await pool.query(
      'SELECT start_time, end_time, title, title_am, description FROM timeline_items WHERE event_id = $1 ORDER BY start_time',
      [eventId]
    );

    const budgetResult = await pool.query(
      `SELECT COALESCE(SUM(estimated_amount_etb), 0) AS total_estimated,
              COALESCE(SUM(actual_amount_etb), 0) AS total_actual
       FROM budget_items WHERE event_id = $1`,
      [eventId]
    );

    const approvalsResult = await pool.query(
      'SELECT * FROM client_approvals WHERE event_id = $1 ORDER BY created_at DESC',
      [eventId]
    );

    res.json({
      event: eventResult.rows[0],
      timeline: timelineResult.rows,
      budgetSummary: budgetResult.rows[0],
      approvals: approvalsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch event details.' });
  }
}

export async function respondToApproval(req, res) {
  const { eventId, id } = req.params;
  const { status, clientComment } = req.body;

  if (!['approved', 'changes_requested'].includes(status)) {
    return res.status(400).json({ error: "status must be 'approved' or 'changes_requested'." });
  }

  const hasAccess = await verifyClientAccess(eventId, req.user.userId);
  if (!hasAccess) return res.status(403).json({ error: 'You do not have access to this event.' });

  try {
    const result = await pool.query(
      `UPDATE client_approvals SET status = $1, client_comment = $2, responded_at = NOW()
       WHERE id = $3 AND event_id = $4
       RETURNING *`,
      [status, clientComment || null, id, eventId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Approval not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not respond to approval.' });
  }
}