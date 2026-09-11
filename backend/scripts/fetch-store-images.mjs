// One-time import: fetch real photos for existing products, categories and
// the hero banner from the internet and store them as base64 data URIs in
// the DB — the exact same storage admins get via the admin panel.
// Usage: cd backend && node scripts/fetch-store-images.mjs [--dry]
import 'dotenv/config';
import pg from 'pg';

const DRY = process.argv.includes('--dry');

// keyword per product slug (what to search for)
const PRODUCT_KEYWORDS = {
  'aurora-3-seater-fabric-sofa': 'sofa',
  'terracotta-l-shaped-sectional': 'sectional',
  'oakland-coffee-table': 'coffee,table',
  'clara-accent-armchair': 'armchair',
  'sahara-recliner-chair': 'recliner',
  'folding-storage-ottoman': 'ottoman',
  'arched-floor-lamp': 'lamp,interior',
  'lumiere-king-bed': 'bed',
  'kyoto-queen-bed-storage': 'bed,frame',
  'aria-3-door-wardrobe': 'wardrobe',
  'serene-dressing-table': 'dressing,table',
  'noir-bedside-table': 'nightstand',
  'minimal-work-desk-120': 'desk',
  'ergo-pro-mesh-office-chair': 'ergonomic,chair',
  'executive-leather-chair': 'chair,leather',
  'bharat-study-table': 'desk,study',
  'bharat-5-shelf-bookcase': 'bookcase',
  '3-drawer-file-cabinet': 'file,cabinet',
  'nordic-6-seater-dining-set': 'dining,table',
  'compact-kitchen-island': 'kitchen,island',
  'metro-bar-stool-set-2': 'bar,stool',
  'spice-rack-wall-organizer': 'spice,rack',
  'smart-led-ceiling-panel': 'ceiling,lamp',
  'halo-pendant-light': 'pendant,light',
  'dune-table-lamp': 'desk,lamp',
  'blackout-curtain-pair-7ft': 'curtains,blackout',
  'linen-sheer-curtains': 'sheer,curtain',
  'velvet-drape-panel': 'curtains,drapes',
  'jute-braided-rug-6x9': 'jute,rug',
  'persian-medallion-rug-8x10': 'persian,rug',
  'shaggy-area-rug-5x8': 'shaggy,rug',
  'space-saver-shoe-cabinet': 'shoe,cabinet',
  'wall-mounted-tv-console': 'tv,stand',
  'aureate-wall-mirror': 'mirror,wall',
  'jharokha-wall-art-panel': 'wall,art',
  'zen-ceramic-vase-trio': 'vase',
  'marble-effect-wall-clock': 'clock,wall',
};

const CATEGORY_KEYWORDS = {
  'living-room': 'living,room',
  bedroom: 'bedroom',
  office: 'workspace,desk',
  kitchen: 'kitchen,dining',
  lighting: 'lamp,interior',
  curtains: 'curtains',
  rugs: 'carpet',
  storage: 'shelf,storage',
  decor: 'vase,decor',
};

// HeronianLoremFlickr photo URL. lock param keeps the image stable per slug.
const urlFor = (kw, slug, w, h) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(kw)}/all?lock=${slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000}`;

const fetchImage = async (url) => {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'OakNest-ImageImport/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = String(res.headers.get('content-type') || '').split(';')[0].trim();
  if (!type.startsWith('image/')) throw new Error(`not an image: ${type}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > 4 * 1024 * 1024) throw new Error(`bad size ${buf.length}`);
  return `data:${type};base64,${buf.toString('base64')}`;
};

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  const client = await pool.connect();
  let okCount = 0;
  let failCount = 0;
  const failures = [];

  try {
    // ---- Hero banner ----
    console.log('Hero banner...');
    try {
      const hero = await fetchImage(urlFor('living,room,interior,furniture', 'oaknest-hero', 1600, 700));
      console.log('  fetched, bytes:', Math.round(hero.length * 3 / 4));
      if (!DRY) {
        await client.query(
          `INSERT INTO site_content (key, value) VALUES ('hero_image', $1)
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
          [hero],
        );
      }
      okCount++;
    } catch (e) {
      failCount++; failures.push(['hero', e.message]);
    }

    // ---- Categories ----
    const cats = await client.query('SELECT id, slug FROM categories');
    for (const cat of cats.rows) {
      const kw = CATEGORY_KEYWORDS[cat.slug] || cat.slug;
      try {
        const dataUri = await fetchImage(urlFor(kw, cat.slug, 800, 450));
        console.log(`category ${cat.slug}: fetched (${Math.round(dataUri.length * 3 / 4 / 1024)}KB)`);
        if (!DRY) await client.query('UPDATE categories SET image = $1 WHERE id = $2', [dataUri, cat.id]);
        okCount++;
      } catch (e) {
        failCount++; failures.push(['category:' + cat.slug, e.message]);
      }
      await sleep(200);
    }

    // ---- Products ----
    const prods = await client.query('SELECT id, slug FROM products');
    for (const p of prods.rows) {
      const kw = PRODUCT_KEYWORDS[p.slug] || p.slug.replace(/-/g, ',');
      try {
        const dataUri = await fetchImage(urlFor(kw, p.slug, 800, 600));
        console.log(`product ${p.slug}: fetched (${Math.round(dataUri.length * 3 / 4 / 1024)}KB)`);
        if (!DRY) {
          await client.query('BEGIN');
          await client.query('UPDATE products SET main_image = $1 WHERE id = $2', [dataUri, p.id]);
          await client.query('UPDATE product_images SET is_primary = FALSE WHERE product_id = $1', [p.id]);
          await client.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)',
            [p.id, dataUri],
          );
          await client.query('COMMIT');
        }
        okCount++;
      } catch (e) {
        failCount++; failures.push(['product:' + p.slug, e.message]);
        try { await client.query('ROLLBACK'); } catch { /* no txn */ }
      }
      await sleep(200);
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\nDONE: ${okCount} imported, ${failCount} failed${DRY ? ' (DRY RUN — nothing written)' : ''}`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach(([n, m]) => console.log('  -', n, '->', m));
  }
  process.exit(failCount > 0 && okCount === 0 ? 1 : 0);
};

run().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
