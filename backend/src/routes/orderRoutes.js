import { Router } from 'express';
import { listOrders, getOrder, placeOrder, cancelOrder, trackOrder } from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.get('/:id/tracking', trackOrder);
router.post('/', placeOrder);
router.put('/:id/cancel', cancelOrder);

export default router;
