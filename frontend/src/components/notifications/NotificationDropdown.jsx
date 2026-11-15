import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ page: 0, size: 5 });
      if (res.success && res.data) {
        setNotifications(res.data.content || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <h4 className="font-semibold text-slate-900 text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition hover:bg-slate-50 flex items-start justify-between gap-3 ${
                    !n.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex-1">
                    <p className={`text-xs ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    {n.relatedItemId && (
                      <Link
                        to={`/items/${n.relatedItemId}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium mt-1.5"
                      >
                        View item <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as read"
                      className="text-slate-400 hover:text-blue-600 p-1"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2.5 text-center bg-slate-50/50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              See all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

