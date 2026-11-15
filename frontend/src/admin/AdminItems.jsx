import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Shield, Trash2, Search, MapPin, Calendar, Tag } from 'lucide-react';
import { adminService } from '../services/adminService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';

export const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminService.getItems({ page, size: 12 });
      if (res.success && res.data) {
        setItems(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  const handleResolve = async (id) => {
    try {
      await adminService.resolveItem(id);
      toast.success('Item marked as resolved');
      fetchItems();
    } catch (err) {
      toast.error('Failed to resolve item');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await adminService.removeItem(id);
      toast.success('Listing removed successfully');
      fetchItems();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Items Moderation</h1>
        <p className="text-xs text-slate-500 mt-1">Review, resolve, or moderate all reported campus items</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading listings..." />
      ) : items.length === 0 ? (
        <EmptyState title="No items reported" description="There are currently no items in the database." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Item</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Reported By</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {item.location} • {item.itemDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.itemType}>{item.itemType}</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {item.category?.name || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{item.reportedBy?.fullName}</div>
                      <div className="text-[11px] text-slate-400">{item.reportedBy?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <Link
                        to={`/items/${item.id}`}
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="inline-flex items-center p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Mark Resolved"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="inline-flex items-center p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default AdminItems;

