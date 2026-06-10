import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ClipboardList, AlertCircle, RefreshCw, CheckCircle, XCircle, Brain, Trophy, ChevronRight, Play, ArrowLeft, Award, HelpCircle } from 'lucide-react';

export default function Quiz() {
  // Page states: 'setup', 'playing', 'results'
  const [gameState, setGameState] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Setup forms
  const [quizMode, setQuizMode] = useState('jd'); // 'jd' or 'skills'
  const [jobTitleList, setJobTitleList] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [difficulty, setDifficulty] = useState('Easy');
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Quiz gameplay states
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionString }

  // Fetch report history for setup dropdowns
  const loadSetupData = async () => {
    try {
      const reportData = await api.get('/api/interview/history');
      const reports = reportData.reports || [];
      
      const titles = [...new Set(reports.map(r => r.title || r.jobDescription).filter(Boolean))];
      setJobTitleList(titles);
      if (titles.length > 0) {
        setSelectedJobTitle(titles[0]);
      }
      
      const allGaps = [];
      reports.forEach(r => {
        if (r.skillGaps && Array.isArray(r.skillGaps)) {
          r.skillGaps.forEach(g => {
            if (g.skill) allGaps.push(g.skill);
          });
        }
      });
      const uniqueGaps = [...new Set(allGaps)];
      setAvailableSkills(uniqueGaps);
      if (uniqueGaps.length > 0) {
        setSelectedSkills([uniqueGaps[0]]);
      }
    } catch (err) {
      console.error("Failed to load coaching history for quiz:", err);
    }
  };

  useEffect(() => {
    loadSetupData();
  }, []);

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const cleanSkill = customSkillInput.trim();
    if (!selectedSkills.includes(cleanSkill)) {
      setSelectedSkills(prev => [...prev, cleanSkill]);
      if (!availableSkills.includes(cleanSkill)) {
        setAvailableSkills(prev => [...prev, cleanSkill]);
      }
    }
    setCustomSkillInput('');
  };

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    setError('');

    if (quizMode === 'jd' && !selectedJobTitle) {
      setError('Please select a target job profile.');
      return;
    }
    if (quizMode === 'skills' && selectedSkills.length === 0) {
      setError('Please select or enter at least one skill.');
      return;
    }

    const parsedNum = Number(numQuestions);
    if (isNaN(parsedNum) || parsedNum < 1 || !Number.isInteger(parsedNum)) {
      setError('Please enter a valid positive integer for the number of questions (minimum 1).');
      return;
    }
    if (parsedNum > 30) {
      setError('Please enter a number of questions between 1 and 30.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode: quizMode,
        numQuestions: parsedNum,
        difficulty,
        jobTitle: quizMode === 'jd' ? selectedJobTitle : undefined,
        skills: quizMode === 'skills' ? selectedSkills : undefined
      };
      
      const data = await api.post('/api/quiz/generate', payload);
      setQuizData(data.quiz);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setGameState('playing');
    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError(err.message || "Failed to generate quiz questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: option
    }));
  };

  const handleNext = () => {
    const currentQuestion = quizData.questions[currentQuestionIdx];
    const selected = answers[currentQuestionIdx] || '';
    const correct = currentQuestion.correctAnswer || '';
    const isCorrect = selected.trim().toLowerCase() === correct.trim().toLowerCase();

    if (isCorrect) {
      setDifficulty(prev => {
        if (prev === 'Easy') return 'Medium';
        if (prev === 'Medium') return 'Hard';
        return 'Hard';
      });
    }

    if (currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const gradedQuestions = quizData.questions.map((q, idx) => {
      const selected = answers[idx] || '';
      const correct = q.correctAnswer || '';
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correct,
        selectedAnswer: selected,
        isCorrect: selected.trim().toLowerCase() === correct.trim().toLowerCase(),
        explanation: q.explanation
      };
    });

    const lastQuestionGraded = gradedQuestions[currentQuestionIdx];
    let finalDifficulty = difficulty;
    if (lastQuestionGraded && lastQuestionGraded.isCorrect) {
      if (difficulty === 'Easy') finalDifficulty = 'Medium';
      else if (difficulty === 'Medium') finalDifficulty = 'Hard';
    }
    setDifficulty(finalDifficulty);

    const correctCount = gradedQuestions.filter(q => q.isCorrect).length;
    const finalScore = Math.round((correctCount / quizData.questions.length) * 100);

    setQuizData(prev => ({
      ...prev,
      score: finalScore,
      questions: gradedQuestions
    }));
    setGameState('results');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // ==========================================
  // RENDER: PLAYING GAME VIEW
  // ==========================================
  if (gameState === 'playing') {
    const currentQuestion = quizData.questions[currentQuestionIdx];
    const totalQuestions = quizData.questions.length;
    const isAnswered = answers[currentQuestionIdx] !== undefined;

    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-16">
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 rounded-lg bg-surface border border-border-dark text-xs font-semibold text-text-muted hover:text-text-main hover:border-primary/40 transition-all cursor-pointer flex items-center gap-1"
            onClick={() => {
              if (window.confirm("Exit quiz? Your progress will be lost.")) setGameState('setup');
            }}
          >
            <ArrowLeft size={14} /> 
            <span>Exit Quiz</span>
          </button>
          <h2 className="text-lg font-heading font-extrabold text-text-main leading-tight truncate">
            {quizData.title || 'Interview Quiz'}
          </h2>
        </div>

        {/* Global Progress Indicators */}
        <div className="p-5 glass-card border border-border-dark space-y-3">
          <div className="flex justify-between text-xs font-semibold text-text-main">
            <span>Question {currentQuestionIdx + 1} of {totalQuestions}</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-primary/10 border border-primary/20 text-primary">
              {difficulty}
            </span>
          </div>
          <div className="h-1.5 bg-surface border border-border-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Panel Card */}
        <div className="p-6 md:p-8 glass-card border border-border-dark space-y-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="text-primary flex-shrink-0 mt-0.5" size={24} />
            <h3 className="text-base md:text-lg font-heading font-bold text-text-main leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="flex flex-col gap-3.5 pt-4 border-t border-border-dark">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestionIdx] === option;
              return (
                <button
                  key={idx}
                  className={`w-full flex items-center text-left gap-4 p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/10 border-primary text-primary shadow-md' 
                      : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main hover:bg-surface/50'
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  <span className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-primary text-white' : 'bg-surface border border-border-dark text-text-muted'
                  }`}>
                    {letter}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-4">
          <button 
            className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/85 border border-border-dark text-xs font-semibold text-text-main disabled:opacity-50 cursor-pointer"
            onClick={handlePrev} 
            disabled={currentQuestionIdx === 0}
          >
            Previous
          </button>
          
          {currentQuestionIdx === totalQuestions - 1 ? (
            <button 
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-60"
              onClick={handleSubmitQuiz} 
              disabled={loading}
            >
              {loading ? <RefreshCw className="spinner" size={16} /> : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
              onClick={handleNext}
              disabled={!isAnswered}
            >
              <span className="flex items-center gap-1">
                <span>Next Question</span>
                <ChevronRight size={14} />
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: COMPLETED GAME RESULTS SCREEN
  // ==========================================
  if (gameState === 'results') {
    const scoreColor = getScoreColor(quizData.score);
    return (
      <div className="space-y-8 max-w-4xl mx-auto pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dark pb-6">
          <h2 className="text-2xl font-heading font-extrabold text-text-main">Quiz Results</h2>
          <button 
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
            onClick={() => setGameState('setup')}
          >
            Take Another Quiz
          </button>
        </div>

        {/* Score Ring Summary Box */}
        <div className="p-6 md:p-8 glass-card border border-border-dark flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="progress-circle shadow-md glow-primary flex-shrink-0" style={{ '--progress': quizData.score, background: `conic-gradient(${scoreColor} calc(var(--progress) * 1%), rgba(255, 255, 255, 0.08) 0)` }}>
            <span className="progress-text">{quizData.score}%</span>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <Trophy className="mx-auto sm:mx-0 animate-float" size={32} style={{ color: scoreColor }} />
            <h3 className="text-lg font-heading font-bold text-text-main">Quiz Completed!</h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-md">
              You correctly resolved {quizData.questions.filter(q => q.isCorrect).length} out of {quizData.questions.length} questions.
              {quizData.score >= 80 
                ? ' Excellent performance! You demonstrate an exceptional command of these concepts.' 
                : quizData.score >= 50 
                ? ' Commendable attempt, but addressing the minor gaps in review below will strengthen your depth.' 
                : ' Noticeable understanding gaps identified. We recommend revisiting the study resources.'}
            </p>
          </div>
        </div>

        {/* Question Breakdown List */}
        <div className="space-y-6">
          <h3 className="font-heading font-bold text-lg text-text-main">Question Breakdown</h3>
          <div className="space-y-6">
            {quizData.questions.map((q, idx) => (
              <div 
                key={idx} 
                className={`p-6 glass-card border flex flex-col gap-5 ${
                  q.isCorrect ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {q.isCorrect ? (
                    <CheckCircle size={22} className="text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <h4 className="font-heading font-bold text-sm text-text-main leading-relaxed">
                    Question {idx + 1}: {q.question}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pl-9">
                  {q.options.map((option, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isSelected = q.selectedAnswer === option;
                    const isCorrectAnswer = q.correctAnswer === option;
                    
                    let styleClass = 'border-border-dark bg-surface/30 text-text-muted';
                    if (isCorrectAnswer) styleClass = 'border-green-500/30 bg-green-500/10 text-green-400';
                    else if (isSelected) styleClass = 'border-red-500/30 bg-red-500/10 text-red-400';

                    return (
                      <div 
                        key={oIdx} 
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold ${styleClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{letter}</span>
                          <span>{option}</span>
                        </div>
                        {isCorrectAnswer && <span className="px-2 py-0.5 rounded text-[8px] bg-green-500/20 text-green-400 uppercase font-bold tracking-wider">Correct Answer</span>}
                        {isSelected && !isCorrectAnswer && <span className="px-2 py-0.5 rounded text-[8px] bg-red-500/20 text-red-400 uppercase font-bold tracking-wider">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-surface/40 border border-border-dark text-xs text-text-muted leading-relaxed pl-9">
                  <Brain size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-text-main block">AI Conceptual Explanation:</strong>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SETUP SCREEN
  // ==========================================
  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-extrabold text-text-main tracking-tight">Interview Prep Quiz</h1>
        <p className="text-text-muted text-sm max-w-xl mx-auto">Test your technical skills and job knowledge through customized, dynamically generated MCQs</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 md:p-12 glass-card border border-border-dark flex items-center justify-center glow-primary">
          <div className="text-center w-full space-y-6">
            <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse-glow">
              <Brain size={36} className="spinner" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-text-main">Generating Dynamic Interview Quiz...</h2>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              AI is compiling multiple-choice questions matching difficulty "{difficulty}" and question count "{numQuestions}".
            </p>
            
            <div className="w-full max-w-xs mx-auto h-1 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse-glow" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 glass-card border border-border-dark">
          <form onSubmit={handleStartQuiz} className="space-y-5">
            <h3 className="font-heading font-bold text-sm text-text-main">Quiz Configuration</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted block">Quiz Scope Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    quizMode === 'jd' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main'
                  }`}
                  onClick={() => setQuizMode('jd')}
                >
                  Target Job Profile
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    quizMode === 'skills' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'border-border-dark bg-surface/30 text-text-muted hover:text-text-main'
                  }`}
                  onClick={() => setQuizMode('skills')}
                >
                  Target Skills
                </button>
              </div>
            </div>

            {quizMode === 'jd' ? (
              <div className="space-y-2 animate-fade-in">
                <label htmlFor="jobTitleSelect" className="text-xs font-semibold text-text-muted block">Select Job Profile *</label>
                {jobTitleList.length === 0 ? (
                  <div className="p-3 border border-red-500/20 bg-red-500/5 rounded text-xs text-red-400">
                    No analyzed job profiles found. Upload a resume first to extract targets!
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      id="jobTitleSelect"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
                      value={selectedJobTitle}
                      onChange={(e) => setSelectedJobTitle(e.target.value)}
                    >
                      {jobTitleList.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">
                      ▼
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <label className="text-xs font-semibold text-text-muted block">Select Target Skills *</label>
                
                {availableSkills.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-2 border border-border-dark rounded bg-surface/30">
                    {availableSkills.map((skill, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-xs text-text-muted cursor-pointer hover:text-text-main transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => handleToggleSkill(skill)}
                          className="rounded text-primary border-border-dark bg-surface focus:ring-primary focus:ring-offset-0 focus:ring-1"
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add another skill (e.g. Docker, SQL)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-surface border border-border-dark text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-primary transition-all"
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 rounded bg-surface hover:bg-surface/85 border border-border-dark text-xs font-semibold text-text-main cursor-pointer" 
                    onClick={handleAddCustomSkill}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="numQuestionsInput" className="text-xs font-semibold text-text-muted block">Number of Questions</label>
              <input
                id="numQuestionsInput"
                type="number"
                min="1"
                max="30"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter number of questions (1-30)"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={(quizMode === 'jd' && !selectedJobTitle) || (quizMode === 'skills' && selectedSkills.length === 0)}
            >
              <Play size={14} /> 
              <span>Generate & Start Quiz</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
