'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Star, Award, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { HeritageEvent } from '@/types';

interface HeritageTimelineProps {
  events: HeritageEvent[];
  brandName?: string;
  className?: string;
}

const significanceConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  milestone: { icon: <Star className="w-4 h-4" />, color: 'bg-gold-soft', label: 'Milestone' },
  collection: { icon: <Award className="w-4 h-4" />, color: 'bg-emerald-500', label: 'Collection' },
  innovation: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-blue-500', label: 'Innovation' },
  cultural: { icon: <Star className="w-4 h-4" />, color: 'bg-rose-500', label: 'Cultural Moment' },
  collaboration: { icon: <Clock className="w-4 h-4" />, color: 'bg-purple-500', label: 'Collaboration' },
  award: { icon: <Award className="w-4 h-4" />, color: 'bg-amber-500', label: 'Award' }
};

export default function HeritageTimeline({
  events,
  brandName,
  className = ''
}: HeritageTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<HeritageEvent | null>(
    events.length > 0 ? events[0] : null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: scrollRef });
  const progressWidth = useTransform(scrollXProgress, [0, 1], ['0%', '100%']);

  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (events.length === 0) {
    return (
      <div className={`bg-ivory-cream/50 rounded-xl p-8 text-center ${className}`}>
        <Clock className="w-12 h-12 text-stone/30 mx-auto mb-4" />
        <p className="text-stone/60">Heritage timeline coming soon</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-stone/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone/10 bg-gradient-to-r from-ivory-cream to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-soft/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-gold-soft" />
            </div>
            <div>
              <h2 className="text-xl font-display text-charcoal-deep">Heritage Timeline</h2>
              {brandName && (
                <p className="text-sm text-stone/70">The legacy of {brandName}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-stone/10 rounded-full hover:bg-stone/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-charcoal-deep" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-stone/10 rounded-full hover:bg-stone/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-charcoal-deep" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-stone/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold-soft rounded-full"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide relative"
      >
        <div className="flex gap-0 min-w-max p-6 pb-4">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone/20" style={{ transform: 'translateY(-50%)' }} />

          {sortedEvents.map((event, index) => {
            const config = significanceConfig[event.significance] || significanceConfig.milestone;
            const isSelected = selectedEvent?.id === event.id;

            return (
              <motion.div
                key={event.id}
                className="relative flex flex-col items-center px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Year label - alternating top/bottom */}
                <div className={`absolute ${index % 2 === 0 ? '-top-2' : 'top-[calc(100%+8px)]'}`}>
                  <span className="text-2xl font-display text-charcoal-deep/80">{event.year}</span>
                </div>

                {/* Event node */}
                <button
                  onClick={() => setSelectedEvent(event)}
                  className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? `${config.color} text-white ring-4 ring-offset-2 ring-gold-soft/30 scale-110`
                      : 'bg-white border-2 border-stone/30 text-stone/60 hover:border-gold-soft hover:text-gold-soft'
                  }`}
                >
                  {config.icon}
                </button>

                {/* Event title */}
                <p className={`mt-3 text-xs tracking-wider text-center max-w-[120px] ${
                  isSelected ? 'text-charcoal-deep font-medium' : 'text-stone/60'
                }`}>
                  {event.title}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Detail */}
      {selectedEvent && (
        <motion.div
          key={selectedEvent.id}
          className="px-6 py-5 border-t border-stone/10 bg-gradient-to-b from-ivory-cream/50 to-white"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              significanceConfig[selectedEvent.significance]?.color || 'bg-gold-soft'
            } text-white`}>
              {significanceConfig[selectedEvent.significance]?.icon || <Star className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-display text-charcoal-deep">{selectedEvent.title}</h3>
                <span className="px-2 py-0.5 bg-stone/10 rounded text-xs text-stone/70">
                  {selectedEvent.year}
                </span>
              </div>
              <p className="text-sm text-stone/70 leading-relaxed mb-3">
                {selectedEvent.description}
              </p>

              {/* Significance tag */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs text-white ${
                  significanceConfig[selectedEvent.significance]?.color || 'bg-gold-soft'
                }`}>
                  {significanceConfig[selectedEvent.significance]?.label || 'Moment'}
                </span>
                {selectedEvent.relatedProducts && selectedEvent.relatedProducts.length > 0 && (
                  <span className="text-xs text-stone/50">
                    {selectedEvent.relatedProducts.length} related piece{selectedEvent.relatedProducts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Image gallery if available */}
          {selectedEvent.image && (
            <div className="mt-4 rounded-lg overflow-hidden relative h-48">
              <Image
                src={selectedEvent.image}
                alt={selectedEvent.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
