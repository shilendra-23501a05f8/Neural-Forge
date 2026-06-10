import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Upload, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Info, 
  Sparkles, 
  FolderOpen, 
  Star, 
  Compass, 
  UserCheck, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Award,
  ChevronDown,
  ChevronUp,
  Smile,
  Mic,
  MicOff,
  Play,
  Square,
  Trash2,
  Keyboard
} from 'lucide-react';

export default function MockInterview() {
  // Setup States
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('none'); // 'none', 'saved', 'upload'
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'

  // Loading & Session States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); 
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Active Answering Mode
  const [answerType, setAnswerType] = useState('text'); 
  const [answer, setAnswer] = useState(''); 
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); 

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Dashboard Toggle States
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Quick select roles
  const presetRoles = [
    "React Frontend Engineer",
    "Node.js Backend Developer",
    "Full Stack Web Developer",
    "Product Manager",
    "Data Scientist / ML Engineer"
  ];

  // Fetch saved resumes on mount
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
          setResumeSource('none');
        }
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        setResumeSource('none');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumesList();
  }, []);

  // Timer helper for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Audio recording handlers
  const startRecording = async () => {
    setError('');
    setAudioUrl('');
    setAudioBlob(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Failed to access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl('');
    setAudioBlob(null);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // PDF drop zone helpers
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

  // Launch interview
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      setError('Please enter or select a target job role.');
      return;
    }

    setLoading(true);
    setError('');
    setLoadingStep(1);

    try {
      let finalResumeId = null;

      if (resumeSource === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        const uploadData = await api.upload('/api/resumeUpload/', formData);
        
        if (uploadData.response && uploadData.response._id) {
          finalResumeId = uploadData.response._id;
          setSavedResumes(prev => [uploadData.response, ...prev]);
          setSelectedResumeId(uploadData.response._id);
          setResumeSource('saved');
        }
      } else if (resumeSource === 'saved') {
        finalResumeId = selectedResumeId;
      }

      setLoadingStep(2);

      const startData = await api.post('/api/mock-interview/start', {
        jobRole: jobRole.trim(),
        resumeId: finalResumeId,
        difficulty
      });

      if (startData.interview) {
        setSession(startData.interview);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setEvaluationResult(null);
        deleteRecording();
      }
    } catch (err) {
      console.error("Start interview failed:", err);
      setError(err.message || 'Failed to generate interview. Please check your network.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  // Submit response
  const handleSubmitAnswer = async () => {
    if (answerType === 'text' && !answer.trim()) return;
    if (answerType === 'audio' && !audioBlob) return;

    setEvaluating(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('questionIndex', currentQuestionIndex);
      formData.append('answerType', answerType);

      if (answerType === 'text') {
        formData.append('userAnswer', answer);
      } else {
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        formData.append('audio', audioFile);
      }

      const data = await api.upload(`/api/mock-interview/${session._id}/answer`, formData);
      setEvaluationResult(data.evaluation);
      
      if (answerType === 'audio' && data.evaluation.userAnswer) {
        setAnswer(data.evaluation.userAnswer);
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
      setError(err.message || "Failed to submit response. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // Progress to next dynamic question
  const handleNextQuestion = () => {
    if (evaluationResult && evaluationResult.nextQuestion) {
      const nextQ = evaluationResult.nextQuestion;
      
      setSession(prev => {
        const updatedQs = [...prev.questions];
        updatedQs[currentQuestionIndex].userAnswer = answer;
        updatedQs[currentQuestionIndex].score = evaluationResult.score;
        updatedQs[currentQuestionIndex].feedback = evaluationResult.feedback;
        updatedQs[currentQuestionIndex].idealAnswer = evaluationResult.idealAnswer;

        updatedQs.push({
          question: nextQ.question,
          category: nextQ.category,
          topic: nextQ.topic,
          userAnswer: '',
          score: null,
          feedback: '',
          idealAnswer: ''
        });

        return { ...prev, questions: updatedQs };
      });

      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setEvaluationResult(null);
      deleteRecording();
      setError('');
    }
  };

  // Compile final report
  const handleFinishInterview = async () => {
    setLoading(true);
    setLoadingStep(3);
    setError('');
    try {
      const data = await api.post(`/api/mock-interview/${session._id}/finish`);
      setSession(data.interview);
    } catch (err) {
      console.error("Failed to compile feedback report:", err);
      setError(err.message || "Failed to compile report. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const resetInterview = () => {
    setSession(null);
    setAnswer('');
    setEvaluationResult(null);
    deleteRecording();
    setError('');
  };

  // Scoring helpers
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20 text-green-400';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-red-500/10 border-red-500/20 text-red-400';
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // RENDER: LOADING VIEW
  // ==========================================
  if (loading) {
    return (
      <div className="p-8 md:p-12 glass-card border border-border-dark flex items-center justify-center glow-primary max-w-lg mx-auto my-12">
        <div className="text-center w-full space-y-6">
          <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse-glow">
            <Sparkles size={36} className="spinner" />
          </div>
          
          {loadingStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-extrabold text-text-main">Planner Agent Setting Up Session...</h2>
              <p className="text-xs text-text-muted">Analyzing target job role details, core technologies, and projects...</p>
              <div className="space-y-2.5 pt-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Interpreting Job Description</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-primary font-semibold">
                  <RefreshCw size={16} className="spinner" />
                  <span>Mapping core keywords and tech stack</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-text-muted/40 font-semibold">
                  <div className="w-4 h-4 rounded-full border border-border-dark flex-shrink-0"></div>
                  <span>Generating custom question schemas</span>
                </div>
              </div>
            </div>
          )}

          {loadingStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-extrabold text-text-main">Interview Agent Drafting Questions...</h2>
              <p className="text-xs text-text-muted">Creating initial Technical concepts challenges...</p>
              <div className="space-y-2.5 pt-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Planner roadmap ready</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Skills analysis complete</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-primary font-semibold">
                  <RefreshCw size={16} className="spinner" />
                  <span>Composing real-world mock question</span>
                </div>
              </div>
            </div>
          )}

          {loadingStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-extrabold text-text-main">Feedback Agent Consolidating Reports...</h2>
              <p className="text-xs text-text-muted">Aggregating transcripts, checking scores, and writing recommendations...</p>
              <div className="space-y-2.5 pt-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Main evaluations finalized</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Transcripts processed successfully</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-primary font-semibold">
                  <RefreshCw size={16} className="spinner" />
                  <span>Compiling strengths & weaknesses dashboard</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-text-muted pt-4">Please do not refresh or navigate away.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: RESULTS DASHBOARD SCREEN
  // ==========================================
  if (session && session.status === 'completed') {
    return (
      <div id="printable-report" className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dark pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary uppercase">
                {session.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                📅 {formatDate(session.updatedAt)}
              </span>
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Interview Performance Results</h1>
            <p className="text-xs text-text-muted">Target Job Role: <strong className="text-text-main">{session.jobRole}</strong></p>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button 
              className="px-4 py-2.5 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => window.print()}
            >
              <FileText size={14} className="text-primary" />
              <span>Download PDF Report</span>
            </button>
            <button 
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
              onClick={resetInterview}
            >
              Start New Interview
            </button>
          </div>
        </div>

        {/* Score Index Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 p-6 glass-card border border-border-dark flex flex-col sm:flex-row items-center gap-6 justify-center">
            <div className="progress-circle shadow-md glow-primary flex-shrink-0" style={{ '--progress': session.overallScore || 0 }}>
              <span className="progress-text">{session.overallScore || 0}%</span>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading font-bold text-base text-text-main">Cumulative Performance</h3>
              <p className="text-xs text-text-muted leading-relaxed">Your overall rating meets industry standard benchmarks for this role.</p>
            </div>
          </div>

          <div className="md:col-span-7 p-6 glass-card border border-border-dark flex flex-col justify-center gap-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-text-main">
                <span>Technical Proficiency</span>
                <span style={{ color: getStrokeColor(session.technicalScore) }}>{session.technicalScore}%</span>
              </div>
              <div className="h-2 bg-surface border border-border-dark rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${session.technicalScore}%`, backgroundColor: getStrokeColor(session.technicalScore) }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-text-main">
                <span>Communication & Clarity</span>
                <span style={{ color: getStrokeColor(session.communicationScore) }}>{session.communicationScore}%</span>
              </div>
              <div className="h-2 bg-surface border border-border-dark rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${session.communicationScore}%`, backgroundColor: getStrokeColor(session.communicationScore) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <h3 className="font-heading font-bold text-base text-green-400 flex items-center gap-2">
              <UserCheck size={18} />
              <span>Key Strengths</span>
            </h3>
            <ul className="space-y-2.5">
              {session.strengths.map((str, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-text-muted leading-relaxed">
                  <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 glass-card border border-border-dark space-y-4">
            <h3 className="font-heading font-bold text-base text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              <span>Identified Gaps</span>
            </h3>
            <ul className="space-y-2.5">
              {session.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-text-muted leading-relaxed">
                  <span className="text-red-400 font-bold flex-shrink-0">⚠</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lacking Skills tags */}
        {session.lackingSkills && session.lackingSkills.length > 0 && (
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <h3 className="font-heading font-bold text-base text-amber-400 flex items-center gap-2">
              <TrendingUp size={18} />
              <span>Core Gaps / Key Skill Gaps</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.lackingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-6 glass-card border border-border-dark space-y-4">
          <h3 className="font-heading font-bold text-base text-primary flex items-center gap-2">
            <BookOpen size={18} />
            <span>Actionable Learning Roadmap</span>
          </h3>
          <div className="space-y-3">
            {session.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 items-center p-3.5 rounded-lg border border-border-dark bg-surface/30">
                <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-text-main font-medium">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transcript Panel Accordion */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-text-main">Full Interview Transcript</h3>
          <div className="space-y-3">
            {session.questions.map((q, idx) => {
              const isOpen = expandedQuestion === idx;
              return (
                <div key={idx} className="border border-border-dark rounded-lg overflow-hidden bg-surface/30 hover:bg-surface/50 transition-colors">
                  <button 
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-text-main gap-4 cursor-pointer" 
                    onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                  >
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        q.category === 'technical' ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-green-500/10 border border-green-500/20 text-green-400'
                      }`}>
                        {q.category}
                      </span>
                      <h4 className="text-xs text-text-main truncate">Q{idx + 1}: {q.topic || 'Core Concept'}</h4>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: getStrokeColor(q.score) }}>
                        Score: {q.score}%
                      </span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-border-dark bg-background/40 space-y-4 text-xs">
                          <div className="space-y-1">
                            <span className="font-bold text-[9px] uppercase text-text-muted tracking-wider block">Question prompt</span>
                            <p className="text-text-main font-semibold">{q.question}</p>
                          </div>
                          
                          <div className="p-3 bg-surface/30 rounded border border-border-dark space-y-1">
                            <span className="font-bold text-[9px] uppercase text-text-muted tracking-wider block">Your transcribed answer</span>
                            <p className="text-text-main font-medium italic">"{q.userAnswer || 'No response provided.'}"</p>
                          </div>

                          <div className="border-l-2 border-primary pl-3 space-y-1">
                            <span className="font-bold text-[9px] uppercase text-primary tracking-wider block">Mentor critique feedback</span>
                            <p className="text-text-muted leading-relaxed">{q.feedback}</p>
                          </div>

                          <div className="border-l-2 border-green-500 pl-3 space-y-1">
                            <span className="font-bold text-[9px] uppercase text-green-400 tracking-wider block">Suggested benchmark answer</span>
                            <p className="text-text-muted leading-relaxed italic">{q.idealAnswer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ACTIVE INTERVIEW SCREEN
  // ==========================================
  if (session && session.status !== 'completed') {
    const currentQuestion = session.questions[currentQuestionIndex];
    const totalQuestions = 3;
    const progressPercent = Math.min(((currentQuestionIndex + (evaluationResult ? 1.0 : 0)) / totalQuestions) * 100, 100);

    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-16">
        {/* Active Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Simulator Session</span>
            <h2 className="text-xl font-heading font-extrabold text-text-main mt-0.5">{session.jobRole}</h2>
          </div>
          <button 
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            onClick={resetInterview}
          >
            Quit Interview
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="h-1.5 bg-surface border border-border-dark rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Interviewer holographic chat bubble */}
        <div className="p-6 md:p-8 glass-card border border-border-dark space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center justify-between gap-4">
            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              currentQuestion.category === 'technical' ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-green-500/10 border border-green-500/20 text-green-400'
            }`}>
              {currentQuestion.category} Question
            </span>
            <span className="text-xs font-semibold text-text-muted">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0 shadow-md">
              AI
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block">AI Interviewer agent</span>
              <p className="text-base md:text-lg font-heading font-bold text-text-main leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* User Input Intake */}
          {!evaluationResult ? (
            <div className="space-y-5 pt-6 border-t border-border-dark">
              
              {/* Selector toggler */}
              <div className="flex gap-2 border-b border-border-dark pb-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                    answerType === 'audio' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main'
                  }`}
                  onClick={() => { setAnswerType('audio'); setError(''); }}
                >
                  <Mic size={14} />
                  <span>Speak Response (Voice)</span>
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                    answerType === 'text' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main'
                  }`}
                  onClick={() => { setAnswerType('text'); setError(''); }}
                >
                  <Keyboard size={14} />
                  <span>Type Response (Text)</span>
                </button>
              </div>

              {/* Text Input */}
              {answerType === 'text' ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-main block">Type Your Response</label>
                  <textarea
                    rows={5}
                    placeholder="Provide your detailed answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>
              ) : (
                /* Voice Input & Waveforms */
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-surface/30 border border-border-dark space-y-4">
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <button
                        type="button"
                        className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer"
                        onClick={startRecording}
                      >
                        <Mic size={22} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 cursor-pointer spinner"
                        onClick={stopRecording}
                      >
                        <Square size={20} />
                      </button>
                    )}

                    {isRecording && (
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400 inline-block animate-pulse" />
                          Recording: {formatTimer(recordingSeconds)}
                        </span>
                        
                        {/* Audio Waveforms bar indicator */}
                        <div className="flex gap-1 items-end h-6 mt-1">
                          <span className="w-1 h-3 bg-red-400 rounded animate-pulse-glow" style={{ animationDelay: '0.1s' }} />
                          <span className="w-1 h-5 bg-red-400 rounded animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
                          <span className="w-1 h-2 bg-red-400 rounded animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                          <span className="w-1 h-6 bg-red-400 rounded animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
                          <span className="w-1 h-4 bg-red-400 rounded animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {!isRecording && audioUrl && (
                    <div className="flex flex-col items-center gap-3 w-full animate-fade-in">
                      <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                        <CheckCircle size={14} />
                        <span>Audio response captured successfully</span>
                      </span>
                      <audio src={audioUrl} controls className="w-full max-w-sm rounded" />
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-semibold bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                        onClick={deleteRecording}
                      >
                        <Trash2 size={12} />
                        <span>Delete and Re-record</span>
                      </button>
                    </div>
                  )}

                  {!isRecording && !audioUrl && (
                    <span className="text-xs text-text-muted">Click the microphone button to start speaking</span>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
                onClick={handleSubmitAnswer}
                disabled={evaluating || (answerType === 'text' ? !answer.trim() : !audioBlob)}
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="spinner" size={14} />
                    <span>Evaluating Response & Transcribing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Immediate Feedback layout */
            <div className="space-y-6 pt-6 border-t border-border-dark animate-fade-in">
              {answerType === 'audio' && (
                <div className="p-3.5 bg-primary/5 border-l-2 border-primary rounded text-xs">
                  <span className="font-bold text-[9px] uppercase text-primary tracking-wider block">Transcribed Answer</span>
                  <p className="text-text-main italic font-medium mt-1">"{answer}"</p>
                </div>
              )}

              <div className={`p-4 rounded-lg border ${getScoreColorClass(evaluationResult.score)} text-xs font-semibold flex items-center gap-2.5`}>
                <Award size={20} />
                <div>
                  <h4 className="text-sm font-bold">Answer Score: {evaluationResult.score}/100</h4>
                  <p className="opacity-75 font-normal mt-0.5">Evaluated immediately by the AI Mentor Agent</p>
                </div>
              </div>

              <div className="border-l-2 border-primary pl-3 space-y-1 text-xs">
                <span className="font-bold text-[9px] uppercase text-primary tracking-wider block font-sans">Critique Feedback</span>
                <p className="text-text-muted leading-relaxed">{evaluationResult.feedback}</p>
              </div>

              <div className="p-4 rounded-lg bg-surface/30 border border-border-dark text-xs space-y-1.5">
                <h4 className="font-bold text-text-main flex items-center gap-1.5">
                  <Sparkles size={14} className="text-green-400" />
                  <span>Ideal Benchmark Answer</span>
                </h4>
                <p className="text-text-muted leading-relaxed italic">
                  "{evaluationResult.idealAnswer}"
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
                  onClick={handleNextQuestion}
                >
                  <span>Dynamic Next Question</span>
                  <ArrowRight size={14} />
                </button>
                <button 
                  className="px-5 py-2.5 rounded-lg bg-surface hover:bg-surface/80 border border-border-dark text-xs font-semibold text-text-main flex items-center gap-1.5 transition-colors cursor-pointer"
                  onClick={handleFinishInterview}
                >
                  <span>Compile Final Report</span>
                  <Sparkles size={14} className="text-primary" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SETUP SCREEN (Step 1)
  // ==========================================
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight flex items-center justify-center gap-2">
          <Compass className="text-primary" size={32} />
          <span>AI Mock Interviews</span>
        </h1>
        <p className="text-text-muted text-sm max-w-xl mx-auto">Practice target job-specific loops. Speak voice answers or type inputs, receive dynamically adjusted questioning, and download performance reports.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stored profile options */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 glass-card border border-border-dark space-y-4">
            <div>
              <label className="text-sm font-semibold text-text-main block">Resume Option *</label>
              <p className="text-[11px] text-text-muted mt-0.5">Mock interviews can adapt questions specifically to your profile details</p>
            </div>

            <div className="flex gap-2">
              {['none', 'saved', 'upload'].map((source) => (
                <button
                  key={source}
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    resumeSource === source
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main'
                  }`}
                  onClick={() => {
                    setResumeSource(source);
                    if (source !== 'upload') setFile(null);
                    if (source === 'saved' && savedResumes.length > 0 && !selectedResumeId) {
                      setSelectedResumeId(savedResumes[0]._id);
                    }
                  }}
                >
                  {source === 'none' ? 'No Resume' : source === 'saved' ? 'Stored' : 'Upload New'}
                </button>
              ))}
            </div>

            {resumeSource === 'saved' && (
              resumesLoading ? (
                <div className="flex items-center gap-2 text-xs text-text-muted p-2 rounded-lg border border-border-dark bg-surface/30">
                  <RefreshCw className="spinner" size={14} />
                  <span>Loading profiles...</span>
                </div>
              ) : savedResumes.length === 0 ? (
                <div className="p-3 border border-border-dark rounded-lg text-center text-xs text-text-muted">
                  No resumes saved. Please choose Stored or Upload New.
                </div>
              ) : (
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    {savedResumes.map(r => (
                      <option key={r._id} value={r._id}>
                        💾 {r.filename}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">
                    ▼
                  </div>
                </div>
              )
            )}

            {resumeSource === 'upload' && (
              <div 
                className={`w-full min-h-[140px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 relative ${
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
                  <div className="flex flex-col items-center gap-2 w-full">
                    <FileText size={32} className="text-secondary" />
                    <p className="text-xs font-semibold text-text-main truncate max-w-[200px]">{file.name}</p>
                    <button 
                      type="button" 
                      className="px-2 py-1 rounded bg-surface hover:bg-surface/80 border border-border-dark text-[9px] font-semibold text-red-400 transition-colors cursor-pointer" 
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={24} className="text-text-muted" />
                    <p className="text-xs text-text-main">Drag & Drop PDF or click to browse</p>
                  </div>
                )}
              </div>
            )}

            {resumeSource === 'none' && (
              <div className="p-4 glass-card border border-border-dark flex items-start gap-3 animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                <Smile size={22} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs text-text-main">General Profile Match Mode</p>
                  <p className="text-[10px] text-text-muted leading-relaxed">AI will focus questions strictly on the target job role without parsing resume details.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Target role inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 glass-card border border-border-dark space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="jobRole" className="text-sm font-semibold text-text-main">Target Job Role *</label>
              <p className="text-[11px] text-text-muted">Type the specific job role you are interviewing for</p>
              <input
                id="jobRole"
                type="text"
                placeholder="e.g. React Developer, Data Scientist, Product Manager"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border-dark text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />

              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Quick Select Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetRoles.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className="px-2.5 py-1 rounded-full bg-surface hover:bg-surface/80 border border-border-dark text-[10px] text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      onClick={() => setJobRole(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!jobRole.trim() || (resumeSource === 'upload' && !file)}
            >
              <Sparkles size={16} />
              <span>Generate AI Interview Questions</span>
            </button>
          </div>

          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-surface/30 border border-border-dark text-xs text-text-muted leading-relaxed">
            <Info className="text-primary flex-shrink-0 mt-0.5" size={14} />
            <p>Planner and Interview Agents take around 10-15 seconds to generate custom behavioral and technical scenarios.</p>
          </div>
        </div>

      </form>
    </div>
  );
}
