import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { engineeringApi } from '../services/api';
import { BuildRun, CommitItem, PullRequest, ReleaseItem, Repository } from '../types';

export const EngineeringPage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [builds, setBuilds] = useState<BuildRun[]>([]);
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prs' | 'commits' | 'builds' | 'releases'>('prs');
  const [triggering, setTriggering] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repoRes, prRes, cRes, bRes, relRes] = await Promise.all([
        engineeringApi.getRepositories(),
        engineeringApi.getPullRequests(),
        engineeringApi.getCommits(),
        engineeringApi.getBuilds(),
        engineeringApi.getReleases(),
      ]);
      setRepositories(repoRes.data);
      setPullRequests(prRes.data);
      setCommits(cRes.data);
      setBuilds(bRes.data);
      setReleases(relRes.data);
    } catch (err) {
      console.error('Failed to load engineering data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerBuild = async (repoId: number) => {
    setTriggering(true);
    try {
      const { data } = await engineeringApi.triggerBuild(repoId);
      setBuilds((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Failed to trigger build:', err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Engineering & CI/CD Management
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 3 • Git & Pipeline Integrations
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected GitHub/GitLab repositories, pull requests, automated builds, and deployment releases
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Sync Repositories
        </button>
      </div>

      {/* Connected Repositories Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="glass-panel flex items-center justify-between rounded-2xl border border-slate-800/80 p-5"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{repo.full_name}</h3>
                  <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> Connected
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <GitBranch className="h-3 w-3" /> {repo.default_branch}
                  </span>
                  <span>• Provider: {repo.provider.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTriggerBuild(repo.id)}
              disabled={triggering}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Trigger Build
            </button>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'prs', label: `Pull Requests (${pullRequests.length})`, icon: GitPullRequest },
          { key: 'commits', label: `Commits (${commits.length})`, icon: GitCommit },
          { key: 'builds', label: `CI/CD Builds (${builds.length})`, icon: Play },
          { key: 'releases', label: `Releases (${releases.length})`, icon: Rocket },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'prs' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">PR #</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Branches</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pullRequests.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">#{pr.pr_number}</td>
                  <td className="py-3 px-4 font-semibold text-white">{pr.title}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {pr.source_branch} → {pr.target_branch}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{pr.author}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        pr.state === 'merged'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : pr.state === 'open'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pr.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/60">
          {commits.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {c.commit_hash}
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">{c.message}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {c.author} committed to <span className="font-mono text-slate-400">{c.branch}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(c.committed_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'builds' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/60">
          {builds.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Build #{b.build_number} on {b.branch}</p>
                  <p className="text-[11px] text-slate-500 font-mono">commit {b.commit_hash}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400 font-medium">{b.duration_seconds}s</span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase">
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {releases.map((rel) => (
            <div key={rel.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {rel.tag_name}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                  {rel.environment}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{rel.name}</h3>
              <p className="text-xs text-slate-400">{rel.changelog}</p>
              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/60">
                Released {new Date(rel.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
