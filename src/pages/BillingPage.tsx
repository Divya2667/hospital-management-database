import React, { useState, useMemo } from 'react';
import { Bill, PaymentStatus } from '../types';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  CheckCircle,
  FileSpreadsheet,
  Edit2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Pagination } from '../components/common/Pagination';

interface BillingPageProps {
  bills: Bill[];
  onOpenAddModal: () => void;
  onEditBill: (bill: Bill) => void;
  onViewInvoice: (bill: Bill) => void;
  onMarkPaid: (bill: Bill) => void;
  onExportCSV: () => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  bills,
  onOpenAddModal,
  onEditBill,
  onViewInvoice,
  onMarkPaid,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Financial aggregates
  const totalInvoiced = bills.reduce((acc, b) => acc + b.totalAmount, 0);
  const paidTotal = bills
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((acc, b) => acc + b.totalAmount, 0);
  const pendingTotal = bills
    .filter((b) => b.paymentStatus === 'Pending' || b.paymentStatus === 'Partially Paid')
    .reduce((acc, b) => acc + b.totalAmount, 0);
  const overdueTotal = bills
    .filter((b) => b.paymentStatus === 'Overdue')
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        b.patientName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.patientId.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'ALL' || b.paymentStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, selectedStatus]);

  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Billing & Financial Invoicing
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold tabular-nums">
              {bills.length} Invoices Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Departmental fees, room tariffs, pharmacy charges, and automated invoicing (Bills Excel sheet).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download Bills sheet as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Invoices</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Bill</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Total Revenue Invoiced</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            ${totalInvoiced.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Cumulative bill generation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Settled Collections (Paid)</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            ${paidTotal.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Cleared and accounted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Pending Receivables</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            ${pendingTotal.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Under insurance/patient review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Overdue Invoices</span>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            ${overdueTotal.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-500 font-medium">Requires billing follow-up</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by invoice ID, patient name, or patient ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-500"
            />
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
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid / Settled</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bill ID</th>
                <th className="py-3 px-4">Patient Name & ID</th>
                <th className="py-3 px-3 text-right">Consult. Fee</th>
                <th className="py-3 px-3 text-right">Meds</th>
                <th className="py-3 px-3 text-right">Ward/Room</th>
                <th className="py-3 px-3 text-right">Other/Lab</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No bills found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your search or create an invoice.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Bill ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                      {bill.id}
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{bill.patientName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{bill.patientId}</p>
                    </td>

                    {/* Breakdown columns */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                      ${bill.consultationFee}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                      ${bill.medicineCharges}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                      ${bill.roomCharges}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                      ${bill.otherCharges}
                    </td>

                    {/* Auto-calculated Total Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                      ${bill.totalAmount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          bill.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : bill.paymentStatus === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>

                    {/* Billing Date */}
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {bill.billingDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewInvoice(bill)}
                          className="p-1 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                          title="View & Print Official Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {bill.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => onMarkPaid(bill)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Mark as Settled / Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditBill(bill)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Bill Details"
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
          totalItems={filteredBills.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
