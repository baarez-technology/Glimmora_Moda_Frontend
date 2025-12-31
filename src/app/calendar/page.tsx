'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Cloud,
  Sun,
  ChevronRight,
  Check,
  Plus,
  ArrowRight,
  Briefcase,
  Wine,
  Heart,
  Plane,
  Music,
  Users,
  Star
} from 'lucide-react';
import { mockCalendarConnections } from '@/data/mock-data';
import { useApp } from '@/context/AppContext';
import type { CalendarEvent, EventType } from '@/types';

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
  const { calendarEvents, saveOutfit, addToConsiderations, showToast } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    calendarEvents[0] || null
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const connectedCalendar = mockCalendarConnections.find(c => c.connected);

  const handleSaveOutfit = () => {
    if (!selectedEvent || !selectedEvent.outfitSuggestions?.[selectedSuggestion]) return;

    const suggestion = selectedEvent.outfitSuggestions[selectedSuggestion];
    const productIds = suggestion.items.map(item => item.product.id);

    saveOutfit(
      `${suggestion.name} for ${selectedEvent.title}`,
      productIds,
      selectedEvent.id
    );
  };

  const handleAddToConsiderations = () => {
    if (!selectedEvent || !selectedEvent.outfitSuggestions?.[selectedSuggestion]) return;

    const suggestion = selectedEvent.outfitSuggestions[selectedSuggestion];
    const suggestedItems = suggestion.items.filter(item => item.type === 'suggested');

    if (suggestedItems.length === 0) {
      showToast('All items are already in your wardrobe', 'info');
      return;
    }

    suggestedItems.forEach(item => {
      addToConsiderations(
        item.product,
        {},
        `Suggested for ${selectedEvent.title}: ${item.note || suggestion.description}`
      );
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

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Page Header
          ============================================ */}
      <section className="bg-charcoal-deep py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
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
              {connectedCalendar && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 border border-success/30 text-success">
                    <Check size={14} />
                    <span>{connectedCalendar.provider === 'google' ? 'Google Calendar' : connectedCalendar.provider}</span>
                  </div>
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
                  {calendarEvents.map((event) => {
                    const dateInfo = formatDate(event.date);
                    const isSelected = selectedEvent?.id === event.id;

                    return (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setSelectedSuggestion(0);
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

                  {/* Outfit Suggestions */}
                  {selectedEvent.outfitSuggestions && selectedEvent.outfitSuggestions.length > 0 && (
                    <div>
                      <div className="flex items-end justify-between mb-8">
                        <div>
                          <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                            Curated For You
                          </span>
                          <h3 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                            Outfit Suggestions
                          </h3>
                        </div>
                      </div>

                      {/* Suggestion Tabs */}
                      {selectedEvent.outfitSuggestions.length > 1 && (
                        <div className="flex gap-1 mb-8 border-b border-sand">
                          {selectedEvent.outfitSuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.id}
                              onClick={() => setSelectedSuggestion(index)}
                              className={`px-6 py-4 text-sm tracking-[0.1em] uppercase transition-all relative ${
                                selectedSuggestion === index
                                  ? 'text-charcoal-deep'
                                  : 'text-stone hover:text-charcoal-deep'
                              }`}
                            >
                              {suggestion.name}
                              {selectedSuggestion === index && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-deep" />
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
                              <h4 className="font-display text-xl text-charcoal-deep">
                                {selectedEvent.outfitSuggestions[selectedSuggestion].name}
                              </h4>
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-1 bg-sand overflow-hidden">
                                  <div
                                    className="h-full bg-gold-muted"
                                    style={{ width: `${selectedEvent.outfitSuggestions[selectedSuggestion].confidence}%` }}
                                  />
                                </div>
                                <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">
                                  {selectedEvent.outfitSuggestions[selectedSuggestion].confidence}% match
                                </span>
                              </div>
                            </div>
                            <p className="text-stone leading-relaxed">
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
                                    ? 'border-success/30 bg-success/5'
                                    : 'border-gold-muted/30 bg-gold-muted/5'
                                }`}
                              >
                                <div className="flex gap-5">
                                  <Link
                                    href={`/product/${item.product.slug}`}
                                    className="group relative w-24 h-32 overflow-hidden flex-shrink-0"
                                    onMouseEnter={() => setActiveHover(idx)}
                                    onMouseLeave={() => setActiveHover(null)}
                                  >
                                    <Image
                                      src={item.product.images[0]?.url || ''}
                                      alt={item.product.name}
                                      fill
                                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-all duration-500 flex items-center justify-center">
                                      <div className={`w-10 h-10 bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === idx ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                                        <ArrowRight size={14} className="text-charcoal-deep" />
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      {item.type === 'wardrobe' ? (
                                        <span className="px-2 py-1 bg-success/20 text-success text-[9px] tracking-[0.15em] uppercase">
                                          In Wardrobe
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 bg-gold-muted/20 text-gold-muted text-[9px] tracking-[0.15em] uppercase">
                                          Suggested
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">{item.product.brandName}</p>
                                    <Link
                                      href={`/product/${item.product.slug}`}
                                      className="font-display text-lg text-charcoal-deep hover:text-charcoal-warm transition-colors line-clamp-1"
                                    >
                                      {item.product.name}
                                    </Link>
                                    <p className="text-xs text-stone mt-1">{item.category}</p>
                                    {item.note && (
                                      <p className="text-xs text-taupe mt-3 italic">{item.note}</p>
                                    )}
                                  </div>
                                </div>

                                {item.type === 'suggested' && (
                                  <div className="mt-4 pt-4 border-t border-sand/50 flex items-center justify-between">
                                    <span className="font-display text-lg text-charcoal-deep">
                                      €{item.product.price.toLocaleString()}
                                    </span>
                                    <Link
                                      href={`/product/${item.product.slug}`}
                                      className="group inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                                    >
                                      <span>View</span>
                                      <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Style Note */}
                          <div className="p-6 bg-charcoal-deep mb-8">
                            <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 mb-4">Style Note</p>
                            <p className="text-taupe leading-relaxed">
                              {selectedEvent.outfitSuggestions[selectedSuggestion].agiReasoning}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-4">
                            <button
                              onClick={handleSaveOutfit}
                              className="group py-4 px-8 bg-charcoal-deep text-ivory-cream flex items-center gap-3 transition-all duration-300 hover:bg-noir"
                            >
                              <Check size={16} />
                              <span className="text-sm tracking-[0.15em] uppercase">Save This Look</span>
                            </button>
                            <button
                              onClick={handleAddToConsiderations}
                              className="group py-4 px-8 border border-charcoal-deep text-charcoal-deep flex items-center gap-3 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream"
                            >
                              <Plus size={16} />
                              <span className="text-sm tracking-[0.15em] uppercase">Add to Considerations</span>
                            </button>
                          </div>
                        </div>
                      )}
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
