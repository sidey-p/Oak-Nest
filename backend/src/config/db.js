import pg from 'pg';

const { Pool } = pg;

// Supabase transaction pooler (port 6543) does not support prepared
// statements — avoid named prepared statements on pooler hosts.
const isPooler = String(process.env.DB_HOST || '').includes('pooler.supabase.com');
const isServerless = Boolean(process.env.VERCEL);

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  // Serverless: tiny pool per lambda instance + short idle lifetime so a
  // frozen lambda never hands out a connection the pooler already killed.
  max: isServerless ? 2 : 10,
  idleTimeoutMillis: isServerless ? 5000 : 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 3000,
});

// Retry once on failed/terminated pooler connections (a lambda that sat
// frozen can hold sockets the server has since closed).
export const query = async (text, params) => {
  try {
    return await pool.query({ text, values: params });
  } catch (err) {
    const stale = [
      'Connection terminated', 'terminating connection', 'server closed the connection',
      'connection timeout expired', 'ECONNRESET', 'EPIPE',
    ].some((s) => String(err.message).includes(s));
    if (!stale) throw err;
    return await pool.query({ text, values: params });
  }
};

export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* connection already gone */ }
    throw err;
  } finally {
    client.release();
  }
};

export default pool;
