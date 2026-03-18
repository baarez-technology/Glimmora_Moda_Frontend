'use client';

import { useState, useEffect, useCallback } from 'react';
import { Archive, Clock, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import { createHeritageAsset, updateHeritageAsset, deleteHeritageAsset } from '@/services/brand-intelligence.service';
import type { HeritageAsset, DigitalStatus } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

const SIGNIFICANCE_OPTIONS = ['iconic', 'important', 'notable', 'standard'] as const;
const DIGITAL_STATUS_OPTIONS = ['not_started', 'scanning', 'processing', 'complete'] as const;

const emptyForm = {
  name: '', era: '', year: '', significance: 'notable' as string,
  description: '', digital_status: 'not_started' as string, image: '', condition_notes: '',
};

export default function HeritagePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadAssets = useCallback(() => {
    setIsLoading(true);
    brandIntelligenceService.getHeritageAssets().then(res => {
      if (res.data) setAssets(Array.isArray(res.data) ? res.data : []);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (asset: HeritageAsset) => {
    setForm({
      name: asset.name, era: asset.era, year: asset.year?.toString() || '',
      significance: asset.significance, description: asset.description,
      digital_status: asset.digitalStatus, image: asset.image || '', condition_notes: '',
    });
    setEditingId(asset.assetId);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.era || !form.description) return;
    setSubmitting(true);

    if (editingId) {
      const success = await updateHeritageAsset(editingId, {
        name: form.name, era: form.era,
        year: form.year ? parseInt(form.year) : null,
        significance: form.significance, description: form.description,
        digital_status: form.digital_status, image: form.image || null,
        condition_notes: form.condition_notes || null,
      });
      if (success) {
        setAssets(prev => prev.map(a => a.assetId === editingId ? {
          ...a, name: form.name, era: form.era,
          year: form.year ? parseInt(form.year) : undefined,
          significance: form.significance as HeritageAsset['significance'],
          description: form.description,
          digitalStatus: form.digital_status as DigitalStatus,
          image: form.image || undefined,
        } : a));
      }
    } else {
      const result = await createHeritageAsset({
        name: form.name, era: form.era,
        year: form.year ? parseInt(form.year) : undefined,
        significance: form.significance, description: form.description,
        digital_status: form.digital_status, image: form.image || undefined,
        condition_notes: form.condition_notes || undefined,
      });
      if (result) loadAssets();
    }
    resetForm();
    setSubmitting(false);
  };

  const handleDelete = async (assetId: string) => {
    const success = await deleteHeritageAsset(assetId);
    if (success) setAssets(prev => prev.filter(a => a.assetId !== assetId));
    setDeleteConfirm(null);
  };

  const totalAssets = assets.length;
  const iconicCount = assets.filter(a => a.significance === 'iconic').length;
  const avgPreservation = totalAssets > 0
    ? (assets.reduce((sum, a) => sum + a.preservationScore, 0) / totalAssets).toFixed(1)
    : '0';
  const completeDigitization = assets.filter(a => a.digitalStatus === 'complete').length;

  const getSignificanceBadge = (significance: HeritageAsset['significance']) => {
    switch (significance) {
      case 'iconic': return 'bg-purple-100 text-purple-700';
      case 'important': return 'bg-blue-100 text-blue-700';
      case 'notable': return 'bg-amber-100 text-amber-700';
      case 'standard': return 'bg-stone/10 text-stone';
    }
  };

  const getDigitalStatusBadge = (status: DigitalStatus) => {
    switch (status) {
      case 'not_started': return { className: 'bg-stone/10 text-stone', label: 'Not Started' };
      case 'scanning': return { className: 'bg-blue-100 text-blue-700', label: 'Scanning' };
      case 'processing': return { className: 'bg-amber-100 text-amber-700', label: 'Processing' };
      case 'complete': return { className: 'bg-green-100 text-green-700', label: 'Complete' };
    }
  };

  return (
    <IntelligencePageWrapper
      title="Heritage Preservation AI"
      subtitle="Catalog, preserve, and digitize brand heritage assets with AI assistance"
      acronym="HPAI™"
      isLoading={isLoading}
    >
      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Assets</p>
            <p className="font-display text-2xl text-charcoal-deep">{totalAssets}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Iconic Assets</p>
            <p className="font-display text-2xl text-charcoal-deep">{iconicCount}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Preservation Score</p>
            <p className="font-display text-2xl text-charcoal-deep">{avgPreservation}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Digitization Complete</p>
            <p className="font-display text-2xl text-charcoal-deep">{completeDigitization}</p>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white border border-sand/50">
          <button
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-parchment/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-charcoal-deep" />
              <span className="text-sm font-medium text-charcoal-deep">
                {editingId ? 'Edit Heritage Asset' : 'Add New Heritage Asset'}
              </span>
            </div>
            {showForm && <X size={16} className="text-stone" />}
          </button>
          {showForm && (
            <div className="px-6 pb-6 border-t border-sand/30 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Name *</label>
                  <input
                    type="text" value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Original Bar Jacket Pattern"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Era *</label>
                  <input
                    type="text" value={form.era}
                    onChange={e => setForm(prev => ({ ...prev, era: e.target.value }))}
                    placeholder="e.g., Post-War New Look"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Year</label>
                  <input
                    type="number" value={form.year}
                    onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="1947"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Significance *</label>
                  <select
                    value={form.significance}
                    onChange={e => setForm(prev => ({ ...prev, significance: e.target.value }))}
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep"
                  >
                    {SIGNIFICANCE_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Digital Status</label>
                  <select
                    value={form.digital_status}
                    onChange={e => setForm(prev => ({ ...prev, digital_status: e.target.value }))}
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep"
                  >
                    {DIGITAL_STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Image URL</label>
                  <input
                    type="text" value={form.image}
                    onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Description *</label>
                <textarea
                  value={form.description} rows={3}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the asset and its significance..."
                  className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Condition Notes</label>
                <textarea
                  value={form.condition_notes} rows={2}
                  onChange={e => setForm(prev => ({ ...prev, condition_notes: e.target.value }))}
                  placeholder="Current physical condition, any damage or wear..."
                  className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.era || !form.description}
                  className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Asset' : 'Add Asset'}
                </button>
                <button onClick={resetForm} className="px-6 py-3 border border-sand text-stone text-xs tracking-[0.15em] uppercase hover:border-charcoal-deep transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Asset Cards */}
        {assets.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <Archive size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No heritage assets found</p>
            <p className="text-xs text-taupe mt-1">Add your first heritage asset above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map(asset => {
              const digitalStatus = getDigitalStatusBadge(asset.digitalStatus);
              return (
                <div key={asset.assetId} className="bg-white border border-sand/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Archive size={18} className="text-stone" />
                        <h3 className="font-display text-lg text-charcoal-deep">{asset.name}</h3>
                        <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${getSignificanceBadge(asset.significance)}`}>
                          {asset.significance}
                        </span>
                        <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${digitalStatus.className}`}>
                          {digitalStatus.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone">
                        <span>{asset.era}</span>
                        {asset.year && <><span>&middot;</span><span>{asset.year}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {asset.lastInspection && (
                        <span className="flex items-center gap-1 text-xs text-stone mr-3">
                          <Clock size={12} />
                          {new Date(asset.lastInspection).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(asset)}
                        className="p-2 text-stone hover:text-charcoal-deep hover:bg-parchment transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === asset.assetId ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(asset.assetId)}
                            className="px-3 py-1 bg-error text-ivory-cream text-xs hover:bg-error/80 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 border border-sand text-stone text-xs hover:border-charcoal-deep transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(asset.assetId)}
                          className="p-2 text-stone hover:text-error hover:bg-error/5 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-stone mb-4">{asset.description}</p>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Preservation Score</span>
                      <span className="text-sm font-medium text-charcoal-deep">{asset.preservationScore}%</span>
                    </div>
                    <div className="h-2 bg-parchment overflow-hidden">
                      <div className="h-full bg-charcoal-deep transition-all" style={{ width: `${asset.preservationScore}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </IntelligencePageWrapper>
  );
}
