'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Cloud,
  Sun,
  ChevronRight,
  Check,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Wine,
  Heart,
  Plane,
  Music,
  Users,
  Star
} from 'lucide-react';
import * as calendarService from '@/services/calendar.service';
import { formatPrice } from '@/lib/currency';
import { useApp } from '@/context/AppContext';
import type { CalendarConnection, EventType, BackendOutfitRecommendation } from '@/types';
import { PROVIDER_DISPLAY_NAMES } from '@/types';

const eventTypeIcons: Record<EventType, React.ReactNode> = {
  business_meeting: <Briefcase size={16} />,
  dinner_party: <Wine size={16} />,
  wedding: <Heart size={16} />,
  gala: <Star size={16} />,
  gallery_opening: <Star size={16} />,
  cocktail_party: <Wine size={16} />,
  travel: <Plane size={16} />,
  date_night: <Heart size={16} />,
  brunch: <Sun size={16} />,
  conference: <Users size={16} />,
  interview: <Briefcase size={16} />,
  casual_outing: <Sun size={16} />,
  theater: <Music size={16} />,
  concert: <Music size={16} />,
  other: <Calendar size={16} />
};

const eventTypeLabels: Record<EventType, string> = {
  business_meeting: 'Business',
  dinner_party: 'Dinner',
  wedding: 'Wedding',
  gala: 'Gala',
  gallery_opening: 'Gallery',
  cocktail_party: 'Cocktail',
  travel: 'Travel',
  date_night: 'Date Night',
  brunch: 'Brunch',
  conference: 'Conference',
  interview: 'Interview',
  casual_outing: 'Casual',
  theater: 'Theater',
  concert: 'Concert',
  other: 'Event'
};

const dressCodeLabels: Record<string, string> = {
  casual: 'Casual',
  smart_casual: 'Smart Casual',
  business: 'Business',
  cocktail: 'Cocktail',
  formal: 'Formal',
  black_tie: 'Black Tie'
};

