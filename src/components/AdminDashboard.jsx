import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, ShieldCheck, ShieldAlert, Users, TrendingUp, 
  Download, Search, Filter, RefreshCw, AlertTriangle, FileSpreadsheet,
  CheckCircle2, XCircle, Building, Sparkles, Printer, FileText,
  UserCheck, UserX, Trash2, Edit2, History, ChevronRight, Key, Shield
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

export default function AdminDashboard({ user }) {
  const [adminTab, setAdminTab] = useState('metrics'); // 'metrics' | 'users'
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  
  // User Management Filters & State
  const [userSearch, setUserSearch] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  
  // Selected User for History / Audit Modal
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const reportRef = useRef(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [analyticsData, usersData] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getAllUsers()
      ]);
      setAnalytics(analyticsData);
      setUsersList(usersData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersOnly = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await apiService.getAllUsers();
      setUsersList(usersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Toggle user role between Cyber Team (admin) and Staff
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'staff' : 'admin';
    try {
      await apiService.updateUser(targetUser.id, { role: newRole });
      setActionSuccessMsg(`Updated ${targetUser.name}'s role to ${newRole === 'admin' ? 'Cyber Team (Admin)' : 'Standard Staff'}.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      loadUsersOnly();
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  // Update user department
  const handleChangeDept = async (targetUser, newDept) => {
    try {
      await apiService.updateUser(targetUser.id, { department: newDept });
      setActionSuccessMsg(`Reassigned ${targetUser.name} to ${newDept}.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      loadUsersOnly();
    } catch (err) {
      alert(`Failed to update department: ${err.message}`);
    }
  };

  // Decommission/Delete account
  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to delete ${targetUser.name}'s account (${targetUser.email})? All associated quiz telemetry will be removed.`)) {
      return;
    }
    try {
      await apiService.deleteUser(targetUser.id);
      setActionSuccessMsg(`Account for ${targetUser.name} has been removed.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      loadAllData();
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  // View individual user training history
  const handleViewHistory = async (targetUser) => {
    setSelectedUserHistory(targetUser);
    setLoadingHistory(true);
    try {
      const history = await apiService.getUserHistory(targetUser.id);
      setHistoryRecords(history);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#070b14'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SecureMind-Security-Maturity-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF report:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Connecting to live database & aggregating telemetry...</p>
      </div>
    );
  }

  // Filter department benchmarks
  const deptData = (analytics?.department_benchmarks || []).map((d) => ({
    name: d.department,
    score: d.average_score,
    staff: d.total_staff,
    completed: d.completed_count,
    risk: d.risk_level
  }));

  // Category Radar data
  const categoryData = Object.entries(analytics?.category_weaknesses || {}).map(([cat, score]) => ({
    category: cat,
    score: score,
    benchmark: 80
  }));

  // Filtered users for Access Control Table
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesDept = userDeptFilter === 'All' || u.department === userDeptFilter;
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesDept && matchesRole;
  });

  const smi = analytics?.security_maturity_index || 0;
  const isHighRisk = smi < 70;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Banner with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1527] to-slate-900 border border-cyan-500/30">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Cyber Security Administration Portal (Live DB)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Security Maturity Oversight & Access Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Executive telemetry, departmental risk mapping, and enterprise RBAC user account management.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => setAdminTab('metrics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminTab === 'metrics'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SMI Telemetry</span>
            </button>
            <button
              onClick={() => setAdminTab('users')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminTab === 'users'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Accounts ({usersList.length})</span>
            </button>
          </div>

          <button
            onClick={loadAllData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Refresh Database Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{exportingPdf ? 'Exporting...' : 'Export Audit PDF'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: SECURITY MATURITY INDEX & DEPARTMENT VULNERABILITY HEATMAP       */}
      {/* ========================================================================= */}
      {adminTab === 'metrics' && (
        <div ref={reportRef} className="space-y-6">
          
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* SMI Gauge */}
            <div className="p-5 rounded-2xl bg-[#0e1626] border border-cyan-500/40 shadow-xl relative overflow-hidden">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Security Maturity Index (SMI)
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className={`text-3xl sm:text-4xl font-black font-mono ${isHighRisk ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {smi}%
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isHighRisk ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                  {isHighRisk ? 'Elevated Risk' : 'Optimal Posture'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Weighted enterprise accuracy across all live DB scenario assessments.
              </p>
            </div>

            {/* Compliance Pass Rate */}
            <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Compliance Pass Rate
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {analytics?.pass_rate || 0}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Staff scoring &gt;= 70% on mandatory cybersecurity training modules.
              </p>
            </div>

            {/* Total Enrolled Staff */}
            <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Enrolled Accounts in Database
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {analytics?.total_employees || usersList.length}
                </span>
                <span className="text-xs text-slate-400">
                  ({analytics?.total_trainings_completed || 0} Attempts Logged)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Managed under two-tier Role-Based Access Control.
              </p>
            </div>

            {/* Vulnerable Departments */}
            <div className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                High-Risk Departments
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(analytics?.high_risk_departments || []).length > 0 ? (
                  analytics.high_risk_departments.map((dept) => (
                    <span key={dept} className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold">
                      ⚠️ {dept}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">
                    All departments meeting compliance
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Departments requiring prioritized phishing drills.
              </p>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Department Performance Bar Chart */}
            <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Departmental Security Score Benchmark
                  </h3>
                  <p className="text-xs text-slate-400">Average simulation scores by department (%)</p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Target: 80%
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Bar dataKey="score" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threat Category Radar Chart */}
            <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Threat Domain Vulnerability Radar
                </h3>
                <p className="text-xs text-slate-400">Organizational competence across attack vectors</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={categoryData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis stroke="#64748b" domain={[0, 100]} fontSize={9} />
                    <Radar name="Org Score" dataKey="score" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.4} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Real-Time Telemetry Audit Feed */}
          <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Recent Training Telemetry Feed (Live DB)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {(analytics?.recent_completions || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No training completions recorded in database yet.
                      </td>
                    </tr>
                  ) : (
                    analytics.recent_completions.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-semibold text-white">{comp.user_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {comp.department}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{comp.score} / {comp.total}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span className={comp.percentage >= 70 ? 'text-emerald-400' : 'text-rose-400'}>
                            {comp.percentage}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            comp.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {comp.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{comp.passed ? 'Passed' : 'Failed'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{comp.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STAFF & ACCESS CONTROL MANAGEMENT (Two-Tier RBAC Administration)  */}
      {/* ========================================================================= */}
      {adminTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl space-y-5 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Employee Accounts & RBAC Directory</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit staff members, promote to Cyber Security Team, update departments, or decommission accounts.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <select
                value={userDeptFilter}
                onChange={(e) => setUserDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="admin">Cyber Team (Admin)</option>
                <option value="staff">Standard Staff</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Role Tier</th>
                  <th className="py-3 px-4 font-semibold">Trainings</th>
                  <th className="py-3 px-4 font-semibold">Avg Score</th>
                  <th className="py-3 px-4 font-semibold">Pass Rate</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No employee accounts match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                      </td>

                      {/* Department Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={u.department}
                          onChange={(e) => handleChangeDept(u, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </td>

                      {/* Role Badge & Promotion Switcher */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u)}
                          title="Click to toggle between Cyber Team and Staff role"
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            u.role === 'admin'
                              ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 hover:bg-purple-900/60'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300'
                          }`}
                        >
                          {u.role === 'admin' ? <Key className="w-3 h-3 text-purple-400" /> : <Users className="w-3 h-3" />}
                          <span>{u.role === 'admin' ? '⚡ Cyber Admin' : '👤 Staff'}</span>
                        </button>
                      </td>

                      {/* Training Count */}
                      <td className="py-3 px-4 font-mono">
                        {u.completed_trainings}
                      </td>

                      {/* Average Score */}
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={u.average_score >= 70 ? 'text-emerald-400' : 'text-slate-300'}>
                          {u.average_score}%
                        </span>
                      </td>

                      {/* Pass Rate */}
                      <td className="py-3 px-4 font-mono">
                        <span className={u.pass_rate >= 70 ? 'text-emerald-400' : 'text-rose-400'}>
                          {u.pass_rate}%
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewHistory(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all"
                            title="Audit individual training history"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-all"
                            title="Decommission account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Individual Employee Training Audit History Modal */}
      {selectedUserHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#0e1626] to-[#070b14] border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/80 space-y-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Employee Telemetry Audit</span>
                <h3 className="text-lg font-bold text-white">{selectedUserHistory.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedUserHistory.email} | {selectedUserHistory.department}</p>
              </div>
              <button
                onClick={() => setSelectedUserHistory(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-slate-400 text-xs">Querying database attempt history...</div>
            ) : historyRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No simulation or quiz attempts recorded for this employee yet.</div>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">Assessment Attempt #{rec.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Score: {rec.score} / {rec.total_questions} ({rec.percentage}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}>
                        {rec.passed ? 'Passed' : 'Failed'}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {new Date(rec.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
