// Seeds the Furnishing Essentials database via Supabase REST API.
// No explicit IDs used — avoids GENERATED ALWAYS identity restrictions.
const SUPABASE_URL = 'https://cdjigtcrbfarbfisjtgu.supabase.co';
const KEY = 'sb_publishable_qv6ste2xxLjdsa6Jg3k95Q_q3NIyv8Y';

const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

async function api(method, table, body, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: { ...HEADERS, ...(method === 'POST' ? { Prefer: 'return=representation' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} /${table}${query} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const clearAll = async () => {
  const order = [
    'cart_items', 'carts', 'wishlist', 'order_items', 'payments', 'shipments',
    'reviews', 'orders', 'addresses', 'product_images', 'products', 'categories',
    'feedback', 'custom_design_requests', 'coupons', 'users',
  ];
  for (const t of order) {
    try {
      await api('DELETE', t, null, '?id=gt.0');
      console.log(`cleared ${t}`);
    } catch (err) {
      console.log(`skip ${t}: ${err.message.slice(0, 80)}`);
    }
  }
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const dateOnly = (n) => daysAgo(n).slice(0, 10);

const ADMIN_HASH = '$2b$10$Gd3zwWQoA/rAS/lWJ6zj8.O/9jmQOEBQHU21AxyWfxwSqPPdHkL.O';       // admin123
const CUSTOMER_HASH = '$2b$10$vSg7iT9I4S2LKfQcMTVI2uYG/ubo6DXUQbSq4NG13CuW/ycbrBTM2';   // customer123
const USER_HASH = '$2b$10$qL4NVjMQc55d3ukn8lTODuQIiAiextSgl3FRO7FoTI0c41GjgaQdW';       // password123

const run = async () => {
  console.log('=== Clearing existing data ===');
  await clearAll();

  console.log('=== Users ===');
  const users = await api('POST', 'users', [
    { first_name: 'Admin', last_name: 'User', email: 'admin@furnishing.local', phone: '+91 90000 00001', password: ADMIN_HASH, role: 'admin', is_active: true },
    { first_name: 'Rahul', last_name: 'Sharma', email: 'customer@furnishing.local', phone: '+91 90000 00002', password: CUSTOMER_HASH, role: 'customer', is_active: true },
    { first_name: 'Priya', last_name: 'Patel', email: 'priya.patel@example.com', phone: '+91 90000 00003', password: USER_HASH, role: 'customer', is_active: true },
    { first_name: 'Aisha', last_name: 'Khan', email: 'aisha.khan@example.com', phone: '+91 90000 00004', password: USER_HASH, role: 'customer', is_active: true },
    { first_name: 'Vikram', last_name: 'Mehta', email: 'vikram.mehta@example.com', phone: '+91 90000 00005', password: USER_HASH, role: 'customer', is_active: true },
  ]);
  const U = Object.fromEntries(users.map((u) => [u.email, u.id]));
  console.log('users:', Object.keys(U).length);

  console.log('=== Categories ===');
  const categories = await api('POST', 'categories', [
    { name: 'Living Room', slug: 'living-room', description: 'Sofas, sectionals, coffee tables, TV units and accent furniture for your living space.', image: 'http://localhost:5000/uploads/categories/living-room.svg' },
    { name: 'Bedroom', slug: 'bedroom', description: 'Beds, wardrobes, dressers, nightstands and bedroom storage solutions.', image: 'http://localhost:5000/uploads/categories/bedroom.svg' },
    { name: 'Office', slug: 'office', description: 'Desks, office chairs, filing cabinets and workspace furniture.', image: 'http://localhost:5000/uploads/categories/office.svg' },
    { name: 'Kitchen', slug: 'kitchen', description: 'Dining tables, kitchen cabinets, islands and modular kitchen units.', image: 'http://localhost:5000/uploads/categories/kitchen.svg' },
    { name: 'Lighting', slug: 'lighting', description: 'Ceiling lights, floor lamps, table lamps and wall sconces.', image: 'http://localhost:5000/uploads/categories/lighting.svg' },
    { name: 'Curtains', slug: 'curtains', description: 'Curtains, drapes, sheers and blinds in premium fabrics.', image: 'http://localhost:5000/uploads/categories/curtains.svg' },
    { name: 'Rugs', slug: 'rugs', description: 'Hand-woven rugs, carpets and floor coverings.', image: 'http://localhost:5000/uploads/categories/rugs.svg' },
    { name: 'Storage', slug: 'storage', description: 'Shelving, bookcases, cabinets and multifunctional storage.', image: 'http://localhost:5000/uploads/categories/storage.svg' },
    { name: 'Decor', slug: 'decor', description: 'Mirrors, wall art, vases, clocks and decorative accents.', image: 'http://localhost:5000/uploads/categories/decor.svg' },
  ]);
  const C = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  console.log('=== Products ===');
  const IMG = (slug) => `http://localhost:5000/uploads/products/${slug}.svg`;
  const P = (catSlug, name, slug, description, brand, material, price, discount_price, stock) => ({
    category_id: C[catSlug], name, slug, description, brand, material, price, discount_price, stock, main_image: IMG(slug), status: 'active',
  });

  const productDefs = [
    P('living-room', 'Aurora 3-Seater Fabric Sofa', 'aurora-3-seater-fabric-sofa', 'A plush 3-seater sofa with solid sheesham wood frame and premium stain-resistant fabric upholstery. Includes two cushions.', 'Furnora', 'Fabric', 54999, 46999, 12),
    P('living-room', 'Terracotta L-Shaped Sectional', 'terracotta-l-shaped-sectional', 'Spacious L-shaped sectional with reversible chaise and deep seating, perfect for large families.', 'Furnora', 'Fabric', 82999, null, 6),
    P('living-room', 'Oakland Coffee Table', 'oakland-coffee-table', 'Mid-century coffee table in solid oak with lower storage shelf and rounded edges.', 'WoodCraft', 'Wood', 14999, 12999, 18),
    P('living-room', 'Clara Accent Armchair', 'clara-accent-armchair', 'Compact accent chair with tapered wooden legs and soft velvet upholstery.', 'Furnora', 'Velvet', 18999, null, 10),
    P('living-room', 'Wall-Mounted TV Console', 'wall-mounted-tv-console', 'Floating TV console with two drawers and cable management cutouts. Fits up to 65-inch TVs.', 'UrbanNest', 'Engineered Wood', 11999, 9999, 22),
    P('living-room', 'Sahara Recliner Chair', 'sahara-recliner-chair', 'Single-seater manual recliner with padded headrest and breathable leatherette.', 'ComfortPlus', 'Leather', 27999, 23999, 8),
    P('bedroom', 'Kyoto Queen Bed with Storage', 'kyoto-queen-bed-storage', 'Queen-size bed in warm walnut finish with two hydraulic storage boxes and tufted headboard.', 'WoodCraft', 'Wood', 49999, 42999, 9),
    P('bedroom', 'Lumière King Bed', 'lumiere-king-bed', 'King-size platform bed with flannel-lined headboard and solid teak frame.', 'WoodCraft', 'Wood', 64999, null, 5),
    P('bedroom', 'Aria 3-Door Wardrobe', 'aria-3-door-wardrobe', '3-door wardrobe with full-length mirror, internal drawers and hanging space.', 'UrbanNest', 'Engineered Wood', 38999, 34999, 11),
    P('bedroom', 'Noir Bedside Table', 'noir-bedside-table', 'Matte black nightstand with soft-close drawer and open niche.', 'UrbanNest', 'Engineered Wood', 6499, 5299, 30),
    P('bedroom', 'Serene Dressing Table', 'serene-dressing-table', 'Dressing table with oval mirror, five drawers and cushioned stool.', 'Furnora', 'Wood', 17999, null, 14),
    P('office', 'Ergo Pro Mesh Office Chair', 'ergo-pro-mesh-office-chair', 'Ergonomic chair with adjustable lumbar support, 4D armrests and breathable mesh back.', 'ComfortPlus', 'Mesh', 15999, 12999, 25),
    P('office', 'Executive Leather Chair', 'executive-leather-chair', 'High-back executive chair in bonded leather with tilt lock and chrome base.', 'ComfortPlus', 'Leather', 21999, null, 15),
    P('office', 'Minimal Work Desk 120cm', 'minimal-work-desk-120', '120cm work desk with cable tray, matte laminate top and steel legs.', 'UrbanNest', 'Engineered Wood', 9999, 8499, 28),
    P('office', 'Bharat Study Table', 'bharat-study-table', 'Compact study table with bookshelf hutch and pen drawer, ideal for students.', 'WoodCraft', 'Wood', 7499, null, 20),
    P('office', '3-Drawer File Cabinet', '3-drawer-file-cabinet', 'Metal file cabinet with lockable drawers and anti-tilt mechanism.', 'Officeline', 'Steel', 8999, 7499, 17),
    P('kitchen', 'Nordic 6-Seater Dining Set', 'nordic-6-seater-dining-set', '6-seater dining set in light oak with cushioned chairs and 180cm table.', 'WoodCraft', 'Wood', 58999, 49999, 7),
    P('kitchen', 'Compact Kitchen Island', 'compact-kitchen-island', 'Movable kitchen island with granite-look top, towel rack and two shelves.', 'Officeline', 'Engineered Wood', 18999, null, 12),
    P('kitchen', 'Metro Bar Stool Set of 2', 'metro-bar-stool-set-2', 'Counter-height bar stools with footrest and faux-leather seats.', 'UrbanNest', 'Leather', 9999, 8299, 24),
    P('kitchen', 'Spice Rack Wall Organizer', 'spice-rack-wall-organizer', '3-tier wall-mounted spice rack with bamboo shelves.', 'MetroLiving', 'Bamboo', 2799, 2299, 40),
    P('lighting', 'Halo Pendant Light', 'halo-pendant-light', 'Brushed-metal pendant with dimmable warm LED, ideal over dining tables.', 'Lumos', 'Metal', 5499, 4499, 35),
    P('lighting', 'Arched Floor Lamp', 'arched-floor-lamp', 'Statement arc floor lamp with marble base and linen shade.', 'Lumos', 'Metal', 8999, null, 16),
    P('lighting', 'Dune Table Lamp', 'dune-table-lamp', 'Ceramic-based table lamp with woven cotton shade.', 'Lumos', 'Ceramic', 3499, 2999, 42),
    P('lighting', 'Smart LED Ceiling Panel', 'smart-led-ceiling-panel', 'App and voice-controlled ceiling panel with 16M colors and scheduling.', 'Lumos', 'Aluminium', 6999, null, 19),
    P('curtains', 'Blackout Curtain Pair 7ft', 'blackout-curtain-pair-7ft', 'Thermal blackout curtains blocking 95% light, set of 2, 5ft width each.', 'Velvet & Vine', 'Polyester', 3999, 3199, 50),
    P('curtains', 'Linen Sheer Curtains', 'linen-sheer-curtains', 'Breezy sheer linen-look curtains for soft filtered daylight.', 'Velvet & Vine', 'Linen Blend', 2899, null, 38),
    P('curtains', 'Velvet Drape Panel', 'velvet-drape-panel', 'Luxurious velvet drapes with weighted hem, 9ft length.', 'Velvet & Vine', 'Velvet', 5499, 4299, 20),
    P('rugs', 'Persian Medallion Rug 8x10', 'persian-medallion-rug-8x10', 'Machine-woven Persian-style rug with medallion motif and anti-skid backing.', 'Carvan Rugs', 'Polypropylene', 15999, 12999, 9),
    P('rugs', 'Jute Braided Rug 6x9', 'jute-braided-rug-6x9', 'Hand-braided natural jute rug, reversible and eco-friendly.', 'Carvan Rugs', 'Jute', 7999, null, 15),
    P('rugs', 'Shaggy Area Rug 5x8', 'shaggy-area-rug-5x8', 'Ultra-soft shag rug with high pile for cozy living rooms.', 'Carvan Rugs', 'Acrylic', 6499, 5299, 21),
    P('storage', 'Bharat 5-Shelf Bookcase', 'bharat-5-shelf-bookcase', 'Open bookcase with five adjustable shelves in honey finish.', 'WoodCraft', 'Wood', 8999, 7499, 18),
    P('storage', 'Folding Storage Ottoman', 'folding-storage-ottoman', 'Velvet storage ottoman that folds flat and holds up to 40L.', 'MetroLiving', 'Velvet', 2999, 2499, 33),
    P('storage', 'Space-Saver Shoe Cabinet', 'space-saver-shoe-cabinet', 'Tall shoe cabinet with tilt-out drawers for 12 pairs.', 'UrbanNest', 'Engineered Wood', 6499, null, 26),
    P('decor', 'Aureate Wall Mirror', 'aureate-wall-mirror', 'Sunburst wall mirror with antique gold metal rays, 24-inch.', 'MetroLiving', 'Metal', 5999, 4999, 23),
    P('decor', 'Zen Ceramic Vase Trio', 'zen-ceramic-vase-trio', 'Set of three matte-glaze ceramic vases in earthy tones.', 'MetroLiving', 'Ceramic', 3499, null, 45),
    P('decor', 'Marble-Effect Wall Clock', 'marble-effect-wall-clock', '12-inch silent wall clock with marble-pattern dial.', 'Lumos', 'Metal', 2499, 1999, 52),
    P('decor', 'Jharokha Wall Art Panel', 'jharokha-wall-art-panel', 'Hand-carved wooden wall panel inspired by Rajasthani jharokhas.', 'WoodCraft', 'Wood', 8999, 7299, 10),
  ];

  const products = [];
  for (let i = 0; i < productDefs.length; i += 20) {
    const chunk = productDefs.slice(i, i + 20);
    const inserted = await api('POST', 'products', chunk);
    products.push(...inserted);
  }
  const PR = Object.fromEntries(products.map((p) => [p.slug, p.id]));
  console.log('products:', products.length);

  console.log('=== Product images ===');
  const images = products.map((p) => ({ product_id: p.id, image_url: p.main_image, is_primary: true }));
  for (let i = 0; i < images.length; i += 20) await api('POST', 'product_images', images.slice(i, i + 20));
  console.log('images:', images.length);

  console.log('=== Addresses ===');
  const addresses = await api('POST', 'addresses', [
    { user_id: U['customer@furnishing.local'], full_name: 'Rahul Sharma', phone: '+91 90000 00002', address_line1: '12, Green Park Colony', address_line2: 'Near Community Hall', city: 'New Delhi', state: 'Delhi', postal_code: '110016', country: 'India', is_default: true },
    { user_id: U['customer@furnishing.local'], full_name: 'Rahul Sharma', phone: '+91 90000 00002', address_line1: 'C-42, Sector 18', address_line2: null, city: 'Noida', state: 'Uttar Pradesh', postal_code: '201301', country: 'India', is_default: false },
    { user_id: U['priya.patel@example.com'], full_name: 'Priya Patel', phone: '+91 90000 00003', address_line1: '7, Sunrise Apartments', address_line2: 'B-wing, 3rd floor', city: 'Mumbai', state: 'Maharashtra', postal_code: '400058', country: 'India', is_default: true },
    { user_id: U['aisha.khan@example.com'], full_name: 'Aisha Khan', phone: '+91 90000 00004', address_line1: '301, Lake View Residency', address_line2: 'Sarjapur Road', city: 'Bengaluru', state: 'Karnataka', postal_code: '560035', country: 'India', is_default: true },
    { user_id: U['vikram.mehta@example.com'], full_name: 'Vikram Mehta', phone: '+91 90000 00005', address_line1: 'B-9, Civil Lines', address_line2: null, city: 'Jaipur', state: 'Rajasthan', postal_code: '302006', country: 'India', is_default: true },
  ]);
  const A = {};
  addresses.forEach((a) => {
    const key = `${a.user_id}-${a.city}`;
    A[key] = a.id;
  });
  const rahulAddr = addresses.find((a) => a.city === 'New Delhi');
  const rahulNoida = addresses.find((a) => a.city === 'Noida');
  const priyaAddr = addresses.find((a) => a.city === 'Mumbai');
  const vikramAddr = addresses.find((a) => a.city === 'Jaipur');
  console.log('addresses:', addresses.length);

  console.log('=== Carts ===');
  const cartUsers = ['customer@furnishing.local', 'priya.patel@example.com', 'aisha.khan@example.com', 'vikram.mehta@example.com'];
  const carts = await api('POST', 'carts', cartUsers.map((e) => ({ user_id: U[e] })));
  console.log('carts:', carts.length);

  console.log('=== Wishlist ===');
  await api('POST', 'wishlist', [
    { user_id: U['customer@furnishing.local'], product_id: PR['terracotta-l-shaped-sectional'] },
    { user_id: U['customer@furnishing.local'], product_id: PR['minimal-work-desk-120'] },
    { user_id: U['customer@furnishing.local'], product_id: PR['blackout-curtain-pair-7ft'] },
    { user_id: U['customer@furnishing.local'], product_id: PR['kyoto-queen-bed-storage'] },
  ]);
  console.log('wishlist: 4');

  console.log('=== Orders + items + payments + shipments ===');
  const orderDefs = [
    {
      user: 'customer@furnishing.local', addr: rahulAddr, number: 'ORD-2025-00001', days: 21,
      subtotal: 30991, discount: 0, shipping: 0, tax: 3894.85, total: 34885.85, coupon: null,
      status: 'delivered', pay_status: 'paid', pay_method: 'cash_on_delivery', txn: 'COD-TXN-00001',
      shipment: { status: 'delivered', location: 'Delivered - New Delhi', courier: 'BlueDart', est_days: 17 },
      items: [
        ['oakland-coffee-table', 'Oakland Coffee Table', 1, 12999],
        ['dune-table-lamp', 'Dune Table Lamp', 2, 2999],
        ['marble-effect-wall-clock', 'Marble-Effect Wall Clock', 6, 1999],
      ],
    },
    {
      user: 'customer@furnishing.local', addr: rahulNoida, number: 'ORD-2025-00002', days: 6,
      subtotal: 46999, discount: 4699.90, shipping: 499, tax: 6424.94, total: 50922.04, coupon: 'WELCOME10',
      status: 'shipped', pay_status: 'paid', pay_method: 'local_test_payment', txn: 'LTP-TXN-00002',
      shipment: { status: 'shipped', location: 'In transit - Nagpur Hub', courier: 'BlueDart', est_days: -1 },
      items: [['aurora-3-seater-fabric-sofa', 'Aurora 3-Seater Fabric Sofa', 1, 46999]],
    },
    {
      user: 'customer@furnishing.local', addr: rahulAddr, number: 'ORD-2025-00003', days: 2,
      subtotal: 7499, discount: 0, shipping: 99, tax: 1134.60, total: 8732.60, coupon: null,
      status: 'confirmed', pay_status: 'pending', pay_method: 'cash_on_delivery', txn: 'COD-TXN-00003',
      shipment: { status: 'confirmed', location: 'Order confirmed at warehouse', courier: 'Delhivery', est_days: -4 },
      items: [['bharat-5-shelf-bookcase', 'Bharat 5-Shelf Bookcase', 1, 7499]],
    },
    {
      user: 'priya.patel@example.com', addr: priyaAddr, number: 'ORD-2025-00004', days: 35,
      subtotal: 46999, discount: 0, shipping: 0, tax: 5919.87, total: 52918.87, coupon: null,
      status: 'delivered', pay_status: 'paid', pay_method: 'local_test_payment', txn: 'LTP-TXN-00004',
      shipment: { status: 'delivered', location: 'Delivered - Mumbai', courier: 'Delhivery', est_days: 30 },
      items: [['aurora-3-seater-fabric-sofa', 'Aurora 3-Seater Fabric Sofa', 1, 46999]],
    },
    {
      user: 'vikram.mehta@example.com', addr: vikramAddr, number: 'ORD-2025-00005', days: 12,
      subtotal: 1999, discount: 0, shipping: 99, tax: 302.65, total: 2400.65, coupon: null,
      status: 'cancelled', pay_status: 'refunded', pay_method: 'local_test_payment', txn: 'LTP-TXN-00005',
      shipment: null,
      items: [['marble-effect-wall-clock', 'Marble-Effect Wall Clock', 1, 1999]],
    },
  ];

  for (const o of orderDefs) {
    const [order] = await api('POST', 'orders', [{
      user_id: U[o.user], address_id: o.addr.id, order_number: o.number,
      subtotal: o.subtotal, discount: o.discount, shipping_cost: o.shipping,
      tax: o.tax, total: o.total, coupon_code: o.coupon, status: o.status, payment_status: o.pay_status,
      created_at: daysAgo(o.days),
    }]);
    await api('POST', 'order_items', o.items.map(([slug, name, qty, price]) => ({
      order_id: order.id, product_id: PR[slug], product_name: name,
      quantity: qty, price, total: Math.round(qty * price * 100) / 100, created_at: daysAgo(o.days),
    })));
    await api('POST', 'payments', [{
      order_id: order.id, payment_method: o.pay_method, transaction_id: o.txn,
      amount: o.total, status: o.pay_status, created_at: daysAgo(o.days),
    }]);
    if (o.shipment) {
      await api('POST', 'shipments', [{
        order_id: order.id, tracking_number: `TRK${order.id}${Date.now().toString().slice(-6)}`,
        courier_name: o.shipment.courier, status: o.shipment.status,
        current_location: o.shipment.location,
        estimated_delivery: o.shipment.est_days > 0 ? dateOnly(-o.shipment.est_days) : dateOnly(o.shipment.est_days),
        created_at: daysAgo(o.days),
      }]);
    }
    console.log(`order ${o.number} ok`);
  }

  console.log('=== Reviews ===');
  await api('POST', 'reviews', [
    { user_id: U['customer@furnishing.local'], product_id: PR['aurora-3-seater-fabric-sofa'], rating: 5, comment: 'The sofa exceeded expectations. Fabric feels premium and assembly was quick.', status: 'approved', created_at: daysAgo(18) },
    { user_id: U['customer@furnishing.local'], product_id: PR['oakland-coffee-table'], rating: 4, comment: 'Sturdy table, lovely oak grain. Wish the shelf was slightly deeper.', status: 'approved', created_at: daysAgo(16) },
    { user_id: U['customer@furnishing.local'], product_id: PR['dune-table-lamp'], rating: 5, comment: 'Warm light, perfect for the bedside. Great value.', status: 'approved', created_at: daysAgo(15) },
    { user_id: U['customer@furnishing.local'], product_id: PR['marble-effect-wall-clock'], rating: 4, comment: 'Silent clock and looks far more expensive than it is.', status: 'approved', created_at: daysAgo(14) },
    { user_id: U['priya.patel@example.com'], product_id: PR['aurora-3-seater-fabric-sofa'], rating: 4, comment: 'Very comfortable, though delivery took a few extra days.', status: 'approved', created_at: daysAgo(28) },
    { user_id: U['aisha.khan@example.com'], product_id: PR['terracotta-l-shaped-sectional'], rating: 5, comment: 'The sectional transformed our living room. Deep seating is wonderful.', status: 'approved', created_at: daysAgo(25) },
    { user_id: U['vikram.mehta@example.com'], product_id: PR['marble-effect-wall-clock'], rating: 5, comment: 'Bought a second one for the office. Keeps perfect time.', status: 'approved', created_at: daysAgo(9) },
    { user_id: U['priya.patel@example.com'], product_id: PR['dune-table-lamp'], rating: 5, comment: 'Elegant little lamp. The shade diffuses light beautifully.', status: 'approved', created_at: daysAgo(10) },
  ]);
  console.log('reviews: 8');

  console.log('=== Coupons ===');
  await api('POST', 'coupons', [
    { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, minimum_order: 1000, expiry_date: dateOnly(-90), status: 'active' },
    { code: 'FURNISH20', discount_type: 'percentage', discount_value: 20, minimum_order: 20000, expiry_date: dateOnly(-60), status: 'active' },
    { code: 'FLAT500', discount_type: 'fixed', discount_value: 500, minimum_order: 5000, expiry_date: dateOnly(-45), status: 'active' },
    { code: 'EXPIRED5', discount_type: 'percentage', discount_value: 5, minimum_order: 100, expiry_date: dateOnly(10), status: 'active' },
  ]);
  console.log('coupons: 4');

  console.log('=== Feedback ===');
  await api('POST', 'feedback', [
    { user_id: U['customer@furnishing.local'], subject: 'Delivery experience', message: 'The delivery team was courteous and assembled the sofa quickly. Great service!', status: 'resolved' },
    { user_id: U['priya.patel@example.com'], subject: 'Website suggestion', message: 'Would love a filter for hand-crafted only products on the listing page.', status: 'read' },
    { user_id: U['aisha.khan@example.com'], subject: 'Product quality', message: 'The recliner stitching seems a bit loose after a month of use. Requesting a check.', status: 'new' },
  ]);
  console.log('feedback: 3');

  console.log('=== Custom design requests ===');
  await api('POST', 'custom_design_requests', [
    { user_id: U['customer@furnishing.local'], name: 'Rahul Sharma', email: 'customer@furnishing.local', phone: '+91 90000 00002', room_type: 'living-room', furniture_type: 'sofa', dimensions: '220cm x 95cm x 85cm', material: 'Fabric', preferred_color: 'Charcoal Grey', budget: 60000, description: 'L-shaped sofa with chaise on the right and stain-resistant fabric for a family with kids.', reference_image: null, status: 'quotation_sent', admin_notes: 'Shared a quotation of INR 58,500 including fabric upgrade. Awaiting customer confirmation.' },
    { user_id: U['priya.patel@example.com'], name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 90000 00003', room_type: 'bedroom', furniture_type: 'wardrobe', dimensions: '300cm x 240cm', material: 'Engineered Wood', preferred_color: 'Matte White', budget: 120000, description: 'Full-wall wardrobe with loft, 6 drawers, dresser module and soft-close hinges.', reference_image: null, status: 'under_review', admin_notes: null },
    { user_id: U['vikram.mehta@example.com'], name: 'Vikram Mehta', email: 'vikram.mehta@example.com', phone: '+91 90000 00005', room_type: 'office', furniture_type: 'desk', dimensions: '180cm x 80cm', material: 'Solid Wood', preferred_color: 'Walnut', budget: 45000, description: 'Executive desk with wire grommets, lockable drawer and matching credenza.', reference_image: null, status: 'new', admin_notes: null },
  ]);
  console.log('custom requests: 3');

  console.log('\n=== SEED COMPLETE ===');
};

run().catch((err) => { console.error('SEED FAILED:', err.message); process.exit(1); });
