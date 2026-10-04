import React, { useState, useEffect } from 'react';
import { Bill, Patient, PaymentStatus } from '../../types';
import { X, Check, Calculator } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (billData: Omit<Bill, 'id' | 'totalAmount'> & { id?: string; totalAmount?: number }) => Promise<void>;
  billToEdit?: Bill | null;
  patients: Patient[];
  preselectedPatient?: Patient | null;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  billToEdit,
  patients,
  preselectedPatient
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(150);
  const [medicineCharges, setMedicineCharges] = useState<number>(85);
  const [roomCharges, setRoomCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(40);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Health Insurance' | 'UPI/Bank Transfer'>('Credit Card');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [billingDate, setBillingDate] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live calculation of Total Amount
  const totalAmount =
    (Number(consultationFee) || 0) +
    (Number(medicineCharges) || 0) +
    (Number(roomCharges) || 0) +
    (Number(otherCharges) || 0);

  useEffect(() => {
    if (billToEdit) {
      setSelectedPatientId(billToEdit.patientId);
      setPatientName(billToEdit.patientName);
      setConsultationFee(billToEdit.consultationFee);
      setMedicineCharges(billToEdit.medicineCharges);
      setRoomCharges(billToEdit.roomCharges);
      setOtherCharges(billToEdit.otherCharges);
      setPaymentStatus(billToEdit.paymentStatus);
      setPaymentMethod(billToEdit.paymentMethod || 'Credit Card');
      setInsuranceProvider(billToEdit.insuranceProvider || '');
      setBillingDate(billToEdit.billingDate);
    } else {
      const defaultPatient = preselectedPatient || patients[0];
      setSelectedPatientId(defaultPatient?.id || '');
      setPatientName(defaultPatient?.fullName || '');
      setConsultationFee(160);
      setMedicineCharges(75);
      setRoomCharges(defaultPatient?.status === 'Inpatient' ? 450 : 0);
      setOtherCharges(35);
      setPaymentStatus('Pending');
      setPaymentMethod('Credit Card');
      setInsuranceProvider('');
      setBillingDate(new Date().toISOString().split('T')[0]);
    }
    setErrors({});
  }, [billToEdit, isOpen, preselectedPatient, patients]);

  if (!isOpen) return null;

  const handlePatientSelect = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find((pat) => pat.id === pId);
    if (p) {
      setPatientName(p.fullName);
      if (p.status === 'Inpatient') {
        setRoomCharges(500);
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.patient = 'Please select a patient';
    if (!billingDate) errs.billingDate = 'Billing date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(billToEdit ? { id: billToEdit.id } : {}),
        patientId: selectedPatientId || 'PAT-1001',
        patientName: patientName.trim(),
        consultationFee: Number(consultationFee) || 0,
        medicineCharges: Number(medicineCharges) || 0,
        roomCharges: Number(roomCharges) || 0,
        otherCharges: Number(otherCharges) || 0,
        totalAmount,
        paymentStatus,
        paymentMethod,
        insuranceProvider: paymentMethod === 'Health Insurance' ? insuranceProvider.trim() : undefined,
        billingDate
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
              {billToEdit ? `Edit Invoice (${billToEdit.id})` : 'Generate Hospital Bill'}
            </h3>
            <p className="text-xs text-slate-500">
              Aggregates medical fee components and logs to Bills database sheet.
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
                Patient / Account *
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white ${
                  errors.patient ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.fullName} ({pat.id} · {pat.status})
                  </option>
                ))}
              </select>
              {errors.patient && <p className="text-xs text-rose-600 mt-1">{errors.patient}</p>}
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Consultation Fee ($)
              </label>
              <input
                type="number"
                min={0}
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 tabular-nums focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Medicine Charges */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pharmacy / Medicine Charges ($)
              </label>
              <input
                type="number"
                min={0}
                value={medicineCharges}
                onChange={(e) => setMedicineCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 tabular-nums focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Room Charges */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward / Room Charges ($)
              </label>
              <input
                type="number"
                min={0}
                value={roomCharges}
                onChange={(e) => setRoomCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 tabular-nums focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Other Charges */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diagnostics / Lab & Other Charges ($)
              </label>
              <input
                type="number"
                min={0}
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 tabular-nums focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="Cash">Cash Counter</option>
                <option value="Health Insurance">Health Insurance Claim</option>
                <option value="UPI/Bank Transfer">UPI / Direct Bank Transfer</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Settlement Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid / Settled</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Billing Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Insurance Provider (conditional) */}
            {paymentMethod === 'Health Insurance' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insurance Provider Name
                </label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. BlueCross / Medicare"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}
          </div>

          {/* Auto-Calculated Total Amount Box */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-teal-700" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-900 block">
                  Total Bill Amount (Auto-Calculated)
                </span>
                <span className="text-xs text-teal-700">
                  Consultation (${consultationFee}) + Meds (${medicineCharges}) + Ward (${roomCharges}) + Lab (${otherCharges})
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-teal-900 tabular-nums">
              ${totalAmount.toLocaleString()}
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
              <span>{isSubmitting ? 'Recording...' : billToEdit ? 'Update Bill' : 'Issue Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
