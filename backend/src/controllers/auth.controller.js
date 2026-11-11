import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Helper to generate access and refresh tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'super_secret_jwt_access_token_key_12345', 
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id }, 
    process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_token_key_67890', 
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (global.dbConnected === false) {
      const { accessToken, refreshToken } = generateTokens('mock_new_user_id_123');
      res.cookie('refreshToken', refreshToken, { httpOnly: true });
      res.cookie('accessToken', accessToken, { httpOnly: true });
      return res.status(201).json({
        success: true,
        message: 'Registration successful (Mock Mode)',
        token: accessToken,
        user: { id: 'mock_new_user_id_123', name, email, phone, role: 'customer' }
      });
    }

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // 2. Validate password strength
    if (password.length < 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 4 characters long.' 
      });
    }

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password, // Pre-save hook hashes this
      phone
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if database is offline (mock mode)
    if (global.dbConnected === false) {
      if ((email === 'admin@sendriya.org' || email === 'admin@aryamalhar.org') && password === 'Password@123') {
        const { accessToken, refreshToken } = generateTokens('admin_mock_id_123456789012');
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.cookie('accessToken', accessToken, { httpOnly: true });
        return res.json({
          success: true,
          message: 'Login successful (Mock Mode)',
          token: accessToken,
          user: { id: 'admin_mock_id_123456789012', name: 'Sunil Bhosale', email, role: 'admin' }
        });
      } else {
        // Allow any other email to login as a generic user in mock mode
        const { accessToken, refreshToken } = generateTokens('mock_new_user_id_123');
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.cookie('accessToken', accessToken, { httpOnly: true });
        return res.json({
          success: true,
          message: 'Login successful (Mock Mode - Generic User)',
          token: accessToken,
          user: { id: 'mock_new_user_id_123', name: 'Mock User', email: email, role: 'customer' }
        });
      }
    }

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 2. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Also optional access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15m
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Session expired, refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_token_key_67890');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User associated with token not found' });
    }

    const { accessToken } = generateTokens(user._id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    return res.json({
      success: true,
      token: accessToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  return res.json({ success: true, message: 'Logged out successfully' });
};
