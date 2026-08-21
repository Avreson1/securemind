import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LoginPage from './components/LoginPage';
import PhishingSimulator from './components/PhishingSimulator';
import QuizEngine from './components/QuizEngine';
import AdminDashboard from './components/AdminDashboard';
import QuestionManager from './components/QuestionManager';
import { Shield, Lock } from 'lucide-react';
import { apiService } from './services/api';

const STORAGE_KEY = 'securemind_active_profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [user, setUser] = useState(null);
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
    setLogoutMessage('You have successfully signed out of your session.');
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

  // 1. Initial Loading Screen
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/30 text-white font-bold animate-pulse">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <p className="text-xs font-mono tracking-wider text-cyan-400">INITIALIZING DEFENSE MATRIX...</p>
      </div>
    );
  }

  // 2. Enterprise Login Page (When Unauthenticated)
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={handleSaveProfile}
        logoutMessage={logoutMessage}
      />
    );
  }

  const isCyberAdmin = user.role === 'admin';

  // 3. Authenticated Platform Application
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Cybernetic Glow Grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.12),rgba(255,255,255,0))]"></div>

      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenOnboarding={() => {}}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
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

      </main>

      {/* Modern Cyber Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060913] py-6 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">SecureMind</span>
            <span className="text-slate-500">| Two-Tier RBAC & Live Database Telemetry</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-400">
            <span>FastAPI + React + PostgreSQL / SQLite</span>
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
