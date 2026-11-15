import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset link sent to your college email!');
    }, 800);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Find<span className="text-blue-600">It</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Enter your registered college email and we'll send reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Check Your Email</h3>
              <p className="text-xs text-slate-500 mt-2">
                We sent password reset instructions to <span className="font-semibold text-slate-800">{email}</span>.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                  Cancel and return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

