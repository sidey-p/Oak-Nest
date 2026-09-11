// Vercel serverless entry — delegates every /api/* request to the
// existing Express app. Business logic stays unchanged in backend/src.
import app from '../backend/src/app.js';

export default async function handler(req, res) {
  // Vercel rewrites /api/<path> to this function with the full original
  // URL preserved, so Express routing works as-is.
  await app(req, res);
}
