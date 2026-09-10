import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { validateAddress } from '../validators/shopValidators.js';

export const listAddresses = async (req, res) => {
  const result = await query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC',
    [req.user.id],
  );
  res.json({ success: true, addresses: result.rows });
};

export const createAddress = async (req, res) => {
  const errors = validateAddress(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;

  const result = await query(
    `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      req.user.id,
      String(full_name).trim(),
      String(phone).trim(),
      String(address_line1).trim(),
      address_line2?.trim() || null,
      String(city).trim(),
      String(state).trim(),
      String(postal_code).trim(),
      String(country || 'India').trim(),
      is_default === true || is_default === 'true',
    ],
  );

  if (result.rows[0].is_default) {
    await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND id <> $2', [req.user.id, result.rows[0].id]);
  }

  res.status(201).json({ success: true, message: 'Address added', address: result.rows[0] });
};

export const updateAddress = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid address id');

  const existing = await query('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!existing.rows[0]) throw notFound('Address not found');

  const errors = validateAddress({ ...existing.rows[0], ...req.body }, true);
  if (errors.length) throw badRequest(errors.join('; '));

  const b = req.body;
  const result = await query(
    `UPDATE addresses SET
       full_name = COALESCE($1, full_name),
       phone = COALESCE($2, phone),
       address_line1 = COALESCE($3, address_line1),
       address_line2 = COALESCE($4, address_line2),
       city = COALESCE($5, city),
       state = COALESCE($6, state),
       postal_code = COALESCE($7, postal_code),
       country = COALESCE($8, country),
       is_default = COALESCE($9, is_default)
     WHERE id = $10 AND user_id = $11 RETURNING *`,
    [
      b.full_name !== undefined ? String(b.full_name).trim() : null,
      b.phone !== undefined ? String(b.phone).trim() : null,
      b.address_line1 !== undefined ? String(b.address_line1).trim() : null,
      b.address_line2 !== undefined ? (String(b.address_line2).trim() || null) : null,
      b.city !== undefined ? String(b.city).trim() : null,
      b.state !== undefined ? String(b.state).trim() : null,
      b.postal_code !== undefined ? String(b.postal_code).trim() : null,
      b.country !== undefined ? String(b.country).trim() : null,
      b.is_default !== undefined ? (b.is_default === true || b.is_default === 'true') : null,
      id,
      req.user.id,
    ],
  );

  if (result.rows[0].is_default) {
    await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND id <> $2', [req.user.id, id]);
  }

  res.json({ success: true, message: 'Address updated', address: result.rows[0] });
};

export const deleteAddress = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid address id');

  const used = await query('SELECT COUNT(*) AS n FROM orders WHERE address_id = $1', [id]);
  if (Number(used.rows[0].n) > 0) {
    throw badRequest('This address is linked to existing orders and cannot be deleted');
  }

  const result = await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
  if (!result.rows[0]) throw notFound('Address not found');
  res.json({ success: true, message: 'Address deleted' });
};

export const setDefaultAddress = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid address id');

  const existing = await query('SELECT id FROM addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!existing.rows[0]) throw notFound('Address not found');

  await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
  await query('UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2', [id, req.user.id]);

  res.json({ success: true, message: 'Default address updated' });
};
