import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, AlertCircle, CheckCircle2, TrendingUp, ArrowRight, Eye, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashRes, claimsRes, itemsRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getClaims({ page: 0, size: 5, status: 'PENDING' }),
          adminService.getItems({ page: 0, size: 5 }),
        ]);

        if (dashRes.success && dashRes.data) {
          setStats(dashRes.data);
        }
        if (claimsRes.success && claimsRes.data) {
          setRecentClaims(claimsRes.data.content || []);
        }
        if (itemsRes.success && itemsRes.data) {
          setRecentItems(itemsRes.data.content || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading campus administration analytics..." />;
  }

  const chartData = stats?.monthlyTrends || [];
  const catData = stats?.categoryDistribution || [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Platform analytics, active reports, and pending ownership claims</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">{stats?.totalReports || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lost Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">{stats?.lostReports || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Found Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">{stats?.foundReports || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Claims</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-2">{stats?.pendingClaims || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved Items</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">{stats?.resolvedItems || 0}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Report Volume
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Listings by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Claims Pending Review & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Claims Pending Review */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Pending Claims Needing Review</h3>
            <Link to="/admin/claims" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Review all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentClaims.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl">
              No pending claims at this moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{claim.item?.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Claimed by <span className="font-semibold text-slate-700">{claim.claimant?.fullName}</span>
                    </p>
                  </div>
                  <Link
                    to="/admin/claims"
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Items Reported */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Campus Listings</h3>
            <Link to="/admin/items" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Manage items <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {item.location} • {item.itemDate}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={item.itemType}>{item.itemType}</Badge>
                  <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

