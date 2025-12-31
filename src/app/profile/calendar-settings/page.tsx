'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Check, RefreshCw, Trash2, Plus, Shield } from 'lucide-react';
import { mockCalendarConnections } from '@/data/mock-data';
import type { CalendarProvider } from '@/types';

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
  const [connections, setConnections] = useState(mockCalendarConnections);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleConnect = (providerId: CalendarProvider) => {
    setConnections(prev =>
      prev.map(c =>
        c.provider === providerId
          ? { ...c, connected: true, email: 'user@example.com', lastSynced: new Date().toISOString() }
          : c
      )
    );
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

  const getConnection = (providerId: CalendarProvider) => {
    return connections.find(c => c.provider === providerId);
  };

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
                        {isConnected && connection?.email ? (
                          <p className="text-sm text-stone">{connection.email}</p>
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
            Don't want to connect a calendar? You can add events manually to get outfit suggestions.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-colors text-sm tracking-[0.15em] uppercase">
            <Plus size={16} />
            Add Manual Event
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white p-8">
          <h2 className="font-display text-xl text-charcoal-deep mb-8">Suggestion Preferences</h2>

          <div className="space-y-1">
            {[
              { label: 'Include weather in suggestions', desc: 'Factor in weather conditions for outfit recommendations', checked: true },
              { label: 'Prioritize wardrobe items', desc: 'Show items from your Digital Wardrobe first', checked: true },
              { label: 'Daily outfit reminders', desc: "Get a notification with outfit ideas for tomorrow's events", checked: false },
              { label: 'Suggest new pieces', desc: 'Include product recommendations to complete your looks', checked: true }
            ].map((item, index) => (
              <label key={index} className="flex items-center justify-between p-5 bg-parchment cursor-pointer">
                <div>
                  <p className="font-medium text-charcoal-deep">{item.label}</p>
                  <p className="text-sm text-stone">{item.desc}</p>
                </div>
                <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
                  item.checked
                    ? 'border-charcoal-deep bg-charcoal-deep'
                    : 'border-sand'
                }`}>
                  {item.checked && (
                    <svg className="w-3 h-3 text-ivory-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </label>
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
    </div>
  );
}
