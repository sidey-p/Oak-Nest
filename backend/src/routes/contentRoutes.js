import { Router } from 'express';
import {
  getPublicContent,
  listActiveTestimonials,
  updateContent,
  listAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/contentController.js';
import { auth, adminOnly } from '../middleware/auth.js';
import { makeMemoryUploader } from '../middleware/upload.js';

const router = Router();
const upload = makeMemoryUploader();

// Public — storefront content + active testimonials
router.get('/content', getPublicContent);
router.get('/testimonials', listActiveTestimonials);

// Admin — site content
router.put('/content', auth, adminOnly, upload.single('hero_image_file'), updateContent);

// Admin — testimonials
router.get('/admin/testimonials', auth, adminOnly, listAllTestimonials);
router.post('/admin/testimonials', auth, adminOnly, upload.single('avatar_file'), createTestimonial);
router.put('/admin/testimonials/:id', auth, adminOnly, upload.single('avatar_file'), updateTestimonial);
router.delete('/admin/testimonials/:id', auth, adminOnly, deleteTestimonial);

export default router;
