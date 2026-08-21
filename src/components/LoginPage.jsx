import React, { useState } from 'react';
import { 
  Shield, Lock, Mail, User, Building, Key, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, 
  Sparkles, Terminal, Activity, FileCheck, ExternalLink,
  Cpu, Layers, AlertTriangle
} from 'lucide-react';
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

export default function LoginPage({ onLoginSuccess, logoutMessage }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'enroll'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Enrollment form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('Finance');
  const [regRole, setRegRole] = useState('staff');
  const [regPassword, setRegPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(logoutMessage || '');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const emailClean = loginEmail.trim().toLowerCase();
      const profile = await apiService.login(emailClean);
      onLoginSuccess(profile);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your corporate email address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    if (!acceptedTerms) {
      setErrorMessage('You must accept the Enterprise Cybersecurity Policy to enroll.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const profile = await apiService.registerProfile({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        department: regDept,
        role: regRole
      });
      onLoginSuccess(profile);
    } catch (err) {
      setErrorMessage(err.message || 'Enrollment failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setLoginEmail('admin@securemind-corp.com');
    setLoginPassword('••••••••••••');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      
      {/* Background Cyber Ambient Radiance */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
      </div>

      {/* Top Corporate Navigation Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#070b14]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 text-white font-bold">
              <Shield className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                SecureMind
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono">
                Enterprise v2.4
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 font-mono text-[11px] text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>TLS 1.3 256-Bit Encrypted</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Authentication Showcase */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column: Cyber Threat Intelligence & Platform Telemetry Showcase */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Cybersecurity Awareness Matrix</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Empower Your Workforce Against <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Sophisticated Cyber Threats</span>.
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Experience next-generation simulation labs with full header inspection, SPF/DKIM verification, QR code quishing traps, deepfake voice engineering, and real-time Security Maturity Index (SMI) telemetry.
              </p>
            </div>

            {/* Live Platform Security Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>22 Real Scenarios</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  BEC, M365 credential theft, VEC & deepfake vishing drills.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>Two-Tier RBAC</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Cyber Defense Team admin controls & staff training tracks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <FileCheck className="w-4 h-4" />
                  <span>SMI Telemetry</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Departmental vulnerability tracking & PDF compliance audit logs.
                </p>
              </div>
            </div>

            {/* Enterprise Compliance Trust Strip */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono pt-4 border-t border-slate-800/60">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>SOC 2 TYPE II COMPLIANT</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>ISO/IEC 27001 ALIGNED</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>GDPR / CCPA SECURE</span>
              </span>
            </div>

          </div>

          {/* Right Column: Enterprise Authentication Card */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#0f172a]/95 via-[#0b1020]/95 to-[#070b14]/95 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {authMode === 'login' ? 'Corporate Authentication' : 'Staff Enrollment Portal'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authMode === 'login' 
                      ? 'Enter your enterprise identity credentials' 
                      : 'Register a new employee for security training'}
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'login'
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('enroll'); setErrorMessage(''); }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'enroll'
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Enroll Staff</span>
                </button>
              </div>

              {/* Notification Alerts */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ============================================================== */}
              {/* 1. SIGN IN FORM                                                */}
              {/* ============================================================== */}
              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Corporate Email</span>
                      </span>
                      <button
                        type="button"
                        onClick={fillAdminCredentials}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline font-normal lowercase"
                      >
                        Auto-fill Admin Lead
                      </button>
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. admin@securemind-corp.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Security Password / SSO PIN</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span>Remember this secure device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !loginEmail}
                    className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 tracking-wider uppercase"
                  >
                    {submitting ? (
                      <span>Authenticating Identity...</span>
                    ) : (
                      <>
                        <span>Authorize Session & Enter</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-3 text-center">
                    <p className="text-[11px] text-slate-500">
                      Pre-seeded Cyber Security Lead: <strong className="text-slate-400 font-mono">admin@securemind-corp.com</strong>
                    </p>
                  </div>
                </form>
              )}

              {/* ============================================================== */}
              {/* 2. ENROLL STAFF FORM                                           */}
              {/* ============================================================== */}
              {authMode === 'enroll' && (
                <form onSubmit={handleEnroll} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Employee Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Corporate Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="s.jenkins@securemind-corp.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-1.5">
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Access Role</span>
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400 cursor-pointer font-semibold"
                      >
                        <option value="staff">Standard Staff (Training)</option>
                        <option value="admin">Cyber Security Team (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Security Password</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start space-x-2 text-[11px] text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span>I agree to comply with enterprise cybersecurity acceptable use policy and active threat telemetry monitoring.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !regName || !regEmail}
                    className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 tracking-wider uppercase"
                  >
                    {submitting ? (
                      <span>Enrolling Account into Database...</span>
                    ) : (
                      <>
                        <span>Complete Enrollment & Enter Platform</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Enterprise Security Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-[#060913] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">SecureMind Platform</span>
            <span className="text-slate-600">|</span>
            <span>Enterprise Human Risk Management (HRM)</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>FastAPI Backend + PostgreSQL / SQLite</span>
            <span className="text-emerald-400 flex items-center space-x-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Defense Matrix Online</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
