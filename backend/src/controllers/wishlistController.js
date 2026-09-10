import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';

export const getWishlist = async (req, res) => {
  const result = await query(
    `SELECT w.product_id, w.created_at AS added_at,
            p.name, p.slug, p.brand, p.material, p.price, p.discount_price, p.stock, p.main_image, p.status,
            COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0) AS avg_rating
     FROM wishlist w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.user.id],
  );
  res.json({ success: true, items: result.rows });
};

export const addToWishlist = async (req, res) => {
  const productId = Number(req.body?.product_id);
  if (!Number.isInteger(productId) || productId <= 0) throw badRequest('Valid product_id is required');

  const exists = await query("SELECT id FROM products WHERE id = $1 AND status = 'active'", [productId]);
  if (!exists.rows[0]) throw notFound('Product not found');

  const dupe = await query('SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
  if (dupe.rows[0]) return res.json({ success: true, message: 'Already in wishlist' });

  await query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [req.user.id, productId]);
  res.status(201).json({ success: true, message: 'Added to wishlist' });
};

export const removeFromWishlist = async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId)) throw badRequest('Invalid product id');

  const result = await query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id', [req.user.id, productId]);
  if (!result.rows[0]) throw notFound('Product not in wishlist');
  res.json({ success: true, message: 'Removed from wishlist' });
};
