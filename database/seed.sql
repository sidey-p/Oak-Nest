-- ============================================================
-- FURNISHING ESSENTIALS — SEED DATA (run AFTER schema.sql)
-- ============================================================

-- Clear existing data (order matters due to FKs)
TRUNCATE TABLE cart_items, carts, wishlist, order_items, payments, shipments,
  reviews, orders, addresses, product_images, products, categories,
  feedback, custom_design_requests, coupons, users RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS (passwords: admin123 / customer123 / password123)
-- ============================================================
INSERT INTO users (first_name, last_name, email, phone, password, role, is_active) VALUES
('Admin', 'User', 'admin@furnishing.local', '+91 90000 00001', '$2b$10$Gd3zwWQoA/rAS/lWJ6zj8.O/9jmQOEBQHU21AxyWfxwSqPPdHkL.O', 'admin', TRUE),
('Rahul', 'Sharma', 'customer@furnishing.local', '+91 90000 00002', '$2b$10$vSg7iT9I4S2LKfQcMTVI2uYG/ubo6DXUQbSq4NG13CuW/ycbrBTM2', 'customer', TRUE),
('Priya', 'Patel', 'priya.patel@example.com', '+91 90000 00003', '$2b$10$qL4NVjMQc55d3ukn8lTODuQIiAiextSgl3FRO7FoTI0c41GjgaQdW', 'customer', TRUE),
('Aisha', 'Khan', 'aisha.khan@example.com', '+91 90000 00004', '$2b$10$qL4NVjMQc55d3ukn8lTODuQIiAiextSgl3FRO7FoTI0c41GjgaQdW', 'customer', TRUE),
('Vikram', 'Mehta', 'vikram.mehta@example.com', '+91 90000 00005', '$2b$10$qL4NVjMQc55d3ukn8lTODuQIiAiextSgl3FRO7FoTI0c41GjgaQdW', 'customer', TRUE);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, description, image) VALUES
('Living Room', 'living-room', 'Sofas, sectionals, coffee tables, TV units and accent furniture for your living space.', 'http://localhost:5000/uploads/categories/living-room.svg'),
('Bedroom', 'bedroom', 'Beds, wardrobes, dressers, nightstands and bedroom storage solutions.', 'http://localhost:5000/uploads/categories/bedroom.svg'),
('Office', 'office', 'Desks, office chairs, filing cabinets and workspace furniture.', 'http://localhost:5000/uploads/categories/office.svg'),
('Kitchen', 'kitchen', 'Dining tables, kitchen cabinets, islands and modular kitchen units.', 'http://localhost:5000/uploads/categories/kitchen.svg'),
('Lighting', 'lighting', 'Ceiling lights, floor lamps, table lamps and wall sconces.', 'http://localhost:5000/uploads/categories/lighting.svg'),
('Curtains', 'curtains', 'Curtains, drapes, sheers and blinds in premium fabrics.', 'http://localhost:5000/uploads/categories/curtains.svg'),
('Rugs', 'rugs', 'Hand-woven rugs, carpets and floor coverings.', 'http://localhost:5000/uploads/categories/rugs.svg'),
('Storage', 'storage', 'Shelving, bookcases, cabinets and multifunctional storage.', 'http://localhost:5000/uploads/categories/storage.svg'),
('Decor', 'decor', 'Mirrors, wall art, vases, clocks and decorative accents.', 'http://localhost:5000/uploads/categories/decor.svg');

