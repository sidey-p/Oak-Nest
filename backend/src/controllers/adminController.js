import { query } from '../config/db.js';
import db from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { round2 } from '../utils/helpers.js';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

export const dashboardStats = async (req, res) => {
  const [users, products, orders, sales, pending, lowStock, pendingReviews, openRequests] = await Promise.all([
    query("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'"),
    query("SELECT COUNT(*) AS n FROM products WHERE status = 'active'"),
    query('SELECT COUNT(*) AS n FROM orders'),
    query("SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status <> 'cancelled'"),
    query("SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','confirmed','processing')"),
    query("SELECT COUNT(*) AS n FROM products WHERE stock <= 5 AND status = 'active'"),
    query("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'"),
    query("SELECT COUNT(*) AS n FROM custom_design_requests WHERE status IN ('new','under_review')"),
  ]);

  const recentOrders = await query(
    `SELECT o.id, o.order_number, o.total, o.status, o.created_at,
            u.first_name || ' ' || u.last_name AS customer
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT 8`,
  );

  const topProducts = await query(
    `SELECT p.id, p.name, p.main_image, SUM(oi.quantity) AS sold, SUM(oi.total) AS revenue
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
     GROUP BY p.id, p.name, p.main_image
     ORDER BY sold DESC LIMIT 5`,
  );

  const salesByCategory = await query(
    `SELECT c.name, COALESCE(SUM(oi.total), 0) AS revenue
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN categories c ON c.id = p.category_id
     JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
     GROUP BY c.name ORDER BY revenue DESC`,
  );

  res.json({
    success: true,
    stats: {
      total_customers: Number(users.rows[0].n),
      total_products: Number(products.rows[0].n),
      total_orders: Number(orders.rows[0].n),
      total_sales: round2(Number(sales.rows[0].n)),
      pending_orders: Number(pending.rows[0].n),
      low_stock_products: Number(lowStock.rows[0].n),
      pending_reviews: Number(pendingReviews.rows[0].n),
      open_design_requests: Number(openRequests.rows[0].n),
    },
    recent_orders: recentOrders.rows,
    top_products: topProducts.rows,
    sales_by_category: salesByCategory.rows,
  });
};

// ---------- USERS ----------
export const listUsers = async (req, res) => {
  const { search, role } = req.query;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${String(search).toLowerCase()}%`);
    where.push(`(LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`);
  }
  if (role && ['customer', 'admin'].includes(String(role))) {
    params.push(String(role));
    where.push(`role = $${params.length}`);
  }

  const result = await query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.is_active, u.created_at,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
            (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled') AS lifetime_value
     FROM users u
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY u.created_at DESC`,
    params,
  );
  res.json({ success: true, users: result.rows });
};

export const toggleUserActive = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid user id');
  if (id === req.user.id) throw badRequest('You cannot deactivate your own account');

  const result = await query(
    'UPDATE users SET is_active = NOT is_active WHERE id = $1 AND role = $2 RETURNING id, email, is_active',
    [id, 'customer'],
  );
  if (!result.rows[0]) throw notFound('Customer not found');
  res.json({ success: true, message: `User ${result.rows[0].is_active ? 'activated' : 'deactivated'}`, user: result.rows[0] });
};

// ---------- ORDERS ----------
export const listAllOrders = async (req, res) => {
  const { status, search } = req.query;
  const where = [];
  const params = [];

  if (status && ORDER_STATUSES.includes(String(status))) {
    params.push(String(status));
    where.push(`o.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${String(search).toLowerCase()}%`);
    where.push(`(LOWER(o.order_number) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(u.first_name || ' ' || u.last_name) LIKE $${params.length})`);
  }

  const result = await query(
    `SELECT o.*, u.first_name || ' ' || u.last_name AS customer, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY o.created_at DESC`,
    params,
  );
  res.json({ success: true, orders: result.rows });
};

