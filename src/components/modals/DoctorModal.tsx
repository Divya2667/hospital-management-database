import React, { useState, useEffect } from 'react';
import { Doctor, DoctorAvailability, DoctorStatus } from '../../types';
import { X, Check } from 'lucide-react';
import { departmentsList } from '../../data/mockData';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: Omit<Doctor, 'id'> & { id?: string }) => Promise<void>;
  doctorToEdit?: Doctor | null;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  doctorToEdit
}) => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('10 Years');
  const [availability, setAvailability] = useState<DoctorAvailability>('Available');
  const [consultationFee, setConsultationFee] = useState<number | ''>(150);
  const [status, setStatus] = useState<DoctorStatus>('Active');
  const [room, setRoom] = useState('Suite 201');
  const [qualification, setQualification] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctorToEdit) {
      setName(doctorToEdit.name);
      setSpecialization(doctorToEdit.specialization);
      setDepartment(doctorToEdit.department);
      setPhone(doctorToEdit.phone);
      setEmail(doctorToEdit.email);
      setExperience(doctorToEdit.experience);
      setAvailability(doctorToEdit.availability);
      setConsultationFee(doctorToEdit.consultationFee);
      setStatus(doctorToEdit.status);
      setRoom(doctorToEdit.room);
      setQualification(doctorToEdit.qualification || '');
    } else {
      setName('');
      setSpecialization('');
      setDepartment('Cardiology');
      setPhone('');
      setEmail('');
      setExperience('8 Years');
      setAvailability('Available');
      setConsultationFee(150);
      setStatus('Active');
      setRoom('Suite 102');
      setQualification('MD, Board Certified');
    }
    setErrors({});
  }, [doctorToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Doctor name is required';
    if (!specialization.trim()) errs.specialization = 'Specialization is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required';
    if (!consultationFee || Number(consultationFee) < 0) errs.consultationFee = 'Valid consultation fee is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(doctorToEdit ? { id: doctorToEdit.id } : {}),
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        specialization: specialization.trim(),
        department,
        phone: phone.trim(),
        email: email.trim(),
        experience: experience.trim(),
        availability,
        consultationFee: Number(consultationFee),
        status,
        room: room.trim() || 'Room 101',
        qualification: qualification.trim()
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
              {doctorToEdit ? `Edit Physician (${doctorToEdit.id})` : 'Register Medical Staff / Doctor'}
            </h3>
            <p className="text-xs text-slate-500">
              Saved directly to the Doctors Excel sheet and scheduling system.
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
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Julian Hayes"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Interventional Cardiology"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.specialization ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.specialization && (
                <p className="text-xs text-rose-600 mt-1">{errors.specialization}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
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

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 14 Years"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                className={`w-full px-3 py-2 text-sm rounded-xl border tabular-nums ${
                  errors.consultationFee ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.consultationFee && (
                <p className="text-xs text-rose-600 mt-1">{errors.consultationFee}</p>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as DoctorAvailability)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Available">Available</option>
                <option value="On Call">On Call</option>
                <option value="In Surgery">In Surgery</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DoctorStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 101-2000"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@auracare.org"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* Room / Chamber */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room / Chamber Location
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Consultation Suite 402"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualifications / Degrees
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="MD, FACC, Harvard"
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
              <span>{isSubmitting ? 'Saving...' : doctorToEdit ? 'Update Doctor' : 'Save Doctor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
