import React, { useState } from 'react';
import { Shield, User, Mail, Building, Key, Sparkles, CheckCircle2, ArrowRight, LogIn, UserPlus, AlertCircle, X } from 'lucide-react';
import { apiService } from '../services/api';

const DEPARTMENTS = [
  'Finance',
  'Engineering',
  'HR',
  'Sales',
  'Legal',
  'Operations',
  'Cybersecurity & IT',
  'Executive'
];

export default function OnboardingModal({ isOpen, onClose, onSaveProfile, initialProfile }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('Finance');
  const [regRole, setRegRole] = useState('staff');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      const profile = await apiService.registerProfile({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        department: regDept,
        role: regRole
      });
      onSaveProfile(profile);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      const profile = await apiService.login(loginEmail.trim().toLowerCase());
      onSaveProfile(profile);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Account not found. Please verify your email or enroll below.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0e172a] to-[#090d1a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button (Only if already authenticated) */}
        {initialProfile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 mb-2.5 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            SecureMind Identity Access
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Two-Tier Role-Based Access Control
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              authMode === 'login'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              authMode === 'register'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll New Staff</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================== */}
        {/* MODE 1: LOGIN                              */}
        {/* ========================================== */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Corporate Email Address</span>
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@securemind-corp.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !loginEmail}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================== */}
        {/* MODE 2: REGISTER / ENROLL NEW STAFF        */}
        {/* ========================================== */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Employee Full Name</span>
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Corporate Email</span>
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="s.jenkins@securemind-corp.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Department</span>
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Role Tier</span>
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="staff">Standard Staff</option>
                  <option value="admin">Cyber Team (Admin)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !regName || !regEmail}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span>Enrolling User into Database...</span>
                ) : (
                  <>
                    <span>Complete Enrollment & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
