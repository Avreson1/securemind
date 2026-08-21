import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Building, Key, Sparkles, CheckCircle2, ArrowRight, LogIn, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
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
  
  // Live Active Accounts fetched from Database
  const [dbUsers, setDbUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLiveUsers();
      setErrorMessage('');
    }
  }, [isOpen]);

  const fetchLiveUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await apiService.getAllUsers();
      setDbUsers(users);
    } catch (e) {
      console.warn('Could not pre-fetch live accounts list:', e.message);
    } finally {
      setLoadingUsers(false);
    }
  };

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
      setErrorMessage(err.message || 'Registration failed. Please check network connection.');
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
      setErrorMessage(err.message || 'Account not found. Please enroll below.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSelect = async (user) => {
    setLoginEmail(user.email);
    setSubmitting(true);
    setErrorMessage('');
    try {
      const profile = await apiService.login(user.email);
      onSaveProfile(profile);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#0e172a] to-[#090d1a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 max-h-[92vh] overflow-y-auto">
        
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
            Two-Tier Role-Based Access Control (Cyber Team & Standard Staff)
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
            <span>Sign In (Existing Account)</span>
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
        {/* MODE 1: LOGIN (Live Database Lookup)       */}
        {/* ========================================== */}
        {authMode === 'login' && (
          <div className="space-y-4">
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
                  placeholder="e.g. admin@securemind-corp.com or s.jenkins@securemind-corp.com"
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
                    <span>Authenticate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Live Database Enrolled Accounts Quick Selector */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <span>Enrolled Accounts (Live DB)</span>
                </span>
                <button
                  type="button"
                  onClick={fetchLiveUsers}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                  title="Refresh DB accounts"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingUsers ? (
                <div className="py-4 text-center text-slate-500 text-xs">Querying database...</div>
              ) : dbUsers.length === 0 ? (
                <div className="py-3 text-center text-slate-500 text-xs">No accounts found. Please enroll a staff member.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {dbUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className={`text-left p-2 rounded-xl border text-xs transition-all ${
                        u.role === 'admin'
                          ? 'bg-purple-950/30 border-purple-500/40 hover:bg-purple-900/40 text-purple-200'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="font-bold truncate text-[11px]">{u.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                        <span className="truncate">{u.department}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-bold ${
                          u.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role === 'admin' ? 'Cyber Team' : 'Staff'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODE 2: REGISTER NEW STAFF                 */}
        {/* ========================================== */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Dr. Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Corporate Email</span>
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex.morgan@securemind-corp.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Department</span>
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Access Role</span>
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="staff">Standard Staff (Training)</option>
                  <option value="admin">Cyber Security Team (Admin)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !regName || !regEmail}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span>Enrolling User into Database...</span>
                ) : (
                  <>
                    <span>Complete Enrollment & Enter Platform</span>
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