-- ============================================================
-- PRODUCTS (36 products, images served locally from /uploads)
-- ============================================================
-- Living Room (category 1)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(1, 'Aurora 3-Seater Fabric Sofa', 'aurora-3-seater-fabric-sofa', 'A plush 3-seater sofa with solid sheesham wood frame and premium stain-resistant fabric upholstery. Includes two cushions.', 'Furnora', 'Fabric', 54999.00, 46999.00, 12, 'http://localhost:5000/uploads/products/aurora-3-seater-fabric-sofa.svg', 'active'),
(1, 'Terracotta L-Shaped Sectional', 'terracotta-l-shaped-sectional', 'Spacious L-shaped sectional with reversible chaise and deep seating, perfect for large families.', 'Furnora', 'Fabric', 82999.00, NULL, 6, 'http://localhost:5000/uploads/products/terracotta-l-shaped-sectional.svg', 'active'),
(1, 'Oakland Coffee Table', 'oakland-coffee-table', 'Mid-century coffee table in solid oak with lower storage shelf and rounded edges.', 'WoodCraft', 'Wood', 14999.00, 12999.00, 18, 'http://localhost:5000/uploads/products/oakland-coffee-table.svg', 'active'),
(1, 'Clara Accent Armchair', 'clara-accent-armchair', 'Compact accent chair with tapered wooden legs and soft velvet upholstery.', 'Furnora', 'Velvet', 18999.00, NULL, 10, 'http://localhost:5000/uploads/products/clara-accent-armchair.svg', 'active'),
(1, 'Wall-Mounted TV Console', 'wall-mounted-tv-console', 'Floating TV console with two drawers and cable management cutouts. Fits up to 65-inch TVs.', 'UrbanNest', 'Engineered Wood', 11999.00, 9999.00, 22, 'http://localhost:5000/uploads/products/wall-mounted-tv-console.svg', 'active'),
(1, 'Sahara Recliner Chair', 'sahara-recliner-chair', 'Single-seater manual recliner with padded headrest and breathable leatherette.', 'ComfortPlus', 'Leather', 27999.00, 23999.00, 8, 'http://localhost:5000/uploads/products/sahara-recliner-chair.svg', 'active');

-- Bedroom (category 2)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(2, 'Kyoto Queen Bed with Storage', 'kyoto-queen-bed-storage', 'Queen-size bed in warm walnut finish with two hydraulic storage boxes and tufted headboard.', 'WoodCraft', 'Wood', 49999.00, 42999.00, 9, 'http://localhost:5000/uploads/products/kyoto-queen-bed-storage.svg', 'active'),
(2, 'Lumière King Bed', 'lumiere-king-bed', 'King-size platform bed with flannel-lined headboard and solid teak frame.', 'WoodCraft', 'Wood', 64999.00, NULL, 5, 'http://localhost:5000/uploads/products/lumiere-king-bed.svg', 'active'),
(2, 'Aria 3-Door Wardrobe', 'aria-3-door-wardrobe', '3-door wardrobe with full-length mirror, internal drawers and hanging space.', 'UrbanNest', 'Engineered Wood', 38999.00, 34999.00, 11, 'http://localhost:5000/uploads/products/aria-3-door-wardrobe.svg', 'active'),
(2, 'Noir Bedside Table', 'noir-bedside-table', 'Matte black nightstand with soft-close drawer and open niche.', 'UrbanNest', 'Engineered Wood', 6499.00, 5299.00, 30, 'http://localhost:5000/uploads/products/noir-bedside-table.svg', 'active'),
(2, 'Serene Dressing Table', 'serene-dressing-table', 'Dressing table with oval mirror, five drawers and cushioned stool.', 'Furnora', 'Wood', 17999.00, NULL, 14, 'http://localhost:5000/uploads/products/serene-dressing-table.svg', 'active');

-- Office (category 3)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(3, 'Ergo Pro Mesh Office Chair', 'ergo-pro-mesh-office-chair', 'Ergonomic chair with adjustable lumbar support, 4D armrests and breathable mesh back.', 'ComfortPlus', 'Mesh', 15999.00, 12999.00, 25, 'http://localhost:5000/uploads/products/ergo-pro-mesh-office-chair.svg', 'active'),
(3, 'Executive Leather Chair', 'executive-leather-chair', 'High-back executive chair in bonded leather with tilt lock and chrome base.', 'ComfortPlus', 'Leather', 21999.00, NULL, 15, 'http://localhost:5000/uploads/products/executive-leather-chair.svg', 'active'),
(3, 'Minimal Work Desk 120cm', 'minimal-work-desk-120', '120cm work desk with cable tray, matte laminate top and steel legs.', 'UrbanNest', 'Engineered Wood', 9999.00, 8499.00, 28, 'http://localhost:5000/uploads/products/minimal-work-desk-120.svg', 'active'),
(3, 'Bharat Study Table', 'bharat-study-table', 'Compact study table with bookshelf hutch and pen drawer, ideal for students.', 'WoodCraft', 'Wood', 7499.00, NULL, 20, 'http://localhost:5000/uploads/products/bharat-study-table.svg', 'active'),
(3, '3-Drawer File Cabinet', '3-drawer-file-cabinet', 'Metal file cabinet with lockable drawers and anti-tilt mechanism.', 'Officeline', 'Steel', 8999.00, 7499.00, 17, 'http://localhost:5000/uploads/products/3-drawer-file-cabinet.svg', 'active');

