import pg from 'pg';

const { Pool } = pg;

// Supabase transaction pooler (port 6543) does not support prepared
// statements — disable them automatically when using a pooler host.
const isPooler = String(process.env.DB_HOST || '').includes('pooler.supabase.com');

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const query = (text, params) =>
  pool.query({ text, values: params, ...(isPooler ? { name: undefined } : {}) });

export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default pool;
