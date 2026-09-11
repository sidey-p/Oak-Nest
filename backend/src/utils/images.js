import { badRequest } from '../middleware/errors.js';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_REMOTE_BYTES = 4 * 1024 * 1024; // 4MB binary
const MAX_DATAURI_CHARS = 6 * 1024 * 1024; // ~4.3MB binary once base64 encoded

export const dataUriFromBuffer = (buffer, mimetype) => {
  if (!ALLOWED_MIME.has(mimetype)) {
    throw badRequest('Only image files (jpeg, png, webp, gif, svg) are allowed');
  }
  return `data:${mimetype};base64,${Buffer.from(buffer).toString('base64')}`;
};

const fetchRemoteImage = async (url) => {
  let res;
  try {
    res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'FurnishingEssentials/1.0 (+image-import)' },
    });
  } catch {
    throw badRequest('Could not fetch the linked image (timeout or network error)');
  }
  if (!res.ok) throw badRequest(`Could not fetch the linked image (HTTP ${res.status})`);

  const type = String(res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_MIME.has(type)) {
    throw badRequest('Linked image is not a supported image type (jpeg, png, webp, gif, svg)');
  }

  const declared = Number(res.headers.get('content-length') || 0);
  if (declared > MAX_REMOTE_BYTES) throw badRequest('Linked image too large (max 4MB)');

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw badRequest('Linked image is empty');
  if (buf.length > MAX_REMOTE_BYTES) throw badRequest('Linked image too large (max 4MB)');

  return `data:${type};base64,${buf.toString('base64')}`;
};

// Normalizes any admin-supplied image input into something storable in the DB:
//   - uploaded file buffer  -> data URI (base64) via dataUriFromBuffer
//   - http(s) link (Google Images etc.) -> fetched server-side, stored as base64 data URI
//   - existing data URI    -> validated and kept
//   - /uploads/... path    -> kept as-is (seeded local images)
export const resolveImageInput = async (input) => {
  if (input === null || input === undefined || String(input).trim() === '') return null;
  const v = String(input).trim();

  if (v.startsWith('/uploads/')) {
    if (v.includes('..')) throw badRequest('Invalid image path');
    return v;
  }

  if (v.startsWith('data:')) {
    const match = /^data:([^;,]+);base64,/.exec(v);
    if (!match || !ALLOWED_MIME.has(match[1].toLowerCase())) {
      throw badRequest('Invalid image data URI');
    }
    if (v.length > MAX_DATAURI_CHARS) throw badRequest('Image data URI too large (max ~4MB)');
    return v;
  }

  if (/^https?:\/\//i.test(v)) {
    return fetchRemoteImage(v);
  }

  throw badRequest('Image must be an uploaded file, an http(s) image link, or a /uploads/ path');
};
