import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  FolderKanban,
  GitPullRequest,
  HeartPulse,
  Kanban,
  Layers,
  Settings,
  ShieldAlert,
  Sparkles,
  TestTube2,
  Users2,
  Workflow,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuth();

  const navGroups: NavGroup[] = [
    {
      title: 'Work & Planning',
      items: [
        { name: 'Executive Intelligence', path: '/dashboard', icon: BarChart3, badge: 'Live' },
        { name: 'Projects & Workspaces', path: '/projects', icon: FolderKanban },
        { name: 'Agile & Kanban Boards', path: '/agile', icon: Kanban },
      ],
    },
    {
      title: 'Engineering & DevOps',
      items: [
        { name: 'Engineering & Repos', path: '/engineering', icon: Code2 },
        { name: 'Native QA & Defects', path: '/qa', icon: TestTube2 },
        { name: 'ITSM & Service Desk', path: '/itsm', icon: HeartPulse },
      ],
    },
    {
      title: 'Automation & AI',
      items: [
        { name: 'Workflow Engine', path: '/workflows', icon: Workflow },
        { name: 'Enterprise AI Copilot', path: '/ai', icon: Bot, highlight: true },
      ],
    },
    {
      title: 'Enterprise Operations',
      items: [
        { name: 'Operations & HR/Fin', path: '/operations', icon: Briefcase },
      ],
    },
    {
      title: 'Administration',
      items: [
        { name: 'Organization & RBAC', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-30 flex flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </h4>
            )}
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : item.highlight
                          ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${item.highlight ? 'text-cyan-400' : ''}`} />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-500/30">
                        {item.badge}
                      </span>
                    )}
                    {!collapsed && item.highlight && (
                      <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-slate-800/80 p-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden px-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">
              {user?.full_name || 'Enterprise'}
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-white mx-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
