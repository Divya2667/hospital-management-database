import React, { useState, useEffect, useRef } from 'react';
import { Patient, BloodGroup, Gender, PatientStatus, Doctor } from '../../types';
import { X, Check, AlertCircle } from 'lucide-react';
import { departmentsList } from '../../data/mockData';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Omit<Patient, 'id'> & { id?: string }) => Promise<void>;
  patientToEdit?: Patient | null;
  doctors: Doctor[];
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientToEdit,
  doctors
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(30);
  const [gender, setGender] = useState<Gender>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [status, setStatus] = useState<PatientStatus>('Active');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prevOpenRef = useRef(isOpen);
  const prevPatientIdRef = useRef(patientToEdit?.id);

  useEffect(() => {
    const justOpened = isOpen && !prevOpenRef.current;
    const patientChanged = patientToEdit?.id !== prevPatientIdRef.current;

    if (justOpened || patientChanged) {
      setApiError(null);
      setErrors({});
      if (patientToEdit) {
        setFullName(patientToEdit.fullName);
        setAge(patientToEdit.age);
        setGender(patientToEdit.gender);
        setPhone(patientToEdit.phone);
        setEmail(patientToEdit.email);
        setBloodGroup(patientToEdit.bloodGroup);
        setAddress(patientToEdit.address);
        setEmergencyContact(patientToEdit.emergencyContact);
        setDepartment(patientToEdit.department);
        setAssignedDoctor(patientToEdit.assignedDoctor);
        setRegistrationDate(patientToEdit.registrationDate);
        setStatus(patientToEdit.status);
        setNotes(patientToEdit.notes || '');
      } else {
        setFullName('');
        setAge(32);
        setGender('Male');
        setPhone('');
        setEmail('');
        setBloodGroup('O+');
        setAddress('');
        setEmergencyContact('');
        setDepartment('General Medicine');
        setAssignedDoctor(doctors[0]?.name || '');
        setRegistrationDate(new Date().toISOString().split('T')[0]);
        setStatus('Active');
        setNotes('');
      }
    }

    prevOpenRef.current = isOpen;
    prevPatientIdRef.current = patientToEdit?.id;
  }, [isOpen, patientToEdit, doctors]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!age || Number(age) <= 0 || Number(age) > 125) errs.age = 'Enter a valid age (1-125)';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required';
    if (!emergencyContact.trim()) errs.emergencyContact = 'Emergency contact is required';
    if (!address.trim()) errs.address = 'Residential address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      await onSave({
        ...(patientToEdit ? { id: patientToEdit.id } : {}),
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        email: email.trim(),
        bloodGroup,
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
        department,
        assignedDoctor: assignedDoctor || (doctors[0]?.name ?? 'Unassigned'),
        registrationDate: registrationDate || new Date().toISOString().split('T')[0],
        status,
        notes: notes.trim()
      });
      // ONLY close modal if save succeeded
      onClose();
    } catch (err: any) {
      // Keep form data, keep modal open, display actual error
      setApiError(err.message || 'Failed to save patient to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {patientToEdit ? `Edit Patient (${patientToEdit.id})` : 'Register New Patient'}
            </h3>
            <p className="text-xs text-slate-500">
              Captures patient clinical demographics for Excel Patients sheet and medical records.
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
          {apiError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Backend Request Error</p>
                <p className="mt-0.5 text-rose-700">{apiError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Arthur Pendelton"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  min={1}
                  max={125}
                  className={`w-full px-3 py-2 text-sm rounded-xl border tabular-nums ${
                    errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:border-teal-500`}
                />
                {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* Blood Group & Status */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PatientStatus)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inpatient">Inpatient</option>
                  <option value="Outpatient">Outpatient</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact *
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name & Contact (e.g. Jane Doe - 555-0192)"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.emergencyContact ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.emergencyContact && (
                <p className="text-xs text-rose-600 mt-1">{errors.emergencyContact}</p>
              )}
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

            {/* Assigned Doctor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Doctor
              </label>
              <select
                value={assignedDoctor}
                onChange={(e) => setAssignedDoctor(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Date
              </label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
              className={`w-full px-3 py-2 text-sm rounded-xl border ${
                errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:outline-none focus:border-teal-500`}
            />
            {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Observations / Medical Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, ongoing chronic conditions, or reason for registration..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Modal Footer */}
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
              <span>{isSubmitting ? 'Saving to Database...' : patientToEdit ? 'Update Patient' : 'Save Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
