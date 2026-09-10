import { Router } from 'express';
import { register, login, me, updateProfile, changePassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

export default router;
