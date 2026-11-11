import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCart, updateCartItemQty, removeCartItem, clearCart } from '../store/slices/cartSlice';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, subtotal, tax, total, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Promo code
  const [promoCode, setPromoCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);

  React.useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQtyChange = (item, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItemQty({ id: item._id, quantity: newQty }))
      .unwrap()
      .catch((err) => toast.error(err || 'Failed to update quantity'));
  };

  const handleRemove = (item) => {
    dispatch(removeCartItem(item._id))
      .unwrap()
      .then(() => toast.success(`${item.product?.name || item.name || 'Product'} removed`))
      .catch((err) => toast.error(err || 'Failed to remove item'));
  };

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'ORGANIC10') {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success('10% organic discount applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-6 bg-white p-8 border rounded-3xl shadow-sm">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-earth-900">Your shopping cart is empty</h2>
          <p className="text-earth-650 text-sm">Add pesticide-free fruits, Indrayani rice, or organic manure to start.</p>
        </div>
        <Link to="/shop" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-all shadow">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-primary mb-8 flex items-center gap-2">
        <ShoppingBag className="h-7 w-7 text-secondary" /> Shopping Cart ({items.length} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-earth-200/60 shadow-sm overflow-hidden divide-y divide-earth-150">
            {items.map((item) => (
              <div key={item._id} className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-earth-50 rounded-xl overflow-hidden flex-shrink-0 border border-earth-150">
                    <img 
                      src={item.product?.images?.[0]} 
                      alt={item.product?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-earth-900 text-sm sm:text-base">{item.product?.name}</h3>
                    <span className="text-xs text-earth-500 uppercase font-semibold">{item.product?.category}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-earth-300 rounded-lg overflow-hidden bg-earth-50">
                    <button 
                      onClick={() => handleQtyChange(item, item.quantity - 1)}
                      className="px-2.5 py-1 hover:bg-earth-150 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-bold text-earth-900">{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item, item.quantity + 1)}
                      className="px-2.5 py-1 hover:bg-earth-150 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-primary text-sm sm:text-base">₹{(item.product?.price * item.quantity).toFixed(2)}</div>
                    <div className="text-xs text-earth-450">₹{item.product?.price} each</div>
                  </div>

                  <button 
                    onClick={() => handleRemove(item)}
                    className="text-earth-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => dispatch(clearCart())} className="text-xs font-bold text-red-500 hover:text-red-700 underline pl-2">
            Clear Shopping Cart
          </button>
        </div>

        {/* Right Column: Calculations */}
        <div className="bg-white p-6 rounded-3xl border border-earth-200/60 shadow-sm space-y-6">
          <h3 className="font-extrabold text-primary text-lg border-b border-earth-150 pb-4">Order Summary</h3>
          
          <div className="space-y-3.5 text-sm text-earth-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="font-bold">₹{tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-secondary">
                <span>Promo Discount:</span>
                <span className="font-bold">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-earth-800">
              <span>Estimated Shipping:</span>
              <span className="font-bold">Calculated next</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-primary border-t border-earth-150 pt-4">
              <span>Total Price:</span>
              <span>₹{(total - discount).toFixed(2)}</span>
            </div>
          </div>

          {/* Promo code input */}
          <form onSubmit={applyPromo} className="flex gap-2 border-t border-earth-150 pt-4">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo Code (ORGANIC10)"
              className="w-full px-3.5 py-2 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="bg-earth-100 hover:bg-earth-200 border border-earth-300 font-bold px-4 py-2 rounded-xl text-xs">
              Apply
            </button>
          </form>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow flex items-center justify-center space-x-2 text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
