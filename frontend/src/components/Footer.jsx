import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-earth-100 border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-bold flex flex-col items-start space-y-1.5 text-white">
              <img src="/logo.png" alt="Arya Malhar Group of Companies Logo" className="h-16 w-auto object-contain bg-white/10 rounded p-1" />
              <span className="text-base font-extrabold text-secondary">Arya Malhar Group of Companies</span>
              <span className="text-xs text-earth-300 font-medium">Farms/ Foods/ Ayurvedic Pharmacy/ Bio-Tech/ Agro Products</span>
            </span>
            <p className="text-sm text-earth-300">
              Leading the organic agricultural revolution in Maharashtra. Sourced directly from local farmers to feed your family with 100% natural, chemical-free produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-earth-300 hover:text-secondary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-earth-300 hover:text-secondary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-earth-300 hover:text-secondary transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-earth-300">
              <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-secondary transition-colors">Shop Products</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Sunil Bhosale</Link></li>
              <li><Link to="/why-us" className="hover:text-secondary transition-colors">Why Choose Organic</Link></li>
              <li><Link to="/faq" className="hover:text-secondary transition-colors">FAQ & Help Center</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm text-earth-300">
              <li><Link to="/profile" className="hover:text-secondary transition-colors">My Profile</Link></li>
              <li><Link to="/cart" className="hover:text-secondary transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-secondary transition-colors">My Wishlist</Link></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Returns & Refunds</a></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-earth-300">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Gat No. 163/351 A/p. Dhangaon, Tal. Palus, Dist. Sangli 416303</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>9561961055 / 9022424266</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>susanbhosale@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-primary-light/10 mt-12 pt-8 text-center text-xs text-earth-400">
          <p>© {new Date().getFullYear()} Arya Malhar Group of Companies. All rights reserved. Created for Maharashtra Organic Farming Initiative Association.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
