import { pool } from '../config/db.js';

export async function getVendorCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM vendor_categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch vendor categories.' });
  }
}

export async function getVendors(req, res) {
  try {
    const result = await pool.query(
      `SELECT v.*, vc.name_en AS category_name_en, vc.name_am AS category_name_am
       FROM vendors v
       LEFT JOIN vendor_categories vc ON v.category_id = vc.id
       WHERE v.org_id = $1
       ORDER BY v.name`,
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch vendors.' });
  }
}

export async function createVendor(req, res) {
  const { name, categoryId, phone, email, tinNumber, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Vendor name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vendors (org_id, category_id, name, phone, email, tin_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.orgId, categoryId || null, name, phone || null, email || null, tinNumber || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create vendor.' });
  }
}

export async function updateVendor(req, res) {
  const { id } = req.params;
  const { name, categoryId, phone, email, tinNumber, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vendors SET
        name = COALESCE($1, name),
        category_id = COALESCE($2, category_id),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        tin_number = COALESCE($5, tin_number),
        notes = COALESCE($6, notes)
       WHERE id = $7 AND org_id = $8
       RETURNING *`,
      [name, categoryId, phone, email, tinNumber, notes, id, req.user.orgId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update vendor.' });
  }
}

export async function deleteVendor(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM vendors WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }
    res.json({ message: 'Vendor deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete vendor.' });
  }
}

export async function bookVendorForEvent(req, res) {
  const { eventId } = req.params;
  const { vendorId, contractAmountEtb, paymentStatus, paymentMethod, notes } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'vendorId is required.' });
  }

  try {
    const eventCheck = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND org_id = $2',
      [eventId, req.user.orgId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const result = await pool.query(
      `INSERT INTO event_vendors (event_id, vendor_id, contract_amount_etb, payment_status, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [eventId, vendorId, contractAmountEtb || null, paymentStatus || 'unpaid', paymentMethod || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not book vendor for event.' });
  }
}

export async function getEventVendors(req, res) {
  const { eventId } = req.params;
  try {
    const eventCheck = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND org_id = $2',
      [eventId, req.user.orgId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const result = await pool.query(
      `SELECT ev.*, v.name AS vendor_name, v.phone, v.email
       FROM event_vendors ev
       JOIN vendors v ON ev.vendor_id = v.id
       WHERE ev.event_id = $1`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch event vendors.' });
  }
}