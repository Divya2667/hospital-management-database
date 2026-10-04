import React from 'react';
import { Bill, Patient } from '../../types';
import { X, Printer, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  patient?: Patient | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  bill,
  patient
}) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Official Clinical Receipt</span>
            <span className="font-mono text-xs text-slate-500">[{bill.id}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white" id="printable-invoice">
          {/* Hospital Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AuraCare Medical Center</h2>
              </div>
              <p className="text-xs text-slate-500">
                100 Medical Center Parkway · Hospital District · ISO 9001:2020 Certified
              </p>
              <p className="text-xs text-slate-500">
                DBMS Project Clinic Registry · GSTIN: 29AAAAA0000A1Z5
              </p>
            </div>

            <div className="text-right space-y-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  bill.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : bill.paymentStatus === 'Overdue'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {bill.paymentStatus}
              </span>
              <p className="font-mono text-sm font-semibold text-slate-900 mt-1">{bill.id}</p>
              <p className="text-xs text-slate-500">Date: {bill.billingDate}</p>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To Patient
              </span>
              <h4 className="text-sm font-bold text-slate-900">{bill.patientName}</h4>
              <p className="text-xs font-mono text-slate-600">ID: {bill.patientId}</p>
              {patient && (
                <p className="text-xs text-slate-500 mt-1">
                  {patient.gender}, {patient.age}y · {patient.phone}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment Channel
              </span>
              <p className="text-xs font-semibold text-slate-800">{bill.paymentMethod || 'Hospital Counter'}</p>
              {bill.insuranceProvider && (
                <p className="text-xs text-teal-700 mt-0.5 font-medium">
                  Covered by: {bill.insuranceProvider}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">Status: {bill.paymentStatus}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Description of Clinical Service</th>
                  <th className="py-2.5 px-4 text-center">Category</th>
                  <th className="py-2.5 px-4 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Physician Consultation & Clinical Evaluation
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Professional Fee</td>
                  <td className="py-3 px-4 font-mono font-medium text-right text-slate-800 tabular-nums">
                    ${bill.consultationFee.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Pharmacy Formulations & Prescribed Medications
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Pharmacy</td>
                  <td className="py-3 px-4 font-mono font-medium text-right text-slate-800 tabular-nums">
                    ${bill.medicineCharges.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Inpatient Bed Occupancy & Nursing Care Charges
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Hospital Ward</td>
                  <td className="py-3 px-4 font-mono font-medium text-right text-slate-800 tabular-nums">
                    ${bill.roomCharges.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Laboratory Diagnostics, Consumables & Hospital Overheads
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">Diagnostics</td>
                  <td className="py-3 px-4 font-mono font-medium text-right text-slate-800 tabular-nums">
                    ${bill.otherCharges.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 font-bold text-slate-800 text-right">
                    Total Amount Due:
                  </td>
                  <td className="py-3 px-4 font-mono text-base font-bold text-right text-teal-700 tabular-nums">
                    ${bill.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer certification */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>System-generated e-invoice authenticated via AuraCare DBMS</span>
            </div>
            <span className="font-mono">Authorized Signatory · Accounts Dept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
