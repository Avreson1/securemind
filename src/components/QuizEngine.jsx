import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle2, XCircle, Award, RotateCcw, 
  ArrowRight, Sparkles, Filter, HelpCircle, Layers, Check, FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

export default function QuizEngine({ user, onQuizCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [question_id]: selected_index }
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const catParam = selectedCategory === 'All' ? null : selectedCategory;
      const data = await apiService.getQuestions(catParam);
      setQuestions(data);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowFeedback(false);
      setQuizFinished(false);
      setSubmissionResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentAnswer = currentQ ? userAnswers[currentQ.id] : undefined;

  const handleSelectOption = (index) => {
    if (showFeedback || quizFinished) return;
    setUserAnswers({
      ...userAnswers,
      [currentQ.id]: index
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setSubmitting(true);
    setQuizFinished(true);

    const answersList = questions.map((q) => ({
      question_id: q.id,
      selected_index: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1
    }));

    const submissionPayload = {
      user_id: user?.id || 'demo-user',
      answers: answersList
    };

    try {
      const result = await apiService.submitQuiz(submissionPayload);
      setSubmissionResult(result);
      if (result.passed) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      if (onQuizCompleted) {
        onQuizCompleted(result);
      }
    } catch (e) {
      console.error('Error submitting quiz:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setShowFeedback(false);
    setQuizFinished(false);
    setSubmissionResult(null);
  };

  const categories = ['All', 'Phishing', 'Social Engineering', 'Credential Hygiene', 'Physical Security', 'Ransomware'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Quiz Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1527] to-slate-900 border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Interactive Knowledge Assessment</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Security Awareness Challenges
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-world threat scenarios designed to test decision-making under authentic attack conditions.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 max-w-sm sm:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Loading cybersecurity scenario bank...</p>
        </div>
      ) : totalQuestions === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-sm">No scenarios found for category: {selectedCategory}</p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Show All Scenarios
          </button>
        </div>
      ) : !quizFinished ? (
        
        /* Active Scenario Card */
        <div className="space-y-4">
          
          {/* Progress Tracker Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Scenario {currentIndex + 1} of {totalQuestions}</span>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-sans font-bold">
                {currentQ.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-sans">
                {currentQ.difficulty || 'Intermediate'}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {/* Scenario Question Content */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1626] border border-slate-700/80 shadow-2xl space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                Threat Situation #0{currentIndex + 1}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1 leading-relaxed">
                {currentQ.scenario_text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = currentAnswer === optIdx;
                const isCorrect = optIdx === currentQ.correct_index;
                
                let optionStyle = 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50 text-slate-200';
                if (showFeedback) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                  } else {
                    optionStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-cyan-950/90 border-cyan-400 text-cyan-200';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={showFeedback}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Educational Feedback Banner */}
            {showFeedback && (
              <div className={`p-5 rounded-xl border animate-fadeIn ${
                currentAnswer === currentQ.correct_index
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-1.5">
                  {currentAnswer === currentQ.correct_index ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Correct Protocol Executed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">Security Gap Identified</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQ.educational_feedback}
                </p>
              </div>
            )}

            {/* Bottom Next Action */}
            {showFeedback && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <span>{currentIndex < totalQuestions - 1 ? 'Next Scenario' : 'View Final Assessment Score'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      ) : (

        /* Quiz Completion Card */
        <div className="p-8 rounded-2xl bg-[#0e1626] border border-cyan-500/40 shadow-2xl text-center space-y-6 animate-fadeIn">
          
          <div className="inline-flex p-4 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 shadow-inner">
            <Award className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Assessment Telemetry Recorded
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {submissionResult?.passed ? 'Security Readiness Certified!' : 'Additional Training Recommended'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your results have been synced with the company Security Maturity Index under the <strong>{user?.department || 'Finance'}</strong> department.
            </p>
          </div>

          {/* Score Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-400">Score Achieved</div>
              <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">
                {submissionResult?.score || 0} / {submissionResult?.total_questions || totalQuestions}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-400">Accuracy</div>
              <div className={`text-2xl font-black mt-1 font-mono ${submissionResult?.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {submissionResult?.percentage || 0}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-400">Status</div>
              <div className={`text-sm font-extrabold mt-2 uppercase tracking-wider ${submissionResult?.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {submissionResult?.passed ? 'PASSED (>= 70%)' : 'NEEDS REVIEW'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Scenario Challenge</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
