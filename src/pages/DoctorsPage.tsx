import React, { useState, useMemo } from 'react';
import { Doctor, DoctorAvailability } from '../types';
import {
  Search,
  UserPlus,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Stethoscope
} from 'lucide-react';
import { departmentsList } from '../data/mockData';

interface DoctorsPageProps {
  doctors: Doctor[];
  onOpenAddModal: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctorPrompt: (doctor: Doctor) => void;
  onUpdateDoctorAvailability: (doctor: Doctor, availability: DoctorAvailability) => void;
  onExportCSV: () => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  onOpenAddModal,
  onEditDoctor,
  onDeleteDoctorPrompt,
  onUpdateDoctorAvailability,
  onExportCSV
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
      const matchesAvail =
        selectedAvailability === 'ALL' || doc.availability === selectedAvailability;

      return matchesSearch && matchesDept && matchesAvail;
    });
  }, [doctors, searchQuery, selectedDept, selectedAvailability]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Medical Staff & Physicians
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold tabular-nums">
              {filteredDoctors.length} Specialists
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Doctors roster, consultation scheduling fees, and current duty status (Doctors Excel sheet).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download Doctors sheet as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Sheet</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by physician name or specialization..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
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
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Availabilities</option>
              <option value="Available">Available for Consultations</option>
              <option value="In Surgery">In Surgery (OR)</option>
              <option value="On Call">On Call</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Doctors: Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDoctors.map((doc) => {
            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
            if (doc.availability === 'In Surgery') {
              badgeBg = 'bg-purple-50 text-purple-700 border-purple-200/60';
            } else if (doc.availability === 'On Call') {
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200/60';
            } else if (doc.availability === 'On Leave') {
              badgeBg = 'bg-slate-100 text-slate-500 border-slate-200';
            }

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all duration-200"
              >
                <div>
                  {/* Top Row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-sm">
                      {doc.name
                        .replace('Dr. ', '')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {doc.availability}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                  <p className="text-xs text-teal-700 font-medium mt-0.5">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.department}</p>

                  {doc.qualification && (
                    <p className="text-[11px] text-slate-400 mt-2 italic line-clamp-1">
                      {doc.qualification}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Experience:</span>
                      <span className="font-semibold text-slate-800">{doc.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-mono font-bold text-teal-700 tabular-nums">
                        ${doc.consultationFee}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-700 truncate max-w-[120px]">{doc.room}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">{doc.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditDoctor(doc)}
                      className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Doctor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDoctorPrompt(doc)}
                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Doctor ID</th>
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Specialization & Dept</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Availability</th>
                  <th className="py-3 px-4 text-right">Consultation Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                      {doc.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{doc.name}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-400">{doc.department}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{doc.experience}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <p>{doc.phone}</p>
                      <p className="text-[11px] text-slate-400">{doc.email}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          doc.availability === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : doc.availability === 'In Surgery'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : doc.availability === 'On Call'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {doc.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-teal-700 tabular-nums">
                      ${doc.consultationFee}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditDoctor(doc)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDoctorPrompt(doc)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
