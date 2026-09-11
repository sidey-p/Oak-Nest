import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { badRequest } from './errors.js';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(badRequest('Only image files (jpeg, png, webp, gif, svg) are allowed'));
  }
};

export const makeUploader = (subfolder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads', subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
};

// Images kept in memory as a base64 data URI and stored directly in the DB.
export const makeMemoryUploader = () =>
  multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Relative URL works for both local dev (frontend proxies /uploads to
// the backend) and the Vercel deployment (images live in the frontend).
export const publicImageUrl = (req, filename, subfolder) =>
  `/uploads/${subfolder}/${filename}`;
