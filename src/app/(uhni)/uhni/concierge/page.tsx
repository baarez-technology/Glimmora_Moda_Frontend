'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Crown, Phone, Mail, MessageCircle, Calendar, Clock, Globe, Award, Send, ChevronRight, X, User, Star, Users, Check, ClipboardList } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AppointmentType, ConciergeAppointment } from '@/types/uhni';
import type { Brand } from '@/types';
import { getAllBrands } from '@/services/recommendation.service';
import TasksSection from './TasksSection';
import { formatPrice } from '@/lib/currency';

interface Message {
  id: string;
  sender: 'user' | 'client' | 'concierge';
  content: string;
  timestamp: string;
}

const appointmentTypes: { value: AppointmentType; label: string; description: string; icon: string }[] = [
  { value: 'styling_session', label: 'Styling Session', description: 'Personal wardrobe consultation', icon: '👗' },
  { value: 'private_viewing', label: 'Private Viewing', description: 'Exclusive collection preview', icon: '🔒' },
  { value: 'consultation', label: 'Consultation', description: 'General fashion advisory', icon: '💬' },
  { value: 'fitting', label: 'Fitting', description: 'Bespoke fitting appointment', icon: '📐' },
];

const durationOptions = [30, 45, 60, 90, 120];

type PageTab = 'chat' | 'tasks';

