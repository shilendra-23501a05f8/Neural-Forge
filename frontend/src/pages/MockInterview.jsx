import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
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
  const [loadingStep, setLoadingStep] = useState(0); // 0: Start, 1: Planner, 2: Generator, 3: Initiating
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); // active interview session
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Active Answering Mode
  const [answerType, setAnswerType] = useState('text'); // 'text' | 'audio'
  const [answer, setAnswer] = useState(''); // text answer
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); // score, feedback, idealAnswer, isLast

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
        
        // Stop all audio tracks to release microphone
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

  // Launch interview
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      setError('Please enter or select a target job role.');
      return;
    }

    setLoading(true);
    setError('');
    setLoadingStep(1); // Planner analysis

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

      setLoadingStep(2); // Question generator

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
      setError(err.message || 'Failed to generate interview. Please check your network and API key.');
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
        // Upload audio blob as a file
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        formData.append('audio', audioFile);
      }

      // Call multipart endpoint
      const data = await api.upload(`/api/mock-interview/${session._id}/answer`, formData);

      // Save evaluation and dynamic question details
      setEvaluationResult(data.evaluation);
      
      // Update session document to include dynamic transcription if spoken
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
      
      // Push next question into local session state
      setSession(prev => {
        const updatedQs = [...prev.questions];
        // Ensure we update current index answered details
        updatedQs[currentQuestionIndex].userAnswer = answer;
        updatedQs[currentQuestionIndex].score = evaluationResult.score;
        updatedQs[currentQuestionIndex].feedback = evaluationResult.feedback;
        updatedQs[currentQuestionIndex].idealAnswer = evaluationResult.idealAnswer;

        // Push new empty question
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
    setLoadingStep(3); // Feedback report compiling
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

  // Reset/Restart
  const resetInterview = () => {
    setSession(null);
    setAnswer('');
    setEvaluationResult(null);
    deleteRecording();
    setError('');
  };

  // Scoring styling helpers
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-success bg-success-light border-success-light';
    if (score >= 60) return 'text-warning bg-warning-light border-warning-light';
    return 'text-danger bg-danger-light border-danger-light';
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
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
      <div className="dashboard-page animate-fade-in">
        <div className="loading-card card animate-pulse" style={{ maxWidth: '640px', margin: '40px auto' }}>
          <div className="loading-content" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="pulse-sparkle" style={{ marginBottom: '24px' }}>
              <Sparkles size={48} className="sparkle-icon spinner" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            {loadingStep === 1 && (
              <>
                <h2>Planner Agent Extracting Core Profile...</h2>
                <p className="subtitle" style={{ fontSize: '14px', marginTop: '8px' }}>
                  Analyzing target job role details, core technologies, and parsing projects...
                </p>
                <div className="loading-steps" style={{ textAlign: 'left', marginTop: '24px' }}>
                  <div className="step-row active"><CheckCircle size={16} /> <span>Interpreting Job Description</span></div>
                  <div className="step-row pending"><RefreshCw size={16} className="spinner" /> <span>Mapping core keywords and tech stack</span></div>
                  <div className="step-row pending text-muted"><span>Generating custom question schemas</span></div>
                </div>
              </>
            )}
            {loadingStep === 2 && (
              <>
                <h2>Interview Agent Formulating Target Question 1...</h2>
                <p className="subtitle" style={{ fontSize: '14px', marginTop: '8px' }}>
                  Creating initial Technical concept challenges...
                </p>
                <div className="loading-steps" style={{ textAlign: 'left', marginTop: '24px' }}>
                  <div className="step-row active"><CheckCircle size={16} /> <span>Planner roadmap ready</span></div>
                  <div className="step-row active"><CheckCircle size={16} /> <span>Skills analysis complete</span></div>
                  <div className="step-row pending"><RefreshCw size={16} className="spinner" /> <span>Composing real-world mock question</span></div>
                </div>
              </>
            )}
            {loadingStep === 3 && (
              <>
                <h2>Feedback Agent Consolidating Reports...</h2>
                <p className="subtitle" style={{ fontSize: '14px', marginTop: '8px' }}>
                  Aggregating transcripts, checking scores, and writing recommendations...
                </p>
                <div className="loading-steps" style={{ textAlign: 'left', marginTop: '24px' }}>
                  <div className="step-row active"><CheckCircle size={16} /> <span>Main evaluations finalized</span></div>
                  <div className="step-row active"><CheckCircle size={16} /> <span>Transcripts processed successfully</span></div>
                  <div className="step-row pending"><RefreshCw size={16} className="spinner" /> <span>Compiling strengths & weaknesses dashboard</span></div>
                </div>
              </>
            )}
            <p className="loading-hint" style={{ marginTop: '24px', fontSize: '12px' }}>
              Please do not refresh or navigate away.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: RESULTS DASHBOARD SCREEN
  // ==========================================
  if (session && session.status === 'completed') {
    const radius = 55;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const overallOffset = circumference - (session.overallScore / 100) * circumference;

    return (
      <div id="printable-report" className="dashboard-page animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="dashboard-header" style={{ marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="skill-severity" style={{ backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
                {session.difficulty}
              </span>
              <span className="report-row-date">
                📅 {formatDate(session.updatedAt)}
              </span>
            </div>
            <h1>Interview Performance Results</h1>
            <p className="subtitle">Target Job Role: <strong>{session.jobRole}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }} className="no-print">
            <button className="btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} />
              <span>Download PDF Report</span>
            </button>
            <button className="btn-primary" onClick={resetInterview}>
              Start New Interview
            </button>
          </div>
        </div>

        {/* Scoring Dashboard Row */}
        <div className="analytics-grid" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                <circle 
                  cx="65" cy="65" r={radius} 
                  stroke="hsl(var(--border-color))" 
                  strokeWidth={strokeWidth} 
                  fill="transparent" 
                />
                <circle 
                  cx="65" cy="65" r={radius} 
                  stroke={getStrokeColor(session.overallScore)} 
                  strokeWidth={strokeWidth} 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={overallOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '130px', height: '130px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                  {session.overallScore}%
                </span>
                <span className="score-lbl" style={{ fontSize: '9px', marginTop: '-2px' }}>Overall</span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Interview Score</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '13px', lineHeight: '1.4' }}>
                Your overall score matches standard recruiter benchmarks for <strong>{session.jobRole}</strong>.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', padding: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                <span>Technical Proficiency</span>
                <span>{session.technicalScore}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'hsl(var(--border-color))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${session.technicalScore}%`,
                  backgroundColor: getStrokeColor(session.technicalScore),
                  borderRadius: '4px',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                <span>Communication & Clarity</span>
                <span>{session.communicationScore}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'hsl(var(--border-color))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${session.communicationScore}%`,
                  backgroundColor: getStrokeColor(session.communicationScore),
                  borderRadius: '4px',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Panel */}
        <div className="report-grid" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ borderTop: '4px solid hsl(var(--success))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <UserCheck size={20} className="text-success" />
              <h3 style={{ fontSize: '18px' }}>Key Strengths</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {session.strengths.map((str, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '14px', lineHeight: '1.4' }}>
                  <span className="text-success" style={{ fontWeight: 'bold' }}>✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ borderTop: '4px solid hsl(var(--danger))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={20} className="text-danger" />
              <h3 style={{ fontSize: '18px' }}>Identified Gaps</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {session.weaknesses.map((weak, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '14px', lineHeight: '1.4' }}>
                  <span className="text-danger" style={{ fontWeight: 'bold' }}>⚠</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lacking Skills Panel */}
        {session.lackingSkills && session.lackingSkills.length > 0 && (
          <div className="card" style={{ borderTop: '4px solid hsl(var(--warning))', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={20} style={{ color: 'hsl(var(--warning))' }} />
              <h3 style={{ fontSize: '18px' }}>Skills to Develop / Lacking Skills</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {session.lackingSkills.map((skill, idx) => (
                <span key={idx} className="skill-severity" style={{
                  backgroundColor: 'hsl(var(--warning-light))',
                  color: 'hsl(var(--warning))',
                  fontWeight: '600',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  border: '1px solid hsl(var(--warning) / 0.2)',
                  textTransform: 'none'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Roadmap */}
        <div className="card" style={{ borderTop: '4px solid hsl(var(--primary))', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} className="text-primary" />
            <h3 style={{ fontSize: '18px' }}>Actionable Learning Recommendations</h3>
          </div>
          <div className="skill-gaps-list">
            {session.recommendations.map((rec, idx) => (
              <div key={idx} className="skill-gap-item" style={{ border: '1px solid hsl(var(--border-color))', background: 'hsl(var(--bg-app))', margin: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary-light))',
                    color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px'
                  }}>{idx + 1}</span>
                  <p style={{ fontSize: '14px', fontWeight: '500' }}>{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transcript Accordion */}
        <div className="history-section">
          <h3>Full Interview Transcript</h3>
          <div className="reports-history-list">
            {session.questions.map((q, idx) => {
              const isOpen = expandedQuestion === idx;
              return (
                <div key={idx} className="card" style={{ padding: '16px 24px', cursor: 'pointer' }} onClick={() => setExpandedQuestion(isOpen ? null : idx)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: q.category === 'technical' ? 'hsl(var(--primary-light))' : q.category === 'behavioral' ? 'hsl(var(--success-light))' : 'rgba(280, 80%, 95%, 0.15)',
                        color: q.category === 'technical' ? 'hsl(var(--primary))' : q.category === 'behavioral' ? 'hsl(var(--success))' : 'hsla(280, 80%, 45%, 1)'
                      }}>
                        {q.category}
                      </span>
                      <h4 style={{ fontSize: '16px', margin: 0 }}>Q{idx + 1}: {q.topic || 'General concept'}</h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: getStrokeColor(q.score) }}>
                        Score: {q.score}%
                      </span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  <div 
                    className={`animate-fade-in history-details-panel ${isOpen ? 'is-open' : ''}`}
                    style={{ 
                      marginTop: '20px', 
                      borderTop: '1px solid hsl(var(--border-color))', 
                      paddingTop: '16px', 
                      cursor: 'default',
                      display: isOpen ? 'block' : 'none'
                    }} 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Question</p>
                      <p style={{ fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>{q.question}</p>
                    </div>

                    <div style={{ marginBottom: '16px', backgroundColor: 'hsl(var(--bg-app))', padding: '12px', borderRadius: '6px' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Your Answer</p>
                      <p style={{ fontSize: '14px', marginTop: '4px', fontStyle: 'italic' }}>"{q.userAnswer || 'No answer provided.'}"</p>
                    </div>

                    <div style={{ marginBottom: '16px', borderLeft: '4px solid hsl(var(--primary))', paddingLeft: '12px' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--primary))', fontWeight: 'bold' }}>AI Evaluation Feedback</p>
                      <p style={{ fontSize: '14px', marginTop: '4px', lineHeight: '1.4' }}>{q.feedback}</p>
                    </div>

                    <div style={{ borderLeft: '4px solid hsl(var(--success))', paddingLeft: '12px', backgroundColor: 'hsl(var(--success-light) / 0.1)', padding: '12px', borderRadius: '6px' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--success))', fontWeight: 'bold' }}>Ideal Benchmark Answer</p>
                      <p style={{ fontSize: '14px', marginTop: '4px', lineHeight: '1.4' }}>{q.idealAnswer}</p>
                    </div>
                  </div>
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
    // Dynamic sequential questionnaire rounds (total 3)
    const totalQuestions = 3;
    const progressPercent = Math.min(((currentQuestionIndex + (evaluationResult ? 1.0 : 0)) / totalQuestions) * 100, 100);

    return (
      <div className="dashboard-page animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>
              Conducting Mock Interview
            </h4>
            <h2 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{session.jobRole}</h2>
          </div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={resetInterview}>
            Quit Interview
          </button>
        </div>

        {/* Global Progress Bar */}
        <div style={{ height: '6px', backgroundColor: 'hsl(var(--border-color))', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'hsl(var(--primary))', transition: 'width 0.3s ease' }} />
        </div>

        {/* Main Q&A Card */}
        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px',
              backgroundColor: currentQuestion.category === 'technical' ? 'hsl(var(--primary-light))' : currentQuestion.category === 'behavioral' ? 'hsl(var(--success-light))' : 'rgba(280, 80%, 95%, 0.15)',
              color: currentQuestion.category === 'technical' ? 'hsl(var(--primary))' : currentQuestion.category === 'behavioral' ? 'hsl(var(--success))' : 'hsla(280, 80%, 45%, 1)'
            }}>
              {currentQuestion.category} question
            </span>
            <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
              Question {currentQuestionIndex + 1}
            </span>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '700', lineHeight: '1.4', marginBottom: '24px' }}>
            {currentQuestion.question}
          </h3>

          {/* Setup User Answer */}
          {!evaluationResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Answer Type Toggler */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '12px' }}>
                <button
                  type="button"
                  className={`btn-secondary ${answerType === 'audio' ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '20px',
                    backgroundColor: answerType === 'audio' ? 'hsl(var(--primary-light))' : '',
                    color: answerType === 'audio' ? 'hsl(var(--primary))' : '',
                    borderColor: answerType === 'audio' ? 'hsl(var(--primary))' : ''
                  }}
                  onClick={() => { setAnswerType('audio'); setError(''); }}
                >
                  <Mic size={16} />
                  <span>Speak Response (Voice)</span>
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${answerType === 'text' ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '20px',
                    backgroundColor: answerType === 'text' ? 'hsl(var(--primary-light))' : '',
                    color: answerType === 'text' ? 'hsl(var(--primary))' : '',
                    borderColor: answerType === 'text' ? 'hsl(var(--primary))' : ''
                  }}
                  onClick={() => { setAnswerType('text'); setError(''); }}
                >
                  <Keyboard size={16} />
                  <span>Type Response (Text)</span>
                </button>
              </div>

              {/* Input Intake Layouts */}
              {answerType === 'text' ? (
                <div className="form-group">
                  <label className="section-label">Type Your Response</label>
                  <textarea
                    rows={6}
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontSize: '14px' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '24px', backgroundColor: 'hsl(var(--bg-app))', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!isRecording ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={startRecording}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0 }}
                      >
                        <Mic size={24} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={stopRecording}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, backgroundColor: 'hsl(var(--danger))', boxShadow: '0 4px 12px hsla(var(--danger), 0.2)' }}
                      >
                        <Square size={24} />
                      </button>
                    )}

                    {isRecording && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'hsl(var(--danger))', display: 'inline-block' }} className="animate-pulse" />
                          Recording... {formatTimer(recordingSeconds)}
                        </span>
                        <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                          <span style={{ width: '3px', height: '15px', backgroundColor: 'hsl(var(--danger))', display: 'inline-block' }} className="animate-pulse" />
                          <span style={{ width: '3px', height: '20px', backgroundColor: 'hsl(var(--danger))', display: 'inline-block', animationDelay: '0.2s' }} className="animate-pulse" />
                          <span style={{ width: '3px', height: '12px', backgroundColor: 'hsl(var(--danger))', display: 'inline-block', animationDelay: '0.4s' }} className="animate-pulse" />
                          <span style={{ width: '3px', height: '24px', backgroundColor: 'hsl(var(--danger))', display: 'inline-block', animationDelay: '0.1s' }} className="animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>

                  {!isRecording && audioUrl && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'hsl(var(--success))' }}>✓ Audio recorded successfully</span>
                      <audio src={audioUrl} controls style={{ width: '100%', maxWidth: '360px' }} />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={deleteRecording}
                        style={{ padding: '6px 12px', fontSize: '12px', color: 'hsl(var(--danger))', borderColor: 'hsla(var(--danger), 0.2)' }}
                      >
                        <Trash2 size={14} />
                        <span>Delete and Re-record</span>
                      </button>
                    </div>
                  )}

                  {!isRecording && !audioUrl && (
                    <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Click the microphone button to start speaking</span>
                  )}
                </div>
              )}

              {error && (
                <div className="auth-error-alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleSubmitAnswer}
                disabled={evaluating || (answerType === 'text' ? !answer.trim() : !audioBlob)}
                style={{ alignSelf: 'flex-start' }}
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="spinner" size={16} />
                    <span>Evaluating Response & Transcribing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Upload Response</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ) : (
            // Answer Submitted, show Immediate Evaluation
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '24px' }}>
              
              {/* Spoken transcript if it was transcribed */}
              {answerType === 'audio' && (
                <div style={{ backgroundColor: 'hsl(var(--primary-light) / 0.3)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid hsl(var(--primary))' }}>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--primary))', fontWeight: 'bold' }}>Spoken Transcript</p>
                  <p style={{ fontSize: '14px', marginTop: '4px', fontStyle: 'italic' }}>
                    "{answer}"
                  </p>
                </div>
              )}

              <div className={`skill-gap-item ${getScoreColorClass(evaluationResult.score)}`} style={{ padding: '16px', border: '1px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Award size={24} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px' }}>Answer Score: {evaluationResult.score}/100</h4>
                      <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Evaluated immediately by the AI Mentor</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderLeft: '4px solid hsl(var(--primary))', paddingLeft: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'hsl(var(--primary))', marginBottom: '6px' }}>Feedback</h4>
                <p style={{ fontSize: '14px', color: 'hsl(var(--text-main))', lineHeight: '1.5' }}>{evaluationResult.feedback}</p>
              </div>

              <div style={{ backgroundColor: 'hsl(var(--bg-app))', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'hsl(var(--text-main))', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} className="text-success" /> Benchmark Answer
                </h4>
                <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', lineHeight: '1.5', fontStyle: 'italic' }}>
                  "{evaluationResult.idealAnswer}"
                </p>
              </div>
              
              {/* Navigation buttons */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={handleNextQuestion}>
                  <span>Dynamic Next Question</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn-secondary" onClick={handleFinishInterview} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Finish & Compile Final Report</span>
                  <Sparkles size={16} />
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
    <div className="upload-page animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Compass className="text-primary" size={36} />
          AI Mock Interviews
        </h1>
        <p className="subtitle">Practice job-specific interviews. Speak/record or type answers, get dynamic questioning, and receive full dashboards.</p>
      </div>

      {error && (
        <div className="auth-error-alert" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="upload-form-grid">
        <div className="form-column">
          <div className="form-group">
            <label className="section-label">Resume Option *</label>
            <span className="input-hint">Mock interviews can adapt to your resume or be general job profiles</span>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={`btn-secondary ${resumeSource === 'none' ? 'active' : ''}`}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px',
                  backgroundColor: resumeSource === 'none' ? 'hsl(var(--primary-light))' : '',
                  color: resumeSource === 'none' ? 'hsl(var(--primary))' : '',
                  borderColor: resumeSource === 'none' ? 'hsl(var(--primary))' : ''
                }}
                onClick={() => { setResumeSource('none'); setFile(null); }}
              >
                No Resume
              </button>
              <button
                type="button"
                className={`btn-secondary ${resumeSource === 'saved' ? 'active' : ''}`}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px',
                  backgroundColor: resumeSource === 'saved' ? 'hsl(var(--primary-light))' : '',
                  color: resumeSource === 'saved' ? 'hsl(var(--primary))' : '',
                  borderColor: resumeSource === 'saved' ? 'hsl(var(--primary))' : ''
                }}
                onClick={() => {
                  setResumeSource('saved');
                  if (savedResumes.length > 0 && !selectedResumeId) {
                    setSelectedResumeId(savedResumes[0]._id);
                  }
                }}
              >
                Stored Resume
              </button>
              <button
                type="button"
                className={`btn-secondary ${resumeSource === 'upload' ? 'active' : ''}`}
                style={{
                  flex: 1, padding: '10px', fontSize: '13px',
                  backgroundColor: resumeSource === 'upload' ? 'hsl(var(--primary-light))' : '',
                  color: resumeSource === 'upload' ? 'hsl(var(--primary))' : '',
                  borderColor: resumeSource === 'upload' ? 'hsl(var(--primary))' : ''
                }}
                onClick={() => { setResumeSource('upload'); }}
              >
                Upload New
              </button>
            </div>

            {resumeSource === 'saved' && (
              resumesLoading ? (
                <div className="loading-dropdown-box">
                  <RefreshCw className="spinner" size={16} />
                  <span>Loading profiles...</span>
                </div>
              ) : savedResumes.length === 0 ? (
                <div style={{ padding: '12px', border: '1px solid hsl(var(--border-color))', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                  No resumes saved. Please choose Upload New.
                </div>
              ) : (
                <select
                  className="resume-dropdown-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid hsl(var(--border-color))' }}
                >
                  {savedResumes.map(r => (
                    <option key={r._id} value={r._id}>
                      💾 {r.filename}
                    </option>
                  ))}
                </select>
              )
            )}

            {resumeSource === 'upload' && (
              <div 
                className={`dropzone-card card ${isDragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!file ? triggerFileSelect : undefined}
                style={{ padding: '20px', cursor: 'pointer', textAlign: 'center', border: '2px dashed hsl(var(--border-color))' }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }}
                />
                
                {file ? (
                  <div className="file-info-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FileText size={40} className="file-icon-color" style={{ color: 'hsl(var(--primary))' }} />
                    <p className="file-name" style={{ fontSize: '13px', fontWeight: 'bold', margin: '8px 0' }}>{file.name}</p>
                    <button type="button" className="btn-secondary remove-file-btn" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-prompt">
                    <Upload size={32} className="upload-icon-color" style={{ margin: '0 auto 8px auto', color: 'hsl(var(--text-muted))' }} />
                    <p style={{ fontSize: '13px', margin: 0 }}>Drag & Drop PDF or click to browse</p>
                  </div>
                )}
              </div>
            )}

            {resumeSource === 'none' && (
              <div className="saved-resume-selected-card card" style={{ padding: '16px', display: 'flex', gap: '12px', background: 'hsl(var(--bg-app))' }}>
                <Smile size={24} className="text-primary" />
                <div style={{ fontSize: '13px' }}>
                  <p style={{ fontWeight: '600', margin: 0 }}>General Profile Match Mode</p>
                  <p className="text-muted" style={{ margin: '2px 0 0 0' }}>AI will focus questions strictly on the target job role without extracting resume data.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="form-column">
          <div className="form-group">
            <label htmlFor="jobRole" className="section-label">Target Job Role *</label>
            <span className="input-hint">Type the specific job role you are interviewing for</span>
            <input
              id="jobRole"
              type="text"
              placeholder="e.g. React Developer, Data Scientist, Product Manager"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid hsl(var(--border-color))', fontSize: '14px' }}
            />

            <div style={{ marginTop: '12px' }}>
              <span className="input-hint" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>Quick Select Presets:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {presetRoles.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '20px' }}
                    onClick={() => setJobRole(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', gap: '8px', justifyContent: 'center' }}
              disabled={!jobRole.trim() || (resumeSource === 'upload' && !file)}
            >
              <Sparkles size={18} />
              <span>Generate AI Interview Questions</span>
            </button>
          </div>

          <div className="info-helper-box" style={{ marginTop: '20px' }}>
            <Info size={16} />
            <p style={{ fontSize: '12px' }}>Planner and Interview Agents take around 10-15 seconds to generate tailored concept scenarios.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
