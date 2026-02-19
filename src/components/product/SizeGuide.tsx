'use client';

import { useState } from 'react';
import { X, Ruler, User, TrendingUp, AlertCircle } from 'lucide-react';
import type { Product, DigitalBodyTwin } from '@/types';

interface SizeGuideProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  bodyTwin: DigitalBodyTwin | null;
  onSizeSelect?: (size: string) => void;
}

export default function SizeGuide({ product, isOpen, onClose, bodyTwin, onSizeSelect }: SizeGuideProps) {
  const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'in'>('cm');

  if (!isOpen) return null;

  // Get size variants for this product
  const sizeVariants = product.variants.filter(v => v.type === 'size');

  // TODO: Fetch from product.sizeChart when API provides it
  // Currently using generic sizing data as fallback
  const getSizingChart = () => {
    const category = product.category;

    if (category === 'clothing') {
      return {
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        measurements: measurementUnit === 'cm'
          ? {
              bust: [80-84, 84-88, 88-92, 92-96, 96-100],
              waist: [62-66, 66-70, 70-74, 74-78, 78-82],
              hips: [88-92, 92-96, 96-100, 100-104, 104-108],
            }
          : {
              bust: [31.5-33, 33-34.5, 34.5-36, 36-37.5, 37.5-39],
              waist: [24.5-26, 26-27.5, 27.5-29, 29-30.5, 30.5-32],
              hips: [34.5-36, 36-37.5, 37.5-39, 39-41, 41-42.5],
            }
      };
    } else if (category === 'bags') {
      return {
        sizes: ['Small', 'Medium', 'Large'],
        measurements: measurementUnit === 'cm'
          ? {
              width: [20, 28, 35],
              height: [15, 20, 25],
              depth: [8, 12, 15],
            }
          : {
              width: [7.9, 11, 13.8],
              height: [5.9, 7.9, 9.8],
              depth: [3.1, 4.7, 5.9],
            }
      };
    }

    // Default sizing
    return {
      sizes: ['One Size'],
      measurements: {}
    };
  };

  const sizingChart = getSizingChart();

  // Get intelligent size suggestion based on Body Twin
  const getIntelligentSuggestion = () => {
    if (!bodyTwin) return null;

    // TODO: Derive suggestion from body-twin measurement matching against product.sizeChart
    const suggestedSize = sizeVariants.find(v => v.available)?.value || 'M';

    return {
      size: suggestedSize,
      reasons: [
        'Based on your body measurements',
        `${product.brandName} typically runs true to size`,
        'Structured fit recommended for your silhouette'
      ],
      fitNotes: 'This size will provide the intended elegant silhouette while ensuring comfort for all-day wear.'
    };
  };

  const intelligentSuggestion = getIntelligentSuggestion();

  // TODO: Fetch review-based sizing insights from product review API
  // Render review fit breakdown (runs small / true to size / runs large) when real data is available

  const handleSizeSelection = (size: string) => {
    onSizeSelect?.(size);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-sand/30 px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep rounded-full flex items-center justify-center">
              <Ruler size={18} className="text-gold-soft" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-charcoal-deep">Size Guide</h2>
              <p className="text-xs text-stone tracking-wider uppercase">{product.brandName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sand/20 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Intelligent Size Suggestion */}
          {intelligentSuggestion && (
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-xl text-charcoal-deep">
                      We recommend size {intelligentSuggestion.size}
                    </h3>
                    <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                      Body Twin Match
                    </span>
                  </div>
                  <p className="text-sm text-stone mb-4">{intelligentSuggestion.fitNotes}</p>
                  <div className="space-y-1">
                    {intelligentSuggestion.reasons.map((reason, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span className="text-xs text-stone">{reason}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSizeSelection(intelligentSuggestion.size)}
                    className="mt-4 px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm tracking-wider uppercase"
                  >
                    Select Size {intelligentSuggestion.size}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Body Twin Notice */}
          {!bodyTwin && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900 font-medium mb-1">Get personalized size recommendations</p>
                  <p className="text-xs text-amber-700">Set up your Body Twin profile to receive intelligent size suggestions based on your measurements.</p>
                </div>
              </div>
            </div>
          )}

          {/* TODO: Review-Based Sizing Insights — render when review API provides fit data */}

          {/* Unit Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-sand/30">
            <h3 className="font-display text-lg text-charcoal-deep">Sizing Chart</h3>
            <div className="flex border border-sand">
              <button
                onClick={() => setMeasurementUnit('cm')}
                className={`px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                  measurementUnit === 'cm'
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'text-stone hover:bg-sand/20'
                }`}
              >
                CM
              </button>
              <button
                onClick={() => setMeasurementUnit('in')}
                className={`px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                  measurementUnit === 'in'
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'text-stone hover:bg-sand/20'
                }`}
              >
                IN
              </button>
            </div>
          </div>

          {/* Sizing Chart Table */}
          {Object.keys(sizingChart.measurements).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand">
                    <th className="text-left py-3 px-4 text-xs tracking-wider uppercase text-taupe font-medium">Size</th>
                    {Object.keys(sizingChart.measurements).map((measurement) => (
                      <th key={measurement} className="text-center py-3 px-4 text-xs tracking-wider uppercase text-taupe font-medium">
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizingChart.sizes.map((size, index) => (
                    <tr key={size} className="border-b border-sand/30 hover:bg-parchment/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-charcoal-deep font-medium">{size}</td>
                      {Object.entries(sizingChart.measurements).map(([key, values]) => {
                        const value = (values as number[])[index];
                        return (
                          <td key={key} className="text-center py-3 px-4 text-sm text-stone">
                            {Array.isArray(value) ? `${value[0]}-${value[1]}` : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-stone text-center py-8">One size fits all</p>
          )}

          {/* How to Measure */}
          <div>
            <h3 className="font-display text-lg text-charcoal-deep mb-4">How to Measure</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {product.category === 'clothing' ? (
                <>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Bust</p>
                    <p className="text-xs text-stone">Measure around the fullest part of your chest, keeping the tape horizontal</p>
                  </div>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Waist</p>
                    <p className="text-xs text-stone">Measure around your natural waistline, keeping the tape comfortably loose</p>
                  </div>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Hips</p>
                    <p className="text-xs text-stone">Measure around the fullest part of your hips</p>
                  </div>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Length</p>
                    <p className="text-xs text-stone">Measure from shoulder to hem for dresses and jackets</p>
                  </div>
                </>
              ) : product.category === 'bags' ? (
                <>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Width</p>
                    <p className="text-xs text-stone">Measured across the widest point of the bag</p>
                  </div>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Height</p>
                    <p className="text-xs text-stone">Measured from bottom to top of the bag</p>
                  </div>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Depth</p>
                    <p className="text-xs text-stone">Measured from front to back</p>
                  </div>
                  <div className="p-4 bg-parchment">
                    <p className="text-sm text-charcoal-deep font-medium mb-2">Strap Drop</p>
                    <p className="text-xs text-stone">Measured from top of strap to top of bag</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Brand-Specific Notes */}
          <div className="p-6 bg-charcoal-deep">
            <h3 className="font-display text-lg text-ivory-cream mb-3">{product.brandName} Fit Notes</h3>
            <div className="space-y-2 text-sm text-taupe">
              <p>• This maison is known for refined, structured silhouettes</p>
              <p>• Pieces are designed to fit close to the body with elegant drape</p>
              <p>• If between sizes, we recommend sizing up for ease of movement</p>
              <p>• All measurements are approximate and may vary slightly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
