import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { NotificationItem, ActiveTab } from '../../types';
import { User } from 'firebase/auth';

interface TopNavbarProps {
  isSidebarCollapsed: boolean;
  onOpenQuickAction: (action: 'patient' | 'appointment' | 'admission' | 'bill') => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  // Google Auth & Sheets Cloud Database Props
  googleUser: User | null;
  isGoogleSheetsConnected: boolean;
  spreadsheetUrl: string;
  isSyncing: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onSyncGoogleSheets: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  isSidebarCollapsed,
  onOpenQuickAction,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsRead,
  globalSearchQuery,
  setGlobalSearchQuery,
  setActiveTab,
  googleUser,
  isGoogleSheetsConnected,
  spreadsheetUrl,
  isSyncing,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncGoogleSheets
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-6 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search Bar Zone */}
      <div className="flex items-center gap-3 w-80 max-w-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search hospital records..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all duration-150"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls Zone */}
      <div className="flex items-center gap-3">
        {/* Google Sheets Connection Pill / Sync */}
        {isGoogleSheetsConnected && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-800">Google Sheets Live Sync</span>
            <button
              onClick={onSyncGoogleSheets}
              disabled={isSyncing}
              className="p-1 text-emerald-700 hover:text-emerald-900 rounded transition-colors"
              title="Sync with Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-emerald-700 hover:text-emerald-900 rounded transition-colors"
                title="Open Spreadsheet in Google Sheets"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Live Date/Time */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          <span className="tabular-nums">{currentDateTime || 'Oct 4, 2026'}</span>
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQuickActions(!showQuickActions);
              setShowNotifications(false);
              setShowUserDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Entry</span>
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Registration
              </div>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onOpenQuickAction('patient');
                }}
                className="w-full text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center justify-between"
              >
                <span>Add Patient</span>
                <span className="text-xs text-slate-400">Patients</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onOpenQuickAction('appointment');
                }}
                className="w-full text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center justify-between"
              >
                <span>Book Appointment</span>
                <span className="text-xs text-slate-400">Schedule</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onOpenQuickAction('admission');
                }}
                className="w-full text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center justify-between"
              >
                <span>Admit Inpatient</span>
                <span className="text-xs text-slate-400">Ward</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onOpenQuickAction('bill');
                }}
                className="w-full text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center justify-between"
              >
                <span>Generate Bill</span>
                <span className="text-xs text-slate-400">Finance</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowQuickActions(false);
              setShowUserDropdown(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Hospital Alerts & Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Hospital Alerts</h4>
                  <span className="text-xs text-slate-500">{unreadCount} unread notices</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No active alerts</div>
                ) : (
                  notifications.map((item) => {
                    let Icon = Info;
                    let iconColor = 'text-blue-600';
                    if (item.type === 'urgent') {
                      Icon = AlertTriangle;
                      iconColor = 'text-rose-600';
                    } else if (item.type === 'warning') {
                      Icon = AlertTriangle;
                      iconColor = 'text-amber-600';
                    } else if (item.type === 'success') {
                      Icon = CheckCircle2;
                      iconColor = 'text-emerald-600';
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => onMarkNotificationAsRead(item.id)}
                        className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-start gap-3 ${
                          !item.read ? 'bg-teal-50/20' : ''
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold ${
                              !item.read ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {item.message}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-1 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timestamp}
                          </span>
                        </div>
                        {!item.read && (
                          <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setActiveTab('settings');
                  }}
                  className="text-xs text-slate-600 hover:text-teal-600 font-medium inline-flex items-center gap-1"
                >
                  View DBMS Database Configuration
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authentication Zone */}
        {!googleUser ? (
          <button
            onClick={onGoogleSignIn}
            className="gsi-material-button"
            title="Sign in with Google to sync hospital database to Google Sheets"
          >
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in with Google</span>
            </div>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
                setShowQuickActions(false);
              }}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity"
            >
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border border-slate-200 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-semibold flex items-center justify-center text-xs shadow-2xs">
                  {(googleUser.displayName || 'User').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {googleUser.displayName || 'Admin'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium leading-tight">
                  Google Workspace
                </span>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {googleUser.displayName || 'Google User'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{googleUser.email}</p>
                </div>

                <div className="py-1">
                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Open in Google Sheets</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSyncGoogleSheets();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sync Database Now</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Database Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onGoogleSignOut();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
