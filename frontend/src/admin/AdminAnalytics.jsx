import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminService.getAnalytics();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Crunching campus analytics..." />;
  }

  const chartData = stats?.monthlyTrends || [];
  const catData = stats?.categoryDistribution || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">Detailed statistical insights into lost item trends and resolution rates</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Resolution Efficiency</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {stats?.totalReports > 0 ? Math.round((stats.resolvedItems / stats.totalReports) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {stats?.resolvedItems || 0} returned out of {stats?.totalReports || 0} reported
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Lost vs Found Ratio</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">
            {stats?.lostReports || 0} : {stats?.foundReports || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Lost to found submission ratio</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Campus User Base</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-400 mt-1">Active verified student & admin accounts</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Report Volume
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" /> Category Breakdown
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

