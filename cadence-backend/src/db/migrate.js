import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, 'migrations');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const applied = await client.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(applied.rows.map((r) => r.filename));

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const pending = files.filter((f) => !appliedSet.has(f));

    if (pending.length === 0) {
      console.log('No pending migrations. Database is up to date.');
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying ${file}...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  done: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  failed: ${file} —`, err.message);
        throw err;
      }
    }

    console.log(`Applied ${pending.length} migration(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration run failed:', err.message);
  process.exit(1);
});