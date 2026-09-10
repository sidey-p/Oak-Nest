import { query, withTransaction } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { toNumber, round2 } from '../utils/helpers.js';

const TAX_RATE = 0.12;
const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING = 99;

const ensureCart = async (userId) => {
  const existing = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  return created.rows[0].id;
};

const computeTotals = (items) => {
  const subtotal = round2(items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = round2(subtotal + tax + shipping);
  return { subtotal, tax, shipping, total, tax_rate: TAX_RATE, free_shipping_threshold: FREE_SHIPPING_THRESHOLD };
};

export const getCart = async (req, res) => {
  const cartId = await ensureCart(req.user.id);
  const items = await query(
    `SELECT ci.id, ci.product_id, ci.quantity, ci.price,
            p.name, p.slug, p.main_image, p.stock, p.brand,
            COALESCE(p.discount_price, p.price) AS current_price
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id ASC`,
    [cartId],
  );
  res.json({ success: true, items: items.rows, totals: computeTotals(items.rows) });
};

export const addToCart = async (req, res) => {
  const productId = Number(req.body?.product_id);
  const quantity = Number(req.body?.quantity ?? 1);
  if (!Number.isInteger(productId) || productId <= 0) throw badRequest('Valid product_id is required');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw badRequest('Quantity must be between 1 and 99');

  await withTransaction(async (client) => {
    const product = await client.query(
      "SELECT id, name, stock, COALESCE(discount_price, price) AS price FROM products WHERE id = $1 AND status = 'active' FOR UPDATE",
      [productId],
    );
    if (!product.rows[0]) throw notFound('Product not found or unavailable');

    const cart = await client.query('SELECT id FROM carts WHERE user_id = $1 FOR UPDATE', [req.user.id]);
    const cartId = cart.rows[0]?.id || (await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.user.id])).rows[0].id;

    const existing = await client.query('SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    const newQty = (existing.rows[0]?.quantity || 0) + quantity;

    if (newQty > product.rows[0].stock) {
      throw badRequest(`Only ${product.rows[0].stock} unit(s) of "${product.rows[0].name}" available`);
    }

    if (existing.rows[0]) {
      await client.query('UPDATE cart_items SET quantity = $1, price = $2 WHERE id = $3', [newQty, product.rows[0].price, existing.rows[0].id]);
    } else {
      await client.query('INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [cartId, productId, quantity, product.rows[0].price]);
    }
  });

  res.status(201).json({ success: true, message: 'Added to cart' });
};

export const updateCartItem = async (req, res) => {
  const itemId = Number(req.params.id);
  if (!Number.isInteger(itemId)) throw badRequest('Invalid cart item id');

  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw badRequest('Quantity must be between 0 and 99');

  const cartId = await ensureCart(req.user.id);
  const item = await query(
    `SELECT ci.*, p.stock, p.name FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.id = $1 AND ci.cart_id = $2`,
    [itemId, cartId],
  );
  if (!item.rows[0]) throw notFound('Cart item not found');

  if (quantity === 0) {
    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    return res.json({ success: true, message: 'Item removed' });
  }

  if (quantity > item.rows[0].stock) {
    throw badRequest(`Only ${item.rows[0].stock} unit(s) of "${item.rows[0].name}" available`);
  }

  await query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
  res.json({ success: true, message: 'Quantity updated' });
};

export const removeCartItem = async (req, res) => {
  const itemId = Number(req.params.id);
  if (!Number.isInteger(itemId)) throw badRequest('Invalid cart item id');

  const cartId = await ensureCart(req.user.id);
  const result = await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id', [itemId, cartId]);
  if (!result.rows[0]) throw notFound('Cart item not found');
  res.json({ success: true, message: 'Item removed' });
};

export const clearCart = async (req, res) => {
  const cartId = await ensureCart(req.user.id);
  await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  res.json({ success: true, message: 'Cart cleared' });
};

export const applyCouponToCart = async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) throw badRequest('Coupon code is required');

  const coupon = await query(
    `SELECT * FROM coupons
     WHERE code = $1 AND status = 'active' AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
    [code],
  );
  if (!coupon.rows[0]) throw notFound('Invalid or expired coupon');

  const cartId = await ensureCart(req.user.id);
  const items = await query(
    'SELECT ci.quantity, ci.price FROM cart_items ci WHERE ci.cart_id = $1',
    [cartId],
  );
  const totals = computeTotals(items.rows);
  const c = coupon.rows[0];

  if (totals.subtotal < Number(c.minimum_order)) {
    throw badRequest(`Minimum order for ${c.code} is ₹${Number(c.minimum_order).toLocaleString('en-IN')}`);
  }

  const discount = c.discount_type === 'percentage'
    ? round2(totals.subtotal * (Number(c.discount_value) / 100))
    : round2(Math.min(Number(c.discount_value), totals.subtotal));

  const total = round2(totals.subtotal - discount + totals.tax + totals.shipping);

  res.json({
    success: true,
    message: `Coupon ${c.code} applied`,
    coupon: { code: c.code, discount_type: c.discount_type, discount_value: Number(c.discount_value) },
    totals: { ...totals, discount, total },
  });
};
