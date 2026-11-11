import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Award, ShieldCheck, ChevronLeft, ChevronRight, Check, Sprout, HeartHandshake, FlaskConical, ChefHat, PackageOpen, Brain, BookOpen } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [products, setProducts] = React.useState([]);
  const [testimonials, setTestimonials] = React.useState([]);
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);
  
  // Newsletter
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const [newsletterErr, setNewsletterErr] = React.useState('');

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = React.useState(null);

  React.useEffect(() => {
    // Fetch products
    api.get('/products?limit=8')
      .then(res => setProducts(res.products))
      .catch(err => console.error(err));

    // Fetch testimonials
    api.get('/testimonials')
      .then(res => setTestimonials(res.testimonials))
      .catch(err => console.error(err));
  }, []);

  // Auto-rotate testimonials
  React.useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setNewsletterErr('Please enter a valid email address.');
      return;
    }
    setNewsletterErr('');
    setSubscribed(true);
    setEmail('');
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-hero-pattern bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-5xl mx-auto px-4 text-center text-white space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-secondary/80 text-primary-dark font-bold text-xs uppercase px-3 py-1.5 rounded-full"
          >
            <Leaf className="h-4.5 w-4.5" />
            <span>Award Winning Agriculture platform</span>
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight"
          >
            From Farm to Table <br/>
            <span className="text-secondary-light">Pure Organic Excellence</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-earth-100 max-w-2xl mx-auto"
          >
            Sourced directly from certified agricultural entrepreneurs and farmers in Maharashtra. Sponsored by Sunil Bhosale (Krushibhushan Award Winner).
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <button 
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/shop');
                } else {
                  toast.error('Please login or sign up to access the shop');
                  navigate('/login');
                }
              }} 
              className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Shop Organic Now
            </button>
            <button 
              onClick={() => navigate('/why-us')} 
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 py-3.5 rounded-full font-bold transition-all"
            >
              Our Mission
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-primary">Why Choose Us?</h2>
            <p className="text-earth-600 max-w-xl mx-auto">We commit to the highest agricultural standards for your health and our farmers welfare.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Leaf className="h-8 w-8 text-white" />, title: '100% Certified Organic', desc: 'No chemical pesticides or heavy heavy growth regulators. Pure natural compost crops.', color: 'bg-primary' },
              { icon: <Award className="h-8 w-8 text-white" />, title: 'Farmer-Friendly', desc: 'Direct farm linkages providing fair remuneration payouts to Maharashtra farm growers.', color: 'bg-secondary' },
              { icon: <ShieldCheck className="h-8 w-8 text-white" />, title: 'Quality Assured', desc: 'Handpicked grains and sorting logs. Managed under Krushibhushan award standards.', color: 'bg-accent' },
              { icon: <Check className="h-8 w-8 text-white" />, title: 'Affordable Rates', desc: 'No middle agent inflation. Affordable high-nutrition products directly delivered.', color: 'bg-emerald-600' }
            ].map((benefit, i) => (
              <motion.div 
                whileHover={{ y: -6 }}
                key={i} 
                className="bg-earth-50 rounded-2xl p-6 border border-earth-200/60 shadow-sm space-y-4 hover:shadow-md transition-all text-center sm:text-left"
              >
                <div className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center shadow-md mx-auto sm:mx-0`}>
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg text-earth-900">{benefit.title}</h3>
                <p className="text-sm text-earth-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5 Goshala and Activities Section */}
      <section className="py-16 bg-primary-dark text-white bg-hero-pattern bg-cover bg-center relative">
        <div className="absolute inset-0 bg-primary-dark/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <span className="inline-block bg-accent/20 text-accent font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">
              Invest in Health & Returns
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              गोशाळेत गुंतवणूक करा व नफ्याबरोबर आरोग्याची हमी मिळवा
            </h2>
            <p className="text-earth-200 max-w-3xl mx-auto text-lg">
              For the past 16 years, Krushibhushan Sunil Bhosale has been dedicated to indigenous cow conservation (देशी गोवंश संवर्धन), breeding, and organic farming to provide nutritious, chemical-free food to society.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Activities List */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-secondary mb-6 border-b border-white/10 pb-4">Our Key Initiatives (आमचे उपक्रम)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Organic Farming (सेंद्रिय शेती)', icon: <Sprout className="h-6 w-6" /> },
                  { title: 'Cow Shelter (गोशाळा)', icon: <HeartHandshake className="h-6 w-6" /> },
                  { title: 'Panchgavya Medicine Production (पंचगव्य औषध निर्मिती)', icon: <FlaskConical className="h-6 w-6" /> },
                  { title: 'Goraspak Production (गोरसपाक निर्मिती)', icon: <ChefHat className="h-6 w-6" /> },
                  { title: 'Organic Fertilizer Project (सेंद्रिय खत निर्मिती)', icon: <PackageOpen className="h-6 w-6" /> },
                  { title: 'Personality Development Camp (व्यक्तिमत्व विकास शिबिर)', icon: <Brain className="h-6 w-6" /> },
                  { title: 'Workshops (विविध विषयातील कार्यशाळा)', icon: <BookOpen className="h-6 w-6" /> },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="text-accent flex-shrink-0">{activity.icon}</div>
                    <span className="font-semibold text-sm">{activity.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Summary */}
            <div className="bg-earth-50 rounded-3xl p-8 text-earth-900 shadow-xl">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">Our Go-Utpadane (आमची गो-उत्पादने)</h3>
              <p className="text-center text-earth-600 mb-8 text-sm">
                We offer a wide range of authentic products made from indigenous cows, designed for health, environment, and holistic wellness.
              </p>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-semibold">
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Deshi Cow Ghee (देशी गाईचे तूप)</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Organic Jaggery (सेंद्रिय गूळ)</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Panchgavya Medicines</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Vermicompost (गांडूळ खत)</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Gomutra Ark (गोमुत्र अर्क)</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Pain Relief Oil (वेदना शामक तेल)</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Organic Spices (सेंद्रिय मसाले)</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" /> <span>Nutritious Flours (पौष्टिक पीठे)</span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/shop');
                    } else {
                      toast.error('Please login or sign up to access the shop');
                      navigate('/login');
                    }
                  }} 
                  className="bg-accent hover:bg-accent-dark text-white font-bold py-3 px-8 rounded-full shadow-md transition-all"
                >
                  Explore All 30+ Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 4. Testimonials Carousel */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white border-t border-earth-200">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-extrabold text-primary">Customer & Farmer Voices</h2>
              <p className="text-earth-600 text-sm">Hear what growers and health-conscious eaters say about Sunil Bhosale\'s venture.</p>
            </div>
            
            <div className="relative bg-earth-50 border border-earth-200/60 rounded-3xl p-8 md:p-12 shadow-sm text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center text-amber-400 text-2xl">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <blockquote className="text-lg md:text-xl text-earth-800 italic leading-relaxed">
                    "{testimonials[activeTestimonial].quote}"
                  </blockquote>
                  <div className="flex flex-col items-center">
                    <img 
                      src={testimonials[activeTestimonial].photo} 
                      alt={testimonials[activeTestimonial].name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary mb-3 shadow-md"
                    />
                    <cite className="not-italic font-bold text-earth-900">{testimonials[activeTestimonial].name}</cite>
                    <span className="text-xs text-earth-500">{testimonials[activeTestimonial].role}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Arrows */}
              <div className="flex justify-between absolute inset-y-1/2 left-4 right-4 md:-left-6 md:-right-6">
                <button onClick={handlePrevTestimonial} className="bg-white hover:bg-earth-100 text-primary p-2.5 rounded-full shadow-md hover:shadow-lg border border-earth-200 transition-all">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={handleNextTestimonial} className="bg-white hover:bg-earth-100 text-primary p-2.5 rounded-full shadow-md hover:shadow-lg border border-earth-200 transition-all">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Newsletter Subscription */}
      <section className="py-16 bg-newsletter-pattern bg-cover bg-center text-white relative">
        <div className="absolute inset-0 bg-primary-dark/80" />
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Subscribe to Our Newsletter</h2>
          <p className="text-earth-200 max-w-xl mx-auto">Get notifications on seasonal mango harvests, organic farming webinars, and direct consumer discounts.</p>
          
          {subscribed ? (
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              className="bg-secondary/20 border border-secondary text-secondary-light p-4 rounded-xl max-w-md mx-auto flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span className="font-bold">Subscription successful! Thank you.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <div className="flex-grow">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  className="w-full px-5 py-3 rounded-full text-earth-900 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
                {newsletterErr && <p className="text-red-400 text-xs text-left mt-1 pl-4">{newsletterErr}</p>}
              </div>
              <button type="submit" className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3 rounded-full shadow-md transition-all">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Quick View Modal Overlay */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full p-6 relative border border-earth-100 shadow-2xl">
            <button 
              onClick={() => setQuickViewProduct(null)} 
              className="absolute top-4 right-4 text-earth-400 hover:text-earth-900"
            >
              ✕
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-64 rounded-2xl overflow-hidden bg-earth-100">
                <img 
                  src={quickViewProduct.images[0]} 
                  alt={quickViewProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-secondary uppercase">{quickViewProduct.category}</span>
                <h3 className="text-xl font-bold text-earth-950">{quickViewProduct.name}</h3>
                <p className="text-sm text-earth-600 line-clamp-4">{quickViewProduct.description}</p>
                <div className="text-2xl font-bold text-primary">₹{quickViewProduct.price}</div>
                <button 
                  onClick={() => {
                    setQuickViewProduct(null);
                    navigate(`/product/${quickViewProduct._id}`);
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-full transition-all shadow-md"
                >
                  View Details & Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
