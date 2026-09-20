import { pool } from '../config/db.js';

async function verifyEventOwnership(eventId, orgId) {
  const result = await pool.query('SELECT id FROM events WHERE id = $1 AND org_id = $2', [eventId, orgId]);
  return result.rows.length > 0;
}

export async function getBudgetItems(req, res) {
  const { eventId } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'SELECT * FROM budget_items WHERE event_id = $1 ORDER BY created_at',
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch budget items.' });
  }
}

export async function createBudgetItem(req, res) {
  const { eventId } = req.params;
  const { category, name, estimatedAmountEtb, actualAmountEtb, vatApplicable } = req.body;

  if (!category || !name) {
    return res.status(400).json({ error: 'Category and name are required.' });
  }

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `INSERT INTO budget_items (event_id, category, name, estimated_amount_etb, actual_amount_etb, vat_applicable)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [eventId, category, name, estimatedAmountEtb || 0, actualAmountEtb || 0, vatApplicable ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create budget item.' });
  }
}

export async function updateBudgetItem(req, res) {
  const { eventId, id } = req.params;
  const { category, name, estimatedAmountEtb, actualAmountEtb, vatApplicable } = req.body;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `UPDATE budget_items SET
        category = COALESCE($1, category),
        name = COALESCE($2, name),
        estimated_amount_etb = COALESCE($3, estimated_amount_etb),
        actual_amount_etb = COALESCE($4, actual_amount_etb),
        vat_applicable = COALESCE($5, vat_applicable)
       WHERE id = $6 AND event_id = $7
       RETURNING *`,
      [category, name, estimatedAmountEtb, actualAmountEtb, vatApplicable, id, eventId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Budget item not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update budget item.' });
  }
}

export async function deleteBudgetItem(req, res) {
  const { eventId, id } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      'DELETE FROM budget_items WHERE id = $1 AND event_id = $2 RETURNING id',
      [id, eventId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Budget item not found.' });
    }
    res.json({ message: 'Budget item deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete budget item.' });
  }
}

export async function getBudgetSummary(req, res) {
  const { eventId } = req.params;

  const owns = await verifyEventOwnership(eventId, req.user.orgId);
  if (!owns) return res.status(404).json({ error: 'Event not found.' });

  try {
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(estimated_amount_etb), 0) AS total_estimated,
        COALESCE(SUM(actual_amount_etb), 0) AS total_actual,
        COALESCE(SUM(CASE WHEN vat_applicable THEN actual_amount_etb * 0.15 ELSE 0 END), 0) AS total_vat
       FROM budget_items
       WHERE event_id = $1`,
      [eventId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not calculate budget summary.' });
  }
}