-- Kitchen (category 4)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(4, 'Nordic 6-Seater Dining Set', 'nordic-6-seater-dining-set', '6-seater dining set in light oak with cushioned chairs and 180cm table.', 'WoodCraft', 'Wood', 58999.00, 49999.00, 7, 'http://localhost:5000/uploads/products/nordic-6-seater-dining-set.svg', 'active'),
(4, 'Compact Kitchen Island', 'compact-kitchen-island', 'Movable kitchen island with granite-look top, towel rack and two shelves.', 'Officeline', 'Engineered Wood', 18999.00, NULL, 12, 'http://localhost:5000/uploads/products/compact-kitchen-island.svg', 'active'),
(4, 'Metro Bar Stool Set of 2', 'metro-bar-stool-set-2', 'Counter-height bar stools with footrest and faux-leather seats.', 'UrbanNest', 'Leather', 9999.00, 8299.00, 24, 'http://localhost:5000/uploads/products/metro-bar-stool-set-2.svg', 'active'),
(4, 'Spice Rack Wall Organizer', 'spice-rack-wall-organizer', '3-tier wall-mounted spice rack with bamboo shelves.', 'MetroLiving', 'Bamboo', 2799.00, 2299.00, 40, 'http://localhost:5000/uploads/products/spice-rack-wall-organizer.svg', 'active');

-- Lighting (category 5)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(5, 'Halo Pendant Light', 'halo-pendant-light', 'Brushed-metal pendant with dimmable warm LED, ideal over dining tables.', 'Lumos', 'Metal', 5499.00, 4499.00, 35, 'http://localhost:5000/uploads/products/halo-pendant-light.svg', 'active'),
(5, 'Arched Floor Lamp', 'arched-floor-lamp', 'Statement arc floor lamp with marble base and linen shade.', 'Lumos', 'Metal', 8999.00, NULL, 16, 'http://localhost:5000/uploads/products/arched-floor-lamp.svg', 'active'),
(5, 'Dune Table Lamp', 'dune-table-lamp', 'Ceramic-based table lamp with woven cotton shade.', 'Lumos', 'Ceramic', 3499.00, 2999.00, 42, 'http://localhost:5000/uploads/products/dune-table-lamp.svg', 'active'),
(5, 'Smart LED Ceiling Panel', 'smart-led-ceiling-panel', 'App and voice-controlled ceiling panel with 16M colors and scheduling.', 'Lumos', 'Aluminium', 6999.00, NULL, 19, 'http://localhost:5000/uploads/products/smart-led-ceiling-panel.svg', 'active');

-- Curtains (category 6)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(6, 'Blackout Curtain Pair 7ft', 'blackout-curtain-pair-7ft', 'Thermal blackout curtains blocking 95% light, set of 2, 5ft width each.', 'Velvet & Vine', 'Polyester', 3999.00, 3199.00, 50, 'http://localhost:5000/uploads/products/blackout-curtain-pair-7ft.svg', 'active'),
(6, 'Linen Sheer Curtains', 'linen-sheer-curtains', 'Breezy sheer linen-look curtains for soft filtered daylight.', 'Velvet & Vine', 'Linen Blend', 2899.00, NULL, 38, 'http://localhost:5000/uploads/products/linen-sheer-curtains.svg', 'active'),
(6, 'Velvet Drape Panel', 'velvet-drape-panel', 'Luxurious velvet drapes with weighted hem, 9ft length.', 'Velvet & Vine', 'Velvet', 5499.00, 4299.00, 20, 'http://localhost:5000/uploads/products/velvet-drape-panel.svg', 'active');

-- Rugs (category 7)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(7, 'Persian Medallion Rug 8x10', 'persian-medallion-rug-8x10', 'Machine-woven Persian-style rug with medallion motif and anti-skid backing.', 'Carvan Rugs', 'Polypropylene', 15999.00, 12999.00, 9, 'http://localhost:5000/uploads/products/persian-medallion-rug-8x10.svg', 'active'),
(7, 'Jute Braided Rug 6x9', 'jute-braided-rug-6x9', 'Hand-braided natural jute rug, reversible and eco-friendly.', 'Carvan Rugs', 'Jute', 7999.00, NULL, 15, 'http://localhost:5000/uploads/products/jute-braided-rug-6x9.svg', 'active'),
(7, 'Shaggy Area Rug 5x8', 'shaggy-area-rug-5x8', 'Ultra-soft shag rug with high pile for cozy living rooms.', 'Carvan Rugs', 'Acrylic', 6499.00, 5299.00, 21, 'http://localhost:5000/uploads/products/shaggy-area-rug-5x8.svg', 'active');

