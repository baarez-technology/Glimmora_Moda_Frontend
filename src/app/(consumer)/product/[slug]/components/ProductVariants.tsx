'use client';

import type { ProductVariant } from '@/types';

interface ProductVariantsProps {
  sizeVariants: ProductVariant[];
  colorVariants: ProductVariant[];
  selectedSize: string | null;
  selectedColor: string | null;
  sizeError: boolean;
  onSizeSelect: (size: string) => void;
  onColorSelect: (color: string) => void;
}

export default function ProductVariants({
  sizeVariants,
  colorVariants,
  selectedSize,
  selectedColor,
  sizeError,
  onSizeSelect,
  onColorSelect
}: ProductVariantsProps) {
  return (
    <>
      {/* Size Selection */}
      {sizeVariants.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className={`text-[11px] tracking-[0.3em] uppercase ${sizeError ? 'text-error' : 'text-taupe'}`}>
              Select Size {sizeError && <span className="text-error">*</span>}
            </p>
            <button className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSizeSelect(variant.value)}
                disabled={!variant.available}
                className={`min-w-[56px] px-4 py-3 text-sm transition-all duration-300 ${
                  selectedSize === variant.value
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : variant.available
                      ? `border border-sand hover:border-charcoal-deep text-charcoal-deep ${sizeError ? 'border-error/50' : ''}`
                      : 'border border-sand/30 text-greige cursor-not-allowed line-through'
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="text-xs text-error mt-3">Please select a size to continue</p>
          )}
        </div>
      )}

      {/* Color Selection */}
      {colorVariants.length > 0 && (
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-taupe mb-4">
            Select Color
          </p>
          <div className="flex flex-wrap gap-3">
            {colorVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onColorSelect(variant.value)}
                disabled={!variant.available}
                className={`w-10 h-10 transition-all duration-300 ${
                  selectedColor === variant.value
                    ? 'ring-1 ring-charcoal-deep ring-offset-2'
                    : 'hover:ring-1 hover:ring-sand hover:ring-offset-1'
                } ${!variant.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: variant.value }}
                title={variant.name}
                aria-label={`Select ${variant.name} color`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
