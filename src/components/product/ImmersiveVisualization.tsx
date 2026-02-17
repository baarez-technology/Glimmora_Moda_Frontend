'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, X, ChevronLeft, ChevronRight, User, Ruler, TrendingUp } from 'lucide-react';
import type { DigitalBodyTwin, Product } from '@/types';

type Props = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  bodyTwin: DigitalBodyTwin | null;
  selectedSize: string | null;
  selectedColor: string | null;
};

export default function ImmersiveVisualization({
  product,
  isOpen,
  onClose,
  bodyTwin,
  selectedSize,
  selectedColor,
}: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'product' | 'fit' | 'details'>('product');

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const images = product.images || [];
  const currentImage = images[activeImageIndex];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Generate fit predictions based on Body Twin
  const fitPredictions = bodyTwin ? {
    overallFit: selectedSize === 'M' ? 'Perfect Fit' : selectedSize === 'S' ? 'Snug Fit' : 'Relaxed Fit',
    confidence: 92,
    measurements: [
      { area: 'Shoulders', fit: 'True to size', confidence: 94 },
      { area: 'Chest', fit: 'Slightly relaxed', confidence: 89 },
      { area: 'Waist', fit: 'True to size', confidence: 95 },
      { area: 'Length', fit: 'Perfect', confidence: 97 }
    ],
    recommendations: [
      'This size will provide the intended silhouette',
      'Structured fit that defines your shape',
      'Ideal for layering without bulk'
    ]
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close immersive visualization"
      />

      <div className="relative w-full max-w-5xl bg-ivory-cream border border-sand/50 shadow-2xl max-h-[90vh] overflow-hidden sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-gold-soft" />
            </div>
            <div>
              <p className="font-display text-lg text-charcoal-deep">IV™ Immersive Visualization</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">
                Preview • Fit context • Materials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-parchment transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-stone" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-sand/50">
          <button
            onClick={() => setViewMode('product')}
            className={`flex-1 px-6 py-3 text-sm tracking-wider uppercase transition-colors ${
              viewMode === 'product'
                ? 'bg-charcoal-deep text-ivory-cream'
                : 'text-stone hover:text-charcoal-deep hover:bg-parchment'
            }`}
          >
            Product View
          </button>
          {bodyTwin && (
            <button
              onClick={() => setViewMode('fit')}
              className={`flex-1 px-6 py-3 text-sm tracking-wider uppercase transition-colors ${
                viewMode === 'fit'
                  ? 'bg-charcoal-deep text-ivory-cream'
                  : 'text-stone hover:text-charcoal-deep hover:bg-parchment'
              }`}
            >
              Fit Prediction
            </button>
          )}
          <button
            onClick={() => setViewMode('details')}
            className={`flex-1 px-6 py-3 text-sm tracking-wider uppercase transition-colors ${
              viewMode === 'details'
                ? 'bg-charcoal-deep text-ivory-cream'
                : 'text-stone hover:text-charcoal-deep hover:bg-parchment'
            }`}
          >
            Materials
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Image Preview */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[560px] bg-parchment group">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone">
                No preview available.
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-noir/25 via-transparent to-transparent" />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <ChevronLeft size={20} className="text-charcoal-deep" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <ChevronRight size={20} className="text-charcoal-deep" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="text-xs tracking-wider uppercase text-white bg-noir/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Info Panel */}

          <div className="p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Product View */}
            {viewMode === 'product' && (
              <>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Your Selection</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-white/70 border border-sand/40 rounded-md px-4 py-3">
                    <p className="text-xs text-stone">Size</p>
                    <p className="text-sm text-charcoal-deep mt-1 font-medium">{selectedSize || 'Not selected'}</p>
                  </div>
                  <div className="bg-white/70 border border-sand/40 rounded-md px-4 py-3">
                    <p className="text-xs text-stone">Color</p>
                    <p className="text-sm text-charcoal-deep mt-1 font-medium">{selectedColor || 'Default'}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Product Details</p>
                  <div className="mt-3 bg-white/70 border border-sand/40 rounded-md px-4 py-4">
                    <p className="text-xs text-stone uppercase tracking-wider">{product.brandName}</p>
                    <h3 className="font-display text-xl text-charcoal-deep mt-1">{product.name}</h3>
                    <p className="text-sm text-stone mt-3">{product.tagline}</p>
                  </div>
                </div>

                {product.craftsmanship && product.craftsmanship.length > 0 && (
                  <div className="mt-8">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Craftsmanship</p>
                    <div className="mt-3 space-y-3">
                      {product.craftsmanship.slice(0, 2).map((craft, index) => (
                        <div key={index} className="bg-white/70 border border-sand/40 rounded-md px-4 py-4">
                          <p className="text-sm text-charcoal-deep font-medium">{craft.title}</p>
                          <p className="text-xs text-stone mt-2 line-clamp-2">{craft.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fit Prediction View */}
            {viewMode === 'fit' && fitPredictions && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TrendingUp size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-charcoal-deep">{fitPredictions.overallFit}</h3>
                    <p className="text-xs text-stone">{fitPredictions.confidence}% confidence</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <User size={16} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-900 font-medium">Body Twin Analysis Active</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Predictions based on your measurements and fit preferences
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Fit by Area</p>
                <div className="space-y-3 mb-8">
                  {fitPredictions.measurements.map((measurement, index) => (
                    <div key={index} className="bg-white/70 border border-sand/40 rounded-md px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-charcoal-deep font-medium">{measurement.area}</p>
                        <span className="text-xs text-stone">{measurement.confidence}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler size={14} className="text-taupe" />
                        <p className="text-xs text-stone">{measurement.fit}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Recommendations</p>
                <div className="space-y-2">
                  {fitPredictions.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-muted mt-2" />
                      <p className="text-sm text-stone leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Materials View */}
            {viewMode === 'details' && (
              <>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Materials & Composition</p>
                <div className="space-y-4">
                  {(product.materials || []).map((material, index) => (
                    <div key={index} className="bg-white/70 border border-sand/40 rounded-md px-4 py-4">
                      <p className="text-sm text-charcoal-deep font-medium">{material.name}</p>
                      <p className="text-xs text-stone mt-2">{material.composition}</p>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-sand/30">
                        <span className="text-[10px] tracking-wider uppercase text-taupe">{material.origin}</span>
                        {material.sustainability && (
                          <span className="text-[10px] tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2 py-1">
                            {material.sustainability}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {product.care && (
                  <div className="mt-8">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Care Instructions</p>
                    <div className="bg-parchment border border-sand/40 rounded-md px-4 py-4">
                      <p className="text-sm text-stone leading-relaxed">{product.care}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Button */}
            <div className="mt-8 pt-6 border-t border-sand/30">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
              >
                <span className="text-sm tracking-wider uppercase">Return to Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



