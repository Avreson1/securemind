import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import OnboardingModal from './components/OnboardingModal';
import PhishingSimulator from './components/PhishingSimulator';
import QuizEngine from './components/QuizEngine';
import AdminDashboard from './components/AdminDashboard';
import QuestionManager from './components/QuestionManager';
import { Shield, ShieldAlert, Sparkles, AlertCircle, ArrowUpRight, Terminal, Award, Lock, Key, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import { apiService } from './services/api';

const STORAGE_KEY = 'securemind_active_profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [user, setUser] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState('');

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const verified = await apiService.login(parsed.email);
        setUser(verified);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
    }
    setInitialLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setLogoutMessage('You have successfully signed out.');
    setTimeout(() => setLogoutMessage(''), 5000);
  };

  const handleSaveProfile = (profileData) => {
    setUser(profileData);
    setLogoutMessage('');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
    if (profileData.role === 'admin') {
      setActiveTab('analytics');
    } else {
      setActiveTab('simulator');
    }
  };

  const isCyberAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Cybernetic Glow Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.12),rgba(255,255,255,0))]"></div>

      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Logout Toast Notification */}
        {logoutMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{logoutMessage}</span>
            </div>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs font-bold underline hover:text-emerald-200"
            >
              Sign in again
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SIGNED-OUT AUTHENTICATION GATE (When Logged Out)                      */}
        {/* ========================================================================= */}
        {!user && !initialLoading && (
          <div className="py-12 px-6 max-w-3xl mx-auto text-center space-y-8 animate-fadeIn">
            <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-400 shadow-2xl shadow-cyan-950/60">
              <Shield className="w-12 h-12" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                Enterprise Identity Gate
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                SecureMind Cybersecurity Simulation
              </h1>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Sign in to access interactive phishing inspection labs, threat domain knowledge challenges, and live Security Maturity Index telemetry.
              </p>
            </div>

            {/* Quick Authentication Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              
              {/* Admin Sign In Button */}
              <button
                onClick={async () => {
                  try {
                    const profile = await apiService.login('admin@securemind-corp.com');
                    handleSaveProfile(profile);
                  } catch (e) {
                    setIsOnboardingOpen(true);
                  }
                }}
                className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/70 to-slate-900 border border-purple-500/40 hover:border-purple-400 text-left space-y-2 shadow-xl hover:shadow-purple-900/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-purple-900/60 text-purple-300 group-hover:scale-110 transition-transform">
                    <Key className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40 font-mono">
                    Admin Portal
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cyber Security Lead</h3>
                  <p className="text-xs text-slate-400">admin@securemind-corp.com</p>
                </div>
              </button>

              {/* Staff Enrollment Button */}
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/70 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left space-y-2 shadow-xl hover:shadow-cyan-900/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-cyan-900/60 text-cyan-300 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-mono">
                    Staff Portal
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Enroll or Sign In</h3>
                  <p className="text-xs text-slate-400">Register employee account</p>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. AUTHENTICATED USER PORTAL (When Logged In)                            */}
        {/* ========================================================================= */}
        {user && (
          <>
            {/* Cyber Team Role Banner */}
            {isCyberAdmin ? (
              <div className="mb-6 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs text-purple-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  <span><strong>Cyber Security Team Portal Active:</strong> Full administrative visibility, user account management, and scenario authoring unlocked.</span>
                </div>
                <button
                  onClick={() => setActiveTab(activeTab === 'analytics' ? 'scenarios' : 'analytics')}
                  className="underline font-semibold hover:text-purple-200"
                >
                  {activeTab === 'analytics' ? 'Manage Scenarios' : 'View Maturity Telemetry'}
                </button>
              </div>
            ) : (
              <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span><strong>Enrolled as Staff:</strong> {user.name} ({user.department}). Completing challenges automatically updates your department's Security Maturity Index.</span>
                </div>
              </div>
            )}

            {/* TAB ROUTING */}
            {activeTab === 'simulator' && (
              <PhishingSimulator
                user={user}
                onScoreUpdate={() => {}}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizEngine
                user={user}
                onQuizCompleted={() => {}}
              />
            )}

            {activeTab === 'analytics' && (
              isCyberAdmin ? (
                <AdminDashboard user={user} />
              ) : (
                <div className="p-12 rounded-2xl bg-[#0e1626] border border-rose-500/40 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
                  <div className="inline-flex p-3 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Access Restricted</h3>
                  <p className="text-xs text-slate-400">
                    This portal requires <strong>Cyber Security Team (Admin)</strong> privileges. Standard staff accounts cannot view oversight telemetry.
                  </p>
                </div>
              )
            )}

            {activeTab === 'scenarios' && (
              isCyberAdmin ? (
                <QuestionManager user={user} />
              ) : (
                <div className="p-12 rounded-2xl bg-[#0e1626] border border-rose-500/40 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
                  <div className="inline-flex p-3 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Access Restricted</h3>
                  <p className="text-xs text-slate-400">
                    Scenario authoring is restricted to Cyber Security Team administrators.
                  </p>
                </div>
              )
            )}
          </>
        )}

      </main>

      {/* Identity & Enrollment Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={user}
      />

      {/* Modern Cyber Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060913] py-6 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">SecureMind</span>
            <span className="text-slate-500">| Two-Tier RBAC & Live Database Telemetry</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-400">
            <span>FastAPI + React + Supabase / SQLite</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Live Database Connected</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
