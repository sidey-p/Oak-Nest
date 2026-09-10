import { withTransaction, query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { orderNumber, trackingNumber, round2 } from '../utils/helpers.js';

const TAX_RATE = 0.12;
const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING = 99;

export const createOrder = async (userId, { address_id, payment_method, coupon_code, card_details }) => {
  if (payment_method === 'local_test_payment') {
    const cd = card_details || {};
    const digits = String(cd.card_number || '').replace(/\s+/g, '');
    if (digits.length < 15 || digits.length > 16 || !/^\d+$/.test(digits)) {
      throw badRequest('Invalid card number (use test card 4111 1111 1111 1111)');
    }
    if (!cd.name_on_card || String(cd.name_on_card).trim().length < 2) throw badRequest('Name on card is required');
    if (!/^\d{2}\/\d{2}$/.test(String(cd.expiry || ''))) throw badRequest('Expiry must be in MM/YY format');
    if (!/^\d{3,4}$/.test(String(cd.cvv || ''))) throw badRequest('CVV must be 3 or 4 digits');
  }

  return withTransaction(async (client) => {
    const address = await client.query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [Number(address_id), userId],
    );
    if (!address.rows[0]) throw notFound('Delivery address not found');

    const cart = await client.query('SELECT id FROM carts WHERE user_id = $1 FOR UPDATE', [userId]);
    const cartId = cart.rows[0]?.id || (await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId])).rows[0].id;

    const items = await client.query(
      `SELECT ci.product_id, ci.quantity, ci.price,
              p.name, p.stock, COALESCE(p.discount_price, p.price) AS current_price
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.id ASC`,
      [cartId],
    );
    if (!items.rows.length) throw badRequest('Your cart is empty');

    for (const item of items.rows) {
      if (item.quantity > item.stock) {
        throw badRequest(`Insufficient stock for "${item.name}": ${item.stock} available, ${item.quantity} requested`);
      }
      if (Number(item.price) !== Number(item.current_price)) {
        throw badRequest(`Price for "${item.name}" has changed. Please review your cart.`);
      }
    }

    const subtotal = round2(items.rows.reduce((s, i) => s + Number(i.price) * i.quantity, 0));

    let discount = 0;
    let appliedCoupon = null;
    if (coupon_code) {
      const coupon = await client.query(
        `SELECT * FROM coupons WHERE code = $1 AND status = 'active' AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE) FOR UPDATE`,
        [String(coupon_code).trim().toUpperCase()],
      );
      const c = coupon.rows[0];
      if (!c) throw badRequest('Invalid or expired coupon');
      if (subtotal < Number(c.minimum_order)) {
        throw badRequest(`Minimum order for ${c.code} is ₹${Number(c.minimum_order).toLocaleString('en-IN')}`);
      }
      discount = c.discount_type === 'percentage'
        ? round2(subtotal * (Number(c.discount_value) / 100))
        : round2(Math.min(Number(c.discount_value), subtotal));
      appliedCoupon = c.code;
    }

    const tax = round2((subtotal - discount) * TAX_RATE);
    const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const total = round2(subtotal - discount + tax + shipping);

    const paid = payment_method === 'local_test_payment';
    const txnId = paid ? `LTP-TXN-${Date.now()}` : `COD-TXN-${Date.now()}`;

    const order = await client.query(
      `INSERT INTO orders (user_id, address_id, order_number, subtotal, discount, shipping_cost, tax, total, coupon_code, status, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10)
       RETURNING *`,
      [
        userId,
        Number(address_id),
        orderNumber(),
        subtotal,
        discount,
        shipping,
        tax,
        total,
        appliedCoupon,
        paid ? 'paid' : 'pending',
      ],
    );
    const orderId = order.rows[0].id;

    for (const item of items.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [orderId, item.product_id, item.name, item.quantity, Number(item.price), round2(Number(item.price) * item.quantity)],
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    await client.query(
      `INSERT INTO payments (order_id, payment_method, transaction_id, amount, status)
       VALUES ($1,$2,$3,$4,$5)`,
      [orderId, payment_method, txnId, total, paid ? 'paid' : 'pending'],
    );

    const est = new Date();
    est.setDate(est.getDate() + 7);
    await client.query(
      `INSERT INTO shipments (order_id, tracking_number, courier_name, status, current_location, estimated_delivery)
       VALUES ($1,$2,'LocalExpress','pending','Order placed',$3)`,
      [orderId, trackingNumber(), est.toISOString().slice(0, 10)],
    );

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    return order.rows[0];
  });
};
