import React, { useState, useEffect } from 'react';
import { History, Shield, User, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ page, size: 15 });
      if (res.success && res.data) {
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-1">Immutable record of administrative actions, claim decisions, and account changes</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading audit log records..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit logs recorded"
          description="Administrative actions (approvals, suspensions, removals) will appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Admin</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Target</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{log.adminName}</div>
                      <div className="text-[10px] text-slate-400">{log.adminEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                      {log.details}
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

export default AdminAuditLogs;

