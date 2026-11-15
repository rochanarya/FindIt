import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink, CheckCheck } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ page, size: 15 });
      if (res.success && res.data) {
        setNotifications(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Updates on your reported items, matching alerts, and claim reviews</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New alerts about claims and potential matches will show up here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition hover:bg-slate-50/70 ${
                !n.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${!n.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <h4 className={`text-sm ${!n.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 ml-auto">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-4">{n.message}</p>
                {n.relatedItemId && (
                  <div className="pl-4 pt-1">
                    <Link
                      to={`/items/${n.relatedItemId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View related item <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default NotificationsPage;

