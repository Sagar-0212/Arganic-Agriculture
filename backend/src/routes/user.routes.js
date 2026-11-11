import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  createAdminUser
} from '../controllers/user.controller.js';

const router = express.Router();

// User profile and addresses
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/password', protect, changePassword);

router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

// Admin-only user management routes
router.route('/admin')
  .get(protect, admin, getAdminUsers)
  .post(protect, admin, createAdminUser);

router.route('/admin/:id')
  .get(protect, admin, getAdminUserById)
  .put(protect, admin, updateAdminUser)
  .delete(protect, admin, deleteAdminUser);

export default router;
