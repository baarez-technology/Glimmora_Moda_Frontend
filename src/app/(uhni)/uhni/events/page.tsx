'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Calendar,
  ArrowLeft,
  Crown,
  MapPin,
  Clock,
  Star,
  Sparkles,
  Gem,
  Palette,
  CheckCircle,
  Users,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getExclusiveEvents,
  joinExclusiveEvent,
  getPrivateShoppingEvents,
  joinPrivateShoppingEvent,
  type ApiExclusiveEvent,
  type ApiEventType,
  type ApiPrivateShoppingEvent,
  type ApiPrivateShoppingStatus,
} from '@/services/exclusive-events.service';

type Tab = 'exclusive' | 'shopping';

const EVENT_TYPE_LABELS: Record<ApiEventType, string> = {
  exhibitions: 'Exhibition',
  galas: 'Gala',
  masterclasses: 'Masterclass',
  launches: 'Launch',
  experiences: 'Experience',
};

export default function EventsPage() {
  const searchParams = useSearchParams();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const initialTab = searchParams.get('tab') === 'shopping' ? 'shopping' : 'exclusive';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Exclusive events state
  const [exclusiveEvents, setExclusiveEvents] = useState<ApiExclusiveEvent[]>([]);
  const [exclusiveFilter, setExclusiveFilter] = useState<'all' | ApiEventType>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Private shopping state
  const [shoppingEvents, setShoppingEvents] = useState<ApiPrivateShoppingEvent[]>([]);
  const [shoppingFilter, setShoppingFilter] = useState<'all' | ApiPrivateShoppingStatus>('all');
  const [joiningShoppingId, setJoiningShoppingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getExclusiveEvents().then(events => setExclusiveEvents(events)),
      getPrivateShoppingEvents().then(events => setShoppingEvents(events)),
    ]).catch(() => {
      showToast('Failed to load events', 'error');
    }).finally(() => {
      setIsLoaded(true);
    });
  }, []);

  // ─── Exclusive Events helpers ───
  const filteredExclusive = exclusiveEvents.filter(event => {
    if (exclusiveFilter === 'all') return true;
    return event.event_type === exclusiveFilter;
  });

  const getTypeIcon = (type: ApiEventType) => {
    switch (type) {
      case 'exhibitions': return Palette;
      case 'galas': return Star;
      case 'masterclasses': return Sparkles;
      case 'launches': return Gem;
      case 'experiences': return Crown;
    }
  };

  const getTypeBadge = (type: ApiEventType) => {
    switch (type) {
      case 'exhibitions': return 'bg-info/10 text-info';
      case 'galas': return 'bg-gold-soft/20 text-gold-deep';
      case 'masterclasses': return 'bg-purple-100 text-purple-700';
      case 'launches': return 'bg-green-100 text-green-700';
      case 'experiences': return 'bg-champagne/30 text-gold-muted';
    }
  };

  const handleJoin = async (event: ApiExclusiveEvent) => {
    if (event.is_already_joined || event.spots === 0 || joiningId) return;
    setJoiningId(event.uhni_exclusive_event_id);
    try {
      const updated = await joinExclusiveEvent(event.uhni_exclusive_event_id);
      setExclusiveEvents(prev =>
        prev.map(e => e.uhni_exclusive_event_id === updated.uhni_exclusive_event_id ? updated : e)
      );
      showToast(`You've joined "${event.title}"`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join event';
      showToast(msg, 'error');
    } finally {
      setJoiningId(null);
    }
  };

  // ─── Private Shopping helpers ───
  const filteredShopping = shoppingEvents.filter(event => {
    if (shoppingFilter === 'all') return true;
    return event.private_shopping_status === shoppingFilter;
  });

  const getShoppingStatusBadge = (status: ApiPrivateShoppingStatus) => {
    switch (status) {
      case 'upcoming': return 'bg-info/10 text-info';
      case 'completed': return 'bg-stone/10 text-stone';
    }
  };

  const getShoppingStatusLabel = (status: ApiPrivateShoppingStatus) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
    }
  };

  const handleJoinShopping = async (event: ApiPrivateShoppingEvent) => {
    if (event.is_already_joined || event.spots === 0 || joiningShoppingId) return;
    setJoiningShoppingId(event.private_shopping_event_id);
    try {
      const updated = await joinPrivateShoppingEvent(event.private_shopping_event_id);
      setShoppingEvents(prev =>
        prev.map(e => e.private_shopping_event_id === updated.private_shopping_event_id ? updated : e)
      );
      showToast(`You've joined "${event.title}"`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join event';
      showToast(msg, 'error');
    } finally {
      setJoiningShoppingId(null);
    }
  };

  // ─── Shared ───
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const exclusiveTypeFilters: { value: 'all' | ApiEventType; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'exhibitions', label: 'Exhibitions' },
    { value: 'galas', label: 'Galas' },
    { value: 'masterclasses', label: 'Masterclasses' },
    { value: 'launches', label: 'Launches' },
    { value: 'experiences', label: 'Experiences' },
  ];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'exclusive', label: 'Exclusive Events', count: exclusiveEvents.length },
    { key: 'shopping', label: 'Private Shopping', count: shoppingEvents.length },
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Events & Experiences
            </h1>
            <p className="text-sand mt-3">Curated invitations, private shopping, and exclusive experiences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-10 border-b border-ivory-cream/10">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-sm tracking-[0.1em] uppercase transition-colors relative flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'text-gold-soft'
                    : 'text-sand/60 hover:text-sand'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 ${
                    activeTab === tab.key ? 'bg-gold-soft/20 text-gold-soft' : 'bg-ivory-cream/10 text-sand/60'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-soft" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══════════════════════════════════════════════ */}
        {/* TAB 1: Exclusive Events                        */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'exclusive' && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {exclusiveTypeFilters.map(type => (
                <button
                  key={type.value}
                  onClick={() => setExclusiveFilter(type.value)}
                  className={`px-4 py-2 text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
                    exclusiveFilter === type.value ? 'bg-charcoal-deep text-ivory-cream' : 'bg-white text-stone hover:text-charcoal-deep'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Events list */}
            <div className="space-y-6">
              {filteredExclusive.map(event => {
                const TypeIcon = getTypeIcon(event.event_type);
                const isJoining = joiningId === event.uhni_exclusive_event_id;
                const noSpots = event.spots === 0;
                return (
                  <div key={event.uhni_exclusive_event_id} className="bg-white border border-sand/30">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getTypeBadge(event.event_type)}`}>
                              <TypeIcon size={12} className="inline mr-1" />
                              {EVENT_TYPE_LABELS[event.event_type]}
                            </span>
                            {event.is_already_joined && (
                              <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-success/10 text-success flex items-center gap-1">
                                <CheckCircle size={11} />
                                Joined
                              </span>
                            )}
                            {noSpots && !event.is_already_joined && (
                              <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-stone/10 text-stone">
                                Full
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-2xl text-charcoal-deep mb-1">{event.title}</h3>
                          <p className="text-sm text-stone italic">{event.tagline}</p>
                        </div>
                        {!event.is_already_joined && !noSpots && (
                          <button
                            onClick={() => handleJoin(event)}
                            disabled={isJoining}
                            className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase flex-shrink-0 flex items-center gap-2 disabled:opacity-60"
                          >
                            {isJoining && <Loader2 size={14} className="animate-spin" />}
                            Join
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-stone mb-6">{event.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-stone" />
                          <div>
                            <p className="text-xs text-stone">Date</p>
                            <p className="text-sm text-charcoal-deep">{event.date_day}, {formatDate(event.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-stone" />
                          <div>
                            <p className="text-xs text-stone">Time</p>
                            <p className="text-sm text-charcoal-deep">{event.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-stone" />
                          <div>
                            <p className="text-xs text-stone">Location</p>
                            <p className="text-sm text-charcoal-deep">{event.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-stone" />
                          <div>
                            <p className="text-xs text-stone">Availability</p>
                            <p className={`text-sm ${noSpots ? 'text-error' : 'text-charcoal-deep'}`}>
                              {noSpots ? 'No spots left' : `${event.spots} spots left`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Highlights</p>
                        <div className="flex flex-wrap gap-2">
                          {event.highlights.map(highlight => (
                            <span key={highlight} className="px-3 py-1.5 bg-parchment text-xs text-charcoal-deep">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredExclusive.length === 0 && isLoaded && (
              <div className="text-center py-16">
                <Calendar size={40} className="text-stone/40 mx-auto mb-4" />
                <p className="text-stone">No events match your filter</p>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* TAB 2: Private Shopping                         */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'shopping' && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-8">
              {(['all', 'upcoming', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setShoppingFilter(f)}
                  className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors ${
                    shoppingFilter === f ? 'bg-charcoal-deep text-ivory-cream' : 'bg-white text-stone hover:text-charcoal-deep'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Shopping events list */}
            <div className="space-y-6">
              {filteredShopping.map(event => {
                const isJoiningThis = joiningShoppingId === event.private_shopping_event_id;
                const noSpots = event.spots === 0;
                const isCompleted = event.private_shopping_status === 'completed';
                return (
                <div key={event.private_shopping_event_id} className="bg-white border border-sand/30">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getShoppingStatusBadge(event.private_shopping_status)}`}>
                            {getShoppingStatusLabel(event.private_shopping_status)}
                          </span>
                          {event.is_already_joined && (
                            <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-success/10 text-success flex items-center gap-1">
                              <CheckCircle size={11} />
                              Joined
                            </span>
                          )}
                          {noSpots && !event.is_already_joined && (
                            <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-stone/10 text-stone">
                              Full
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-2xl text-charcoal-deep mb-1">{event.title}</h3>
                        <p className="text-sm text-stone italic">{event.tagline}</p>
                      </div>
                      {!isCompleted && !event.is_already_joined && !noSpots && (
                        <button
                          onClick={() => handleJoinShopping(event)}
                          disabled={isJoiningThis}
                          className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase flex-shrink-0 flex items-center gap-2 disabled:opacity-60"
                        >
                          {isJoiningThis && <Loader2 size={14} className="animate-spin" />}
                          Join
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-stone mb-6">{event.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-stone" />
                        <div>
                          <p className="text-xs text-stone">Date</p>
                          <p className="text-sm text-charcoal-deep">{event.date_day}, {formatDate(event.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-stone" />
                        <div>
                          <p className="text-xs text-stone">Time</p>
                          <p className="text-sm text-charcoal-deep">{event.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-stone" />
                        <div>
                          <p className="text-xs text-stone">Location</p>
                          <p className="text-sm text-charcoal-deep">{event.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-stone" />
                        <div>
                          <p className="text-xs text-stone">Availability</p>
                          <p className={`text-sm ${noSpots ? 'text-error' : 'text-charcoal-deep'}`}>
                            {noSpots ? 'No spots left' : `${event.spots} spots left`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {event.dress_code && (
                      <p className="text-xs text-stone mb-4">
                        <span className="tracking-wider uppercase">Dress Code:</span> {event.dress_code}
                      </p>
                    )}

                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Highlights</p>
                      <div className="flex flex-wrap gap-2">
                        {event.highlights.map(h => (
                          <span key={h} className="px-3 py-1.5 bg-parchment text-xs text-charcoal-deep">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {filteredShopping.length === 0 && isLoaded && (
              <div className="text-center py-16">
                <ShoppingBag size={40} className="text-stone/40 mx-auto mb-4" />
                <p className="text-stone">No shopping events match your filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
