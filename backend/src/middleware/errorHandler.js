import { ApiError } from './errors.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.code === '23505' || err.code === '23P01') {
    status = 409;
    message = err.detail || 'Duplicate record';
    try {
      message = err.detail || err.message;
    } catch {
      message = 'Duplicate record';
    }
  }

  if (err.code === '23503') {
    status = 400;
    message = 'Related record not found or in use';
  }

  if (err.code === '23514') {
    status = 400;
    message = 'Value violates a database constraint';
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    console.error(err);
  }

  res.status(status).json({ success: false, message });
};
