'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Cloud,
  Sun,
  Sparkles,
  ChevronRight,
  Check,
  Plus,
  Settings,
  Briefcase,
  Wine,
  Heart,
  Plane,
  Music,
  Users,
  Star
} from 'lucide-react';
import { mockCalendarEvents, mockCalendarConnections } from '@/data/mock-data';
import type { CalendarEvent, EventType } from '@/types';

const eventTypeIcons: Record<EventType, React.ReactNode> = {
  business_meeting: <Briefcase size={18} />,
  dinner_party: <Wine size={18} />,
  wedding: <Heart size={18} />,
  gala: <Star size={18} />,
  gallery_opening: <Sparkles size={18} />,
  cocktail_party: <Wine size={18} />,
  travel: <Plane size={18} />,
  date_night: <Heart size={18} />,
  brunch: <Sun size={18} />,
  conference: <Users size={18} />,
  interview: <Briefcase size={18} />,
  casual_outing: <Sun size={18} />,
  theater: <Music size={18} />,
  concert: <Music size={18} />,
  other: <Calendar size={18} />
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    mockCalendarEvents[0] || null
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);

  const connectedCalendar = mockCalendarConnections.find(c => c.connected);

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
      {/* Header */}
      <div className="bg-white border-b border-sand">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gold-muted/20 rounded-full flex items-center justify-center">
                  <Calendar size={20} className="text-gold-deep" />
                </div>
                <h1 className="font-display text-3xl text-charcoal-deep">
                  Style Calendar
                </h1>
              </div>
              <p className="text-stone">
                Your upcoming events with personalized outfit suggestions
              </p>
            </div>

            <Link
              href="/profile/calendar-settings"
              className="flex items-center gap-2 px-4 py-2 border border-sand rounded-full text-sm text-charcoal-warm hover:border-charcoal-deep transition-colors"
            >
              <Settings size={16} />
              Calendar Settings
            </Link>
          </div>

          {/* Connected Calendar Info */}
          {connectedCalendar && (
            <div className="mt-6 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full">
                <Check size={14} />
                <span>Connected to {connectedCalendar.provider === 'google' ? 'Google Calendar' : connectedCalendar.provider}</span>
              </div>
              <span className="text-greige">
                Last synced: {new Date(connectedCalendar.lastSynced || '').toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-display text-lg text-charcoal-deep mb-4">Upcoming Events</h2>

            {mockCalendarEvents.length > 0 ? (
              <div className="space-y-3">
                {mockCalendarEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  const isSelected = selectedEvent?.id === event.id;

                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setSelectedSuggestion(0);
                      }}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-white shadow-md border-2 border-gold-muted'
                          : 'bg-white shadow-sm border border-transparent hover:border-sand'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-14 text-center">
                          <p className="text-xs text-greige uppercase">{dateInfo.day}</p>
                          <p className="font-display text-2xl text-charcoal-deep">{dateInfo.date}</p>
                          <p className="text-xs text-greige">{dateInfo.month}</p>
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`p-1 rounded ${isSelected ? 'bg-gold-muted/20 text-gold-deep' : 'bg-parchment text-stone'}`}>
                              {eventTypeIcons[event.eventType]}
                            </span>
                            <span className="text-xs text-greige uppercase tracking-wide">
                              {eventTypeLabels[event.eventType]}
                            </span>
                          </div>
                          <h3 className="font-medium text-charcoal-deep truncate">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {event.time}
                            </span>
                            {event.venue && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin size={12} />
                                {event.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Days Until */}
                      <div className="mt-3 pt-3 border-t border-sand/50">
                        <span className={`text-xs font-medium ${
                          getDaysUntil(event.date) === 'Today' || getDaysUntil(event.date) === 'Tomorrow'
                            ? 'text-gold-deep'
                            : 'text-greige'
                        }`}>
                          {getDaysUntil(event.date)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <Calendar size={40} className="mx-auto text-greige mb-4" />
                <p className="text-stone">No upcoming events</p>
                <Link
                  href="/profile/calendar-settings"
                  className="text-sm text-gold-muted hover:text-gold-deep mt-2 inline-block"
                >
                  Connect your calendar
                </Link>
              </div>
            )}
          </div>

          {/* Event Details & Suggestions */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Event Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gold-muted/20 text-gold-deep text-xs rounded-full uppercase tracking-wide">
                          {eventTypeLabels[selectedEvent.eventType]}
                        </span>
                        {selectedEvent.dressCode && (
                          <span className="px-3 py-1 bg-sapphire-mist/10 text-sapphire-mist text-xs rounded-full">
                            {dressCodeLabels[selectedEvent.dressCode]}
                          </span>
                        )}
                      </div>
                      <h2 className="font-display text-2xl text-charcoal-deep">
                        {selectedEvent.title}
                      </h2>
                    </div>
                    {selectedEvent.weather && (
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 justify-end">
                          {selectedEvent.weather.condition.includes('Clear') || selectedEvent.weather.condition.includes('Sunny') ? (
                            <Sun size={20} className="text-gold-muted" />
                          ) : (
                            <Cloud size={20} className="text-stone" />
                          )}
                          <span className="font-display text-xl text-charcoal-deep">
                            {selectedEvent.weather.temperature}°{selectedEvent.weather.unit}
                          </span>
                        </div>
                        <p className="text-xs text-greige">{selectedEvent.weather.condition}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-stone">
                      <Calendar size={16} className="text-greige" />
                      <span>{formatDate(selectedEvent.date).full}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone">
                      <Clock size={16} className="text-greige" />
                      <span>{selectedEvent.time}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}</span>
                    </div>
                    {selectedEvent.venue && (
                      <div className="flex items-center gap-2 text-stone">
                        <MapPin size={16} className="text-greige" />
                        <span>{selectedEvent.venue}</span>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <p className="mt-4 text-stone text-sm border-t border-sand pt-4">
                      {selectedEvent.description}
                    </p>
                  )}
                </div>

                {/* Outfit Suggestions */}
                {selectedEvent.outfitSuggestions && selectedEvent.outfitSuggestions.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles size={20} className="text-gold-muted" />
                      <h3 className="font-display text-xl text-charcoal-deep">
                        AGI Outfit Suggestions
                      </h3>
                    </div>

                    {/* Suggestion Tabs */}
                    {selectedEvent.outfitSuggestions.length > 1 && (
                      <div className="flex gap-2 mb-6">
                        {selectedEvent.outfitSuggestions.map((suggestion, index) => (
                          <button
                            key={suggestion.id}
                            onClick={() => setSelectedSuggestion(index)}
                            className={`px-4 py-2 rounded-full text-sm transition-colors ${
                              selectedSuggestion === index
                                ? 'bg-charcoal-deep text-ivory-cream'
                                : 'bg-parchment text-stone hover:bg-sand'
                            }`}
                          >
                            {suggestion.name}
                            <span className="ml-2 text-xs opacity-70">{suggestion.confidence}%</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Suggestion */}
                    {selectedEvent.outfitSuggestions[selectedSuggestion] && (
                      <div>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-charcoal-deep">
                              {selectedEvent.outfitSuggestions[selectedSuggestion].name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <div className="w-20 h-2 bg-parchment rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gold-muted rounded-full"
                                  style={{ width: `${selectedEvent.outfitSuggestions[selectedSuggestion].confidence}%` }}
                                />
                              </div>
                              <span className="text-xs text-greige">
                                {selectedEvent.outfitSuggestions[selectedSuggestion].confidence}% match
                              </span>
                            </div>
                          </div>
                          <p className="text-stone text-sm">
                            {selectedEvent.outfitSuggestions[selectedSuggestion].description}
                          </p>
                        </div>

                        {/* Outfit Items */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          {selectedEvent.outfitSuggestions[selectedSuggestion].items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border ${
                                item.type === 'wardrobe'
                                  ? 'border-success/30 bg-success/5'
                                  : 'border-gold-muted/30 bg-gold-muted/5'
                              }`}
                            >
                              <div className="flex gap-4">
                                <Link
                                  href={`/product/${item.product.slug}`}
                                  className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0"
                                >
                                  <Image
                                    src={item.product.images[0]?.url || ''}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform"
                                  />
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {item.type === 'wardrobe' ? (
                                      <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded">
                                        In Wardrobe
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-gold-muted/20 text-gold-deep text-xs rounded">
                                        Suggested
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-greige">{item.product.brandName}</p>
                                  <Link
                                    href={`/product/${item.product.slug}`}
                                    className="font-medium text-charcoal-deep hover:text-gold-deep transition-colors line-clamp-1"
                                  >
                                    {item.product.name}
                                  </Link>
                                  <p className="text-xs text-stone mt-1">{item.category}</p>
                                  {item.note && (
                                    <p className="text-xs text-greige mt-2 italic">{item.note}</p>
                                  )}
                                </div>
                              </div>

                              {item.type === 'suggested' && (
                                <div className="mt-3 pt-3 border-t border-sand/50 flex items-center justify-between">
                                  <span className="text-sm font-medium text-charcoal-deep">
                                    €{item.product.price.toLocaleString()}
                                  </span>
                                  <Link
                                    href={`/product/${item.product.slug}`}
                                    className="flex items-center gap-1 text-xs text-gold-muted hover:text-gold-deep"
                                  >
                                    View Product
                                    <ChevronRight size={14} />
                                  </Link>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* AGI Reasoning */}
                        <div className="p-4 bg-sapphire-deep/5 rounded-xl border border-sapphire-subtle/20">
                          <div className="flex items-start gap-3">
                            <Sparkles size={18} className="text-sapphire-mist flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-sapphire-mist uppercase tracking-wide mb-1">
                                Fashion Intelligence Reasoning
                              </p>
                              <p className="text-sm text-charcoal-warm">
                                {selectedEvent.outfitSuggestions[selectedSuggestion].agiReasoning}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button className="btn-primary">
                            <Check size={18} />
                            Save This Look
                          </button>
                          <button className="btn-secondary">
                            <Plus size={18} />
                            Add Items to Considerations
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <Sparkles size={48} className="mx-auto text-greige mb-4" />
                <h3 className="font-display text-xl text-charcoal-deep mb-2">
                  Select an Event
                </h3>
                <p className="text-stone">
                  Choose an event from the list to see personalized outfit suggestions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
