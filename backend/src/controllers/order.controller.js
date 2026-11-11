import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// ----------------------------------------------------
// CART HANDLERS
// ----------------------------------------------------

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    return res.json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check inventory
    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock` });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    return res.json({ success: true, message: 'Added to cart', cart: populatedCart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:id
// @access  Private
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const qty = Number(quantity);

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock` });
    }

    item.quantity = qty;
    await cart.save();
    
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    return res.json({ success: true, message: 'Cart updated', cart: populatedCart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    return res.json({ success: true, message: 'Item removed from cart', cart: populatedCart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear entire cart
// @route   POST /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// ORDER HANDLERS
// ----------------------------------------------------

// @desc    Get current user's orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const count = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Verify user ownership or admin status
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { shippingAddress, shippingMethod, items, cartSummary, paymentMethod } = req.body;

  try {
    // 1. Validate inventory stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.isDeleted) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Product ${product.name} has insufficient stock (${product.stock} left)` });
      }
    }

    // 2. Map estimated delivery dates
    let estimatedDays = '5-7 Days';
    if (shippingMethod.name === 'Express') estimatedDays = '2-3 Days';
    else if (shippingMethod.name === 'Overnight') estimatedDays = '1 Day';

    const deliveryDate = new Date();
    const daysToAdd = shippingMethod.name === 'Overnight' ? 1 : (shippingMethod.name === 'Express' ? 3 : 7);
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

    // 3. Map payment details mapping
    let paymentMethodMap = 'COD';
    if (paymentMethod === 'Credit/Debit Card') paymentMethodMap = 'Card';
    else if (paymentMethod === 'Digital Wallets') paymentMethodMap = 'Wallet';
    else if (paymentMethod === 'Net Banking') paymentMethodMap = 'NetBanking';
    else if (paymentMethod === 'UPI') paymentMethodMap = 'UPI';

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      shippingMethod: {
        name: shippingMethod.name,
        cost: shippingMethod.cost,
        estimatedDays
      },
      cartSummary,
      paymentInfo: {
        method: paymentMethodMap,
        status: 'pending'
      },
      estimatedDeliveryDate: deliveryDate
    });

    return res.status(201).json({ success: true, message: 'Order created', orderId: order._id, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// PAYMENTS & RAZORPAY INTEGRATION
// ----------------------------------------------------

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  const { amount, orderId } = req.body;

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId.includes('mock')) {
      // Mock mode
      const mockRazorpayOrderId = `rzp_order_${Math.random().toString(36).substring(2, 11)}`;
      return res.json({
        success: true,
        isMock: true,
        key: 'mock_key_id',
        amount: amount * 100, // in paisa
        currency: 'INR',
        razorpayOrderId: mockRazorpayOrderId,
        orderId
      });
    }

    // Active mode
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(amount * 100), // in paisa
      currency: 'INR',
      receipt: orderId.toString()
    };

    const rzpOrder = await instance.orders.create(options);

    return res.json({
      success: true,
      isMock: false,
      key: keyId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      razorpayOrderId: rzpOrder.id,
      orderId
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let signatureVerified = false;

    if (keySecret.includes('mock')) {
      // Automatically verify in mock mode
      signatureVerified = true;
    } else {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        signatureVerified = true;
      }
    }

    if (!signatureVerified) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 1. Update order payment status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentInfo.status = 'paid';
    order.paymentInfo.razorpayOrderId = razorpay_order_id;
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.orderStatus = 'processing';
    await order.save();

    // 2. Reduce products inventory stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3. Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    console.log(`Payment confirmed for Order ID: ${orderId}`);

    return res.json({
      success: true,
      message: 'Payment verified and order confirmed',
      orderId: order._id
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment status by Order ID
// @route   GET /api/payments/:orderId
// @access  Private
export const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({
      success: true,
      paymentStatus: order.paymentInfo.status,
      orderStatus: order.orderStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// ADMIN ORDER MANAGEMENT
// ----------------------------------------------------

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const count = await Order.countDocuments();
    const orders = await Order.find()
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Order Status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    if (status === 'delivered') {
      order.paymentInfo.status = 'paid'; // Cash on Delivery fulfilled
    }
    await order.save();

    console.log(`Order ${order._id} status updated to: ${status}`);

    return res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add/Update tracking info
// @route   POST /api/admin/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = async (req, res) => {
  const { carrier, trackingNumber, trackingUrl } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.trackingInfo = {
      carrier: carrier || 'Krushi Express',
      trackingNumber,
      trackingUrl
    };
    await order.save();

    return res.json({ success: true, message: 'Tracking details updated successfully', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Initiate refund
// @route   POST /api/admin/orders/:id/refund
// @access  Private/Admin
export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentInfo.status = 'refunded';
    order.orderStatus = 'cancelled';
    await order.save();

    // Return inventory stock back
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    console.log(`Order ${order._id} successfully refunded.`);

    return res.json({ success: true, message: 'Order refunded and cancelled successfully', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// PDF INVOICE DOWNLOAD
// ----------------------------------------------------

// @desc    Download Order Invoice
// @route   GET /api/invoices/:orderId
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access check: User must own it, or be an admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    console.error(`Invoice Generation Failed: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
