import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { validateFeedback } from '../validators/shopValidators.js';

export const submitFeedback = async (req, res) => {
  const errors = validateFeedback(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { subject, message } = req.body;
  const result = await query(
    `INSERT INTO feedback (user_id, subject, message) VALUES ($1, $2, $3) RETURNING id, subject, message, status, created_at`,
    [req.user.id, String(subject).trim(), String(message).trim()],
  );
  res.status(201).json({ success: true, message: 'Feedback submitted. Thank you!', feedback: result.rows[0] });
};

export const listMyFeedback = async (req, res) => {
  const result = await query(
    'SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id],
  );
  res.json({ success: true, feedback: result.rows });
};

export const listFeedback = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status && ['new', 'read', 'resolved'].includes(String(status))) {
    params.push(String(status));
    where = 'WHERE f.status = $1';
  }
  const result = await query(
    `SELECT f.*, (u.first_name || ' ' || u.last_name) AS user_name, u.email AS user_email
     FROM feedback f LEFT JOIN users u ON u.id = f.user_id
     ${where} ORDER BY f.created_at DESC`,
    params,
  );
  res.json({ success: true, feedback: result.rows });
};

export const updateFeedbackStatus = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid feedback id');

  const status = String(req.body?.status || '');
  if (!['new', 'read', 'resolved'].includes(status)) throw badRequest('Status must be new, read or resolved');

  const result = await query('UPDATE feedback SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  if (!result.rows[0]) throw notFound('Feedback not found');
  res.json({ success: true, message: 'Feedback status updated', feedback: result.rows[0] });
};

export const deleteFeedback = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid feedback id');
  const result = await query('DELETE FROM feedback WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Feedback not found');
  res.json({ success: true, message: 'Feedback deleted' });
};
