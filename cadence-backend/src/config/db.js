import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// Postgres DATE columns (OID 1082) have no time or timezone component, but pg's
// default parser converts them to a JS Date at local midnight. Serializing that
// Date later (res.json -> toISOString) shifts it to UTC, which rolls the date
// back a day whenever the server's timezone is ahead of UTC. Returning the raw
// "YYYY-MM-DD" string instead avoids that conversion entirely.
types.setTypeParser(1082, (val) => val);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('Connected to Postgres');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});