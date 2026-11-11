import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';

const router = express.Router();

router.route('/')
  .get(protect, getWishlist);

router.route('/:productId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

export default router;
