import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, '..', 'uploads', 'products');
const categoriesDir = path.join(__dirname, '..', 'uploads', 'categories');

const palettes = [
  ['#2d2a26', '#b08968'], ['#3e4c59', '#9db4c0'], ['#5f4b32', '#d4a373'],
  ['#40513b', '#a3b18a'], ['#4a4e69', '#c9ada7'], ['#6b4226', '#dab88b'],
  ['#33475b', '#e8f1f2'], ['#54452d', '#eadbc8'], ['#3d2c3f', '#c38eae'],
  ['#2f3e36', '#c7d5c0'], ['#534340', '#e3c6b0'], ['#263143', '#98b4d4'],
];

const products = [
  'aurora-3-seater-fabric-sofa', 'terracotta-l-shaped-sectional', 'oakland-coffee-table',
  'clara-accent-armchair', 'wall-mounted-tv-console', 'sahara-recliner-chair',
  'kyoto-queen-bed-storage', 'lumiere-king-bed', 'aria-3-door-wardrobe',
  'noir-bedside-table', 'serene-dressing-table', 'ergo-pro-mesh-office-chair',
  'executive-leather-chair', 'minimal-work-desk-120', 'bharat-study-table',
  '3-drawer-file-cabinet', 'nordic-6-seater-dining-set', 'compact-kitchen-island',
  'metro-bar-stool-set-2', 'spice-rack-wall-organizer', 'halo-pendant-light',
  'arched-floor-lamp', 'dune-table-lamp', 'smart-led-ceiling-panel',
  'blackout-curtain-pair-7ft', 'linen-sheer-curtains', 'velvet-drape-panel',
  'persian-medallion-rug-8x10', 'jute-braided-rug-6x9', 'shaggy-area-rug-5x8',
  'bharat-5-shelf-bookcase', 'folding-storage-ottoman', 'space-saver-shoe-cabinet',
  'aureate-wall-mirror', 'zen-ceramic-vase-trio', 'marble-effect-wall-clock',
  'jharokha-wall-art-panel',
];

const categories = [
  'living-room', 'bedroom', 'office', 'kitchen', 'lighting',
  'curtains', 'rugs', 'storage', 'decor',
];

const titleize = (slug) =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const makeSvg = (title, subtitle, [dark, accent]) => {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${dark}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect x="30" y="30" width="740" height="540" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <circle cx="400" cy="255" r="120" fill="rgba(255,255,255,0.14)"/>
  <circle cx="400" cy="255" r="85" fill="rgba(255,255,255,0.18)"/>
  <circle cx="400" cy="255" r="50" fill="rgba(255,255,255,0.24)"/>
  <text x="400" y="445" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#ffffff" font-weight="600">${safeTitle}</text>
  <text x="400" y="495" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.75)" letter-spacing="4">${subtitle}</text>
  <text x="400" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.5)" letter-spacing="2">FURNISHING ESSENTIALS</text>
</svg>
`;
};

fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(categoriesDir, { recursive: true });

let count = 0;
products.forEach((slug, i) => {
  const svg = makeSvg(titleize(slug).replace(/ \d+$/, ''), 'PREMIUM FURNITURE', palettes[i % palettes.length]);
  fs.writeFileSync(path.join(productsDir, `${slug}.svg`), svg);
  count++;
});
categories.forEach((slug, i) => {
  const svg = makeSvg(titleize(slug), 'COLLECTION', palettes[(i + 3) % palettes.length]);
  fs.writeFileSync(path.join(categoriesDir, `${slug}.svg`), svg);
  count++;
});

console.log(`Generated ${count} placeholder SVG images.`);
