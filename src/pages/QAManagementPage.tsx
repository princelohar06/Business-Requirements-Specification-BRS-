import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Plus,
  RefreshCw,
  TestTube2,
  X,
  XCircle,
} from 'lucide-react';
import { projectApi, qaApi } from '../services/api';
import { DefectItem, Project, TestCase, TestSuite } from '../types';

export const QAManagementPage: React.FC = () => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cases' | 'defects' | 'suites'>('cases');

  // Create Defect Modal state
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [newDefect, setNewDefect] = useState({
    title: '',
    description: '',
    severity: 'high',
    priority: 'high',
    project_id: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, dRes, pRes] = await Promise.all([
        qaApi.getSuites(),
        qaApi.getCases(),
        qaApi.getDefects(),
        projectApi.getProjects(),
      ]);
      setSuites(sRes.data);
      setCases(cRes.data);
      setDefects(dRes.data);
      setProjects(pRes.data);
      if (pRes.data.length > 0 && newDefect.project_id === 0) {
        setNewDefect((prev) => ({ ...prev, project_id: pRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load QA data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordExecution = async (caseId: number, status: 'pass' | 'fail' | 'blocked') => {
    try {
      await qaApi.recordExecution({
        test_case_id: caseId,
        status,
        notes: `Executed via Enterprise QA runner interface (${status.toUpperCase()})`,
      });
      // Optimistic update
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, last_status: status } : c))
      );
    } catch (err) {
      console.error('Failed to record execution:', err);
    }
  };

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await qaApi.createDefect(newDefect);
      setShowDefectModal(false);
      setNewDefect({
        title: '',
        description: '',
        severity: 'high',
        priority: 'high',
        project_id: projects[0]?.id || 1,
      });
      const dRes = await qaApi.getDefects();
      setDefects(dRes.data);
    } catch (err) {
      console.error('Failed to create defect:', err);
    }
  };

  const handleDefectStatusChange = async (defectId: number, newStatus: string) => {
    try {
      setDefects((prev) =>
        prev.map((d) => (d.id === defectId ? { ...d, status: newStatus as any } : d))
      );
      await qaApi.updateDefect(defectId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update defect status:', err);
    }
  };

  const passCount = cases.filter((c) => c.last_status === 'pass').length;
  const passRate = cases.length > 0 ? Math.round((passCount / cases.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Native QA & Test Management
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 4 • Traceability & Defects
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test repositories, step-by-step executions, pass/fail verification, and defect lifecycles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDefectModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500 transition"
          >
            <Plus className="h-4 w-4" /> Log Defect
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border border-slate-800/80 p-4">
          <span className="text-xs text-slate-400">QA Pass Rate</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{passRate}%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {passCount} of {cases.length} cases passing
          </span>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800/80 p-4">
          <span className="text-xs text-slate-400">Active Test Cases</span>
          <div className="text-2xl font-bold text-white mt-1">{cases.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across {suites.length} suites</span>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800/80 p-4">
          <span className="text-xs text-slate-400">Open Defects</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {defects.filter((d) => d.status !== 'resolved' && d.status !== 'closed').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tracking resolution in MySQL</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'cases'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <TestTube2 className="h-4 w-4" /> Test Cases & Run ({cases.length})
        </button>
        <button
          onClick={() => setActiveTab('defects')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'defects'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Bug className="h-4 w-4" /> Defects & Bugs ({defects.length})
        </button>
        <button
          onClick={() => setActiveTab('suites')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'suites'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          Test Suites ({suites.length})
        </button>
      </div>

      {/* Cases View with Runner Buttons */}
      {activeTab === 'cases' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Expected Result</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Execute Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">TC-{c.test_number}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{c.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-400 line-clamp-1">{c.expected_result}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        c.last_status === 'pass'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.last_status === 'fail'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.last_status || 'not run'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRecordExecution(c.id, 'pass')}
                        className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/40 transition"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => handleRecordExecution(c.id, 'fail')}
                        className="rounded-lg bg-rose-600/20 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-600/40 transition"
                      >
                        Fail
                      </button>
                      <button
                        onClick={() => handleRecordExecution(c.id, 'blocked')}
                        className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-700 transition"
                      >
                        Block
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Defects View */}
      {activeTab === 'defects' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Defect #</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Status Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {defects.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">DEF-{d.defect_number}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{d.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{d.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                      {d.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{d.assignee_name || 'Unassigned'}</td>
                  <td className="py-3 px-4">
                    <select
                      value={d.status}
                      onChange={(e) => handleDefectStatusChange(d.id, e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_investigation">In Investigation</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suites View */}
      {activeTab === 'suites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suites.map((s) => (
            <div key={s.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">
                  {s.category}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {s.cases_count} cases
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{s.name}</h3>
              <p className="text-xs text-slate-400">{s.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Log Defect Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bug className="h-4 w-4 text-rose-400" /> Log QA Defect
              </h3>
              <button onClick={() => setShowDefectModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDefect} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Defect Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Session revocation fails under simultaneous refresh"
                  value={newDefect.title}
                  onChange={(e) => setNewDefect({ ...newDefect, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                  <select
                    value={newDefect.severity}
                    onChange={(e) => setNewDefect({ ...newDefect, severity: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Project</label>
                  <select
                    value={newDefect.project_id}
                    onChange={(e) => setNewDefect({ ...newDefect, project_id: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description & Reproduction</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Steps to reproduce, expected vs observed behavior..."
                  value={newDefect.description}
                  onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDefectModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-500/20"
                >
                  Log Defect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
