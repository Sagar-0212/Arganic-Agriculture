import Product from '../models/product.model.js';
import Review from '../models/review.model.js';
import { mockProducts } from '../utils/mockProducts.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, organic, page = 1, limit = 12, sortBy, search } = req.query;

    let productsList = [];
    let totalCount = 0;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    if (global.dbConnected) {
      const query = { isDeleted: false, status: 'active' };
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (rating) query.rating = { $gte: Number(rating) };
      if (organic) query.organic = organic === 'true';
      if (search) query.$text = { $search: search };

      let sortOptions = { createdAt: -1 };
      if (sortBy === 'price-low') sortOptions = { price: 1 };
      else if (sortBy === 'price-high') sortOptions = { price: -1 };
      else if (sortBy === 'rating') sortOptions = { rating: -1 };
      else if (sortBy === 'reviews') sortOptions = { reviewCount: -1 };

      totalCount = await Product.countDocuments(query);
      if (totalCount > 0) {
        productsList = await Product.find(query).sort(sortOptions).skip(skip).limit(limitNum);
      }
    }

    // Fallback if DB disconnected or 0 products found in MongoDB
    if (productsList.length === 0) {
      let filtered = [...mockProducts];
      if (category) filtered = filtered.filter(p => p.category === category);
      if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
      if (rating) filtered = filtered.filter(p => p.rating >= Number(rating));
      if (organic) filtered = filtered.filter(p => p.organic === (organic === 'true'));
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }

      if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
      else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
      else if (sortBy === 'reviews') filtered.sort((a, b) => b.reviewCount - a.reviewCount);

      totalCount = filtered.length;
      productsList = filtered.slice(skip, skip + limitNum);
    }

    return res.json({
      success: true,
      products: productsList,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum) || 1,
      total: totalCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product details by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    let product = null;
    if (global.dbConnected) {
      product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    }
    if (!product) {
      product = mockProducts.find(p => p._id === req.params.id);
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let relatedProducts = [];
    if (global.dbConnected) {
      relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        isDeleted: false,
        status: 'active'
      }).limit(4);
    }
    if (relatedProducts.length === 0) {
      relatedProducts = mockProducts.filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);
    }

    let reviews = [];
    if (global.dbConnected) {
      reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    }

    return res.json({
      success: true,
      product,
      relatedProducts,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, category, price, comparePrice, stock, images, organic, status } = req.body;

  try {
    const productImages = images && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'
    ];

    let product;
    if (global.dbConnected) {
      product = await Product.create({
        name,
        description,
        category,
        price,
        comparePrice,
        stock,
        images: productImages,
        organic: organic !== undefined ? organic : true,
        status: status || 'active'
      });
    } else {
      product = {
        _id: `p_new_${Date.now()}`,
        name,
        description,
        category,
        price,
        comparePrice,
        stock,
        images: productImages,
        organic: organic !== undefined ? organic : true,
        status: status || 'active',
        rating: 5,
        reviewCount: 0
      };
      mockProducts.unshift(product);
    }

    return res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update product details
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    let product;
    if (global.dbConnected) {
      product = await Product.findById(req.params.id);
    }
    if (!product) {
      product = mockProducts.find(p => p._id === req.params.id);
    }
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fieldsToUpdate = ['name', 'description', 'category', 'price', 'comparePrice', 'stock', 'images', 'organic', 'status'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (global.dbConnected && product.save) {
      await product.save();
    }
    return res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete product (soft delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    if (global.dbConnected) {
      const product = await Product.findById(req.params.id);
      if (product) {
        product.isDeleted = true;
        await product.save();
      }
    }
    const mockIndex = mockProducts.findIndex(p => p._id === req.params.id);
    if (mockIndex !== -1) {
      mockProducts[mockIndex].isDeleted = true;
    }

    return res.json({ success: true, message: 'Product soft-deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update product status
// @route   PATCH /api/admin/products/:id/status
// @access  Private/Admin
export const updateProductStatus = async (req, res) => {
  const { status } = req.body;
  try {
    if (global.dbConnected) {
      const product = await Product.findById(req.params.id);
      if (product) {
        product.status = status;
        await product.save();
      }
    }
    const mockItem = mockProducts.find(p => p._id === req.params.id);
    if (mockItem) {
      mockItem.status = status;
    }

    return res.json({ success: true, message: `Product status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
