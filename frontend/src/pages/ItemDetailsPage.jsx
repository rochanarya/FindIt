import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, User, Shield, AlertTriangle, ArrowLeft, CheckCircle2, Sparkles, Image as ImageIcon, Trash2, Edit3, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { adminService } from '../services/adminService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import MatchCard from '../components/items/MatchCard';
import toast from 'react-hot-toast';

export const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Claim Modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimDesc, setClaimDesc] = useState('');
  const [verificationAnswers, setVerificationAnswers] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const fetchItemData = async () => {
    setLoading(true);
    try {
      const res = await itemService.getItemById(id);
      if (res.success && res.data) {
        setItem(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setSelectedImage(res.data.images[0].imageUrl);
        }
        setEditTitle(res.data.title);
        setEditDesc(res.data.description);
        setEditLocation(res.data.location);

        // If it's a lost item or found item, fetch matches
        fetchMatches(res.data.id);
      }
    } catch (err) {
      console.error('Failed to load item:', err);
      toast.error('Could not load item details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (itemId) => {
    setLoadingMatches(true);
    try {
      const res = await itemService.getMatches(itemId);
      if (res.success && res.data) {
        setMatches(res.data);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit an ownership claim');
      navigate('/login');
      return;
    }
    if (!claimDesc.trim()) {
      toast.error('Please explain why this item belongs to you');
      return;
    }

    setSubmittingClaim(true);
    try {
      const formData = new FormData();
      formData.append('itemId', item.id);
      formData.append('description', claimDesc.trim());
      if (verificationAnswers.trim()) {
        formData.append('verificationAnswers', verificationAnswers.trim());
      }
      if (proofImage) {
        formData.append('proofImage', proofImage);
      }

      const res = await claimService.createClaim(formData);
      if (res.success) {
        toast.success('Ownership claim submitted successfully! Campus security will review your proof.');
        setClaimModalOpen(false);
        setClaimDesc('');
        setVerificationAnswers('');
        setProofImage(null);
        fetchItemData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit claim';
      toast.error(msg);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    try {
      await itemService.deleteItem(item.id);
      toast.success('Report deleted successfully');
      navigate('/browse');
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await itemService.updateItem(item.id, {
        title: editTitle,
        description: editDesc,
        location: editLocation,
      });
      toast.success('Report updated successfully');
      setEditModalOpen(false);
      fetchItemData();
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  const handleAdminResolve = async () => {
    try {
      await adminService.resolveItem(item.id);
      toast.success('Item marked as resolved / returned');
      fetchItemData();
    } catch (err) {
      toast.error('Failed to resolve item');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading item details..." />;
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Item Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">This listing may have been removed or resolved.</p>
        <Link to="/browse" className="mt-4 inline-block text-sm font-bold text-blue-600">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === item.reportedBy?.id;
  const canClaim = item.itemType === 'FOUND' && item.status !== 'RESOLVED' && !isOwner;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 shadow-sm relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=60';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase">No photo uploaded</span>
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-1.5">
              <Badge variant={item.itemType}>{item.itemType}</Badge>
              <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {item.images && item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === img.imageUrl ? 'border-blue-600 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>{item.category?.name || 'Category'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.title}
            </h1>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="block text-slate-400 font-medium">Location</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Date {item.itemType === 'LOST' ? 'Lost' : 'Found'}</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.itemDate}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Color</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{item.color || 'Not specified'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Brand</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{item.brand || 'Not specified'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-slate-400 font-medium">Reported By</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> {item.reportedBy?.fullName} ({item.reportedBy?.department || 'Student'})
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Item Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white">
              {item.description}
            </p>
          </div>

          {/* Identifying Features (if any) */}
          {item.identifyingFeatures && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Identifying Characteristics
              </h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {item.identifyingFeatures}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {canClaim && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Claim This Item
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Report
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Report
                </button>
              </>
            )}

            {isAdmin && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleAdminResolve}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
                >
                  <Shield className="w-3.5 h-3.5" /> Mark Resolved
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Admin Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Potential Matches Section (Matching Engine Results) */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Potential Matches ({matches.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated algorithm comparison based on category, title similarity, keywords, color, brand, and location.
            </p>
          </div>
        </div>

        {loadingMatches ? (
          <div className="py-8 text-center text-xs text-slate-400">Comparing with active listings...</div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No matching suggestions found above the 50% confidence threshold yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <MatchCard key={match.matchedItem.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Submit Ownership Claim"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            You are submitting a claim for <strong className="text-slate-800">{item.title}</strong>. Please provide accurate details. Campus security verifies all claims prior to item release.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Why is this item yours? *
            </label>
            <textarea
              required
              rows={3}
              value={claimDesc}
              onChange={(e) => setClaimDesc(e.target.value)}
              placeholder="Explain where you lost it, contents, or personal marks..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Verification Answers (Serial Number, Lock Screen Wallpaper, Passcode Hint, Hidden Marks)
            </label>
            <textarea
              rows={2}
              value={verificationAnswers}
              onChange={(e) => setVerificationAnswers(e.target.value)}
              placeholder="e.g. Serial ending in 4920, lockscreen is a golden retriever, receipt available"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Upload Proof Image (Receipt, ID photo, or previous photo of the item)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofImage(e.target.files[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setClaimModalOpen(false)}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingClaim}
              className="text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              {submittingClaim ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Report Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Item Report"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
            <input
              type="text"
              required
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ItemDetailsPage;

