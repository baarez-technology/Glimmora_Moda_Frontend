'use client';

import { useState } from 'react';
import { getCurrencySymbol } from '@/lib/currency';
import { useBrand } from '@/context/BrandContext';
import { ChevronDown } from 'lucide-react';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'INR', 'AED', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD',
  'SGD', 'HKD', 'SAR', 'KWD', 'QAR', 'BHD',
];

export function BrandTopBar() {
  const { currency, setCurrency } = useBrand();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (c: string) => {
    setCurrency(c);
    setShowDropdown(false);
  };

  return (
    <div className="sticky top-0 z-30 h-12 bg-white border-b border-sand/50 flex items-center justify-end px-8">
      <div className="relative">
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-sand hover:border-charcoal-deep transition-colors text-xs text-charcoal-deep"
        >
          <span className="font-medium">{getCurrencySymbol(currency)}</span>
          <span>{currency}</span>
          <ChevronDown size={12} className="text-taupe" />
        </button>
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-sand shadow-lg z-50 max-h-64 overflow-y-auto">
            {CURRENCIES.map(c => (
              <button
                key={c}
                onClick={() => handleSelect(c)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-parchment transition-colors ${c === currency ? 'bg-parchment text-charcoal-deep font-medium' : 'text-stone'}`}
              >
                <span className="w-5">{getCurrencySymbol(c)}</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
