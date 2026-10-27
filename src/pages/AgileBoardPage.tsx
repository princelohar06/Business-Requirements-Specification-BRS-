import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Kanban,
  MessageSquare,
  Milestone as MilestoneIcon,
  Plus,
  Send,
  Sparkles,
  Tag,
  User,
  X,
  Zap,
} from 'lucide-react';
import { agileApi, projectApi, taskApi } from '../services/api';
import { Epic, Milestone, Project, Sprint, Task, TaskComment, TaskTimeLog } from '../types';

export const AgileBoardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(undefined);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Task Drawer state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [timeLogs, setTimeLogs] = useState<TaskTimeLog[]>([]);
  const [logHours, setLogHours] = useState('');
  const [logDesc, setLogDesc] = useState('');

  // Create Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'HIGH',
    status: 'TODO',
    estimated_hours: 4.0,
    labels: 'frontend,core',
    project_id: 0,
    sprint_id: undefined as number | undefined,
  });

  const [showSprintModal, setShowSprintModal] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'planning',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, eRes, mRes] = await Promise.all([
        projectApi.getProjects(),
        agileApi.getSprints(selectedProjectId),
        agileApi.getEpics(selectedProjectId),
        agileApi.getMilestones(selectedProjectId),
      ]);
      setProjects(pRes.data);
      const prjId = selectedProjectId || (pRes.data.length > 0 ? pRes.data[0].id : undefined);
      if (!selectedProjectId && prjId) {
        setSelectedProjectId(prjId);
      }
      setSprints(sRes.data);
      setEpics(eRes.data);
      setMilestones(mRes.data);

      const tRes = await taskApi.getTasks({ projectId: prjId });
      setTasks(tRes.data);
    } catch (err) {
      console.error('Failed to load agile board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProjectId]);

  const handleStatusChange = async (taskId: number, newStatus: Task['status']) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskApi.updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchData(); // Rollback on failure
    }
  };

  const handleOpenTask = async (task: Task) => {
    setActiveTask(task);
    try {
      const [cRes, timeRes] = await Promise.all([
        taskApi.getComments(task.id),
        taskApi.getTimeLogs(task.id),
      ]);
      setComments(cRes.data);
      setTimeLogs(timeRes.data);
    } catch (err) {
      console.error('Failed to fetch task comments/timelogs:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !newComment.trim()) return;
    try {
      const { data } = await taskApi.addComment(activeTask.id, newComment);
      setComments((prev) => [...prev, data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !logHours) return;
    try {
      const { data } = await taskApi.logTime(activeTask.id, {
        hours_spent: Number(logHours),
        description: logDesc,
        logged_at: new Date().toISOString().split('T')[0],
      });
      setTimeLogs((prev) => [...prev, data]);
      setLogHours('');
      setLogDesc('');
    } catch (err) {
      console.error('Failed to log time:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      await taskApi.createTask({
        ...newTask,
        project_id: selectedProjectId,
        sprint_id: selectedSprintId,
      });
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'HIGH',
        status: 'TODO',
        estimated_hours: 4.0,
        labels: 'frontend,core',
        project_id: selectedProjectId,
        sprint_id: undefined,
      });
      const tRes = await taskApi.getTasks({ projectId: selectedProjectId });
      setTasks(tRes.data);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      await agileApi.createSprint({
        ...newSprint,
        project_id: selectedProjectId,
      });
      setShowSprintModal(false);
      const sRes = await agileApi.getSprints(selectedProjectId);
      setSprints(sRes.data);
    } catch (err) {
      console.error('Failed to create sprint:', err);
    }
  };

  const columns: { title: string; status: Task['status']; color: string }[] = [
    { title: 'To Do', status: 'TODO', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
    { title: 'In Progress', status: 'IN_PROGRESS', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
    { title: 'In Review', status: 'IN_REVIEW', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400' },
    { title: 'Done', status: 'DONE', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
    { title: 'Blocked', status: 'BLOCKED', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Agile & Sprint Boards
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Phase 2 • State Synchronized
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive Kanban workflow transitions, backlog planning, and sprint burndown tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSprintModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Plus className="h-3.5 w-3.5" /> New Sprint
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" /> Create Work Item
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Project:</span>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Sprint:</span>
            <select
              value={selectedSprintId || ''}
              onChange={(e) => setSelectedSprintId(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Tasks / Backlog</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Milestones preview badge */}
        <div className="flex items-center gap-2">
          {milestones.slice(0, 2).map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300">
              <MilestoneIcon className="h-3 w-3" />
              <span className="truncate max-w-xs">{m.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className="glass-panel flex flex-col rounded-2xl border border-slate-800/80 p-3 min-h-[500px]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${col.status === 'DONE' ? 'bg-emerald-500' : col.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                  {col.title}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-600">No items</div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleOpenTask(t)}
                      className="group cursor-pointer rounded-xl border border-slate-800/90 bg-slate-900/90 p-3.5 shadow-sm transition hover:border-slate-700 hover:bg-slate-900 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold text-blue-400">
                          {t.key || `TASK-${t.id}`}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            t.priority === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-400'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 mb-2 group-hover:text-white">
                        {t.title}
                      </h4>

                      {/* Labels */}
                      {t.labels && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {t.labels.split(',').map((l, i) => (
                            <span
                              key={i}
                              className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-400"
                            >
                              {l.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer & Quick Transition */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1 text-slate-400">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">
                            {t.assignee_name || 'Unassigned'}
                          </span>
                        </div>

                        {/* Status Select dropdown directly on card for fast testing! */}
                        <select
                          value={t.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as Task['status'])}
                          className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700 focus:outline-none focus:border-blue-500"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                          <option value="BLOCKED">Blocked</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Drawer */}
      {activeTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 p-6 shadow-2xl overflow-y-auto backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-blue-400">
              {activeTask.key || `TASK-${activeTask.id}`}
            </span>
            <button
              onClick={() => setActiveTask(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 mt-4">
            <div>
              <h2 className="text-base font-bold text-white mb-2">{activeTask.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {activeTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Status & Priority Controls */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <span className="text-slate-400 block mb-1">Status</span>
                <select
                  value={activeTask.status}
                  onChange={(e) => {
                    const s = e.target.value as Task['status'];
                    handleStatusChange(activeTask.id, s);
                    setActiveTask({ ...activeTask, status: s });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <span className="text-slate-400 block mb-1">Priority</span>
                <span className="font-semibold text-slate-200">{activeTask.priority}</span>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400" /> Log Time Worked
              </h4>
              <form onSubmit={handleLogTime} className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Hours"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="w-20 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Work summary..."
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Log
                </button>
              </form>

              {timeLogs.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {timeLogs.map((tl) => (
                    <div key={tl.id} className="flex justify-between text-[11px] text-slate-400 border-t border-slate-800/40 pt-1">
                      <span>{tl.user_name}: {tl.description || 'General progress'}</span>
                      <span className="font-semibold text-slate-300">{tl.hours_spent}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Stream */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" /> Activity & Discussion
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500">No comments on this item yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-200">{c.user_name}</span>
                        <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-3 text-white hover:bg-blue-500"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Kanban className="h-4 w-4 text-blue-400" /> New Work Item
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Webhook Signature Verification"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({ ...newTask, estimated_hours: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed acceptance criteria..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showSprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" /> Plan New Sprint
              </h3>
              <button onClick={() => setShowSprintModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSprint} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sprint Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 3 - Security & Multi-Tenant QA"
                  value={newSprint.name}
                  onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sprint Goal</label>
                <input
                  type="text"
                  placeholder="Key milestones to accomplish..."
                  value={newSprint.goal}
                  onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newSprint.start_date}
                    onChange={(e) => setNewSprint({ ...newSprint, start_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newSprint.end_date}
                    onChange={(e) => setNewSprint({ ...newSprint, end_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSprintModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
