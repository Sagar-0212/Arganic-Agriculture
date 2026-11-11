import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import { mockCategories } from '../utils/mockProducts.js';

// @desc    Get all categories with active product count
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    let categoriesList = [];
    if (global.dbConnected) {
      const categories = await Category.find().sort({ name: 1 });
      if (categories.length > 0) {
        categoriesList = await Promise.all(
          categories.map(async (category) => {
            const count = await Product.countDocuments({ 
              category: category.slug, 
              isDeleted: false,
              status: 'active' 
            });
            return {
              ...category.toObject(),
              productCount: count
            };
          })
        );
      }
    }

    if (categoriesList.length === 0) {
      categoriesList = mockCategories;
    }

    return res.json({ success: true, categories: categoriesList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category details by Slug or ID
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    let category = null;
    let products = [];
    if (global.dbConnected) {
      category = await Category.findOne({ slug: req.params.slug });
      if (category) {
        products = await Product.find({ 
          category: category.slug, 
          isDeleted: false, 
          status: 'active' 
        });
      }
    }

    if (!category) {
      category = mockCategories.find(c => c.slug === req.params.slug);
    }
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, category, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, description, image } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let category;
    if (global.dbConnected) {
      const categoryExists = await Category.findOne({ slug });
      if (categoryExists) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
      }
      category = await Category.create({ name, slug, description, image });
    } else {
      category = {
        _id: `cat_${Date.now()}`,
        name,
        slug,
        description,
        image,
        productCount: 0
      };
      mockCategories.push(category);
    }
    return res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    let category;
    if (global.dbConnected) {
      category = await Category.findById(req.params.id);
    }
    if (!category) {
      category = mockCategories.find(c => c._id === req.params.id);
    }
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.image = req.body.image || category.image;

    if (req.body.name) {
      category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (global.dbConnected && category.save) {
      await category.save();
    }
    return res.json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    if (global.dbConnected) {
      await Category.findByIdAndDelete(req.params.id);
    }
    const index = mockCategories.findIndex(c => c._id === req.params.id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
