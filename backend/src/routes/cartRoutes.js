import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCouponToCart,
} from '../controllers/cartController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);
router.post('/coupon', applyCouponToCart);

export default router;
