import Review from '../models/review.model.js';
import Product from '../models/product.model.js';

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1. Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user.id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // 2. Create the review
    const review = await Review.create({
      product: productId,
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      title,
      comment
    });

    // 3. Recalculate average rating
    const reviews = await Review.find({ product: productId });
    product.reviewCount = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    return res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
