'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Sliders } from 'lucide-react';

interface BudgetFilterProps {
  minPrice?: number;
  maxPrice?: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
  currency?: string;
}

export default function BudgetFilter({
  minPrice = 0,
  maxPrice = 50000,
  currentMin,
  currentMax,
  onChange,
  currency = '€'
}: BudgetFilterProps) {
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalMin(currentMin);
    setLocalMax(currentMax);
  }, [currentMin, currentMax]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - 100);
    setLocalMin(newMin);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + 100);
    setLocalMax(newMax);
  };

  const handleBlur = () => {
    if (!isDragging) {
      onChange(localMin, localMax);
    }
  };

  const handleRangeEnd = () => {
    setIsDragging(false);
    onChange(localMin, localMax);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${currency}${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
    }
    return `${currency}${price}`;
  };

  const presets = [
    { label: 'Under €500', min: minPrice, max: 500 },
    { label: '€500 - €2k', min: 500, max: 2000 },
    { label: '€2k - €5k', min: 2000, max: 5000 },
    { label: '€5k - €10k', min: 5000, max: 10000 },
    { label: 'Over €10k', min: 10000, max: maxPrice },
  ];

  const minPercent = ((localMin - minPrice) / (maxPrice - minPrice)) * 100;
  const maxPercent = ((localMax - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sliders size={16} className="text-stone" />
        <span className="text-sm font-medium text-charcoal-deep">Budget Range</span>
      </div>

      {/* Current Range Display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone">
          {formatPrice(localMin)} - {formatPrice(localMax)}
        </span>
        {(localMin !== minPrice || localMax !== maxPrice) && (
          <button
            onClick={() => {
              setLocalMin(minPrice);
              setLocalMax(maxPrice);
              onChange(minPrice, maxPrice);
            }}
            className="text-xs text-gold-muted hover:text-gold-deep"
          >
            Reset
          </button>
        )}
      </div>

      {/* Dual Range Slider */}
      <div className="relative h-2 bg-sand rounded-full">
        {/* Active Range */}
        <div
          className="absolute h-full bg-gold-muted rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />

        {/* Min Handle */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100}
          value={localMin}
          onChange={(e) => handleMinChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleRangeEnd}
          onTouchEnd={handleRangeEnd}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-charcoal-deep [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />

        {/* Max Handle */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100}
          value={localMax}
          onChange={(e) => handleMaxChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleRangeEnd}
          onTouchEnd={handleRangeEnd}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-charcoal-deep [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-greige block mb-1">Min</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm">{currency}</span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(parseInt(e.target.value) || minPrice)}
              onBlur={handleBlur}
              min={minPrice}
              max={localMax - 100}
              className="w-full pl-7 pr-3 py-2 border border-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-muted"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-greige block mb-1">Max</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm">{currency}</span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(parseInt(e.target.value) || maxPrice)}
              onBlur={handleBlur}
              min={localMin + 100}
              max={maxPrice}
              className="w-full pl-7 pr-3 py-2 border border-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-muted"
            />
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive = localMin === preset.min && localMax === preset.max;
          return (
            <button
              key={preset.label}
              onClick={() => {
                setLocalMin(preset.min);
                setLocalMax(preset.max);
                onChange(preset.min, preset.max);
              }}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                isActive
                  ? 'bg-charcoal-deep text-ivory-cream'
                  : 'bg-parchment text-stone hover:bg-sand'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
