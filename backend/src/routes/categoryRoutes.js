import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', auth, adminOnly, createCategory);
router.put('/:id', auth, adminOnly, updateCategory);
router.delete('/:id', auth, adminOnly, deleteCategory);

export default router;
