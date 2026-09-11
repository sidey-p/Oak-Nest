// Vercel serverless entry (ESM) — receives ALL /api requests through the
// vercel.json rewrite (/api/:path* -> /api). Express routing then matches
// the original URL via the x-original-path header... but Express reads
// req.url, so we reconstruct it from the rewrite source path.
import app from '../backend/src/app.js';

export default async function handler(req, res) {
  // Vercel preserves the original path in req.url when using rewrites
  // with a destination function file — requests arrive as /api/<subpath>
  // via the x-vercel-original-path style headers depending on runtime.
  // The rewrite passes the path through, so req.url already contains
  // /api/<...> for the function mounted at /api.
  await app(req, res);
}
