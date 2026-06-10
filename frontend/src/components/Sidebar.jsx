import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  LogOut, 
  User, 
  ClipboardList, 
  MessageSquare, 
  Wand2, 
  Sparkles, 
  Activity, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ user, onLogoutSuccess, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      onLogoutSuccess();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      onLogoutSuccess();
      navigate('/login');
    }
  };

  const navItems = user?.role === 'admin' ? [
    { to: "/", label: "Admin Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "User Manager", icon: User },
    { to: "/admin/analytics", label: "AI Analytics", icon: Sparkles },
    { to: "/admin/health", label: "System Health", icon: Activity },
    { to: "/admin/export", label: "Export Reports", icon: Download },
    { to: "/profile", label: "Profile Settings", icon: User }
  ] : [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Resume Coaching", icon: FileText },
    { to: "/tailor", label: "Resume Tailoring", icon: Wand2 },
    { to: "/jobs", label: "Job Search", icon: Briefcase },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/quiz", label: "Interview Quiz", icon: ClipboardList },
    { to: "/dashboard/mock-interview", label: "Mock Interview", icon: MessageSquare }
  ];

  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between py-6 px-4 glass-panel border-r border-border-dark"
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-7 -right-3 flex items-center justify-center w-6 h-6 rounded-full bg-surface border border-border-dark text-text-muted hover:text-text-main shadow-lg hover:border-primary/50 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Brand Header */}
        <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-base shadow-md glow-primary">
            VG
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-heading font-bold text-lg bg-gradient-to-r from-text-main via-text-main to-text-muted bg-clip-text text-transparent"
            >
              VidyaGuide
            </motion.span>
          )}
        </div>

        {/* User Mini Profile */}
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border-dark mb-6 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <User size={16} />
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <p className="font-semibold text-xs text-text-main truncate">{user?.name || 'Career Aspirant'}</p>
              <p className="text-[10px] text-text-muted truncate">
                {user?.role === 'admin' ? `[ADMIN] ${user?.email}` : user?.email}
              </p>
            </motion.div>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {user?.role === 'admin' && !collapsed && (
            <div className="text-[10px] font-bold text-text-muted/40 tracking-wider px-3 mb-2">
              ADMIN PORTAL
            </div>
          )}
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => 
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm' 
                      : 'text-text-muted hover:text-text-main hover:bg-surface/50'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon size={18} className="flex-shrink-0 group-hover:scale-105 transition-transform" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                
                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-16 hidden group-hover:flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-text-main bg-surface border border-border-dark rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <button 
        onClick={handleLogout}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
      >
        <LogOut size={18} className="flex-shrink-0 group-hover:scale-105 transition-transform" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="truncate"
          >
            Log Out
          </motion.span>
        )}
        {collapsed && (
          <div className="absolute left-16 hidden group-hover:flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-red-400 bg-surface border border-border-dark rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none">
            Log Out
          </div>
        )}
      </button>
    </motion.aside>
  );
}
