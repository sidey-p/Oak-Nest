// Rotate the admin password in the live database.
// Usage: node scripts/rotate-admin.mjs <newPassword>
//   (reads ADMIN_PASSWORD from .env if no argument given)
import 'dotenv/config';
import bcrypt from 'bcrypt';
import pg from 'pg';

const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD;
if (!newPassword || newPassword.length < 8) {
  console.error('Provide a password (min 8 chars): node scripts/rotate-admin.mjs <password>');
  process.exit(1);
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const run = async () => {
  const hash = await bcrypt.hash(newPassword, 10);
  const r = await pool.query(
    "UPDATE users SET password = $1 WHERE role = 'admin' RETURNING id, email",
    [hash],
  );
  console.log(`Admin password updated for: ${r.rows.map((u) => u.email).join(', ')}`);
  await pool.end();
};

run().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
