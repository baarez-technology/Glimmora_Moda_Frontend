'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { ContextSimulation as ContextSimulationType } from '@/types';

interface ContextSimulationProps {
  contexts: ContextSimulationType[];
  productId: string;
  className?: string;
}

const contextBackgrounds: Record<string, string> = {
  occasion: 'from-stone/20 via-charcoal-deep/10 to-gold-soft/10',
  climate: 'from-sky-100/40 via-blue-50/20 to-amber-50/30',
  travel: 'from-slate-200/40 via-stone/20 to-emerald-50/10',
  setting: 'from-gray-200/30 via-stone/10 to-ivory-cream'
};

const contextTypeIcons: Record<string, string> = {
  occasion: '✨',
  climate: '🌤️',
  travel: '✈️',
  setting: '🏠'
};

const lightingLabels: Record<string, string> = {
  warm: 'Warm ambient',
  cool: 'Cool tones',
  natural: 'Natural daylight',
  evening: 'Evening atmosphere',
  dramatic: 'Dramatic spotlight'
};

export default function ContextSimulation({
  contexts,
  productId,
  className = ''
}: ContextSimulationProps) {
  const [selectedContext, setSelectedContext] = useState<ContextSimulationType | null>(
    contexts.length > 0 ? contexts[0] : null
  );

  if (contexts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl border border-stone/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone/10 bg-gradient-to-r from-ivory-cream to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-soft/20 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gold-soft" />
          </div>
          <div>
            <h3 className="font-medium text-charcoal-deep">Context Visualization</h3>
            <p className="text-xs text-stone/70">See how it works in different settings</p>
          </div>
        </div>
      </div>

      {/* Context Selector */}
      <div className="px-5 py-3 border-b border-stone/10 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {contexts.map((context) => (
            <button
              key={context.id}
              onClick={() => setSelectedContext(context)}
              className={`px-4 py-2 rounded-full text-xs tracking-wider transition-all flex items-center gap-2 ${
                selectedContext?.id === context.id
                  ? 'bg-charcoal-deep text-ivory-cream'
                  : 'bg-stone/10 text-charcoal-deep hover:bg-stone/20'
              }`}
            >
              <span>{contextTypeIcons[context.type] || '📍'}</span>
              <span className="capitalize">{context.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Context Preview */}
      <AnimatePresence mode="wait">
        {selectedContext && (
          <motion.div
            key={selectedContext.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Visual Background */}
            <div className={`relative h-40 bg-gradient-to-br ${contextBackgrounds[selectedContext.type] || 'from-stone/10 to-ivory-cream'}`}>
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-32 h-32 rounded-full bg-gold-soft/10 blur-2xl"
                  animate={{
                    x: [0, 20, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ top: '20%', right: '10%' }}
                />
                <motion.div
                  className="absolute w-24 h-24 rounded-full bg-stone/10 blur-xl"
                  animate={{
                    x: [0, -15, 0],
                    y: [0, 15, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ bottom: '10%', left: '15%' }}
                />
              </div>

              {/* Context Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-6xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {contextTypeIcons[selectedContext.type] || '📍'}
                </motion.div>
              </div>

              {/* Type tag */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-xs font-medium text-charcoal-deep capitalize">{selectedContext.type}</span>
              </div>

              {/* Lighting tag */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-xs font-medium text-charcoal-deep">{lightingLabels[selectedContext.lighting] || selectedContext.lighting}</span>
              </div>
            </div>

            {/* Context Details */}
            <div className="p-5 space-y-4">
              <div>
                <h4 className="font-medium text-charcoal-deep">
                  {selectedContext.name}
                </h4>
                <p className="text-sm text-stone/70 mt-1 leading-relaxed">
                  {selectedContext.description}
                </p>
              </div>

              {/* Tags */}
              {selectedContext.tags && selectedContext.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedContext.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-stone/10 rounded-full text-xs text-charcoal-deep capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Context info */}
              <div className="pt-3 border-t border-stone/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-soft" />
                  <span className="text-xs text-stone/70">
                    {selectedContext.type === 'travel' ? 'Perfect for travel occasions' :
                     selectedContext.type === 'occasion' ? 'Suited for special occasions' :
                     selectedContext.type === 'climate' ? 'Climate-appropriate styling' :
                     'Versatile for various settings'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
