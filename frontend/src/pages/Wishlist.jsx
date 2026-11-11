import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWishlist, toggleWishlistItem, addCartItem } from '../store/slices/cartSlice';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { wishlist, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  React.useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addCartItem({ productId: product._id, product, quantity: 1 }))
      .unwrap()
      .then(() => toast.success(`${product.name} added to cart!`))
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const handleRemove = (product) => {
    dispatch(toggleWishlistItem({ productId: product._id, product, isInWishlist: true }))
      .unwrap()
      .then(() => toast.success('Removed from wishlist'));
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center space-y-6 bg-white p-8 border rounded-3xl shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-earth-900">Your wishlist is empty</h2>
          <p className="text-earth-650 text-sm">Save items you plan to buy later by tapping the heart icon on any card.</p>
        </div>
        <Link to="/shop" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-all shadow">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-primary mb-8 flex items-center gap-2">
        <Heart className="h-7 w-7 text-red-500 fill-red-500" /> My Wishlist ({wishlist.length} products)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div 
            key={product._id} 
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-earth-200/60 flex flex-col justify-between"
          >
            <div className="relative group overflow-hidden h-48 bg-earth-50 cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
              <img 
                src={product.images?.[0]} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-5 flex-grow space-y-2">
              <span className="text-xs text-earth-500 uppercase tracking-widest">{product.category}</span>
              <h3 
                onClick={() => navigate(`/product/${product._id}`)}
                className="font-bold text-earth-900 line-clamp-1 hover:text-primary transition-colors cursor-pointer"
              >
                {product.name}
              </h3>
              <div className="font-bold text-primary">₹{product.price}</div>
            </div>

            <div className="p-5 pt-0 border-t border-earth-100 flex gap-2">
              <button 
                onClick={() => handleAddToCart(product)}
                className="w-full flex items-center justify-center space-x-1.5 bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-xl transition-all text-xs shadow-sm"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={() => handleRemove(product)}
                className="border border-earth-300 hover:border-red-400 hover:text-red-500 p-2 rounded-xl transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
