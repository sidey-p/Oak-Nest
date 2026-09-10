import { query } from '../config/db.js';
import { badRequest, notFound, forbidden } from '../middleware/errors.js';
import { validateReview } from '../validators/shopValidators.js';

export const listProductReviews = async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) throw badRequest('Invalid product id');

  const isAdmin = req.user?.role === 'admin';
  const result = await query(
    `SELECT r.id, r.product_id, r.rating, r.comment, r.status, r.created_at,
            u.first_name, u.last_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1 ${isAdmin ? '' : "AND r.status = 'approved'"}
     ORDER BY r.created_at DESC`,
    [productId],
  );

  const stats = await query(
    `SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS total
     FROM reviews WHERE product_id = $1 AND status = 'approved'`,
    [productId],
  );

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.rows.forEach((r) => { distribution[r.rating] += 1; });

  res.json({
    success: true,
    reviews: result.rows,
    stats: {
      avg_rating: Number(stats.rows[0].avg_rating) ? Math.round(Number(stats.rows[0].avg_rating) * 10) / 10 : 0,
      total: Number(stats.rows[0].total),
      distribution,
    },
  });
};

export const createReview = async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) throw badRequest('Invalid product id');

  const errors = validateReview(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const product = await query("SELECT id FROM products WHERE id = $1 AND status = 'active'", [productId]);
  if (!product.rows[0]) throw notFound('Product not found');

  const dupe = await query('SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
  if (dupe.rows[0]) throw badRequest('You have already reviewed this product. Edit your existing review instead.');

  const purchased = await query(
    `SELECT COUNT(*) AS n
     FROM orders o JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'`,
    [req.user.id, productId],
  );
  const hasPurchased = Number(purchased.rows[0].n) > 0;

  const result = await query(
    `INSERT INTO reviews (user_id, product_id, rating, comment, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, product_id, rating, comment, status, created_at`,
    [req.user.id, productId, Number(req.body.rating), req.body.comment?.trim() || null, 'pending'],
  );

  res.status(201).json({
    success: true,
    message: hasPurchased
      ? 'Thank you! Your review is pending approval and will appear shortly.'
      : 'Thank you! Reviews from verified purchases get priority approval.',
    review: result.rows[0],
  });
};

export const updateReview = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid review id');

  const existing = await query('SELECT * FROM reviews WHERE id = $1', [id]);
  const review = existing.rows[0];
  if (!review) throw notFound('Review not found');
  if (review.user_id !== req.user.id && req.user.role !== 'admin') throw forbidden('You cannot edit this review');

  const errors = validateReview({ rating: req.body.rating ?? review.rating, comment: req.body.comment });
  if (errors.length) throw badRequest(errors.join('; '));

  const result = await query(
    `UPDATE reviews SET
       rating = COALESCE($1, rating),
       comment = $2,
       status = $3
     WHERE id = $4 RETURNING id, product_id, rating, comment, status, created_at`,
    [
      req.body.rating !== undefined ? Number(req.body.rating) : null,
      req.body.comment !== undefined ? (String(req.body.comment).trim() || null) : review.comment,
      req.user.role === 'admin' && req.body.status ? req.body.status : 'pending',
      id,
    ],
  );
  res.json({ success: true, message: 'Review updated', review: result.rows[0] });
};

export const deleteReview = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid review id');

  const existing = await query('SELECT * FROM reviews WHERE id = $1', [id]);
  const review = existing.rows[0];
  if (!review) throw notFound('Review not found');
  if (review.user_id !== req.user.id && req.user.role !== 'admin') throw forbidden('You cannot delete this review');

  await query('DELETE FROM reviews WHERE id = $1', [id]);
  res.json({ success: true, message: 'Review deleted' });
};
