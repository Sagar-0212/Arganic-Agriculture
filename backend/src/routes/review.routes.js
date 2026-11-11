import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getProductReviews, addProductReview } from '../controllers/review.controller.js';

// mergeParams is required to capture the :productId parameter from the parent router mount
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getProductReviews)
  .post(protect, addProductReview);

export default router;
