import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getMyOrders,
  getOrderById,
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  getAdminOrders,
  updateOrderStatus,
  updateOrderTracking,
  refundOrder,
  downloadInvoice
} from '../controllers/order.controller.js';

const router = express.Router();

// Cart routes
router.get('/cart', protect, getCart);
router.post('/cart/items', protect, addToCart);
router.put('/cart/items/:id', protect, updateCartItem);
router.delete('/cart/items/:id', protect, removeFromCart);
router.post('/cart/clear', protect, clearCart);

// Order routes
router.get('/orders', protect, getMyOrders);
router.get('/orders/:id', protect, getOrderById);
router.post('/orders', protect, createOrder);

// Payments routes
router.post('/payments/razorpay/order', protect, createRazorpayOrder);
router.post('/payments/razorpay/verify', protect, verifyRazorpayPayment);
router.get('/payments/:orderId', protect, getPaymentStatus);

// Invoices route
router.get('/invoices/:orderId', protect, downloadInvoice);

// Admin-only order management routes
router.get('/admin/orders', protect, admin, getAdminOrders);
router.patch('/orders/:id/status', protect, admin, updateOrderStatus);
router.post('/admin/orders/:id/tracking', protect, admin, updateOrderTracking);
router.post('/admin/orders/:id/refund', protect, admin, refundOrder);

export default router;
