import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';
import { 
  TrendingUp, ShoppingBag, FolderOpen, Users, Percent, 
  Plus, Edit2, Trash2, Check, RefreshCw, Truck, RotateCcw, Save,
  Bot, HelpCircle, MessageSquare, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#2D5016', '#8BC34A', '#FF9800', '#7a552e'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [metrics, setMetrics] = React.useState(null);
  const [charts, setCharts] = React.useState(null);
  const [feedback, setFeedback] = React.useState([]);

  // Data lists
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);

  // Product Add/Edit Modal
  const [showProductModal, setShowProductModal] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState(null);
  
  // Product Form states
  const [prodName, setProdName] = React.useState('');
  const [prodDesc, setProdDesc] = React.useState('');
  const [prodCat, setProdCat] = React.useState('grains');
  const [prodPrice, setProdPrice] = React.useState('');
  const [prodCompPrice, setProdCompPrice] = React.useState('');
  const [prodStock, setProdStock] = React.useState('');
  const [prodImages, setProdImages] = React.useState(['']);
  const [prodOrganic, setProdOrganic] = React.useState(true);
  const [prodStatus, setProdStatus] = React.useState('active');

  // Order Details / Edit
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [trackingCarrier, setTrackingCarrier] = React.useState('Krushi Express');

  // General settings
  const [siteName, setSiteName] = React.useState('Arya Malhar Group of Companies');
  const [supportEmail, setSupportEmail] = React.useState('info@aryamalhar.org');

  // FAQ & Chatbot states
  const [faqs, setFaqs] = React.useState([]);
  const [showFaqModal, setShowFaqModal] = React.useState(false);
  const [editFaq, setEditFaq] = React.useState(null);

  const [faqQuestion, setFaqQuestion] = React.useState('');
  const [faqAnswer, setFaqAnswer] = React.useState('');
  const [faqCategory, setFaqCategory] = React.useState('General');
  const [faqKeywords, setFaqKeywords] = React.useState('');
  const [faqIsPopular, setFaqIsPopular] = React.useState(false);
  const [faqOrder, setFaqOrder] = React.useState(0);

  // Admin Chatbot Live Test state
  const [testMessage, setTestMessage] = React.useState('');
  const [testResponse, setTestResponse] = React.useState(null);
  const [testLoading, setTestLoading] = React.useState(false);

  const loadFaqs = () => {
    api.get('/faqs')
      .then(res => setFaqs(res.faqs || []))
      .catch(err => console.error('Failed to load FAQs:', err));
  };

  const loadData = () => {
    // 1. Fetch dashboard metrics
    api.get('/admin/metrics')
      .then(res => {
        setMetrics(res.metrics);
        setCharts(res.charts);
        setFeedback(res.recentFeedback);
      })
      .catch(err => console.error(err));

    // 2. Fetch products
    api.get('/products?limit=100')
      .then(res => setProducts(res.products))
      .catch(err => console.error(err));

    // 3. Fetch orders
    api.get('/admin/orders')
      .then(res => setOrders(res.orders))
      .catch(err => console.error(err));

    // 4. Fetch customers
    api.get('/users/admin')
      .then(res => setCustomers(res.users))
      .catch(err => console.error(err));

    // 5. Fetch FAQs
    loadFaqs();
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleOpenFaqModal = (faq = null) => {
    if (faq) {
      setEditFaq(faq);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
      setFaqCategory(faq.category || 'General');
      setFaqKeywords(faq.keywords ? faq.keywords.join(', ') : '');
      setFaqIsPopular(Boolean(faq.isPopular));
      setFaqOrder(faq.order || 0);
    } else {
      setEditFaq(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqCategory('General');
      setFaqKeywords('');
      setFaqIsPopular(false);
      setFaqOrder(0);
    }
    setShowFaqModal(true);
  };

  const handleFaqSubmit = (e) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) {
      toast.error('Question and Answer are mandatory');
      return;
    }

    const payload = {
      question: faqQuestion,
      answer: faqAnswer,
      category: faqCategory,
      keywords: faqKeywords,
      isPopular: faqIsPopular,
      order: Number(faqOrder) || 0
    };

    if (editFaq) {
      api.put(`/faqs/${editFaq._id}`, payload)
        .then(() => {
          toast.success('FAQ updated successfully!');
          setShowFaqModal(false);
          loadFaqs();
        })
        .catch(err => toast.error(err.message || 'Failed to update FAQ'));
    } else {
      api.post('/faqs', payload)
        .then(() => {
          toast.success('FAQ created successfully!');
          setShowFaqModal(false);
          loadFaqs();
        })
        .catch(err => toast.error(err.message || 'Failed to create FAQ'));
    }
  };

  const handleDeleteFaq = (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      api.delete(`/faqs/${id}`)
        .then(() => {
          toast.success('FAQ deleted successfully!');
          loadFaqs();
        })
        .catch(err => toast.error(err.message || 'Failed to delete FAQ'));
    }
  };

  const handleTestChatbot = (e) => {
    e.preventDefault();
    if (!testMessage.trim()) return;
    setTestLoading(true);
    api.post('/faqs/chatbot/ask', { message: testMessage })
      .then(res => setTestResponse(res))
      .catch(err => toast.error(err.message || 'Chatbot test failed'))
      .finally(() => setTestLoading(false));
  };

  const handleAddPhotoField = () => {
    setProdImages([...prodImages, '']);
  };

  const handleRemovePhotoField = (index) => {
    setProdImages(prodImages.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (index, value) => {
    const updated = [...prodImages];
    updated[index] = value;
    setProdImages(updated);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!prodName || !prodDesc || !prodPrice || !prodStock) {
      toast.error('Please enter all mandatory fields');
      return;
    }

    const validImages = prodImages.map(img => img.trim()).filter(Boolean);

    const payload = {
      name: prodName,
      description: prodDesc,
      category: prodCat,
      price: Number(prodPrice),
      comparePrice: prodCompPrice ? Number(prodCompPrice) : undefined,
      stock: Number(prodStock),
      images: validImages.length > 0 ? validImages : [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'
      ],
      organic: prodOrganic,
      status: prodStatus
    };

    if (editProduct) {
      // Update
      api.put(`/admin/products/${editProduct._id}`, payload)
        .then(() => {
          toast.success('Product updated successfully!');
          setShowProductModal(false);
          loadData();
        })
        .catch(err => toast.error(err.message || 'Update failed'));
    } else {
      // Create
      api.post('/admin/products', payload)
        .then(() => {
          toast.success('Product created successfully!');
          setShowProductModal(false);
          loadData();
        })
        .catch(err => toast.error(err.message || 'Creation failed'));
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdCat(prod.category);
    setProdPrice(prod.price);
    setProdCompPrice(prod.comparePrice || '');
    setProdStock(prod.stock);
    setProdImages(prod.images && prod.images.length > 0 ? prod.images : ['']);
    setProdOrganic(prod.organic);
    setProdStatus(prod.status);
    setShowProductModal(true);
  };

  const handleOpenAddProduct = () => {
    setEditProduct(null);
    setProdName('');
    setProdDesc('');
    setProdCat('grains');
    setProdPrice('');
    setProdCompPrice('');
    setProdStock('');
    setProdImages(['']);
    setProdOrganic(true);
    setProdStatus('active');
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      api.delete(`/admin/products/${id}`)
        .then(() => {
          toast.success('Product soft-deleted successfully');
          loadData();
        })
        .catch(err => toast.error(err.message || 'Deletion failed'));
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    api.patch(`/orders/${orderId}/status`, { status: newStatus })
      .then(() => {
        toast.success(`Order status updated to ${newStatus}`);
        loadData();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
        }
      })
      .catch(err => toast.error(err.message || 'Failed to update order status'));
  };

  const handleUpdateTracking = (e) => {
    e.preventDefault();
    if (!trackingNumber) {
      toast.error('Tracking number is required');
      return;
    }
    api.post(`/admin/orders/${selectedOrder._id}/tracking`, {
      carrier: trackingCarrier,
      trackingNumber,
      trackingUrl: `https://www.krushiexpress.in/track?id=${trackingNumber}`
    })
      .then(() => {
        toast.success('Tracking details updated successfully');
        loadData();
        setSelectedOrder(null);
        setTrackingNumber('');
      })
      .catch(err => toast.error(err.message || 'Failed to update tracking'));
  };

  const handleRefundOrder = (orderId) => {
    if (window.confirm('Refund order payments and return items stock?')) {
      api.post(`/admin/orders/${orderId}/refund`)
        .then(() => {
          toast.success('Order refunded and items restocked');
          loadData();
          setSelectedOrder(null);
        })
        .catch(err => toast.error(err.message || 'Refund failed'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-64 bg-primary-dark text-earth-100 rounded-3xl p-5 shadow space-y-4">
        <div className="pb-4 border-b border-primary-light/20 text-center lg:text-left">
          <h2 className="font-extrabold text-white text-lg">Admin Panel</h2>
          <span className="text-xs text-secondary-light">Arya malhar Platform Console</span>
        </div>

        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 font-semibold text-sm">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4.5 w-4.5" /> },
            { id: 'products', label: 'Products', icon: <FolderOpen className="h-4.5 w-4.5" /> },
            { id: 'customers', label: 'Customers', icon: <Users className="h-4.5 w-4.5" /> },
            { id: 'chatbot_faqs', label: 'Chatbot & FAQs', icon: <Bot className="h-4.5 w-4.5" /> },
            { id: 'settings', label: 'Settings', icon: <Save className="h-4.5 w-4.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-left transition-all flex-shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-secondary text-primary-dark shadow-md' 
                  : 'hover:bg-primary/30 text-earth-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Viewport */}
      <div className="flex-grow w-full space-y-6">
        
        {/* TAB 1: OVERVIEW METRICS & CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Total Revenue', value: `₹${metrics?.totalRevenue || 0}`, icon: <TrendingUp className="h-5 w-5 text-emerald-600" />, rate: '+12% vs last month' },
                { title: 'Total Orders', value: metrics?.totalOrders || 0, icon: <ShoppingBag className="h-5 w-5 text-blue-600" />, rate: `${metrics?.pendingOrders || 0} pending` },
                { title: 'Active Products', value: metrics?.totalProducts || 0, icon: <FolderOpen className="h-5 w-5 text-amber-600" />, rate: 'All categories' },
                { title: 'Customers Base', value: metrics?.totalCustomers || 0, icon: <Users className="h-5 w-5 text-indigo-600" />, rate: 'Active' },
                { title: 'Conversion', value: `${metrics?.conversionRate || 3.4}%`, icon: <Percent className="h-5 w-5 text-pink-600" />, rate: 'Aggregated average' }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-earth-200/60 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-earth-500 font-bold block">{kpi.title}</span>
                    {kpi.icon}
                  </div>
                  <div className="mt-3">
                    <span className="text-xl sm:text-2xl font-extrabold text-earth-900 block">{kpi.value}</span>
                    <span className="text-[10px] text-earth-450 block font-semibold mt-1">{kpi.rate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts Grid */}
            {charts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Sales Trend (Line Chart) */}
                <div className="bg-white p-5 rounded-3xl border border-earth-200/60 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-primary text-sm sm:text-base">Sales Trend (Last 6 Months)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={charts.monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#777777" fontSize={11} />
                        <YAxis stroke="#777777" fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" dataKey="Sales" stroke="#2D5016" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Category Share (Pie Chart) */}
                <div className="bg-white p-5 rounded-3xl border border-earth-200/60 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-primary text-sm sm:text-base">Revenue by Category Share</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {charts.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Recent feedback block */}
            <div className="bg-white p-6 rounded-3xl border border-earth-200/60 shadow-sm space-y-4">
              <h3 className="font-extrabold text-primary text-sm sm:text-base">Recent Customer Feedback</h3>
              <div className="space-y-4">
                {feedback.map(feed => (
                  <div key={feed.id} className="text-xs sm:text-sm bg-earth-50 border p-4 rounded-2xl flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-bold text-earth-900 block">{feed.customer}</span>
                      <p className="text-earth-650 italic">"{feed.comment}"</p>
                    </div>
                    <span className="bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full">★ {feed.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-3xl border border-earth-200/65 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <h2 className="text-xl font-extrabold text-primary">Manage Products Listing</h2>
              <button 
                onClick={handleOpenAddProduct}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-left text-sm divide-y divide-earth-150 bg-white">
                <thead className="bg-earth-50 text-earth-800 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 text-earth-700">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-earth-50/50">
                      <td className="p-4 flex items-center space-x-3.5">
                        <img src={prod.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                        <span className="font-bold text-earth-900 line-clamp-1">{prod.name}</span>
                      </td>
                      <td className="p-4 capitalize">{prod.category}</td>
                      <td className="p-4 font-bold text-primary">₹{prod.price}</td>
                      <td className="p-4 font-semibold">{prod.stock} units</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                          prod.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'
                        }`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-3">
                        <button onClick={() => handleOpenEditProduct(prod)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 className="h-4.5 w-4.5" /></button>
                        <button onClick={() => handleDeleteProduct(prod._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 className="h-4.5 w-4.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
            {showProductModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 relative border shadow-2xl">
                  <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-earth-400 hover:text-earth-900 font-bold">✕</button>
                  <h3 className="font-extrabold text-primary text-lg">{editProduct ? 'Edit Product Details' : 'Add New Organic Product'}</h3>
                  <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Product Name *</label>
                      <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Indrayani Basmati" required />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Description *</label>
                      <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Describe organic properties..." rows="3" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Category *</label>
                      <select value={prodCat} onChange={e => setProdCat(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                        <option value="grains">Organic Grains</option>
                        <option value="vegetables">Fresh Vegetables</option>
                        <option value="fruits">Organic Fruits</option>
                        <option value="fertilizers">Organic Fertilizers</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Product Status *</label>
                      <select value={prodStatus} onChange={e => setProdStatus(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Price (₹) *</label>
                      <input type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Compare Price (₹)</label>
                      <input type="number" value={prodCompPrice} onChange={e => setProdCompPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-earth-700 block">Stock Level *</label>
                      <input type="number" value={prodStock} onChange={e => setProdStock(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" required />
                    </div>

                    {/* Multiple Photo Gallery URLs */}
                    <div className="sm:col-span-2 space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-earth-700 block">Product Gallery Photos (Multiple URLs)</label>
                        <button
                          type="button"
                          onClick={handleAddPhotoField}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Another Photo URL
                        </button>
                      </div>

                      <div className="space-y-2">
                        {prodImages.map((imgUrl, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={imgUrl}
                              onChange={(e) => handlePhotoChange(idx, e.target.value)}
                              className="flex-grow px-3 py-2 border rounded-xl text-sm"
                              placeholder={`Photo URL #${idx + 1} (e.g. https://images.unsplash.com/...)`}
                            />
                            {imgUrl.trim() && (
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-earth-200 flex-shrink-0">
                                <img src={imgUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                              </div>
                            )}
                            {prodImages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhotoField(idx)}
                                className="p-2 text-earth-400 hover:text-red-600 rounded-lg transition-colors"
                                title="Remove photo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-earth-500">
                        Tip: Add multiple image URLs here to build an interactive thumbnail gallery on the product details page.
                      </p>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <label className="flex items-center space-x-2 text-xs font-bold text-earth-700 cursor-pointer">
                        <input type="checkbox" checked={prodOrganic} onChange={e => setProdOrganic(e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4" />
                        <span>100% Organic Sourcing Certified</span>
                      </label>
                    </div>
                    <div className="sm:col-span-2 border-t pt-4 flex justify-end space-x-3">
                      <button type="button" onClick={() => setShowProductModal(false)} className="border border-earth-300 px-5 py-2.5 rounded-xl text-xs text-earth-700">Cancel</button>
                      <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-3xl border border-earth-200/65 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-primary border-b pb-3">Fulfillment & Orders</h2>
            
            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-left text-sm divide-y divide-earth-150 bg-white">
                <thead className="bg-earth-50 text-earth-800 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Fulfillment</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 text-earth-700">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-earth-50/50">
                      <td className="p-4 font-bold text-earth-900 uppercase">#{order._id.substring(0, 8)}</td>
                      <td className="p-4">{order.user?.name || 'Rahul Patil'}</td>
                      <td className="p-4 font-bold text-primary">₹{order.cartSummary.total.toFixed(2)}</td>
                      <td className="p-4 capitalize">
                        <select 
                          value={order.orderStatus} 
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="bg-earth-50 border rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                          order.paymentInfo.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'
                        }`}>
                          {order.paymentInfo.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => { setSelectedOrder(order); setTrackingNumber(order.trackingInfo?.trackingNumber || ''); }}
                          className="text-xs bg-earth-100 hover:bg-earth-200 px-3 py-1.5 rounded-lg border font-bold"
                        >
                          Details / Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ORDER TRACKING / REFUND DIALOG */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 relative border shadow-2xl">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-earth-400 hover:text-earth-900 font-bold">✕</button>
                  <h3 className="font-extrabold text-primary text-lg">Order #{selectedOrder._id.substring(0, 8).toUpperCase()} Details</h3>
                  
                  {/* Address */}
                  <div className="bg-earth-50 p-4 rounded-xl border space-y-1 text-xs sm:text-sm">
                    <span className="font-bold text-primary block uppercase text-[10px]">Deliver to</span>
                    <p className="font-bold text-earth-900">{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                  </div>

                  {/* Actions (Tracking and Refund) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Add Tracking Form */}
                    <form onSubmit={handleUpdateTracking} className="space-y-3.5 border-r border-earth-150 pr-4">
                      <h4 className="font-bold text-earth-900 text-xs sm:text-sm flex items-center gap-1">
                        <Truck className="h-4 w-4 text-secondary" /> Shipping Dispatch Tracking
                      </h4>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-700 block">Carrier</label>
                        <select value={trackingCarrier} onChange={e => setTrackingCarrier(e.target.value)} className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white">
                          <option value="Krushi Express">Krushi Express</option>
                          <option value="Delhivery">Delhivery</option>
                          <option value="Speed Post">Speed Post</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-700 block">Tracking Number</label>
                        <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full px-2.5 py-1.5 border rounded-lg text-xs" placeholder="KE987654321" required />
                      </div>
                      <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg text-xs shadow-sm">
                        Update Shipping Tracking
                      </button>
                    </form>

                    {/* Refund Actions */}
                    <div className="space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-bold text-earth-900 text-xs sm:text-sm flex items-center gap-1">
                          <RotateCcw className="h-4 w-4 text-red-500" /> Cancel & Refund Status
                        </h4>
                        <p className="text-[10px] text-earth-500 leading-relaxed">
                          Refunding returns payments back via Razorpay and rolls back ordered item count to original product stock logs.
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRefundOrder(selectedOrder._id)}
                        disabled={selectedOrder.paymentInfo.status === 'refunded' || selectedOrder.orderStatus === 'cancelled'}
                        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-earth-300 text-white font-bold py-2.5 rounded-lg text-xs shadow-sm"
                      >
                        Refund & Cancel Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMERS BASE */}
        {activeTab === 'customers' && (
          <div className="bg-white p-6 rounded-3xl border border-earth-200/65 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-primary border-b pb-3">User & Customer Accounts</h2>
            
            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-left text-sm divide-y divide-earth-150 bg-white">
                <thead className="bg-earth-50 text-earth-800 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-center">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 text-earth-700">
                  {customers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-earth-50/50">
                      <td className="p-4 font-bold text-earth-900">{cust.name}</td>
                      <td className="p-4">{cust.email}</td>
                      <td className="p-4">{cust.phone || 'N/A'}</td>
                      <td className="p-4 capitalize">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                          cust.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-earth-100 text-earth-700'
                        }`}>
                          {cust.role}
                        </span>
                      </td>
                      <td className="p-4 text-center text-xs text-earth-500">{new Date(cust.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: GENERAL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl border border-earth-200/65 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-primary border-b pb-3">Platform Setup Settings</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl text-left text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-earth-700">Platform Portal Title</label>
                <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-earth-700">Support Help Desk Email</label>
                <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button onClick={() => toast.success('General settings successfully updated!')} className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-sm">
                  <Check className="h-4 w-4" /> Save Configuration Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CHATBOT & FAQS MANAGEMENT */}
        {activeTab === 'chatbot_faqs' && (
          <div className="bg-white p-6 rounded-3xl border border-earth-200/65 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
                  <Bot className="h-6 w-6 text-secondary" /> AI Chatbot & Knowledge Base Management
                </h2>
                <p className="text-xs text-earth-600">
                  Manage FAQs, knowledge base Q&As, and test AI chatbot responses in real-time.
                </p>
              </div>
              <button
                onClick={() => handleOpenFaqModal()}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus className="h-4 w-4" /> Add New FAQ
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200 flex items-center space-x-3">
                <div className="bg-primary/10 p-3 rounded-xl text-primary font-bold">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-earth-500 font-semibold">Total Knowledge FAQs</p>
                  <p className="text-lg font-extrabold text-earth-900">{faqs.length}</p>
                </div>
              </div>
              <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200 flex items-center space-x-3">
                <div className="bg-amber-100 p-3 rounded-xl text-amber-700 font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-earth-500 font-semibold">Popular Featured FAQs</p>
                  <p className="text-lg font-extrabold text-earth-900">{faqs.filter(f => f.isPopular).length}</p>
                </div>
              </div>
              <div className="bg-earth-50 p-4 rounded-2xl border border-earth-200 flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-xl text-green-700 font-bold">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-earth-500 font-semibold">Chatbot Status</p>
                  <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Active & Online
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Live AI Chatbot Test Box */}
            <div className="bg-gradient-to-br from-earth-50 to-primary-light/10 p-5 rounded-2xl border border-primary/20 space-y-3">
              <h3 className="font-bold text-earth-900 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" /> Test AI Chatbot Console
              </h3>
              <form onSubmit={handleTestChatbot} className="flex gap-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type a test question to verify AI answer (e.g. What is your delivery time?)..."
                  className="flex-grow text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-earth-300 focus:outline-none focus:border-primary bg-white"
                />
                <button
                  type="submit"
                  disabled={testLoading || !testMessage.trim()}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  {testLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test Reply'}
                </button>
              </form>

              {testResponse && (
                <div className="bg-white p-3.5 rounded-xl border border-earth-200 text-xs space-y-1">
                  <p className="font-bold text-primary">Bot Response:</p>
                  <p className="text-earth-800 leading-relaxed">{testResponse.reply}</p>
                  {testResponse.category && (
                    <span className="inline-block mt-1 text-[10px] bg-earth-100 text-earth-700 px-2 py-0.5 rounded font-semibold">
                      Category: {testResponse.category} (Confidence: {testResponse.confidence})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* FAQs List Table */}
            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-left text-sm divide-y divide-earth-150 bg-white">
                <thead className="bg-earth-50 text-earth-800 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Category</th>
                    <th className="p-4">Question</th>
                    <th className="p-4">Answer Preview</th>
                    <th className="p-4 text-center">Popular</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 text-earth-700">
                  {faqs.map((faq) => (
                    <tr key={faq._id} className="hover:bg-earth-50/50">
                      <td className="p-4">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                          {faq.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-earth-900 max-w-xs">{faq.question}</td>
                      <td className="p-4 text-xs text-earth-600 max-w-sm truncate">{faq.answer}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          faq.isPopular ? 'bg-amber-100 text-amber-800' : 'bg-earth-100 text-earth-500'
                        }`}>
                          {faq.isPopular ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenFaqModal(faq)}
                          className="p-1.5 text-earth-600 hover:text-primary hover:bg-earth-100 rounded-lg transition-colors"
                          title="Edit FAQ"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq._id)}
                          className="p-1.5 text-earth-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete FAQ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ADD / EDIT FAQ MODAL */}
            {showFaqModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 relative border shadow-2xl">
                  <button
                    onClick={() => setShowFaqModal(false)}
                    className="absolute top-4 right-4 text-earth-400 hover:text-earth-900 font-bold text-lg"
                  >
                    ✕
                  </button>
                  <h3 className="font-extrabold text-primary text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-secondary" />
                    {editFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                  </h3>

                  <form onSubmit={handleFaqSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <label className="font-bold text-earth-800">Question *</label>
                      <input
                        type="text"
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="e.g. How to track my order status?"
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-primary bg-white text-xs sm:text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-earth-800">Answer *</label>
                      <textarea
                        rows={4}
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Detailed answer text for users and AI chatbot knowledge..."
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-primary bg-white text-xs sm:text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-earth-800">Category</label>
                        <select
                          value={faqCategory}
                          onChange={(e) => setFaqCategory(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-primary bg-white text-xs"
                        >
                          <option value="General">General</option>
                          <option value="Products & Organic">Products & Organic</option>
                          <option value="Ordering & Payments">Ordering & Payments</option>
                          <option value="Shipping & Delivery">Shipping & Delivery</option>
                          <option value="Ayurvedic Pharmacy">Ayurvedic Pharmacy</option>
                          <option value="Returns & Support">Returns & Support</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-earth-800">Display Order</label>
                        <input
                          type="number"
                          value={faqOrder}
                          onChange={(e) => setFaqOrder(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-primary bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-earth-800">Search Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={faqKeywords}
                        onChange={(e) => setFaqKeywords(e.target.value)}
                        placeholder="organic, certificate, shipping, sangli, ayurveda"
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-primary bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={faqIsPopular}
                        onChange={(e) => setFaqIsPopular(e.target.checked)}
                        className="h-4 w-4 text-primary rounded border-earth-300 focus:ring-primary"
                      />
                      <label htmlFor="isPopular" className="font-semibold text-earth-800 text-xs cursor-pointer">
                        Mark as Featured / Popular FAQ
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setShowFaqModal(false)}
                        className="px-4 py-2 border border-earth-300 rounded-xl text-earth-700 font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md transition-all"
                      >
                        {editFaq ? 'Update FAQ' : 'Save FAQ'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
