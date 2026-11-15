import React, { useState, useEffect } from 'react';
import { Eye, Check, X, HelpCircle, Shield, AlertCircle, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Review Modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminService.getClaims(params);
      if (res.success && res.data) {
        setClaims(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, page]);

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await adminService.approveClaim(selectedClaim.id, { comment: adminComment });
      toast.success('Claim approved! Item has been marked as returned to claimant.');
      setSelectedClaim(null);
      setAdminComment('');
      fetchClaims();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to approve claim';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await adminService.rejectClaim(selectedClaim.id, { comment: adminComment });
      toast.success('Claim rejected.');
      setSelectedClaim(null);
      setAdminComment('');
      fetchClaims();
    } catch (err) {
      toast.error('Failed to reject claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedClaim) return;
    if (!adminComment.trim()) {
      toast.error('Please specify what additional information is needed');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.requestInformation(selectedClaim.id, { comment: adminComment });
      toast.success('Requested additional information from claimant');
      setSelectedClaim(null);
      setAdminComment('');
      fetchClaims();
    } catch (err) {
      toast.error('Failed to request information');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Claims Review Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review student ownership claims and verify proof before item handover</p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ADDITIONAL_INFORMATION_REQUIRED">Info Requested</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading claims..." />
      ) : claims.length === 0 ? (
        <EmptyState title="No claims found" description="There are no claims matching the selected filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Item</th>
                  <th className="px-6 py-3.5">Claimant</th>
                  <th className="px-6 py-3.5">Date Submitted</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{claim.item?.title}</div>
                      <div className="text-[11px] text-slate-500">{claim.item?.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{claim.claimant?.fullName}</div>
                      <div className="text-[11px] text-slate-500">{claim.claimant?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={claim.status}>{claim.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedClaim(claim); setAdminComment(''); }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title="Review Ownership Claim"
        maxWidth="max-w-2xl"
      >
        {selectedClaim && (
          <div className="space-y-5 text-xs">
            {/* Item Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedClaim.item?.title}</span>
                <Badge variant={selectedClaim.item?.status}>{selectedClaim.item?.status}</Badge>
              </div>
              <p className="text-slate-600">{selectedClaim.item?.description}</p>
              <div className="text-[11px] text-slate-400">
                Reported by {selectedClaim.item?.reportedBy?.fullName} • {selectedClaim.item?.location}
              </div>
            </div>

            {/* Claimant Details */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <div>
                <span className="text-slate-500">Claimant:</span>{' '}
                <span className="font-bold text-slate-900">{selectedClaim.claimant?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedClaim.claimant?.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Department:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedClaim.claimant?.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Student ID:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedClaim.claimant?.studentId || 'N/A'}</span>
              </div>
            </div>

            {/* Verification Answers */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">
                Claimant's Verification Statement
              </h4>
              <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap">
                {selectedClaim.description}
              </p>
            </div>

            {selectedClaim.verificationAnswers && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Identifying Secrets / Marks Provided
                </h4>
                <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap">
                  {selectedClaim.verificationAnswers}
                </p>
              </div>
            )}

            {/* Proof Image if provided */}
            {selectedClaim.proofImageUrl && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Uploaded Proof</h4>
                <div className="w-48 h-36 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={selectedClaim.proofImageUrl}
                    alt="Claim proof"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(selectedClaim.proofImageUrl, '_blank')}
                  />
                </div>
              </div>
            )}

            {/* Admin Comment Input */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Admin Review Comment / Note to Claimant
              </label>
              <textarea
                rows={3}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="e.g. Verified by serial number match. Please bring student ID to room 104."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleRequestInfo}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 font-bold hover:bg-orange-100"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Request More Info
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100"
                >
                  <X className="w-3.5 h-3.5" /> Reject Claim
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                >
                  <Check className="w-3.5 h-3.5" /> Approve & Hand Over
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminClaims;

