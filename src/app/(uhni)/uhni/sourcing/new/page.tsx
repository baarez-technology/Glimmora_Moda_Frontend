'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, CheckCircle, X, ChevronDown } from 'lucide-react';
import { getProductCategories, createSourcingRequest } from '@/services/sourcing.service';
import * as brandService from '@/services/brand.service';
import type { Brand } from '@/types';

interface SelectedBrand {
  id: string;
  name: string;
  logoUrl?: string;
}

export default function NewSourcingRequestPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Brand multi-select state
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    looking_for: '',
    product_category: '',
    description: '',
    budget: '',
    priority: 'standard' as 'standard' | 'urgent' | 'when_available',
    deadline: '',
    specifications: '',
    selectedBrands: [] as SelectedBrand[],
  });

  useEffect(() => {
    setIsLoaded(true);
    getProductCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    brandService.getAllBrands()
      .then(res => {
        if (res.success && res.data) setAllBrands(res.data);
      })
      .catch(() => {})
      .finally(() => setBrandsLoading(false));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.looking_for || !formData.product_category || !formData.description || !formData.budget) return;
    if (formData.selectedBrands.length === 0) {
      setError('Please select at least one brand partner to send the request to.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSourcingRequest({
        looking_for: formData.looking_for,
        product_category: formData.product_category,
        description: formData.description,
        budget: formData.budget,
        priority: formData.priority,
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
        specifications: formData.specifications,
        brand_ids: formData.selectedBrands.map(b => b.id),
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory-cream">
        <div className="bg-charcoal-deep">
          <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
            <div className="flex items-center gap-2 mb-4">
              <Search size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Private Request
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Sourcing Request
            </h1>
          </div>
        </div>
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-3">
              Sourcing Request Submitted
            </h2>
            <p className="text-stone max-w-md mx-auto mb-4">
              Your request has been sent to {formData.selectedBrands.length} brand partner{formData.selectedBrands.length !== 1 ? 's' : ''}.
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
              Brand partners will review your request and submit sourcing options — typically within 24-72 hours.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/uhni/sourcing"
                className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
              >
                View My Requests
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

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni/sourcing"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Sourcing
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Search size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Private Request
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Sourcing Request
            </h1>
            <p className="text-sand mt-3">Tell us what you&apos;re looking for and select the brand partners to source from</p>
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
          {/* What are you looking for */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              What are you looking for? *
            </label>
            <input
              type="text"
              value={formData.looking_for}
              onChange={(e) => setFormData(prev => ({ ...prev, looking_for: e.target.value }))}
              placeholder="e.g., Hermès Birkin 25 in Gold Togo"
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              required
            />
          </div>

          {/* Brand Partners — Multi-select */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Send Request To (Brand Partners) *
            </label>
            <p className="text-xs text-stone mb-3">
              Select which brand partners should receive this sourcing request. They will review and submit options for you.
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

            {/* Brand search dropdown */}
            <div ref={brandRef} className="relative">
              <div
                className="flex items-center bg-white border border-sand focus-within:border-charcoal-deep transition-colors cursor-text"
                onClick={() => setBrandDropdownOpen(true)}
              >
                <Search size={16} className="text-taupe ml-5 flex-shrink-0" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setBrandDropdownOpen(true);
                  }}
                  onFocus={() => setBrandDropdownOpen(true)}
                  placeholder={brandsLoading ? 'Loading brands...' : 'Search brand partners...'}
                  disabled={brandsLoading}
                  className="w-full px-3 py-4 bg-transparent text-charcoal-deep placeholder:text-taupe focus:outline-none"
                />
                <ChevronDown size={16} className={`text-taupe mr-5 flex-shrink-0 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {brandDropdownOpen && (
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

          {/* Category — from API */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Product Category *
            </label>
            <select
              value={formData.product_category}
              onChange={(e) => setFormData(prev => ({ ...prev, product_category: e.target.value }))}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the item in detail — style, era, condition..."
              rows={4}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Budget *
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone">&euro;</span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0"
                className="w-full pl-10 pr-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'standard', label: 'Standard', desc: 'Within your preferred timeline' },
                { value: 'urgent', label: 'Urgent', desc: 'Required within 2 weeks' },
                { value: 'when_available', label: 'When Available', desc: 'No time pressure, find the perfect piece' },
              ] as const).map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                  className={`p-4 text-left border transition-colors ${
                    formData.priority === p.value
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand bg-white hover:border-charcoal-deep/50'
                  }`}
                >
                  <p className="text-sm font-medium text-charcoal-deep">{p.label}</p>
                  <p className="text-xs text-stone mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Requested Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
            />
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Specifications (Optional)
            </label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Size, material, color, condition requirements..."
              rows={3}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-sand">
            <div className="flex items-center justify-between">
              <div>
                {formData.selectedBrands.length > 0 && (
                  <p className="text-xs text-stone">
                    Sending to {formData.selectedBrands.length} brand{formData.selectedBrands.length !== 1 ? 's' : ''}:{' '}
                    {formData.selectedBrands.map(b => b.name).join(', ')}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || !formData.looking_for || !formData.product_category || !formData.description || !formData.budget || formData.selectedBrands.length === 0}
                className="px-8 py-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
