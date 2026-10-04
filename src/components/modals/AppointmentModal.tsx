import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Doctor, AppointmentStatus } from '../../types';
import { X, Check } from 'lucide-react';
import { departmentsList } from '../../data/mockData';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: Omit<Appointment, 'id'> & { id?: string }) => Promise<void>;
  appointmentToEdit?: Appointment | null;
  patients: Patient[];
  doctors: Doctor[];
  preselectedPatient?: Patient | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  appointmentToEdit,
  patients,
  doctors,
  preselectedPatient
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('Scheduled');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedPatientId(appointmentToEdit.patientId);
      setPatientName(appointmentToEdit.patientName);
      setSelectedDoctorId(appointmentToEdit.doctorId);
      setDoctorName(appointmentToEdit.doctorName);
      setDepartment(appointmentToEdit.department);
      setAppointmentDate(appointmentToEdit.appointmentDate);
      setAppointmentTime(appointmentToEdit.appointmentTime);
      setReason(appointmentToEdit.reason);
      setStatus(appointmentToEdit.status);
    } else {
      const defaultPatient = preselectedPatient || patients[0];
      const defaultDoc = doctors[0];

      setSelectedPatientId(defaultPatient?.id || '');
      setPatientName(defaultPatient?.fullName || '');
      setSelectedDoctorId(defaultDoc?.id || '');
      setDoctorName(defaultDoc?.name || '');
      setDepartment(defaultDoc?.department || 'Cardiology');
      setAppointmentDate(new Date().toISOString().split('T')[0]);
      setAppointmentTime('10:00 AM');
      setReason('');
      setStatus('Scheduled');
    }
    setErrors({});
  }, [appointmentToEdit, isOpen, preselectedPatient, patients, doctors]);

  if (!isOpen) return null;

  const handlePatientSelect = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find((pat) => pat.id === pId);
    if (p) setPatientName(p.fullName);
  };

  const handleDoctorSelect = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setDoctorName(doc.name);
      setDepartment(doc.department);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.patient = 'Please select a patient';
    if (!doctorName.trim()) errs.doctor = 'Please select a doctor';
    if (!appointmentDate) errs.date = 'Appointment date is required';
    if (!reason.trim()) errs.reason = 'Clinical reason for consultation is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(appointmentToEdit ? { id: appointmentToEdit.id } : {}),
        patientId: selectedPatientId || 'PAT-1001',
        patientName: patientName.trim(),
        doctorId: selectedDoctorId || 'DOC-201',
        doctorName: doctorName.trim(),
        department,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
        status
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {appointmentToEdit ? `Edit Appointment (${appointmentToEdit.id})` : 'Schedule Clinical Appointment'}
            </h3>
            <p className="text-xs text-slate-500">
              Creates or updates a booking record in the Appointments database sheet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Select */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Patient *
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white ${
                  errors.patient ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              >
                <option value="">-- Choose Existing Patient --</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.fullName} ({pat.id} · {pat.gender}, {pat.age}y)
                  </option>
                ))}
              </select>
              {errors.patient && <p className="text-xs text-rose-600 mt-1">{errors.patient}</p>}
            </div>

            {/* Doctor Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorSelect(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white ${
                  errors.doctor ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
              {errors.doctor && <p className="text-xs text-rose-600 mt-1">{errors.doctor}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                {departmentsList.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white ${
                  errors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date}</p>}
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Time Slot
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:15 AM">11:15 AM</option>
                <option value="11:45 AM">11:45 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="03:15 PM">03:15 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="04:45 PM">04:45 PM</option>
              </select>
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Scheduled', 'Waiting', 'Completed', 'Cancelled'] as AppointmentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                      status === st
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Symptoms *
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Chest pain assessment, ECG review, or follow-up mobility consultation..."
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.reason ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.reason && <p className="text-xs text-rose-600 mt-1">{errors.reason}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Booking...' : appointmentToEdit ? 'Update Booking' : 'Confirm Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
