'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, X, Check, Package, SlidersHorizontal } from 'lucide-react';
import type { ProductListItem } from '@/services/brand-story.service';

interface StoryProductPickerProps {
  products: ProductListItem[];
  selectedIds: string[];
  onToggle: (productId: string) => void;
  isLoading?: boolean;
}

function formatPrice(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Product card with image error fallback ─────────────────────────────────

interface ProductCardProps {
  product: ProductListItem;
  isSelected: boolean;
  onToggle: () => void;
}

function ProductCard({ product, isSelected, onToggle }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!product.image_url && !imgFailed;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-start gap-1.5 p-2 border text-left transition-colors ${
        isSelected
          ? 'border-charcoal-deep bg-parchment'
          : 'border-sand hover:border-charcoal-deep/40 hover:bg-parchment/20'
      }`}
    >
      {isSelected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-charcoal-deep flex items-center justify-center z-10">
          <Check size={10} className="text-white" />
        </span>
      )}

      {/* Product image */}
      <div className="w-full aspect-square bg-parchment overflow-hidden relative">
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-parchment">
            <Package size={18} className="text-taupe/40" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className={`text-xs leading-tight line-clamp-2 w-full ${isSelected ? 'text-charcoal-deep font-medium' : 'text-stone'}`}>
        {product.product_name}
      </p>

      {/* Price — always returned by API */}
      <p className={`text-[11px] font-medium ${isSelected ? 'text-gold-muted' : 'text-charcoal-deep/70'}`}>
        {formatPrice(product.price)}
      </p>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function StoryProductPicker({
  products,
  selectedIds,
  onToggle,
  isLoading = false,
}: StoryProductPickerProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Compute absolute bounds from product data
  // price is always returned by the API, so hasPriceData is true whenever products exist
  const { absMin, absMax, hasPriceData } = useMemo(() => {
    if (products.length === 0) return { absMin: 0, absMax: 0, hasPriceData: false };
    const prices = products.map(p => p.price);
    return {
      absMin: Math.floor(Math.min(...prices)),
      absMax: Math.ceil(Math.max(...prices)),
      hasPriceData: true,
    };
  }, [products]);

  // Slider state — initialise to full range
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');

  // Reset slider bounds when products load
  useEffect(() => {
    if (hasPriceData) {
      setSliderMin(absMin);
      setSliderMax(absMax);
      setInputMin('');
      setInputMax('');
    }
  }, [absMin, absMax, hasPriceData]);

  const activeMin = inputMin !== '' ? parseFloat(inputMin) : null;
  const activeMax = inputMax !== '' ? parseFloat(inputMax) : null;

  // Track fill percentages for gradient
  const range = absMax - absMin || 1;
  const leftPct = ((sliderMin - absMin) / range) * 100;
  const rightPct = 100 - ((sliderMax - absMin) / range) * 100;

  const handleSliderMin = useCallback((val: number) => {
    const clamped = Math.min(val, sliderMax - 1);
    setSliderMin(clamped);
    setInputMin(clamped === absMin ? '' : String(clamped));
  }, [sliderMax, absMin]);

  const handleSliderMax = useCallback((val: number) => {
    const clamped = Math.max(val, sliderMin + 1);
    setSliderMax(clamped);
    setInputMax(clamped === absMax ? '' : String(clamped));
  }, [sliderMin, absMax]);

  const handleInputMin = (raw: string) => {
    setInputMin(raw);
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= absMin && v < sliderMax) setSliderMin(v);
  };

  const handleInputMax = (raw: string) => {
    setInputMax(raw);
    const v = parseFloat(raw);
    if (!isNaN(v) && v <= absMax && v > sliderMin) setSliderMax(v);
  };

  const clearFilters = () => {
    setSearch('');
    setSliderMin(absMin);
    setSliderMax(absMax);
    setInputMin('');
    setInputMax('');
  };

  const isPriceFiltered = hasPriceData && (sliderMin > absMin || sliderMax < absMax);
  const hasActiveFilters = search.trim() !== '' || isPriceFiltered;

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search.trim() ||
        p.product_name.toLowerCase().includes(search.toLowerCase());

      const price = p.price ?? null;
      const minVal = activeMin ?? (isPriceFiltered ? sliderMin : null);
      const maxVal = activeMax ?? (isPriceFiltered ? sliderMax : null);

      const matchesMin = minVal === null || price === null || price >= minVal;
      const matchesMax = maxVal === null || price === null || price <= maxVal;

      return matchesSearch && matchesMin && matchesMax;
    });
  }, [products, search, sliderMin, sliderMax, activeMin, activeMax, isPriceFiltered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-5 h-5 border-2 border-taupe border-t-charcoal-deep rounded-full" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Package size={32} className="text-taupe/40 mb-3" />
        <p className="text-sm text-stone font-medium">No products available</p>
        <p className="text-xs text-taupe mt-1">Add products to your brand to attach them to stories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + filter toggle bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-8 pr-3 py-2 border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {hasPriceData && (
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 border text-xs tracking-wide transition-colors whitespace-nowrap ${
              showFilters || isPriceFiltered
                ? 'border-charcoal-deep text-charcoal-deep bg-parchment'
                : 'border-sand text-stone hover:border-charcoal-deep/50'
            }`}
          >
            <SlidersHorizontal size={13} />
            Budget
            {isPriceFiltered && (
              <span className="w-1.5 h-1.5 rounded-full bg-gold-muted ml-0.5" />
            )}
          </button>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            title="Clear all filters"
            className="flex items-center gap-1 px-2 py-2 text-xs text-taupe hover:text-red-500 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Budget filter panel */}
      {showFilters && hasPriceData && (
        <div className="p-4 bg-parchment/40 border border-sand/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.15em] uppercase text-taupe font-medium">Budget Range</span>
            {isPriceFiltered && (
              <button
                type="button"
                onClick={() => { setSliderMin(absMin); setSliderMax(absMax); setInputMin(''); setInputMax(''); }}
                className="text-[10px] text-taupe hover:text-red-500 underline transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Current range label */}
          <div className="flex items-center justify-between text-xs text-charcoal-deep font-medium">
            <span>{formatPrice(sliderMin)}</span>
            <span className="text-taupe text-[10px]">to</span>
            <span>{formatPrice(sliderMax)}</span>
          </div>

          {/* Dual range slider */}
          <div className="relative h-5 flex items-center">
            {/* Track background */}
            <div className="absolute inset-x-0 h-1 bg-sand rounded-full" />
            {/* Active track fill */}
            <div
              className="absolute h-1 bg-charcoal-deep rounded-full pointer-events-none"
              style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
            />

            {/* Min thumb */}
            <input
              type="range"
              min={absMin}
              max={absMax}
              step={1}
              value={sliderMin}
              onChange={e => handleSliderMin(Number(e.target.value))}
              className="absolute inset-x-0 w-full h-1 appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: sliderMin > absMax - (range * 0.1) ? 5 : 3 }}
            />

            {/* Max thumb */}
            <input
              type="range"
              min={absMin}
              max={absMax}
              step={1}
              value={sliderMax}
              onChange={e => handleSliderMax(Number(e.target.value))}
              className="absolute inset-x-0 w-full h-1 appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: 4 }}
            />
          </div>

          {/* Min / Max text inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] tracking-[0.1em] uppercase text-taupe mb-1">Min Price</label>
              <input
                type="number"
                min={absMin}
                max={sliderMax - 1}
                value={inputMin}
                onChange={e => handleInputMin(e.target.value)}
                placeholder={String(absMin)}
                className="w-full px-3 py-2 border border-sand text-xs text-charcoal-deep placeholder:text-taupe/60 focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.1em] uppercase text-taupe mb-1">Max Price</label>
              <input
                type="number"
                min={sliderMin + 1}
                max={absMax}
                value={inputMax}
                onChange={e => handleInputMax(e.target.value)}
                placeholder={String(absMax)}
                className="w-full px-3 py-2 border border-sand text-xs text-charcoal-deep placeholder:text-taupe/60 focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Under 500', min: absMin, max: Math.min(500, absMax) },
              { label: '500–1000', min: 500, max: 1000 },
              { label: '1000–5000', min: 1000, max: 5000 },
              { label: '5000+', min: 5000, max: absMax },
            ]
              .filter(p => p.min <= absMax && p.max >= absMin && p.min < p.max)
              .map(preset => {
                const isActive = sliderMin === Math.max(preset.min, absMin) && sliderMax === Math.min(preset.max, absMax);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const newMin = Math.max(preset.min, absMin);
                      const newMax = Math.min(preset.max, absMax);
                      setSliderMin(newMin);
                      setSliderMax(newMax);
                      setInputMin(newMin === absMin ? '' : String(newMin));
                      setInputMax(newMax === absMax ? '' : String(newMax));
                    }}
                    className={`px-2.5 py-1 text-[10px] tracking-wide border transition-colors ${
                      isActive
                        ? 'border-charcoal-deep bg-charcoal-deep text-white'
                        : 'border-sand text-stone hover:border-charcoal-deep/50 hover:text-charcoal-deep'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-[11px] text-taupe">
          {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
          {isPriceFiltered && (
            <span className="ml-1">
              · {formatPrice(sliderMin)} – {formatPrice(sliderMax)}
            </span>
          )}
        </p>
      )}

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-taupe">No products match your filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-charcoal-deep underline mt-1 hover:text-gold-muted transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
          {filtered.map(product => {
            const pid = String(product.product_id);
            const isSelected = selectedIds.includes(pid);
            return (
              <ProductCard
                key={product.product_id}
                product={product}
                isSelected={isSelected}
                onToggle={() => onToggle(pid)}
              />
            );
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <p className="text-[11px] text-charcoal-deep font-medium pt-1">
          {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      )}

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        input[type='range']:focus {
          outline: none;
        }
        input[type='range']:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(26,26,26,0.15);
        }
      `}</style>
    </div>
  );
}
