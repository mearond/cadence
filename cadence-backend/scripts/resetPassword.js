// Set a user's password directly in the database, for when email isn't available.
// Usage (from cadence-backend):  npm run reset-password -- someone@example.com NewPassword123
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error('Usage: npm run reset-password -- <email> <new password>');
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error('The new password must be at least 8 characters.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const hash = await bcrypt.hash(newPassword, 10);
  const result = await pool.query(
    'UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE LOWER(email) = LOWER($2) RETURNING name, role',
    [hash, email]
  );
  if (result.rows.length === 0) {
    console.error(`No account found for ${email}.`);
    process.exitCode = 1;
  } else {
    const { name, role } = result.rows[0];
    console.log(`Password changed for ${name} (${role}). They can sign in with the new password now.`);
  }
} catch (err) {
  console.error('Could not change the password:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
