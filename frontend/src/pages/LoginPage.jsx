import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Lock, Mail, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Find<span className="text-blue-600">It</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Access your campus lost & found reports and claim notifications
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  {...register('email')}
                  placeholder="student@campus.edu or admin@findit.campus.edu"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Default Admin Credentials:</p>
            <p>Email: <code className="bg-slate-200 px-1 py-0.5 rounded">admin@findit.campus.edu</code></p>
            <p>Password: <code className="bg-slate-200 px-1 py-0.5 rounded">Admin@FindIt2026</code></p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

