import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.cart);
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(isAuthenticated ? [{ name: 'Shop', path: '/shop' }] : []),
    { name: 'About Us', path: '/about' },
    { name: 'Why Organic', path: '/why-us' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3">
              <img src="/logo.png" alt="Arya Malhar Group of Companies Logo" className="h-10 sm:h-12 w-auto object-contain shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-base sm:text-lg lg:text-xl font-extrabold text-primary tracking-tight whitespace-nowrap">
                  Arya Malhar Group of Companies
                </span>
                <span className="text-secondary text-[9px] sm:text-[10.5px] font-semibold whitespace-nowrap hidden sm:block max-w-[220px] md:max-w-[300px] lg:max-w-none truncate">
                  Farms / Foods / Ayurvedic Pharmacy / Bio-Tech / Agro Products
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-xs'
                      : 'text-earth-700 hover:text-primary hover:bg-earth-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 shrink-0">
            {/* Language Switcher */}
            <LanguageToggle />

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-earth-700 hover:text-red-500 hover:bg-earth-100 rounded-full transition-all"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-extrabold shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-earth-700 hover:text-primary hover:bg-earth-100 rounded-full transition-all"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCartQty > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-extrabold shadow-sm">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* User Controls */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-1">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 font-extrabold text-xs shadow-xs transition-all"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <div
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-earth-100/80 hover:bg-earth-200/80 text-earth-800 font-bold text-xs transition-all cursor-pointer border border-earth-200"
                  title="View Profile"
                >
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-earth-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg font-bold text-xs"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-earth-700 hover:text-primary hover:bg-earth-100 rounded-xl transition-all focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass border-t border-earth-200 py-4 px-5 space-y-3 shadow-lg">
          {/* Mobile Language Switcher */}
          <div className="flex justify-center pb-3 border-b border-earth-150">
            <LanguageToggle />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive ? 'bg-primary text-white' : 'text-earth-800 hover:bg-earth-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-earth-150 pt-3 flex justify-around text-xs font-bold">
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-earth-700 hover:text-red-500 p-2 rounded-lg hover:bg-earth-100"
            >
              <Heart className="h-4 w-4 text-red-500" />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-earth-700 hover:text-primary p-2 rounded-lg hover:bg-earth-100"
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span>Cart ({totalCartQty})</span>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="border-t border-earth-150 pt-3 space-y-2 text-xs font-bold">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2.5 bg-amber-100 text-amber-900 rounded-xl"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2.5 text-earth-800 hover:bg-earth-100 rounded-xl"
              >
                <User className="h-4 w-4 text-primary" />
                <span>Profile ({user?.name})</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center space-x-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-primary text-white py-2.5 rounded-xl font-bold text-sm shadow-md"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
