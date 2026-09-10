// Finds the correct Supabase pooler region for this project.
import 'dotenv/config';
import pg from 'pg';

const REGIONS = [
  'aws-0-ap-south-1', 'aws-1-ap-south-1',
  'aws-0-ap-southeast-1', 'aws-1-ap-southeast-1',
  'aws-0-ap-northeast-1', 'aws-1-ap-northeast-1',
  'aws-0-us-east-1', 'aws-1-us-east-1',
  'aws-0-us-west-1', 'aws-1-us-west-1',
  'aws-0-eu-west-1', 'aws-1-eu-west-1',
  'aws-0-eu-central-1', 'aws-1-eu-central-1',
];

const tryConnect = async (host) => {
  const pool = new pg.Pool({
    host,
    port: 6543,
    user: 'postgres.cdjigtcrbfarbfisjtgu',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    max: 1,
  });
  try {
    const c = await pool.connect();
    const r = await c.query('SELECT 1 AS ok');
    c.release();
    await pool.end();
    return r.rows[0].ok === 1;
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = String(err.message);
    if (msg.includes('not found')) return 'tenant-not-found';
    return `fail: ${msg.slice(0, 60)}`;
  }
};

for (const region of REGIONS) {
  const host = `${region}.pooler.supabase.com`;
  const result = await tryConnect(host);
  const tag = result === true ? '✓ WORKS' : typeof result === 'string' ? result : '?';
  console.log(`${host.padEnd(45)} ${tag}`);
  if (result === true) {
    console.log(`\nFOUND IT! Set DB_HOST=${host}`);
    process.exit(0);
  }
}
console.log('\nNo pooler region matched. Check the Connection Pooler URI in your Supabase dashboard.');
