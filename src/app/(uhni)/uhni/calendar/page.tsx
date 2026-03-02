'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Clock, MapPin, Cloud, Sun, ChevronRight, Check, ArrowRight,
  Briefcase, Wine, Heart, Plane, Music, Users, Star, Crown
} from 'lucide-react';
import * as calendarService from '@/services/calendar.service';
import { useApp } from '@/context/AppContext';
import type { CalendarConnection, EventType } from '@/types';
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
  business_meeting: 'Business', dinner_party: 'Dinner', wedding: 'Wedding',
  gala: 'Gala', gallery_opening: 'Gallery', cocktail_party: 'Cocktail',
  travel: 'Travel', date_night: 'Date Night', brunch: 'Brunch',
  conference: 'Conference', interview: 'Interview', casual_outing: 'Casual',
  theater: 'Theater', concert: 'Concert', other: 'Event'
};

const dressCodeLabels: Record<string, string> = {
  casual: 'Casual', smart_casual: 'Smart Casual', business: 'Business',
  cocktail: 'Cocktail', formal: 'Formal', black_tie: 'Black Tie'
};

export default function UHNICalendarPage() {
  const { calendarEvents, saveOutfit, addToConsiderations, showToast } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(calendarEvents[0]?.id || null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([]);

  const selectedEvent = selectedEventId
    ? calendarEvents.find(e => e.id === selectedEventId) || null
    : calendarEvents[0] || null;

  useEffect(() => {
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
        // Not connected
      }
    };
    loadConnections();
  }, []);

  const handleSaveOutfit = () => {
    if (!selectedEvent || !selectedEvent.outfitSuggestions?.[selectedSuggestion]) return;
    const suggestion = selectedEvent.outfitSuggestions[selectedSuggestion];
    const productIds = suggestion.items.map(item => item.product.id);
    saveOutfit(`${suggestion.name} for ${selectedEvent.title}`, productIds, selectedEvent.id);
  };

  const handleAddToConsiderations = () => {
    if (!selectedEvent || !selectedEvent.outfitSuggestions?.[selectedSuggestion]) return;
    const suggestion = selectedEvent.outfitSuggestions[selectedSuggestion];
    const suggestedItems = suggestion.items.filter(item => item.type === 'suggested');
    if (suggestedItems.length === 0) { showToast('All items are already in your wardrobe', 'info'); return; }
    suggestedItems.forEach(item => {
      addToConsiderations(item.product, {}, `Suggested for ${selectedEvent.title}: ${item.note || suggestion.description}`);
    });
  };

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
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr); eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return `In ${diff} days`;
    if (diff < 14) return 'Next week';
    return `In ${Math.ceil(diff / 7)} weeks`;
  };

  return (
    <div className="min-h-screen bg-noir">
      {/* Header */}
      <section className="border-b border-gold-soft/10 py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown size={14} className="text-gold-soft" />
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">
                  {calendarEvents.length} upcoming event{calendarEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
                Style Calendar
              </h1>
              <p className="text-sand max-w-lg">
                Your upcoming events with personalized outfit suggestions curated for each occasion.
              </p>
            </div>
            <div className="flex items-center gap-6">
              {calendarConnections.filter(c => c.connected).length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {calendarConnections.filter(c => c.connected).map((conn) => (
                    <div key={conn.provider} className="flex items-center gap-2 px-4 py-2 border border-green-500/30 text-green-400">
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
                <span className="text-sm tracking-[0.15em] uppercase text-sand group-hover:text-ivory-cream transition-colors">Settings</span>
                <span className="w-12 h-12 border border-gold-soft/30 flex items-center justify-center group-hover:border-gold-soft group-hover:bg-gold-soft/10 transition-all duration-300">
                  <ArrowRight size={16} className="text-gold-soft" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Events List */}
            <div className="lg:col-span-1">
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
                Upcoming Events
              </span>

              {calendarEvents.length > 0 ? (
                <div className="space-y-4">
                  {calendarEvents.map((event) => {
                    const dateInfo = formatDate(event.date);
                    const isSelected = selectedEvent?.id === event.id;
                    return (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEventId(event.id); setSelectedSuggestion(0); }}
                        className={`w-full text-left p-6 transition-all duration-300 ${
                          isSelected ? 'bg-charcoal-deep border border-gold-soft/20' : 'bg-charcoal-deep/50 border border-gold-soft/5 hover:border-gold-soft/15'
                        }`}
                      >
                        <div className="flex gap-5">
                          <div className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center border ${
                            isSelected ? 'border-gold-soft/30 text-ivory-cream' : 'border-gold-soft/10 text-sand'
                          }`}>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-sand/50">{dateInfo.day}</p>
                            <p className="font-display text-3xl">{dateInfo.date}</p>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-sand/50">{dateInfo.month}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={isSelected ? 'text-gold-soft' : 'text-sand/60'}>{eventTypeIcons[event.eventType]}</span>
                              <span className={`text-[9px] tracking-[0.2em] uppercase ${isSelected ? 'text-gold-soft/70' : 'text-sand/40'}`}>
                                {eventTypeLabels[event.eventType]}
                              </span>
                            </div>
                            <h3 className={`font-display text-lg truncate ${isSelected ? 'text-ivory-cream' : 'text-sand'}`}>
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-3 text-xs text-sand/50">
                              <span className="flex items-center gap-1.5"><Clock size={12} />{event.time}</span>
                              {event.venue && <span className="flex items-center gap-1.5 truncate"><MapPin size={12} />{event.venue}</span>}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gold-soft/5">
                              <span className={`text-[10px] tracking-[0.2em] uppercase ${
                                getDaysUntil(event.date) === 'Today' || getDaysUntil(event.date) === 'Tomorrow' ? 'text-gold-soft' : 'text-sand/40'
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
                <div className="py-16 text-center bg-charcoal-deep border border-gold-soft/10">
                  <Calendar size={40} className="mx-auto text-gold-soft/40 mb-6" />
                  <p className="font-display text-xl text-ivory-cream mb-4">No Upcoming Events</p>
                  <p className="text-sand text-sm mb-8">Connect your calendar to see personalized outfit suggestions.</p>
                  <Link
                    href="/profile/calendar-settings"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gold-soft text-noir hover:bg-gold-deep transition-colors"
                  >
                    <span className="text-sm tracking-[0.15em] uppercase">Connect Calendar</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Event Details & Suggestions */}
            <div className="lg:col-span-2">
              {selectedEvent ? (
                <div className="space-y-8">
                  {/* Event Header */}
                  <div className="bg-charcoal-deep border border-gold-soft/10 p-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1.5 border border-gold-soft/30 text-[10px] tracking-[0.2em] uppercase text-gold-soft">
                            {eventTypeLabels[selectedEvent.eventType]}
                          </span>
                          {selectedEvent.dressCode && (
                            <span className="px-3 py-1.5 border border-sand/30 text-[10px] tracking-[0.2em] uppercase text-sand">
                              {dressCodeLabels[selectedEvent.dressCode]}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                          {selectedEvent.title}
                        </h2>
                      </div>
                      {selectedEvent.weather && (
                        <div className="text-right flex-shrink-0 p-4 bg-noir border border-gold-soft/5">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            {selectedEvent.weather.condition.includes('Clear') || selectedEvent.weather.condition.includes('Sunny') ? (
                              <Sun size={18} className="text-gold-soft" />
                            ) : (
                              <Cloud size={18} className="text-sand" />
                            )}
                            <span className="font-display text-2xl text-ivory-cream">
                              {selectedEvent.weather.temperature}°{selectedEvent.weather.unit}
                            </span>
                          </div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-sand/50">{selectedEvent.weather.condition}</p>
                        </div>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6 text-sm border-t border-gold-soft/10 pt-6">
                      <div className="flex items-center gap-3 text-sand">
                        <Calendar size={16} className="text-gold-soft/40" />
                        <span>{formatDate(selectedEvent.date).full}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sand">
                        <Clock size={16} className="text-gold-soft/40" />
                        <span>{selectedEvent.time}{selectedEvent.endTime ? ` — ${selectedEvent.endTime}` : ''}</span>
                      </div>
                      {selectedEvent.venue && (
                        <div className="flex items-center gap-3 text-sand">
                          <MapPin size={16} className="text-gold-soft/40" />
                          <span>{selectedEvent.venue}</span>
                        </div>
                      )}
                    </div>
                    {selectedEvent.description && (
                      <p className="mt-6 text-sand text-sm leading-relaxed border-t border-gold-soft/10 pt-6">
                        {selectedEvent.description}
                      </p>
                    )}
                  </div>

                  {/* Outfit Suggestions */}
                  {selectedEvent.outfitSuggestions && selectedEvent.outfitSuggestions.length > 0 && (
                    <div>
                      <div className="flex items-end justify-between mb-8">
                        <div>
                          <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-2">Curated For You</span>
                          <h3 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-ivory-cream leading-[1.1]">
                            Outfit Suggestions
                          </h3>
                        </div>
                      </div>

                      {/* Suggestion Tabs */}
                      {selectedEvent.outfitSuggestions.length > 1 && (
                        <div className="flex gap-1 mb-8 border-b border-gold-soft/10" role="tablist">
                          {selectedEvent.outfitSuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.id}
                              role="tab"
                              aria-selected={selectedSuggestion === index}
                              onClick={() => setSelectedSuggestion(index)}
                              className={`px-6 py-4 text-sm tracking-[0.1em] uppercase transition-all relative ${
                                selectedSuggestion === index ? 'text-gold-soft' : 'text-sand hover:text-ivory-cream'
                              }`}
                            >
                              {suggestion.name}
                              {selectedSuggestion === index && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-soft" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Selected Suggestion */}
                      {selectedEvent.outfitSuggestions[selectedSuggestion] && (
                        <div>
                          <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-display text-xl text-ivory-cream">
                                {selectedEvent.outfitSuggestions[selectedSuggestion].name}
                              </h4>
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-1 bg-charcoal-deep overflow-hidden">
                                  <div className="h-full bg-gold-soft" style={{ width: `${selectedEvent.outfitSuggestions[selectedSuggestion].confidence}%` }} />
                                </div>
                                <span className="text-[10px] tracking-[0.2em] uppercase text-sand/50">
                                  {selectedEvent.outfitSuggestions[selectedSuggestion].confidence}% match
                                </span>
                              </div>
                            </div>
                            <p className="text-sand leading-relaxed">
                              {selectedEvent.outfitSuggestions[selectedSuggestion].description}
                            </p>
                          </div>

                          {/* Outfit Items */}
                          <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            {selectedEvent.outfitSuggestions[selectedSuggestion].items.map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-5 border ${
                                  item.type === 'wardrobe'
                                    ? 'border-green-500/20 bg-green-900/10'
                                    : 'border-gold-soft/20 bg-gold-soft/5'
                                }`}
                              >
                                <div className="flex gap-5">
                                  <Link
                                    href={`/product/${item.product.slug}`}
                                    className="group relative w-24 h-32 overflow-hidden flex-shrink-0 bg-charcoal-deep"
                                    onMouseEnter={() => setActiveHover(idx)}
                                    onMouseLeave={() => setActiveHover(null)}
                                  >
                                    <Image
                                      src={item.product.images[0]?.url || ''}
                                      alt={item.product.name}
                                      fill
                                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      {item.type === 'wardrobe' ? (
                                        <span className="px-2 py-1 bg-green-900/30 text-green-400 text-[9px] tracking-[0.15em] uppercase">In Wardrobe</span>
                                      ) : (
                                        <span className="px-2 py-1 bg-gold-soft/10 text-gold-soft text-[9px] tracking-[0.15em] uppercase">Suggested</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] tracking-[0.25em] uppercase text-sand/50 mb-1">{item.product.brandName}</p>
                                    <Link href={`/product/${item.product.slug}`}>
                                      <h5 className="font-display text-base text-ivory-cream hover:text-gold-soft transition-colors line-clamp-1">
                                        {item.product.name}
                                      </h5>
                                    </Link>
                                    <p className="text-sm text-sand mt-2">€{item.product.price.toLocaleString()}</p>
                                    {item.note && <p className="text-xs text-sand/50 mt-2 line-clamp-2">{item.note}</p>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Style Notes */}
                          {selectedEvent.outfitSuggestions[selectedSuggestion].agiReasoning && (
                            <div className="p-6 bg-charcoal-deep border border-gold-soft/10 mb-8">
                              <div className="flex items-center gap-2 mb-3">
                                <Crown size={12} className="text-gold-soft" />
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/50">Style Notes</p>
                              </div>
                              <p className="text-sand text-sm leading-relaxed">
                                {selectedEvent.outfitSuggestions[selectedSuggestion].agiReasoning}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={handleSaveOutfit}
                              className="px-8 py-4 bg-gold-soft text-noir hover:bg-gold-deep transition-colors text-sm tracking-[0.15em] uppercase"
                            >
                              Save Outfit
                            </button>
                            <button
                              onClick={handleAddToConsiderations}
                              className="px-8 py-4 border border-gold-soft/30 text-gold-soft hover:border-gold-soft transition-colors text-sm tracking-[0.15em] uppercase"
                            >
                              Add to Considerations
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center bg-charcoal-deep border border-gold-soft/10">
                  <Calendar size={40} className="mx-auto text-gold-soft/40 mb-6" />
                  <p className="font-display text-xl text-ivory-cream mb-4">Select an Event</p>
                  <p className="text-sand text-sm">Choose an event from the list to see outfit suggestions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
