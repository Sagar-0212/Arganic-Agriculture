import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Download, Home, ShoppingCart, Truck, ShieldCheck, Printer } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try fetching from API first
    api.get(`/orders/${id}`)
      .then(res => {
        if (res && res.order) {
          setOrder(res.order);
        } else {
          throw new Error('Order not found on server');
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local guest orders saved in localStorage
        try {
          const savedOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
          const found = savedOrders.find(o => o._id === id);
          if (found) {
            setOrder(found);
          } else if (savedOrders.length > 0) {
            setOrder(savedOrders[0]);
          }
        } catch (e) {}
        setLoading(false);
      });
  }, [id]);

  const handleDownloadInvoice = () => {
    toast.promise(
      api.get(`/invoices/${id}`, { responseType: 'blob' })
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Invoice-${id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        })
        .catch(() => {
          // Printable Browser Invoice Fallback
          window.print();
        }),
      {
        loading: 'Generating Invoice PDF...',
        success: 'Invoice ready!',
        error: 'Printing browser invoice preview...'
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 border rounded-2xl shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Order Confirmation</h2>
        <p className="text-sm text-gray-600">Your order has been received successfully!</p>
        <button onClick={() => navigate('/shop')} className="w-full bg-primary text-white font-bold py-3 rounded-xl">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
        
        {/* Success Checkmark Banner */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Order Placed Successfully!</h1>
            <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto">
              Thank you for shopping with <strong className="text-primary font-bold">Arya Malhar Group of Companies</strong>. 
              Your organic Panchagavya order is confirmed.
            </p>
          </div>
        </div>

        {/* Flipkart Order Info Details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-left space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Order ID</span>
              <span className="font-extrabold text-sm sm:text-base text-gray-900 uppercase">#{order._id}</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              {order.orderStatus || 'Confirmed'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700">
            <div>
              <span className="text-gray-400 block font-semibold text-[11px]">Payment Mode</span>
              <span className="font-bold text-gray-900">{order.paymentMethod || 'Cash on Delivery'}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold text-[11px]">Estimated Delivery</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Truck className="w-4 h-4 inline" />
                {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold text-[11px]">Total Paid Amount</span>
              <span className="font-black text-base text-gray-900">₹{(order.cartSummary?.total || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold text-[11px]">Items Quantity</span>
              <span className="font-bold text-gray-900">{order.items?.length || 1} Item(s)</span>
            </div>
          </div>

          {/* Delivery Address Block */}
          {order.shippingAddress && (
            <div className="border-t pt-3 space-y-1 text-xs text-gray-700">
              <span className="text-gray-400 font-extrabold uppercase tracking-wider text-[10px] block mb-1">Shipping Address</span>
              <p className="font-bold text-gray-900">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
              <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 || ''}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            </div>
          )}

          {/* Line Items List */}
          {order.items && order.items.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <span className="text-gray-400 font-extrabold uppercase tracking-wider text-[10px] block">Items Ordered</span>
              <div className="divide-y divide-gray-100 bg-gray-50/50 rounded-lg p-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded border bg-white" />}
                      <span className="font-bold text-gray-900 truncate max-w-xs">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">Qty: {item.quantity} × ₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
          <button 
            onClick={handleDownloadInvoice}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-extrabold py-3 px-8 rounded-lg transition-all shadow-xs flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </button>
          <button 
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
