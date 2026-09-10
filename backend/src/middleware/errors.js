export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const badRequest = (msg) => new ApiError(400, msg);
export const unauthorized = (msg = 'Not authenticated') => new ApiError(401, msg);
export const forbidden = (msg = 'Not authorized') => new ApiError(403, msg);
export const notFound = (msg = 'Resource not found') => new ApiError(404, msg);
export const conflict = (msg) => new ApiError(409, msg);
