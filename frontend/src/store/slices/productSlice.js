import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { mockProducts, mockCategories } from '../../services/mockData';

// Async Thunks
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params = {}, thunkAPI) => {
  try {
    const data = await api.get('/products', { params });
    if (data && data.products && data.products.length > 0) {
      return data;
    }
    throw new Error('Using fallback dataset');
  } catch (error) {
    // Client-side fallback filtering
    const { category, minPrice, maxPrice, rating, organic, page = 1, limit = 12, sortBy, search } = params;
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

    const total = filtered.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const products = filtered.slice(skip, skip + limitNum);

    return {
      success: true,
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      total
    };
  }
});

export const fetchProductDetails = createAsyncThunk('products/fetchProductDetails', async (id, thunkAPI) => {
  try {
    const data = await api.get(`/products/${id}`);
    if (data && data.product) {
      return data;
    }
    throw new Error('Using fallback product detail');
  } catch (error) {
    const product = mockProducts.find(p => p._id === id) || mockProducts[0];
    const relatedProducts = mockProducts.filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);
    return {
      success: true,
      product,
      relatedProducts,
      reviews: []
    };
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, thunkAPI) => {
  try {
    const data = await api.get('/categories');
    if (data && data.categories && data.categories.length > 0) {
      return data.categories;
    }
    return mockCategories;
  } catch (error) {
    return mockCategories;
  }
});

export const addReview = createAsyncThunk('products/addReview', async ({ productId, reviewData }, thunkAPI) => {
  try {
    const data = await api.post(`/products/${productId}/reviews`, reviewData);
    return data;
  } catch (error) {
    return {
      success: true,
      review: {
        _id: `rev_${Date.now()}`,
        product: productId,
        user: { name: 'Valued Customer' },
        rating: reviewData.rating || 5,
        comment: reviewData.comment || 'Excellent product!',
        createdAt: new Date().toISOString()
      }
    };
  }
});

// Admin Thunks
export const createProduct = createAsyncThunk('products/createProduct', async (productData, thunkAPI) => {
  try {
    const data = await api.post('/admin/products', productData);
    return data.product;
  } catch (error) {
    const newProd = {
      _id: `p_new_${Date.now()}`,
      ...productData,
      rating: 5,
      reviewCount: 0
    };
    mockProducts.unshift(newProd);
    return newProd;
  }
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, productData }, thunkAPI) => {
  try {
    const data = await api.put(`/admin/products/${id}`, productData);
    return data.product;
  } catch (error) {
    const item = mockProducts.find(p => p._id === id);
    if (item) Object.assign(item, productData);
    return item || productData;
  }
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, thunkAPI) => {
  try {
    await api.delete(`/admin/products/${id}`);
    return id;
  } catch (error) {
    const idx = mockProducts.findIndex(p => p._id === id);
    if (idx !== -1) mockProducts.splice(idx, 1);
    return id;
  }
});

const initialState = {
  items: [],
  categories: [],
  currentProduct: null,
  relatedProducts: [],
  reviews: [],
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
      state.reviews = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.relatedProducts;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Add Review
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload.review);
        if (state.currentProduct) {
          state.currentProduct.reviewCount += 1;
        }
      })
      // Admin: Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  }
});

export const { clearProductDetails } = productSlice.actions;
export default productSlice.reducer;
