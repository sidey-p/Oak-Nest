import { Router } from 'express';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', listAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.put('/:id/default', setDefaultAddress);
router.delete('/:id', deleteAddress);

export default router;
