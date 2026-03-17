'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Check, Ruler, Palette, Scissors,
  Crown, X, Search, ChevronDown, CheckCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getAllBrands as getBackendBrands } from '@/services/recommendation.service';
import type { Brand } from '@/types';
import type { BespokeDetailedSpec } from '@/types';

type OrderType = 'made_to_measure' | 'custom_design' | 'modification';

interface SelectedBrand {
  id: string;
  name: string;
  logoUrl?: string;
}

interface FormData {
  title: string;
  type: OrderType | '';
  description: string;
  estimatedBudget: number;
  requestedDeadline: string;
  selectedBrands: SelectedBrand[];
  spec: BespokeDetailedSpec;
}

const initialSpec: BespokeDetailedSpec = {
  measurements: {},
  fabricPreferences: '',
  colorPreferences: '',
  occasionContext: '',
  specialInstructions: '',
};

const initialForm: FormData = {
  title: '',
  type: '',
  description: '',
  estimatedBudget: 0,
  requestedDeadline: '',
  selectedBrands: [],
  spec: initialSpec,
};

export default function NewBespokeOrderPage() {
  const { isUHNI, createBespokeOrder } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Brand loading state
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Load brands from backend API
  const loadBrands = useCallback(async () => {
    setBrandsLoading(true);
    setBrandsError(null);
    try {
      const brands = await getBackendBrands();
      if (brands.length > 0) {
        setAllBrands(brands);
      } else {
        setBrandsError('No brands available. Please try again.');
      }
    } catch {
      setBrandsError('Failed to load brands. Please check your connection and try again.');
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Close brand dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter brands by search
  const filteredBrands = allBrands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()) &&
    !formData.selectedBrands.some(sb => sb.id === b.id)
  );

  const addBrand = (brand: Brand) => {
    setFormData(prev => ({
      ...prev,
      selectedBrands: [...prev.selectedBrands, { id: brand.id, name: brand.name, logoUrl: brand.logoUrl }],
    }));
    setBrandSearch('');
    setBrandDropdownOpen(false);
  };

  const removeBrand = (brandId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.filter(b => b.id !== brandId),
    }));
  };

  const updateMeasurement = (key: string, value: string) => {
    const num = value === '' ? undefined : Number(value);
    setFormData(prev => ({
      ...prev,
      spec: {
        ...prev.spec,
        measurements: { ...prev.spec.measurements, [key]: num },
      },
    }));
  };

  if (!isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center p-8">
        <div className="text-center">
          <Crown size={48} className="mx-auto text-taupe mb-4" />
          <p className="text-stone">This feature is available to UHNI members only.</p>
          <Link href="/uhni" className="mt-4 inline-block text-sm text-gold-muted hover:text-gold-deep transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const typeOptions: { value: OrderType; label: string; desc: string; icon: typeof Ruler }[] = [
    { value: 'made_to_measure', label: 'Made to Measure', desc: 'Your exact measurements applied to an existing design', icon: Ruler },
    { value: 'custom_design', label: 'Custom Design', desc: 'Original piece designed from scratch for you', icon: Palette },
    { value: 'modification', label: 'Modification', desc: 'Alterations or customisation to an existing piece', icon: Scissors },
  ];

  const measurementFields = [
    { key: 'chest', label: 'Chest (cm)' },
    { key: 'waist', label: 'Waist (cm)' },
    { key: 'hips', label: 'Hips (cm)' },
    { key: 'shoulders', label: 'Shoulders (cm)' },
    { key: 'inseam', label: 'Inseam (cm)' },
    { key: 'sleeveLength', label: 'Sleeve Length (cm)' },
    { key: 'height', label: 'Height (cm)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Title is required'); return; }
    if (!formData.type) { setError('Please select an order type'); return; }
    if (formData.selectedBrands.length === 0) { setError('Please select at least one brand'); return; }
    if (formData.estimatedBudget <= 0) { setError('Please enter an estimated budget'); return; }

    setSubmitting(true);
    setError(null);
    try {
      createBespokeOrder({
        title: formData.title,
        type: formData.type as OrderType,
        description: formData.description,
        detailedSpec: formData.spec,
        estimatedBudget: formData.estimatedBudget,
        requestedDeadline: formData.requestedDeadline || undefined,
        selectedBrands: formData.selectedBrands.map(b => ({ id: b.id, name: b.name })),
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory-cream">
        <div className="bg-charcoal-deep">
          <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Bespoke Commission
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Bespoke Order
            </h1>
          </div>
        </div>
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-3">
              Bespoke Request Submitted
            </h2>
            <p className="text-stone max-w-md mx-auto mb-4">
              Commission sent to {formData.selectedBrands.length === 1
                ? formData.selectedBrands[0].name
                : `${formData.selectedBrands.length} brands`
              }
            </p>
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {formData.selectedBrands.map(b => (
                <span key={b.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-parchment border border-sand/50 text-sm text-charcoal-deep">
                  {b.logoUrl && (
                    <Image src={b.logoUrl} alt={b.name} width={16} height={16} className="object-contain" />
                  )}
                  {b.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-taupe mb-10">
              Our atelier team will review your request and contact you within 48 hours to arrange your initial consultation.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/uhni/bespoke"
                className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/uhni"
                className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ──
  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni/bespoke"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Bespoke Orders
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Bespoke Commission
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Bespoke Order
            </h1>
            <p className="text-sand mt-3">Design your vision and select the brand partners to commission</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              What would you like made? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Custom Evening Gown, Bespoke Tailored Suit"
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              required
            />
          </div>

          {/* Brand Partners — same pattern as sourcing page */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Commission Brand(s) *
            </label>
            <p className="text-xs text-stone mb-3">
              Select which brand partners should receive this bespoke commission. They will review and arrange a consultation.
            </p>

            {/* Selected brands as tags */}
            {formData.selectedBrands.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.selectedBrands.map(brand => (
                  <span
                    key={brand.id}
                    className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-charcoal-deep text-ivory-cream text-sm"
                  >
                    {brand.logoUrl && (
                      <Image src={brand.logoUrl} alt={brand.name} width={14} height={14} className="object-contain brightness-0 invert" />
                    )}
                    {brand.name}
                    <button
                      type="button"
                      onClick={() => removeBrand(brand.id)}
                      className="p-0.5 hover:bg-ivory-cream/20 transition-colors rounded-sm"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Error state */}
            {brandsError && (
              <div className="p-3 bg-error/5 border border-error/20 flex items-center justify-between gap-3 mb-3">
                <p className="text-sm text-error">{brandsError}</p>
                <button
                  type="button"
                  onClick={loadBrands}
                  className="px-3 py-1.5 text-xs tracking-[0.1em] uppercase border border-error/30 text-error hover:bg-error/10 transition-colors flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Brand search dropdown */}
            <div ref={brandRef} className="relative">
              <div
                className="flex items-center bg-white border border-sand focus-within:border-charcoal-deep transition-colors cursor-text"
                onClick={() => !brandsLoading && !brandsError && setBrandDropdownOpen(true)}
              >
                <Search size={16} className="text-taupe ml-5 flex-shrink-0" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setBrandDropdownOpen(true);
                  }}
                  onFocus={() => !brandsError && setBrandDropdownOpen(true)}
                  placeholder={brandsLoading ? 'Loading brands...' : brandsError ? 'Brands unavailable' : 'Search brand partners...'}
                  disabled={brandsLoading || !!brandsError}
                  className="w-full px-3 py-4 bg-transparent text-charcoal-deep placeholder:text-taupe focus:outline-none"
                />
                <ChevronDown size={16} className={`text-taupe mr-5 flex-shrink-0 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {brandDropdownOpen && !brandsLoading && !brandsError && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-sand shadow-lg max-h-[280px] overflow-y-auto">
                  {filteredBrands.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-stone">
                      {brandSearch ? 'No matching brands found' : 'All brands selected'}
                    </div>
                  ) : (
                    filteredBrands.map(brand => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => addBrand(brand)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-parchment transition-colors text-left"
                      >
                        {brand.logoUrl ? (
                          <Image src={brand.logoUrl} alt={brand.name} width={24} height={24} className="object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 bg-parchment flex items-center justify-center flex-shrink-0 text-[10px] font-medium text-stone">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep font-medium">{brand.name}</p>
                          {brand.heritage?.origin && (
                            <p className="text-[10px] text-taupe">{brand.heritage.origin}</p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Order Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {typeOptions.map(opt => {
                const Icon = opt.icon;
                const selected = formData.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: opt.value }))}
                    className={`p-6 border text-left transition-colors ${
                      selected
                        ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                        : 'border-sand bg-white hover:border-charcoal-deep'
                    }`}
                  >
                    <Icon size={24} className={`mb-3 ${selected ? 'text-gold-soft' : 'text-stone'}`} />
                    <p className={`text-sm font-medium mb-1 ${selected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                      {opt.label}
                    </p>
                    <p className={`text-xs ${selected ? 'text-sand' : 'text-taupe'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Describe your vision, inspiration, references..."
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
            />
          </div>

          {/* Budget & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Estimated Budget *
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone">&euro;</span>
                <input
                  type="number"
                  min={0}
                  value={formData.estimatedBudget || ''}
                  onChange={e => setFormData(prev => ({ ...prev, estimatedBudget: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full pl-10 pr-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Requested Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.requestedDeadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setFormData(prev => ({ ...prev, requestedDeadline: e.target.value }))}
                className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
          </div>

          {/* Measurements (optional) */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Body Measurements (Optional)
            </label>
            <p className="text-xs text-stone mb-4">
              Measurements are optional — your concierge will arrange a fitting consultation after your request is reviewed.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {measurementFields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-stone mb-1">{field.label}</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.spec.measurements?.[field.key as keyof typeof formData.spec.measurements] ?? ''}
                    onChange={e => updateMeasurement(field.key, e.target.value)}
                    placeholder="—"
                    className="w-full px-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Design Preferences (optional) */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Design Preferences (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone mb-1">Fabric Preferences</label>
                <input
                  type="text"
                  value={formData.spec.fabricPreferences || ''}
                  onChange={e => setFormData(prev => ({ ...prev, spec: { ...prev.spec, fabricPreferences: e.target.value } }))}
                  placeholder="Silk, cashmere, avoid synthetics..."
                  className="w-full px-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-stone mb-1">Color Preferences</label>
                <input
                  type="text"
                  value={formData.spec.colorPreferences || ''}
                  onChange={e => setFormData(prev => ({ ...prev, spec: { ...prev.spec, colorPreferences: e.target.value } }))}
                  placeholder="Deep navy, champagne..."
                  className="w-full px-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-stone mb-1">Occasion</label>
                <input
                  type="text"
                  value={formData.spec.occasionContext || ''}
                  onChange={e => setFormData(prev => ({ ...prev, spec: { ...prev.spec, occasionContext: e.target.value } }))}
                  placeholder="Black tie gala, wedding, business..."
                  className="w-full px-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-stone mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={formData.spec.specialInstructions || ''}
                  onChange={e => setFormData(prev => ({ ...prev, spec: { ...prev.spec, specialInstructions: e.target.value } }))}
                  placeholder="Any special requirements..."
                  className="w-full px-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-sand">
            <div className="flex items-center justify-between">
              <div>
                {formData.selectedBrands.length > 0 && (
                  <p className="text-xs text-stone">
                    Commissioning {formData.selectedBrands.length} brand{formData.selectedBrands.length !== 1 ? 's' : ''}:{' '}
                    {formData.selectedBrands.map(b => b.name).join(', ')}
                  </p>
                )}
                {formData.estimatedBudget > 0 && (
                  <p className="text-xs text-taupe mt-1">
                    50% deposit (~&euro;{Math.round(formData.estimatedBudget / 2).toLocaleString()}) required upon design approval
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || !formData.title || !formData.type || formData.selectedBrands.length === 0 || formData.estimatedBudget <= 0}
                className="px-8 py-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Check size={16} />
                {submitting ? 'Submitting...' : 'Submit Commission'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
