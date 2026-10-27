import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  BarChart2,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  FolderKanban,
  HeartPulse,
  Kanban,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TestTube2,
  TrendingUp,
  Workflow,
} from 'lucide-react';
import { intelligenceApi, projectApi } from '../services/api';
import { ExecutivePortfolioSummary, DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<ExecutivePortfolioSummary | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, statsRes] = await Promise.all([
        intelligenceApi.getPortfolioSummary(),
        projectApi.getStats(),
      ]);
      setSummary(sumRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Intelligence & Portfolio
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 8 • All Modules Synchronized
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cross-project KPIs, velocity forecasts, defect trends, and SLA metrics
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {summary?.kpis?.map((kpi, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl border border-slate-800/80 p-4 transition hover:border-slate-700/80 hover:shadow-lg"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium truncate">{kpi.label}</span>
              <Activity className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">{kpi.value}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px]">
              <span
                className={`font-semibold ${
                  kpi.status === 'positive'
                    ? 'text-emerald-400'
                    : kpi.status === 'warning'
                    ? 'text-amber-400'
                    : kpi.status === 'critical'
                    ? 'text-rose-400'
                    : 'text-blue-400'
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Velocity & Commitment Chart */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Kanban className="h-4 w-4 text-blue-400" /> Sprint Velocity & Story Points
              </h3>
              <p className="text-[11px] text-slate-400">Committed points vs actual completed per sprint</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.velocity_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sprint" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="committed" name="Committed Pts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Pts" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Trends & Resolution Chart */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TestTube2 className="h-4 w-4 text-indigo-400" /> Defect Discovery vs Resolution
              </h3>
              <p className="text-[11px] text-slate-400">Monthly QA defect metrics and backlog burnoff</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.defect_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDiscovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="discovered" name="Discovered" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDiscovered)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#3b82f6" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Module Quick Hub */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6">
        <h3 className="text-sm font-bold text-white mb-3">Enterprise Operations Hub</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { title: 'Agile Boards', desc: 'Sprints & Kanban', icon: Kanban, link: '/agile', color: 'from-blue-600 to-indigo-600' },
            { title: 'Git & Builds', desc: 'CI/CD & Releases', icon: Code2, link: '/engineering', color: 'from-cyan-600 to-blue-600' },
            { title: 'Native QA', desc: 'Suites & Defects', icon: TestTube2, link: '/qa', color: 'from-purple-600 to-pink-600' },
            { title: 'ITSM Incidents', desc: 'SLA Desk & Ops', icon: HeartPulse, link: '/itsm', color: 'from-emerald-600 to-teal-600' },
            { title: 'Workflows', desc: 'Visual Approvals', icon: Workflow, link: '/workflows', color: 'from-amber-600 to-orange-600' },
            { title: 'AI Copilot', desc: 'Command Center', icon: Bot, link: '/ai', color: 'from-violet-600 to-indigo-600' },
          ].map((hub, idx) => {
            const Icon = hub.icon;
            return (
              <a
                key={idx}
                href={hub.link}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center transition hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${hub.color} text-white shadow-md mb-2 group-hover:scale-105 transition`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-200">{hub.title}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{hub.desc}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
