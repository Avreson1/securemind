import React, { useState, useEffect } from 'react';
import { 
  Mail, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, 
  XCircle, Eye, EyeOff, Flag, ArrowRight, ExternalLink, RefreshCw, 
  HelpCircle, Sparkles, UserX, Info, Send, CornerDownLeft, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

export default function PhishingSimulator({ user, onScoreUpdate }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [showHeaders, setShowHeaders] = useState(false);
  const [discoveredRedFlags, setDiscoveredRedFlags] = useState([]);
  const [simulationState, setSimulationState] = useState('active'); // active | debrief
  const [userDecision, setUserDecision] = useState(null); // 'reported' | 'marked_safe'
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [hoveringLink, setHoveringLink] = useState(false);

  useEffect(() => {
    loadPhishingScenarios();
  }, []);

  const loadPhishingScenarios = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Fetch dynamic phishing scenarios from live database
      const data = await apiService.getQuestions('Phishing');
      setScenarios(data);
      setCurrentSimIndex(0);
      setSimulationState('active');
      setDiscoveredRedFlags([]);
      setShowHeaders(false);
    } catch (err) {
      console.error('Failed to load phishing scenarios:', err);
      setErrorMessage('Could not load phishing simulations from database. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const rawQ = scenarios[currentSimIndex];

  // Helper to extract email metadata dynamically from DB record
  const currentSim = rawQ ? {
    id: rawQ.id,
    title: rawQ.email_metadata?.title || `Phishing Scenario #${rawQ.id}`,
    category: rawQ.category,
    difficulty: rawQ.difficulty || 'Intermediate',
    is_phishing: rawQ.email_metadata?.is_phishing !== undefined ? rawQ.email_metadata.is_phishing : true,
    sender_name: rawQ.email_metadata?.sender_name || 'Corporate Notification Desk',
    sender_email: rawQ.email_metadata?.sender_email || 'alerts@notifications-service.com',
    reply_to: rawQ.email_metadata?.reply_to || 'no-reply@notifications-service.com',
    subject: rawQ.email_metadata?.subject || rawQ.scenario_text,
    date: rawQ.email_metadata?.date || 'Today, 08:30 AM',
    spf_status: rawQ.email_metadata?.spf_status || 'FAIL (Unverified)',
    dkim_status: rawQ.email_metadata?.dkim_status || 'Unsigned',
    real_link_target: rawQ.email_metadata?.real_link_target || 'http://unverified-portal-auth.net/verify',
    body_text: rawQ.email_metadata?.body_text || rawQ.scenario_text,
    red_flags: rawQ.email_metadata?.red_flags || [
      { id: 'rf-1', target: 'sender', label: 'Suspicious Sender Domain', description: 'Sender address domain does not align with official company infrastructure.' }
    ],
    educational_debrief: rawQ.email_metadata?.educational_debrief || {
      summary: rawQ.scenario_text,
      explanation: rawQ.educational_feedback,
      key_takeaways: [
        "Inspect sender domain names letter-by-letter for subtle number/character substitutions.",
        "Always execute out-of-band verification before acting on urgent instructions.",
        "Never enter corporate passwords into unverified login portals."
      ]
    }
  } : null;

  const handleRedFlagClick = (flagId) => {
    if (simulationState === 'debrief') return;
    if (!discoveredRedFlags.includes(flagId)) {
      setDiscoveredRedFlags([...discoveredRedFlags, flagId]);
    }
  };

  const handleAction = async (decision) => {
    if (!currentSim) return;
    setUserDecision(decision);
    setSimulationState('debrief');

    const isCorrect = 
      (decision === 'reported' && currentSim.is_phishing) ||
      (decision === 'marked_safe' && !currentSim.is_phishing);

    if (isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    setFeedbackResult({
      isCorrect,
      title: isCorrect ? 'Threat Successfully Identified!' : 'Security Assessment Alert!',
      message: isCorrect
        ? (currentSim.is_phishing ? 'Excellent detection! You correctly flagged and reported a malicious attack.' : 'Great call! You correctly identified a legitimate internal notification.')
        : (currentSim.is_phishing ? 'Vulnerability Detected! You marked a dangerous phishing email as safe.' : 'False Positive! You reported a legitimate internal message.')
    });

    // Log telemetry to database if user is logged in
    if (user?.id) {
      try {
        await apiService.submitQuiz({
          user_id: user.id,
          answers: [{
            question_id: rawQ.id,
            selected_index: isCorrect ? rawQ.correct_index : (rawQ.correct_index === 0 ? 1 : 0)
          }]
        });
      } catch (e) {
        console.warn('Telemetry log error:', e.message);
      }
    }

    if (onScoreUpdate) {
      onScoreUpdate(isCorrect);
    }
  };

  const handleNextSimulation = () => {
    const nextIdx = (currentSimIndex + 1) % scenarios.length;
    setCurrentSimIndex(nextIdx);
    setSimulationState('active');
    setUserDecision(null);
    setFeedbackResult(null);
    setDiscoveredRedFlags([]);
    setShowHeaders(false);
    setHoveringLink(false);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Querying database for active phishing simulation curriculum...</p>
      </div>
    );
  }

  if (errorMessage || scenarios.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0e1626] border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Simulations Available</h3>
        <p className="text-xs text-slate-400">
          {errorMessage || 'No phishing scenarios currently found in the live database.'}
        </p>
        <button
          onClick={loadPhishingScenarios}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Database Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1527] to-slate-900 border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Mail className="w-4 h-4" />
            <span>Interactive Threat Simulator (Live DB Curriculum)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Spot the Lie: Phishing Inspection Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Analyze the incoming email below. Inspect headers, hover over links, identify red flags, and make the right security call before malicious payloads compromise the organization.
          </p>
        </div>

        {/* Progress & Category */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
          <span className="text-xs font-mono text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40">
            Scenario {currentSimIndex + 1} of {scenarios.length}
          </span>
          <span className="text-[11px] text-slate-400">
            Enrolled Staff: <span className="text-slate-200 font-semibold">{user?.name} ({user?.department})</span>
          </span>
        </div>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Email Client */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-[#0e1626] border border-slate-700/80 shadow-xl overflow-hidden">
            
            {/* Email Client Header Bar */}
            <div className="bg-[#131d31] px-5 py-3 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                </div>
                <span className="text-xs text-slate-300 font-mono ml-2 font-semibold">
                  Inbox &gt; Security Sandbox Isolation
                </span>
              </div>

              {/* Toggle Headers Button */}
              <button
                onClick={() => setShowHeaders(!showHeaders)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-600 transition-all"
              >
                {showHeaders ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showHeaders ? 'Hide Headers' : 'Inspect Headers'}</span>
              </button>
            </div>

            {/* Email Metadata & Sender Area */}
            <div className="p-5 border-b border-slate-800/80 space-y-3 bg-[#0d1424]/50">
              
              {/* Subject */}
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-white leading-snug">
                  {currentSim.subject}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap ml-3">
                  {currentSim.date}
                </span>
              </div>

              {/* Sender & Reply-To with clickable inspection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-1">
                <div 
                  onClick={() => currentSim.is_phishing && handleRedFlagClick('rf-1')}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all border ${
                    discoveredRedFlags.includes('rf-1')
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 text-slate-200'
                  }`}
                  title="Click to tag as suspicious sender"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 text-xs">
                    {currentSim.sender_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{currentSim.sender_name}</div>
                    <div className="text-[11px] font-mono text-cyan-400 flex items-center space-x-1">
                      <span>&lt;{currentSim.sender_email}&gt;</span>
                      {discoveredRedFlags.includes('rf-1') && (
                        <span className="text-[9px] bg-rose-900 text-rose-200 px-1 rounded font-sans font-bold">
                          🚩 Flagged Sender
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => currentSim.is_phishing && handleRedFlagClick('rf-2')}
                  className={`p-2 rounded-lg cursor-pointer transition-all border text-right text-[11px] ${
                    discoveredRedFlags.includes('rf-2')
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-cyan-500/50 text-slate-400'
                  }`}
                  title="Click to check Reply-To address"
                >
                  <div>Reply-To: <span className="font-mono text-slate-300">{currentSim.reply_to}</span></div>
                  {discoveredRedFlags.includes('rf-2') && (
                    <span className="text-[9px] bg-rose-900 text-rose-200 px-1 rounded font-sans font-bold inline-block mt-0.5">
                      🚩 Mismatched Routing
                    </span>
                  )}
                </div>
              </div>

              {/* Extended Headers Tray (When opened) */}
              {showHeaders && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#090e18] border border-cyan-500/30 text-xs font-mono space-y-1.5 text-slate-300 animate-fadeIn">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Raw Technical Authentication Headers</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800">
                    <span className="text-slate-500">SPF Authentication:</span>
                    <span className={currentSim.spf_status.includes('FAIL') ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {currentSim.spf_status}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800">
                    <span className="text-slate-500">DKIM Cryptographic Signature:</span>
                    <span className={currentSim.dkim_status.includes('PASS') ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {currentSim.dkim_status}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Security Gateway Status:</span>
                    <span className="text-cyan-400">Sandbox Isolation Mode</span>
                  </div>
                </div>
              )}

            </div>

            {/* Email Body Content */}
            <div className="p-6 space-y-4 text-slate-200 text-sm leading-relaxed min-h-[220px]">
              {currentSim.body_text.split('\n\n').map((paragraph, pIdx) => {
                if (paragraph.includes('[') && paragraph.includes(']')) {
                  const linkText = paragraph.replace('[', '').replace(']', '');
                  return (
                    <div key={pIdx} className="my-5">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setHoveringLink(true)}
                          onMouseLeave={() => setHoveringLink(false)}
                          onClick={() => currentSim.is_phishing && handleRedFlagClick('rf-4')}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all border ${
                            discoveredRedFlags.includes('rf-4')
                              ? 'bg-rose-950 border-rose-400 text-rose-200 ring-2 ring-rose-500'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                          }`}
                        >
                          <span>{linkText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Hover Tooltip showing Real URL Target */}
                        {hoveringLink && (
                          <div className="absolute left-0 top-full mt-2 z-30 p-2.5 rounded-lg bg-slate-950 border border-amber-500/70 text-[11px] font-mono text-amber-300 shadow-2xl whitespace-nowrap animate-fadeIn flex items-center space-x-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <div>
                              <div className="text-[9px] text-slate-400 uppercase font-sans font-bold">Real Destination Target:</div>
                              <div className="text-white font-bold">{currentSim.real_link_target}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {discoveredRedFlags.includes('rf-4') && (
                        <p className="text-[11px] text-rose-400 mt-1.5 flex items-center space-x-1 font-mono">
                          <span>🚩 Suspicious destination domain identified!</span>
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <p key={pIdx} className="text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Bottom Decision Actions */}
            <div className="p-5 bg-[#090e18] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Select your response:</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  disabled={simulationState === 'debrief'}
                  onClick={() => handleAction('marked_safe')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mark as Safe</span>
                </button>

                <button
                  disabled={simulationState === 'debrief'}
                  onClick={() => handleAction('reported')}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report Phishing Attack</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Live Red Flag Detector & Guidance */}
        <div className="space-y-4">
          
          {/* Active Red Flags Panel */}
          <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Red Flag Discovery</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {discoveredRedFlags.length} / {currentSim.red_flags.length} Found
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Click suspicious elements in the email to tag indicators of compromise before submitting your decision.
            </p>

            {currentSim.red_flags.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Zero threats detected. Message appears aligned with standard enterprise policies.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {currentSim.red_flags.map((rf) => {
                  const isFound = discoveredRedFlags.includes(rf.id);
                  return (
                    <div
                      key={rf.id}
                      onClick={() => handleRedFlagClick(rf.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isFound
                          ? 'bg-rose-950/50 border-rose-500/80 text-rose-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{rf.label}</span>
                        {isFound ? (
                          <CheckCircle2 className="w-4 h-4 text-rose-400" />
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Unrevealed</span>
                        )}
                      </div>
                      {isFound && (
                        <p className="text-[11px] text-rose-300/80 mt-1">
                          {rf.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Security Tips Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/20 space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Inspection Protocol</span>
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Check exact domain spelling in the sender email.</li>
              <li>Hover links to inspect real web destinations.</li>
              <li>Never execute wire transfers without voice confirmation.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Immediate Educational Debrief Modal */}
      {simulationState === 'debrief' && feedbackResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#070b14] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Status Header */}
            <div className="flex items-start space-x-4">
              <div className={`p-3.5 rounded-2xl ${feedbackResult.isCorrect ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-400' : 'bg-rose-950 border border-rose-500/50 text-rose-400'}`}>
                {feedbackResult.isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <span className={`text-[11px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${feedbackResult.isCorrect ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'}`}>
                  {feedbackResult.isCorrect ? 'Correct Decision' : 'Security Alert'}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {feedbackResult.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {feedbackResult.message}
                </p>
              </div>
            </div>

            {/* Educational Breakdown */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Attack Technique: {currentSim.educational_debrief.summary}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentSim.educational_debrief.explanation}
                </p>
              </div>

              <div>
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Key Defensive Rules for Staff:
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {currentSim.educational_debrief.key_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Scenario Button */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleNextSimulation}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <span>Continue to Next Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