export default function ConciergePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'tasks' ? 'tasks' : 'chat';
  const [pageTab, setPageTab] = useState<PageTab>(initialTab);
  const {
    concierge,
    showToast,
    conciergeAppointments,
    bookAppointment,
    cancelAppointment,
    calendarEvents,
    sourcingRequests,
    bespokeOrders,
    orders
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('uhni-concierge-messages');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [
      { id: '1', sender: 'concierge', content: 'Welcome back. How may I assist you today? I have updates on several items you may find interesting.', timestamp: new Date().toISOString() },
      { id: '2', sender: 'concierge', content: 'I noticed a private viewing event for Hermès next week in your area. Shall I arrange an invitation?', timestamp: new Date().toISOString() },
    ];
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBriefingId, setShowBriefingId] = useState<string | null>(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateType, setEscalateType] = useState<'complaint' | 'complex_request' | 'preference' | 'other'>('complex_request');
  const [escalated, setEscalated] = useState(false);

  // Booking form state
  const [bookingType, setBookingType] = useState<AppointmentType>('styling_session');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLocation, setBookingLocation] = useState<'in_store' | 'virtual' | 'home'>('in_store');
  const [bookingBrandId, setBookingBrandId] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    getAllBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('uhni-concierge-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle product context from product page
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = sessionStorage.getItem('concierge-product-context')
    if (!stored) return

    try {
      const context = JSON.parse(stored)

      // Only use if fresh (within 5 minutes)
      if (Date.now() - context.timestamp > 5 * 60 * 1000) {
        sessionStorage.removeItem('concierge-product-context')
        return
      }

      // Auto-inject a message about the product
      const productMessage: Message = {
        id: `msg-product-${Date.now()}`,
        sender: 'user',
        content: `I am looking at the ${context.productName} by ${context.brandName} — priced at ${formatPrice(context.price)}. Can you tell me more about it and whether it would suit me?`,
        timestamp: new Date().toISOString()
      }

      const conciergeResponse: Message = {
        id: `msg-product-reply-${Date.now()}`,
        sender: 'concierge',
        content: `Ah, the ${context.productName} by ${context.brandName} — an excellent choice. I have reviewed this piece against your style profile and wardrobe. Let me prepare a full assessment for you, including how it would complement your existing pieces and any upcoming occasions. Shall I also check current availability and whether there are any exclusive pricing arrangements available to you?`,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, productMessage, conciergeResponse])
      sessionStorage.removeItem('concierge-product-context')

    } catch {
      sessionStorage.removeItem('concierge-product-context')
    }
  }, []);

  // Context-aware suggestions based on client data
  const getContextualSuggestions = () => {
    const suggestions: string[] = []

    // Based on upcoming calendar events
    const upcomingEvents = calendarEvents?.filter(e =>
      new Date(e.date) > new Date() &&
      new Date(e.date) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    )
    if (upcomingEvents && upcomingEvents.length > 0) {
      suggestions.push(
        `Help me plan an outfit for ${upcomingEvents[0].title}`
      )
    }

    // Based on active sourcing requests
    const activeSourcing = sourcingRequests?.filter(r =>
      r.status === 'options_found' || r.status === 'awaiting_approval'
    )
    if (activeSourcing && activeSourcing.length > 0) {
      suggestions.push(
        `Review the sourcing options for ${activeSourcing[0].title}`
      )
    }

    // Based on active bespoke orders
    const activeBespoke = bespokeOrders?.filter(o =>
      o.status !== 'complete' && o.clientApprovalRequired && !o.clientApproved
    )
    if (activeBespoke && activeBespoke.length > 0) {
      suggestions.push(
        `I need to review the design for my ${activeBespoke[0].title}`
      )
    }

    // Based on upcoming appointment
    const nextAppt = (conciergeAppointments || []).find(a =>
      a.status !== 'cancelled' &&
      new Date(a.scheduledAt || `${a.date}T${a.time}`) > new Date()
    )
    if (nextAppt) {
      suggestions.push(
        `Prepare me for my upcoming ${nextAppt.type.replace('_', ' ')}`
      )
    }

    // Always available fallbacks
    const fallbacks = [
      'What should I wear to my next event?',
      'Show me new arrivals from my preferred brands',
      'Help me plan my seasonal wardrobe',
      'Find me something for a black tie event'
    ]

    // Fill up to 4 suggestions
    while (suggestions.length < 4 && fallbacks.length > 0) {
      const fallback = fallbacks.shift()
      if (fallback) suggestions.push(fallback)
    }

    return suggestions.slice(0, 4)
  }

  // Context-aware response generation
  const getContextualResponse = (message: string): string => {
    const lower = message.toLowerCase()

    if (lower.includes('outfit') || lower.includes('wear') || lower.includes('style')) {
      const events = calendarEvents?.filter(e => new Date(e.date) > new Date())
      if (events && events.length > 0) {
        return `Wonderful. I see you have ${events[0].title} coming up — let me curate some options that would be perfect for that occasion. I will have suggestions ready for you shortly.`
      }
      return 'Absolutely, I would be delighted to assist with styling. Tell me more about the occasion and I will curate the perfect selections from your preferred brands.'
    }

    if (lower.includes('sourc') || lower.includes('find') || lower.includes('looking for')) {
      return 'Of course. I can initiate a global sourcing request on your behalf. Would you like me to search across our entire network of boutiques and private sellers? Please share the details of what you are seeking.'
    }

    if (lower.includes('bespoke') || lower.includes('custom') || lower.includes('made to measure')) {
      return 'A bespoke commission is one of our most exclusive services. I can connect you with our partner ateliers. Shall I arrange an initial consultation, or would you like to review the available specialists first?'
    }

    if (lower.includes('event') || lower.includes('gala') || lower.includes('dinner')) {
      return 'I have noted the occasion. I will review your wardrobe and suggest pieces that would be most appropriate, along with sourcing options for anything that may be missing. May I ask about the dress code?'
    }

    if (lower.includes('appointment') || lower.includes('book') || lower.includes('meet')) {
      return 'I would be glad to arrange that. I have availability for video consultations, phone calls, and in-person meetings. Would you like me to present some time slots, or shall we discuss by message first?'
    }

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget')) {
      return 'I can assist with pricing and negotiation on your behalf. As an UHNI client you have access to exclusive pricing arrangements. Which item or collection were you interested in?'
    }

    if (lower.includes('track') || lower.includes('where') || lower.includes('order')) {
      const recentOrder = orders?.[0]
      if (recentOrder) {
        return `Your most recent order ${recentOrder.id} is currently ${recentOrder.status}. Would you like me to pull up the full tracking details or arrange a priority delivery update?`
      }
      return 'I can check on any of your orders right away. Could you provide the order reference, or would you like me to pull up your complete order history?'
    }

    // Default contextual responses
    const defaults = [
      'Thank you for reaching out. I am looking into that for you right away and will have a response within moments.',
      'Absolutely. Allow me to review the best options available and I will present you with a curated selection shortly.',
      'Consider it done. I will coordinate all the details and follow up with you as soon as everything is arranged.',
      'I understand completely. Given your preferences and history with us, I have a few ideas in mind — shall I share them now?',
      'Of course. I will prioritise this immediately and ensure everything is handled to your exact standards.'
    ]

    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  // Check for appointment in next 24 hours
  const imminentAppointment = (conciergeAppointments || []).find(a => {
    if (a.status === 'cancelled') return false
    const apptTime = new Date(a.scheduledAt || `${a.date}T${a.time}`).getTime()
    const now = Date.now()
    const hoursUntil = (apptTime - now) / (1000 * 60 * 60)
    return hoursUntil > 0 && hoursUntil <= 24
  })

  // Check if appointment is within 2 hours (for pre-session briefing)
  const isImminentAppt = (scheduledAt: string) => {
    const hoursUntil = (new Date(scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursUntil > 0 && hoursUntil <= 2
  }

  const suggestions = getContextualSuggestions();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    showToast('Message sent', 'success');

    setTimeout(() => {
      const response: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'concierge',
        content: getContextualResponse(newMessage),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, response]);
    }, 1200);
  };

  const handleBookAppointment = () => {
    if (!bookingDate || !bookingTime) return;
    const typeInfo = appointmentTypes.find(t => t.value === bookingType);
    bookAppointment({
      type: bookingType,
      title: typeInfo?.label || 'Appointment',
      date: bookingDate,
      time: bookingTime,
      duration: bookingDuration,
      notes: bookingNotes || undefined,
      location: bookingLocation,
      brand_id: bookingBrandId || undefined,
    });

    // Add chat message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      content: `I've booked a ${typeInfo?.label} on ${bookingDate} at ${bookingTime} (${bookingDuration} min).${bookingNotes ? ` Notes: ${bookingNotes}` : ''}`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const reply: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'concierge',
        content: `Your ${typeInfo?.label} has been confirmed for ${bookingDate} at ${bookingTime}. I'll prepare everything in advance to make the most of our time together.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);

    setShowBookingModal(false);
    setBookingType('styling_session');
    setBookingDate('');
    setBookingTime('');
    setBookingDuration(60);
    setBookingNotes('');
    setBookingLocation('in_store');
    setBookingBrandId('');
  };

  const upcomingAppointments = conciergeAppointments.filter(a => a.status === 'upcoming');

  const formatAppointmentDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const getAppointmentTypeLabel = (type: AppointmentType) => {
    return appointmentTypes.find(t => t.value === type)?.label || type;
  };

  if (!concierge) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Book Appointment', icon: Calendar, description: 'Schedule a session', onClick: () => setShowBookingModal(true) },
    { label: 'Request Sourcing', icon: Award, description: 'Find a specific item', onClick: () => router.push('/uhni/sourcing/new') },
    { label: 'View Tasks', icon: Clock, description: 'Concierge tasks', onClick: () => setPageTab('tasks') },
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
            <div className="flex items-center gap-2 mb-4">
              <Crown size={14} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Dedicated Service
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Personal Concierge
            </h1>
            <p className="text-sand mt-3">Your dedicated fashion advisor</p>

            {/* Page Tabs */}
            <div className="flex items-center gap-1 mt-6">
              <button
                onClick={() => setPageTab('chat')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                  pageTab === 'chat'
                    ? 'bg-ivory-cream text-charcoal-deep'
                    : 'text-sand hover:text-ivory-cream hover:bg-ivory-cream/10'
                }`}
              >
                <MessageCircle size={14} />
                Chat & Booking
              </button>
              <button
                onClick={() => setPageTab('tasks')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                  pageTab === 'tasks'
                    ? 'bg-ivory-cream text-charcoal-deep'
                    : 'text-sand hover:text-ivory-cream hover:bg-ivory-cream/10'
                }`}
              >
                <ClipboardList size={14} />
                Tasks & Appointments
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Reminder Banner */}
      {imminentAppointment && (
        <div className="bg-gold-soft/10 border-b border-gold-soft/30 px-8 py-4">
          <div className="max-w-[900px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-soft/20 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-gold-deep" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-deep">
                  Upcoming appointment reminder
                </p>
                <p className="text-xs text-stone">
                  {imminentAppointment.title} —{' '}
                  {new Date(imminentAppointment.scheduledAt || `${imminentAppointment.date}T${imminentAppointment.time}`)
                    .toLocaleDateString('en-US', {
                      weekday: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {imminentAppointment.meetingLink && imminentAppointment.type === 'video_call' && (
                <a
                  href={imminentAppointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  Join Now
                </a>
              )}
              <button
                onClick={() => cancelAppointment(imminentAppointment.id)}
                className="text-xs text-taupe hover:text-error transition-colors tracking-[0.05em] uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks & Appointments Tab */}
      {pageTab === 'tasks' && (
        <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <TasksSection />
        </div>
      )}

      {/* Chat & Booking Tab */}
      {pageTab === 'chat' && (
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Concierge Profile & Appointments */}
          <div className="space-y-6">
            {/* Isabella Profile Card */}
            <div className="bg-white p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gold-soft/30">
                  <Image
                    src={concierge.avatar}
                    alt={concierge.name}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-white rounded-full ${
                    concierge.availability === 'available' ? 'bg-success' :
                    concierge.availability === 'busy' ? 'bg-gold-muted' : 'bg-stone'
                  }`} />
                </div>
                <h2 className="font-display text-2xl text-charcoal-deep">{concierge.name}</h2>
                <p className="text-stone text-sm">{concierge.title}</p>
                <p className={`text-xs mt-2 px-3 py-1 rounded-full ${
                  concierge.availability === 'available' ? 'bg-success/10 text-success' :
                  concierge.availability === 'busy' ? 'bg-gold-muted/10 text-gold-muted' : 'bg-stone/10 text-stone'
                }`}>
                  {concierge.availability === 'available' ? 'Available Now' :
                   concierge.availability === 'busy' ? 'In a Session' : 'Currently Offline'}
                </p>
              </div>

              {/* Isabella's Identity */}
              <div className="bg-parchment p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">About Isabella</span>
                </div>
                <p className="text-sm text-stone leading-relaxed">
                  {concierge.bio}
                </p>
              </div>

              <div className="flex gap-3 mb-4">
                <a
                  href={`tel:${concierge.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-sand hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all text-sm"
                >
                  <Phone size={16} />
                  Call
                </a>
                <a
                  href={`mailto:${concierge.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-sand hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all text-sm"
                >
                  <Mail size={16} />
                  Email
                </a>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-sm border-t border-sand/30 pt-4">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-stone" />
                  <span className="text-charcoal-deep">{concierge.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-stone" />
                  <span className="text-charcoal-deep text-sm break-all">{concierge.email}</span>
                </div>
              </div>
            </div>

            {/* Specialties & Languages */}
            <div className="bg-white p-6">
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Specialties</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {concierge.specialties.map((specialty) => (
                  <span key={specialty} className="px-3 py-1.5 bg-parchment text-sm text-charcoal-deep">
                    {specialty}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-stone" />
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe">Languages</h3>
              </div>
              <p className="text-sm text-charcoal-deep">
                {concierge.languages.join(' · ')}
              </p>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe">Upcoming Appointments</h3>
                <span className="text-[10px] text-stone">{upcomingAppointments.length}</span>
              </div>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-stone">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map(appt => {
                    const apptScheduledAt = appt.scheduledAt || `${appt.date}T${appt.time}`;
                    const isWithin2Hours = isImminentAppt(apptScheduledAt);
                    return (
                      <div key={appt.id} className="border border-sand/50 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{appt.title}</p>
                            <p className="text-xs text-taupe">{getAppointmentTypeLabel(appt.type)}</p>
                          </div>
                          <button
                            onClick={() => cancelAppointment(appt.id)}
                            className="text-xs text-stone hover:text-error transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatAppointmentDate(appt.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {appt.time} · {appt.duration}min
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-taupe mt-2 italic">{appt.notes}</p>
                        )}
                        {isWithin2Hours && (
                          <button
                            onClick={() => setShowBriefingId(appt.id)}
                            className="mt-3 w-full px-4 py-2 border border-gold-soft text-gold-deep text-xs tracking-[0.1em] uppercase hover:bg-gold-soft/10 transition-colors"
                          >
                            Pre-Session Brief
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full mt-4 py-2.5 border border-sand text-sm text-charcoal-deep hover:border-charcoal-deep transition-colors"
              >
                + Book New Appointment
              </button>
            </div>

            {/* Concierge Since */}
            <div className="bg-parchment p-6 border border-sand">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-stone" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">Your Concierge Since</span>
              </div>
              <p className="text-charcoal-deep font-medium">
                {new Date(concierge.assignedSince).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right Column - Messaging & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="group flex flex-col items-center p-6 bg-white hover:bg-charcoal-deep transition-all duration-300"
                >
                  <action.icon size={24} className="text-stone group-hover:text-gold-soft mb-3 transition-colors" />
                  <span className="font-medium text-charcoal-deep group-hover:text-ivory-cream transition-colors">{action.label}</span>
                  <span className="text-xs text-taupe group-hover:text-sand mt-1 transition-colors">{action.description}</span>
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="bg-white">
              <div className="p-6 border-b border-sand">
                <h3 className="font-display text-xl text-charcoal-deep flex items-center gap-3">
                  <MessageCircle size={20} className="text-stone" />
                  Messages with {concierge.name.split(' ')[0]}
                </h3>
              </div>

              {/* Context Summary Banner */}
              {((sourcingRequests?.filter(r => r.status === 'options_found').length || 0) > 0 ||
                (bespokeOrders?.filter(o => o.clientApprovalRequired && !o.clientApproved).length || 0) > 0) && (
                <div className="mx-4 mt-4 p-3 bg-gold-soft/10 border border-gold-soft/20 text-xs text-stone">
                  <span className="font-medium text-gold-deep">
                    Isabella has updates for you —{' '}
                  </span>
                  {(sourcingRequests?.filter(r => r.status === 'options_found').length || 0) > 0 && (
                    <span>
                      {sourcingRequests?.filter(r => r.status === 'options_found').length} sourcing option
                      {(sourcingRequests?.filter(r => r.status === 'options_found').length || 0) !== 1 ? 's' : ''} ready to review
                    </span>
                  )}
                  {(bespokeOrders?.filter(o => o.clientApprovalRequired && !o.clientApproved).length || 0) > 0 && (
                    <span className="ml-2">
                      · {bespokeOrders?.filter(o => o.clientApprovalRequired && !o.clientApproved).length} bespoke design
                      {(bespokeOrders?.filter(o => o.clientApprovalRequired && !o.clientApproved).length || 0) !== 1 ? 's' : ''} awaiting approval
                    </span>
                  )}
                </div>
              )}

              {/* Context-Aware Suggestions */}
              {suggestions.length > 0 && messages.length <= 3 && (
                <div className="px-4 pt-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-2">Suggested topics</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setNewMessage(suggestion);
                        }}
                        className="px-3 py-1.5 bg-parchment text-xs text-charcoal-deep hover:bg-sand transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'client' || message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.sender === 'client' || message.sender === 'user'
                        ? 'bg-charcoal-deep text-ivory-cream'
                        : 'bg-parchment text-charcoal-deep'
                    } p-4`}>
                      {message.sender === 'concierge' && (
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          {concierge.name.split(' ')[0]}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-[10px] mt-2 ${
                        message.sender === 'client' || message.sender === 'user' ? 'text-ivory-cream/50' : 'text-taupe'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-sand">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-parchment border-0 text-charcoal-deep placeholder:text-taupe focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>

              {/* Human Escalation Link */}
              <div className="px-4 pb-4 pt-2 border-t border-sand/30">
                <button
                  onClick={() => setShowEscalateModal(true)}
                  className="text-xs text-taupe hover:text-charcoal-deep transition-colors tracking-[0.05em] flex items-center gap-1"
                >
                  <Users size={12} />
                  Request human concierge
                </button>
              </div>
            </div>

            {/* Related Links */}
            <div className="bg-white p-6">
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Related Services</h3>
              <div className="space-y-2">
                <Link
                  href="/uhni/sourcing"
                  className="flex items-center justify-between p-4 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <div>
                    <p className="font-medium text-charcoal-deep">Private Sourcing</p>
                    <p className="text-sm text-taupe">Request rare and exclusive items</p>
                  </div>
                  <ChevronRight size={18} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/uhni/bespoke"
                  className="flex items-center justify-between p-4 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <div>
                    <p className="font-medium text-charcoal-deep">Bespoke Orders</p>
                    <p className="text-sm text-taupe">Commission custom pieces</p>
                  </div>
                  <ChevronRight size={18} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
                <button
                  onClick={() => setPageTab('tasks')}
                  className="flex items-center justify-between p-4 border border-sand hover:border-charcoal-deep transition-colors group w-full text-left"
                >
                  <div>
                    <p className="font-medium text-charcoal-deep">Concierge Tasks</p>
                    <p className="text-sm text-taupe">Track ongoing tasks and appointments</p>
                  </div>
                  <ChevronRight size={18} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-stone hover:text-charcoal-deep transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/70">Concierge Service</span>
            </div>
            <h3 className="font-display text-2xl text-charcoal-deep mb-6">Book Appointment</h3>

            <div className="space-y-6">
              {/* Appointment Type - 2x2 Grid */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {appointmentTypes.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setBookingType(t.value)}
                      className={`p-4 text-left border transition-colors ${
                        bookingType === t.value
                          ? 'border-charcoal-deep bg-parchment'
                          : 'border-sand bg-white hover:border-charcoal-deep/50'
                      }`}
                    >
                      <span className="text-lg mb-1 block">{t.icon}</span>
                      <p className="text-sm font-medium text-charcoal-deep">{t.label}</p>
                      <p className="text-xs text-stone mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              {brands.length > 0 && (
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Brand (Optional)</label>
                  <select
                    value={bookingBrandId}
                    onChange={e => setBookingBrandId(e.target.value)}
                    className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                  >
                    <option value="">Select a brand…</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Date *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Time *</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Duration</label>
                <div className="flex gap-2">
                  {durationOptions.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBookingDuration(d)}
                      className={`flex-1 py-2.5 text-sm transition-colors ${
                        bookingDuration === d
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : 'bg-parchment text-charcoal-deep hover:bg-sand'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Location</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'in_store', label: 'In Store', icon: '🏪' },
                    { value: 'virtual', label: 'Virtual', icon: '💻' },
                    { value: 'home', label: 'Home Visit', icon: '🏠' },
                  ] as const).map(loc => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => setBookingLocation(loc.value)}
                      className={`p-3 text-center border transition-colors ${
                        bookingLocation === loc.value
                          ? 'border-charcoal-deep bg-parchment'
                          : 'border-sand bg-white hover:border-charcoal-deep/50'
                      }`}
                    >
                      <span className="text-lg mb-1 block">{loc.icon}</span>
                      <p className="text-xs font-medium text-charcoal-deep">{loc.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Notes (Optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any special requests or focus areas..."
                  rows={3}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep placeholder:text-taupe focus:outline-none focus:ring-1 focus:ring-charcoal-deep resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookAppointment}
                  disabled={!bookingDate || !bookingTime}
                  className="flex-1 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human Escalation Modal */}
      {showEscalateModal && (
        <div
          className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEscalateModal(false)}
        >
          <div
            className="bg-white max-w-md w-full p-8"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            {!escalated ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl text-charcoal-deep">
                    Request Human Concierge
                  </h3>
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="p-2 hover:bg-sand/20 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-sm text-stone mb-6 leading-relaxed">
                  A dedicated human concierge will be assigned to assist you.
                  They will contact you within 2 hours during business hours
                  (Mon–Sat, 9am–8pm CET).
                </p>

                <div className="mb-4">
                  <label className="block text-xs tracking-[0.1em] uppercase text-taupe mb-2">
                    Reason for Request
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'complex_request', label: 'Complex sourcing or styling request' },
                      { value: 'complaint', label: 'I have a concern I need resolved' },
                      { value: 'preference', label: 'I prefer to speak with a person' },
                      { value: 'other', label: 'Other' }
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                          escalateType === option.value
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-charcoal-deep/50'
                        }`}
                      >
                        <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${
                          escalateType === option.value
                            ? 'border-charcoal-deep bg-charcoal-deep'
                            : 'border-sand'
                        }`}>
                          {escalateType === option.value && (
                            <Check size={10} className="text-ivory-cream" />
                          )}
                        </div>
                        <input
                          type="radio"
                          className="sr-only"
                          checked={escalateType === option.value as typeof escalateType}
                          onChange={() => setEscalateType(option.value as typeof escalateType)}
                        />
                        <span className="text-sm text-charcoal-deep">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs tracking-[0.1em] uppercase text-taupe mb-2">
                    Additional Details (optional)
                  </label>
                  <textarea
                    value={escalateReason}
                    onChange={e => setEscalateReason(e.target.value)}
                    rows={3}
                    placeholder="Describe what you need help with..."
                    className="w-full px-3 py-3 border border-sand focus:outline-none focus:border-charcoal-deep text-sm placeholder:text-taupe resize-none"
                  />
                </div>

                <button
                  onClick={() => {
                    const escalateMsg: Message = {
                      id: `msg-${Date.now()}-escalate`,
                      sender: 'concierge',
                      content: `I understand. I have flagged your request for a human concierge specialist. They will contact you within 2 hours. Your reference number is ESC-${Date.now().toString(36).toUpperCase()}. Is there anything else I can assist you with in the meantime?`,
                      timestamp: new Date().toISOString()
                    }
                    setMessages(prev => [...prev, escalateMsg])
                    setEscalated(true)
                    setTimeout(() => {
                      setShowEscalateModal(false)
                      setEscalated(false)
                      setEscalateReason('')
                      showToast('Human concierge request submitted', 'success')
                    }, 3000)
                  }}
                  className="w-full px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Submit Request
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-success" />
                </div>
                <h3 className="font-display text-xl text-charcoal-deep mb-3">
                  Request Submitted
                </h3>
                <p className="text-stone text-sm">
                  A human concierge specialist will contact you within 2 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pre-Session Briefing Modal */}
      {showBriefingId && (() => {
        const appt = (conciergeAppointments || []).find(a => a.id === showBriefingId)
        if (!appt) return null

        const scheduledAt = appt.scheduledAt || `${appt.date}T${appt.time}`
        const durationMinutes = appt.duration || appt.durationMinutes || 60

        const upcomingEvents = (calendarEvents || []).filter(e =>
          new Date(e.date) > new Date() &&
          new Date(e.date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ).slice(0, 3)

        const activeSourcing = (sourcingRequests || []).filter(r =>
          r.status !== 'delivered' && r.status !== 'cancelled'
        ).slice(0, 3)

        const activeBespoke = (bespokeOrders || []).filter(o =>
          o.status !== 'complete'
        ).slice(0, 2)

        const recentOrders = (orders || []).slice(0, 2)

        return (
          <div
            className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBriefingId(null)}
          >
            <div
              className="bg-white max-w-xl w-full max-h-[85vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              onClick={e => e.stopPropagation()}
            >
              {/* Briefing header */}
              <div className="bg-charcoal-deep px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/70 mb-1">
                      Pre-Session Briefing
                    </p>
                    <h3 className="font-display text-xl text-ivory-cream">
                      {appt.title}
                    </h3>
                    <p className="text-sand text-sm mt-1">
                      {new Date(scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                      {' · '}{durationMinutes} minutes
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBriefingId(null)}
                    className="p-2 text-sand hover:text-ivory-cream transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Session notes if any */}
                {appt.notes && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                      Your Session Notes
                    </p>
                    <p className="text-sm text-charcoal-deep bg-parchment border border-sand px-4 py-3 italic">
                      &quot;{appt.notes}&quot;
                    </p>
                  </div>
                )}

                {/* Upcoming events summary */}
                {upcomingEvents.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                      Your Upcoming Events
                    </p>
                    <div className="space-y-2">
                      {upcomingEvents.map(event => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 bg-parchment"
                        >
                          <p className="text-sm text-charcoal-deep">
                            {event.title}
                          </p>
                          <p className="text-xs text-stone">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active sourcing requests */}
                {activeSourcing.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                      Active Sourcing Requests
                    </p>
                    <div className="space-y-2">
                      {activeSourcing.map(req => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-3 border border-sand"
                        >
                          <p className="text-sm text-charcoal-deep">
                            {req.title}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 tracking-[0.05em] uppercase ${
                            req.status === 'options_found'
                              ? 'bg-success/10 text-success'
                              : 'bg-gold-soft/20 text-gold-deep'
                          }`}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active bespoke orders */}
                {activeBespoke.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                      Active Bespoke Commissions
                    </p>
                    <div className="space-y-2">
                      {activeBespoke.map(order => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 border border-sand"
                        >
                          <p className="text-sm text-charcoal-deep">
                            {order.title}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 tracking-[0.05em] uppercase bg-parchment text-stone">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent orders */}
                {recentOrders.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                      Recent Orders
                    </p>
                    <div className="space-y-2">
                      {recentOrders.map(order => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 border border-sand"
                        >
                          <p className="text-sm font-mono text-charcoal-deep">
                            {order.id}
                          </p>
                          <span className="text-xs text-stone capitalize">
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Talking points suggestion */}
                <div className="bg-gold-soft/10 border border-gold-soft/20 p-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold-muted mb-2">
                    Suggested Talking Points
                  </p>
                  <ul className="space-y-1.5">
                    {upcomingEvents.length > 0 && (
                      <li className="flex items-start gap-2 text-sm text-stone">
                        <span className="w-1 h-1 rounded-full bg-gold-soft mt-2 flex-shrink-0" />
                        Outfit planning for {upcomingEvents[0].title}
                      </li>
                    )}
                    {activeSourcing.length > 0 && (
                      <li className="flex items-start gap-2 text-sm text-stone">
                        <span className="w-1 h-1 rounded-full bg-gold-soft mt-2 flex-shrink-0" />
                        Review sourcing options for {activeSourcing[0].title}
                      </li>
                    )}
                    {activeBespoke.length > 0 && (
                      <li className="flex items-start gap-2 text-sm text-stone">
                        <span className="w-1 h-1 rounded-full bg-gold-soft mt-2 flex-shrink-0" />
                        Bespoke commission progress for {activeBespoke[0].title}
                      </li>
                    )}
                    <li className="flex items-start gap-2 text-sm text-stone">
                      <span className="w-1 h-1 rounded-full bg-gold-soft mt-2 flex-shrink-0" />
                      Seasonal wardrobe review and upcoming purchase plans
                    </li>
                  </ul>
                </div>

                {/* Join button if video */}
                {appt.meetingLink && appt.type === 'video_call' && (
                  <a
                    href={appt.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
                  >
                    Join Video Session
                  </a>
                )}

                <button
                  onClick={() => setShowBriefingId(null)}
                  className="block w-full text-center px-6 py-3 border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  );
}
