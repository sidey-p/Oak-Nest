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

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(badRequest('Only image files (jpeg, png, webp, gif, svg) are allowed'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
};

export const publicImageUrl = (req, filename, subfolder) =>
  `${req.protocol}://${req.get('host')}/uploads/${subfolder}/${filename}`;
