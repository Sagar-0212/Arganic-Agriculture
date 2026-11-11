import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { addCartItem, toggleWishlistItem } from '../store/slices/cartSlice';
import { ProductSkeleton } from '../components/Skeleton';
import { 
  Search, 
  SlidersHorizontal, 
  Heart, 
  ShoppingCart, 
  ShieldCheck, 
  Star, 
  Truck, 
  Zap, 
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Shop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { items: products, categories, loading, page, pages, total } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);

  // Filter & sort states synchronized with URL
  const searchInput = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const selectedRating = searchParams.get('rating') || '';
  const onlyOrganic = searchParams.get('organic') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const filters = {};
    if (searchInput) filters.search = searchInput;
    if (selectedCategory) filters.category = selectedCategory;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (selectedRating) filters.rating = selectedRating;
    if (onlyOrganic) filters.organic = onlyOrganic;
    if (sortBy) filters.sortBy = sortBy;
    filters.page = searchParams.get('page') || 1;

    dispatch(fetchProducts(filters));
  }, [dispatch, searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const setPricePreset = (min, max) => {
    const newParams = new URLSearchParams(searchParams);
    if (min !== undefined && min !== '') newParams.set('minPrice', min);
    else newParams.delete('minPrice');
    if (max !== undefined && max !== '') newParams.set('maxPrice', max);
    else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addCartItem({ productId: product._id, product, quantity: 1 }))
      .unwrap()
      .then(() => toast.success(`${product.name} added to cart!`))
      .catch((err) => toast.error(err || 'Failed to add item to cart'));
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    dispatch(addCartItem({ productId: product._id, product, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success(`Proceeding to checkout for ${product.name}!`);
        navigate('/checkout');
      })
      .catch(() => {
        navigate('/checkout');
      });
  };

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    const isFav = wishlist.some(item => (item._id || item.product?._id) === product._id);
    dispatch(toggleWishlistItem({ productId: product._id, product, isInWishlist: isFav }))
      .unwrap()
      .then(() => toast.success(isFav ? 'Removed from wishlist' : 'Added to wishlist!'));
  };

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Popularity', value: 'reviews' },
    { label: 'Price -- Low to High', value: 'price-low' },
    { label: 'Price -- High to Low', value: 'price-high' },
    { label: 'Customer Rating', value: 'rating' },
  ];

  return (
    <div className="bg-slate-100 min-h-screen pb-16">
      {/* Top Banner & Quick Categories Bar */}
      <div className="bg-white border-b border-gray-200 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Top Search & Filter Bar */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => updateParam('search', e.target.value)}
                placeholder="Search for organic products, gomutra ark, ghanvati, oils..."
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-gray-50/50"
              />
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              {searchInput && (
                <button onClick={() => updateParam('search', '')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Total Results Counter */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                {total} Products Found
              </span>
            </div>
          </div>

          {/* Quick Categories Strip (Flipkart Style Horizontal Scroll) */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs font-medium">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateParam('category', cat.slug)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          
          {/* Left Sticky Filter Sidebar */}
          <div
            className={`lg:block ${
              showMobileFilters
                ? 'fixed inset-0 z-50 bg-white p-5 overflow-y-auto'
                : 'hidden'
            } bg-white rounded-lg border border-gray-200 shadow-xs p-4 space-y-6 lg:sticky lg:top-36`}
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Filters
              </h3>
              {showMobileFilters && (
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-900 text-sm font-bold"
                >
                  ✕ Close
                </button>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-extrabold uppercase tracking-wider"
              >
                CLEAR ALL
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">CATEGORIES</h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-primary">
                  <input
                    type="radio"
                    name="category"
                    checked={!selectedCategory}
                    onChange={() => updateParam('category', '')}
                    className="text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className={!selectedCategory ? 'font-bold text-primary' : ''}>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-primary">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.slug}
                      onChange={() => updateParam('category', cat.slug)}
                      className="text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className={selectedCategory === cat.slug ? 'font-bold text-primary' : ''}>
                      {cat.name} ({cat.productCount})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Presets & Range Slider */}
            <div className="space-y-2.5 pt-4 border-t border-gray-150">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">PRICE RANGE</h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setPricePreset('', '100')}
                  className="text-[11px] px-2.5 py-1 rounded border border-gray-300 hover:border-primary hover:text-primary bg-gray-50"
                >
                  Under ₹100
                </button>
                <button
                  onClick={() => setPricePreset('100', '200')}
                  className="text-[11px] px-2.5 py-1 rounded border border-gray-300 hover:border-primary hover:text-primary bg-gray-50"
                >
                  ₹100 - ₹200
                </button>
                <button
                  onClick={() => setPricePreset('200', '500')}
                  className="text-[11px] px-2.5 py-1 rounded border border-gray-300 hover:border-primary hover:text-primary bg-gray-50"
                >
                  ₹200 - ₹500
                </button>
                <button
                  onClick={() => setPricePreset('500', '')}
                  className="text-[11px] px-2.5 py-1 rounded border border-gray-300 hover:border-primary hover:text-primary bg-gray-50"
                >
                  Above ₹500
                </button>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  placeholder="Min ₹"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-primary"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  placeholder="Max ₹"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Customer Rating Filter */}
            <div className="space-y-2 pt-4 border-t border-gray-150">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">CUSTOMER RATINGS</h4>
              <div className="space-y-1.5">
                {[4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-primary">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === stars.toString()}
                      onChange={() => updateParam('rating', stars.toString())}
                      className="text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {stars} <Star className="w-2.5 h-2.5 fill-white" />
                    </span>
                    <span className="text-gray-500 text-[11px]">& above</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Flipkart Assured / Arya Organic Verified */}
            <div className="pt-4 border-t border-gray-150">
              <label className="flex items-center space-x-2 text-xs text-gray-800 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOrganic === 'true'}
                  onChange={(e) => updateParam('organic', e.target.checked ? 'true' : '')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="flex items-center gap-1 text-primary font-extrabold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline-block" />
                  Arya Organic Verified
                </span>
              </label>
            </div>
          </div>

          {/* Right Product Listing Panel */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Top Flipkart Sort Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className="font-bold text-gray-900">Showing {products.length} of {total} Products</span>
              </div>

              {/* Flipkart Desktop Sort Tabs */}
              <div className="hidden sm:flex items-center space-x-4 text-xs font-semibold text-gray-600">
                <span className="text-gray-400 uppercase text-[10px] tracking-wider">Sort By:</span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('sortBy', opt.value)}
                    className={`pb-0.5 transition-all ${
                      sortBy === opt.value
                        ? 'text-primary font-extrabold border-b-2 border-primary'
                        : 'hover:text-gray-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center space-y-4 shadow-xs">
                <p className="text-gray-500 font-medium">No organic products matched your filter criteria.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-full text-xs transition-all shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) => {
                    const inWish = wishlist.some(w => (w._id || w.product?._id) === product._id);
                    const discountPercent = product.comparePrice && product.comparePrice > product.price
                      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                      : 0;

                    return (
                      <div
                        key={product._id}
                        onClick={() => navigate(`/shop/${product._id}`)}
                        className="group bg-white rounded-lg border border-gray-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                      >
                        {/* Discount Tag */}
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 z-10 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                            {discountPercent}% OFF
                          </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleWishlistToggle(e, product)}
                          title={inWish ? "Remove from wishlist" : "Add to wishlist"}
                          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-xs text-gray-500 hover:text-rose-600 transition-all"
                        >
                          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Product Image */}
                        <div className="relative h-44 sm:h-52 bg-gray-50 overflow-hidden flex items-center justify-center p-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Details Area */}
                        <div className="p-3.5 flex-grow space-y-1.5 flex flex-col justify-between border-t border-gray-100">
                          <div>
                            {/* Category & Verified Badge */}
                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold mb-1">
                              <span className="uppercase tracking-wider truncate">{product.category}</span>
                              <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                            </div>

                            {/* Product Title */}
                            <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                              {product.name}
                            </h3>
                          </div>

                          {/* Flipkart Green Rating Badge */}
                          <div className="flex items-center space-x-1.5 pt-1">
                            <span className="inline-flex items-center gap-0.5 bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                              {product.rating ? product.rating.toFixed(1) : '4.8'} <Star className="w-2.5 h-2.5 fill-white" />
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">({product.reviewCount || 25})</span>
                          </div>

                          {/* Flipkart Pricing Block */}
                          <div className="flex items-baseline space-x-2 pt-1">
                            <span className="text-base sm:text-lg font-black text-gray-900">₹{product.price}</span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">₹{product.comparePrice}</span>
                            )}
                            {discountPercent > 0 && (
                              <span className="text-xs font-bold text-emerald-600">{discountPercent}% off</span>
                            )}
                          </div>

                          {/* Free Delivery Banner */}
                          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium pt-0.5">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            <span>Free Delivery Available</span>
                          </div>

                          {/* Action Button Bar (Dual Flipkart Buttons: Add to Cart & Buy Now) */}
                          <div className="pt-2 grid grid-cols-2 gap-1.5">
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              className="w-full flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[11px] font-black py-2 px-1.5 rounded shadow-xs transition-all truncate"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Add to Cart</span>
                            </button>
                            <button
                              onClick={(e) => handleBuyNow(e, product)}
                              className="w-full flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-[11px] font-black py-2 px-1.5 rounded shadow-xs transition-all truncate"
                              title="Buy Now"
                            >
                              <Zap className="w-3.5 h-3.5 shrink-0 fill-white" />
                              <span className="truncate">Buy Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {pages > 1 && (
                  <div className="flex justify-center items-center space-x-2 pt-8">
                    {[...Array(pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateParam('page', (i + 1).toString())}
                        className={`w-8 h-8 rounded text-xs font-bold transition-all border ${
                          page === i + 1
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Bottom Bar (Flipkart Style) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg flex divide-x divide-gray-200">
        <button
          onClick={() => setShowSortModal(true)}
          className="flex-1 py-3 text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 active:bg-gray-100"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>SORT</span>
        </button>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex-1 py-3 text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 active:bg-gray-100"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>FILTER</span>
        </button>
      </div>

      {/* Mobile Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Sort Products By</h3>
              <button onClick={() => setShowSortModal(false)} className="text-gray-500 font-bold text-sm">✕</button>
            </div>
            <div className="space-y-2">
              {sortOptions.map((opt) => (
                <label
                  key={opt.value}
                  onClick={() => {
                    updateParam('sortBy', opt.value);
                    setShowSortModal(false);
                  }}
                  className="flex items-center justify-between py-2 text-xs font-semibold text-gray-800 cursor-pointer border-b border-gray-100"
                >
                  <span>{opt.label}</span>
                  <input
                    type="radio"
                    name="mobileSort"
                    checked={sortBy === opt.value}
                    onChange={() => {}}
                    className="text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
