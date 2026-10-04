import React, { useState, useMemo } from 'react';
import { Admission, AdmissionStatus } from '../types';
import {
  BedDouble,
  Search,
  Plus,
  LogOut,
  FileSpreadsheet,
  Edit2,
  CheckCircle2,
  Hotel
} from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { departmentsList } from '../data/mockData';

interface AdmissionsPageProps {
  admissions: Admission[];
  onOpenAddModal: () => void;
  onEditAdmission: (admission: Admission) => void;
  onDischargePatient: (admission: Admission) => void;
  onExportCSV: () => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({
  admissions,
  onOpenAddModal,
  onEditAdmission,
  onDischargePatient,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const admittedCount = admissions.filter((ad) => ad.status === 'Admitted').length;
  const totalBeds = 40; // Hospital demo capacity
  const occupancyRate = Math.round((admittedCount / totalBeds) * 100);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((ad) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        ad.patientName.toLowerCase().includes(q) ||
        ad.patientId.toLowerCase().includes(q) ||
        ad.roomNumber.toLowerCase().includes(q) ||
        ad.bedNumber.toLowerCase().includes(q) ||
        ad.doctor.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || ad.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || ad.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [admissions, searchQuery, selectedDept, selectedStatus]);

  const paginatedAdmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmissions.slice(start, start + pageSize);
  }, [filteredAdmissions, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Inpatient Admissions & Ward Census
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold tabular-nums">
              {admittedCount} Active Inpatients
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ward bed allocations, expected discharge dates, and inpatient tracking (Admissions Excel sheet).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download Admissions sheet as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Sheet</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Inpatient</span>
          </button>
        </div>
      </div>

      {/* Ward Occupancy Overview Widget */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Clinical Bed Occupancy Metric</h3>
            <p className="text-xs text-teal-200/80 mt-0.5">
              General Ward, ICU, and Private Suite real-time capacity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 w-full md:w-auto">
          <div>
            <span className="text-[11px] text-teal-300 uppercase tracking-wider block">Occupied Beds</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {admittedCount} <span className="text-xs text-slate-400">/ {totalBeds} Total</span>
            </span>
          </div>

          <div className="flex-1 md:w-48">
            <div className="flex justify-between text-xs text-teal-200 mb-1">
              <span>Ward Density</span>
              <span className="font-mono font-bold">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient, room or bed..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

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

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Admission Statuses</option>
              <option value="Admitted">Admitted (Active Inpatient)</option>
              <option value="Discharged">Discharged</option>
              <option value="Transferred">Transferred</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">Patient Name & ID</th>
                <th className="py-3 px-4">Room & Bed</th>
                <th className="py-3 px-4">Department & Doctor</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Expected Discharge</th>
                <th className="py-3 px-4">Actual Discharge</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Hotel className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No admissions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your filters or admit a patient.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAdmissions.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Admission ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                      {ad.id}
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{ad.patientName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{ad.patientId}</p>
                    </td>

                    {/* Room & Bed */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{ad.roomNumber}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-mono text-teal-700">{ad.bedNumber}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {ad.wardType || 'Ward'}
                      </span>
                    </td>

                    {/* Dept & Doctor */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{ad.department}</p>
                      <p className="text-[11px] text-slate-500">{ad.doctor}</p>
                    </td>

                    {/* Admission Date */}
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      {ad.admissionDate}
                    </td>

                    {/* Expected Discharge */}
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {ad.expectedDischarge}
                    </td>

                    {/* Actual Discharge */}
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                      {ad.actualDischarge || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          ad.status === 'Admitted'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : ad.status === 'Discharged'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {ad.status === 'Admitted' && (
                          <button
                            onClick={() => onDischargePatient(ad)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60"
                            title="Discharge Patient and Free Bed"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Discharge</span>
                          </button>
                        )}
                        <button
                          onClick={() => onEditAdmission(ad)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Admission"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
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
          totalItems={filteredAdmissions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
