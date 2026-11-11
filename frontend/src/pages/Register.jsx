import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import { Leaf, User, Mail, Lock, Phone, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Form states
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [acceptTerms, setAcceptTerms] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  // Password criteria verification
  const rules = {
    length: password.length >= 4
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast.error('Please fill in all registration fields');
      return;
    }

    // Verify rules
    if (!rules.length) {
      toast.error('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    dispatch(register({ name, email, password, phone }))
      .unwrap()
      .then(() => {
        toast.success('Registration successful! Welcome to Arya Malhar Farms/ Foods/ Ayurvedic Pharmacy/ Bio-Tech/ Agro Products.');
        navigate('/');
      })
      .catch((err) => {
        toast.error(err || 'Registration failed');
      });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-earth-50 px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-earth-200/60 shadow-md max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center space-x-2 text-primary font-bold text-lg">
            <Leaf className="h-6 w-6 text-secondary" />
            <span>Arya Malhar Group of Companies</span>
          </span>
          <h2 className="text-2xl font-extrabold text-earth-900">Create an Account</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-earth-700 block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rahul Patil"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
              <User className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-700 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-700 block">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9822001122"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-700 block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-700 block">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
              </div>
            </div>
          </div>

          {/* Password checklist visualizer */}
          <div className="bg-earth-50 p-4 rounded-xl border space-y-2 text-xs text-earth-650">
            <span className="font-bold text-earth-850 block mb-1">Password Requirements:</span>
            <div className="flex flex-col gap-2">
              <span className={`flex items-center gap-1.5 ${rules.length ? 'text-primary font-bold' : 'text-earth-400'}`}>
                {rules.length ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} Min 4 characters
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4 mt-0.5"
            />
            <label htmlFor="terms" className="ml-2 text-xs font-semibold text-earth-650 cursor-pointer select-none">
              I agree to the Organic Standard Guidelines and Terms of Service.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3 rounded-xl transition-all shadow flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-earth-550 pt-2 border-t">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark underline font-bold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