-- Storage (category 8)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(8, 'Bharat 5-Shelf Bookcase', 'bharat-5-shelf-bookcase', 'Open bookcase with five adjustable shelves in honey finish.', 'WoodCraft', 'Wood', 8999.00, 7499.00, 18, 'http://localhost:5000/uploads/products/bharat-5-shelf-bookcase.svg', 'active'),
(8, 'Folding Storage Ottoman', 'folding-storage-ottoman', 'Velvet storage ottoman that folds flat and holds up to 40L.', 'MetroLiving', 'Velvet', 2999.00, 2499.00, 33, 'http://localhost:5000/uploads/products/folding-storage-ottoman.svg', 'active'),
(8, 'Space-Saver Shoe Cabinet', 'space-saver-shoe-cabinet', 'Tall shoe cabinet with tilt-out drawers for 12 pairs.', 'UrbanNest', 'Engineered Wood', 6499.00, NULL, 26, 'http://localhost:5000/uploads/products/space-saver-shoe-cabinet.svg', 'active');

-- Decor (category 9)
INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status) VALUES
(9, 'Aureate Wall Mirror', 'aureate-wall-mirror', 'Sunburst wall mirror with antique gold metal rays, 24-inch.', 'MetroLiving', 'Metal', 5999.00, 4999.00, 23, 'http://localhost:5000/uploads/products/aureate-wall-mirror.svg', 'active'),
(9, 'Zen Ceramic Vase Trio', 'zen-ceramic-vase-trio', 'Set of three matte-glaze ceramic vases in earthy tones.', 'MetroLiving', 'Ceramic', 3499.00, NULL, 45, 'http://localhost:5000/uploads/products/zen-ceramic-vase-trio.svg', 'active'),
(9, 'Marble-Effect Wall Clock', 'marble-effect-wall-clock', '12-inch silent wall clock with marble-pattern dial.', 'Lumos', 'Metal', 2499.00, 1999.00, 52, 'http://localhost:5000/uploads/products/marble-effect-wall-clock.svg', 'active'),
(9, 'Jharokha Wall Art Panel', 'jharokha-wall-art-panel', 'Hand-carved wooden wall panel inspired by Rajasthani jharokhas.', 'WoodCraft', 'Wood', 8999.00, 7299.00, 10, 'http://localhost:5000/uploads/products/jharokha-wall-art-panel.svg', 'active');

-- ============================================================
-- PRODUCT IMAGES (gallery entries; main images duplicated as primary)
-- ============================================================
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT id, main_image, TRUE FROM products WHERE main_image IS NOT NULL;

-- ============================================================
-- ADDRESSES
-- ============================================================
INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES
(2, 'Rahul Sharma', '+91 90000 00002', '12, Green Park Colony', 'Near Community Hall', 'New Delhi', 'Delhi', '110016', 'India', TRUE),
(2, 'Rahul Sharma', '+91 90000 00002', 'C-42, Sector 18', NULL, 'Noida', 'Uttar Pradesh', '201301', 'India', FALSE),
(3, 'Priya Patel', '+91 90000 00003', '7, Sunrise Apartments', 'B-wing, 3rd floor', 'Mumbai', 'Maharashtra', '400058', 'India', TRUE),
(4, 'Aisha Khan', '+91 90000 00004', '301, Lake View Residency', 'Sarjapur Road', 'Bengaluru', 'Karnataka', '560035', 'India', TRUE),
(5, 'Vikram Mehta', '+91 90000 00005', 'B-9, Civil Lines', NULL, 'Jaipur', 'Rajasthan', '302006', 'India', TRUE);

-- ============================================================
-- CARTS (empty carts for existing users)
-- ============================================================
INSERT INTO carts (user_id) VALUES (2), (3), (4), (5);

