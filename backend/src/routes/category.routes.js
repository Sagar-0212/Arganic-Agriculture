import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.post('/admin', protect, admin, createCategory);
router.put('/admin/:id', protect, admin, updateCategory);
router.delete('/admin/:id', protect, admin, deleteCategory);

export default router;
