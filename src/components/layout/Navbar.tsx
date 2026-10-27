import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers,
  LogOut,
  Moon,
  Search,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/api';
import { NotificationItem } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationApi.getNotifications(false);
      setNotifications(data.slice(0, 8));
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
      {/* Brand & Organization Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-lg shadow-blue-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              WORK OS <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">ENTERPRISE</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {user?.organization_name || 'Acme Corporation'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, incidents, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions: Notifications, Live Status, Profile */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-400">MySQL Connected</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm shadow-blue-500/40">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 rounded-xl p-2.5 transition-colors ${
                        item.is_read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-slate-200">{item.title}</p>
                        <p className="text-slate-400 mt-0.5 line-clamp-2">{item.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/70 py-1.5 pl-2 pr-3 transition-colors hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name || 'Enterprise User'}
              </span>
              <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                {user?.role || 'Administrator'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] font-medium text-blue-400">
                    Rank {user?.role_rank || 100} • Multi-tenant isolation active
                  </span>
                </div>
              </div>

              <div className="mt-1 space-y-0.5">
                <a
                  href="/settings"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" /> Organization Profile
                </a>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
