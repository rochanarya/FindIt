import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Lock, Mail, User, BookOpen, GraduationCap, IdCard, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid college email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  studentId: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
  yearOfStudy: z.string().min(1, 'Year of study is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      yearOfStudy: '1st Year',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await registerAuth({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        studentId: data.studentId || null,
        department: data.department,
        yearOfStudy: data.yearOfStudy,
      });
      toast.success(`Welcome to FindIt, ${user.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Find<span className="text-blue-600">It</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Create Student Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Join the campus lost & found network to report belongings and verify claims
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="e.g. Jordan Bell"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Email Address *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="jordan@campus.edu"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="Min 6 characters"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Confirm password"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    {...register('studentId')}
                    placeholder="CS-2024-81"
                    className="block w-full pl-9 pr-2 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    {...register('department')}
                    placeholder="e.g. Computer Science"
                    className="block w-full pl-9 pr-2 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                {errors.department && <p className="mt-1 text-xs text-rose-600">{errors.department.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Year of Study *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <select
                    {...register('yearOfStudy')}
                    className="block w-full pl-9 pr-2 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Faculty/Staff">Faculty/Staff</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register Account
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

