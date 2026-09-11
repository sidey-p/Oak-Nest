// One-time: convert absolute localhost image URLs to relative paths.
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const run = async () => {
  const c = await pool.connect();
  try {
    const r1 = await c.query("UPDATE products SET main_image = REPLACE(main_image, 'http://localhost:5000', '') WHERE main_image LIKE 'http://localhost:5000%'");
    const r2 = await c.query("UPDATE product_images SET image_url = REPLACE(image_url, 'http://localhost:5000', '') WHERE image_url LIKE 'http://localhost:5000%'");
    const r3 = await c.query("UPDATE categories SET image = REPLACE(image, 'http://localhost:5000', '') WHERE image LIKE 'http://localhost:5000%'");
    console.log(`products: ${r1.rowCount}, product_images: ${r2.rowCount}, categories: ${r3.rowCount} rows updated`);
  } finally {
    c.release();
    await pool.end();
  }
};

run().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
