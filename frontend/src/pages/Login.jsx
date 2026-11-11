import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { Eye, EyeOff, Lock, Mail, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all credentials');
      return;
    }
    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        toast.success('Welcome back to Arya malhar!');
        navigate('/');
      })
      .catch((err) => {
        toast.error(err || 'Invalid email or password');
      });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-earth-50 px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-earth-200/60 shadow-md max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center space-x-2 text-primary font-bold text-lg">
            <Leaf className="h-6 w-6 text-secondary" />
            <span>Arya Malhar Group of Companies</span>
          </span>
          <h2 className="text-2xl font-extrabold text-earth-900">Sign in to your account</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-earth-700 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                required
              />
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-earth-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-accent hover:text-accent-dark underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                required
              />
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-earth-450 hover:text-earth-900"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="remember" className="ml-2 text-xs font-semibold text-earth-650 cursor-pointer">
              Remember me on this browser
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
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-earth-550 pt-2 border-t">
          New to the platform?{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark underline font-bold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
