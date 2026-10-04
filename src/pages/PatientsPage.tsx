import React, { useState, useMemo } from 'react';
import {
  Patient,
  PatientStatus,
  BloodGroup
} from '../types';
import {
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Phone,
  User
} from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { departmentsList } from '../data/mockData';

interface PatientsPageProps {
  patients: Patient[];
  onOpenAddModal: () => void;
  onEditPatient: (patient: Patient) => void;
  onViewPatientDetails: (patient: Patient) => void;
  onDeletePatientPrompt: (patient: Patient) => void;
  onExportCSV: () => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  onOpenAddModal,
  onEditPatient,
  onViewPatientDetails,
  onDeletePatientPrompt,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'age'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.assignedDoctor.toLowerCase().includes(q)
      );
    }

    if (selectedDept !== 'ALL') {
      result = result.filter((p) => p.department === selectedDept);
    }

    if (selectedBloodGroup !== 'ALL') {
      result = result.filter((p) => p.bloodGroup === selectedBloodGroup);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') {
        comp = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'age') {
        comp = a.age - b.age;
      } else if (sortBy === 'date') {
        comp = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [patients, searchQuery, selectedDept, selectedBloodGroup, selectedStatus, sortBy, sortOrder]);

  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const toggleSort = (field: 'name' | 'date' | 'age') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Patient Management Registry
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold tabular-nums">
              {filteredPatients.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and modify patient demographic and clinical records (Patients Excel sheet).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download Patients sheet as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Patients</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID, phone, doctor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Department Filter */}
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

          {/* Blood Group Filter */}
          <div>
            <select
              value={selectedBloodGroup}
              onChange={(e) => {
                setSelectedBloodGroup(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Blood Groups</option>
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                <option key={bg} value={bg}>
                  Blood Group: {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
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
              {(['Active', 'Inpatient', 'Outpatient', 'Discharged'] as PatientStatus[]).map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-teal-700 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Patient Name & Demographic</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('age')}
                  className="py-3 px-4 cursor-pointer hover:text-teal-700 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Age / Gender</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Blood</th>
                <th className="py-3 px-4">Department & Doctor</th>
                <th className="py-3 px-4">Contact</th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-teal-700 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Reg. Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No matching patients found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting search filters or register a new patient.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Patient ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                      {patient.id}
                    </td>

                    {/* Patient Name */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onViewPatientDetails(patient)}
                        className="cursor-pointer"
                      >
                        <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {patient.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {patient.address}
                        </p>
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold tabular-nums">{patient.age}y</span> · {patient.gender}
                    </td>

                    {/* Blood Group */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                        {patient.bloodGroup}
                      </span>
                    </td>

                    {/* Department & Doctor */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{patient.department}</p>
                      <p className="text-[11px] text-slate-500">{patient.assignedDoctor}</p>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {patient.email}
                      </p>
                    </td>

                    {/* Reg Date */}
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px] tabular-nums">
                      {patient.registrationDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          patient.status === 'Inpatient'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : patient.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : patient.status === 'Outpatient'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewPatientDetails(patient)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Clinical Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Patient Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePatientPrompt(patient)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Patient Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredPatients.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
