import React, { useState, useMemo } from 'react';
import { Medicine } from '../types';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Pagination } from '../components/common/Pagination';

interface PharmacyPageProps {
  medicines: Medicine[];
  onOpenAddModal: () => void;
  onEditMedicine: (medicine: Medicine) => void;
  onDeleteMedicinePrompt: (medicine: Medicine) => void;
  onQuickRestock: (medicine: Medicine, units: number) => void;
  onExportCSV: () => void;
}

export const PharmacyPage: React.FC<PharmacyPageProps> = ({
  medicines,
  onOpenAddModal,
  onEditMedicine,
  onDeleteMedicinePrompt,
  onQuickRestock,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Stats
  const lowStockCount = medicines.filter((m) => m.quantity <= 25 && m.quantity > 10).length;
  const criticalCount = medicines.filter((m) => m.quantity <= 10).length;
  const inStockCount = medicines.filter((m) => m.quantity > 25).length;
  const totalInventoryValue = medicines.reduce((acc, m) => acc + m.quantity * m.unitPrice, 0);

  const categories = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.category)));
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.supplier.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      const matchesStock =
        selectedStockStatus === 'ALL' || m.stockStatus === selectedStockStatus;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [medicines, searchQuery, selectedCategory, selectedStockStatus]);

  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMedicines.slice(start, start + pageSize);
  }, [filteredMedicines, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pharmacy & Medicine Inventory
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold tabular-nums">
              {medicines.length} Pharmaceutical SKUs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulation stock levels, unit pricing, suppliers, and expiration tracking (Medicines Excel sheet).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download Medicines sheet as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Inventory</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Low-Stock Warning Banner (If Any Critical / Low Stock Exists) */}
      {(criticalCount > 0 || lowStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Pharmacy Stock Warning Alert
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              There are <strong className="tabular-nums font-mono">{criticalCount}</strong> items at critical levels (&le;10 units) and{' '}
              <strong className="tabular-nums font-mono">{lowStockCount}</strong> items with low stock (&le;25 units). Please initiate purchase orders with suppliers immediately.
            </p>
          </div>
          <button
            onClick={() => setSelectedStockStatus('Critical')}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Filter Critical
          </button>
        </div>
      )}

      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Total Stock Units</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {medicines.reduce((a, b) => a + b.quantity, 0)}
          </p>
          <span className="text-[11px] text-slate-400">Across {medicines.length} formulations</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">In Stock Items</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {inStockCount}
          </p>
          <span className="text-[11px] text-slate-400">Adequate inventory buffer</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Low & Critical Items</span>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            {lowStockCount + criticalCount}
          </p>
          <span className="text-[11px] text-rose-500 font-medium">Re-order threshold triggered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 font-semibold">Inventory Valuation</span>
          <p className="text-2xl font-bold font-mono text-teal-700 mt-1 tabular-nums">
            ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">At wholesale unit cost</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search formulation, SKU, supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-slate-700"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="In Stock">In Stock (&gt;25 units)</option>
              <option value="Low Stock">Low Stock (&le;25 units)</option>
              <option value="Critical">Critical (&le;10 units)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medicine ID</th>
                <th className="py-3 px-4">Medicine Formulation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Stock Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No medicines found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your filters or add a new medicine to inventory.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map((med) => {
                  const isLow = med.quantity <= 25 && med.quantity > 10;
                  const isCrit = med.quantity <= 10;

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCrit ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                        {med.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        {med.dosage && (
                          <p className="text-[11px] text-slate-400">{med.dosage}</p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-700">{med.category}</td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded tabular-nums ${
                            isCrit
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'text-slate-800'
                          }`}
                        >
                          {med.quantity} Units
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-4 font-mono font-semibold text-right text-slate-800 tabular-nums">
                        ${med.unitPrice.toFixed(2)}
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                        {med.expiryDate}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4 text-slate-600">{med.supplier}</td>

                      {/* Stock Status Indicator */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            isCrit
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          {med.stockStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onQuickRestock(med, 50)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                            title="Quick Restock +50 units"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditMedicine(med)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMedicinePrompt(med)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredMedicines.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
