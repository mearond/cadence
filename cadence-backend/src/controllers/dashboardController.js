import { pool } from '../config/db.js';

export async function getDashboardSummary(req, res) {
  const orgId = req.user.orgId;
  try {
    const upcomingResult = await pool.query(
      `SELECT id, name, name_am, event_type, status, start_date, end_date, guest_count
       FROM events
       WHERE org_id = $1 AND status NOT IN ('completed', 'cancelled')
       ORDER BY start_date ASC NULLS LAST
       LIMIT 6`,
      [orgId]
    );

    const statusCountsResult = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM events WHERE org_id = $1 GROUP BY status`,
      [orgId]
    );

    const pendingTasksResult = await pool.query(
      `SELECT t.id, t.title, t.priority, t.status, t.due_date, e.id AS event_id, e.name AS event_name
       FROM tasks t
       JOIN events e ON t.event_id = e.id
       WHERE e.org_id = $1 AND t.status != 'complete'
       ORDER BY
         CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         t.due_date ASC NULLS LAST
       LIMIT 8`,
      [orgId]
    );

    const allEventsResult = await pool.query(
      `SELECT id, name, name_am, start_date, status FROM events WHERE org_id = $1`,
      [orgId]
    );

    res.json({
      upcomingEvents: upcomingResult.rows,
      statusCounts: statusCountsResult.rows,
      pendingTasks: pendingTasksResult.rows,
      allEvents: allEventsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load dashboard summary.' });
  }
}