import { Router } from 'express';
import { submitFeedback, listMyFeedback, listFeedback, updateFeedbackStatus, deleteFeedback } from '../controllers/feedbackController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', auth, submitFeedback);
router.get('/mine', auth, listMyFeedback);

// Admin
router.get('/admin/feedback', auth, adminOnly, listFeedback);
router.put('/admin/feedback/:id', auth, adminOnly, updateFeedbackStatus);
router.delete('/admin/feedback/:id', auth, adminOnly, deleteFeedback);

export default router;
