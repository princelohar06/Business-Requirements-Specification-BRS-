import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  History,
  Layers,
  ListPlus,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Zap,
} from 'lucide-react';
import { aiApi, taskApi, projectApi } from '../services/api';
import { AICommandResponse, AIUsageLog, Project } from '../types';

export const AICopilotPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [action, setAction] = useState<string>('generate_tasks');
  const [result, setResult] = useState<AICommandResponse | null>(null);
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [createdFeedback, setCreatedFeedback] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const [logRes, pRes] = await Promise.all([
        aiApi.getLogs(),
        projectApi.getProjects(),
      ]);
      setLogs(logRes.data);
      setProjects(pRes.data);
      if (pRes.data.length > 0) {
        setSelectedProjectId(pRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load AI logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExecute = async (overridePrompt?: string, overrideAction?: string) => {
    const act = overrideAction || action;
    const pmt = overridePrompt !== undefined ? overridePrompt : prompt;
    if (!pmt.trim() && act === 'generate_tasks') return;

    setLoading(true);
    setCreatedFeedback(null);
    try {
      const { data } = await aiApi.executeCommand(act, pmt);
      setResult(data);
      fetchLogs();
    } catch (err) {
      console.error('AI command error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (task: any) => {
    if (!selectedProjectId) return;
    try {
      await taskApi.createTask({
        project_id: selectedProjectId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimated_hours: task.estimated_hours,
        labels: task.labels,
        status: 'TODO',
      });
      setCreatedFeedback(`Task "${task.title}" successfully created and saved to MySQL!`);
      setTimeout(() => setCreatedFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to create task from AI suggestion:', err);
    }
  };

  const samplePrompts = [
    { label: 'SAML 2.0 Enterprise SSO', action: 'generate_tasks', prompt: 'Implement SAML 2.0 single sign-on with Azure Active Directory and Okta SCIM provisioning' },
    { label: 'Audit Log Export API', action: 'generate_tasks', prompt: 'Build a compliant SIEM-compatible audit log export service with SHA-256 integrity verification' },
    { label: 'Scan Delivery Risks', action: 'analyze_risks', prompt: 'Perform risk assessment across active sprint work items and dependencies' },
    { label: 'Generate Test Plan', action: 'generate_tests', prompt: 'Multi-tenant database query isolation and JWT session revocation tests' },
    { label: 'Executive Summary', action: 'project_summary', prompt: 'Generate executive summary of active projects delivery velocity' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Enterprise AI Operating Layer
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              Phase 7 • Tenant-Isolated Copilot
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Natural-language work breakdown, proactive risk identification, and test case generation scoped strictly to your organization
          </p>
        </div>
      </div>

      {/* Main Command Input Box */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'generate_tasks', label: 'Generate Tasks', icon: ListPlus },
            { id: 'analyze_risks', label: 'Scan Delivery Risks', icon: AlertTriangle },
            { id: 'generate_tests', label: 'Synthesize QA Tests', icon: TestTube2 },
            { id: 'project_summary', label: 'Executive Summary', icon: Sparkles },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setAction(mode.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  action === mode.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {mode.label}
              </button>
            );
          })}
        </div>

        {/* Prompt Input */}
        <div className="relative">
          <textarea
            rows={3}
            placeholder={
              action === 'generate_tasks'
                ? 'Describe the enterprise feature or technical requirement to generate work items...'
                : action === 'generate_tests'
                ? 'Specify the functionality or endpoint to synthesize a comprehensive QA suite for...'
                : 'Click Execute to run this analysis across your organization records...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-xs text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={() => handleExecute()}
            disabled={loading}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
          >
            {loading ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Processing...' : 'Run Copilot'}
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
            <Zap className="h-3 w-3 text-cyan-400" /> Examples:
          </span>
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(s.prompt);
                setAction(s.action);
                handleExecute(s.prompt, s.action);
              }}
              className="rounded-lg border border-slate-800/80 bg-slate-900/40 px-2.5 py-1 text-[11px] text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {createdFeedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> {createdFeedback}
        </div>
      )}

      {/* AI Output Card */}
      {result && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white capitalize">{result.action.replace('_', ' ')} Result</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Tokens: {result.tokens_consumed} • Tenant Scoped
            </span>
          </div>

          <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
            {result.summary}
          </p>

          {/* Suggested Tasks */}
          {result.suggested_tasks && result.suggested_tasks.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">Suggested Work Items</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Target Project:</span>
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.key} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.suggested_tasks.map((task, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase">
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-500">{task.estimated_hours}h est.</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{task.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    </div>

                    <button
                      onClick={() => handleAcceptTask(task)}
                      className="w-full flex items-center justify-center gap-1 rounded-lg bg-blue-600/20 border border-blue-500/30 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> Accept to Project
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Identified Risks */}
          {result.identified_risks && result.identified_risks.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white">Identified Delivery Risks & Mitigations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.identified_risks.map((risk, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{risk.category}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        risk.impact === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {risk.impact} impact
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white">{risk.risk}</p>
                    <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-2">
                      <strong className="text-cyan-400 font-medium">Recommendation:</strong> {risk.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tests */}
          {result.suggested_tests && result.suggested_tests.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-white">Synthesized QA Scenarios</h4>
              <div className="space-y-1.5">
                {result.suggested_tests.map((test, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit History of AI Actions */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" /> AI Usage Audit Trail
        </h3>
        <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white capitalize mr-2">{log.capability.replace('_', ' ')}</span>
                <span className="text-slate-400 truncate inline-block max-w-sm align-bottom">{log.prompt}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span>{log.tokens_used} tokens</span>
                <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
