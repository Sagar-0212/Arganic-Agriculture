import User from '../models/user.model.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    return res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    const populatedUser = await User.findById(req.user.id).populate('wishlist');
    return res.json({ success: true, message: 'Added to wishlist', wishlist: populatedUser.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    const populatedUser = await User.findById(req.user.id).populate('wishlist');
    return res.json({ success: true, message: 'Removed from wishlist', wishlist: populatedUser.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
