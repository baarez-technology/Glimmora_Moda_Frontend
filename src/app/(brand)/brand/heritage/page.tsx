'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, Award, Sparkles, Star, Layers, Users, Trash2 } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { HeritageEventSignificance } from '@/types/brand-portal';

type FilterTab = 'all' | 'deleted' | HeritageEventSignificance;

export default function HeritagePage() {
  const { heritageEvents, deleteHeritageEvent } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeEvents = heritageEvents.filter(e => !e.isDeleted);
  const deletedEvents = heritageEvents.filter(e => e.isDeleted);

  const filteredEvents = filter === 'deleted'
    ? deletedEvents
    : activeEvents.filter(event => {
        return filter === 'all' || event.significance === filter;
      });

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteHeritageEvent(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

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
    all: activeEvents.length,
    milestone: activeEvents.filter(e => e.significance === 'milestone').length,
    collection: activeEvents.filter(e => e.significance === 'collection').length,
    innovation: activeEvents.filter(e => e.significance === 'innovation').length,
    cultural: activeEvents.filter(e => e.significance === 'cultural').length,
    collaboration: activeEvents.filter(e => e.significance === 'collaboration').length,
    award: activeEvents.filter(e => e.significance === 'award').length,
    deleted: deletedEvents.length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'collection', label: 'Collections' },
    { value: 'innovation', label: 'Innovations' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'deleted', label: 'Deleted' }
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
                {sortedEvents.map((event) => {
                  const SignificanceIcon = getSignificanceIcon(event.significance);
                  const isDeleted = event.isDeleted;
                  const isConfirming = confirmDeleteId === event.id;
                  return (
                    <div key={event.id} className={`relative flex gap-6 ${isDeleted ? 'opacity-60' : ''}`}>
                      {/* Year marker */}
                      <div className="w-24 flex-shrink-0 text-right">
                        <span className="font-display text-2xl text-charcoal-deep">{event.year}</span>
                      </div>

                      {/* Timeline dot */}
                      <div className={`w-5 h-5 rounded-full border-2 border-white flex-shrink-0 z-10 ${getSignificanceBadge(event.significance)}`} />

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className={`p-5 transition-colors ${isDeleted ? 'bg-red-50/40' : 'bg-parchment/30 hover:bg-parchment/50'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${isDeleted ? 'bg-red-100 text-red-600' : getSignificanceBadge(event.significance)}`}>
                                  <SignificanceIcon size={10} />
                                  {isDeleted ? 'Deleted' : event.significance}
                                </span>
                              </div>
                              <h3 className={`font-medium ${isDeleted ? 'text-stone line-through' : 'text-charcoal-deep'}`}>{event.title}</h3>
                              <p className="text-sm text-stone mt-1">{event.description}</p>
                              {event.relatedProducts && event.relatedProducts.length > 0 && (
                                <p className="text-xs text-taupe mt-2">
                                  {event.relatedProducts.length} related product{event.relatedProducts.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex items-start gap-3 flex-shrink-0">
                              {event.image && (
                                <div className="w-24 h-24 bg-parchment">
                                  <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {!isDeleted && (
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  onMouseLeave={() => setConfirmDeleteId(null)}
                                  title={isConfirming ? 'Click again to confirm' : 'Delete event'}
                                  className={`p-2 rounded-sm transition-colors ${
                                    isConfirming
                                      ? 'bg-red-50 text-red-500'
                                      : 'text-taupe hover:text-red-500 hover:bg-red-50/50'
                                  }`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
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
