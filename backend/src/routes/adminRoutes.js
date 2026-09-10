import { Router } from 'express';
import {
  dashboardStats,
  listUsers,
  toggleUserActive,
  listAllOrders,
  updateOrderStatus,
  listPayments,
  listShipments,
  updateShipment,
  listAllReviews,
  moderateReview,
  deleteReviewAdmin,
} from '../controllers/adminController.js';
import { auth, adminOnly } from '../middleware/auth.js';
import { listFeedback, updateFeedbackStatus, deleteFeedback } from '../controllers/feedbackController.js';

const router = Router();
router.use(auth, adminOnly);

router.get('/dashboard', dashboardStats);

router.get('/users', listUsers);
router.put('/users/:id/toggle-active', toggleUserActive);

router.get('/orders', listAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/payments', listPayments);

router.get('/shipments', listShipments);
router.put('/shipments/:id', updateShipment);

router.get('/reviews', listAllReviews);
router.put('/reviews/:id/status', moderateReview);
router.delete('/reviews/:id', deleteReviewAdmin);

router.get('/feedback', listFeedback);
router.put('/feedback/:id/status', updateFeedbackStatus);
router.delete('/feedback/:id', deleteFeedback);

export default router;
