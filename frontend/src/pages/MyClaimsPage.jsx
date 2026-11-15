import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, Send, Eye, MessageSquareQuote } from 'lucide-react';
import { claimService } from '../services/claimService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export const MyClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Additional info modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submittingInfo, setSubmittingInfo] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await claimService.getMyClaims({ page, size: 10 });
      if (res.success && res.data) {
        setClaims(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load my claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [page]);

  const handleProvideInfo = async (e) => {
    e.preventDefault();
    if (!additionalInfo.trim()) {
      toast.error('Please enter the required information');
      return;
    }

    setSubmittingInfo(true);
    try {
      await claimService.provideAdditionalInfo(selectedClaim.id, {
        additionalInformation: additionalInfo.trim(),
      });
      toast.success('Additional verification information submitted');
      setSelectedClaim(null);
      setAdditionalInfo('');
      fetchClaims();
    } catch (err) {
      toast.error('Failed to submit additional information');
    } finally {
      setSubmittingInfo(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Ownership Claims</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track the verification and approval progress of claims you submitted for found campus items
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your claims..." />
      ) : claims.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No claims submitted yet"
          description="If you see a found item that belongs to you on the browse page, you can submit an ownership claim."
          action={
            <Link
              to="/browse?type=FOUND"
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Browse found items →
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {claim.item?.images && claim.item.images.length > 0 ? (
                      <img src={claim.item.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                        Item
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/items/${claim.item?.id}`}
                      className="font-bold text-base text-slate-900 hover:text-blue-600 transition block"
                    >
                      {claim.item?.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Claim submitted on {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant={claim.status}>{claim.status.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Claimant's explanation */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1 border border-slate-100">
                <p className="font-semibold text-slate-800">Your Ownership Description:</p>
                <p className="italic">"{claim.description}"</p>
                {claim.verificationAnswers && (
                  <p className="pt-1 text-slate-600">
                    <span className="font-semibold text-slate-800">Verification details:</span> {claim.verificationAnswers}
                  </p>
                )}
              </div>

              {/* Admin Feedback Box */}
              {claim.adminComment && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
                  <MessageSquareQuote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Campus Security Review Comment:</span>
                    <p className="mt-0.5">{claim.adminComment}</p>
                  </div>
                </div>
              )}

              {/* Action for additional info */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/items/${claim.item?.id}`}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Item Details
                </Link>

                {claim.status === 'ADDITIONAL_INFORMATION_REQUIRED' && (
                  <button
                    onClick={() => { setSelectedClaim(claim); setAdditionalInfo(''); }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Provide Requested Information
                  </button>
                )}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Additional Information Modal */}
      <Modal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title="Submit Additional Verification Details"
      >
        <form onSubmit={handleProvideInfo} className="space-y-4">
          <p className="text-xs text-slate-500">
            Campus security requested extra verification for <strong className="text-slate-800">{selectedClaim?.item?.title}</strong>:
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            <strong>Admin Request:</strong> {selectedClaim?.adminComment}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Your Additional Details *
            </label>
            <textarea
              required
              rows={4}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide serial numbers, receipts, matching decals, or contact info..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedClaim(null)}
              className="text-xs font-semibold px-4 py-2 rounded-xl border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingInfo}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              {submittingInfo ? 'Sending...' : 'Submit to Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyClaimsPage;

