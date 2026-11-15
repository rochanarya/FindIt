import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, FileText, CheckCircle2, AlertTriangle, ArrowRight, Clock, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myLostReports: 0,
    myFoundReports: 0,
    myActiveClaims: 0,
    myResolvedItems: 0,
  });
  const [myRecentReports, setMyRecentReports] = useState([]);
  const [myRecentClaims, setMyRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, reportsRes, claimsRes] = await Promise.all([
          api.get('/dashboard/student'),
          itemService.getMyReports({ page: 0, size: 5 }),
          claimService.getMyClaims({ page: 0, size: 4 }),
        ]);

        if (statsRes.data?.success && statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (reportsRes?.success && reportsRes?.data) {
          setMyRecentReports(reportsRes.data.content || []);
        }
        if (claimsRes?.success && claimsRes?.data) {
          setMyRecentClaims(claimsRes.data.content || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your campus dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md mb-2">
            Student Portal • {user?.department || 'Campus Student'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="mt-1 text-blue-100 text-xs sm:text-sm max-w-xl">
            Track your lost items, review found item submissions, and monitor verification status in real-time.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/create-report?type=LOST"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4 text-rose-500" />
            Report Lost Item
          </Link>
          <Link
            to="/create-report?type=FOUND"
            className="inline-flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/20 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Report Found Item
          </Link>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900/80 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition"
          >
            <Search className="w-4 h-4" />
            Browse Items
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Lost Reports</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.myLostReports || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pending recovery</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Found Reports</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PlusCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.myFoundReports || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Reported to campus</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Claims</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{stats.myActiveClaims || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Under security review</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolved Items</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.myResolvedItems || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Returned safely</p>
        </div>
      </div>

      {/* Main Grid: Latest Reports & Active Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Latest Reports */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Recent Reports</h2>
              <p className="text-xs text-slate-500">Items you reported as lost or found</p>
            </div>
            <Link
              to="/my-reports"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myRecentReports.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm font-semibold text-slate-700">No reports created yet</p>
              <p className="text-xs text-slate-400 mt-1">Did you lose or find something on campus?</p>
              <Link
                to="/create-report"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-xl"
              >
                Create your first report
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myRecentReports.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Tag className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/items/${item.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition truncate block"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        <span>•</span>
                        <span>{item.itemDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.itemType}>{item.itemType}</Badge>
                    <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Active Claims */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Claims</h2>
              <p className="text-xs text-slate-500">Status of your ownership claims</p>
            </div>
            <Link
              to="/my-claims"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              All claims <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myRecentClaims.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 border border-dashed border-slate-200 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No submitted claims</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                Browse found items and submit a claim if you spot your missing item.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {myRecentClaims.map((claim) => (
                <div key={claim.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{claim.item?.title}</p>
                    <Badge variant={claim.status}>{claim.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                  {claim.adminComment && (
                    <div className="mt-2 text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-600">
                      <span className="font-semibold text-slate-800">Admin:</span> {claim.adminComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

