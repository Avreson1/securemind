import React, { useState, useEffect } from 'react';
import { Terminal, Plus, Trash2, CheckCircle2, ShieldAlert, Sparkles, BookOpen, Layers } from 'lucide-react';
import { apiService } from '../services/api';

const CATEGORIES = [
  'Phishing',
  'Social Engineering',
  'Credential Hygiene',
  'Physical Security',
  'Ransomware'
];

export default function QuestionManager({ user }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Scenario Form State
  const [scenarioText, setScenarioText] = useState('');
  const [category, setCategory] = useState('Phishing');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await apiService.getQuestions();
      setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!scenarioText || !optionA || !optionB || !feedback) return;

    setSaving(true);
    try {
      const payload = {
        scenario_text: scenarioText,
        category,
        difficulty,
        type: 'multiple_choice',
        options: [optionA, optionB, optionC, optionD].filter(Boolean),
        correct_index: parseInt(correctIndex, 10),
        educational_feedback: feedback
      };

      await apiService.createQuestion(payload);
      setShowAddForm(false);
      resetForm();
      loadQuestions();
    } catch (e) {
      console.error('Error creating question:', e);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setScenarioText('');
    setCategory('Phishing');
    setDifficulty('Intermediate');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectIndex(0);
    setFeedback('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1527] to-slate-900 border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>Scenario Bank & Simulation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Threat Scenario Curriculum Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect, author, and deploy organizational cybersecurity scenarios to employee training modules.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Creation' : 'Author New Scenario'}</span>
        </button>
      </div>

      {/* Author Scenario Form */}
      {showAddForm && (
        <form onSubmit={handleCreateQuestion} className="p-6 rounded-2xl bg-[#0e1626] border border-cyan-500/40 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Create Custom Attack Simulation</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Scenario Situation Description
            </label>
            <textarea
              required
              rows={3}
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="e.g. You notice an unauthorized device connected to the office network switch in the 3rd-floor conference room..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Threat Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Multiple Choice Responses (Select which is correct):
            </label>

            {[
              { label: 'Option A', val: optionA, set: setOptionA, idx: 0 },
              { label: 'Option B', val: optionB, set: setOptionB, idx: 1 },
              { label: 'Option C', val: optionC, set: setOptionC, idx: 2 },
              { label: 'Option D', val: optionD, set: setOptionD, idx: 3 },
            ].map((opt) => (
              <div key={opt.label} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="correct_idx"
                  checked={correctIndex === opt.idx}
                  onChange={() => setCorrectIndex(opt.idx)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
                <input
                  type="text"
                  required={opt.idx < 2}
                  placeholder={`${opt.label} response text`}
                  value={opt.val}
                  onChange={(e) => opt.set(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Educational Remediation & Feedback (Shown after employee answers)
            </label>
            <textarea
              required
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain the underlying threat mechanism and the precise corporate protocol..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving Scenario...' : 'Save & Publish Scenario'}
            </button>
          </div>
        </form>
      )}

      {/* Scenario Bank List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Active Scenarios ({questions.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      {q.difficulty || 'Intermediate'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white pt-1">
                    {q.scenario_text}
                  </h4>
                </div>
              </div>

              {/* Options breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                      oIdx === q.correct_index
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-mono font-bold text-[10px] w-4">{String.fromCharCode(65 + oIdx)}.</span>
                    <span className="truncate">{opt}</span>
                    {oIdx === q.correct_index && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400">
                <strong className="text-cyan-400">Remediation Feedback:</strong> {q.educational_feedback}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
