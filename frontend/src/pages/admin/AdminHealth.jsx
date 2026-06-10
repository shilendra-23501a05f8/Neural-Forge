import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Activity, Server, Database, Sparkles, RefreshCw, 
  AlertTriangle, Clock, ShieldCheck, HeartPulse 
} from 'lucide-react';
import '../../admin.css';

export default function AdminHealth() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/health');
      setHealthData(res.data || []);
    } catch (err) {
      console.error('Error fetching system health telemetry:', err);
      setError(err.message || 'Failed to retrieve system health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A (SaaS Provider)';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const getServiceIcon = (name) => {
    switch (name) {
      case 'backend':
        return <Server size={18} />;
      case 'mongodb':
        return <Database size={18} />;
      case 'gemini':
      case 'groq':
        return <Sparkles size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  const getServiceTitle = (name) => {
    switch (name) {
      case 'backend':
        return 'Express Backend API';
      case 'mongodb':
        return 'MongoDB Database';
      case 'gemini':
        return 'Google Gemini API';
      case 'groq':
        return 'Groq Llama/Whisper API';
      default:
        return name.toUpperCase();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">System Diagnostics</h1>
          <p className="text-text-muted text-sm mt-1">Real-time heartbeats, database status, event loop delay, and AI connection latencies</p>
        </div>
        <button 
          onClick={fetchHealth} 
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-surface border border-border-dark text-xs font-semibold text-text-main hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spinner' : ''}`} />
          <span>Trigger Diagnostics Check</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 max-w-xl">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Telemetry */}
      {loading && healthData.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh] text-text-muted">
          <div className="text-center space-y-3">
            <RefreshCw className="spinner text-primary mx-auto" size={36} />
            <p className="text-sm font-semibold">Executing health checks...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthData.map(svc => {
            const isHealthy = svc.status === 'healthy';
            const responseTimePercent = Math.min((svc.responseTimeMs / 1000) * 100, 100);
            
            // Custom color schema based on response speed
            let barColor = 'bg-green-500';
            if (svc.responseTimeMs > 500) {
              barColor = 'bg-red-500';
            } else if (svc.responseTimeMs > 250) {
              barColor = 'bg-amber-500';
            }

            return (
              <div 
                key={svc.service} 
                className="glass-card p-6 border border-border-dark flex flex-col justify-between hover:border-primary/30 transition-all duration-300 shadow-md relative overflow-hidden group"
              >
                {/* Glow Backdrop Highlight */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[50px] opacity-[0.03] transition-all duration-300 group-hover:opacity-[0.07] ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />

                {/* Service Status Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isHealthy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {getServiceIcon(svc.service)}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-main text-base">{getServiceTitle(svc.service)}</h3>
                      <p className="text-[10px] text-text-muted mt-0.5 font-mono uppercase tracking-wider">{svc.service}</p>
                    </div>
                  </div>
                  
                  {/* Status Pill Badge */}
                  <div className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-2 ${
                    isHealthy ? 'text-green-400 bg-green-500/10 border border-green-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isHealthy ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        isHealthy ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </span>
                    <span>{isHealthy ? 'Healthy' : 'Outage'}</span>
                  </div>
                </div>

                {/* Diagnostic Details */}
                <div className="space-y-4">
                  {/* Response Time and Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted font-medium">Ping Response</span>
                      <span className="text-text-main font-bold font-mono">{svc.responseTimeMs} ms</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${responseTimePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Rows */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-dark">
                    <div>
                      <span className="text-[10px] text-text-muted block font-medium uppercase tracking-wider">Active Uptime</span>
                      <span className="text-xs text-text-main font-bold mt-1 block font-mono">{formatUptime(svc.uptime)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block font-medium uppercase tracking-wider">SLA Rate (24h)</span>
                      <span className="text-xs text-primary font-bold mt-1 block font-mono">
                        {svc.rollingUptimeSla.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Last Checked timestamp footer */}
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted pt-2 border-t border-border-dark/60 font-mono">
                    <Clock size={12} />
                    <span>Checked at: {new Date(svc.lastCheckedAt).toLocaleTimeString()}</span>
                  </div>

                  {/* Service Error Box */}
                  {svc.error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono break-all">
                      <strong className="block mb-1 text-red-300 font-semibold uppercase tracking-wider text-[9px]">Outage Detail:</strong>
                      {svc.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diagnostics Explanation Footer */}
      <div className="glass-card border border-border-dark p-6 flex items-start gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <HeartPulse size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-text-main text-base">Telemetry Status & Cron Polling</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            A background checking worker automatically polls all services every 5 minutes to write statistics to MongoDB. The 24-hour SLA computes the rolling success percentage of these background heartbeats.
          </p>
        </div>
      </div>
    </div>
  );
}

