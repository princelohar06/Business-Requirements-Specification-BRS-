import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Workflow,
  XCircle,
} from 'lucide-react';
import { workflowApi } from '../services/api';
import { WorkflowDefinition, WorkflowExecution } from '../types';

export const WorkflowPage: React.FC = () => {
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [defRes, execRes] = await Promise.all([
        workflowApi.getDefinitions(),
        workflowApi.getExecutions(),
      ]);
      setDefinitions(defRes.data);
      setExecutions(execRes.data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartWorkflow = async (workflowId: number) => {
    setStartingId(workflowId);
    try {
      const { data } = await workflowApi.startExecution(workflowId, {
        triggered_via: 'web_portal',
        timestamp: new Date().toISOString(),
      });
      setExecutions((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Failed to start workflow:', err);
    } finally {
      setStartingId(null);
    }
  };

  const handleDecide = async (approvalId: number, status: 'approved' | 'rejected') => {
    try {
      await workflowApi.decideApproval(approvalId, status, `Decision recorded via Work OS approval engine`);
      fetchData();
    } catch (err) {
      console.error('Failed to record approval decision:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Visual Workflow Automation
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 6 • Multi-Level Approvals
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Departmental workflow definitions, conditional triggers, multi-tier approvals, and execution history
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh State
        </button>
      </div>

      {/* Visual Workflow Definitions */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Active Workflow Definitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {definitions.map((wf) => (
            <div key={wf.id} className="glass-panel flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                    {wf.department}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">Trigger: {wf.trigger_type}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{wf.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{wf.description}</p>
              </div>

              {/* Visual Pipeline Steps */}
              <div className="flex flex-wrap items-center gap-2 py-2">
                {wf.steps?.map((st, i) => (
                  <React.Fragment key={st.id || i}>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600/30 text-[9px] font-bold text-blue-400">
                        {st.step_order}
                      </span>
                      <span className="truncate max-w-[120px]">{st.title}</span>
                    </div>
                    {i < wf.steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {wf.steps?.length || 0} configured automated stages
                </span>
                <button
                  onClick={() => handleStartWorkflow(wf.id)}
                  disabled={startingId === wf.id}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {startingId === wf.id ? 'Starting...' : 'Trigger Execution'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution & Approval History */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Executions & Live Approvals</h2>
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/60">
          {executions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No workflow executions recorded yet.</div>
          ) : (
            executions.map((ex) => (
              <div key={ex.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-400">EXEC-#{ex.id}</span>
                    <span className="text-xs font-bold text-white">{ex.workflow_name || 'Enterprise Workflow'}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        ex.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ex.status === 'running'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Initiated by {ex.initiated_by_name || 'System User'} • Stage {ex.current_step_order}
                  </p>
                </div>

                {/* If execution has pending approvals, show Action Buttons! */}
                <div className="flex items-center gap-2">
                  {ex.approvals?.map((app) =>
                    app.status === 'pending' ? (
                      <div key={app.id} className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-semibold mr-1">Awaiting Signoff:</span>
                        <button
                          onClick={() => handleDecide(app.id, 'approved')}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/40 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleDecide(app.id, 'rejected')}
                          className="flex items-center gap-1 rounded-xl bg-rose-600/20 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-600/40 transition"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span key={app.id} className="text-[11px] text-slate-500 italic">
                        {app.approver_name}: {app.status.toUpperCase()}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
