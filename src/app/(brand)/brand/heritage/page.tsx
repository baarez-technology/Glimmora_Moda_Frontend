'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Clock, Award, Sparkles, Star, Layers, Users, Trash2, Pencil, Loader2 } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { fetchHeritageEvents, softDeleteHeritageEvent } from '@/services/brand-heritage.service';
import type { HeritageEventResponse } from '@/services/brand-heritage.service';

type SignificanceType = 'milestone' | 'collection' | 'innovation' | 'cultural' | 'collaboration' | 'award';
type FilterTab = 'all' | 'deleted' | SignificanceType;

export default function HeritagePage() {
  const [events, setEvents] = useState<HeritageEventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHeritageEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load heritage events');
    } finally {
      setIsLoading(false);
    }
  };

  const activeEvents = useMemo(() => events.filter(e => e.is_active), [events]);
  const deletedEvents = useMemo(() => events.filter(e => !e.is_active), [events]);

  const filteredEvents = useMemo(() => {
    if (filter === 'deleted') return deletedEvents;
    return activeEvents.filter(event => {
      return filter === 'all' || event.significance_type === filter;
    });
  }, [activeEvents, deletedEvents, filter]);

  const deleteTarget = deleteTargetId ? events.find(e => e.event_id === deleteTargetId) : null;

  // Sort by year descending
  const sortedEvents = [...filteredEvents].sort((a, b) => b.year - a.year);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await softDeleteHeritageEvent(deleteTarget.event_id);
      setDeleteTargetId(null);
      loadEvents();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const getSignificanceIcon = (significance: string) => {
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

  const getSignificanceBadge = (significance: string) => {
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
    milestone: activeEvents.filter(e => e.significance_type === 'milestone').length,
    collection: activeEvents.filter(e => e.significance_type === 'collection').length,
    innovation: activeEvents.filter(e => e.significance_type === 'innovation').length,
    cultural: activeEvents.filter(e => e.significance_type === 'cultural').length,
    collaboration: activeEvents.filter(e => e.significance_type === 'collaboration').length,
    award: activeEvents.filter(e => e.significance_type === 'award').length,
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

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Brand Heritage"
          subtitle="Loading..."
          actions={
            <PrimaryButton href="/brand/heritage/new" icon={Plus}>
              Add Event
            </PrimaryButton>
          }
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BrandPageHeader
          title="Brand Heritage"
          subtitle="Error"
          actions={
            <PrimaryButton href="/brand/heritage/new" icon={Plus}>
              Add Event
            </PrimaryButton>
          }
        />
        <div className="p-8 text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={loadEvents}
            className="px-6 py-3 bg-charcoal-deep text-white text-sm tracking-wider uppercase hover:bg-noir transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                  const SignificanceIcon = getSignificanceIcon(event.significance_type);
                  const isDeleted = !event.is_active;
                  return (
                    <div key={event.event_id} className={`relative flex gap-6`}>
                      {/* Year marker */}
                      <div className="w-24 flex-shrink-0 text-right">
                        <span className="font-display text-2xl text-charcoal-deep">{event.year}</span>
                      </div>

                      {/* Timeline dot */}
                      <div className={`w-5 h-5 rounded-full border-2 border-white flex-shrink-0 z-10 ${getSignificanceBadge(event.significance_type)}`} />

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className={`p-5 transition-colors ${isDeleted ? 'bg-red-50/40' : 'bg-parchment/30 hover:bg-parchment/50'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${isDeleted ? 'bg-red-100 text-red-600' : getSignificanceBadge(event.significance_type)}`}>
                                  <SignificanceIcon size={10} />
                                  {isDeleted ? 'Deleted' : event.significance_type}
                                </span>
                              </div>
                              <h3 className={`font-medium ${isDeleted ? 'text-stone line-through' : 'text-charcoal-deep'}`}>{event.title}</h3>
                              <p className="text-sm text-stone mt-1">{event.short_description}</p>
                              {event.full_description && (
                                <p className="text-sm text-taupe mt-2 leading-relaxed">{event.full_description}</p>
                              )}
                              {event.product_list && event.product_list.length > 0 && (
                                <p className="text-xs text-taupe mt-2">
                                  {event.product_list.length} related product{event.product_list.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {event.image_url && (
                                <div className="w-24 h-24 bg-parchment">
                                  <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {event.is_active === true && (
                                <div className="flex flex-col gap-1.5">
                                  <Link
                                    href={`/brand/heritage/${event.event_id}/edit`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide border border-sand text-stone hover:text-charcoal-deep hover:border-charcoal-deep/50 transition-colors"
                                  >
                                    <Pencil size={12} />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => setDeleteTargetId(event.event_id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide border border-sand text-stone hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </div>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40">
          <div className="bg-white p-8 max-w-md w-full mx-4 border border-sand">
            <h3 className="font-display text-lg text-charcoal-deep mb-3">Delete Heritage Event</h3>
            <p className="text-sm text-stone mb-2">
              Are you sure you want to delete <span className="font-medium text-charcoal-deep">{deleteTarget.title}</span>?
            </p>
            <p className="text-xs text-taupe mb-6">
              This event will be soft-deleted and set as inactive.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-6 py-3 text-sm text-stone hover:text-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
