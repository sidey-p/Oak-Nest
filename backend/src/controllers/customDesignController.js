import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { validateCustomDesign } from '../validators/shopValidators.js';
import { publicImageUrl } from '../middleware/upload.js';

const STATUSES = ['new', 'under_review', 'quotation_sent', 'accepted', 'in_production', 'completed', 'rejected'];

export const createRequest = async (req, res) => {
  const body = req.body || {};
  const errors = validateCustomDesign(body);
  if (errors.length) throw badRequest(errors.join('; '));

  const referenceImage = req.file ? publicImageUrl(req, req.file.filename, 'custom-designs') : (body.reference_image || null);

  const result = await query(
    `INSERT INTO custom_design_requests
       (user_id, name, email, phone, room_type, furniture_type, dimensions, material, preferred_color, budget, description, reference_image)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      req.user?.id || null,
      String(body.name).trim(),
      String(body.email).toLowerCase().trim(),
      body.phone?.trim() || null,
      body.room_type?.trim() || null,
      body.furniture_type?.trim() || null,
      body.dimensions?.trim() || null,
      body.material?.trim() || null,
      body.preferred_color?.trim() || null,
      body.budget ? Number(body.budget) : null,
      body.description?.trim() || null,
      referenceImage,
    ],
  );
  res.status(201).json({
    success: true,
    message: 'Request submitted! Our design team will contact you within 48 hours.',
    request: result.rows[0],
  });
};

export const listMyRequests = async (req, res) => {
  const result = await query(
    'SELECT * FROM custom_design_requests WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id],
  );
  res.json({ success: true, requests: result.rows });
};

export const listAllRequests = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status && STATUSES.includes(String(status))) {
    params.push(String(status));
    where = 'WHERE status = $1';
  }
  const result = await query(
    `SELECT * FROM custom_design_requests ${where} ORDER BY created_at DESC`,
    params,
  );
  res.json({ success: true, requests: result.rows });
};

export const getRequest = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid request id');

  const result = await query('SELECT * FROM custom_design_requests WHERE id = $1', [id]);
  const request = result.rows[0];
  if (!request) throw notFound('Request not found');
  if (req.user.role !== 'admin' && request.user_id !== req.user.id) throw notFound('Request not found');
  res.json({ success: true, request });
};

export const updateRequest = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid request id');

  const existing = await query('SELECT * FROM custom_design_requests WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Request not found');

  const { status, admin_notes } = req.body;
  if (status !== undefined && !STATUSES.includes(String(status))) {
    throw badRequest(`Status must be one of: ${STATUSES.join(', ')}`);
  }
  if (admin_notes !== undefined && String(admin_notes).length > 3000) throw badRequest('Notes too long (max 3000 chars)');

  const result = await query(
    `UPDATE custom_design_requests SET
       status = COALESCE($1, status),
       admin_notes = COALESCE($2, admin_notes)
     WHERE id = $3 RETURNING *`,
    [status !== undefined ? String(status) : null, admin_notes !== undefined ? admin_notes : null, id],
  );
  res.json({ success: true, message: 'Request updated', request: result.rows[0] });
};
