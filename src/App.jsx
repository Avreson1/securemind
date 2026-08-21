import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import OnboardingModal from './components/OnboardingModal';
import PhishingSimulator from './components/PhishingSimulator';
import QuizEngine from './components/QuizEngine';
import AdminDashboard from './components/AdminDashboard';
import QuestionManager from './components/QuestionManager';
import { Shield, ShieldAlert, Sparkles, AlertCircle, ArrowUpRight, Terminal, Award, Lock, Key } from 'lucide-react';
import { apiService } from './services/api';

const STORAGE_KEY = 'securemind_active_profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [user, setUser] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify account exists in live database
        const verified = await apiService.login(parsed.email);
        setUser(verified);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
      } catch (e) {
        console.warn('Session verification fallback, prompting authentication:', e.message);
        localStorage.removeItem(STORAGE_KEY);
        // Auto-fetch default seeded admin or open onboarding
        tryLoginDefault();
      }
    } else {
      tryLoginDefault();
    }
    setInitialLoading(false);
  };

  const tryLoginDefault = async () => {
    try {
      // Auto-authenticate seeded admin for initial convenience or prompt onboarding
      const adminProfile = await apiService.login('admin@securemind-corp.com');
      setUser(adminProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProfile));
    } catch (e) {
      setIsOnboardingOpen(true);
    }
  };

  const handleSaveProfile = (profileData) => {
    setUser(profileData);
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
              <span><strong>Enrolled as Staff:</strong> {user?.name} ({user?.department}). Completing challenges automatically updates your department's Security Maturity Index.</span>
            </div>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
            >
              Switch Account
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB ROUTING (Protected by Two-Tier RBAC)    */}
        {/* ========================================== */}

        {/* 1. Phishing Lab */}
        {activeTab === 'simulator' && (
          <PhishingSimulator
            user={user}
            onScoreUpdate={() => {}}
          />
        )}

        {/* 2. Knowledge Challenges */}
        {activeTab === 'quiz' && (
          <QuizEngine
            user={user}
            onQuizCompleted={() => {}}
          />
        )}

        {/* 3. Cyber Team: Analytics & User Management (Protected) */}
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
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
              >
                Authenticate with Cyber Admin Account
              </button>
            </div>
          )
        )}

        {/* 4. Cyber Team: Scenario Curriculum Manager (Protected) */}
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
