import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { getTestimonials, createTestimonial, deleteTestimonial } from '../controllers/testimonial.controller.js';

const router = express.Router();

router.get('/', getTestimonials);
router.post('/admin', protect, admin, createTestimonial);
router.delete('/admin/:id', protect, admin, deleteTestimonial);

export default router;
