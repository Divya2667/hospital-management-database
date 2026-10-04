import React, { useState, useEffect } from 'react';
import { Admission, Patient, Doctor, AdmissionStatus } from '../../types';
import { X, Check } from 'lucide-react';
import { departmentsList } from '../../data/mockData';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (admissionData: Omit<Admission, 'id'> & { id?: string }) => Promise<void>;
  admissionToEdit?: Admission | null;
  patients: Patient[];
  doctors: Doctor[];
  preselectedPatient?: Patient | null;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  admissionToEdit,
  patients,
  doctors,
  preselectedPatient
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [roomNumber, setRoomNumber] = useState('Room-302');
  const [bedNumber, setBedNumber] = useState('B-02');
  const [department, setDepartment] = useState('Cardiology');
  const [doctor, setDoctor] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [expectedDischarge, setExpectedDischarge] = useState('');
  const [actualDischarge, setActualDischarge] = useState('');
  const [status, setStatus] = useState<AdmissionStatus>('Admitted');
  const [wardType, setWardType] = useState<'General' | 'ICU' | 'Semi-Private' | 'Private Deluxe'>('Private Deluxe');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (admissionToEdit) {
      setSelectedPatientId(admissionToEdit.patientId);
      setPatientName(admissionToEdit.patientName);
      setRoomNumber(admissionToEdit.roomNumber);
      setBedNumber(admissionToEdit.bedNumber);
      setDepartment(admissionToEdit.department);
      setDoctor(admissionToEdit.doctor);
      setAdmissionDate(admissionToEdit.admissionDate);
      setExpectedDischarge(admissionToEdit.expectedDischarge);
      setActualDischarge(admissionToEdit.actualDischarge || '');
      setStatus(admissionToEdit.status);
      setWardType(admissionToEdit.wardType || 'General');
    } else {
      const defaultPatient = preselectedPatient || patients[0];
      const defaultDoc = doctors[0];

      setSelectedPatientId(defaultPatient?.id || '');
      setPatientName(defaultPatient?.fullName || '');
      setRoomNumber('Ward-204');
      setBedNumber('B-03');
      setDepartment(defaultDoc?.department || 'General Medicine');
      setDoctor(defaultDoc?.name || '');
      const today = new Date().toISOString().split('T')[0];
      setAdmissionDate(today);

      const d = new Date();
      d.setDate(d.getDate() + 5);
      setExpectedDischarge(d.toISOString().split('T')[0]);
      setActualDischarge('');
      setStatus('Admitted');
      setWardType('Semi-Private');
    }
    setErrors({});
  }, [admissionToEdit, isOpen, preselectedPatient, patients, doctors]);

  if (!isOpen) return null;

  const handlePatientSelect = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find((pat) => pat.id === pId);
    if (p) setPatientName(p.fullName);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.patient = 'Please select a patient';
    if (!roomNumber.trim()) errs.roomNumber = 'Room number is required';
    if (!bedNumber.trim()) errs.bedNumber = 'Bed number is required';
    if (!doctor.trim()) errs.doctor = 'Attending doctor is required';
    if (!admissionDate) errs.admissionDate = 'Admission date is required';
    if (!expectedDischarge) errs.expectedDischarge = 'Expected discharge date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(admissionToEdit ? { id: admissionToEdit.id } : {}),
        patientId: selectedPatientId || 'PAT-1001',
        patientName: patientName.trim(),
        roomNumber: roomNumber.trim(),
        bedNumber: bedNumber.trim(),
        department,
        doctor: doctor.trim(),
        admissionDate,
        expectedDischarge,
        actualDischarge: actualDischarge.trim() || null,
        status,
        wardType
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
              {admissionToEdit ? `Edit Inpatient Admission (${admissionToEdit.id})` : 'Admit Patient to Ward / Bed'}
            </h3>
            <p className="text-xs text-slate-500">
              Allocates hospital bed capacity and updates Admissions sheet.
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
                <option value="">-- Select Patient --</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.fullName} ({pat.id} · {pat.gender}, {pat.age}y)
                  </option>
                ))}
              </select>
              {errors.patient && <p className="text-xs text-rose-600 mt-1">{errors.patient}</p>}
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Cardio-402"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.roomNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.roomNumber && <p className="text-xs text-rose-600 mt-1">{errors.roomNumber}</p>}
            </div>

            {/* Bed Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bed Number *
              </label>
              <input
                type="text"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="e.g. B-04"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.bedNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.bedNumber && <p className="text-xs text-rose-600 mt-1">{errors.bedNumber}</p>}
            </div>

            {/* Ward Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward Classification
              </label>
              <select
                value={wardType}
                onChange={(e) => setWardType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="General">General Ward</option>
                <option value="Semi-Private">Semi-Private</option>
                <option value="Private Deluxe">Private Deluxe</option>
                <option value="ICU">Intensive Care Unit (ICU)</option>
              </select>
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

            {/* Attending Doctor */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attending Doctor *
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white ${
                  errors.doctor ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
              {errors.doctor && <p className="text-xs text-rose-600 mt-1">{errors.doctor}</p>}
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Date *
              </label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.admissionDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.admissionDate && (
                <p className="text-xs text-rose-600 mt-1">{errors.admissionDate}</p>
              )}
            </div>

            {/* Expected Discharge */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Discharge *
              </label>
              <input
                type="date"
                value={expectedDischarge}
                onChange={(e) => setExpectedDischarge(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.expectedDischarge ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.expectedDischarge && (
                <p className="text-xs text-rose-600 mt-1">{errors.expectedDischarge}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdmissionStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>

            {/* Actual Discharge (if discharged) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Actual Discharge Date (if applicable)
              </label>
              <input
                type="date"
                value={actualDischarge}
                onChange={(e) => setActualDischarge(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
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
              <span>{isSubmitting ? 'Admitting...' : admissionToEdit ? 'Update Admission' : 'Confirm Admission'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
