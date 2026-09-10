import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from './errors.js';

export const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw unauthorized('Authentication token missing');
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    if (err.statusCode) return next(err);
    next(unauthorized('Invalid or expired token'));
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
  } catch {
    // no valid token — continue as anonymous
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(forbidden('Admin access required'));
  }
  next();
};
