'use client';

import { useState } from 'react';
import {
  X,
  MapPin,
  Plus,
  AlertTriangle,
  Check,
  Minus,
  Trash2,
} from 'lucide-react';
import type { RegionalStock } from '@/types/brand-portal';

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  regionalStock: RegionalStock[];
  onSave: (stock: RegionalStock[]) => void;
}

const REGIONS = ['Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'];

export function StockManagementModal({
  isOpen,
  onClose,
  productName,
  regionalStock,
  onSave,
}: StockManagementModalProps) {
  const [editableStock, setEditableStock] = useState<RegionalStock[]>(() =>
    regionalStock.map(s => ({ ...s }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({ region: 'Europe', city: '', units: 0, threshold: 5 });

  if (!isOpen) return null;

  const totalUnits = editableStock.reduce((sum, s) => sum + s.units, 0);
  const lowStockCount = editableStock.filter(s => s.units <= s.lowStockThreshold).length;

  const handleUnitChange = (index: number, value: number) => {
    setEditableStock(prev => prev.map((s, i) =>
      i === index ? { ...s, units: Math.max(0, value), lastUpdated: new Date().toISOString() } : s
    ));
  };

  const handleThresholdChange = (index: number, value: number) => {
    setEditableStock(prev => prev.map((s, i) =>
      i === index ? { ...s, lowStockThreshold: Math.max(0, value) } : s
    ));
  };

  const handleRemoveRow = (index: number) => {
    setEditableStock(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    if (!newRow.city.trim()) return;
    const entry: RegionalStock = {
      region: newRow.region,
      city: newRow.city.trim(),
      units: Math.max(0, newRow.units),
      lowStockThreshold: Math.max(0, newRow.threshold),
      lastUpdated: new Date().toISOString(),
    };
    setEditableStock(prev => [...prev, entry]);
    setNewRow({ region: 'Europe', city: '', units: 0, threshold: 5 });
    setShowAddRow(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(editableStock);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-deep/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-sand/50">
          <div>
            <h2 className="font-display text-xl text-charcoal-deep">Manage Stock</h2>
            <p className="text-xs text-stone mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-parchment transition-colors"
          >
            <X size={18} className="text-stone" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-8 py-3 bg-parchment/50 border-b border-sand/30 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Total</span>
            <span className="text-sm font-medium text-charcoal-deep">{totalUnits} units</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Locations</span>
            <span className="text-sm font-medium text-charcoal-deep">{editableStock.length}</span>
          </div>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle size={14} />
              <span className="text-xs">{lowStockCount} below threshold</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stock Table */}
          {editableStock.length === 0 ? (
            <div className="text-center py-8">
              <MapPin size={32} className="text-taupe mx-auto mb-3" />
              <p className="text-sm text-stone">No stock locations configured</p>
              <p className="text-xs text-taupe mt-1">Add a location to get started</p>
            </div>
          ) : (
            <div className="space-y-0">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_1fr_100px_100px_40px] gap-3 pb-3 border-b border-sand/50">
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Region</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">City</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Units</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Threshold</span>
                <span />
              </div>

              {/* Rows */}
              {editableStock.map((stock, idx) => (
                <div
                  key={`${stock.region}-${stock.city}-${idx}`}
                  className="grid grid-cols-[1fr_1fr_100px_100px_40px] gap-3 py-3 border-b border-sand/20 items-center group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-taupe flex-shrink-0" />
                    <span className="text-sm text-charcoal-deep">{stock.region}</span>
                  </div>
                  <span className="text-sm text-charcoal-deep">{stock.city}</span>

                  {/* Units Stepper */}
                  <div className="flex items-center border border-sand">
                    <button
                      onClick={() => handleUnitChange(idx, stock.units - 1)}
                      className="px-2 py-1.5 hover:bg-parchment transition-colors"
                    >
                      <Minus size={12} className="text-stone" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={stock.units}
                      onChange={(e) => handleUnitChange(idx, parseInt(e.target.value, 10) || 0)}
                      className={`w-full text-center text-sm bg-transparent focus:outline-none py-1.5 ${
                        stock.units <= stock.lowStockThreshold ? 'text-warning font-medium' : 'text-charcoal-deep'
                      }`}
                    />
                    <button
                      onClick={() => handleUnitChange(idx, stock.units + 1)}
                      className="px-2 py-1.5 hover:bg-parchment transition-colors"
                    >
                      <Plus size={12} className="text-stone" />
                    </button>
                  </div>

                  {/* Threshold */}
                  <input
                    type="number"
                    min="0"
                    value={stock.lowStockThreshold}
                    onChange={(e) => handleThresholdChange(idx, parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-sm bg-transparent border border-sand py-1.5 focus:outline-none focus:border-charcoal-deep text-charcoal-deep"
                  />

                  {/* Delete */}
                  <button
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1.5 text-taupe hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove location"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Row */}
          {showAddRow ? (
            <div className="mt-4 p-4 border border-sand/50 bg-parchment/30 space-y-4">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone">Add Location</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">
                    Region
                  </label>
                  <select
                    value={newRow.region}
                    onChange={(e) => setNewRow(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep cursor-pointer"
                  >
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={newRow.city}
                    onChange={(e) => setNewRow(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Paris"
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">
                    Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newRow.units}
                    onChange={(e) => setNewRow(prev => ({ ...prev, units: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newRow.threshold}
                    onChange={(e) => setNewRow(prev => ({ ...prev, threshold: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddRow}
                  disabled={!newRow.city.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check size={14} /> Add
                </button>
                <button
                  onClick={() => setShowAddRow(false)}
                  className="px-5 py-2 text-xs tracking-wider uppercase text-stone hover:text-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddRow(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-sand text-xs tracking-[0.15em] uppercase text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors w-full justify-center"
            >
              <Plus size={14} /> Add Location
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-sand/50 flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs tracking-wider uppercase text-stone hover:text-charcoal-deep transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
