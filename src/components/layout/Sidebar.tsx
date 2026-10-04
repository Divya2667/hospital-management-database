import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  BedDouble,
  Pill,
  ReceiptText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  counts?: {
    patients: number;
    appointmentsToday: number;
    admissions: number;
    lowStockMedicines: number;
    pendingBills: number;
  };
  isGoogleSheetsConnected?: boolean;
  spreadsheetUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  counts,
  isGoogleSheetsConnected,
  spreadsheetUrl
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'patients' as ActiveTab,
      label: 'Patients',
      icon: Users,
      badge: counts?.patients ? String(counts.patients) : null
    },
    {
      id: 'doctors' as ActiveTab,
      label: 'Doctors',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'appointments' as ActiveTab,
      label: 'Appointments',
      icon: Calendar,
      badge: counts?.appointmentsToday ? String(counts.appointmentsToday) : null
    },
    {
      id: 'admissions' as ActiveTab,
      label: 'Admissions',
      icon: BedDouble,
      badge: counts?.admissions ? String(counts.admissions) : null
    },
    {
      id: 'pharmacy' as ActiveTab,
      label: 'Pharmacy',
      icon: Pill,
      badge: counts?.lowStockMedicines && counts.lowStockMedicines > 0 ? 'Alert' : null,
      badgeAlert: true
    },
    {
      id: 'billing' as ActiveTab,
      label: 'Billing',
      icon: ReceiptText,
      badge: counts?.pendingBills ? String(counts.pendingBills) : null
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  AuraCare HMS
                </span>
                <span className="text-xs text-slate-500 font-medium truncate">
                  Clinical DBMS Console
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="py-4 px-3 space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Main Operations
            </p>
          )}

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold tabular-nums ${
                        item.badgeAlert
                          ? 'bg-amber-100 text-amber-800'
                          : isActive
                          ? 'bg-teal-200 text-teal-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Database Status */}
      <div className="p-3 border-t border-slate-100">
        {!isCollapsed ? (
          <div
            className={`p-3 rounded-xl border ${
              isGoogleSheetsConnected
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet
                  className={`w-4 h-4 ${
                    isGoogleSheetsConnected ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800">
                  {isGoogleSheetsConnected ? 'Google Sheets' : 'Excel Database'}
                </span>
              </div>
              {isGoogleSheetsConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {isGoogleSheetsConnected
                ? 'Cloud database connected with real-time multi-user syncing.'
                : 'Local workbook / REST bridge fallback active.'}
            </p>
            {isGoogleSheetsConnected && spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>Open Google Sheet</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            )}
          </div>
        ) : (
          <div
            className="flex justify-center py-2"
            title={isGoogleSheetsConnected ? 'Google Sheets Connected' : 'Excel Database Active'}
          >
            <FileSpreadsheet
              className={`w-5 h-5 ${
                isGoogleSheetsConnected ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
