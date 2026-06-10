import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function JobSearch() {
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobsList, setJobsList] = useState([]);
  const [searchedRole, setSearchedRole] = useState('');
  const [searchedLocation, setSearchedLocation] = useState('');

  // States for automated recommendations
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedRole, setRecommendedRole] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState('');
  const [hasHistory, setHasHistory] = useState(false);

  // Fetch recommended jobs based on latest report
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      setErrorRecs('');
      try {
        const data = await api.get('/api/interview/history');
        const reports = data.reports || [];
        if (reports.length > 0) {
          setHasHistory(true);
          const latestReport = reports[0];
          const role = latestReport.title || 'Software Engineer';
          setRecommendedRole(role);
          
          try {
            const jobData = await api.post('/api/jobs/search', { jobRole: role });
            setRecommendedJobs(jobData.response?.jobs || []);
          } catch (jobErr) {
            console.error('Failed to fetch recommended jobs:', jobErr);
            setErrorRecs('Failed to load recommended job openings automatically.');
          }
        } else {
          setHasHistory(false);
        }
      } catch (err) {
        console.error('Failed to load history in JobSearch:', err);
        setErrorRecs('Could not check history for recommendations.');
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) return;

    setLoading(true);
    setError('');
    setJobsList([]);
    setSearchedRole(jobRole);
    setSearchedLocation(location);

    try {
      const data = await api.post('/api/jobs/search', { jobRole, location });
      setJobsList(data.response?.jobs || []);
    } catch (err) {
      console.error('Job search failed:', err);
      setError(err.message || 'Agentic search failed. The scraper or model might be overloaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'shine':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      default:
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Agentic Job Finder</h1>
        <p className="text-text-muted text-sm mt-1">Our AI Agent crawls live openings on LinkedIn and Shine.com directly matching your target role</p>
      </div>

      {/* Unified Search Control Panel */}
      <div className="p-4 glass-card border border-border-dark">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative flex items-center">
            <Search className="absolute left-3.5 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Enter job role (e.g. Node.js Developer, React Engineer)..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
            />
          </div>
          
          <div className="md:col-span-4 relative flex items-center">
            <MapPin className="absolute left-3.5 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Location (e.g. India, Remote, London)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="md:col-span-3 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" 
            disabled={loading || !jobRole.trim()}
          >
            {loading ? (
              <>
                <RefreshCw className="spinner" size={16} />
                <span>Searching...</span>
              </>
            ) : (
              <span>Find Live Openings</span>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Results Board */}
      {loading ? (
        <div className="p-8 md:p-12 glass-card border border-border-dark flex items-center justify-center glow-primary">
          <div className="text-center max-w-md w-full space-y-6">
            <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse-glow">
              <Sparkles size={36} className="spinner" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-text-main">AI Agent is Searching Opportunities...</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Querying live index. Web-scraping public channels on LinkedIn and Shine matching <strong className="text-text-main">"{searchedRole}"</strong> {searchedLocation && `in "${searchedLocation}"`}.
            </p>
            
            <div className="w-full max-w-xs mx-auto h-1 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse-glow" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      ) : jobsList.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-lg text-text-main">Search Results for "{searchedRole}" {searchedLocation && `in "${searchedLocation}"`}</h3>
            <span className="px-2.5 py-0.5 rounded bg-surface border border-border-dark text-[10px] text-text-muted font-bold tracking-wide uppercase">
              {jobsList.length} Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsList.map((job, index) => (
              <div 
                key={index} 
                className="p-5 glass-card glass-card-hover border border-border-dark flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${getPlatformStyle(job.platform)}`}>
                      {job.platform}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-base text-text-main leading-tight line-clamp-2" title={job.title}>{job.title}</h4>
                    <div className="flex flex-col gap-1.5 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="flex-shrink-0" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Apply on {job.platform}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchedRole ? (
        <div className="flex flex-col items-center justify-center p-12 text-center gap-4 glass-card border border-border-dark">
          <Briefcase size={48} className="text-text-muted/40" />
          <div className="space-y-1 max-w-md">
            <h4 className="font-semibold text-text-main text-base">No live listings found</h4>
            <p className="text-xs text-text-muted leading-relaxed">The agent could not find active roles matching "{searchedRole}" {searchedLocation && `in "${searchedLocation}"`} right now. Try adjusting your search keywords.</p>
          </div>
        </div>
      ) : null}

      {/* Automatic Recommendations Section */}
      <div className="space-y-6 pt-6 border-t border-border-dark">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            <span>Personalized Matches</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-secondary/15 text-secondary border border-secondary/20 uppercase">
            Auto-Matched
          </span>
        </div>

        {loadingRecs ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-muted glass-card border border-border-dark">
            <RefreshCw className="spinner text-primary" size={32} />
            <p className="text-sm">Analyzing history and pulling matched jobs...</p>
          </div>
        ) : errorRecs ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{errorRecs}</span>
          </div>
        ) : !hasHistory ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4 glass-card border border-border-dark">
            <Sparkles size={32} className="text-text-muted/40 animate-pulse-glow" />
            <div className="space-y-1 max-w-md">
              <h4 className="font-semibold text-text-main text-base">Get Automated Recommendations</h4>
              <p className="text-xs text-text-muted leading-relaxed">Upload and analyze your resume first to automatically get active job recommendations matching your profile role.</p>
            </div>
            <Link to="/upload" className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer">
              Analyze Resume
            </Link>
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="space-y-4">
            <div className="text-xs text-text-muted">
              Found <strong className="text-text-main">{recommendedJobs.length}</strong> job openings matching your analyzed resume profile for <strong className="text-text-main">"{recommendedRole}"</strong>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job, index) => (
                <div 
                  key={index} 
                  className="p-5 glass-card glass-card-hover border border-border-dark flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${getPlatformStyle(job.platform)}`}>
                        {job.platform}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-secondary/10 border border-secondary/20 text-secondary">
                        Match
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-heading font-bold text-base text-text-main leading-tight line-clamp-2" title={job.title}>{job.title}</h4>
                      <div className="flex flex-col gap-1.5 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={14} className="flex-shrink-0" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="flex-shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>Apply on {job.platform}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4 glass-card border border-border-dark">
            <Briefcase size={48} className="text-text-muted/40" />
            <div className="space-y-1 max-w-md">
              <h4 className="font-semibold text-text-main text-base">No matches found for "{recommendedRole}"</h4>
              <p className="text-xs text-text-muted leading-relaxed">Our search agent couldn't find live postings matching your resume role at this moment. You can search manually above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