export default function CalendarPage() {
  const { calendarEvents, isUHNI } = useApp();
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    calendarEvents[0]?.id || null
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([]);
  // Session-cached outfit recommendations — persists across page navigations within the same session
  const SESSION_KEY = 'moda-outfit-recommendations';
  const [apiRecommendations, setApiRecommendations] = useState<Record<string, BackendOutfitRecommendation>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch { return {}; }
  });
  const [loadingRecommendations, setLoadingRecommendations] = useState<string | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const selectedEvent = selectedEventId
    ? calendarEvents.find(e => e.id === selectedEventId) || calendarEvents[0] || null
    : calendarEvents[0] || null;

  // Resolve recommendation: prefer backend-cached (from event), then locally fetched
  const activeRecommendation: BackendOutfitRecommendation | null = selectedEvent
    ? (selectedEvent.backendOutfitSuggestions || apiRecommendations[selectedEvent.id] || null)
    : null;

  const fetchOutfitRecommendations = (eventId: string, regenerate = false) => {
    setLoadingRecommendations(eventId);
    setRecommendationError(null);
    calendarService.getOutfitRecommendations(eventId, regenerate)
      .then((rec) => {
        setApiRecommendations(prev => {
          const updated = { ...prev, [eventId]: rec };
          try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated)); } catch { /* full */ }
          return updated;
        });
      })
      .catch((err) => {
        setRecommendationError(err instanceof Error ? err.message : 'Failed to load recommendations');
      })
      .finally(() => {
        setLoadingRecommendations(null);
      });
  };

  useEffect(() => {
    if (isUHNI) { router.replace('/uhni/calendar'); return; }
    setIsLoaded(true);
    const loadConnections = async () => {
      try {
        const status = await calendarService.getConnectionStatus();
        if (status.connected && status.grants) {
          const connections: CalendarConnection[] = [];
          const providerKeys = ['google', 'microsoft', 'icloud'] as const;
          for (const key of providerKeys) {
            if (status.grants[key]) {
              connections.push({
                provider: key as CalendarConnection['provider'],
                connected: true,
                email: status.emails?.[key],
                lastSynced: new Date().toISOString(),
              });
            }
          }
          setCalendarConnections(connections);
        }
      } catch {
        // Not connected — show empty state
      }
    };
    loadConnections();
  }, [isUHNI, router]);


  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return `In ${diff} days`;
    if (diff < 14) return 'Next week';
    return `In ${Math.ceil(diff / 7)} weeks`;
  };

  if (isUHNI) return null;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Page Header
          ============================================ */}
      <section className="bg-charcoal-deep py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          {/* Back Button */}
          <Link
            href="/profile"
            className="group inline-flex items-center gap-3 mb-8 text-ivory-cream/60 hover:text-ivory-cream transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-[0.1em] uppercase">Back to Profile</span>
          </Link>

          <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-4">
                {calendarEvents.length} upcoming event{calendarEvents.length !== 1 ? 's' : ''}
              </span>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
                Style Calendar
              </h1>
              <p className="text-taupe max-w-lg">
                Your upcoming events with personalized outfit suggestions curated for each occasion.
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Connected Status */}
              {calendarConnections.filter(c => c.connected).length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {calendarConnections.filter(c => c.connected).map((conn) => (
                    <div key={conn.provider} className="flex items-center gap-2 px-4 py-2 border border-success/30 text-success">
                      <Check size={14} />
                      <span>{PROVIDER_DISPLAY_NAMES[conn.provider] || conn.provider}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/profile/calendar-settings"
                className="group flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.15em] uppercase text-ivory-cream/60 group-hover:text-ivory-cream transition-colors">
                  Settings
                </span>
                <span className="w-12 h-12 border border-ivory-cream/30 flex items-center justify-center group-hover:border-ivory-cream group-hover:bg-ivory-cream transition-all duration-300">
                  <ArrowRight size={16} className="text-ivory-cream group-hover:text-charcoal-deep transition-colors" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Events List */}
            <div className="lg:col-span-1">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                Upcoming Events
              </span>

              {calendarEvents.length > 0 ? (
                <div className="space-y-4">
                  {calendarEvents.map((event, index) => {
                    const dateInfo = formatDate(event.date);
                    const isSelected = selectedEvent?.id === event.id;

                    return (
                      <button
                        key={`${event.id}-${index}`}
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setRecommendationError(null);
                        }}
                        className={`w-full text-left p-6 transition-all duration-300 ${
                          isSelected
                            ? 'bg-charcoal-deep'
                            : 'bg-parchment hover:bg-sand/50'
                        }`}
                      >
                        <div className="flex gap-5">
                          {/* Date Badge */}
                          <div className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center border ${
                            isSelected ? 'border-gold-soft/30 text-ivory-cream' : 'border-sand text-charcoal-deep'
                          }`}>
                            <p className={`text-[9px] tracking-[0.2em] uppercase ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                              {dateInfo.day}
                            </p>
                            <p className="font-display text-3xl">{dateInfo.date}</p>
                            <p className={`text-[9px] tracking-[0.2em] uppercase ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                              {dateInfo.month}
                            </p>
                          </div>

                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`${isSelected ? 'text-gold-soft' : 'text-stone'}`}>
                                {eventTypeIcons[event.eventType]}
                              </span>
                              <span className={`text-[9px] tracking-[0.2em] uppercase ${isSelected ? 'text-gold-soft/70' : 'text-taupe'}`}>
                                {eventTypeLabels[event.eventType]}
                              </span>
                            </div>
                            <h3 className={`font-display text-lg truncate ${isSelected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                              {event.title}
                            </h3>
                            <div className={`flex items-center gap-4 mt-3 text-xs ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {event.time}
                              </span>
                              {event.venue && (
                                <span className="flex items-center gap-1.5 truncate">
                                  <MapPin size={12} />
                                  {event.venue}
                                </span>
                              )}
                            </div>

                            {/* Days Until */}
                            <div className="mt-4 pt-4 border-t border-sand/20">
                              <span className={`text-[10px] tracking-[0.2em] uppercase ${
                                getDaysUntil(event.date) === 'Today' || getDaysUntil(event.date) === 'Tomorrow'
                                  ? 'text-gold-soft'
                                  : isSelected ? 'text-taupe' : 'text-stone'
                              }`}>
                                {getDaysUntil(event.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center bg-parchment">
                  <Calendar size={40} className="mx-auto text-taupe mb-6" />
                  <p className="font-display text-xl text-charcoal-deep mb-4">No Upcoming Events</p>
                  <p className="text-stone text-sm mb-8">Connect your calendar to see personalized outfit suggestions.</p>
                  <Link
                    href="/profile/calendar-settings"
                    className="group inline-flex items-center gap-3"
                  >
                    <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                      Connect Calendar
                    </span>
                    <span className="w-10 h-10 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                      <ArrowRight size={14} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Event Details & Suggestions */}
            <div className="lg:col-span-2">
              {selectedEvent ? (
                <div className="space-y-8">
                  {/* Event Header */}
                  <div className="bg-parchment p-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1.5 border border-charcoal-deep text-[10px] tracking-[0.2em] uppercase text-charcoal-deep">
                            {eventTypeLabels[selectedEvent.eventType]}
                          </span>
                          {selectedEvent.dressCode && (
                            <span className="px-3 py-1.5 border border-gold-muted text-[10px] tracking-[0.2em] uppercase text-gold-muted">
                              {dressCodeLabels[selectedEvent.dressCode]}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em]">
                          {selectedEvent.title}
                        </h2>
                      </div>
                      {selectedEvent.weather && (
                        <div className="text-right flex-shrink-0 p-4 bg-ivory-cream">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            {selectedEvent.weather.condition.includes('Clear') || selectedEvent.weather.condition.includes('Sunny') ? (
                              <Sun size={18} className="text-gold-muted" />
                            ) : (
                              <Cloud size={18} className="text-stone" />
                            )}
                            <span className="font-display text-2xl text-charcoal-deep">
                              {selectedEvent.weather.temperature}°{selectedEvent.weather.unit}
                            </span>
                          </div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">{selectedEvent.weather.condition}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 text-sm border-t border-sand/50 pt-6">
                      <div className="flex items-center gap-3 text-stone">
                        <Calendar size={16} className="text-taupe" />
                        <span>{formatDate(selectedEvent.date).full}</span>
                      </div>
                      <div className="flex items-center gap-3 text-stone">
                        <Clock size={16} className="text-taupe" />
                        <span>{selectedEvent.time}{selectedEvent.endTime ? ` — ${selectedEvent.endTime}` : ''}</span>
                      </div>
                      {selectedEvent.venue && (
                        <div className="flex items-center gap-3 text-stone">
                          <MapPin size={16} className="text-taupe" />
                          <span>{selectedEvent.venue}</span>
                        </div>
                      )}
                    </div>

                    {selectedEvent.description && (
                      <p className="mt-6 text-stone text-sm leading-relaxed border-t border-sand/50 pt-6">
                        {selectedEvent.description}
                      </p>
                    )}
                  </div>

                  {/* Loading Recommendations */}
                  {loadingRecommendations === selectedEvent.id && (
                    <div className="py-16 text-center bg-parchment">
                      <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-stone text-sm">Generating outfit recommendations...</p>
                    </div>
                  )}

                  {/* Recommendation Error */}
                  {recommendationError && !loadingRecommendations && !activeRecommendation && (
                    <div className="py-10 text-center bg-parchment">
                      <p className="text-stone text-sm mb-4">Could not load outfit recommendations.</p>
                      <button
                        onClick={() => {
                          setRecommendationError(null);
                          fetchOutfitRecommendations(selectedEvent.id);
                        }}
                        className="text-sm tracking-[0.15em] uppercase text-charcoal-deep hover:text-noir transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Suggest Outfit Button — shown when no recommendations and not loading */}
                  {!activeRecommendation && !loadingRecommendations && !recommendationError && (
                    <div className="py-12 text-center bg-parchment">
                      <Star size={32} className="mx-auto text-gold-muted mb-4" />
                      <p className="text-stone text-sm mb-6">Get AI-powered outfit suggestions for this event.</p>
                      <button
                        onClick={() => fetchOutfitRecommendations(selectedEvent.id)}
                        className="group inline-flex items-center gap-4"
                      >
                        <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                          Suggest Outfit
                        </span>
                        <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                          <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Outfit Recommendation Display */}
                  {activeRecommendation && (
                    <div>
                      {/* Title, Score & Regenerate */}
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                            AI Outfit Recommendation
                          </span>
                          <h3 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                            {activeRecommendation.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1 bg-sand overflow-hidden">
                              <div
                                className="h-full bg-gold-muted"
                                style={{ width: `${activeRecommendation.style_score}%` }}
                              />
                            </div>
                            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">
                              {activeRecommendation.style_score}% match
                            </span>
                          </div>
                          <button
                            onClick={() => fetchOutfitRecommendations(selectedEvent.id, true)}
                            disabled={loadingRecommendations === selectedEvent.id}
                            className="text-[10px] tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors disabled:opacity-50"
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-stone leading-relaxed mb-8">
                        {activeRecommendation.description}
                      </p>

                      {/* Product Cards */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {activeRecommendation.outfit_suggestions.map((item, idx) => {
                          const p = item.suitable_product;

                          // No matching product found
                          if (!p) return null;

                          const imgSrc = p.image_urls?.[0] || p.product_image;
                          const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          const productUrl = `/product/${slug}?productId=${p.product_id}`;

                          return (
                            <Link
                              key={idx}
                              href={productUrl}
                              className="group bg-white border border-sand hover:border-charcoal-deep transition-all duration-300 overflow-hidden"
                            >
                              {/* Product Image */}
                              <div className="relative aspect-[3/4] overflow-hidden bg-parchment">
                                {imgSrc && (
                                  <Image
                                    src={imgSrc}
                                    alt={p.product_name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                )}
                                {p.is_wardrobe && (
                                  <span className="absolute top-3 left-3 px-2 py-1 bg-success/90 text-white text-[9px] tracking-[0.15em] uppercase">
                                    In Wardrobe
                                  </span>
                                )}
                              </div>
                              {/* Card Info */}
                              <div className="p-4">
                                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">
                                  {p.brand_name}
                                </p>
                                <h4 className="font-display text-lg text-charcoal-deep leading-tight mb-1 line-clamp-1">
                                  {p.product_name}
                                </h4>
                                <p className="text-xs text-stone capitalize">
                                  {item.product_category}
                                </p>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-sand/50">
                                  <div className="flex items-center gap-2">
                                    <span className="font-display text-base text-charcoal-deep">
                                      {formatPrice(p.price)}
                                    </span>
                                  </div>
                                  <span className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-stone group-hover:text-charcoal-deep transition-colors">
                                    View
                                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Style Note */}
                      <div className="p-6 bg-charcoal-deep">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 mb-4">Style Note</p>
                        <p className="text-taupe leading-relaxed">
                          {activeRecommendation.style_note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center bg-parchment">
                  <Calendar size={48} className="mx-auto text-taupe mb-6" />
                  <h3 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-4">
                    Select an Event
                  </h3>
                  <p className="text-stone max-w-md mx-auto">
                    Choose an event from the list to see personalized outfit suggestions curated for the occasion.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA - Explore Collection
          ============================================ */}
      <section className="py-20 lg:py-28 bg-charcoal-deep">
        <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
            Complete Your Look
          </span>
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-8">
            Explore the Collection
          </h2>
          <p className="text-taupe mb-12 max-w-lg mx-auto">
            Discover exceptional pieces to elevate your wardrobe for every occasion.
          </p>
          <Link
            href="/discover"
            className="group inline-flex items-center gap-5"
          >
            <span className="text-sm tracking-[0.2em] uppercase text-ivory-cream">
              View Collection
            </span>
            <span className="w-14 h-14 border border-gold-soft/30 flex items-center justify-center group-hover:bg-gold-soft group-hover:border-gold-soft transition-all duration-500">
              <ArrowRight size={18} className="text-gold-soft group-hover:text-noir transition-colors duration-500" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