-- ============================================================
-- ORDERS (sample history for the demo customer + past orders)
-- ============================================================
-- Order 1: delivered COD order (Rahul)
INSERT INTO orders (id, user_id, address_id, order_number, subtotal, discount, shipping_cost, tax, total, coupon_code, status, payment_status, created_at) VALUES
(1, 2, 1, 'ORD-2025-00001', 30991.00, 0, 0, 3894.85, 34885.85, NULL, 'delivered', 'paid', NOW() - INTERVAL '21 days');
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES
(1, 3, 'Oakland Coffee Table', 1, 12999.00, 12999.00),
(1, 23, 'Dune Table Lamp', 2, 2999.00, 5998.00),
(1, 36, 'Marble-Effect Wall Clock', 6, 1999.00, 11994.00);
INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, created_at) VALUES
(1, 'cash_on_delivery', 'COD-TXN-00001', 34885.85, 'paid', NOW() - INTERVAL '21 days');
INSERT INTO shipments (order_id, tracking_number, courier_name, status, current_location, estimated_delivery, created_at) VALUES
(1, 'TRK100001', 'BlueDart', 'delivered', 'Delivered - New Delhi', NOW() - INTERVAL '17 days', NOW() - INTERVAL '21 days');

-- Order 2: shipped local_test_payment order (Rahul)
INSERT INTO orders (id, user_id, address_id, order_number, subtotal, discount, shipping_cost, tax, total, coupon_code, status, payment_status, created_at) VALUES
(2, 2, 2, 'ORD-2025-00002', 46999.00, 4699.90, 499.00, 6424.94, 50922.04, 'WELCOME10', 'shipped', 'paid', NOW() - INTERVAL '6 days');
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES
(2, 1, 'Aurora 3-Seater Fabric Sofa', 1, 46999.00, 46999.00);
INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, created_at) VALUES
(2, 'local_test_payment', 'LTP-TXN-00002', 50922.04, 'paid', NOW() - INTERVAL '6 days');
INSERT INTO shipments (order_id, tracking_number, courier_name, status, current_location, estimated_delivery, created_at) VALUES
(2, 'TRK100002', 'BlueDart', 'shipped', 'In transit - Nagpur Hub', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 days');

-- Order 3: confirmed COD order (Rahul)
INSERT INTO orders (id, user_id, address_id, order_number, subtotal, discount, shipping_cost, tax, total, coupon_code, status, payment_status, created_at) VALUES
(3, 2, 1, 'ORD-2025-00003', 7499.00, 0, 99.00, 1134.60, 8732.60, NULL, 'confirmed', 'pending', NOW() - INTERVAL '2 days');
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES
(3, 31, 'Bharat 5-Shelf Bookcase', 1, 7499.00, 7499.00);
INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, created_at) VALUES
(3, 'cash_on_delivery', 'COD-TXN-00003', 8732.60, 'pending', NOW() - INTERVAL '2 days');
INSERT INTO shipments (order_id, tracking_number, courier_name, status, current_location, estimated_delivery, created_at) VALUES
(3, 'TRK100003', 'Delhivery', 'confirmed', 'Order confirmed at warehouse', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days');

-- Order 4: delivered order (Priya)
INSERT INTO orders (id, user_id, address_id, order_number, subtotal, discount, shipping_cost, tax, total, coupon_code, status, payment_status, created_at) VALUES
(4, 3, 3, 'ORD-2025-00004', 46999.00, 0, 0, 5919.87, 52918.87, NULL, 'delivered', 'paid', NOW() - INTERVAL '35 days');
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES
(4, 1, 'Aurora 3-Seater Fabric Sofa', 1, 46999.00, 46999.00);
INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, created_at) VALUES
(4, 'local_test_payment', 'LTP-TXN-00004', 52918.87, 'paid', NOW() - INTERVAL '35 days');
INSERT INTO shipments (order_id, tracking_number, courier_name, status, current_location, estimated_delivery, created_at) VALUES
(4, 'TRK100004', 'Delhivery', 'delivered', 'Delivered - Mumbai', NOW() - INTERVAL '30 days', NOW() - INTERVAL '35 days');

