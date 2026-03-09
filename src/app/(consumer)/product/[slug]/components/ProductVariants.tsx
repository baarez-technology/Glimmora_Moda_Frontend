'use client';

import { Minus, Plus } from 'lucide-react';
import type { ProductVariant } from '@/types';

interface ProductVariantsProps {
  sizeVariants: ProductVariant[];
  colorVariants: ProductVariant[];
  selectedSize: string | null;
  selectedColor: string | null;
  sizeError: boolean;
  colorError: boolean;
  quantity: number;
  onSizeSelect: (size: string) => void;
  onColorSelect: (color: string) => void;
  onQuantityChange: (qty: number) => void;
}

export default function ProductVariants({
  sizeVariants,
  colorVariants,
  selectedSize,
  selectedColor,
  sizeError,
  colorError,
  quantity,
  onSizeSelect,
  onColorSelect,
  onQuantityChange
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
            {/* <button className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors">
              Size Guide
            </button> */}
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

      {/* Color Selection + Quantity — side by side */}
      <div className="mb-10 flex items-start gap-8">
        {colorVariants.length > 0 && (
          <div className="flex-1">
            <p className={`text-[11px] tracking-[0.3em] uppercase mb-4 ${colorError ? 'text-error' : 'text-taupe'}`}>
              Select Color {colorError && <span className="text-error">*</span>}
            </p>
            <div className="flex flex-wrap gap-3">
              {colorVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => onColorSelect(variant.value)}
                  disabled={!variant.available}
                  className={`flex items-center gap-2.5 px-4 py-2.5 border transition-all duration-300 ${
                    selectedColor === variant.value
                      ? 'border-charcoal-deep bg-charcoal-deep/5'
                      : `border-sand hover:border-charcoal-deep ${colorError ? 'border-error/50' : ''}`
                  } ${!variant.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                  aria-label={`Select ${variant.name} color`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-sand/50 flex-shrink-0"
                    style={{ backgroundColor: variant.value }}
                  />
                  <span className="text-sm text-charcoal-deep">{variant.name}</span>
                </button>
              ))}
            </div>
            {colorError && (
              <p className="text-xs text-error mt-3">Please select a color to continue</p>
            )}
          </div>
        )}

        {/* Quantity Selector */}
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-taupe mb-3">Quantity</p>
          <div className="inline-flex items-center border border-sand">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-charcoal-deep border-x border-sand">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(Math.min(99, quantity + 1))}
              disabled={quantity >= 99}
              className="w-10 h-10 flex items-center justify-center text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
