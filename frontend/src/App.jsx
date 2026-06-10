import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './utils/api';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobSearch from './pages/JobSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import MockInterview from './pages/MockInterview';
import TailorResume from './pages/TailorResume';

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminHealth from './pages/admin/AdminHealth';
import AdminExport from './pages/admin/AdminExport';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setUser(null);
        setAuthChecked(true);
        return;
      }
      try {
        const data = await api.get('/api/auth/get-me');
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.log('No active session / unauthorized.');
        setUser(null);
        sessionStorage.removeItem('token');
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogoutSuccess = () => {
    setUser(null);
    sessionStorage.removeItem('token');
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background bg-glow">
        <div className="text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-lg glow-primary spinner">
            VG
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">VidyaGuide</h2>
          <p className="text-text-muted text-sm animate-pulse">Initializing your career path...</p>
        </div>
      </div>
    );
  }

  // Handle routing guards for guest users
  if (!user) {
    return (
      <div className="bg-background min-h-screen bg-glow text-text-main">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background bg-glow text-text-main font-sans selection:bg-primary/30 selection:text-white">
      <Sidebar 
        user={user} 
        onLogoutSuccess={handleLogoutSuccess} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <main className={`flex-1 p-6 md:p-10 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full max-w-7xl mx-auto"
          >
            <Routes location={location}>
              {user?.role === 'admin' ? (
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers currentUser={user} />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/health" element={<AdminHealth />} />
                  <Route path="/admin/export" element={<AdminExport />} />
                  <Route path="/profile" element={<Profile />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/upload" element={<ResumeUpload />} />
                  <Route path="/tailor" element={<TailorResume />} />
                  <Route path="/jobs" element={<JobSearch />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/dashboard/mock-interview" element={<MockInterview />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
