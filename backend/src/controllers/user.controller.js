import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    if (global.dbConnected === false) {
      if (req.user && req.user.id === 'admin_mock_id_123456789012') {
        return res.json({ success: true, user: { id: 'admin_mock_id_123456789012', name: 'Sunil Bhosale', email: 'admin@sendriya.org', role: 'admin' } });
      }
      if (req.user && req.user.id === 'cust_mock_id_1234567890123') {
        return res.json({ success: true, user: { id: 'cust_mock_id_1234567890123', name: 'Rahul Patil', email: 'rahul@gmail.com', role: 'customer' } });
      }
      if (req.user && req.user.id === 'mock_new_user_id_123') {
        return res.json({ success: true, user: { id: 'mock_new_user_id_123', name: 'New User', email: 'user@example.com', role: 'customer' } });
      }
      return res.status(404).json({ success: false, message: 'Mock User not found' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must satisfy standard strength criteria'
      });
    }

    user.password = newPassword; // Will hash on save
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newAddress = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      isDefault: req.body.isDefault || false
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();
    return res.status(201).json({ success: true, message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.fullName = req.body.fullName || address.fullName;
    address.phone = req.body.phone || address.phone;
    address.addressLine1 = req.body.addressLine1 || address.addressLine1;
    address.addressLine2 = req.body.addressLine2 !== undefined ? req.body.addressLine2 : address.addressLine2;
    address.city = req.body.city || address.city;
    address.state = req.body.state || address.state;
    address.postalCode = req.body.postalCode || address.postalCode;
    address.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : address.isDefault;

    if (req.body.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.id) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();
    return res.json({ success: true, message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    return res.json({ success: true, message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const count = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update user role / status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone || user.phone;

    await user.save();
    return res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin' && user.email === 'admin@aryamalhar.org') {
      return res.status(400).json({ success: false, message: 'Root Admin cannot be deleted' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create new admin
// @route   POST /api/admin/admins
// @access  Private/Admin
export const createAdminUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const adminUser = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
