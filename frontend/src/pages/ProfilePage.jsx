import React, { useState, useEffect } from 'react';
import { User, Mail, IdCard, BookOpen, GraduationCap, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, updateCurrentUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '1st Year');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setStudentId(user.studentId || '');
      setDepartment(user.department || '');
      setYearOfStudy(user.yearOfStudy || '1st Year');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile({
        fullName,
        studentId,
        department,
        yearOfStudy,
      });
      if (res.success && res.data) {
        updateCurrentUser(res.data);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your student details and campus affiliation</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              <Shield className="w-3 h-3" /> {user?.role} Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              College Email (Fixed)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Contact security to change college email credentials</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student ID
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="CS-2024-01"
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Year of Study
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
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

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

