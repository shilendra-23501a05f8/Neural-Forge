import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { Lock, Mail, User, AlertCircle, Loader, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const validateName = (val) => {
    if (!val) return 'Name is mandatory';
    if (val.length < 3) return 'Name must be at least 3 characters';
    if (/[^a-zA-Z0-9\s]/.test(val)) return 'Name must not contain special characters';
    return '';
  };

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

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (fieldErrors.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(val) }));
    }
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
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setFieldErrors({
      name: nameErr,
      email: emailErr,
      password: passwordErr
    });

    return !nameErr && !emailErr && !passwordErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', { name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.message || 'Registration failed. Try a different email.';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('already exists') || msgLower.includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (msgLower.includes('name')) {
        setFieldErrors(prev => ({ ...prev, name: msg }));
      } else if (msgLower.includes('password')) {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary">
              <Sparkles size={12} />
              <span>Step into a Smarter Career Journey</span>
            </div>
            <h1 className="text-5xl font-heading font-extrabold text-text-main leading-tight tracking-tight">
              Build the future of your career with{' '}
              <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                VidyaGuide
              </span>
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Create an account to gain unlimited access to our AI resume analysis systems, custom gap assessments, predictive interview simulators, and real-time job matching analytics.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-secondary">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">AI-Guided Skill Validation</h4>
                <p className="text-sm text-text-muted">Receive interactive 7-day roadmaps built specifically around your target job descriptions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-primary">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">Hologram Interview Practice</h4>
                <p className="text-sm text-text-muted">Simulate actual tech screening loops with predictive questions mapped to industry roles.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-accent">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">Direct Exporters & Monitors</h4>
                <p className="text-sm text-text-muted">Print customized PDF analysis reports, and export refined resumes directly to employers.</p>
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
            <h2 className="text-2xl font-heading font-extrabold text-text-main">Create Account</h2>
            <p className="text-sm text-text-muted mt-1">Join VidyaGuide to get personalized resume coaching</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 mb-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <CheckCircle2 className="flex-shrink-0" size={18} />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main" htmlFor="name">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-text-muted" size={18} />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => {
                    const err = validateName(name);
                    setFieldErrors(prev => ({ ...prev, name: err }));
                  }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                    fieldErrors.name ? 'border-red-500/50' : 'border-border-dark'
                  }`}
                  required
                />
              </div>
              {fieldErrors.name && (
                <span className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                  <AlertCircle size={12} />
                  {fieldErrors.name}
                </span>
              )}
            </div>

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
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={18} />
                  Creating account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
