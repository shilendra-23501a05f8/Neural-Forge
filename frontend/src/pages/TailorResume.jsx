import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Info, 
  Sparkles, 
  FolderOpen, 
  Printer, 
  Download, 
  Edit3, 
  Save, 
  LayoutTemplate, 
  Briefcase, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TemplateRenderer from '../components/templates/TemplateRenderer';
import ResumeEditor from '../components/ResumeEditor';
import { exportToDocx } from '../utils/docxExport';

export default function TailorResume() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('saved'); // 'saved' or 'upload'
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [resumeName, setResumeName] = useState('');
  
  const [isDragOver, setIsDragOver] = useState(false);
  
  const templates = [
    { id: 'modern', name: 'Modern Professional', desc: 'Clean layout, ideal for tech roles' },
    { id: 'corporate', name: 'Corporate', desc: 'Traditional business style, ATS-friendly' },
    { id: 'minimal', name: 'Minimal', desc: 'Simple black-and-white, max spacing' },
    { id: 'creative', name: 'Creative', desc: 'Modern visual design, highlight sections' },
    { id: 'student', name: 'Student / Fresher', desc: 'Prioritizes education and projects' }
  ];
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analyzing Base Resume...",
    "Extracting Job Description Keywords...",
    "Aligning Experience and Skills...",
    "Optimizing for ATS Formatting...",
    "Rendering Final Output..."
  ];

  const extractJobTitle = (jd) => {
    if (!jd) return 'Tailored_Resume';
    const match = jd.match(/(?:job title|role|position)[\s:]*([a-zA-Z0-9\s-]+)/i);
    let titleStr = '';
    if (match && match[1]) {
      titleStr = match[1].trim();
    } else {
      titleStr = jd.split('\n')[0].trim().split(/\s+/).slice(0, 4).join(' ');
    }
    return (titleStr.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_') + '_Resume').replace(/^_+|_+$/g, '');
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);
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
  const triggerFileSelect = () => fileInputRef.current.click();
  const removeFile = () => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resumeSource === 'saved' && !selectedResumeId) return setError('Please select a saved resume.');
    if (resumeSource === 'upload' && !file) return setError('Please upload a resume PDF file.');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let data;
      if (resumeSource === 'saved') {
        data = await api.post('/api/tailor/', { resumeId: selectedResumeId, jobDescription });
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        data = await api.upload('/api/tailor/', formData);
      }
      setResult(data.response);
      setResumeName(extractJobTitle(jobDescription));
    } catch (err) {
      setError(err.message || 'An error occurred during resume tailoring.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError('');
    setIsEditing(false);
    setResumeName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
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
      .catch(console.error)
      .finally(() => setResumesLoading(false));
  };

  const isSubmitDisabled = () => (!jobDescription || (resumeSource === 'saved' && !selectedResumeId) || (resumeSource === 'upload' && !file));
  
  const handlePrint = () => {
    const originalTitle = document.title;
    if (resumeName) document.title = resumeName;
    window.print();
    document.title = originalTitle;
  };
  const handleDocxDownload = () => exportToDocx(result, selectedTemplate, resumeName);
  
  const handleSaveToProfile = async () => {
    if (!resumeName.trim()) {
      setError('Resume Name cannot be empty.');
      return;
    }
    setIsSaving(true);
    setSaveSuccess('');
    setError('');
    try {
      await api.post('/api/tailor/save', { editedData: result, resumeName });
      setSaveSuccess('Saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save resume. ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Post-Generation Workspace UI
  // -------------------------------------------------------------
  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted no-print">
          <span className="hover:text-text-main cursor-pointer" onClick={resetForm}>Tailoring</span>
          <ChevronRight size={14} />
          <span className="text-text-main">Workspace</span>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Control Column (Stays sticky on xl screens) */}
          {!isEditing && (
            <div className="xl:col-span-4 space-y-6 no-print xl:sticky xl:top-6">
              
              {/* Workspace Actions Panel */}
              <div className="p-6 glass-card border border-border-dark space-y-4">
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                  <Edit3 className="text-primary" size={18} />
                  <span>Workspace Actions</span>
                </h3>
                <button 
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Resume Content
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="py-2 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    onClick={handleSaveToProfile} 
                    disabled={isSaving}
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                  <button 
                    className="py-2 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    onClick={resetForm}
                  >
                    <RefreshCw size={14} />
                    <span>Start Over</span>
                  </button>
                </div>
                {saveSuccess && <p className="text-xs text-green-400 font-semibold text-center mt-1">{saveSuccess}</p>}
                {error && <p className="text-xs text-red-400 text-center mt-1">{error}</p>}
              </div>

              {/* Export Panel */}
              <div className="p-6 glass-card border border-border-dark space-y-4">
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                  <Download className="text-primary" size={18} />
                  <span>Export Options</span>
                </h3>
                <div className="flex flex-col gap-2">
                  <button 
                    className="w-full py-2.5 px-3 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main flex items-center gap-2 transition-colors cursor-pointer"
                    onClick={handleDocxDownload}
                  >
                    <FileText size={16} className="text-primary" />
                    <span>Download as DOCX</span>
                  </button>
                  <button 
                    className="w-full py-2.5 px-3 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main flex items-center gap-2 transition-colors cursor-pointer"
                    onClick={handlePrint}
                  >
                    <Printer size={16} className="text-primary" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              </div>

              {/* Templates Panel */}
              <div className="p-6 glass-card border border-border-dark space-y-3">
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                  <LayoutTemplate className="text-primary" size={18} />
                  <span>Change Template</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                        selectedTemplate === tpl.id 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main hover:bg-surface/50'
                      }`}
                    >
                      <span>{tpl.name}</span>
                      {selectedTemplate === tpl.id && <CheckCircle size={14} className="text-primary" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Dashboard Panel */}
              <div className="p-6 glass-card border border-border-dark space-y-5">
                <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                  <Sparkles className="text-primary" size={18} />
                  <span>ATS Analyzer Dashboard</span>
                </h3>
                 
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="progress-circle shadow-md glow-primary" style={{ '--progress': result.atsAnalysis.matchScore || 0 }}>
                    <span className="progress-text">{result.atsAnalysis.matchScore || 0}%</span>
                  </div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-3">ATS Match Compatibility</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider block">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.atsAnalysis.matchingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase text-text-muted tracking-wider block">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.atsAnalysis.missingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <details className="group rounded-lg bg-surface/30 border border-border-dark p-3.5 transition-all">
                  <summary className="font-bold cursor-pointer text-xs text-primary group-open:text-text-main flex items-center justify-between">
                    <span>View ATS Suggestions</span>
                    <span className="text-text-muted text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <ul className="mt-3 list-disc pl-5 text-[11px] text-text-muted space-y-1.5 leading-relaxed">
                    {result.atsAnalysis.suggestionsForImprovement.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </details>
              </div>

            </div>
          )}

          {/* Right Canvas / Workstation Area */}
          <div className={`xl:col-span-${isEditing ? '12' : '8'} space-y-6 flex flex-col items-center`}>
            
            {/* Resume Metadata Header (Name Editor) */}
            <div className="w-full max-w-[210mm] p-4 glass-card border border-border-dark flex items-center gap-3.5 no-print">
              <FileText className="text-primary flex-shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <label className="text-[9px] uppercase font-bold text-text-muted tracking-widest block">Resume Name</label>
                <input 
                  type="text" 
                  value={resumeName} 
                  onChange={(e) => setResumeName(e.target.value.replace(/[^a-zA-Z0-9_ -\.]/g, ''))}
                  className="w-full border-none bg-transparent text-sm font-semibold text-text-main focus:outline-none placeholder-text-muted/30 p-0"
                  placeholder="e.g. Software_Engineer_Resume"
                  required
                />
              </div>
              <Edit3 size={16} className="text-text-muted flex-shrink-0" />
            </div>

            {isEditing ? (
              <div className="flex flex-col xl:flex-row gap-6 w-full items-start">
                {/* Editor Module */}
                <div className="w-full xl:w-[480px] space-y-4 no-print flex-shrink-0">
                  <div className="p-4 glass-card border border-border-dark flex justify-between items-center">
                    <h3 className="font-heading font-bold text-sm text-text-main flex items-center gap-2">
                      <Edit3 size={18} className="text-primary" />
                      <span>Editing Content</span>
                    </h3>
                    <button 
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main cursor-pointer"
                      onClick={() => setIsEditing(false)}
                    >
                      Close Editor
                    </button>
                  </div>
                  <div className="p-1.5 glass-card border border-border-dark max-h-[75vh] overflow-y-auto">
                    <ResumeEditor data={result} onChange={setResult} />
                  </div>
                </div>
                
                {/* Preview module next to editor */}
                <div className="flex-1 overflow-x-auto w-full pb-8 flex justify-center">
                  <div className="tailored-resume live-preview shadow-2xl bg-white border border-gray-200 rounded-sm origin-top" style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm', transform: 'scale(0.8)' }}>
                    <TemplateRenderer templateId={selectedTemplate} data={result} />
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Canvas mode */
              <div className="w-full overflow-x-auto pb-8 flex justify-center">
                <div className="tailored-resume shadow-2xl bg-white border border-gray-200 rounded-sm" style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}>
                  <TemplateRenderer templateId={selectedTemplate} data={result} />
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .tailored-resume, .tailored-resume * { visibility: visible; }
            .tailored-resume { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; transform: none !important; }
            .no-print { display: none !important; }
          }
        `}} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Pre-Generation Multistep Form Redesign
  // -------------------------------------------------------------
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">AI Resume Tailoring</h1>
        <p className="text-text-muted text-sm max-w-xl mx-auto">Optimize your resume against a specific target description to maximize ATS keyword scoring.</p>
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
            <h2 className="text-xl font-heading font-extrabold text-text-main">Optimizing Resume Keywords...</h2>
            <p className="text-xs text-text-muted">{loadingMessages[loadingStep]}</p>
            
            {/* Progress loader bar */}
            <div className="w-full max-w-xs mx-auto h-1.5 bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(loadingStep + 1) * 20}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Base Selection */}
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text-main">Select Base Resume</h3>
                <p className="text-xs text-text-muted mt-0.5">Select a saved resume from your profile or upload a new PDF file.</p>
              </div>
            </div>
            
            <div className="space-y-4">
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
                      <option key={r._id} value={r._id}>💾 {r.filename}</option>
                    ))}
                    <option value="upload">➕ Upload a new resume...</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    ▼
                  </div>
                </div>
              )}

              {resumeSource === 'upload' ? (
                <div 
                  className={`w-full min-h-[160px] rounded-xl border border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative ${
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
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <FileText size={40} className="text-secondary" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-text-main truncate max-w-[280px]">{file.name}</p>
                        <p className="text-[10px] text-text-muted font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button" 
                        className="px-2.5 py-1.5 rounded bg-surface hover:bg-surface/80 border border-border-dark text-[10px] font-semibold text-red-400 transition-colors cursor-pointer" 
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={32} className="text-text-muted" />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-text-main">Drag & Drop Resume PDF</h4>
                        <p className="text-[10px] text-text-muted">or click to browse local files (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 glass-card border border-border-dark flex items-center gap-3.5 animate-fade-in relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                  <FolderOpen size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-text-main">Saved Resume Selected</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">Using stored resume data from your profile. No upload required.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: JD Input */}
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text-main">Target Job Description</h3>
                <p className="text-xs text-text-muted mt-0.5">Paste the target job description to match skills and experiences.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <textarea
                rows={6}
                placeholder="Example: We are looking for a Software Engineer with strong experience in React, Node.js, and MongoDB..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                required
              />
              <div className="text-right text-[10px] text-text-muted">
                {jobDescription.length} characters
              </div>
            </div>
          </div>

          {/* Step 3: Template Selector */}
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text-main">Select Visual Template</h3>
                <p className="text-xs text-text-muted mt-0.5">Choose how your tailored resume will be formatted and outputted.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTemplate === tpl.id 
                      ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' 
                      : 'border-border-dark bg-surface/30 hover:bg-surface/50'
                  }`}
                >
                  <LayoutTemplate size={24} className={`mb-3 ${selectedTemplate === tpl.id ? 'text-primary' : 'text-text-muted'}`} />
                  <h4 className={`text-xs font-bold ${selectedTemplate === tpl.id ? 'text-primary' : 'text-text-main'}`}>{tpl.name}</h4>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
             <button 
               type="submit" 
               className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer disabled:opacity-60" 
               disabled={isSubmitDisabled() || loading}
             >
               <Sparkles size={16} />
               <span>Generate Tailored Resume</span>
               <ArrowRight size={14} />
             </button>
          </div>
        </form>
      )}
    </div>
  );
}
