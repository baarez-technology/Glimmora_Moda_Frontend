'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Crown,
  MapPin,
  Clock,
  Star,
  Sparkles,
  Gem,
  Palette,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { ExclusiveEvent, ExclusiveEventType } from '@/types/uhni';

export default function EventsPage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [events, setEvents] = useState<ExclusiveEvent[]>([]);
  const [filter, setFilter] = useState<'all' | ExclusiveEventType>('all');

  useEffect(() => {
    uhniService.getExclusiveEvents().then(res => {
      if (res.data) setEvents(res.data);
    }).catch(() => {
      showToast('Failed to load events', 'error');
    }).finally(() => {
      setIsLoaded(true);
    });
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const getTypeIcon = (type: ExclusiveEventType) => {
    switch (type) {
      case 'exhibition': return Palette;
      case 'gala': return Star;
      case 'masterclass': return Sparkles;
      case 'launch': return Gem;
      case 'experience': return Crown;
    }
  };

  const getTypeBadge = (type: ExclusiveEventType) => {
    switch (type) {
      case 'exhibition': return 'bg-info/10 text-info';
      case 'gala': return 'bg-gold-soft/20 text-gold-deep';
      case 'masterclass': return 'bg-purple-100 text-purple-700';
      case 'launch': return 'bg-green-100 text-green-700';
      case 'experience': return 'bg-champagne/30 text-gold-muted';
    }
  };

  const getRegStatusBadge = (status: ExclusiveEvent['registrationStatus']) => {
    switch (status) {
      case 'open': return 'bg-success/10 text-success';
      case 'registered': return 'bg-info/10 text-info';
      case 'waitlist': return 'bg-warning/10 text-warning';
      case 'closed': return 'bg-stone/10 text-stone';
    }
  };

  const getRegStatusLabel = (status: ExclusiveEvent['registrationStatus']) => {
    switch (status) {
      case 'open': return 'Registration Open';
      case 'registered': return 'You\'re Registered';
      case 'waitlist': return 'Waitlist';
      case 'closed': return 'Closed';
    }
  };

  const handleRegister = (event: ExclusiveEvent) => {
    setEvents(prev => prev.map(e =>
      e.id === event.id
        ? { ...e, registrationStatus: 'registered' as const, spotsLeft: Math.max(0, e.spotsLeft - 1) }
        : e
    ));
    showToast(`Registration confirmed for ${event.title}`, 'success');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const eventTypes: { value: 'all' | ExclusiveEventType; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'exhibition', label: 'Exhibitions' },
    { value: 'gala', label: 'Galas' },
    { value: 'masterclass', label: 'Masterclasses' },
    { value: 'launch', label: 'Launches' },
    { value: 'experience', label: 'Experiences' }
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
              Exclusive Events
            </h1>
            <p className="text-sand mt-3">Curated experiences and invitations for distinguished members</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
                filter === type.value ? 'bg-charcoal-deep text-ivory-cream' : 'bg-white text-stone hover:text-charcoal-deep'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.map(event => {
            const TypeIcon = getTypeIcon(event.type);
            return (
              <div key={event.id} className="bg-white border border-sand/30">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getTypeBadge(event.type)}`}>
                          <TypeIcon size={12} className="inline mr-1" />
                          {event.type}
                        </span>
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getRegStatusBadge(event.registrationStatus)}`}>
                          {getRegStatusLabel(event.registrationStatus)}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-charcoal-deep mb-1">{event.title}</h3>
                      <p className="text-sm text-stone">Hosted by {event.host}</p>
                    </div>
                    {event.registrationStatus === 'open' && (
                      <button
                        onClick={() => handleRegister(event)}
                        className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase flex-shrink-0"
                      >
                        Register
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-stone mb-6">{event.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-stone" />
                      <div>
                        <p className="text-xs text-stone">Date</p>
                        <p className="text-sm text-charcoal-deep">{formatDate(event.date)}</p>
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
                        <p className="text-sm text-charcoal-deep">{event.venue}, {event.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-stone" />
                      <div>
                        <p className="text-xs text-stone">Availability</p>
                        <p className="text-sm text-charcoal-deep">{event.spotsLeft} spots left</p>
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

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={40} className="text-stone/40 mx-auto mb-4" />
            <p className="text-stone">No events match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
