import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Info, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumeUpload() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('saved'); // 'saved' or 'upload'
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch saved resumes list on mount
  useEffect(() => {
    const fetchResumesList = async () => {
      try {
        const data = await api.get('/api/resumeUpload/');
        const list = data.resumes || [];
        setSavedResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          setResumeSource('saved');
        } else {
          setResumeSource('upload');
        }
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        setResumeSource('upload');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumesList();
  }, []);

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
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (resumeSource === 'saved' && !selectedResumeId) {
      setError('Please select a saved resume from the dropdown.');
      return;
    }
    if (resumeSource === 'upload' && !file) {
      setError('Please select or drop a resume PDF file.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let data;
      if (resumeSource === 'saved') {
        data = await api.post('/api/interview/', {
          resumeId: selectedResumeId,
          jobDescription,
          selfDescription
        });
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        formData.append('selfDescription', selfDescription);
        data = await api.upload('/api/interview/', formData);
      }
      setResult(data.response);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'An error occurred during resume analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setSelfDescription('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Refresh saved resumes
    setResumesLoading(true);
    api.get('/api/resumeUpload/')
      .then(data => {
        const list = data.resumes || [];
        setSavedResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          setResumeSource('saved');
        } else {
          setResumeSource('upload');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setResumesLoading(false));
  };

  const isSubmitDisabled = () => {
    if (!jobDescription) return true;
    if (resumeSource === 'saved' && !selectedResumeId) return true;
    if (resumeSource === 'upload' && !file) return true;
    return false;
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-heading font-extrabold text-text-main">Analysis Complete!</h2>
          <button 
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer" 
            onClick={resetForm}
          >
            Analyze Another Resume
          </button>
        </div>
        <ReportDetails report={result} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Resume Analysis & Coaching</h1>
        <p className="text-text-muted text-sm mt-1">Submit your PDF resume against a target role for live AI scoring and prep material</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 md:p-12 glass-card border border-border-dark flex items-center justify-center glow-primary">
          <div className="text-center max-w-md w-full space-y-6">
            <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse-glow">
              <Sparkles size={36} className="spinner" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-text-main">Generating Live Career Mentor Report...</h2>
            
            <div className="space-y-3 pt-4 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                <CheckCircle size={16} className="text-primary" />
                <span>Parsing PDF text safely</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                <CheckCircle size={16} className="text-primary" />
                <span>Comparing skills matrix against target role</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-primary font-semibold">
                <RefreshCw size={16} className="spinner" />
                <span>Mapping skill gaps and severity matrices</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-text-muted/50 font-semibold">
                <div className="w-4 h-4 rounded-full border border-border-dark flex-shrink-0"></div>
                <span>Predicting technical & behavioral questions</span>
              </div>
            </div>
            
            <p className="text-xs text-text-muted pt-4">This usually takes about 10-15 seconds. Please do not close the page.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: File Upload */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 glass-card border border-border-dark space-y-4">
              <div>
                <label className="text-sm font-semibold text-text-main">Resume Selector *</label>
                <p className="text-[11px] text-text-muted mt-0.5">Select a saved resume from your profile or upload a new file</p>
              </div>
              
              {resumesLoading ? (
                <div className="flex items-center gap-2 text-xs text-text-muted p-3.5 rounded-lg border border-border-dark bg-surface/30">
                  <RefreshCw className="spinner" size={14} />
                  <span>Loading your resumes...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border-dark text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
                    value={resumeSource === 'upload' ? 'upload' : selectedResumeId}
                    onChange={(e) => {
                      if (e.target.value === 'upload') {
                        setResumeSource('upload');
                        setSelectedResumeId('');
                      } else {
                        setResumeSource('saved');
                        setSelectedResumeId(e.target.value);
                      }
                    }}
                  >
                    {savedResumes.map(r => (
                      <option key={r._id} value={r._id}>
                        💾 {r.filename}
                      </option>
                    ))}
                    <option value="upload">➕ Upload a new resume...</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    ▼
                  </div>
                </div>
              )}
            </div>

            {resumeSource === 'upload' ? (
              <div className="p-6 glass-card border border-border-dark space-y-4">
                <label className="text-sm font-semibold text-text-main">Upload PDF *</label>
                
                <div 
                  className={`w-full min-h-[200px] rounded-xl border border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative ${
                    isDragOver 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                      : file 
                        ? 'border-secondary/40 bg-secondary/5' 
                        : 'border-border-dark hover:border-primary/40 bg-surface/30'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!file ? triggerFileSelect : undefined}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                    style={{ display: 'none' }}
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center glow-secondary">
                        <FileText size={28} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-text-main truncate max-w-[280px]">{file.name}</p>
                        <p className="text-[11px] text-text-muted font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button" 
                        className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-red-400 hover:text-red-300 hover:border-red-500/30 transition-all cursor-pointer" 
                        onClick={removeFile}
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Upload size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-text-main">Drag & Drop Resume PDF</h3>
                        <p className="text-xs text-text-muted">or click to browse local files (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 glass-card border border-border-dark flex items-start gap-4 animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent pointer-events-none"></div>
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <FolderOpen size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-text-main">Saved Resume Selected</h4>
                  <p className="text-xs text-text-muted leading-relaxed">Using stored resume data from your profile. No additional upload required.</p>
                  <Link to="/profile" className="inline-block text-xs font-semibold text-primary hover:text-primary-hover pt-1">
                    Manage your Resumes →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-surface/30 border border-border-dark text-xs text-text-muted leading-relaxed">
              <Info className="text-primary flex-shrink-0 mt-0.5" size={14} />
              <p>For best results, upload resumes that are single-column formatted, plain text compatible, and fully typed.</p>
            </div>
          </div>

          {/* Right Column: Target Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 glass-card border border-border-dark space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="jobDescription" className="text-sm font-semibold text-text-main">Target Job Role / Description *</label>
                <p className="text-[11px] text-text-muted">Paste the title or complete job description to match skills</p>
                <textarea
                  id="jobDescription"
                  rows={5}
                  placeholder="Example: Software Engineer - React, Node.js, and MongoDB. Must have experience building secure REST APIs..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="selfDescription" className="text-sm font-semibold text-text-main">Self-Description / Career Aspirations (Optional)</label>
                <p className="text-[11px] text-text-muted">Add key accomplishments or current focus areas to shape the roadmap</p>
                <textarea
                  id="selfDescription"
                  rows={4}
                  placeholder="Example: I am a self-taught developer with 1 year experience..."
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" 
                disabled={isSubmitDisabled() || loading}
              >
                <span>Analyze Resume & Build Prep Roadmap</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
