import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  X,
  Layers,
} from 'lucide-react';
import { orgApi, projectApi } from '../services/api';
import { Project, Workspace } from '../types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Project Form state
  const [newProject, setNewProject] = useState({
    name: '',
    key: '',
    description: '',
    priority: 'high',
    workspace_id: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, wsRes] = await Promise.all([
        projectApi.getProjects(selectedWorkspace),
        orgApi.getWorkspaces(),
      ]);
      setProjects(projRes.data);
      setWorkspaces(wsRes.data);
      if (wsRes.data.length > 0 && newProject.workspace_id === 0) {
        setNewProject((prev) => ({ ...prev, workspace_id: wsRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load projects/workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWorkspace]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectApi.createProject(newProject);
      setShowModal(false);
      setNewProject({
        name: '',
        key: '',
        description: '',
        priority: 'high',
        workspace_id: workspaces[0]?.id || 1,
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Workspaces & Projects
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 1 • Core Work Items
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-tenant enterprise projects, delivery status, and workspace scoping
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter projects by title or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedWorkspace || ''}
            onChange={(e) => setSelectedWorkspace(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => {
          const progress = p.tasks_count > 0 ? Math.round((p.completed_tasks_count / p.tasks_count) * 100) : 0;
          return (
            <div
              key={p.id}
              className="glass-panel flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5 transition hover:border-slate-700 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-bold text-blue-400 border border-blue-500/20">
                    {p.key}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      p.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{p.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{p.description}</p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800/60">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-semibold text-slate-200">
                      {p.completed_tasks_count}/{p.tasks_count} tasks ({progress}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 capitalize">
                    Priority: <span className="font-semibold text-slate-300">{p.priority}</span>
                  </span>
                  <button
                    onClick={() => navigate('/agile')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    Open Agile Board <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-400" /> Create Enterprise Project
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Microservices Platform"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Project Key (Prefix)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NXP"
                    value={newProject.key}
                    onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Workspace</label>
                  <select
                    value={newProject.workspace_id}
                    onChange={(e) => setNewProject({ ...newProject, workspace_id: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Goals, deliverables, and scope for this enterprise initiative..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
