import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const data = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const data = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    return null;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
  try {
    const data = await api.get('/users/profile');
    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const data = await api.put('/users/profile', profileData);
    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchAddresses = createAsyncThunk('auth/fetchAddresses', async (_, thunkAPI) => {
  try {
    const data = await api.get('/users/addresses');
    return data.addresses;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const addNewAddress = createAsyncThunk('auth/addNewAddress', async (addressData, thunkAPI) => {
  try {
    const data = await api.post('/users/addresses', addressData);
    return data.addresses;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const removeAddress = createAsyncThunk('auth/removeAddress', async (addressId, thunkAPI) => {
  try {
    const data = await api.delete(`/users/addresses/${addressId}`);
    return data.addresses;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  addresses: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.addresses = [];
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Addresses
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
