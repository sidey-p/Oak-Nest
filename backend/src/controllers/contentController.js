import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { dataUriFromBuffer, resolveImageInput } from '../utils/images.js';

// ---------- PUBLIC: storefront content ----------
export const getPublicContent = async (req, res) => {
  const result = await query('SELECT key, value FROM site_content');
  const content = {};
  result.rows.forEach((r) => { content[r.key] = r.value; });
  res.json({ success: true, content });
};

export const listActiveTestimonials = async (req, res) => {
  const result = await query(
    'SELECT id, name, role, location, rating, quote, avatar_image, sort_order FROM testimonials WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC',
  );
  res.json({ success: true, testimonials: result.rows });
};

// ---------- ADMIN: site content ----------
const CONTENT_KEYS = new Set(['hero_headline', 'hero_subline', 'hero_image', 'quote_text']);

export const updateContent = async (req, res) => {
  const entries = [];
  const { hero_headline, hero_subline, quote_text } = req.body || {};

  const pushText = (key, value) => {
    if (value === undefined) return;
    const v = String(value).trim();
    if (v.length > 2000) throw badRequest(`${key} too long (max 2000 chars)`);
    entries.push([key, v || null]);
  };

  pushText('hero_headline', hero_headline);
  pushText('hero_subline', hero_subline);
  pushText('quote_text', quote_text);

  if (req.file) {
    entries.push(['hero_image', dataUriFromBuffer(req.file.buffer, req.file.mimetype)]);
  } else if (req.body?.hero_image !== undefined) {
    const resolved = await resolveImageInput(req.body.hero_image);
    entries.push(['hero_image', resolved]);
  }

  if (!entries.length) throw badRequest('Nothing to update');

  for (const [key, value] of entries) {
    await query(
      `INSERT INTO site_content (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, value],
    );
  }

  const result = await query('SELECT key, value FROM site_content');
  const content = {};
  result.rows.forEach((r) => { content[r.key] = r.value; });
  res.json({ success: true, message: 'Content updated', content });
};

// ---------- ADMIN: testimonials ----------
export const listAllTestimonials = async (req, res) => {
  const result = await query(
    'SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC',
  );
  res.json({ success: true, testimonials: result.rows });
};

const validateTestimonial = (body, partial = false) => {
  const errors = [];
  const { name, role, location, rating, quote, sort_order } = body;

  if (!partial || name !== undefined) {
    if (!name || String(name).trim().length < 2) errors.push('Name is required (min 2 chars)');
    if (String(name || '').trim().length > 150) errors.push('Name too long (max 150 chars)');
  }
  if (quote !== undefined) {
    if (!String(quote || '').trim()) errors.push('Quote is required');
    if (String(quote).length > 1000) errors.push('Quote too long (max 1000 chars)');
  }
  if (!partial && (!quote || !String(quote).trim())) errors.push('Quote is required');
  if (rating !== undefined && rating !== null && rating !== '') {
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) errors.push('Rating must be between 1 and 5');
  }
  if (role !== undefined && String(role || '').length > 150) errors.push('Role too long (max 150 chars)');
  if (location !== undefined && String(location || '').length > 150) errors.push('Location too long (max 150 chars)');
  if (sort_order !== undefined && sort_order !== null && sort_order !== '') {
    const s = Number(sort_order);
    if (!Number.isInteger(s)) errors.push('Sort order must be an integer');
  }
  return errors;
};

export const createTestimonial = async (req, res) => {
  const errors = validateTestimonial(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { name, role, location, quote, sort_order } = req.body;
  const rating = Number(req.body.rating || 5);

  let avatar = null;
  if (req.file) {
    avatar = dataUriFromBuffer(req.file.buffer, req.file.mimetype);
  } else if (req.body?.avatar_image) {
    avatar = await resolveImageInput(req.body.avatar_image);
  }

  const result = await query(
    `INSERT INTO testimonials (name, role, location, rating, quote, avatar_image, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      String(name).trim(),
      role?.trim() || null,
      location?.trim() || null,
      rating,
      String(quote).trim(),
      avatar,
      Number(sort_order || 0),
    ],
  );
  res.status(201).json({ success: true, message: 'Testimonial created', testimonial: result.rows[0] });
};

export const updateTestimonial = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid testimonial id');

  const existing = await query('SELECT * FROM testimonials WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Testimonial not found');

  const errors = validateTestimonial(req.body, true);
  if (errors.length) throw badRequest(errors.join('; '));

  const { name, role, location, rating, quote, is_active, sort_order } = req.body;
  let avatar;
  if (req.file) {
    avatar = dataUriFromBuffer(req.file.buffer, req.file.mimetype);
  } else if (req.body?.avatar_image !== undefined) {
    avatar = await resolveImageInput(req.body.avatar_image);
  }

  const result = await query(
    `UPDATE testimonials SET
       name = COALESCE($1, name),
       role = $2,
       location = $3,
       rating = COALESCE($4, rating),
       quote = COALESCE($5, quote),
       avatar_image = COALESCE($6, avatar_image),
       is_active = COALESCE($7, is_active),
       sort_order = COALESCE($8, sort_order)
     WHERE id = $9 RETURNING *`,
    [
      name !== undefined ? String(name).trim() : null,
      role !== undefined ? (role?.trim() || null) : existing.rows[0].role,
      location !== undefined ? (location?.trim() || null) : existing.rows[0].location,
      rating !== undefined && rating !== null && rating !== '' ? Number(rating) : null,
      quote !== undefined ? String(quote).trim() : null,
      avatar === undefined ? null : avatar,
      is_active !== undefined ? Boolean(is_active) : null,
      sort_order !== undefined && sort_order !== null && sort_order !== '' ? Number(sort_order) : null,
      id,
    ],
  );
  res.json({ success: true, message: 'Testimonial updated', testimonial: result.rows[0] });
};

export const deleteTestimonial = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid testimonial id');
  const result = await query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Testimonial not found');
  res.json({ success: true, message: 'Testimonial deleted' });
};
