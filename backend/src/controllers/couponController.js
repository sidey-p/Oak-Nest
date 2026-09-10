import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { validateCoupon as validateCouponInput } from '../validators/shopValidators.js';
import { round2 } from '../utils/helpers.js';

export const listCoupons = async (req, res) => {
  const result = await query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json({ success: true, coupons: result.rows });
};

export const getCoupon = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid coupon id');
  const result = await query('SELECT * FROM coupons WHERE id = $1', [id]);
  if (!result.rows[0]) throw notFound('Coupon not found');
  res.json({ success: true, coupon: result.rows[0] });
};

export const createCoupon = async (req, res) => {
  const errors = validateCouponInput(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const code = String(req.body.code).trim().toUpperCase();
  const dupe = await query('SELECT id FROM coupons WHERE code = $1', [code]);
  if (dupe.rows[0]) throw badRequest('A coupon with this code already exists');

  const { discount_type, discount_value, minimum_order, expiry_date, status } = req.body;
  const result = await query(
    `INSERT INTO coupons (code, discount_type, discount_value, minimum_order, expiry_date, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      code,
      discount_type,
      Number(discount_value),
      minimum_order ? Number(minimum_order) : 0,
      expiry_date || null,
      status === 'inactive' ? 'inactive' : 'active',
    ],
  );
  res.status(201).json({ success: true, message: 'Coupon created', coupon: result.rows[0] });
};

export const updateCoupon = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid coupon id');

  const existing = await query('SELECT * FROM coupons WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Coupon not found');

  const merged = { ...existing.rows[0], ...req.body };
  const errors = validateCouponInput(merged, true);
  if (errors.length) throw badRequest(errors.join('; '));

  const { code, discount_type, discount_value, minimum_order, expiry_date, status } = req.body;
  const result = await query(
    `UPDATE coupons SET
       code = COALESCE($1, code),
       discount_type = COALESCE($2, discount_type),
       discount_value = COALESCE($3, discount_value),
       minimum_order = COALESCE($4, minimum_order),
       expiry_date = $5,
       status = COALESCE($6, status)
     WHERE id = $7 RETURNING *`,
    [
      code !== undefined ? String(code).trim().toUpperCase() : null,
      discount_type !== undefined ? discount_type : null,
      discount_value !== undefined ? Number(discount_value) : null,
      minimum_order !== undefined ? (minimum_order === null || minimum_order === '' ? 0 : Number(minimum_order)) : null,
      expiry_date === undefined ? existing.rows[0].expiry_date : (expiry_date || null),
      status !== undefined ? status : null,
      id,
    ],
  );
  res.json({ success: true, message: 'Coupon updated', coupon: result.rows[0] });
};

export const deleteCoupon = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid coupon id');
  const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Coupon not found');
  res.json({ success: true, message: 'Coupon deleted' });
};

export const validateCoupon = async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) throw badRequest('Coupon code is required');
  const result = await query(
    "SELECT * FROM coupons WHERE code = $1 AND status = 'active' AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)",
    [code],
  );
  if (!result.rows[0]) throw notFound('Invalid or expired coupon');
  const c = result.rows[0];
  res.json({
    success: true,
    coupon: { code: c.code, discount_type: c.discount_type, discount_value: Number(c.discount_value), minimum_order: Number(c.minimum_order) },
  });
};
