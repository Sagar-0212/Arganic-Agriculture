import express from 'express';
import { 
  getFaqs, 
  createFaq, 
  updateFaq, 
  deleteFaq, 
  askChatbot 
} from '../controllers/faq.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getFaqs);
router.post('/chatbot/ask', askChatbot);

// Admin protected routes
router.post('/', protect, admin, createFaq);
router.put('/:id', protect, admin, updateFaq);
router.delete('/:id', protect, admin, deleteFaq);

export default router;
