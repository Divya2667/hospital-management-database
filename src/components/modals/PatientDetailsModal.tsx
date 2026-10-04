import React from 'react';
import { Patient, Appointment, Admission, Bill } from '../../types';
import {
  X,
  User,
  Calendar,
  BedDouble,
  Receipt,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  appointments: Appointment[];
  admissions: Admission[];
  bills: Bill[];
  onEditPatient: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
  onNewBill: (patient: Patient) => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  patient,
  appointments,
  admissions,
  bills,
  onEditPatient,
  onBookAppointment,
  onNewBill
}) => {
  if (!isOpen || !patient) return null;

  const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
  const patientAdmissions = admissions.filter((ad) => ad.patientId === patient.id);
  const patientBills = bills.filter((b) => b.patientId === patient.id);

  const totalBilled = patientBills.reduce((acc, b) => acc + b.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xl">
              {patient.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold truncate">{patient.fullName}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-400/20 text-teal-300 font-medium">
                  {patient.id}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-white/10 text-white">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {patient.age} yrs · {patient.gender} · Blood Group: <span className="font-semibold text-rose-400">{patient.bloodGroup}</span> · Dept: {patient.department}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEditPatient(patient);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow-sm transition-colors"
              >
                Edit Records
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Demographics & Contact Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Phone</span>
                <span className="text-sm font-medium text-slate-800">{patient.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Email</span>
                <span className="text-sm font-medium text-slate-800 truncate block">{patient.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Emergency Contact</span>
                <span className="text-sm font-medium text-slate-800">{patient.emergencyContact}</span>
              </div>
            </div>

            <div className="md:col-span-2 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Residential Address</span>
                <span className="text-sm font-medium text-slate-800">{patient.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Primary Physician</span>
                <span className="text-sm font-medium text-slate-800">{patient.assignedDoctor}</span>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          {patient.notes && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
              <div className="flex items-center gap-2 mb-1">
                <HeartPulse className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Clinical History & Notes
                </h4>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed">{patient.notes}</p>
            </div>
          )}

          {/* Connected DBMS Relational Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appointments Sheet Records */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Appointments ({patientAppointments.length})
                  </h4>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onBookAppointment(patient);
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                >
                  + Book
                </button>
              </div>

              {patientAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No appointments on record.</p>
              ) : (
                <div className="space-y-2">
                  {patientAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{apt.reason}</p>
                        <p className="text-slate-500 text-[11px]">
                          {apt.appointmentDate} · {apt.appointmentTime} · {apt.doctorName}
                        </p>
                      </div>
                      <span className="font-mono px-2 py-0.5 rounded bg-white text-slate-700 border text-[10px]">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inpatient Admissions Sheet Records */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Admissions ({patientAdmissions.length})
                  </h4>
                </div>
              </div>

              {patientAdmissions.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No hospital ward admissions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {patientAdmissions.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          Room {ad.roomNumber} · Bed {ad.bedNumber}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Admitted: {ad.admissionDate} (Dr. {ad.doctor})
                        </p>
                      </div>
                      <span className="font-mono px-2 py-0.5 rounded bg-white text-slate-700 border text-[10px]">
                        {ad.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Billing & Invoice History */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Billing History ({patientBills.length}) · Total:{' '}
                  <span className="font-mono text-teal-700 font-semibold tabular-nums">
                    ${totalBilled.toLocaleString()}
                  </span>
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNewBill(patient);
                }}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
              >
                + Generate Bill
              </button>
            </div>

            {patientBills.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No billing records generated.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2 px-3">Invoice ID</th>
                      <th className="py-2 px-3">Billing Date</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientBills.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{b.id}</td>
                        <td className="py-2 px-3 text-slate-600">{b.billingDate}</td>
                        <td className="py-2 px-3 text-slate-600">{b.paymentMethod || 'Direct'}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-right text-slate-900 tabular-nums">
                          ${b.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              b.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : b.paymentStatus === 'Overdue'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
