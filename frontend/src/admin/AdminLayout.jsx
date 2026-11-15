import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CheckSquare,
  Users,
  Tags,
  BarChart3,
  History,
  ArrowLeft,
  Shield,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Items Moderation', path: '/admin/items', icon: Package },
    { name: 'Claims Review', path: '/admin/claims', icon: CheckSquare },
    { name: 'Users Management', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Shield className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">FindIt Admin</span>
              <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">Campus Security</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 bg-slate-950/40">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Administration Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Outlet View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

