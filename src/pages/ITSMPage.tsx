import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  GitPullRequest,
  HeartPulse,
  Plus,
  RefreshCw,
  Server,
  ShieldAlert,
  X,
} from 'lucide-react';
import { itsmApi } from '../services/api';
import { ChangeRequestItem, IncidentItem, KnowledgeArticle, ServiceItem } from '../types';

export const ITSMPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [changes, setChanges] = useState<ChangeRequestItem[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incidents' | 'services' | 'changes' | 'knowledge'>('incidents');

  // Create Incident Modal state
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'sev_2',
    priority: 'p2',
    service_id: undefined as number | undefined,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, incRes, cRes, kRes] = await Promise.all([
        itsmApi.getServices(),
        itsmApi.getIncidents(),
        itsmApi.getChanges(),
        itsmApi.getKnowledge(),
      ]);
      setServices(sRes.data);
      setIncidents(incRes.data);
      setChanges(cRes.data);
      setArticles(kRes.data);
      if (sRes.data.length > 0 && !newIncident.service_id) {
        setNewIncident((prev) => ({ ...prev, service_id: sRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load ITSM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await itsmApi.createIncident(newIncident);
      setShowIncidentModal(false);
      setNewIncident({
        title: '',
        description: '',
        severity: 'sev_2',
        priority: 'p2',
        service_id: services[0]?.id,
      });
      const res = await itsmApi.getIncidents();
      setIncidents(res.data);
    } catch (err) {
      console.error('Failed to create incident:', err);
    }
  };

  const handleIncidentStatus = async (id: number, newStatus: string) => {
    try {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus as any } : inc))
      );
      await itsmApi.updateIncident(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update incident status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ITSM & Service Desk Management
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 5 • SLA Monitoring
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Service catalog uptime, incident resolution lifecycles, SLA breach monitoring, and change control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIncidentModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500 transition"
          >
            <Plus className="h-4 w-4" /> Declare Incident
          </button>
        </div>
      </div>

      {/* Services Health Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div key={srv.id} className="glass-panel rounded-2xl border border-slate-800/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-400" /> {srv.name}
              </span>
              <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> {srv.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
              <span>Uptime: <strong className="text-slate-200">{srv.uptime_percentage}%</strong></span>
              <span className="uppercase font-mono text-[10px] text-slate-500">{srv.tier}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'incidents'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" /> Incidents ({incidents.length})
        </button>
        <button
          onClick={() => setActiveTab('changes')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'changes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <GitPullRequest className="h-4 w-4" /> Change Requests ({changes.length})
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'knowledge'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Knowledge Base ({articles.length})
        </button>
      </div>

      {/* Incidents Table */}
      {activeTab === 'incidents' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Incident #</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">SLA Breach</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">INC-{inc.incident_number}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{inc.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{inc.description}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{inc.service_name || 'Core'}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {inc.sla_breached ? (
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                        BREACHED
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        COMPLIANT
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={inc.status}
                      onChange={(e) => handleIncidentStatus(inc.id, e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="mitigated">Mitigated</option>
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

      {/* Changes Table */}
      {activeTab === 'changes' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/60">
          {changes.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-400">CHG-{c.change_number}</span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                    Risk: {c.risk_level}
                  </span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                    {c.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white">{c.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Knowledge Articles */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => (
            <div key={art.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                {art.category}
              </span>
              <h3 className="text-sm font-bold text-white">{art.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                {art.content}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/40">
                <span>By {art.author_name || 'Admin'}</span>
                <span>{art.views_count} views</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" /> Declare ITSM Incident
              </h3>
              <button onClick={() => setShowIncidentModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WebSocket connection latency degradation"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Impacted Service</label>
                  <select
                    value={newIncident.service_id}
                    onChange={(e) => setNewIncident({ ...newIncident, service_id: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="sev_1">Sev 1 - Critical Outage</option>
                    <option value="sev_2">Sev 2 - Major Degraded</option>
                    <option value="sev_3">Sev 3 - Minor Issue</option>
                    <option value="sev_4">Sev 4 - Cosmetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description & Impact</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Observed symptoms, error logs, and customer impact..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-500/20"
                >
                  Broadcast Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
