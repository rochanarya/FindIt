import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Shield, User } from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, size: 15 });
      if (res.success && res.data) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggleSuspend = async (user) => {
    try {
      if (user.active) {
        if (!window.confirm(`Suspend account for ${user.fullName}?`)) return;
        await adminService.suspendUser(user.id);
        toast.success(`Account for ${user.fullName} suspended`);
      } else {
        await adminService.activateUser(user.id);
        toast.success(`Account for ${user.fullName} reactivated`);
      }
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update account status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered Users</h1>
        <p className="text-xs text-slate-500 mt-1">Manage student accounts, verify roles, and handle suspensions</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState title="No registered users" description="No user accounts found." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Year</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{u.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{u.yearOfStudy || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleSuspend(u)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                            u.active
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {u.active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
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

export default AdminUsers;

