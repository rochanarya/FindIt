import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, CheckCircle2, ShieldCheck, ArrowRight, Laptop, Key, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { itemService } from '../services/itemService';
import api from '../services/api';
import ItemCard from '../components/items/ItemCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const LandingPage = () => {
  const [stats, setStats] = useState({ totalReports: 0, resolvedItems: 0, activeReports: 0 });
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, featuredRes] = await Promise.all([
          api.get('/dashboard/stats'),
          itemService.getFeatured()
        ]);

        if (statsRes.data?.success && statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (featuredRes?.success && featuredRes?.data) {
          setFeaturedItems(featuredRes.data);
        }
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const categories = [
    { name: 'Electronics', count: 'Laptops, Phones, AirPods', icon: Laptop, color: 'text-blue-600 bg-blue-50' },
    { name: 'Keys', count: 'Room, Bike & Hostel Keys', icon: Key, color: 'text-amber-600 bg-amber-50' },
    { name: 'ID Cards', count: 'College IDs, Badges', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold mb-6 border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI-Powered Campus Lost & Found System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Lost Something? <span className="text-blue-600">Let's Find It.</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The official centralized lost and found platform for our campus. Report missing belongings, browse found items, and match reports with verified ownership proof.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto flex items-center bg-white p-2 rounded-2xl shadow-xl ring-1 ring-slate-200">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by item name, brand, color, or location (e.g., 'Dell laptop library')..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Search
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/create-report?type=LOST"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/browse?itemType=FOUND"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition"
            >
              Browse Found Items
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.totalReports}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Total Items Reported</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600">{stats.resolvedItems}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Successfully Returned</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-600">{stats.activeReports}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Active Campus Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How FindIt Works</h2>
          <p className="mt-2 text-sm text-slate-500">
            A seamless three-step process built to replace chaotic WhatsApp chats with verified campus security handovers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Report Your Item</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit details about what you lost or found with photos, location, colors, and distinguishing features.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Smart Match Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our automated algorithm matches lost and found listings by category, keywords, color, and location proximity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Claim & Security Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit proof of ownership. Campus security reviews verification details and securely releases the item.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Recently Reported Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recently Reported Items</h2>
            <p className="text-xs text-slate-500 mt-1">Latest listings posted across campus faculties and dorms</p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading recent listings..." />
        ) : featuredItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No items reported yet. Be the first to report a lost or found item!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Handled Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/browse?search=${encodeURIComponent(cat.name)}`}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition flex items-center gap-4 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-base">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-500">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

