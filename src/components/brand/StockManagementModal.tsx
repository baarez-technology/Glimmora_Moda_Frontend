'use client';

import { useState, useRef, useCallback } from 'react';
import {
  X,
  MapPin,
  Plus,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Check,
  Minus,
  Trash2,
  Download
} from 'lucide-react';
import type { RegionalStock } from '@/types/brand-portal';

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  regionalStock: RegionalStock[];
  onSave: (stock: RegionalStock[]) => void;
}

type ModalTab = 'manual' | 'import';

interface ImportResult {
  success: number;
  errors: string[];
  data: RegionalStock[];
}

const REGIONS = ['Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'];

const SAMPLE_CSV = `region,city,units,lowStockThreshold
Europe,Paris,25,5
Europe,Milan,18,5
Asia,Tokyo,12,5
Americas,New York,20,5`;

export function StockManagementModal({
  isOpen,
  onClose,
  productName,
  regionalStock,
  onSave,
}: StockManagementModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('manual');
  const [editableStock, setEditableStock] = useState<RegionalStock[]>(() =>
    regionalStock.map(s => ({ ...s }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({ region: 'Europe', city: '', units: 0, threshold: 5 });

  // Import state
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV parsing — must be above the early return to respect Rules of Hooks
  const parseCSV = useCallback((text: string): ImportResult => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      return { success: 0, errors: ['File is empty or missing data rows'], data: [] };
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const regionIdx = header.indexOf('region');
    const cityIdx = header.indexOf('city');
    const unitsIdx = header.indexOf('units');
    const thresholdIdx = header.findIndex(h => h.includes('threshold'));

    if (regionIdx === -1 || cityIdx === -1 || unitsIdx === -1) {
      return {
        success: 0,
        errors: ['CSV must contain columns: region, city, units (and optionally lowStockThreshold)'],
        data: [],
      };
    }

    const parsed: RegionalStock[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 3 || cols.every(c => c === '')) continue;

      const region = cols[regionIdx];
      const city = cols[cityIdx];
      const units = parseInt(cols[unitsIdx], 10);
      const threshold = thresholdIdx !== -1 ? parseInt(cols[thresholdIdx], 10) : 5;

      if (!region || !city) {
        errors.push(`Row ${i + 1}: Missing region or city`);
        continue;
      }
      if (isNaN(units) || units < 0) {
        errors.push(`Row ${i + 1}: Invalid units value "${cols[unitsIdx]}"`);
        continue;
      }

      parsed.push({
        region,
        city,
        units,
        lowStockThreshold: isNaN(threshold) ? 5 : Math.max(0, threshold),
        lastUpdated: new Date().toISOString(),
      });
    }

    return { success: parsed.length, errors, data: parsed };
  }, []);

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

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setImportResult({ success: 0, errors: ['Please upload a CSV file (.csv)'], data: [] });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setImportResult(result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleApplyImport = () => {
    if (!importResult?.data.length) return;
    setEditableStock(importResult.data);
    setImportResult(null);
    setActiveTab('manual');
  };

  const handleMergeImport = () => {
    if (!importResult?.data.length) return;
    setEditableStock(prev => {
      const merged = [...prev];
      for (const imported of importResult.data) {
        const existing = merged.findIndex(
          s => s.region === imported.region && s.city === imported.city
        );
        if (existing !== -1) {
          merged[existing] = { ...imported };
        } else {
          merged.push(imported);
        }
      }
      return merged;
    });
    setImportResult(null);
    setActiveTab('manual');
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock-template.csv';
    a.click();
    URL.revokeObjectURL(url);
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

        {/* Tabs */}
        <div className="px-8 pt-4 flex gap-0 border-b border-sand/50">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-5 py-3 text-xs tracking-[0.15em] uppercase border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-charcoal-deep text-charcoal-deep'
                : 'border-transparent text-stone hover:text-charcoal-deep'
            }`}
          >
            Manual Update
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-5 py-3 text-xs tracking-[0.15em] uppercase border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-charcoal-deep text-charcoal-deep'
                : 'border-transparent text-stone hover:text-charcoal-deep'
            }`}
          >
            Import File
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'manual' ? (
            <div className="p-8">
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
          ) : (
            /* Import Tab */
            <div className="p-8 space-y-6">
              {/* Download Template */}
              <div className="flex items-center justify-between p-4 border border-sand/50 bg-parchment/20">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} className="text-stone" />
                  <div>
                    <p className="text-sm text-charcoal-deep">CSV Template</p>
                    <p className="text-xs text-taupe">Download a pre-formatted template</p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-sand text-xs tracking-wider uppercase text-charcoal-deep hover:bg-parchment transition-colors"
                >
                  <Download size={14} /> Download
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-charcoal-deep bg-parchment/50'
                    : 'border-sand hover:border-charcoal-deep/50 hover:bg-parchment/20'
                }`}
              >
                <Upload size={28} className={`mx-auto mb-3 ${isDragOver ? 'text-charcoal-deep' : 'text-taupe'}`} />
                <p className="text-sm text-charcoal-deep mb-1">
                  {isDragOver ? 'Drop file here' : 'Drag and drop a CSV file'}
                </p>
                <p className="text-xs text-taupe">or click to browse files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = '';
                  }}
                />
              </div>

              {/* Import Results */}
              {importResult && (
                <div className="space-y-4">
                  {/* Status */}
                  <div className={`p-4 border ${
                    importResult.errors.length > 0 && importResult.success === 0
                      ? 'border-error/30 bg-error/5'
                      : importResult.errors.length > 0
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-success/30 bg-success/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {importResult.success > 0 ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <AlertTriangle size={16} className="text-error" />
                      )}
                      <span className="text-sm font-medium text-charcoal-deep">
                        {importResult.success} row{importResult.success !== 1 ? 's' : ''} parsed successfully
                      </span>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {importResult.errors.map((err, i) => (
                          <p key={i} className="text-xs text-error">{err}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  {importResult.data.length > 0 && (
                    <div className="border border-sand/50">
                      <div className="px-4 py-3 bg-parchment/30 border-b border-sand/30">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-stone">Preview</p>
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-sand/20">
                        {importResult.data.map((row, i) => (
                          <div key={i} className="px-4 py-2 flex items-center justify-between text-sm">
                            <span className="text-charcoal-deep">{row.region} — {row.city}</span>
                            <span className={`font-medium ${
                              row.units <= row.lowStockThreshold ? 'text-warning' : 'text-charcoal-deep'
                            }`}>
                              {row.units} units
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply Actions */}
                  {importResult.data.length > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleApplyImport}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors"
                      >
                        Replace All Stock
                      </button>
                      <button
                        onClick={handleMergeImport}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-sand text-xs tracking-wider uppercase text-charcoal-deep hover:bg-parchment transition-colors"
                      >
                        Merge with Existing
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Format Guide */}
              <div className="text-xs text-taupe space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-stone">Required Format</p>
                <div className="font-mono text-[11px] bg-parchment/40 p-3 border border-sand/30">
                  <p>region,city,units,lowStockThreshold</p>
                  <p className="text-stone">Europe,Paris,25,5</p>
                  <p className="text-stone">Asia,Tokyo,12,5</p>
                </div>
              </div>
            </div>
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
