import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { ApiError, badRequest, unauthorized, notFound } from '../middleware/errors.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
} from '../validators/authValidators.js';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

const publicUser = (u) => ({
  id: u.id,
  first_name: u.first_name,
  last_name: u.last_name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  is_active: u.is_active,
  created_at: u.created_at,
});

export const register = async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { first_name, last_name, email, password, phone } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  const exists = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (exists.rows.length) throw new ApiError(409, 'An account with this email already exists');

  const hashed = await bcrypt.hash(String(password), 10);
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5, 'customer') RETURNING *`,
    [String(first_name).trim(), String(last_name).trim(), normalizedEmail, phone?.trim() || null, hashed],
  );

  const user = result.rows[0];
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: signToken(user),
    user: publicUser(user),
  });
};

export const login = async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { email, password } = req.body;
  const result = await query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase().trim()]);
  const user = result.rows[0];

  if (!user) throw unauthorized('Invalid email or password');
  if (!user.is_active) throw unauthorized('Your account has been deactivated. Contact support.');

  const match = await bcrypt.compare(String(password), user.password);
  if (!match) throw unauthorized('Invalid email or password');

  res.json({
    success: true,
    message: 'Login successful',
    token: signToken(user),
    user: publicUser(user),
  });
};

export const me = async (req, res) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!result.rows[0]) throw notFound('User not found');
  res.json({ success: true, user: publicUser(result.rows[0]) });
};

export const updateProfile = async (req, res) => {
  const errors = validateProfileUpdate(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { first_name, last_name, phone } = req.body;
  const result = await query(
    `UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone)
     WHERE id = $4 RETURNING *`,
    [
      first_name !== undefined ? String(first_name).trim() : null,
      last_name !== undefined ? String(last_name).trim() : null,
      phone !== undefined ? (String(phone).trim() || null) : null,
      req.user.id,
    ],
  );
  if (!result.rows[0]) throw notFound('User not found');
  res.json({ success: true, message: 'Profile updated', user: publicUser(result.rows[0]) });
};

export const changePassword = async (req, res) => {
  const errors = validatePasswordChange(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { current_password, new_password } = req.body;
  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) throw notFound('User not found');

  const match = await bcrypt.compare(String(current_password), user.password);
  if (!match) throw unauthorized('Current password is incorrect');

  const hashed = await bcrypt.hash(String(new_password), 10);
  await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
  res.json({ success: true, message: 'Password changed successfully' });
};
