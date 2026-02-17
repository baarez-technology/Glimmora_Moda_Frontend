'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Clock, Compass, Palette, Globe, Gem, History } from 'lucide-react';
import { CulturalJourney, JourneyStop } from '@/types';
import Link from 'next/link';

interface JourneyPathProps {
  journey: CulturalJourney;
  className?: string;
}

const journeyTypeConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  art: { icon: <Palette className="w-5 h-5" />, color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50' },
  travel: { icon: <Globe className="w-5 h-5" />, color: 'from-sky-500 to-blue-500', bgColor: 'bg-sky-50' },
  craft: { icon: <Gem className="w-5 h-5" />, color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-50' },
  eras: { icon: <History className="w-5 h-5" />, color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50' },
  icons: { icon: <Compass className="w-5 h-5" />, color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-50' },
  sustainability: { icon: <Globe className="w-5 h-5" />, color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-50' }
};

function JourneyStopCard({ stop, index, isActive, onClick }: {
  stop: JourneyStop;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex-shrink-0 w-64 p-4 rounded-xl text-left transition-all ${
        isActive
          ? 'bg-white shadow-lg ring-2 ring-gold-soft'
          : 'bg-white/70 hover:bg-white hover:shadow-md'
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Stop number */}
      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
        isActive ? 'bg-gold-soft' : 'bg-stone/40'
      }`}>
        {index + 1}
      </div>

      {/* Content */}
      <div className="pt-2">
        <h4 className="font-medium text-charcoal-deep mb-1">{stop.title}</h4>
        <p className="text-xs text-stone/70 line-clamp-2 mb-3">{stop.content}</p>

        {/* Products indicator */}
        {stop.relatedProducts && stop.relatedProducts.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gold-soft">
            <Gem className="w-3 h-3" />
            <span>{stop.relatedProducts.length} featured pieces</span>
          </div>
        )}
      </div>

      {/* Connection line to next stop */}
      <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-stone/20" />
    </motion.button>
  );
}

export default function JourneyPath({
  journey,
  className = ''
}: JourneyPathProps) {
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const config = journeyTypeConfig[journey.type] || journeyTypeConfig.art;
  const activeStop = journey.stops[activeStopIndex];

  return (
    <div className={`bg-white rounded-2xl border border-stone/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`px-6 py-6 bg-gradient-to-r ${config.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-display text-white">{journey.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {journey.stops.length} stops
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {journey.duration}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/discover/journeys/${journey.type}`}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Start Journey
          </Link>
        </div>

        {/* Description */}
        {journey.description && (
          <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-2xl">
            {journey.description}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3 bg-stone/5 border-b border-stone/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone/60">Journey Progress</span>
          <span className="text-xs font-medium text-charcoal-deep">
            {activeStopIndex + 1} of {journey.stops.length}
          </span>
        </div>
        <div className="h-1.5 bg-stone/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${((activeStopIndex + 1) / journey.stops.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stops horizontal scroll */}
      <div className="p-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-8 min-w-max">
          {journey.stops.map((stop, index) => (
            <JourneyStopCard
              key={stop.id}
              stop={stop}
              index={index}
              isActive={index === activeStopIndex}
              onClick={() => setActiveStopIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Active stop detail */}
      <AnimatePresence mode="wait">
        {activeStop && (
          <motion.div
            key={activeStop.id}
            className="px-6 pb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className={`rounded-xl p-6 ${config.bgColor}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center text-white flex-shrink-0`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-display text-charcoal-deep mb-1">{activeStop.title}</h3>
                  <p className="text-sm text-stone/70 leading-relaxed mb-4">{activeStop.content}</p>

                  {/* Related Products */}
                  {activeStop.relatedProducts && activeStop.relatedProducts.length > 0 && (
                    <div className="pt-4 border-t border-stone/10">
                      <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-3">Featured Pieces</h4>
                      <div className="flex gap-2 flex-wrap">
                        {activeStop.relatedProducts.map((productId: string) => (
                          <Link
                            key={productId}
                            href={`/product/${productId}`}
                            className="px-3 py-1.5 bg-white rounded-full text-xs text-charcoal-deep hover:bg-gold-soft/10 transition-colors flex items-center gap-1"
                          >
                            <Gem className="w-3 h-3 text-gold-soft" />
                            View Product
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-4 border-t border-stone/10">
                <button
                  onClick={() => setActiveStopIndex(Math.max(0, activeStopIndex - 1))}
                  disabled={activeStopIndex === 0}
                  className="px-4 py-2 bg-white rounded-lg text-sm text-charcoal-deep hover:bg-stone/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>
                <button
                  onClick={() => setActiveStopIndex(Math.min(journey.stops.length - 1, activeStopIndex + 1))}
                  disabled={activeStopIndex === journey.stops.length - 1}
                  className={`px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r ${config.color} hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  Next Stop
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
