import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email address');
      return;
    }
    // Mock API call trigger
    setSubmitted(true);
    toast.success('Reset link dispatched successfully');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-earth-50 px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-earth-200/60 shadow-md max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center space-x-2 text-primary font-bold text-lg">
            <Leaf className="h-6 w-6 text-secondary" />
            <span>Arya Malhar Group of Companies</span>
          </span>
          <h2 className="text-2xl font-extrabold text-earth-900">Reset Password</h2>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-secondary/15 text-primary rounded-full flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm text-earth-650 leading-relaxed">
              We have sent a password recovery instructions email to <span className="font-bold text-earth-900">{email}</span>. Please verify your spam box if missing.
            </p>
            <button onClick={() => setSubmitted(false)} className="text-xs text-primary font-bold hover:underline">
              Resend Link
            </button>
            <div className="border-t pt-4">
              <Link to="/login" className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl text-sm block">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
            <p className="text-xs text-earth-550 leading-relaxed">
              Provide your email below. We will send you instructions to safely configure a new password.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-earth-700 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-earth-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3 rounded-xl transition-all shadow flex items-center justify-center text-sm"
            >
              Send Instructions
            </button>
            <div className="text-center">
              <Link to="/login" className="text-xs text-earth-500 hover:text-earth-900 font-semibold underline">
                Cancel and return
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
