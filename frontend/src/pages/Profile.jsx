import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, fetchAddresses, removeAddress } from '../store/slices/authSlice';
import api from '../services/api';
import { User, MapPin, ClipboardList, Settings, ShieldAlert, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, addresses, loading } = useSelector((state) => state.auth);

  // Tabs: 'orders', 'addresses', 'settings'
  const [activeTab, setActiveTab] = React.useState('orders');
  const [orders, setOrders] = React.useState([]);
  
  // Settings edit
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  React.useEffect(() => {
    // Load orders
    api.get('/orders')
      .then(res => setOrders(res.orders))
      .catch(err => console.error(err));

    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ name, phone }))
      .unwrap()
      .then(() => toast.success('Profile updated successfully!'))
      .catch(err => toast.error(err || 'Failed to update profile'));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    api.put('/users/password', { currentPassword, newPassword })
      .then(() => {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch(err => toast.error(err.message || 'Failed to change password'));
  };

  const handleRemoveAddr = (id) => {
    dispatch(removeAddress(id))
      .unwrap()
      .then(() => toast.success('Address removed'))
      .catch(err => toast.error(err || 'Failed to remove address'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Controls */}
        <div className="w-full md:w-64 bg-white rounded-3xl border border-earth-200/60 p-5 shadow-sm space-y-4">
          <div className="text-center pb-4 border-b border-earth-150">
            <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow">
              {user?.name?.[0].toUpperCase()}
            </div>
            <h3 className="font-extrabold text-earth-900 mt-3 text-base">{user?.name}</h3>
            <span className="text-xs text-earth-500 uppercase font-semibold">{user?.role} Account</span>
          </div>

          <div className="flex flex-col space-y-1">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${
                activeTab === 'orders' ? 'bg-primary text-white shadow-sm' : 'text-earth-700 hover:bg-earth-50'
              }`}
            >
              <ClipboardList className="h-4.5 w-4.5" />
              <span>My Orders ({orders.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${
                activeTab === 'addresses' ? 'bg-primary text-white shadow-sm' : 'text-earth-700 hover:bg-earth-50'
              }`}
            >
              <MapPin className="h-4.5 w-4.5" />
              <span>Addresses ({addresses.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${
                activeTab === 'settings' ? 'bg-primary text-white shadow-sm' : 'text-earth-700 hover:bg-earth-50'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* Dynamic Detail Panel */}
        <div className="flex-grow w-full bg-white rounded-3xl border border-earth-200/60 p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: MY ORDERS LIST */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-primary border-b pb-3">My Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-earth-500 italic text-sm">You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="bg-primary text-white font-bold px-6 py-2 rounded-xl text-xs">
                    Shop Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-earth-200 p-5 rounded-2xl space-y-4 hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-earth-150">
                        <div>
                          <span className="text-xs text-earth-500 font-semibold uppercase">Order Ref:</span>
                          <h4 className="font-bold text-earth-900 text-sm uppercase">#{order._id.substring(0, 8)}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-earth-500 block">Date Placed:</span>
                          <span className="text-sm font-semibold text-earth-800">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-earth-700">
                        <div>
                          <span className="text-earth-450 block font-semibold">Total Cost:</span>
                          <span className="font-bold text-primary">₹{order.cartSummary.total.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-earth-450 block font-semibold">Payment Status:</span>
                          <span className="font-bold text-earth-900 uppercase">{order.paymentInfo.status}</span>
                        </div>
                        <div>
                          <span className="text-earth-450 block font-semibold">Fulfillment:</span>
                          <span className="font-bold text-primary uppercase">{order.orderStatus}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/order-confirmation/${order._id}`)}
                          className="bg-earth-100 hover:bg-earth-200 border border-earth-300 font-bold px-4 py-2 rounded-xl text-xs"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES LIST */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-extrabold text-primary">Delivery Addresses</h2>
                <button onClick={() => navigate('/checkout')} className="text-xs bg-primary text-white font-bold px-4 py-2 rounded-xl">
                  Add Address (Checkout Wizard)
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-earth-500 italic text-sm py-6">No addresses recorded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="p-4 border rounded-2xl relative space-y-2">
                      <h4 className="font-bold text-earth-900 text-sm">{addr.fullName} {addr.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold ml-2">DEFAULT</span>}</h4>
                      <p className="text-xs text-earth-650 leading-relaxed">
                        {addr.addressLine1}, {addr.addressLine2 || ''}<br/>
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs text-earth-500">Phone: {addr.phone}</p>
                      
                      <div className="pt-2 flex justify-end">
                        <button 
                          onClick={() => handleRemoveAddr(addr._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center space-x-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-primary border-b pb-3">Update Profile Info</h2>
                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-earth-700">Display Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-earth-700">Phone Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" required />
                  </div>
                  <div className="sm:col-span-2 pt-2">
                    <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm">
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4 border-t border-earth-150 pt-8">
                <h2 className="text-xl font-extrabold text-primary border-b pb-3">Change Password</h2>
                <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-earth-700">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-earth-700">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm" required />
                  </div>
                  <div className="sm:col-span-2 pt-2">
                    <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm">
                      Save New Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
