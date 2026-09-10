import { query } from '../config/db.js';
import { badRequest, notFound, forbidden } from '../middleware/errors.js';
import { validateCheckout } from '../validators/shopValidators.js';
import { createOrder } from '../services/orderService.js';
import { round2 } from '../utils/helpers.js';

const ORDER_SUMMARY = `
  SELECT o.*,
         a.full_name AS recipient, a.phone AS recipient_phone,
         a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country,
         u.first_name || ' ' || u.last_name AS customer_name, u.email AS customer_email
  FROM orders o
  JOIN addresses a ON a.id = o.address_id
  JOIN users u ON u.id = o.user_id
`;

export const listOrders = async (req, res) => {
  const result = await query(
    `${ORDER_SUMMARY} WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
    [req.user.id],
  );
  res.json({ success: true, orders: result.rows });
};

export const getOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid order id');

  const result = await query(`${ORDER_SUMMARY} WHERE o.id = $1`, [id]);
  const order = result.rows[0];
  if (!order) throw notFound('Order not found');
  if (order.user_id !== req.user.id && req.user.role !== 'admin') throw forbidden('You cannot view this order');

  const items = await query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC', [id]);
  const payment = await query('SELECT id, payment_method, transaction_id, amount, status, created_at FROM payments WHERE order_id = $1 ORDER BY id DESC', [id]);
  const shipment = await query('SELECT * FROM shipments WHERE order_id = $1', [id]);

  res.json({
    success: true,
    order,
    items: items.rows,
    payment: payment.rows[0] || null,
    shipment: shipment.rows[0] || null,
  });
};

export const placeOrder = async (req, res) => {
  const errors = validateCheckout(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const order = await createOrder(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Order placed successfully', order });
};

export const cancelOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid order id');

  const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
  const order = result.rows[0];
  if (!order) throw notFound('Order not found');
  if (order.user_id !== req.user.id && req.user.role !== 'admin') throw forbidden('You cannot cancel this order');

  const cancellable = ['pending', 'confirmed', 'processing'];
  if (!cancellable.includes(order.status)) {
    throw badRequest(`Order in "${order.status.replace(/_/g, ' ')}" status can no longer be cancelled online. Contact support.`);
  }

  const client = await (await import('../config/db.js')).default.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE orders SET status = 'cancelled',
         payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE 'failed' END
       WHERE id = $1`,
      [id],
    );
    await client.query(
      "UPDATE payments SET status = CASE WHEN status = 'paid' THEN 'refunded' ELSE 'failed' END WHERE order_id = $1",
      [id],
    );
    await client.query("UPDATE shipments SET status = 'cancelled' WHERE order_id = $1", [id]);

    const items = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1 AND product_id IS NOT NULL', [id]);
    for (const item of items.rows) {
      await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.json({ success: true, message: 'Order cancelled. Any paid amount will be refunded (simulated).' });
};

const TRACKING_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export const trackOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid order id');

  const result = await query(
    `SELECT o.id, o.order_number, o.status, o.user_id,
            s.tracking_number, s.courier_name, s.status AS shipment_status,
            s.current_location, s.estimated_delivery, o.created_at
     FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
     WHERE o.id = $1`,
    [id],
  );
  const order = result.rows[0];
  if (!order) throw notFound('Order not found');
  if (order.user_id !== req.user.id && req.user.role !== 'admin') throw forbidden('You cannot track this order');

  const currentStatus = order.shipment_status || order.status;
  const timeline = TRACKING_STEPS.map((step, idx) => {
    const reached = TRACKING_STEPS.indexOf(currentStatus);
    const isCancelled = currentStatus === 'cancelled';
    return {
      step,
      label: step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      completed: !isCancelled && reached >= idx,
      current: !isCancelled && reached === idx,
      cancelled: isCancelled && idx === 0,
    };
  });

  res.json({
    success: true,
    order: {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      shipment_status: order.shipment_status,
      tracking_number: order.tracking_number,
      courier_name: order.courier_name,
      current_location: order.current_location,
      estimated_delivery: order.estimated_delivery,
      created_at: order.created_at,
    },
    timeline,
  });
};
