import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  User, Mail, FileText, Trash2, Upload, AlertCircle, CheckCircle, 
  RefreshCw, Calendar, Edit3, Shield, Key, Laptop, History, X 
} from 'lucide-react';

export default function Profile() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [user, setUser] = useState(null);
  
  // Resume Edit states
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [editingResumeName, setEditingResumeName] = useState('');
  const fileInputRef = useRef(null);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Password Change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sessions and History states
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);

  const fetchUserData = async () => {
    try {
      const data = await api.get('/api/auth/get-me');
      if (data.user) {
        setUser(data.user);
        setEditName(data.user.name);
        setEditEmail(data.user.email);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/resumeUpload/');
      setResumes(data.resumes || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Could not retrieve resumes from your profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsAndHistory = async () => {
    try {
      const [sessionsRes, historyRes] = await Promise.all([
        api.get('/api/auth/profile/active-sessions'),
        api.get('/api/auth/profile/login-history')
      ]);
      setActiveSessions(sessionsRes.data || []);
      setLoginHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching sessions/history:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchResumes();
    fetchSessionsAndHistory();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/api/auth/profile', { name: editName, email: editEmail });
      setSuccess("Profile updated successfully.");
      setUser(res.user);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      await api.put('/api/auth/profile/change-password', { currentPassword, newPassword });
      setSuccess("Password updated successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      setError(err.message || 'Failed to change password.');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to force log out this device session?")) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/api/auth/profile/active-sessions/revoke', { sessionId });
      setSuccess("Session revoked successfully.");
      fetchSessionsAndHistory();
    } catch (err) {
      console.error('Session revocation failed:', err);
      setError(err.message || 'Failed to revoke device session.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    uploadResumeFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadResumeFile(file);
  };

  const uploadResumeFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.upload('/api/resumeUpload/', formData);
      setSuccess(`"${file.name}" uploaded successfully.`);
      fetchResumes();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (resumeId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/resumeUpload/${resumeId}`);
      setSuccess(`"${filename}" deleted successfully.`);
      setResumes(prev => prev.filter(r => r._id !== resumeId));
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete resume.');
    }
  };

  const startRename = (resume) => {
    setEditingResumeId(resume._id);
    setEditingResumeName(resume.filename);
  };

  const cancelRename = () => {
    setEditingResumeId(null);
    setEditingResumeName('');
  };

  const saveRename = async (resumeId) => {
    if (!editingResumeName.trim()) {
      setError('Resume name cannot be empty.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/api/resumeUpload/rename/${resumeId}`, { newName: editingResumeName });
      setSuccess(res.message || 'Resume renamed successfully.');
      setResumes(prev => prev.map(r => r._id === resumeId ? { ...r, filename: res.filename } : r));
      setEditingResumeId(null);
    } catch (err) {
      console.error('Rename failed:', err);
      setError(err.message || 'Failed to rename resume.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Account & Profile Settings</h1>
        <p className="text-text-muted text-sm mt-1">Manage uploaded resumes, edit details, update credentials, and review logged devices</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Account Details */}
          <div className="p-6 glass-card border border-border-dark space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-sm text-text-main">Account Information</h3>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="px-2.5 py-1.5 rounded bg-surface hover:bg-surface/80 border border-border-dark text-[10px] font-semibold text-text-main flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 size={12} />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-surface border border-border-dark text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-surface border border-border-dark text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsEditingProfile(false); setEditName(user.name); setEditEmail(user.email); }} 
                    className="px-3.5 py-2 rounded bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-3 rounded-lg border border-border-dark bg-surface/30">
                  <User size={18} className="text-primary" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Full Name</span>
                    <span className="text-xs font-semibold text-text-main">{user?.name || 'Career Aspirant'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3.5 p-3 rounded-lg border border-border-dark bg-surface/30">
                  <Mail size={18} className="text-primary" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Email Address</span>
                    <span className="text-xs font-semibold text-text-main">{user?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-lg border border-border-dark bg-surface/30">
                  <Shield size={18} className="text-primary" />
                  <div>
                    <span className="text-[10px] text-text-muted block">System Privilege</span>
                    <span className="text-xs font-semibold text-secondary capitalize">{user?.role || 'user'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-primary" />
              <h3 className="font-heading font-bold text-sm text-text-main">Security & Credentials</h3>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-3 py-2 rounded bg-surface border border-border-dark text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="w-full px-3 py-2 rounded bg-surface border border-border-dark text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full px-3 py-2 rounded bg-surface border border-border-dark text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Resumes Manager */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 glass-card border border-border-dark space-y-5">
            <h3 className="font-heading font-bold text-sm text-text-main">Saved Resumes Manager</h3>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 gap-2 text-text-muted bg-surface/25 border border-border-dark rounded-xl">
                <RefreshCw className="spinner text-primary" size={24} />
                <p className="text-xs">Fetching profiles...</p>
              </div>
            ) : resumes.length === 0 ? (
              <p className="text-xs text-text-muted italic">You haven't uploaded any resumes to your profile yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {resumes.map((resume) => (
                  <div 
                    key={resume._id} 
                    className="flex justify-between items-center p-3.5 rounded-lg border border-border-dark bg-surface/30 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="text-secondary flex-shrink-0" size={18} />
                      <div className="min-w-0 flex-1">
                        {editingResumeId === resume._id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={editingResumeName}
                              onChange={(e) => setEditingResumeName(e.target.value)}
                              autoFocus
                              className="px-2 py-0.5 rounded bg-surface border border-primary text-xs text-text-main focus:outline-none flex-1"
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveRename(resume._id);
                                  if (e.key === 'Escape') cancelRename();
                              }}
                            />
                            <button onClick={() => saveRename(resume._id)} className="text-green-400 hover:text-green-300 cursor-pointer">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={cancelRename} className="text-text-muted hover:text-text-main cursor-pointer">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-semibold text-text-main truncate block max-w-[200px]" title={resume.filename}>
                              {resume.filename}
                            </span>
                            <button onClick={() => startRename(resume)} className="text-text-muted hover:text-text-main cursor-pointer flex-shrink-0">
                              <Edit3 size={11} />
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {formatDate(resume.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-text-muted hover:text-red-400 border border-transparent hover:border-red-500/20 cursor-pointer transition-colors"
                      onClick={() => handleDelete(resume._id, resume.filename)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Profile Dropzone */}
            <div className="space-y-3 pt-4 border-t border-border-dark">
              <span className="text-xs font-semibold text-text-main block">Upload a New Resume</span>
              <div 
                className={`w-full min-h-[120px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 relative ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border-dark hover:border-primary/40 bg-surface/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }}
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="spinner text-primary" size={24} />
                    <h4 className="text-xs font-semibold text-text-main">Parsing PDF...</h4>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={22} className="text-text-muted" />
                    <h4 className="text-xs font-semibold text-text-main">Select or Drop PDF</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: browser sessions & histories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Active Browser Sessions */}
        <div className="p-6 glass-card border border-border-dark space-y-4">
          <div className="flex items-center gap-2">
            <Laptop size={18} className="text-primary" />
            <h3 className="font-heading font-bold text-sm text-text-main">Active Browser Sessions</h3>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {activeSessions.length === 0 ? (
              <p className="text-xs text-text-muted italic">No active devices logged.</p>
            ) : (
              activeSessions.map(sess => (
                <div 
                  key={sess._id} 
                  className="flex justify-between items-center p-3 rounded-lg border border-border-dark bg-surface/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Laptop size={18} className="text-text-muted flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-text-main block truncate" title={sess.userAgent}>
                        {sess.userAgent.split(' ')[0]} on {sess.ipAddress}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Login: {new Date(sess.loginAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {sess.token !== sessionStorage.getItem('token') && (
                    <button 
                      onClick={() => handleRevokeSession(sess._id)}
                      className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Log Out
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Login History Ledger */}
        <div className="p-6 glass-card border border-border-dark space-y-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-primary" />
            <h3 className="font-heading font-bold text-sm text-text-main">Login History Ledger</h3>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {loginHistory.length === 0 ? (
              <p className="text-xs text-text-muted italic">No login logs available.</p>
            ) : (
              <div className="overflow-x-auto w-full border border-border-dark rounded-lg">
                <table className="w-full text-left text-xs text-text-main border-collapse">
                  <thead>
                    <tr className="bg-surface/40 border-b border-border-dark">
                      <th className="p-2.5 font-bold text-text-muted">Timestamp</th>
                      <th className="p-2.5 font-bold text-text-muted">IP Address</th>
                      <th className="p-2.5 font-bold text-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.slice(0, 10).map(hist => (
                      <tr key={hist._id} className="border-b border-border-dark/50 last:border-0 hover:bg-surface/20">
                        <td className="p-2.5 font-medium">{new Date(hist.loginAt).toLocaleString()}</td>
                        <td className="p-2.5 font-medium">{hist.ipAddress}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            hist.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {hist.active ? 'active' : 'inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
