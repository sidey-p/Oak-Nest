import { Router } from 'express';
import {
  createRequest,
  listMyRequests,
  listAllRequests,
  getRequest,
  updateRequest,
} from '../controllers/customDesignController.js';
import { auth, adminOnly, optionalAuth } from '../middleware/auth.js';
import { makeUploader } from '../middleware/upload.js';

const router = Router();
const upload = makeUploader('custom-designs');

router.post('/', optionalAuth, upload.single('reference_image'), createRequest);
router.get('/mine', auth, listMyRequests);

// Admin
router.get('/', auth, adminOnly, listAllRequests);
router.get('/:id', auth, getRequest);
router.put('/:id', auth, adminOnly, updateRequest);

export default router;
