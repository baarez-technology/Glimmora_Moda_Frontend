'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Check, RefreshCw, Trash2, Plus, Sparkles, Shield } from 'lucide-react';
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
    icon: '📅',
    color: 'bg-blue-500',
    description: 'Connect your Google Calendar to sync events automatically'
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: '🍎',
    color: 'bg-gray-800',
    description: 'Sync events from your iCloud Calendar'
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: '📧',
    color: 'bg-blue-600',
    description: 'Connect your Microsoft Outlook calendar'
  }
];

export default function CalendarSettingsPage() {
  const [connections, setConnections] = useState(mockCalendarConnections);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleConnect = (providerId: CalendarProvider) => {
    // Simulate connection
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
    // Simulate sync delay
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
      <div className="bg-white border-b border-sand">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Style Calendar
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-muted/20 rounded-full flex items-center justify-center">
              <Calendar size={20} className="text-gold-deep" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-charcoal-deep">
                Calendar Settings
              </h1>
              <p className="text-stone">Connect your calendars for personalized outfit suggestions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8 space-y-8">
        {/* How It Works */}
        <div className="bg-sapphire-deep/5 rounded-xl p-6 border border-sapphire-subtle/20">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-sapphire-mist flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-charcoal-deep mb-2">How Style Calendar Works</h3>
              <ul className="space-y-2 text-sm text-stone">
                <li className="flex items-start gap-2">
                  <span className="text-sapphire-mist">1.</span>
                  Connect your calendar to sync upcoming events
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sapphire-mist">2.</span>
                  Our Fashion Intelligence analyzes each event type, venue, and weather
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sapphire-mist">3.</span>
                  Receive personalized outfit suggestions combining your wardrobe with new pieces
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sapphire-mist">4.</span>
                  Save looks and add items to your considerations with one click
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connected Calendars */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-display text-xl text-charcoal-deep mb-6">Calendar Connections</h2>

          <div className="space-y-4">
            {calendarProviders.map((provider) => {
              const connection = getConnection(provider.id);
              const isConnected = connection?.connected;

              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isConnected ? 'border-success/30 bg-success/5' : 'border-sand'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${provider.color} rounded-xl flex items-center justify-center text-2xl`}>
                        {provider.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-charcoal-deep">{provider.name}</h3>
                          {isConnected && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                              <Check size={12} />
                              Connected
                            </span>
                          )}
                        </div>
                        {isConnected && connection?.email ? (
                          <p className="text-sm text-stone">{connection.email}</p>
                        ) : (
                          <p className="text-sm text-greige">{provider.description}</p>
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
                          className="flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream rounded-lg text-sm hover:bg-noir transition-colors"
                        >
                          <Plus size={16} />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {isConnected && connection?.lastSynced && (
                    <div className="mt-3 pt-3 border-t border-sand/50 flex items-center justify-between text-sm">
                      <span className="text-greige">
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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-display text-xl text-charcoal-deep mb-4">Add Event Manually</h2>
          <p className="text-stone text-sm mb-4">
            Don't want to connect a calendar? You can add events manually to get outfit suggestions.
          </p>
          <button className="btn-secondary">
            <Plus size={18} />
            Add Manual Event
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-display text-xl text-charcoal-deep mb-6">Suggestion Preferences</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-parchment rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-charcoal-deep">Include weather in suggestions</p>
                <p className="text-sm text-stone">Factor in weather conditions for outfit recommendations</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted" />
            </label>

            <label className="flex items-center justify-between p-4 bg-parchment rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-charcoal-deep">Prioritize wardrobe items</p>
                <p className="text-sm text-stone">Show items from your Digital Wardrobe first</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted" />
            </label>

            <label className="flex items-center justify-between p-4 bg-parchment rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-charcoal-deep">Daily outfit reminders</p>
                <p className="text-sm text-stone">Get a notification with outfit ideas for tomorrow's events</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted" />
            </label>

            <label className="flex items-center justify-between p-4 bg-parchment rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-charcoal-deep">Suggest new pieces</p>
                <p className="text-sm text-stone">Include product recommendations to complete your looks</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-sand text-gold-muted focus:ring-gold-muted" />
            </label>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-3 p-4 bg-parchment rounded-xl text-sm">
          <Shield size={18} className="text-stone flex-shrink-0 mt-0.5" />
          <div className="text-stone">
            <p className="font-medium text-charcoal-deep mb-1">Your privacy matters</p>
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
