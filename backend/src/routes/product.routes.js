import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus
} from '../controllers/product.controller.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/admin', protect, admin, createProduct);
router.put('/admin/:id', protect, admin, updateProduct);
router.delete('/admin/:id', protect, admin, deleteProduct);
router.patch('/admin/:id/status', protect, admin, updateProductStatus);

export default router;
