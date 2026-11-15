import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, Edit3, Eye, Calendar, MapPin, Tag } from 'lucide-react';
import { itemService } from '../services/itemService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export const MyReportsPage = () => {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, LOST, FOUND, ACTIVE, RESOLVED
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Edit Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (activeTab === 'LOST') params.itemType = 'LOST';
      if (activeTab === 'FOUND') params.itemType = 'FOUND';
      if (activeTab === 'ACTIVE') params.status = 'OPEN';
      if (activeTab === 'RESOLVED') params.status = 'RESOLVED';

      const res = await itemService.getMyReports(params);
      if (res.success && res.data) {
        setReports(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load my reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await itemService.deleteItem(id);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditLocation(item.location);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await itemService.updateItem(editingItem.id, {
        title: editTitle,
        description: editDesc,
        location: editLocation,
      });
      toast.success('Report updated successfully');
      setEditingItem(null);
      fetchReports();
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Reports' },
    { key: 'LOST', label: 'Lost Items' },
    { key: 'FOUND', label: 'Found Items' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Item Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage listings you have submitted to the campus lost & found platform</p>
        </div>
        <Link
          to="/create-report"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Report
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(0); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading your reports..." />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports in this category"
          description="You haven't posted any items matching this status tab."
          action={
            <Link
              to="/create-report"
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              + Create a new report
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {reports.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={item.itemType}>{item.itemType}</Badge>
                      <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
                      <span className="text-[11px] text-slate-400 font-medium">#{item.category?.name}</span>
                    </div>
                    <Link
                      to={`/items/${item.id}`}
                      className="font-bold text-base text-slate-900 hover:text-blue-600 transition block truncate"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.itemDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/items/${item.id}`}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View item details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Edit report"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Report"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
            <input
              type="text"
              required
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="text-xs font-semibold px-4 py-2 rounded-xl border"
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

export default MyReportsPage;

