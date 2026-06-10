import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Calendar, Briefcase, Eye, ChevronRight, RefreshCw, BarChart2, Star, AlertCircle, FileText, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/interview/history');
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Could not fetch history reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getAverageScore = () => {
    if (reports.length === 0) return 0;
    const total = reports.reduce((acc, r) => acc + (r.matchScore || 0), 0);
    return Math.round(total / reports.length);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Prepare chart data from reports
  const getChartData = () => {
    // Sort reports chronologically for the chart
    return [...reports]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(r => ({
        date: formatDate(r.createdAt),
        score: r.matchScore || 0,
        title: r.title || 'Report'
      }));
  };

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 rounded-lg bg-surface border border-border-dark text-sm text-text-muted hover:text-text-main hover:border-primary/50 transition-all cursor-pointer" 
            onClick={() => setSelectedReport(null)}
          >
            ← Back to History
          </button>
          <h2 className="text-xl font-heading font-extrabold text-text-main">Report Analysis</h2>
        </div>
        <ReportDetails report={selectedReport} />
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Your Career Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Track your resume matches, key skill gaps, and interview prep history</p>
        </div>
        <button 
          className="px-4 py-2.5 rounded-lg bg-surface border border-border-dark text-sm font-semibold text-text-main hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          onClick={fetchHistory} 
          disabled={loading}
        >
          <RefreshCw className={loading ? 'spinner' : ''} size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass-card border border-border-dark flex items-center gap-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center glow-primary">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-2xl font-heading font-extrabold text-text-main">{reports.length}</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">Resumes Analyzed</p>
          </div>
        </div>

        <div className="p-6 glass-card border border-border-dark flex items-center gap-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center glow-secondary">
            <BarChart2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-heading font-extrabold text-text-main">{getAverageScore()}%</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">Average Match Score</p>
          </div>
        </div>

        <div className="p-6 glass-card border border-border-dark flex items-center gap-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none"></div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Star size={22} />
          </div>
          <div>
            <p className="text-2xl font-heading font-extrabold text-text-main">
              {reports.length > 0 ? Math.max(...reports.map(r => r.matchScore || 0)) : 0}%
            </p>
            <p className="text-xs font-medium text-text-muted mt-0.5">Highest Score</p>
          </div>
        </div>
      </div>

      {/* Main Sections: Chart & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Chart Block */}
        {reports.length > 0 && (
          <div className="lg:col-span-12 p-6 glass-card border border-border-dark space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary" size={18} />
              <h3 className="font-heading font-bold text-text-main">Match Score Progress</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="score" name="Match Score" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History List Section */}
        <div className="lg:col-span-12 space-y-4">
          <h3 className="font-heading font-bold text-lg text-text-main">Coaching & Analysis History</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-muted glass-card border border-border-dark">
              <RefreshCw className="spinner text-primary" size={32} />
              <p className="text-sm">Loading your career history...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-4 glass-card border border-border-dark">
              <div className="w-16 h-16 rounded-full bg-surface/50 border border-border-dark flex items-center justify-center text-text-muted/40">
                <FileText size={28} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="font-semibold text-text-main text-base">No reports generated yet</h4>
                <p className="text-xs text-text-muted">Upload your resume and enter a target job description to get a full gap analysis and coaching roadmap.</p>
              </div>
              <Link to="/upload" className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer">
                Analyze Your Resume Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reports.map((report) => (
                <div 
                  key={report._id} 
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 glass-card glass-card-hover border border-border-dark cursor-pointer gap-4"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="space-y-2 min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-medium bg-surface/60 px-2.5 py-1 rounded-full border border-border-dark">
                      <Calendar size={12} />
                      {formatDate(report.createdAt)}
                    </span>
                    <h4 className="font-heading font-bold text-base text-text-main truncate">
                      {report.title || 'Career Profile Assessment'}
                    </h4>
                    <p className="text-xs text-text-muted flex items-center gap-1.5 truncate">
                      <Briefcase size={12} className="flex-shrink-0" />
                      <span>
                        {report.jobDescription ? (
                          report.jobDescription.length > 70 
                            ? `${report.jobDescription.substring(0, 70)}...` 
                            : report.jobDescription
                        ) : 'General Profile'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 md:border-l border-border-dark md:pl-6 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">Match Score</span>
                      <span className="text-xl font-heading font-extrabold text-primary">{report.matchScore}%</span>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer">
                      <Eye size={14} />
                      <span>View</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
