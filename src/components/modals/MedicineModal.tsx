import React, { useState, useEffect } from 'react';
import { Medicine } from '../../types';
import { X, Check } from 'lucide-react';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicineData: Omit<Medicine, 'id'> & { id?: string }) => Promise<void>;
  medicineToEdit?: Medicine | null;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicineToEdit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Antibiotics');
  const [quantity, setQuantity] = useState<number | ''>(50);
  const [unitPrice, setUnitPrice] = useState<number | ''>(10.0);
  const [expiryDate, setExpiryDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [dosage, setDosage] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicineToEdit) {
      setName(medicineToEdit.name);
      setCategory(medicineToEdit.category);
      setQuantity(medicineToEdit.quantity);
      setUnitPrice(medicineToEdit.unitPrice);
      setExpiryDate(medicineToEdit.expiryDate);
      setSupplier(medicineToEdit.supplier);
      setDosage(medicineToEdit.dosage || '');
      setBatchNumber(medicineToEdit.batchNumber || '');
    } else {
      setName('');
      setCategory('Antibiotics');
      setQuantity(100);
      setUnitPrice(12.50);
      setExpiryDate('2027-12-31');
      setSupplier('AstraZeneca Bio');
      setDosage('1 tab daily');
      setBatchNumber(`LOT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 89)}`);
    }
    setErrors({});
  }, [medicineToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Medicine name is required';
    if (quantity === '' || Number(quantity) < 0) errs.quantity = 'Valid quantity is required';
    if (unitPrice === '' || Number(unitPrice) < 0) errs.unitPrice = 'Valid unit price is required';
    if (!expiryDate) errs.expiryDate = 'Expiry date is required';
    if (!supplier.trim()) errs.supplier = 'Pharmaceutical supplier is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const qty = Number(quantity);
    const stockStatus = qty <= 10 ? 'Critical' : qty <= 25 ? 'Low Stock' : 'In Stock';

    try {
      await onSave({
        ...(medicineToEdit ? { id: medicineToEdit.id } : {}),
        name: name.trim(),
        category,
        quantity: qty,
        unitPrice: Number(unitPrice),
        expiryDate,
        supplier: supplier.trim(),
        stockStatus,
        dosage: dosage.trim(),
        batchNumber: batchNumber.trim()
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
              {medicineToEdit ? `Edit Medicine (${medicineToEdit.id})` : 'Add Pharmaceutical Inventory'}
            </h3>
            <p className="text-xs text-slate-500">
              Tracks quantity, expiry alerts, and pricing for the Medicines sheet.
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
            {/* Medicine Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name & Formulation *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amoxicillin 500mg"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Therapeutic Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Analgesics & Anti-emetic">Analgesics & Anti-emetic</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Intravenous">Intravenous</option>
                <option value="Vitamins & Minerals">Vitamins & Minerals</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                className={`w-full px-3 py-2 text-sm rounded-xl border tabular-nums ${
                  errors.quantity ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
              <p className="text-[11px] text-slate-400 mt-0.5">&le; 25 triggers low stock warning</p>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                className={`w-full px-3 py-2 text-sm rounded-xl border tabular-nums ${
                  errors.unitPrice ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.unitPrice && <p className="text-xs text-rose-600 mt-1">{errors.unitPrice}</p>}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.expiryDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.expiryDate && <p className="text-xs text-rose-600 mt-1">{errors.expiryDate}</p>}
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier / Manufacturer *
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. GlaxoSmithKline"
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.supplier ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-teal-500`}
              />
              {errors.supplier && <p className="text-xs text-rose-600 mt-1">{errors.supplier}</p>}
            </div>

            {/* Dosage Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 cap TDS after meals"
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
              <span>{isSubmitting ? 'Saving...' : medicineToEdit ? 'Update Medicine' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