export const updateOrderStatus = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid order id');

  const status = String(req.body?.status || '');
  if (!ORDER_STATUSES.includes(status)) {
    throw badRequest(`Status must be one of: ${ORDER_STATUSES.join(', ')}`);
  }

  const order = await query('SELECT * FROM orders WHERE id = $1', [id]);
  if (!order.rows[0]) throw notFound('Order not found');

  const current = order.rows[0].status;
  if (current === 'cancelled' && status !== 'cancelled') {
    throw badRequest('Cancelled orders cannot be reopened');
  }
  if (current === 'delivered' && status !== 'delivered' && status !== 'returned') {
    throw badRequest('Delivered orders can only be marked as returned');
  }

  const shipmentStatusMap = {
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'processing',
    shipped: 'shipped',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
  };

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const updated = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );

    if (shipmentStatusMap[status]) {
      await client.query(
        'UPDATE shipments SET status = $1, current_location = $2 WHERE order_id = $3',
        [shipmentStatusMap[status], status === 'delivered' ? 'Delivered' : `Order ${status.replace(/_/g, ' ')}`, id],
      );
    } else if (status === 'cancelled') {
      await client.query("UPDATE shipments SET status = 'cancelled' WHERE order_id = $1", [id]);
      const items = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1 AND product_id IS NOT NULL', [id]);
      for (const item of items.rows) {
        await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Order status updated to ${status.replace(/_/g, ' ')}`, order: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ---------- PAYMENTS ----------
export const listPayments = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status && ['pending', 'paid', 'failed', 'refunded'].includes(String(status))) {
    params.push(String(status));
    where = 'WHERE pm.status = $1';
  }
  const result = await query(
    `SELECT pm.*, o.order_number, o.status AS order_status, o.total AS order_total,
            u.first_name || ' ' || u.last_name AS customer, u.email AS customer_email
     FROM payments pm
     JOIN orders o ON o.id = pm.order_id
     JOIN users u ON u.id = o.user_id
     ${where}
     ORDER BY pm.created_at DESC`,
    params,
  );
  res.json({ success: true, payments: result.rows });
};

// ---------- SHIPMENTS ----------
export const listShipments = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) {
    params.push(String(status));
    where = 'WHERE s.status = $1';
  }
  const result = await query(
    `SELECT s.*, o.order_number, o.total AS order_total, o.status AS order_status,
            u.first_name || ' ' || u.last_name AS customer
     FROM shipments s
     JOIN orders o ON o.id = s.order_id
     JOIN users u ON u.id = o.user_id
     ${where}
     ORDER BY s.created_at DESC`,
    params,
  );
  res.json({ success: true, shipments: result.rows });
};

export const updateShipment = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid shipment id');

  const existing = await query('SELECT * FROM shipments WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Shipment not found');

  const { status, courier_name, tracking_number, current_location, estimated_delivery } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  if (status !== undefined && !validStatuses.includes(String(status))) {
    throw badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const result = await query(
    `UPDATE shipments SET
       status = COALESCE($1, status),
       courier_name = COALESCE($2, courier_name),
       tracking_number = COALESCE($3, tracking_number),
       current_location = COALESCE($4, current_location),
       estimated_delivery = COALESCE($5, estimated_delivery)
     WHERE id = $6 RETURNING *`,
    [
      status !== undefined ? String(status) : null,
      courier_name !== undefined ? courier_name : null,
      tracking_number !== undefined ? tracking_number : null,
      current_location !== undefined ? current_location : null,
      estimated_delivery !== undefined ? estimated_delivery : null,
      id,
    ],
  );
  res.json({ success: true, message: 'Shipment updated', shipment: result.rows[0] });
};

// ---------- REVIEWS MODERATION ----------
export const listAllReviews = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status && ['pending', 'approved', 'hidden'].includes(String(status))) {
    params.push(String(status));
    where = 'WHERE r.status = $1';
  }
  const result = await query(
    `SELECT r.*, p.name AS product_name, p.slug AS product_slug,
            u.first_name || ' ' || u.last_name AS reviewer
     FROM reviews r
     JOIN products p ON p.id = r.product_id
     JOIN users u ON u.id = r.user_id
     ${where}
     ORDER BY r.created_at DESC`,
    params,
  );
  res.json({ success: true, reviews: result.rows });
};

export const moderateReview = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid review id');

  const status = String(req.body?.status || '');
  if (!['pending', 'approved', 'hidden'].includes(status)) throw badRequest('Status must be pending, approved or hidden');

  const result = await query('UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  if (!result.rows[0]) throw notFound('Review not found');
  res.json({ success: true, message: `Review ${status}`, review: result.rows[0] });
};

export const deleteReviewAdmin = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid review id');
  const result = await query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Review not found');
  res.json({ success: true, message: 'Review deleted' });
};
