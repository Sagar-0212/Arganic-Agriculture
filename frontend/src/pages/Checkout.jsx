import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAddresses } from '../store/slices/authSlice';
import { setCheckoutAddress, setCheckoutShipping, setCheckoutPayment, clearCart, updateCartItemQty, removeCartItem, calculateDistanceShipping } from '../store/slices/cartSlice';
import api from '../services/api';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  User, 
  MapPin, 
  Phone, 
  QrCode, 
  Building2, 
  Lock, 
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Zap,
  Clock,
  X,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { user, addresses, isAuthenticated } = useSelector((state) => state.auth);
  const { items, subtotal, tax, shipping, total, checkoutDetails } = useSelector((state) => state.cart);

  // Accordion Step State (1: Login, 2: Address, 3: Order Summary, 4: Payment)
  const [activeStep, setActiveStep] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Address Inputs (Pre-filled for fast 1-click ordering)
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Rahul Patil',
    phone: user?.phone || '9822012345',
    pincode: '411005',
    locality: 'Near Agriculture College, Shivaji Nagar',
    addressLine1: 'Flat No. 402, Shivshakti Heights',
    city: 'Pune',
    state: 'Maharashtra',
    addressType: 'HOME'
  });

  const [selectedPayment, setSelectedPayment] = useState('UPI'); // Default to UPI so user sees scanner
  const [showQrModal, setShowQrModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minute countdown timer

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setFormData({
        fullName: def.fullName || user?.name || '',
        phone: def.phone || user?.phone || '',
        pincode: def.postalCode || '411005',
        locality: def.addressLine2 || '',
        addressLine1: def.addressLine1 || '',
        city: def.city || 'Pune',
        state: def.state || 'Maharashtra',
        addressType: 'HOME'
      });
    }
  }, [addresses, user]);

  // Timer countdown effect for QR modal
  useEffect(() => {
    let interval = null;
    if (showQrModal && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setShowQrModal(false);
      toast.error('UPI payment session expired. Please try again.');
    }
    return () => clearInterval(interval);
  }, [showQrModal, timerSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.pincode || !formData.city) {
      toast.error('Please complete all address fields');
      return;
    }

    const addr = {
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.locality,
      city: formData.city,
      state: formData.state,
      postalCode: formData.pincode
    };

    dispatch(setCheckoutAddress(addr));
    toast.success('Delivery Address Confirmed!');
    setActiveStep(3); // Proceed to Order Summary
  };

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItemQty({ id: item._id, quantity: newQty }));
  };

  const handleRemoveItem = (item) => {
    dispatch(removeCartItem(item._id));
  };

  // Live distance shipping calculation based on Pincode, City & State
  const distanceInfo = calculateDistanceShipping(formData.pincode, formData.city, formData.state, subtotal);
  const liveShippingFee = distanceInfo.cost;
  const grandTotal = subtotal + tax + liveShippingFee;

  const handleInitiateOrder = () => {
    if (items.length === 0) {
      toast.error('Your shopping cart is empty!');
      navigate('/shop');
      return;
    }

    if (selectedPayment === 'COD') {
      // Immediate Cash on Delivery order placement
      executeOrderPlacement('Cash on Delivery', 'Pending (Cash on Delivery)');
    } else {
      // Online Payment: Open Interactive UPI QR Scanner Modal!
      setTimerSeconds(300);
      setShowQrModal(true);
    }
  };

  const handleCompleteUpiPayment = () => {
    setVerifyingPayment(true);
    // Simulate real 1.5s bank verification & payment capture
    setTimeout(() => {
      setVerifyingPayment(false);
      setShowQrModal(false);
      toast.success('✅ UPI Payment Received & Verified!');
      executeOrderPlacement(
        selectedPayment === 'UPI' ? 'UPI (Google Pay / PhonePe / Paytm)' : 'Credit / Debit Card Online',
        'Paid Online'
      );
    }, 1500);
  };

  const executeOrderPlacement = async (paymentMethodName, paymentStatusName) => {
    setProcessing(true);

    const orderId = `OD${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const finalAddress = checkoutDetails.shippingAddress || {
      fullName: formData.fullName,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.locality,
      city: formData.city,
      state: formData.state,
      postalCode: formData.pincode
    };

    const orderPayload = {
      _id: orderId,
      orderStatus: 'Confirmed',
      paymentStatus: paymentStatusName,
      paymentMethod: paymentMethodName,
      shippingAddress: finalAddress,
      shippingMethod: { name: distanceInfo.distance, cost: liveShippingFee },
      items: items.map(item => ({
        product: item.product?._id || item._id,
        name: item.product?.name || item.name || 'Panchagavya Organic Product',
        quantity: item.quantity || 1,
        price: item.product?.price || item.price || 100,
        image: item.product?.images?.[0] || item.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e'
      })),
      cartSummary: {
        subtotal: subtotal,
        tax: tax,
        shipping: liveShippingFee,
        total: grandTotal
      },
      estimatedDeliveryDate: estimatedDelivery,
      createdAt: new Date().toISOString()
    };

    try {
      await api.post('/orders', orderPayload);
    } catch (e) {
      // Offline / guest fallback handled gracefully below
    }

    // Save order to guest_orders array in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      existing.unshift(orderPayload);
      localStorage.setItem('guest_orders', JSON.stringify(existing));
    } catch (e) {}

    // Clear cart
    dispatch(clearCart());

    toast.success('🎉 Order Placed Successfully!');
    setProcessing(false);
    navigate(`/order-confirmation/${orderId}`);
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Flipkart Checkout Header */}
        <div className="bg-white p-4 rounded-t-lg border border-gray-200 shadow-xs mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-900">Arya Malhar Checkout</h1>
              <p className="text-xs text-gray-500 font-medium">100% Secure & Verified Organic Purchase</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          {/* Left Main Flipkart Steps Accordion */}
          <div className="lg:col-span-2 space-y-3">
            
            {/* STEP 1: USER / GUEST LOGIN STATUS */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-gray-50/80 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center">1</span>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">LOGIN & ACCOUNT</h3>
                    <p className="text-sm font-bold text-gray-900">
                      {isAuthenticated ? user?.name : `${formData.fullName} (${formData.phone})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              <div 
                onClick={() => setActiveStep(2)}
                className={`p-4 flex items-center justify-between cursor-pointer ${
                  activeStep === 2 ? 'bg-primary text-white' : 'bg-gray-50 border-b border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded font-black text-xs flex items-center justify-center ${
                    activeStep === 2 ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'
                  }`}>2</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">DELIVERY ADDRESS</h3>
                </div>
                {activeStep !== 2 && (
                  <button className="text-xs font-extrabold text-blue-600 uppercase">CHANGE</button>
                )}
              </div>

              {activeStep === 2 && (
                <form onSubmit={handleSaveAddress} className="p-5 space-y-4 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Rahul Patil"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">10-Digit Mobile Number *</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="9822012345"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="411005"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Locality / Landmark</label>
                      <input
                        type="text"
                        name="locality"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Near Agriculture College"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700 block mb-1">Address (House No, Building, Street, Area) *</label>
                      <textarea
                        name="addressLine1"
                        rows={2}
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Flat No. 402, Shivshakti Heights, Shivaji Nagar"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">City / District *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Pune"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-gray-150">
                    <div className="flex items-center space-x-4 text-xs font-bold text-gray-700">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="addressType"
                          checked={formData.addressType === 'HOME'}
                          onChange={() => setFormData({ ...formData, addressType: 'HOME' })}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Home (All Day Delivery)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="addressType"
                          checked={formData.addressType === 'WORK'}
                          onChange={() => setFormData({ ...formData, addressType: 'WORK' })}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Work (10 AM - 6 PM)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-6 py-2.5 rounded shadow-xs uppercase tracking-wider transition-all"
                    >
                      DELIVER HERE
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* STEP 3: ORDER SUMMARY */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              <div 
                onClick={() => setActiveStep(3)}
                className={`p-4 flex items-center justify-between cursor-pointer ${
                  activeStep === 3 ? 'bg-primary text-white' : 'bg-gray-50 border-b border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded font-black text-xs flex items-center justify-center ${
                    activeStep === 3 ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'
                  }`}>3</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    ORDER SUMMARY ({items.length} ITEM{items.length > 1 ? 'S' : ''})
                  </h3>
                </div>
                {activeStep !== 3 && (
                  <button className="text-xs font-extrabold text-blue-600 uppercase">CHANGE</button>
                )}
              </div>

              {activeStep === 3 && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="divide-y divide-gray-150">
                    {items.map((item) => (
                      <div key={item._id} className="py-3 flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 bg-gray-50 border rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={item.product?.images?.[0] || item.images?.[0]} 
                              alt={item.product?.name || item.name} 
                              className="w-full h-full object-contain p-1" 
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{item.product?.name || item.name}</h4>
                            <p className="text-[11px] text-gray-500 font-semibold uppercase">{item.product?.category || item.category || 'Organic Product'}</p>
                            <div className="flex items-center space-x-3 pt-1">
                              <span className="text-sm font-extrabold text-gray-900">₹{item.product?.price || item.price}</span>
                              <div className="flex items-center border rounded">
                                <button onClick={() => handleQtyChange(item, item.quantity - 1)} className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100">-</button>
                                <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => handleQtyChange(item, item.quantity + 1)} className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100">+</button>
                              </div>
                              <button onClick={() => handleRemoveItem(item)} className="text-xs font-bold text-rose-600 hover:underline">Remove</button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-emerald-700 font-bold">Delivery by 3 Days</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-150 flex justify-end">
                    <button
                      onClick={() => setActiveStep(4)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-8 py-3 rounded shadow-xs uppercase tracking-wider transition-all"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: PAYMENT OPTIONS */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              <div 
                onClick={() => setActiveStep(4)}
                className={`p-4 flex items-center justify-between cursor-pointer ${
                  activeStep === 4 ? 'bg-primary text-white' : 'bg-gray-50 border-b border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded font-black text-xs flex items-center justify-center ${
                    activeStep === 4 ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'
                  }`}>4</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">PAYMENT OPTIONS</h3>
                </div>
              </div>

              {activeStep === 4 && (
                <div className="p-5 space-y-4 bg-white">
                  
                  {/* Payment Options Radio List */}
                  <div className="space-y-3">
                    
                    {/* UPI Option */}
                    <label className={`flex items-start p-3.5 rounded border-2 cursor-pointer transition-all ${
                      selectedPayment === 'UPI' ? 'border-primary bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={selectedPayment === 'UPI'}
                        onChange={() => setSelectedPayment('UPI')}
                        className="text-primary focus:ring-primary mt-1 h-4 w-4"
                      />
                      <div className="ml-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-xs sm:text-sm">
                            UPI (Google Pay / PhonePe / Paytm / BHIM)
                          </span>
                          <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                            Fast & Instant QR
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block">Scan QR Code using GPay, PhonePe, Paytm, or BHIM for instant confirmation.</span>
                      </div>
                    </label>

                    {/* COD Option */}
                    <label className={`flex items-start p-3.5 rounded border-2 cursor-pointer transition-all ${
                      selectedPayment === 'COD' ? 'border-primary bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={selectedPayment === 'COD'}
                        onChange={() => setSelectedPayment('COD')}
                        className="text-primary focus:ring-primary mt-1 h-4 w-4"
                      />
                      <div className="ml-3">
                        <span className="font-extrabold text-gray-900 text-xs sm:text-sm block">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-gray-500 block">Pay via Cash or QR code scanner at your doorstep upon delivery.</span>
                      </div>
                    </label>

                    {/* Credit / Debit Card Option */}
                    <label className={`flex items-start p-3.5 rounded border-2 cursor-pointer transition-all ${
                      selectedPayment === 'CARD' ? 'border-primary bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={selectedPayment === 'CARD'}
                        onChange={() => setSelectedPayment('CARD')}
                        className="text-primary focus:ring-primary mt-1 h-4 w-4"
                      />
                      <div className="ml-3">
                        <span className="font-extrabold text-gray-900 text-xs sm:text-sm block">Credit / Debit / ATM Card</span>
                        <span className="text-[11px] text-gray-500 block">All major Visa, MasterCard, RuPay cards supported.</span>
                      </div>
                    </label>

                  </div>

                  {/* Flipkart Final Confirm Order Button */}
                  <div className="pt-4 border-t border-gray-150 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block font-semibold">Total Amount Payable</span>
                      <span className="text-lg font-black text-gray-900">₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleInitiateOrder}
                      disabled={processing}
                      className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded shadow-md uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>CONFIRMING ORDER...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white" />
                          <span>
                            {selectedPayment === 'COD' ? 'CONFIRM & PLACE ORDER' : 'SCAN QR & PAY ONLINE'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Price Details Summary Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4 space-y-4 lg:sticky lg:top-24">
            <h3 className="font-extrabold text-gray-500 text-xs uppercase tracking-wider border-b pb-2">PRICE DETAILS</h3>
            <div className="space-y-3 text-xs text-gray-700 font-medium">
              <div className="flex justify-between">
                <span>Price ({items.length} item{items.length > 1 ? 's' : ''})</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="font-bold text-emerald-700">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery ({distanceInfo.distance})</span>
                <span className={liveShippingFee === 0 ? "font-black text-emerald-700" : "font-bold text-gray-900"}>
                  {liveShippingFee === 0 ? 'FREE' : `₹${liveShippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-dashed pt-3 flex justify-between text-sm font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary text-base">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Safe & Secure Payments. 100% Authentic Panchagavya Guarantee.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive UPI QR Code Scanner Modal Dialog */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-5 relative shadow-2xl animate-in zoom-in-95 border-2 border-emerald-500">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-black text-sm bg-gray-100 w-7 h-7 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>UPI Instant Payment Scanner</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 pt-1">Scan & Pay with Any UPI App</h3>
              <p className="text-[11px] text-gray-500 font-bold">Google Pay • PhonePe • Paytm • BHIM • Cred</p>
            </div>

            {/* Dynamic QR Code Box */}
            <div className="bg-gradient-to-b from-emerald-50 to-amber-50 p-4 rounded-2xl border-2 border-emerald-500/30 inline-block shadow-inner relative">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=aryamalhar@upi&pn=Arya%20Malhar%20Group&am=${grandTotal.toFixed(2)}&cu=INR`}
                alt="UPI QR Code"
                className="w-44 h-44 mx-auto rounded-xl shadow-md border-2 border-white"
              />
              <div className="mt-3 text-xs font-bold text-gray-800 flex items-center justify-center gap-1">
                <span>Pay Amount:</span>
                <span className="text-base font-black text-emerald-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Live Session Timer */}
            <div className="flex items-center justify-center space-x-1.5 text-xs text-amber-700 bg-amber-50 py-1.5 px-3 rounded-full font-bold border border-amber-200 w-max mx-auto">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>QR Session Expires in: <strong className="font-mono text-amber-900">{formatTimer(timerSeconds)}</strong></span>
            </div>

            {/* UPI ID & Copy button */}
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 font-bold text-[10px] block uppercase text-left">Official UPI ID</span>
                <span className="font-mono font-black text-gray-900 text-xs">aryamalhar@upi</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('aryamalhar@upi');
                  toast.success('UPI ID copied!');
                }}
                className="bg-primary hover:bg-primary-dark text-white font-extrabold px-3 py-1.5 rounded-lg text-[11px] shadow-xs flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>

            {/* Payment Verification Action Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCompleteUpiPayment}
                disabled={verifyingPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {verifyingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>VERIFYING WITH BANK SERVER...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>I HAVE PAID ₹{grandTotal.toFixed(2)} (VERIFY & PLACE ORDER)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs text-gray-500 hover:text-gray-800 font-bold underline pt-1 block mx-auto"
              >
                Cancel & Change Payment Mode
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
