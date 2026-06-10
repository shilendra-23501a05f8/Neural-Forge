import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  BookOpen, 
  FileText 
} from 'lucide-react';

export default function ReportDetails({ report }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!report) return null;

  const toggleQuestion = (index, type) => {
    const key = `${type}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get color and styling details based on severity of skill gap
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          label: 'Critical Gap',
          icon: <XCircle size={16} className="text-red-400" />
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          label: 'Moderate Gap',
          icon: <AlertTriangle size={16} className="text-amber-400" />
        };
      case 'low':
      default:
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          text: 'text-green-400',
          label: 'Minor Gap',
          icon: <CheckCircle2 size={16} className="text-green-400" />
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Report Header Card */}
      <div className="p-6 md:p-8 glass-card border border-border-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface/60 border border-border-dark px-3 py-1 rounded-full">
            <Calendar size={14} />
            {formatDate(report.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-surface/60 border border-border-dark px-3 py-1 rounded-full">
            <Briefcase size={14} />
            Target: {report.jobDescription || 'General Profile'}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-text-main mt-2 mb-6">
          {report.title || 'Career Profile Assessment'}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-border-dark">
          {/* Progress Circular Ring */}
          <div className="progress-circle shadow-lg glow-primary flex-shrink-0" style={{ '--progress': report.matchScore || 0 }}>
            <span className="progress-text">{report.matchScore || 0}%</span>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-heading font-bold text-text-main">ATS Compatibility Index</h3>
            <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
              Your profile currently matches {report.matchScore}% of the target requirements.
              {report.matchScore >= 80 
                ? ' Excellent alignment! Your resume contains appropriate keywords and experiences. Proceed directly to target applications.' 
                : report.matchScore >= 50 
                ? ' Strong foundation, but bridging the key skill gaps listed below will significantly improve automated resume screening responses.' 
                : ' Noticeable gap matches identified. We recommend restructuring your experiences and walking through the tailored learning steps.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Skill Gaps and Timeline Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Skill Gaps Component */}
        <div className="lg:col-span-5 p-6 glass-card border border-border-dark space-y-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2">
              <AlertTriangle className="text-secondary" size={20} />
              <span>Identified Skill Gaps</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">Key credentials or concepts missing or weak in your resume matches</p>
          </div>
          
          {report.skillGaps && report.skillGaps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {report.skillGaps.map((gap, index) => {
                const style = getSeverityStyle(gap.severity);
                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3.5 rounded-lg border text-sm font-semibold transition-all ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {style.icon}
                      <span className="text-text-main truncate">{gap.skill}</span>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface/50 border border-border-dark ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">No key skill gaps identified! You are fully aligned.</p>
          )}
        </div>

        {/* Timeline Roadmap */}
        <div className="lg:col-span-7 p-6 glass-card border border-border-dark space-y-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              <span>Coaching & Preparation Plan</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">Structured 7-day checklist to bridge gaps and prepare for screening</p>
          </div>
          
          {report.preparationPlan && report.preparationPlan.length > 0 ? (
            <div className="relative pl-4 border-l border-border-dark space-y-6">
              {report.preparationPlan.map((plan, index) => (
                <div key={index} className="relative space-y-2">
                  {/* Timeline bullet indicator */}
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background shadow-md"></div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-primary tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      Day {plan.day}
                    </span>
                    <h4 className="font-heading font-bold text-sm text-text-main">{plan.focus}</h4>
                  </div>
                  
                  <ul className="list-disc pl-5 text-xs text-text-muted space-y-1 leading-relaxed">
                    {plan.tasks && plan.tasks.map((task, tIndex) => (
                      <li key={tIndex}>{task}</li>
                    ))}
                  </ul>
                  
                  {plan.resources && plan.resources.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={10} />
                        <span>Learning:</span>
                      </span>
                      {plan.resources.map((res, rIndex) => (
                        <a 
                          key={rIndex} 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-secondary hover:text-text-main bg-secondary/5 border border-secondary/25 hover:border-secondary hover:bg-secondary/10 px-2 py-1 rounded transition-colors"
                        >
                          <span>{res.type === 'youtube' ? '🎥' : '📄'}</span>
                          <span className="truncate max-w-[150px]">{res.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">No preparation plan generated.</p>
          )}
        </div>
      </div>

      {/* Predicted Q&A Sections */}
      {['technical', 'behavioral'].map((type) => {
        const title = type === 'technical' ? 'Predicted Technical Questions' : 'Predicted Behavioral Questions';
        const subtitle = type === 'technical' 
          ? 'Likely screening questions mapped to your identified gaps' 
          : 'Situational prompts assessing core soft skills and culture fit';
        const questionsList = type === 'technical' ? report.technicalQuestions : report.behavioralQuestions;

        return (
          <div key={type} className="p-6 glass-card border border-border-dark space-y-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2">
                <FileText className="text-accent" size={20} />
                <span>{title}</span>
              </h3>
              <p className="text-xs text-text-muted mt-1">{subtitle}</p>
            </div>
            
            {questionsList && questionsList.length > 0 ? (
              <div className="space-y-3">
                {questionsList.map((qa, index) => {
                  const key = `${type}-${index}`;
                  const isExpanded = expandedQuestions[key];
                  return (
                    <div 
                      key={index} 
                      className={`border border-border-dark rounded-lg overflow-hidden transition-all bg-surface/30 hover:bg-surface/50`}
                    >
                      <button 
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-text-main gap-4 cursor-pointer" 
                        onClick={() => toggleQuestion(index, type)}
                      >
                        <span className="truncate">Q: {qa.question}</span>
                        <span className="text-text-muted flex-shrink-0">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-border-dark bg-background/40 space-y-4 text-xs">
                              <div className="space-y-1">
                                <span className="font-bold text-[10px] uppercase text-secondary tracking-wider">Recruiter Intent</span>
                                <p className="text-text-muted leading-relaxed">{qa.intention}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="font-bold text-[10px] uppercase text-primary tracking-wider">Suggested Response Format</span>
                                <p className="text-text-main font-mono bg-surface/40 p-3.5 rounded border border-border-dark leading-relaxed whitespace-pre-wrap">
                                  {qa.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">No questions available.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
