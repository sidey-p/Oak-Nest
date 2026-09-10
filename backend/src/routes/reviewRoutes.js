import { Router } from 'express';
import {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/products/:id/reviews', optionalAuth, listProductReviews);
router.post('/products/:id/reviews', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

export default router;
