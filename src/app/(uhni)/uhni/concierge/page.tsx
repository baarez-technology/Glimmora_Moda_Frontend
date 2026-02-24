'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Phone, Mail, MessageCircle, Calendar, Clock, Globe, Award, Send, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Message {
  id: string;
  sender: 'client' | 'concierge';
  content: string;
  timestamp: string;
}

export default function ConciergePage() {
  const router = useRouter();
  const { concierge, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('uhni-concierge-messages');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    // Return default welcome messages if nothing saved
    return [
      { id: '1', sender: 'concierge', content: 'Welcome back. How may I assist you today? I have updates on several items you may find interesting.', timestamp: new Date().toISOString() },
      { id: '2', sender: 'concierge', content: 'I noticed a private viewing event for Hermès next week in your area. Shall I arrange an invitation?', timestamp: new Date().toISOString() },
    ];
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Persist messages to localStorage whenever they change
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

    // Simulated concierge response after a short delay
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

  const handleScheduleSubmit = () => {
    if (!scheduleDate || !scheduleTime) return;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      content: `I'd like to schedule a call on ${scheduleDate} at ${scheduleTime}.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const reply: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'concierge',
        content: `Your call has been scheduled for ${scheduleDate} at ${scheduleTime}. You'll receive a confirmation shortly.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
    showToast('Call scheduled successfully', 'success');
  };

  const handleAppointmentSubmit = () => {
    if (!appointmentDate || !appointmentTime) return;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      content: `I'd like to book an in-person appointment on ${appointmentDate} at ${appointmentTime}.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const reply: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'concierge',
        content: `Your appointment has been booked for ${appointmentDate} at ${appointmentTime}. You'll receive a confirmation shortly.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
    setShowAppointmentModal(false);
    setAppointmentDate('');
    setAppointmentTime('');
    showToast('Appointment booked successfully', 'success');
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
    { label: 'Schedule a Call', icon: Phone, description: 'Book a consultation', onClick: () => setShowScheduleModal(true) },
    { label: 'Request Sourcing', icon: Award, description: 'Find a specific item', onClick: () => router.push('/uhni/sourcing/new') },
    { label: 'Book Appointment', icon: Calendar, description: 'In-person meeting', onClick: () => setShowAppointmentModal(true) },
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
          {/* Left Column - Concierge Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white p-8">
              <div className="flex flex-col items-center text-center mb-8">
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

              <p className="text-sm text-stone leading-relaxed mb-8 text-center">
                {concierge.bio}
              </p>

              <div className="flex gap-3">
                <a
                  href={`tel:${concierge.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-sand hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all"
                >
                  <Phone size={16} />
                </a>
                <a
                  href={`mailto:${concierge.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-sand hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-6">
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
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

            {/* Specialties */}
            <div className="bg-white p-6">
              <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {concierge.specialties.map((specialty) => (
                  <span key={specialty} className="px-3 py-1.5 bg-parchment text-sm text-charcoal-deep">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={14} className="text-stone" />
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-taupe">Languages</h3>
              </div>
              <p className="text-sm text-charcoal-deep">
                {concierge.languages.join(' • ')}
              </p>
            </div>

            {/* Assignment Info */}
            <div className="bg-parchment p-6 border border-sand">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-stone" />
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
                  Messages
                </h3>
              </div>

              {/* Message List */}
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

              {/* Message Input */}
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
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Schedule a Call Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-stone hover:text-charcoal-deep transition-colors text-xl leading-none"
            >
              &times;
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/70">Concierge Service</span>
            </div>
            <h3 className="font-display text-2xl text-charcoal-deep mb-6">Schedule a Call</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">Preferred Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowAppointmentModal(false)}
              className="absolute top-4 right-4 text-stone hover:text-charcoal-deep transition-colors text-xl leading-none"
            >
              &times;
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/70">Concierge Service</span>
            </div>
            <h3 className="font-display text-2xl text-charcoal-deep mb-6">Book Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">Preferred Time</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="flex-1 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAppointmentSubmit}
                  disabled={!appointmentDate || !appointmentTime}
                  className="flex-1 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
