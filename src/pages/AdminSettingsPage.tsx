import React, { useEffect, useState } from 'react';
import {
  Building,
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { orgApi, userApi } from '../services/api';
import { AuditLog, Department, Organization, Role, Team, UserProfile } from '../types';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'org' | 'departments' | 'teams' | 'users' | 'roles' | 'audit'>('org');
  const [org, setOrg] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New Department modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });

  // New Team modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', department_id: undefined as number | undefined });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, dRes, tRes, uRes, rRes, aRes] = await Promise.all([
        orgApi.getOrg(),
        orgApi.getDepartments(),
        orgApi.getTeams(),
        userApi.getUsers(),
        userApi.getRoles(),
        userApi.getAuditLogs(50),
      ]);
      setOrg(oRes.data);
      setDepartments(dRes.data);
      setTeams(tRes.data);
      setUsers(uRes.data);
      setRoles(rRes.data);
      setAuditLogs(aRes.data);
    } catch (err) {
      console.error('Failed to load administration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orgApi.createDepartment(newDept);
      setShowDeptModal(false);
      setNewDept({ name: '', code: '', description: '' });
      const res = await orgApi.getDepartments();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to create department:', err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orgApi.createTeam(newTeam);
      setShowTeamModal(false);
      setNewTeam({ name: '', description: '', department_id: undefined });
      const res = await orgApi.getTeams();
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to create team:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Organization & Administration
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Multi-Tenant Governance
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization profile, departments, teams, user accounts, RBAC permissions, and security audit logs
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Directory
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: 'org', label: 'Organization Profile', icon: Building },
          { key: 'departments', label: `Departments (${departments.length})`, icon: Building },
          { key: 'teams', label: `Teams (${teams.length})`, icon: Users },
          { key: 'users', label: `Users (${users.length})`, icon: User },
          { key: 'roles', label: `RBAC Roles (${roles.length})`, icon: ShieldCheck },
          { key: 'audit', label: `Security Audit Logs (${auditLogs.length})`, icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
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

      {/* Tab: Organization */}
      {activeTab === 'org' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-white mb-4">Enterprise Organization Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block mb-1">Organization Name</span>
              <span className="text-sm font-bold text-white">{org?.name}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block mb-1">Tenant Slug</span>
              <span className="text-sm font-mono font-bold text-blue-400">{org?.slug}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block mb-1">Corporate Domain</span>
              <span className="text-sm font-semibold text-slate-200">{org?.domain || 'acme.com'}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-slate-400 block mb-1">Multi-Tenant Status</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Isolated & Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Enterprise Departments</h3>
            <button
              onClick={() => setShowDeptModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Add Department
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{d.code || 'DEPT'}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{d.name}</h4>
                <p className="text-xs text-slate-400">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Teams */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Teams & Squads</h3>
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Create Team
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((t) => (
              <div key={t.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="text-xs text-slate-400">{t.description}</p>
                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/60">
                  {t.members_count} team members
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Authority Rank</th>
                <th className="py-3 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{u.full_name}</p>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                      {u.role || 'Member'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-300">Rank {u.role_rank}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      Active & Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Roles */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{r.name}</span>
                <span className="font-mono text-xs font-bold text-blue-400">Rank {r.rank}</span>
              </div>
              <p className="text-xs text-slate-400">{r.description}</p>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Granted Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {r.permissions?.slice(0, 8).map((p) => (
                    <span key={p.id} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {p.name}
                    </span>
                  ))}
                  {r.permissions?.length > 8 && (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5">+{r.permissions.length - 8} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-bold text-blue-400">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300 capitalize">{log.resource_type}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-xs">{log.details || 'System operation'}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals for Dept and Team */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Operations"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Code (3-4 chars)</label>
                <input
                  type="text"
                  required
                  placeholder="OPS"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Department scope..."
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDeptModal(false)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Team</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRE & Infrastructure Squad"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={newTeam.department_id}
                  onChange={(e) => setNewTeam({ ...newTeam, department_id: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                >
                  <option value="">None / Cross-Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTeamModal(false)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
