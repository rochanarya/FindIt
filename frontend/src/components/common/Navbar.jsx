import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, PlusCircle, User, LogOut, Shield, Menu, X, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Find<span className="text-blue-600">It</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/browse"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/browse') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Items
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-reports"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/my-reports') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Reports
                  </Link>
                  <Link
                    to="/my-claims"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/my-claims') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Claims
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Header Section */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/create-report"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2">
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 py-2 z-50 border border-slate-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-medium"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Browse Items
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Reports
              </Link>
              <Link
                to="/my-claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Claims
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-bold text-amber-700 bg-amber-50"
                >
                  Admin Console
                </Link>
              )}
              <Link
                to="/create-report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-blue-600 bg-blue-50"
              >
                + Report Item
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Profile ({user?.fullName})
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

