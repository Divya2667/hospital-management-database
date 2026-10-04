import React from 'react';
import {
  Users,
  Calendar,
  UserCheck,
  BedDouble,
  Receipt,
  UserPlus,
  CalendarPlus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { Patient, Doctor, Appointment, Admission, Bill, ActiveTab } from '../types';

interface DashboardPageProps {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  admissions: Admission[];
  bills: Bill[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAction: (action: 'patient' | 'appointment' | 'admission' | 'bill') => void;
  onViewPatientDetails: (patient: Patient) => void;
  onExportWorkbook: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  patients,
  doctors,
  appointments,
  admissions,
  bills,
  setActiveTab,
  onOpenQuickAction,
  onViewPatientDetails,
  onExportWorkbook
}) => {
  // Compute Key Metrics
  const totalPatients = patients.length;
  const todayStr = '2026-10-04'; // Project reference date
  const appointmentsToday = appointments.filter((a) => a.appointmentDate === todayStr);
  const availableDoctors = doctors.filter((d) => d.availability === 'Available').length;
  const currentAdmissions = admissions.filter((ad) => ad.status === 'Admitted').length;
  const pendingBills = bills.filter((b) => b.paymentStatus === 'Pending' || b.paymentStatus === 'Overdue');
  const pendingBillsAmount = pendingBills.reduce((acc, b) => acc + b.totalAmount, 0);

  // Department Distribution data
  const deptCounts: Record<string, number> = {};
  patients.forEach((p) => {
    deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
  });

  const topDepartments = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentPatients = [...patients].slice(0, 5);
  const recentAppointments = [...appointments].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hospital Operations Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time census, inpatient bed allocations, and clinical consultation logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenQuickAction('patient')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Patient</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('appointment')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200/60"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>Schedule Visit</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('admission')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <BedDouble className="w-3.5 h-3.5 text-slate-600" />
            <span>Admit Inpatient</span>
          </button>
          <button
            onClick={onExportWorkbook}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/80"
            title="Download CSV for Excel database sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Sheet</span>
          </button>
        </div>
      </div>

      {/* 5 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Patients */}
        <div
          onClick={() => setActiveTab('patients')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patients</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalPatients}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active hospital records</p>
        </div>

        {/* Card 2: Today's Appointments */}
        <div
          onClick={() => setActiveTab('appointments')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-cyan-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {appointmentsToday.length}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {appointments.length} Total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled for today</p>
        </div>

        {/* Card 3: Available Doctors */}
        <div
          onClick={() => setActiveTab('doctors')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Doctors</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {availableDoctors}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              of {doctors.length} Staff
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On active duty today</p>
        </div>

        {/* Card 4: Current Admissions */}
        <div
          onClick={() => setActiveTab('admissions')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Admissions</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentAdmissions}
            </span>
            <span className="text-[11px] font-medium text-indigo-600">75% Bed Cap</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Occupied ward beds</p>
        </div>

        {/* Card 5: Pending Bills */}
        <div
          onClick={() => setActiveTab('billing')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Bills</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ${pendingBillsAmount.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-amber-600">
              {pendingBills.length} Unpaid
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Outstanding receivables</p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Statistics Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient Volume Statistics</h3>
              <p className="text-xs text-slate-500">
                Monthly outpatient visits vs inpatient bed admissions (Jan - Oct 2026)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-teal-600" />
                <span className="text-slate-600 font-medium">Outpatients</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-cyan-400" />
                <span className="text-slate-600 font-medium">Inpatients</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with subtle styling */}
          <div className="h-64 w-full">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="180" x2="600" y2="180" stroke="#e2e8f0" strokeWidth="1" />

              {/* Data Bars for 10 months */}
              {[
                { m: 'Jan', op: 95, ip: 38 },
                { m: 'Feb', op: 110, ip: 42 },
                { m: 'Mar', op: 135, ip: 48 },
                { m: 'Apr', op: 120, ip: 45 },
                { m: 'May', op: 145, ip: 52 },
                { m: 'Jun', op: 160, ip: 58 },
                { m: 'Jul', op: 155, ip: 55 },
                { m: 'Aug', op: 175, ip: 62 },
                { m: 'Sep', op: 190, ip: 70 },
                { m: 'Oct', op: 168, ip: 65 }
              ].map((d, i) => {
                const x = 20 + i * 58;
                const opH = (d.op / 220) * 140;
                const ipH = (d.ip / 220) * 140;

                return (
                  <g key={d.m} className="group cursor-pointer">
                    {/* Outpatient Bar */}
                    <rect
                      x={x}
                      y={180 - opH}
                      width="18"
                      height={opH}
                      rx="3"
                      fill="#0d9488"
                      className="transition-all duration-200 hover:fill-teal-500"
                    >
                      <title>{`${d.m} Outpatients: ${d.op}`}</title>
                    </rect>
                    {/* Inpatient Bar */}
                    <rect
                      x={x + 22}
                      y={180 - ipH}
                      width="18"
                      height={ipH}
                      rx="3"
                      fill="#22d3ee"
                      className="transition-all duration-200 hover:fill-cyan-300"
                    >
                      <title>{`${d.m} Inpatients: ${d.ip}`}</title>
                    </rect>
                    {/* Month Label */}
                    <text
                      x={x + 20}
                      y="196"
                      fontSize="10"
                      textAnchor="middle"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {d.m}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Department Distribution (1 column) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active patient load classified by clinical department
            </p>

            <div className="mt-5 space-y-3.5">
              {topDepartments.map(([dept, count]) => {
                const pct = Math.round((count / (totalPatients || 1)) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{dept}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {count} pts ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hospital Bed Occupancy</span>
            <span className="font-bold text-slate-800 font-mono">75% (3/4 occupied)</span>
          </div>
        </div>
      </div>

      {/* Two Column Bottom Grid: Appointments & Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Consultation Schedule</h3>
              <p className="text-xs text-slate-500">Upcoming and completed patient visits</p>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No scheduled appointments.</div>
            ) : (
              recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 px-5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {apt.tokenNumber || 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{apt.patientName}</p>
                      <p className="text-slate-500 text-[11px] truncate">
                        {apt.doctorName} · {apt.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-slate-700 font-medium block">
                        {apt.appointmentTime}
                      </span>
                      <span className="text-[10px] text-slate-400">{apt.appointmentDate}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        apt.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : apt.status === 'Waiting'
                          ? 'bg-amber-50 text-amber-700'
                          : apt.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patient Registrations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Patient Registrations</h3>
              <p className="text-xs text-slate-500">Newly registered medical records</p>
            </div>
            <button
              onClick={() => setActiveTab('patients')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              <span>Manage Patients</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => onViewPatientDetails(p)}
                className="p-3.5 px-5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    {p.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {p.fullName}
                    </p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {p.gender}, {p.age}y · Blood: <span className="font-semibold text-rose-500">{p.bloodGroup}</span> · {p.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-slate-400 text-[11px]">{p.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      p.status === 'Inpatient'
                        ? 'bg-purple-50 text-purple-700'
                        : p.status === 'Discharged'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {p.status}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
