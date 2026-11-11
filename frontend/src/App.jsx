import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { loadUser } from './store/slices/authSlice';
import { fetchCart, fetchWishlist } from './store/slices/cartSlice';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import WhyUs from './pages/WhyUs';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import FAQ from './pages/FAQ';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TranslatePopup from './components/TranslatePopup';
import ChatbotWidget from './components/ChatbotWidget';

const AppContent = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(loadUser());
    }
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch, token, user]);

  return (
    <Router>
      <ScrollToTop />
      <TranslatePopup />
      <ChatbotWidget />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
            
            {/* Guest Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/profile" /> : <Register />} />
            <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/profile" /> : <ForgotPassword />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
