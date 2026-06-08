import React, { useState } from 'react';
import { api } from '../utils/api';
import { Search, MapPin, Briefcase, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function JobSearch() {
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobsList, setJobsList] = useState([]);
  const [searchedRole, setSearchedRole] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) return;

    setLoading(true);
    setError('');
    setJobsList([]);
    setSearchedRole(jobRole);

    try {
      // Endpoint is POST /api/jobs/search
      const data = await api.post('/api/jobs/search', { jobRole });
      setJobsList(data.response?.jobs || []);
    } catch (err) {
      console.error('Job search failed:', err);
      setError(err.message || 'Agentic search failed. The scraper or model might be overloaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformBadgeClass = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return 'badge-linkedin';
      case 'unstop':
        return 'badge-unstop';
      default:
        return 'badge-other';
    }
  };

  return (
    <div className="job-search-page animate-fade-in">
      <div className="page-header">
        <h1>Agentic Job Finder</h1>
        <p className="subtitle">Our AI Agent crawls live openings on LinkedIn and Unstop directly matching your target role</p>
      </div>

      <div className="search-bar-card card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Enter job role (e.g. Node.js Developer, React Engineer, Product Manager)..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary search-submit-btn" disabled={loading || !jobRole.trim()}>
            {loading ? (
              <>
                <RefreshCw className="spinner" size={18} />
                Searching...
              </>
            ) : (
              'Find Live Openings'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="auth-error-alert search-alert-spacing">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-card card">
          <div className="loading-content">
            <div className="pulse-sparkle">
              <Sparkles size={36} className="sparkle-icon spinner" />
            </div>
            <h2>AI Agent is Searching Opportunities...</h2>
            <p className="job-agent-searching-hint">
              Querying live index. Web-scraping public channels on LinkedIn and Unstop matching "{searchedRole}".
            </p>
            <div className="search-status-bar">
              <div className="status-progress-track">
                <div className="status-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      ) : jobsList.length > 0 ? (
        <div className="results-container animate-fade-in">
          <div className="results-info-row">
            <h3>Live Openings Found for "{searchedRole}"</h3>
            <span className="results-count-badge">{jobsList.length} opportunities</span>
          </div>

          <div className="jobs-grid">
            {jobsList.map((job, index) => (
              <div key={index} className="job-card card">
                <div className="job-card-header">
                  <span className={`platform-badge ${getPlatformBadgeClass(job.platform)}`}>
                    {job.platform}
                  </span>
                </div>

                <div className="job-card-body">
                  <h4 className="job-title">{job.title}</h4>
                  <div className="job-company-row">
                    <Briefcase size={16} />
                    <span>{job.company}</span>
                  </div>
                  <div className="job-location-row">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="job-card-footer">
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary apply-link-btn"
                  >
                    <span>Apply on {job.platform}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchedRole ? (
        <div className="empty-state-card card animate-fade-in">
          <Briefcase size={48} className="empty-icon" />
          <h4>No live listings found</h4>
          <p>The agent could not find active roles matching "{searchedRole}" right now. Try adjusting your search keywords (e.g. "Software Engineer" instead of a highly specific stack).</p>
        </div>
      ) : (
        <div className="empty-state-card card">
          <Briefcase size={48} className="empty-icon" />
          <h4>Start your job hunt</h4>
          <p>Enter a target career path above and let our agent scrapers do the search for you.</p>
        </div>
      )}
    </div>
  );
}
