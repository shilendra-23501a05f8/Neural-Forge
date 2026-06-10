import React from 'react';
import { 
  Users, FileText, ClipboardList, MessageSquare, Sparkles, 
  FileSpreadsheet, Download, ShieldCheck, AlertCircle 
} from 'lucide-react';
import '../../admin.css';

export default function AdminExport() {
  const BASE_URL = 'http://localhost:3000/api/admin/export';

  const getBadgeStyles = (colorName) => {
    switch (colorName) {
      case 'kpi-blue':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'kpi-green':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'kpi-purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'kpi-orange':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const exportCategories = [
    {
      title: 'Users Directory',
      description: 'Export all registered accounts including metadata like registration timestamp, last active activity, status, and system role.',
      endpoint: '/users',
      icon: <Users size={18} />,
      badgeColor: 'kpi-blue'
    },
    {
      title: 'ATS Match Reports',
      description: 'Export parsed resume analyses containing job description details, match scores, resume filename, and user association references.',
      endpoint: '/ats',
      icon: <FileText size={18} />,
      badgeColor: 'kpi-green'
    },
    {
      title: 'Mock Interview Sessions',
      description: 'Export mock interview runs containing job role targets, difficulty levels, scores (overall, technical, communication), and status.',
      endpoint: '/interviews',
      icon: <MessageSquare size={18} />,
      badgeColor: 'kpi-purple'
    },
    {
      title: 'AI Analytics Log Ledger',
      description: 'Export complete historical analytics logs tracking LLM provider (Gemini/Groq), tokens used, response round-trip latencies, success codes, and error traces.',
      endpoint: '/analytics',
      icon: <Sparkles size={18} />,
      badgeColor: 'kpi-orange'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Export Reports</h1>
        <p className="text-text-muted text-sm mt-1">Export database directories in CSV, Microsoft Excel (.xlsx), or Adobe PDF formats</p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportCategories.map(cat => (
          <div 
            key={cat.title} 
            className="glass-card p-6 border border-border-dark flex flex-col justify-between hover:border-primary/30 transition-all duration-300 shadow-md relative overflow-hidden group"
          >
            <div>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBadgeStyles(cat.badgeColor)}`}>
                  {cat.icon}
                </div>
                <h3 className="font-heading font-bold text-text-main text-base">{cat.title}</h3>
              </div>
              
              {/* Category Description */}
              <p className="text-sm text-text-muted leading-relaxed mb-6">{cat.description}</p>
            </div>
            
            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border-dark">
              <a 
                href={`${BASE_URL}${cat.endpoint}?format=csv`}
                download
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-border-dark text-text-main hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                <Download size={14} className="shrink-0" />
                <span>CSV</span>
              </a>

              <a 
                href={`${BASE_URL}${cat.endpoint}?format=xlsx`}
                download
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-500/5 border border-green-500/10 text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all duration-200 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                <FileSpreadsheet size={14} className="shrink-0" />
                <span>Excel</span>
              </a>

              <a 
                href={`${BASE_URL}${cat.endpoint}?format=pdf`}
                download
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                <FileText size={14} className="shrink-0" />
                <span>PDF Report</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Explanatory Info Card */}
      <div className="glass-card border border-border-dark p-6 flex items-start gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-text-main text-base">Data Streams & Memory Performance</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            Exports query and compile rows dynamically using database cursor buffers, writing chunks directly to the response download. Large records are streamed efficiently without causing high memory consumption on the server.
          </p>
        </div>
      </div>
    </div>
  );
}