-- Order 5: cancelled order (Vikram)
INSERT INTO orders (id, user_id, address_id, order_number, subtotal, discount, shipping_cost, tax, total, coupon_code, status, payment_status, created_at) VALUES
(5, 5, 5, 'ORD-2025-00005', 1999.00, 0, 99.00, 302.65, 2400.65, NULL, 'cancelled', 'refunded', NOW() - INTERVAL '12 days');
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES
(5, 36, 'Marble-Effect Wall Clock', 1, 1999.00, 1999.00);
INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, created_at) VALUES
(5, 'local_test_payment', 'LTP-TXN-00005', 2400.65, 'refunded', NOW() - INTERVAL '12 days');

-- ============================================================
-- REVIEWS (only for delivered products; approved for demo)
-- ============================================================
INSERT INTO reviews (user_id, product_id, rating, comment, status, created_at) VALUES
(2, 1, 5, 'The sofa exceeded expectations. Fabric feels premium and assembly was quick.', 'approved', NOW() - INTERVAL '18 days'),
(2, 3, 4, 'Sturdy table, lovely oak grain. Wish the shelf was slightly deeper.', 'approved', NOW() - INTERVAL '16 days'),
(2, 23, 5, 'Warm light, perfect for the bedside. Great value.', 'approved', NOW() - INTERVAL '15 days'),
(2, 36, 4, 'Silent clock and looks far more expensive than it is.', 'approved', NOW() - INTERVAL '14 days'),
(3, 1, 4, 'Very comfortable, though delivery took a few extra days.', 'approved', NOW() - INTERVAL '28 days'),
(4, 2, 5, 'The sectional transformed our living room. Deep seating is wonderful.', 'approved', NOW() - INTERVAL '25 days'),
(5, 36, 5, 'Bought a second one for the office. Keeps perfect time.', 'approved', NOW() - INTERVAL '9 days'),
(3, 23, 5, 'Elegant little lamp. The shade diffuses light beautifully.', 'approved', NOW() - INTERVAL '10 days');

-- ============================================================
-- WISHLIST (Rahul saved a few products)
-- ============================================================
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 2), (2, 13), (2, 27), (2, 7);

-- ============================================================
-- COUPONS
-- ============================================================
INSERT INTO coupons (code, discount_type, discount_value, minimum_order, expiry_date, status) VALUES
('WELCOME10', 'percentage', 10, 1000, NOW() + INTERVAL '90 days', 'active'),
('FURNISH20', 'percentage', 20, 20000, NOW() + INTERVAL '60 days', 'active'),
('FLAT500', 'fixed', 500, 5000, NOW() + INTERVAL '45 days', 'active'),
('EXPIRED5', 'percentage', 5, 100, NOW() - INTERVAL '10 days', 'active');

-- ============================================================
-- FEEDBACK
-- ============================================================
INSERT INTO feedback (user_id, subject, message, status) VALUES
(2, 'Delivery experience', 'The delivery team was courteous and assembled the sofa quickly. Great service!', 'resolved'),
(3, 'Website suggestion', 'Would love a filter for hand-crafted only products on the listing page.', 'read'),
(4, 'Product quality', 'The recliner stitching seems a bit loose after a month of use. Requesting a check.', 'new');

-- ============================================================
-- CUSTOM DESIGN REQUESTS
-- ============================================================
INSERT INTO custom_design_requests (user_id, name, email, phone, room_type, furniture_type, dimensions, material, preferred_color, budget, description, reference_image, status, admin_notes) VALUES
(2, 'Rahul Sharma', 'customer@furnishing.local', '+91 90000 00002', 'living-room', 'sofa', '220cm x 95cm x 85cm', 'Fabric', 'Charcoal Grey', 60000, 'L-shaped sofa with chaise on the right and stain-resistant fabric for a family with kids.', NULL, 'quotation_sent', 'Shared a quotation of INR 58,500 including fabric upgrade. Awaiting customer confirmation.'),
(3, 'Priya Patel', 'priya.patel@example.com', '+91 90000 00003', 'bedroom', 'wardrobe', '300cm x 240cm', 'Engineered Wood', 'Matte White', 120000, 'Full-wall wardrobe with loft, 6 drawers, dresser module and soft-close hinges.', NULL, 'under_review', NULL),
(5, 'Vikram Mehta', 'vikram.mehta@example.com', '+91 90000 00005', 'office', 'desk', '180cm x 80cm', 'Solid Wood', 'Walnut', 45000, 'Executive desk with wire grommets, lockable drawer and matching credenza.', NULL, 'new', NULL);

-- Sync sequence counters after explicit ID inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('shipments_id_seq', (SELECT MAX(id) FROM shipments));
