'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Calendar, Video, Clock, User, Plus, Check, X, ChevronRight, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface StylingSession {
  id: string;
  type: 'virtual' | 'in-person';
  duration: 30 | 60 | 90;
  date: string;
  time: string;
  stylist: {
    name: string;
    avatar: string;
    title: string;
    specialties: string[];
  };
  status: 'scheduled' | 'completed' | 'cancelled';
  focus?: string;
  notes?: string;
}

export default function StylingSessionsPage() {
  const router = useRouter();
  const { isUHNI, isHydrated, concierge, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [sessions, setSessions] = useState<StylingSession[]>([
    {
      id: '1',
      type: 'virtual',
      duration: 60,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      time: '14:00',
      stylist: {
        name: concierge?.name || 'Isabella Moretti',
        avatar: concierge?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        title: 'Senior Style Consultant',
        specialties: ['Capsule Wardrobes', 'Event Styling', 'Investment Pieces']
      },
      status: 'scheduled',
      focus: 'Spring/Summer 2025 Wardrobe Planning',
      notes: 'Discuss upcoming gallery opening and vacation wardrobe needs'
    }
  ]);

  const [bookingForm, setBookingForm] = useState({
    type: 'virtual' as 'virtual' | 'in-person',
    duration: 60,
    date: '',
    time: '',
    focus: '',
    notes: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (isHydrated && !isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, isHydrated, router]);

  if (isHydrated && !isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleBookSession = () => {
    const newSession: StylingSession = {
      id: `session-${Date.now()}`,
      type: bookingForm.type,
      duration: bookingForm.duration as 30 | 60 | 90,
      date: bookingForm.date,
      time: bookingForm.time,
      stylist: {
        name: concierge?.name || 'Isabella Moretti',
        avatar: concierge?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        title: 'Senior Style Consultant',
        specialties: ['Capsule Wardrobes', 'Event Styling', 'Investment Pieces']
      },
      status: 'scheduled',
      focus: bookingForm.focus,
      notes: bookingForm.notes
    };

    setSessions([newSession, ...sessions]);
    setShowBookingModal(false);
    showToast('Styling session booked successfully!', 'success');

    // Reset form
    setBookingForm({
      type: 'virtual',
      duration: 60,
      date: '',
      time: '',
      focus: '',
      notes: ''
    });
  };

  const sessionTypes = [
    {
      type: 'virtual' as const,
      title: 'Virtual Session',
      icon: Video,
      description: 'Video consultation from anywhere',
      price: 'Complimentary'
    },
    {
      type: 'in-person' as const,
      title: 'In-Person Session',
      icon: User,
      description: 'Personalized boutique experience',
      price: 'Complimentary'
    }
  ];

  const durations = [
    { minutes: 30, label: '30 minutes', focus: 'Quick consultation' },
    { minutes: 60, label: '1 hour', focus: 'Comprehensive styling' },
    { minutes: 90, label: '90 minutes', focus: 'Deep wardrobe analysis' }
  ];

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Sparkles size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    Personal Styling
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Personal Styling Sessions
                </h1>
                <p className="text-sand mt-2">Expert styling consultations tailored to you</p>
              </div>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm tracking-[0.1em] uppercase">Book Session</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Sessions */}
            <div>
              <h2 className="font-display text-2xl text-charcoal-deep mb-6">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-16 bg-white">
                  <Calendar size={48} className="mx-auto text-stone mb-4" />
                  <p className="text-stone mb-6">No upcoming sessions scheduled</p>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-sm tracking-[0.15em] uppercase">Book Your First Session</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="bg-white p-6">
                      <div className="flex gap-6">
                        {/* Stylist Avatar */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold-soft/30">
                          <Image
                            src={session.stylist.avatar}
                            alt={session.stylist.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Session Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-display text-xl text-charcoal-deep">{session.stylist.name}</p>
                              <p className="text-sm text-taupe">{session.stylist.title}</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-gold-soft/10 text-gold-muted text-xs tracking-[0.1em] uppercase">
                              {session.type === 'virtual' ? <Video size={12} /> : <User size={12} />}
                              <span>{session.type}</span>
                            </div>
                          </div>

                          {session.focus && (
                            <div className="p-4 bg-parchment mb-3">
                              <p className="text-sm text-charcoal-deep font-medium">{session.focus}</p>
                              {session.notes && (
                                <p className="text-xs text-stone mt-2">{session.notes}</p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-6 text-sm text-stone">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>{new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{session.time} ({session.duration} min)</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 mt-4">
                            <button className="flex-1 py-2 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.1em] uppercase">
                              Join Session
                            </button>
                            <button className="px-4 py-2 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.1em] uppercase">
                              Reschedule
                            </button>
                            <button className="px-4 py-2 border border-error/30 text-error hover:border-error transition-colors text-sm tracking-[0.1em] uppercase">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-6">Past Sessions</h2>
                <div className="space-y-4">
                  {pastSessions.map((session) => (
                    <div key={session.id} className="bg-white p-6 opacity-75">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-parchment flex items-center justify-center flex-shrink-0">
                          <Check size={20} className="text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal-deep">{session.focus || 'Styling Session'}</p>
                          <p className="text-sm text-taupe">{new Date(session.date).toLocaleDateString()} • {session.stylist.name}</p>
                        </div>
                        <button className="flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted transition-colors">
                          <span className="tracking-[0.1em] uppercase">View Notes</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Concierge Card */}
            {concierge && (
              <div className="bg-charcoal-deep p-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gold-soft/30">
                  <Image
                    src={concierge.avatar}
                    alt={concierge.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-display text-xl text-ivory-cream text-center mb-1">{concierge.name}</h3>
                <p className="text-sm text-taupe text-center mb-4">{concierge.title}</p>

                <div className="p-4 bg-ivory-cream/5 mb-4">
                  <p className="text-xs text-sand mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {concierge.specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="text-xs px-2 py-1 bg-gold-soft/10 text-gold-soft">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/uhni/concierge"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span className="text-sm tracking-[0.1em] uppercase">Message</span>
                </Link>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-white p-6">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Session Benefits</h3>
              <ul className="space-y-3 text-sm text-stone">
                <li className="flex items-start gap-3">
                  <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Personalized wardrobe analysis & optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Expert recommendations for your lifestyle</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Investment piece guidance & sourcing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Event-specific styling solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Seasonal wardrobe planning</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white p-6">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/wardrobe"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">View Wardrobe</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/uhni/intelligence"
                  className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <span className="text-sm text-charcoal-deep">Style Insights</span>
                  <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-sand px-8 py-6 flex items-center justify-between z-10">
              <h2 className="font-display text-2xl text-charcoal-deep">Book Styling Session</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-sand/20 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Session Type */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-taupe mb-4">Session Type</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {sessionTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setBookingForm({ ...bookingForm, type: type.type })}
                      className={`p-6 border text-left transition-all ${
                        bookingForm.type === type.type
                          ? 'border-charcoal-deep bg-parchment'
                          : 'border-sand hover:border-charcoal-deep'
                      }`}
                    >
                      <type.icon size={24} className="mb-3 text-stone" />
                      <p className="font-display text-lg text-charcoal-deep mb-1">{type.title}</p>
                      <p className="text-sm text-stone mb-2">{type.description}</p>
                      <p className="text-xs text-gold-muted">{type.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-taupe mb-4">Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {durations.map((dur) => (
                    <button
                      key={dur.minutes}
                      onClick={() => setBookingForm({ ...bookingForm, duration: dur.minutes })}
                      className={`p-4 border text-center transition-all ${
                        bookingForm.duration === dur.minutes
                          ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                          : 'border-sand hover:border-charcoal-deep text-charcoal-deep'
                      }`}
                    >
                      <p className="font-display text-lg mb-1">{dur.label}</p>
                      <p className="text-xs opacity-70">{dur.focus}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm tracking-wider uppercase text-taupe mb-3">Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm tracking-wider uppercase text-taupe mb-3">Time</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
              </div>

              {/* Focus */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-taupe mb-3">Session Focus (Optional)</label>
                <input
                  type="text"
                  value={bookingForm.focus}
                  onChange={(e) => setBookingForm({ ...bookingForm, focus: e.target.value })}
                  placeholder="e.g., Spring wardrobe refresh, Event styling, Investment pieces"
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors placeholder:text-taupe"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-taupe mb-3">Additional Notes (Optional)</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={4}
                  placeholder="Any specific topics or items you'd like to discuss..."
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors resize-none placeholder:text-taupe"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSession}
                  disabled={!bookingForm.date || !bookingForm.time}
                  className="flex-1 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-[0.15em] uppercase"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
