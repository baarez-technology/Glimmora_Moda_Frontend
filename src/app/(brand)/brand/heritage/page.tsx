'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Clock, Award, Sparkles, Star, Layers, Users } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { HeritageEventSignificance } from '@/types/brand-portal';

type FilterTab = 'all' | HeritageEventSignificance;

export default function HeritagePage() {
  const { heritageEvents } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredEvents = heritageEvents.filter(event => {
    return filter === 'all' || event.significance === filter;
  });

  // Sort by year descending
  const sortedEvents = [...filteredEvents].sort((a, b) => b.year - a.year);

  const getSignificanceIcon = (significance: HeritageEventSignificance) => {
    switch (significance) {
      case 'milestone':
        return Star;
      case 'collection':
        return Layers;
      case 'innovation':
        return Sparkles;
      case 'cultural':
        return Users;
      case 'collaboration':
        return Users;
      case 'award':
        return Award;
      default:
        return Clock;
    }
  };

  const getSignificanceBadge = (significance: HeritageEventSignificance) => {
    switch (significance) {
      case 'milestone':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'collection':
        return 'bg-info/10 text-info';
      case 'innovation':
        return 'bg-champagne/30 text-gold-muted';
      case 'cultural':
        return 'bg-parchment text-charcoal-deep';
      case 'collaboration':
        return 'bg-success/10 text-success';
      case 'award':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const significanceCounts = {
    all: heritageEvents.length,
    milestone: heritageEvents.filter(e => e.significance === 'milestone').length,
    collection: heritageEvents.filter(e => e.significance === 'collection').length,
    innovation: heritageEvents.filter(e => e.significance === 'innovation').length,
    cultural: heritageEvents.filter(e => e.significance === 'cultural').length,
    collaboration: heritageEvents.filter(e => e.significance === 'collaboration').length,
    award: heritageEvents.filter(e => e.significance === 'award').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'collection', label: 'Collections' },
    { value: 'innovation', label: 'Innovations' },
    { value: 'cultural', label: 'Cultural' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Brand Heritage"
        subtitle={`${sortedEvents.length} heritage event${sortedEvents.length !== 1 ? 's' : ''}`}
        actions={
          <PrimaryButton href="/brand/heritage/new" icon={Plus}>
            Add Event
          </PrimaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
                filter === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                {significanceCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        {sortedEvents.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Clock size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No heritage events found</p>
            <Link
              href="/brand/heritage/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
            >
              <Plus size={16} /> Add your first event
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-sand/50 p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[39px] top-0 bottom-0 w-0.5 bg-sand" />

              <div className="space-y-8">
                {sortedEvents.map((event, index) => {
                  const SignificanceIcon = getSignificanceIcon(event.significance);
                  return (
                    <div key={event.id} className="relative flex gap-6">
                      {/* Year marker */}
                      <div className="w-20 flex-shrink-0 text-right">
                        <span className="font-display text-2xl text-charcoal-deep">{event.year}</span>
                      </div>

                      {/* Timeline dot */}
                      <div className={`w-5 h-5 rounded-full border-2 border-white flex-shrink-0 z-10 ${getSignificanceBadge(event.significance)}`} />

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="bg-parchment/30 p-5 hover:bg-parchment/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getSignificanceBadge(event.significance)}`}>
                                  <SignificanceIcon size={10} />
                                  {event.significance}
                                </span>
                              </div>
                              <h3 className="font-medium text-charcoal-deep">{event.title}</h3>
                              <p className="text-sm text-stone mt-1">{event.description}</p>
                              {event.relatedProducts && event.relatedProducts.length > 0 && (
                                <p className="text-xs text-taupe mt-2">
                                  {event.relatedProducts.length} related product{event.relatedProducts.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            {event.image && (
                              <div className="w-24 h-24 bg-parchment flex-shrink-0 relative">
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
