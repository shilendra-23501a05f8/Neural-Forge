import React, { useState, useRef } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Info, Sparkles } from 'lucide-react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

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
    // Limit to 10MB
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
    if (!file) {
      setError('Please select or drop a resume PDF file.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('selfDescription', selfDescription);

    try {
      // Endpoint POST /api/interview/
      const data = await api.upload('/api/interview/', formData);
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
  };

  if (result) {
    return (
      <div className="upload-page animate-fade-in">
        <div className="dashboard-header-row">
          <button className="btn-primary" onClick={resetForm}>
            Analyze Another Resume
          </button>
          <h2>Analysis Complete!</h2>
        </div>
        <ReportDetails report={result} />
      </div>
    );
  }

  return (
    <div className="upload-page animate-fade-in">
      <div className="page-header">
        <h1>Resume Analysis & Coaching</h1>
        <p className="subtitle">Submit your PDF resume against a target role for live AI scoring and prep material</p>
      </div>

      {error && (
        <div className="auth-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-card card animate-pulse">
          <div className="loading-content">
            <div className="pulse-sparkle">
              <Sparkles size={36} className="sparkle-icon spinner" />
            </div>
            <h2>Generating Live Career Mentor Report...</h2>
            <div className="loading-steps">
              <div className="step-row active">
                <CheckCircle size={16} />
                <span>Parsing PDF text safely</span>
              </div>
              <div className="step-row active">
                <CheckCircle size={16} />
                <span>Comparing skills matrix against target role</span>
              </div>
              <div className="step-row pending">
                <RefreshCw size={16} className="spinner" />
                <span>Mapping skill gaps and severity matrices</span>
              </div>
              <div className="step-row pending text-muted">
                <span>Predicting technical & behavioral questions</span>
              </div>
            </div>
            <p className="loading-hint">This usually takes about 10-15 seconds. Please do not close the page.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="upload-form-grid">
          {/* File Upload Zone */}
          <div className="form-column">
            <div className="form-group">
              <label className="section-label">Resume PDF File *</label>
              <div 
                className={`dropzone-card card ${isDragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
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
                  <div className="file-info-container">
                    <FileText size={48} className="file-icon-color" />
                    <div className="file-meta">
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" className="btn-secondary remove-file-btn" onClick={removeFile}>
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-prompt">
                    <Upload size={48} className="upload-icon-color" />
                    <h3>Drag & Drop Resume PDF</h3>
                    <p>or click to browse local files (max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="info-helper-box">
              <Info size={16} />
              <p>For best results, upload resumes that are single-column formatted and fully typed (avoid scanned image-only PDFs).</p>
            </div>
          </div>

          {/* Form Context Info */}
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="jobDescription" className="section-label">Target Job Role / Description *</label>
              <span className="input-hint">Paste the title or complete job description to match skills</span>
              <textarea
                id="jobDescription"
                rows={5}
                placeholder="Example: Software Engineer - React, Node.js, and MongoDB. Must have experience building secure REST APIs and frontend routers..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="selfDescription" className="section-label">Self-Description / Career Aspirations (Optional)</label>
              <span className="input-hint">Add key accomplishments or current focus areas to shape the roadmap</span>
              <textarea
                id="selfDescription"
                rows={4}
                placeholder="Example: I am a self-taught full-stack developer with 1 year of freelance experience. Looking to break into junior backend engineering. I have deep interest in microservices."
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary start-analysis-btn" disabled={!file || !jobDescription}>
              Analyze Resume & Build Prep Roadmap
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
