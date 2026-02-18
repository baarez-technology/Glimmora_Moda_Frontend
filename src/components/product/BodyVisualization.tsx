'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, DigitalBodyTwin, BodyVisualizationConfig } from '@/types';
import BodySilhouette from './BodySilhouette';
import ProductOnBody from './ProductOnBody';

interface BodyVisualizationProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: Partial<BodyVisualizationConfig>;
}

const viewAngles: Array<'front' | 'side' | 'back'> = ['front', 'side', 'back'];
const silhouetteOptions: Array<DigitalBodyTwin['silhouette']> = ['petite', 'average', 'tall', 'curvy', 'athletic'];

export default function BodyVisualization({
  product,
  isOpen,
  onClose,
  initialConfig
}: BodyVisualizationProps) {
  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'back'>(initialConfig?.viewAngle || 'front');
  const [silhouette, setSilhouette] = useState<DigitalBodyTwin['silhouette']>(
    initialConfig?.silhouette || 'average'
  );
  const [showGuides, setShowGuides] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Load user's body twin silhouette from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialConfig?.silhouette) {
      const savedBodyTwin = localStorage.getItem('moda-body-twin');
      if (savedBodyTwin) {
        try {
          const bodyTwin: DigitalBodyTwin = JSON.parse(savedBodyTwin);
          setSilhouette(bodyTwin.silhouette);
        } catch (e) {
          console.error('Failed to parse body twin data');
        }
      }
    }
  }, [initialConfig?.silhouette]);

  // Auto-rotate through views
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setViewAngle(prev => {
        const currentIndex = viewAngles.indexOf(prev);
        return viewAngles[(currentIndex + 1) % viewAngles.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const cycleView = (direction: 'next' | 'prev') => {
    const currentIndex = viewAngles.indexOf(viewAngle);
    if (direction === 'next') {
      setViewAngle(viewAngles[(currentIndex + 1) % viewAngles.length]);
    } else {
      setViewAngle(viewAngles[(currentIndex - 1 + viewAngles.length) % viewAngles.length]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-charcoal-deep/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl mx-4 bg-ivory-cream rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-soft/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-gold-soft" />
              </div>
              <div>
                <h2 className="text-lg font-display text-charcoal-deep">View on Me</h2>
                <p className="text-xs text-stone/70">IV™ Immersive Visualization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-deep" />
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Visualization Area */}
            <div className="lg:col-span-2 relative bg-gradient-to-b from-ivory-cream to-stone/10 p-8">
              {/* View angle navigation */}
              <button
                onClick={() => cycleView('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-charcoal-deep" />
              </button>
              <button
                onClick={() => cycleView('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-charcoal-deep" />
              </button>

              {/* Body + Product visualization */}
              <div className="relative w-full max-w-xs mx-auto aspect-[1/2]">
                <BodySilhouette
                  silhouette={silhouette}
                  viewAngle={viewAngle}
                  showGuides={showGuides}
                  className="w-full h-full"
                />
                <ProductOnBody
                  product={product}
                  silhouette={silhouette}
                  viewAngle={viewAngle}
                />
              </div>

              {/* View angle indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {viewAngles.map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setViewAngle(angle)}
                    className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-full transition-all ${
                      viewAngle === angle
                        ? 'bg-charcoal-deep text-ivory-cream'
                        : 'bg-white/80 text-charcoal-deep hover:bg-white'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Panel */}
            <div className="bg-white p-6 space-y-6 border-l border-stone/20">
              {/* Product Info */}
              <div>
                <h3 className="font-medium text-charcoal-deep">{product.name}</h3>
                <p className="text-sm text-stone/70">{product.brandName}</p>
                <p className="text-lg font-display text-gold-soft mt-1">
                  ${product.price.toLocaleString()}
                </p>
              </div>

              {/* Silhouette Selection */}
              <div>
                <label className="text-xs tracking-wider uppercase text-stone/70 mb-3 block">
                  Body Type
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {silhouetteOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSilhouette(option)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        silhouette === option
                          ? 'border-gold-soft bg-gold-soft/10'
                          : 'border-stone/20 hover:border-stone/40'
                      }`}
                    >
                      <span className="text-[8px] tracking-wider uppercase text-charcoal-deep">
                        {option.slice(0, 3)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-charcoal-deep">Show Guides</span>
                  <button
                    onClick={() => setShowGuides(!showGuides)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      showGuides ? 'bg-gold-soft' : 'bg-stone/30'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: showGuides ? 22 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-charcoal-deep">Auto-Rotate</span>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      autoRotate ? 'bg-gold-soft' : 'bg-stone/30'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: autoRotate ? 22 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </label>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-stone/20 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal-deep text-ivory-cream rounded-lg hover:bg-charcoal-deep/90 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm tracking-wider">Add to Outfit</span>
                </button>
                <button
                  onClick={() => {
                    setViewAngle('front');
                    setSilhouette('average');
                    setShowGuides(false);
                    setAutoRotate(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-stone/30 text-charcoal-deep rounded-lg hover:bg-stone/5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm tracking-wider">Reset View</span>
                </button>
              </div>

              {/* Fit Note */}
              <div className="bg-gold-soft/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gold-soft/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-gold-soft" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-charcoal-deep mb-1">Personalized Fit</p>
                    <p className="text-xs text-stone/70 leading-relaxed">
                      Based on your body twin profile, this piece would complement your {silhouette} frame beautifully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
