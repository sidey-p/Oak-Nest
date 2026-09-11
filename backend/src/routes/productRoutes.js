import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  addProductImage,
  listMaterials,
  listBrands,
} from '../controllers/productController.js';
import { auth, adminOnly, optionalAuth } from '../middleware/auth.js';
import { makeMemoryUploader } from '../middleware/upload.js';

const router = Router();
const upload = makeMemoryUploader();

router.get('/', optionalAuth, listProducts);
router.get('/meta/materials', listMaterials);
router.get('/meta/brands', listBrands);
router.get('/:id', optionalAuth, getProduct);
router.post('/', auth, adminOnly, upload.single('image'), createProduct);
router.put('/:id', auth, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', auth, adminOnly, deleteProduct);
router.put('/:id/stock', auth, adminOnly, updateStock);
router.post('/:id/images', auth, adminOnly, upload.single('image'), addProductImage);

export default router;
