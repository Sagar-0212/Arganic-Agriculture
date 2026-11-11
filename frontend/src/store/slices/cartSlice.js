import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { mockProducts } from '../../services/mockData';

// Helper functions for guest cart & wishlist in localStorage
const getLocalCart = () => {
  try {
    const saved = localStorage.getItem('guest_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalCart = (items) => {
  try {
    localStorage.setItem('guest_cart', JSON.stringify(items));
  } catch (e) {}
};

const getLocalWishlist = () => {
  try {
    const saved = localStorage.getItem('guest_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalWishlist = (items) => {
  try {
    localStorage.setItem('guest_wishlist', JSON.stringify(items));
  } catch (e) {}
};

const calculateTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 1), 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST on organic food items
  return { subtotal, tax };
};

// Calculate distance-based shipping charges from pincode / city / state
export const calculateDistanceShipping = (pincode = '', city = '', state = '', subtotal = 0) => {
  const cleanPin = (pincode || '').toString().trim();
  const cleanCity = (city || '').toLowerCase().trim();
  const cleanState = (state || '').toLowerCase().trim();

  // If subtotal >= 999 -> Free Delivery everywhere!
  if (subtotal >= 999) {
    return { cost: 0, distance: 'All India Free Delivery (Orders > ₹999)', estimatedDays: '2-3 Days' };
  }

  // 1. Local Baramati / Pune hub (Pincodes 41xxxx or Pune/Baramati/Solapur/Satara)
  if (cleanPin.startsWith('41') || cleanCity.includes('pune') || cleanCity.includes('baramati') || cleanCity.includes('solapur') || cleanCity.includes('satara')) {
    if (subtotal >= 499) {
      return { cost: 0, distance: 'Local Zone (Within 50 km)', estimatedDays: '1-2 Days' };
    }
    return { cost: 40, distance: 'Local Zone (Within 50 km)', estimatedDays: '1-2 Days' };
  }

  // 2. Regional Maharashtra (Pincodes 40xxxx, 42xxxx, 43xxxx, 44xxxx or Maharashtra state)
  if (cleanPin.startsWith('40') || cleanPin.startsWith('42') || cleanPin.startsWith('43') || cleanPin.startsWith('44') || cleanState.includes('maharashtra')) {
    return { cost: 70, distance: 'Regional Zone (50 - 250 km)', estimatedDays: '2-3 Days' };
  }

  // 3. Outstation / National Zone (Rest of India)
  return { cost: 120, distance: 'National Zone (250+ km)', estimatedDays: '4-5 Days' };
};

// Async Thunks with seamless Guest / Server fallback
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  try {
    const data = await api.get('/cart');
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return data.cart;
    }
    return { items: getLocalCart() };
  } catch (error) {
    return { items: getLocalCart() };
  }
});

export const addCartItem = createAsyncThunk('cart/addCartItem', async ({ productId, product, quantity = 1 }, thunkAPI) => {
  try {
    const data = await api.post('/cart/items', { productId, quantity });
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return data.cart;
    }
    throw new Error('Using local cart');
  } catch (error) {
    let localItems = getLocalCart();
    let targetProd = product;
    if (!targetProd) {
      const state = thunkAPI.getState();
      targetProd = state.products?.items?.find(p => p._id === productId) || mockProducts.find(p => p._id === productId);
    }
    if (!targetProd) {
      targetProd = { _id: productId, name: 'Organic Product', price: 100, images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800'] };
    }

    const existingIndex = localItems.findIndex(item => (item.product?._id || item._id) === productId);
    if (existingIndex > -1) {
      localItems[existingIndex].quantity += quantity;
    } else {
      localItems.push({
        _id: `cart_${Date.now()}_${Math.random()}`,
        product: targetProd,
        quantity: quantity
      });
    }

    saveLocalCart(localItems);
    return { items: localItems };
  }
});

export const updateCartItemQty = createAsyncThunk('cart/updateCartItemQty', async ({ id, quantity }, thunkAPI) => {
  try {
    const data = await api.put(`/cart/items/${id}`, { quantity });
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return data.cart;
    }
    throw new Error('Using local cart');
  } catch (error) {
    let localItems = getLocalCart();
    const item = localItems.find(i => i._id === id || i.product?._id === id);
    if (item) {
      item.quantity = quantity;
    }
    saveLocalCart(localItems);
    return { items: localItems };
  }
});

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (id, thunkAPI) => {
  try {
    const data = await api.delete(`/cart/items/${id}`);
    if (data && data.cart && Array.isArray(data.cart.items)) {
      return data.cart;
    }
    throw new Error('Using local cart');
  } catch (error) {
    let localItems = getLocalCart().filter(i => i._id !== id && i.product?._id !== id);
    saveLocalCart(localItems);
    return { items: localItems };
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  try {
    const data = await api.post('/cart/clear');
    saveLocalCart([]);
    return data?.cart || { items: [] };
  } catch (error) {
    saveLocalCart([]);
    return { items: [] };
  }
});

