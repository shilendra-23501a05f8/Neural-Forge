import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { Lock, Mail, AlertCircle, Loader, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const validateEmail = (val) => {
    if (!val) return 'Email address is mandatory';
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is mandatory';
    if (val.length < 6) return 'Password must contain at least 6 characters';
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setFieldErrors({
      email: emailErr,
      password: passwordErr
    });

    return !emailErr && !passwordErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }
      onLoginSuccess(data.user);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('no account') || msgLower.includes('email') || msgLower.includes('register')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (msgLower.includes('password') || msgLower.includes('invalid password')) {
        setFieldErrors(prev => ({ ...prev, password: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-background relative overflow-hidden">
      {/* Background Grains & Glowing Orbs */}
      <div className="absolute inset-0 bg-glow pointer-events-none z-0"></div>

      {/* Left Column: Hero/SaaS Marketing Landing View */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 relative overflow-hidden border-r border-border-dark z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-md glow-primary">
            VG
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-text-main">VidyaGuide</span>
        </div>

        <div className="my-auto max-w-xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles size={12} />
              <span>Next-Gen Career Mentoring Engine</span>
            </div>
            <h1 className="text-5xl font-heading font-extrabold text-text-main leading-tight tracking-tight">
              Unlock your true career potential with{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Coaching
              </span>
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              VidyaGuide gives you direct AI-driven roadmap planning, ATS optimization, and interactive mock interview simulation to elevate your job search.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-secondary">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">Tailor Resumes Instantly</h4>
                <p className="text-sm text-text-muted">Align keywords and fix skill gaps using AI recommendations in seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-primary">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">Simulate Mock Interviews</h4>
                <p className="text-sm text-text-muted">Speak or type with an adaptive interviewer agent that analyzes details in real-time.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-accent">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">Target Matching Jobs</h4>
                <p className="text-sm text-text-muted">Search, filter, and score live opportunities against your active profile.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-text-muted/60">
          © {new Date().getFullYear()} VidyaGuide. Created for career aspirants worldwide.
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md p-8 glass-card border border-border-dark shadow-2xl relative"
        >
          {/* Logo showing only on mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-sm shadow-sm">
              VG
            </div>
            <span className="font-heading font-bold text-lg text-text-main">VidyaGuide</span>
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-heading font-extrabold text-text-main">Welcome Back</h2>
            <p className="text-sm text-text-muted mt-1">Log in to resume your career mentoring sessions</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main" htmlFor="email">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-text-muted" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    const err = validateEmail(email);
                    setFieldErrors(prev => ({ ...prev, email: err }));
                  }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                    fieldErrors.email ? 'border-red-500/50' : 'border-border-dark'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                  <AlertCircle size={12} />
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main" htmlFor="password">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-text-muted" size={18} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => {
                    const err = validatePassword(password);
                    setFieldErrors(prev => ({ ...prev, password: err }));
                  }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                    fieldErrors.password ? 'border-red-500/50' : 'border-border-dark'
                  }`}
                  required
                />
              </div>
              {fieldErrors.password && (
                <span className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                  <AlertCircle size={12} />
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
