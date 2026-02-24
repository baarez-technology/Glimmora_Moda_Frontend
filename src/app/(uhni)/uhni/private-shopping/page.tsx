'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  Crown,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { PrivateShoppingEvent } from '@/types/uhni';

export default function PrivateShoppingPage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [events, setEvents] = useState<PrivateShoppingEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    uhniService.getPrivateShopping().then(res => {
      if (res.data) setEvents(res.data);
    }).catch(() => {
      showToast('Failed to load shopping events', 'error');
    }).finally(() => {
      setIsLoaded(true);
    });
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return event.status === 'upcoming' || event.status === 'invite_only';
    if (filter === 'confirmed') return event.status === 'rsvp_confirmed';
    if (filter === 'completed') return event.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: PrivateShoppingEvent['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-info/10 text-info';
      case 'rsvp_confirmed': return 'bg-success/10 text-success';
      case 'completed': return 'bg-stone/10 text-stone';
      case 'invite_only': return 'bg-gold-soft/20 text-gold-deep';
    }
  };

  const getStatusLabel = (status: PrivateShoppingEvent['status']) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'rsvp_confirmed': return 'RSVP Confirmed';
      case 'completed': return 'Completed';
      case 'invite_only': return 'Invite Only';
    }
  };

  const handleRSVP = (event: PrivateShoppingEvent) => {
    setEvents(prev => prev.map(e =>
      e.id === event.id
        ? { ...e, status: 'rsvp_confirmed' as const, guestsConfirmed: e.guestsConfirmed + 1 }
        : e
    ));
    showToast(`RSVP confirmed for ${event.title}`, 'success');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              Private Shopping
            </h1>
            <p className="text-sand mt-3">Invitation-only shopping events with the world&apos;s finest maisons</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Filters */}
        <div className="flex items-center gap-2 mb-8">
          {(['all', 'upcoming', 'confirmed', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors ${
                filter === f ? 'bg-charcoal-deep text-ivory-cream' : 'bg-white text-stone hover:text-charcoal-deep'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white border border-sand/30">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                      <span className="text-xs text-stone">{event.designer}</span>
                    </div>
                    <h3 className="font-display text-2xl text-charcoal-deep">{event.title}</h3>
                  </div>
                  {event.status !== 'completed' && event.status !== 'rsvp_confirmed' && (
                    <button
                      onClick={() => handleRSVP(event)}
                      className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase"
                    >
                      RSVP
                    </button>
                  )}
                  {event.status === 'rsvp_confirmed' && (
                    <span className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle size={16} />
                      Confirmed
                    </span>
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
                      <p className="text-sm text-charcoal-deep">{event.time} ({event.duration})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-stone" />
                    <div>
                      <p className="text-xs text-stone">Venue</p>
                      <p className="text-sm text-charcoal-deep">{event.venue}, {event.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-stone" />
                    <div>
                      <p className="text-xs text-stone">Guests</p>
                      <p className="text-sm text-charcoal-deep">{event.guestsConfirmed}/{event.maxGuests} confirmed</p>
                    </div>
                  </div>
                </div>

                {event.dressCode && (
                  <p className="text-xs text-stone mb-4">
                    <span className="tracking-wider uppercase">Dress Code:</span> {event.dressCode}
                  </p>
                )}

                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Perks</p>
                  <div className="flex flex-wrap gap-2">
                    {event.perks.map(perk => (
                      <span key={perk} className="px-3 py-1.5 bg-parchment text-xs text-charcoal-deep">
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="text-stone/40 mx-auto mb-4" />
            <p className="text-stone">No events match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
