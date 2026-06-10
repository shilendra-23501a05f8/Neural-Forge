import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Search, ShieldAlert, UserCheck, Trash2, Eye, RefreshCw, 
  X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const query = `?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}`;
      const res = await api.get(`/api/admin/users${query}`);
      const data = res.data || {};
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to retrieve users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); 
    fetchUsers();
  };

  const handleSuspend = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to suspend "${name}"? Suspended users will be immediately locked out of the system.`)) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/users/${userId}/suspend`);
      setSuccess(`Account for "${name}" has been suspended.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to suspend ${name}.`);
    }
  };

  const handleActivate = async (userId, name) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/users/${userId}/activate`);
      setSuccess(`Account for "${name}" has been activated.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to activate ${name}.`);
    }
  };

  const handleDelete = async (userId, name) => {
    if (userId === currentUser?._id) {
      setError("Privilege Protection Error: You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete user "${name}"? This action will cascade-delete all their resumes, ATS reports, interviews, and session logs. This is irreversible!`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setSuccess(`User "${name}" has been permanently deleted.`);
      setPage(1);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to delete ${name}.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">User Management</h1>
        <p className="text-text-muted text-sm mt-1">Suspend, activate, delete, and inspect registered system accounts</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="p-4 glass-card border border-border-dark">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
          <div className="relative flex items-center flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="relative">
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-text-main focus:outline-none cursor-pointer appearance-none pr-8 min-w-[120px]"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin Only</option>
              <option value="user">User Only</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">▼</div>
          </div>

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-text-main focus:outline-none cursor-pointer appearance-none pr-8 min-w-[120px]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">▼</div>
          </div>

          <button 
            type="submit" 
            className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </div>

      {/* User Records Table Card */}
      <div className="glass-card border border-border-dark overflow-hidden">
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-muted">
              <RefreshCw className="spinner text-primary" size={28} />
              <p className="text-xs font-semibold">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-12 text-xs text-text-muted italic">
              No accounts matching search criteria were found.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface/30 border-b border-border-dark text-text-muted font-bold">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/60 text-text-main font-medium">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-surface/15">
                    <td className="p-4 font-bold text-text-main">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted">{formatDate(u.lastActiveAt)}</td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1.5 rounded bg-surface hover:bg-surface/85 border border-border-dark text-[10px] font-bold text-text-main flex items-center gap-1 transition-colors cursor-pointer"
                          title="Inspect User details"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        {u.status === 'active' ? (
                          <button 
                            onClick={() => handleSuspend(u._id, u.name)}
                            className="p-1.5 rounded-lg border border-red-500/25 hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                            title="Suspend User"
                          >
                            <ShieldAlert size={12} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(u._id, u.name)}
                            className="p-1.5 rounded-lg border border-green-500/25 hover:bg-green-500/10 text-green-400 transition-colors cursor-pointer"
                            title="Activate User"
                          >
                            <UserCheck size={12} />
                          </button>
                        )}

                        <button 
                          onClick={() => handleDelete(u._id, u.name)}
                          className="p-1.5 rounded-lg border border-red-500/10 text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={u._id === currentUser?._id}
                          title={u._id === currentUser?._id ? "You cannot delete yourself" : "Delete Account"}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginator */}
        <div className="flex justify-between items-center p-4 bg-surface/20 border-t border-border-dark">
          <span className="text-xs text-text-muted font-medium">
            Showing <strong className="text-text-main">{users.length}</strong> of <strong className="text-text-main">{totalUsers}</strong> accounts
          </span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
              disabled={page === 1}
              className="p-1.5 rounded bg-surface hover:bg-surface/80 border border-border-dark text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-text-muted">
              Page <strong className="text-text-main">{page}</strong> of <strong className="text-text-main">{totalPages}</strong>
            </span>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={page === totalPages}
              className="p-1.5 rounded bg-surface hover:bg-surface/80 border border-border-dark text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Inspect Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md glass-card border border-border-dark shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border-dark flex justify-between items-center bg-surface/30">
              <h3 className="font-heading font-bold text-sm text-text-main">Account Telemetry Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-text-muted hover:text-text-main cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs text-text-muted">
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-semibold">Database ID</span>
                <span className="font-mono text-text-main text-[11px] select-all bg-surface/50 px-2 py-0.5 rounded border border-border-dark">{selectedUser._id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-semibold">Full Name</span>
                <span className="text-text-main font-bold">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-semibold">Email Address</span>
                <span className="text-text-main font-semibold">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-semibold">Role Privilege</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedUser.role === 'admin' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'
                }`}>{selectedUser.role}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-semibold">Account State</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedUser.status === 'active' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>{selectedUser.status}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-semibold">Last Active Clocked</span>
                <span className="text-text-main font-semibold">{formatDate(selectedUser.lastActiveAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Profile Created On</span>
                <span className="text-text-main font-semibold">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            <div className="p-4 border-t border-border-dark bg-surface/30 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/85 border border-border-dark text-xs font-semibold text-text-main cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
