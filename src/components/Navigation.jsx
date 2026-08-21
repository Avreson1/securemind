import React from 'react';
import { Shield, ShieldAlert, BarChart3, MailCheck, User, LogOut, Sparkles, Building2, Terminal, Key, Users } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, user, onOpenOnboarding, onLogout }) {
  const isCyberAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/60 bg-[#070b14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('simulator')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Shield className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  SecureMind
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  Two-Tier RBAC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Staff Security Awareness & Threat Simulation Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Protected by RBAC) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {/* Standard Staff & Admin Links */}
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MailCheck className="w-4 h-4" />
              <span>Phishing Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Knowledge Quizzes</span>
            </button>

            {/* Cyber Security Team Exclusive Tabs */}
            {isCyberAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'text-purple-300 hover:text-white hover:bg-purple-950/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-purple-300" />
                  <span>Cyber Oversight</span>
                </button>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'scenarios'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'text-purple-300 hover:text-white hover:bg-purple-950/60'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-purple-300" />
                  <span>Scenario Bank</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Side: User Profile & Role Indicator */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isCyberAdmin 
                    ? 'bg-purple-950 border border-purple-500/50 text-purple-300' 
                    : 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'
                }`}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                    <span className="truncate max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {user.department}
                    </span>
                  </div>
                </div>

                {/* Role Badge */}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border hidden sm:inline-block ${
                  isCyberAdmin
                    ? 'bg-purple-950/90 border-purple-500/50 text-purple-300 font-mono'
                    : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 font-mono'
                }`}>
                  {isCyberAdmin ? '⚡ Cyber Team' : '👤 Staff'}
                </span>

                {/* Switch Account */}
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="text-slate-400 hover:text-cyan-300 p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1"
                  title="Switch or Enroll Another Account"
                >
                  <User className="w-4 h-4" />
                  <span className="text-[11px] hidden md:inline">Switch</span>
                </button>

                {/* Explicit Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-rose-400 hover:text-white p-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-600 rounded-lg transition-all border border-rose-500/30 flex items-center space-x-1 font-bold text-xs"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Enroll</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-2 py-1 rounded ${activeTab === 'simulator' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Phish Lab
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-2 py-1 rounded ${activeTab === 'quiz' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Quizzes
          </button>
          {isCyberAdmin && (
            <>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-2 py-1 rounded ${activeTab === 'analytics' ? 'text-purple-400 font-bold' : 'text-purple-300'}`}
              >
                Oversight
              </button>
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`px-2 py-1 rounded ${activeTab === 'scenarios' ? 'text-purple-400 font-bold' : 'text-purple-300'}`}
              >
                Scenarios
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
