import { pool } from '../config/db.js';
import { can } from '../lib/permissions.js';

// An assignee must be a staff member (not a client) of the same agency.
async function isValidAssignee(userId, orgId) {
  const result = await pool.query(
    "SELECT 1 FROM users WHERE id = $1 AND org_id = $2 AND role IN ('owner', 'manager', 'coordinator', 'staff')",
    [userId, orgId]
  );
  return result.rows.length > 0;
}

async function verifyEventOwnership(eventId, orgId) {
  const result = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, orgId]);
  return result.rows.length > 0;
}

export async function getTasks(req, res) {
  const { eventId } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `SELECT t.*, u.name AS assigned_to_name,
        (SELECT COUNT(*) FROM task_checkpoints WHERE task_id = t.id) AS checkpoint_count,
        (SELECT COUNT(*) FROM task_checkpoints WHERE task_id = t.id AND checked = true) AS checkpoint_done
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.event_id = $1
       ORDER BY t.created_at DESC`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch tasks.' });
  }
}

export async function createTask(req, res) {
  const { eventId } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  if (assignedTo && !(await isValidAssignee(assignedTo, req.user.orgId))) {
    return res.status(400).json({ error: 'Choose someone on your staff to assign this task to.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (event_id, title, description, priority, assigned_to, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [eventId, title, description || null, priority || 'medium', assignedTo || null, dueDate || null, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create task.' });
  }
}

export async function updateTask(req, res) {
  const { eventId, id } = req.params;
  const { title, description, status, priority, dueDate } = req.body;
  // `assignedTo` present in the body (even as null) means "change the assignee".
  const changesAssignee = Object.prototype.hasOwnProperty.call(req.body, 'assignedTo');
  const assignedTo = req.body.assignedTo || null;

  // Event staff may only change a task's status; editing anything else needs tasks:manage.
  const editsOtherFields = changesAssignee || [title, description, priority, dueDate].some((v) => v !== undefined);
  if (editsOtherFields && !can(req.user.role, 'tasks:manage')) {
    return res.status(403).json({ error: 'You can only update the status of a task.' });
  }

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  if (changesAssignee && assignedTo && !(await isValidAssignee(assignedTo, req.user.orgId))) {
    return res.status(400).json({ error: 'Choose someone on your staff to assign this task to.' });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        assigned_to = CASE WHEN $8 THEN $9::int ELSE assigned_to END,
        removed_assignee_name = CASE WHEN $8 THEN NULL ELSE removed_assignee_name END
       WHERE id = $6 AND event_id = $7
       RETURNING *`,
      [title, description, status, priority, dueDate, id, eventId, changesAssignee, assignedTo]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update task.' });
  }
}

export async function deleteTask(req, res) {
  const { eventId, id } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND event_id = $2 RETURNING id',
      [id, eventId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete task.' });
  }
}

// --- Checkpoints ---

export async function addCheckpoint(req, res) {
  const { eventId, taskId } = req.params;
  const { label } = req.body;

  if (!label) return res.status(400).json({ error: 'Label is required.' });

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `INSERT INTO task_checkpoints (task_id, label, added_by) VALUES ($1, $2, $3) RETURNING *`,
      [taskId, label, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add checkpoint.' });
  }
}

export async function toggleCheckpoint(req, res) {
  const { eventId, taskId, checkpointId } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `UPDATE task_checkpoints SET checked = NOT checked
       WHERE id = $1 AND task_id = $2
       RETURNING *`,
      [checkpointId, taskId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Checkpoint not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not toggle checkpoint.' });
  }
}

export async function deleteCheckpoint(req, res) {
  const { eventId, taskId, checkpointId } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'DELETE FROM task_checkpoints WHERE id = $1 AND task_id = $2 RETURNING id',
      [checkpointId, taskId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Checkpoint not found.' });
    res.json({ message: 'Checkpoint deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete checkpoint.' });
  }
}