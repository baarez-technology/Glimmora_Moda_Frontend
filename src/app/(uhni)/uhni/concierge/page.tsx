'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Phone, Mail, MessageCircle, Calendar, Clock, Globe, Award, Send, ChevronRight, X, User, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AppointmentType, ConciergeAppointment } from '@/types/uhni';

interface Message {
  id: string;
  sender: 'client' | 'concierge';
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

export default function ConciergePage() {
  const router = useRouter();
  const { concierge, showToast, conciergeAppointments, bookAppointment, cancelAppointment } = useApp();
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

  // Booking form state
  const [bookingType, setBookingType] = useState<AppointmentType>('styling_session');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingNotes, setBookingNotes] = useState('');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('uhni-concierge-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const conciergeResponses = [
    'Thank you for your message. Let me look into that for you right away.',
    'Absolutely. I will coordinate the details and follow up with you shortly.',
    'That is an excellent choice. I will make the necessary arrangements immediately.',
    'I understand completely. Allow me to check availability and get back to you within the hour.',
    'Of course. I will prioritize this and ensure everything is handled to your satisfaction.',
    'Wonderful. I have noted your preference and will curate some options for you.',
  ];

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
        content: conciergeResponses[Math.floor(Math.random() * conciergeResponses.length)],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
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
    { label: 'View Tasks', icon: Clock, description: 'Concierge tasks', onClick: () => router.push('/uhni/concierge-tasks') },
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
          </div>
        </div>
      </div>

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
                  {upcomingAppointments.map(appt => (
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
                    </div>
                  ))}
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

              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.sender === 'client'
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
                        message.sender === 'client' ? 'text-ivory-cream/50' : 'text-taupe'
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
                <Link
                  href="/uhni/concierge-tasks"
                  className="flex items-center justify-between p-4 border border-sand hover:border-charcoal-deep transition-colors group"
                >
                  <div>
                    <p className="font-medium text-charcoal-deep">Concierge Tasks</p>
                    <p className="text-sm text-taupe">Track ongoing tasks and appointments</p>
                  </div>
                  <ChevronRight size={18} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
