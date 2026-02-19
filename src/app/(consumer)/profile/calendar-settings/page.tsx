'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Check, RefreshCw, Trash2, Plus, Shield, X, Clock } from 'lucide-react';
import * as calendarService from '@/services/calendar.service';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import type { CalendarConnection, CalendarProvider } from '@/types';

interface CalendarProviderInfo {
  id: CalendarProvider;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const calendarProviders: CalendarProviderInfo[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: 'G',
    color: 'bg-blue-500',
    description: 'Connect your Google Calendar to sync events automatically'
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: 'A',
    color: 'bg-gray-800',
    description: 'Sync events from your iCloud Calendar'
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: 'O',
    color: 'bg-blue-600',
    description: 'Connect your Microsoft Outlook calendar'
  }
];

export default function CalendarSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login/consumer?redirect=/profile/calendar-settings');
  }, [isAuthenticated, isHydrated, router]);

  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showManualEvent, setShowManualEvent] = useState(false);
  const [manualEvent, setManualEvent] = useState({ title: '', date: '', time: '', location: '', type: 'meeting' });
  const [manualEventErrors, setManualEventErrors] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('moda-calendar-preferences');
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return { includeWeather: true, prioritizeWardrobe: true, dailyReminders: false, suggestNew: true };
  });

  useEffect(() => {
    const loadConnections = async () => {
      const response = await calendarService.getCalendarConnections();
      setConnections(response.data);
      setLoading(false);
      setIsLoaded(true);
    };
    loadConnections();
  }, []);

  const [connectingProvider, setConnectingProvider] = useState<CalendarProvider | null>(null);

  const handleConnect = (providerId: CalendarProvider) => {
    // Show coming soon — OAuth integration requires backend
    setConnectingProvider(providerId);
  };

  const handleDisconnect = (providerId: CalendarProvider) => {
    setConnections(prev =>
      prev.map(c =>
        c.provider === providerId
          ? { ...c, connected: false, email: undefined, lastSynced: undefined }
          : c
      )
    );
  };

  const handleSync = async (providerId: CalendarProvider) => {
    setSyncing(providerId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnections(prev =>
      prev.map(c =>
        c.provider === providerId
          ? { ...c, lastSynced: new Date().toISOString() }
          : c
      )
    );
    setSyncing(null);
  };

  const handleAddManualEvent = () => {
    const errors: Record<string, string> = {};
    if (!manualEvent.title.trim()) errors.title = 'Event title is required';
    if (!manualEvent.date) errors.date = 'Event date is required';
    if (Object.keys(errors).length > 0) {
      setManualEventErrors(errors);
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setManualEventErrors({});
    const events = JSON.parse(localStorage.getItem('moda-manual-events') || '[]');
    events.push({ ...manualEvent, id: `manual-${Date.now()}`, createdAt: new Date().toISOString() });
    localStorage.setItem('moda-manual-events', JSON.stringify(events));
    setManualEvent({ title: '', date: '', time: '', location: '', type: 'meeting' });
    setShowManualEvent(false);
    showToast('Event added successfully', 'success');
  };

  const togglePreference = (key: string) => {
    const updated = { ...preferences, [key]: !preferences[key as keyof typeof preferences] };
    setPreferences(updated);
    localStorage.setItem('moda-calendar-preferences', JSON.stringify(updated));
  };

  const getConnection = (providerId: CalendarProvider) => {
    return connections.find(c => c.provider === providerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Style Calendar
          </Link>

          <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
              <Calendar size={28} className="text-gold-soft" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-2">
                Integrations
              </span>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                Calendar Settings
              </h1>
              <p className="text-sand mt-2">Connect your calendars for personalized outfit suggestions</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* How It Works */}
        <div className="bg-parchment p-6 border border-sand">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
              <span className="text-ivory-cream text-sm font-medium">?</span>
            </div>
            <div>
              <h3 className="font-medium text-charcoal-deep mb-3">How Style Calendar Works</h3>
              <ol className="space-y-2 text-sm text-stone">
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">01</span>
                  Connect your calendar to sync upcoming events
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">02</span>
                  Our system analyzes each event type, venue, and weather
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">03</span>
                  Receive personalized outfit suggestions combining your wardrobe with new pieces
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">04</span>
                  Save looks and add items to your considerations with one click
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Connected Calendars */}
        <div className="bg-white p-8">
          <h2 className="font-display text-xl text-charcoal-deep mb-8">Calendar Connections</h2>

          <div className="space-y-4">
            {calendarProviders.map((provider) => {
              const connection = getConnection(provider.id);
              const isConnected = connection?.connected;

              return (
                <div
                  key={provider.id}
                  className={`p-5 border transition-all ${
                    isConnected ? 'border-success/30 bg-success/5' : 'border-sand'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${provider.color} flex items-center justify-center text-white font-bold`}>
                        {provider.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-charcoal-deep">{provider.name}</h3>
                          {isConnected && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success text-xs">
                              <Check size={12} />
                              Connected
                            </span>
                          )}
                        </div>
                        {isConnected ? (
                          <p className="text-sm text-stone">
                            {connection?.email && connection.email !== 'user@example.com' ? connection.email : 'Connected'}
                          </p>
                        ) : (
                          <p className="text-sm text-taupe">{provider.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleSync(provider.id)}
                            disabled={syncing === provider.id}
                            className="p-2 text-stone hover:text-charcoal-deep transition-colors disabled:opacity-50"
                            title="Sync now"
                          >
                            <RefreshCw size={18} className={syncing === provider.id ? 'animate-spin' : ''} />
                          </button>
                          <button
                            onClick={() => handleDisconnect(provider.id)}
                            className="p-2 text-stone hover:text-error transition-colors"
                            title="Disconnect"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(provider.id)}
                          className="flex items-center gap-2 px-5 py-2 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                        >
                          <Plus size={16} />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {isConnected && connection?.lastSynced && (
                    <div className="mt-4 pt-4 border-t border-sand/50 flex items-center justify-between text-sm">
                      <span className="text-taupe">
                        Last synced: {new Date(connection.lastSynced).toLocaleString()}
                      </span>
                      {connection.calendarsSelected && (
                        <span className="text-stone">
                          {connection.calendarsSelected.length} calendar{connection.calendarsSelected.length !== 1 ? 's' : ''} selected
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Event */}
        <div className="bg-white p-8">
          <h2 className="font-display text-xl text-charcoal-deep mb-4">Add Event Manually</h2>
          <p className="text-stone text-sm mb-6">
            Don&apos;t want to connect a calendar? You can add events manually to get outfit suggestions.
          </p>
          {showManualEvent ? (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={manualEvent.title}
                  onChange={(e) => { setManualEvent({ ...manualEvent, title: e.target.value }); setManualEventErrors(prev => ({ ...prev, title: '' })); }}
                  placeholder="Event title *"
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${manualEventErrors.title ? 'border-red-400' : 'border-sand'}`}
                />
                {manualEventErrors.title && <p className="text-xs text-red-500 mt-1">{manualEventErrors.title}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={manualEvent.date}
                    onChange={(e) => { setManualEvent({ ...manualEvent, date: e.target.value }); setManualEventErrors(prev => ({ ...prev, date: '' })); }}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${manualEventErrors.date ? 'border-red-400' : 'border-sand'}`}
                  />
                  {manualEventErrors.date && <p className="text-xs text-red-500 mt-1">{manualEventErrors.date}</p>}
                </div>
                <input
                  type="time"
                  value={manualEvent.time}
                  onChange={(e) => setManualEvent({ ...manualEvent, time: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <input
                type="text"
                value={manualEvent.location}
                onChange={(e) => setManualEvent({ ...manualEvent, location: e.target.value })}
                placeholder="Location (optional)"
                className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              <select
                value={manualEvent.type}
                onChange={(e) => setManualEvent({ ...manualEvent, type: e.target.value })}
                className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
              >
                <option value="meeting">Business Meeting</option>
                <option value="dinner">Dinner</option>
                <option value="party">Party / Social</option>
                <option value="wedding">Wedding</option>
                <option value="travel">Travel</option>
                <option value="casual">Casual Outing</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleAddManualEvent}
                  disabled={!manualEvent.title || !manualEvent.date}
                  className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Event
                </button>
                <button
                  onClick={() => { setShowManualEvent(false); setManualEvent({ title: '', date: '', time: '', location: '', type: 'meeting' }); setManualEventErrors({}); }}
                  className="px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowManualEvent(true)}
              className="flex items-center gap-2 px-6 py-3 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-colors text-sm tracking-[0.15em] uppercase"
            >
              <Plus size={16} />
              Add Manual Event
            </button>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white p-8">
          <h2 className="font-display text-xl text-charcoal-deep mb-8">Suggestion Preferences</h2>

          <div className="space-y-1">
            {[
              { key: 'includeWeather', label: 'Include weather in suggestions', desc: 'Factor in weather conditions for outfit recommendations' },
              { key: 'prioritizeWardrobe', label: 'Prioritize wardrobe items', desc: 'Show items from your Digital Wardrobe first' },
              { key: 'dailyReminders', label: 'Daily outfit reminders', desc: "Get a notification with outfit ideas for tomorrow's events" },
              { key: 'suggestNew', label: 'Suggest new pieces', desc: 'Include product recommendations to complete your looks' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => togglePreference(item.key)}
                className="flex items-center justify-between p-5 bg-parchment cursor-pointer w-full text-left"
              >
                <div>
                  <p className="font-medium text-charcoal-deep">{item.label}</p>
                  <p className="text-sm text-stone">{item.desc}</p>
                </div>
                <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
                  preferences[item.key as keyof typeof preferences]
                    ? 'border-charcoal-deep bg-charcoal-deep'
                    : 'border-sand'
                }`}>
                  {preferences[item.key as keyof typeof preferences] && (
                    <svg className="w-3 h-3 text-ivory-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-4 p-6 bg-parchment border border-sand text-sm">
          <Shield size={18} className="text-stone flex-shrink-0 mt-0.5" />
          <div className="text-stone">
            <p className="font-medium text-charcoal-deep mb-2">Your privacy matters</p>
            <p>
              We only read event titles, times, and locations to provide outfit suggestions.
              Your calendar data is never shared or used for advertising.
              You can disconnect at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {connectingProvider && (
        <div
          className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4"
          onClick={() => setConnectingProvider(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setConnectingProvider(null); }}
        >
          <div className="bg-white max-w-md w-full p-8 relative" role="dialog" aria-modal="true" aria-labelledby="coming-soon-title" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setConnectingProvider(null)}
              className="absolute top-4 right-4 p-2 hover:bg-sand/20 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <div className="w-14 h-14 bg-parchment flex items-center justify-center mx-auto mb-6">
                <Clock size={24} className="text-stone" />
              </div>
              <h3 id="coming-soon-title" className="font-display text-xl text-charcoal-deep mb-3">Coming Soon</h3>
              <p className="text-stone text-sm mb-6">
                {calendarProviders.find(p => p.id === connectingProvider)?.name} OAuth integration
                is currently in development. Calendar sync will be available in an upcoming release.
              </p>
              <button
                onClick={() => setConnectingProvider(null)}
                className="px-8 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
