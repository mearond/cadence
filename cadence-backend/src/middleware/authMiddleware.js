import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { can } from '../lib/permissions.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Read the role from the database, not the token, so a role change or a
  // removed account takes effect immediately instead of after the token expires.
  try {
    const result = await pool.query('SELECT id, org_id, role FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Account no longer exists.' });
    }
    const user = result.rows[0];
    req.user = { userId: user.id, orgId: user.org_id, role: user.role };
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not verify your session.' });
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!can(req.user?.role, permission)) {
      return res.status(403).json({ error: 'You do not have permission to do this.' });
    }
    next();
  };
}
