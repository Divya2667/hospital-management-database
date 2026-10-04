import React, { useState, useMemo } from 'react';
import { Appointment, Doctor, AppointmentStatus } from '../types';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { departmentsList } from '../data/mockData';

interface AppointmentsPageProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onOpenBookModal: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCancelAppointmentPrompt: (appointment: Appointment) => void;
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => void;
  onExportCSV: () => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  appointments,
  doctors,
  onOpenBookModal,
  onEditAppointment,
  onCancelAppointmentPrompt,
  onUpdateStatus,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.id.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q);

      const matchesDoctor =
        selectedDoctorId === 'ALL' || apt.doctorId === selectedDoctorId;
      const matchesDept = selectedDept === 'ALL' || apt.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || apt.status === selectedStatus;
      const matchesDate = selectedDate === '' || apt.appointmentDate === selectedDate;

      return matchesSearch && matchesDoctor && matchesDept && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, selectedDoctorId, selectedDept, selectedStatus, selectedDate]);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Clinical Appointments
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold tabular-nums">
              {filteredAppointments.length} Consultations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time outpatient consultation schedule and token management (Appointments Excel sheet).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download Appointments sheet as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Sheet</span>
          </button>
          <button
            onClick={onOpenBookModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search patient, doctor, reason..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Filter by Doctor */}
          <div>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Department */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Waiting">Waiting</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Filter by Date */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Token & ID</th>
                <th className="py-3 px-4">Patient Name & ID</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date & Time Slot</th>
                <th className="py-3 px-4">Reason for Visit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No appointments scheduled</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your date or status filters or book an appointment.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Token & ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                          {apt.tokenNumber || 1}
                        </span>
                        <span className="font-mono text-slate-600 tabular-nums">{apt.id}</span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{apt.patientName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{apt.patientId}</p>
                    </td>

                    {/* Doctor */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{apt.doctorName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{apt.doctorId}</p>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-700">{apt.department}</td>

                    {/* Date & Time */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{apt.appointmentTime}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {apt.appointmentDate}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-xs text-slate-700 truncate">
                      {apt.reason}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          apt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : apt.status === 'Waiting'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-teal-50 text-teal-700 border border-teal-200/60'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    {/* Quick Status and Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {apt.status !== 'Completed' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'Completed')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditAppointment(apt)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Appointment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => onCancelAppointmentPrompt(apt)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Cancel Appointment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredAppointments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
