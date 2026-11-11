import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductDetails, addReview, clearProductDetails } from '../store/slices/productSlice';
import { addCartItem, toggleWishlistItem, calculateDistanceShipping } from '../store/slices/cartSlice';
import { Heart, ShoppingCart, Share2, Award, ShieldAlert, Star, Zap, Truck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux store
  const { currentProduct: product, relatedProducts, reviews, loading } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // States
  const [activeImage, setActiveImage] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [pincodeInput, setPincodeInput] = React.useState('411005');
  const [deliveryInfo, setDeliveryInfo] = React.useState(calculateDistanceShipping('411005', '', '', product?.price || 100));
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewTitle, setReviewTitle] = React.useState('');
  const [reviewComment, setReviewComment] = React.useState('');

  React.useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  React.useEffect(() => {
    if (product && product.images?.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addCartItem({ productId: product._id, product, quantity }))
      .unwrap()
      .then(() => toast.success(`${quantity} ${product.name} added to cart!`))
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addCartItem({ productId: product._id, product, quantity }))
      .unwrap()
      .then(() => {
        toast.success(`Proceeding to checkout!`);
        navigate('/checkout');
      })
      .catch(() => {
        navigate('/checkout');
      });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    const isFav = wishlist.some(item => (item._id || item.product?._id) === product._id);
    dispatch(toggleWishlistItem({ productId: product._id, product, isInWishlist: isFav }))
      .unwrap()
      .then(() => toast.success(isFav ? 'Removed from wishlist' : 'Added to wishlist!'));
  };

  const handleCheckPincode = (e) => {
    e?.preventDefault();
    if (!pincodeInput || pincodeInput.length < 6) {
      toast.error('Please enter a valid 6-digit Pincode');
      return;
    }
    const info = calculateDistanceShipping(pincodeInput, '', '', (product?.price || 100) * quantity);
    setDeliveryInfo(info);
    toast.success(`Delivery rates checked for Pincode ${pincodeInput}`);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please fill out all review fields');
      return;
    }

    dispatch(addReview({
      productId: id,
      reviewData: { rating: reviewRating, title: reviewTitle, comment: reviewComment }
    }))
      .unwrap()
      .then(() => {
        toast.success('Thank you for your product review!');
        setReviewTitle('');
        setReviewComment('');
      })
      .catch((err) => toast.error(err || 'Failed to submit review'));
  };

  if (loading || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-earth-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inWish = wishlist.some(w => w._id === product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Product top details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start bg-white p-6 md:p-8 rounded-3xl border border-earth-200/60 shadow-sm">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="h-96 rounded-2xl overflow-hidden bg-earth-50 border border-earth-150">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImage === img ? 'border-primary shadow-sm' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`thumbnail-${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-secondary uppercase bg-secondary/15 px-3 py-1 rounded-full">{product.category}</span>
              {product.organic && (
                <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <Award className="h-3 w-3" /> 100% Organic
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-900">{product.name}</h1>
            
            {/* Star ratings */}
            <div className="flex items-center space-x-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl">
                    {i < Math.floor(product.rating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-earth-700">
                {product.rating.toFixed(1)} ({product.reviewCount} customer reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-primary">₹{product.price}</span>
            {product.comparePrice && (
              <span className="text-lg text-earth-450 line-through">₹{product.comparePrice}</span>
            )}
          </div>

          <p className="text-sm text-earth-650 leading-relaxed border-t border-earth-150 pt-4">
            {product.description}
          </p>

          {/* Stock Availability */}
          <div className="flex items-center space-x-2 text-sm border-y border-earth-150 py-3">
            <span className="font-semibold text-earth-800">Availability:</span>
            {product.stock > 0 ? (
              <span className="text-primary font-bold">{product.stock} items left in stock</span>
            ) : (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" /> Out of stock
              </span>
            )}
          </div>

          {/* Dynamic Distance Delivery Charges Calculator Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-900">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery Charges & Distance Checker</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Live Rates</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 411005)"
                maxLength={6}
                className="w-full px-3 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:border-primary bg-white font-medium"
              />
              <button
                onClick={handleCheckPincode}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-1.5 rounded transition-all whitespace-nowrap"
              >
                Check Rates
              </button>
            </div>

            {deliveryInfo && (
              <div className="text-xs bg-white p-3 rounded-lg border border-gray-200 space-y-1.5 animate-in fade-in">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-600">Delivery Zone & Distance:</span>
                  <span className="text-primary font-extrabold">{deliveryInfo.distance}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span className={deliveryInfo.cost === 0 ? "text-emerald-600 font-black" : "text-gray-900 font-black"}>
                    {deliveryInfo.cost === 0 ? "FREE Delivery" : `₹${deliveryInfo.cost}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Estimated Delivery Time:</span>
                  <span className="font-semibold text-gray-700">{deliveryInfo.estimatedDays}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          {product.stock > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-earth-300 rounded-xl overflow-hidden bg-earth-50">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 font-bold hover:bg-earth-150"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-earth-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-3.5 py-2 font-bold hover:bg-earth-150"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 text-sm"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 text-sm"
              >
                <Zap className="h-4.5 w-4.5 fill-white" />
                <span>Buy Now</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`border border-earth-300 hover:bg-earth-50 p-3 rounded-xl transition-all ${
                  inWish ? 'text-red-500 bg-red-50' : 'text-earth-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${inWish ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review details block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Write a review form */}
        <div className="bg-white p-6 rounded-3xl border border-earth-200/60 shadow-sm space-y-4">
          <h3 className="font-extrabold text-primary text-lg">Submit a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-earth-700 block">Rating</label>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    type="button"
                    key={stars}
                    onClick={() => setReviewRating(stars)}
                    className="text-amber-400 focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${reviewRating >= stars ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-earth-700 block">Review Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Delicious Taste, Highly recommended"
                className="w-full px-3 py-2 rounded-xl border border-earth-300 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-earth-700 block">Detailed Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows="4"
                placeholder="Share your thoughts about product quality, freshness..."
                className="w-full px-3 py-2 rounded-xl border border-earth-300 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl transition-all shadow"
            >
              Post Review
            </button>
          </form>
        </div>

        {/* Existing reviews list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-earth-200/60 shadow-sm space-y-6">
          <h3 className="font-extrabold text-primary text-lg">Customer Reviews ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <p className="text-earth-500 text-sm italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="divide-y divide-earth-150 max-h-[400px] overflow-y-auto pr-2 space-y-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-4.5 w-4.5 fill-amber-400" />)}
                    </div>
                    <span className="text-xs text-earth-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-earth-900 text-sm">{rev.title}</h4>
                  <p className="text-sm text-earth-700 leading-relaxed">{rev.comment}</p>
                  <div className="text-xs text-earth-500">By {rev.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold text-primary">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div 
                key={rel._id} 
                onClick={() => navigate(`/shop/${rel._id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-earth-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer p-4 space-y-3"
              >
                <div className="h-36 rounded-xl overflow-hidden bg-earth-50">
                  <img src={rel.images[0]} alt={rel.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-earth-900 text-sm line-clamp-1 hover:text-primary transition-colors">{rel.name}</h4>
                <div className="font-bold text-primary text-sm">₹{rel.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