// Wishlist Thunks
export const fetchWishlist = createAsyncThunk('cart/fetchWishlist', async (_, thunkAPI) => {
  try {
    const data = await api.get('/wishlist');
    if (data && Array.isArray(data.wishlist)) {
      return data.wishlist;
    }
    return getLocalWishlist();
  } catch (error) {
    return getLocalWishlist();
  }
});

export const toggleWishlistItem = createAsyncThunk('cart/toggleWishlistItem', async ({ productId, product, isInWishlist }, thunkAPI) => {
  try {
    let data;
    if (isInWishlist) {
      data = await api.delete(`/wishlist/${productId}`);
    } else {
      data = await api.post(`/wishlist/${productId}`);
    }
    if (data && Array.isArray(data.wishlist)) {
      return data.wishlist;
    }
    throw new Error('Using local wishlist');
  } catch (error) {
    let wishlist = getLocalWishlist();
    if (isInWishlist) {
      wishlist = wishlist.filter(item => (item._id || item.product?._id) !== productId);
    } else {
      let targetProd = product;
      if (!targetProd) {
        const state = thunkAPI.getState();
        targetProd = state.products?.items?.find(p => p._id === productId) || mockProducts.find(p => p._id === productId);
      }
      if (targetProd && !wishlist.some(item => (item._id || item.product?._id) === productId)) {
        wishlist.push(targetProd);
      }
    }
    saveLocalWishlist(wishlist);
    return wishlist;
  }
});

const initialState = {
  items: getLocalCart(),
  wishlist: getLocalWishlist(),
  loading: false,
  error: null,
  subtotal: calculateTotals(getLocalCart()).subtotal,
  tax: calculateTotals(getLocalCart()).tax,
  shipping: 0,
  total: calculateTotals(getLocalCart()).subtotal + calculateTotals(getLocalCart()).tax,
  checkoutDetails: {
    shippingAddress: null,
    shippingMethod: { name: 'Standard', cost: 0, estimatedDays: '5-7 Days' },
    paymentMethod: 'Cash on Delivery',
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCheckoutAddress: (state, action) => {
      state.checkoutDetails.shippingAddress = action.payload;
    },
    setCheckoutShipping: (state, action) => {
      state.checkoutDetails.shippingMethod = action.payload;
      state.shipping = action.payload.cost;
      state.total = state.subtotal + state.tax + state.shipping;
    },
    setCheckoutPayment: (state, action) => {
      state.checkoutDetails.paymentMethod = action.payload;
    },
    resetCheckout: (state) => {
      state.checkoutDetails = {
        shippingAddress: null,
        shippingMethod: { name: 'Standard', cost: 0, estimatedDays: '5-7 Days' },
        paymentMethod: 'Cash on Delivery',
      };
      state.shipping = 0;
      state.total = state.subtotal + state.tax;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        const { subtotal, tax } = calculateTotals(state.items);
        state.subtotal = subtotal;
        state.tax = tax;
        state.total = subtotal + tax + state.shipping;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add item
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        const { subtotal, tax } = calculateTotals(state.items);
        state.subtotal = subtotal;
        state.tax = tax;
        state.total = subtotal + tax + state.shipping;
      })
      // Update item quantity
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        const { subtotal, tax } = calculateTotals(state.items);
        state.subtotal = subtotal;
        state.tax = tax;
        state.total = subtotal + tax + state.shipping;
      })
      // Remove item
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        const { subtotal, tax } = calculateTotals(state.items);
        state.subtotal = subtotal;
        state.tax = tax;
        state.total = subtotal + tax + state.shipping;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.subtotal = 0;
        state.tax = 0;
        state.total = 0;
      })
      // Wishlist
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload || [];
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.wishlist = action.payload || [];
      });
  }
});

export const { setCheckoutAddress, setCheckoutShipping, setCheckoutPayment, resetCheckout } = cartSlice.actions;
export default cartSlice.reducer;
