import { Router } from 'express';
import {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/validate', auth, validateCoupon);
router.get('/', auth, adminOnly, listCoupons);
router.get('/:id', auth, adminOnly, getCoupon);
router.post('/', auth, adminOnly, createCoupon);
router.put('/:id', auth, adminOnly, updateCoupon);
router.delete('/:id', auth, adminOnly, deleteCoupon);

export default router;
