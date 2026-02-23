'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Check, RefreshCw, Trash2, Plus, Shield, ChevronDown, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import * as calendarService from '@/services/calendar.service';
import type { CalendarConnectionStatus } from '@/types';

interface CalendarProviderInfo {
  id: string;
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
  const { showToast, refreshCalendarEvents } = useApp();

  const [connectionStatus, setConnectionStatus] = useState<CalendarConnectionStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Calendar selection
  const [availableCalendars, setAvailableCalendars] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [loadingCalendars, setLoadingCalendars] = useState(false);
  const [needsCalendarSelection, setNeedsCalendarSelection] = useState(false);

  const isConnected = connectionStatus?.connected === true;

  // Load available calendars for a connected account
  const loadCalendars = useCallback(async () => {
    setLoadingCalendars(true);
    try {
      const cal = await calendarService.listCalendars();
      const mapped = (cal.calendars || []).map((c) => ({
        id: typeof c === 'object' && c !== null ? (c.id as string) : String(c),
        name: typeof c === 'object' && c !== null ? ((c.name as string) || (c.id as string)) : String(c),
      }));
      setAvailableCalendars(mapped);
      return mapped;
    } catch {
      return [];
    } finally {
      setLoadingCalendars(false);
    }
  }, []);

  // Load connection status + calendars
  const loadConnectionStatus = useCallback(async () => {
    try {
      const status = await calendarService.getConnectionStatus();
      setConnectionStatus(status);

      if (status.connected) {
        // Already has a calendar selected
        if (status.calendar_id) {
          setSelectedCalendarId(status.calendar_id);
          setNeedsCalendarSelection(false);
        } else {
          // Connected but no calendar selected — fetch calendars and prompt
          const cals = await loadCalendars();
          if (cals.length > 0) {
            setNeedsCalendarSelection(true);
          }
        }
      }
    } catch {
      setConnectionStatus({ connected: false });
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  }, [loadCalendars]);

  useEffect(() => {
    loadConnectionStatus();
  }, [loadConnectionStatus]);

  // ─── Connect: get OAuth URL and redirect browser ─────────────────────────
  const handleConnect = async (providerId: string) => {
    setConnecting(providerId);
    try {
      const { auth_url } = await calendarService.connectCalendar(providerId);
      // Redirect browser to provider OAuth — backend callback handles the rest
      // User returns to FRONTEND_URL (e.g. /profile) after backend HTML page
      window.location.href = auth_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      showToast(message, 'error');
      setConnecting(null);
    }
  };

  // ─── Disconnect ──────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await calendarService.disconnectCalendar();
      setConnectionStatus({ connected: false });
      setAvailableCalendars([]);
      setSelectedCalendarId(null);
      setNeedsCalendarSelection(false);
      showToast('Calendar disconnected.', 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect';
      showToast(message, 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  // ─── Sync events from provider ───────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    try {
      await refreshCalendarEvents();
      setLastSynced(new Date().toISOString());
      showToast('Events synced successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync';
      showToast(message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // ─── Select a calendar ──────────────────────────────────────────────────
  const handleSelectCalendar = async (calendarId: string) => {
    try {
      await calendarService.selectCalendar(calendarId);
      setSelectedCalendarId(calendarId);
      setShowCalendarPicker(false);
      setNeedsCalendarSelection(false);
      showToast('Calendar selected. Syncing events...', 'success');
      // Auto-sync after selecting
      await refreshCalendarEvents();
      setLastSynced(new Date().toISOString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to select calendar';
      showToast(message, 'error');
    }
  };

  // ─── Fetch calendars (manual trigger) ────────────────────────────────────
  const handleFetchCalendars = async () => {
    const cals = await loadCalendars();
    if (cals.length > 0) {
      setNeedsCalendarSelection(true);
    } else {
      showToast('No calendars found. Try syncing later.', 'info');
    }
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
              <p className="text-sand mt-2">Connect your calendar for personalized outfit suggestions</p>
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
                  Connect your calendar (Google, Apple, or Outlook)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">02</span>
                  Select which calendar to sync events from
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">03</span>
                  Our system analyzes each event type, venue, and weather
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-charcoal-deep font-medium">04</span>
                  Receive personalized outfit suggestions for every occasion
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Calendar Selection Required Banner */}
        {isConnected && needsCalendarSelection && (
          <div className="p-5 border border-gold-muted/50 bg-gold-soft/5 flex items-start gap-4">
            <AlertCircle size={20} className="text-gold-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-charcoal-deep mb-1">Select a calendar to continue</p>
              <p className="text-sm text-stone">
                Your account is connected. Please select which calendar to sync events from below.
              </p>
            </div>
          </div>
        )}

        {/* Calendar Providers — only one can be connected */}
        <div className="bg-white p-8">
          <h2 className="font-display text-xl text-charcoal-deep mb-8">Calendar Connection</h2>

          <div className="space-y-4">
            {calendarProviders.map((provider) => {
              const isThisConnected = isConnected && connectionStatus?.provider === provider.id;
              const isThisConnecting = connecting === provider.id;

              return (
                <div
                  key={provider.id}
                  className={`p-5 border transition-all ${
                    isThisConnected ? 'border-success/30 bg-success/5' : 'border-sand'
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
                          {isThisConnected && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success text-xs">
                              <Check size={12} />
                              Connected
                            </span>
                          )}
                        </div>
                        {isThisConnected && connectionStatus?.email ? (
                          <p className="text-sm text-stone">{connectionStatus.email}</p>
                        ) : (
                          <p className="text-sm text-taupe">{provider.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isThisConnected ? (
                        <>
                          <button
                            onClick={handleSync}
                            disabled={syncing || !selectedCalendarId}
                            className="p-2 text-stone hover:text-charcoal-deep transition-colors disabled:opacity-50"
                            title={selectedCalendarId ? 'Sync now' : 'Select a calendar first'}
                          >
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                          </button>
                          <button
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="p-2 text-stone hover:text-error transition-colors disabled:opacity-50"
                            title="Disconnect"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(provider.id)}
                          disabled={isConnected || isThisConnecting || connecting !== null}
                          className="flex items-center gap-2 px-5 py-2 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                        >
                          {isThisConnecting ? (
                            <div className="w-4 h-4 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus size={16} />
                          )}
                          {isThisConnecting ? 'Redirecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isThisConnected && lastSynced && (
                    <div className="mt-4 pt-4 border-t border-sand/50 text-sm">
                      <span className="text-taupe">
                        Last synced: {new Date(lastSynced).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Selection — shown when connected */}
        {isConnected && (
          <div className="bg-white p-8">
            <h2 className="font-display text-xl text-charcoal-deep mb-4">Select Calendar</h2>
            <p className="text-stone text-sm mb-6">
              Choose which calendar to sync events from. Events will be fetched after selection.
            </p>

            {availableCalendars.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                  className={`w-full flex items-center justify-between px-5 py-4 border text-left transition-colors ${
                    needsCalendarSelection && !selectedCalendarId
                      ? 'border-gold-muted bg-gold-soft/5 hover:border-gold-deep'
                      : 'border-sand hover:border-charcoal-deep'
                  }`}
                >
                  <span className={selectedCalendarId ? 'text-charcoal-deep' : 'text-taupe'}>
                    {selectedCalendarId
                      ? availableCalendars.find(c => c.id === selectedCalendarId)?.name || selectedCalendarId
                      : 'Select a calendar...'}
                  </span>
                  <ChevronDown size={16} className={`text-stone transition-transform ${showCalendarPicker ? 'rotate-180' : ''}`} />
                </button>

                {showCalendarPicker && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-sand shadow-lg max-h-60 overflow-y-auto">
                    {availableCalendars.map((cal) => (
                      <button
                        key={cal.id}
                        onClick={() => handleSelectCalendar(cal.id)}
                        className={`w-full px-5 py-3 text-left text-sm hover:bg-parchment transition-colors flex items-center justify-between ${
                          selectedCalendarId === cal.id ? 'bg-parchment' : ''
                        }`}
                      >
                        <span className="text-charcoal-deep">{cal.name}</span>
                        {selectedCalendarId === cal.id && (
                          <Check size={14} className="text-success" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleFetchCalendars}
                disabled={loadingCalendars}
                className="flex items-center gap-2 px-6 py-3 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-50"
              >
                {loadingCalendars ? (
                  <div className="w-4 h-4 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                {loadingCalendars ? 'Loading...' : 'Fetch Calendars'}
              </button>
            )}
          </div>
        )}

        {/* Manual Event */}
        <div className="bg-white p-8">
          <h2 className="font-display text-xl text-charcoal-deep mb-4">Add Event Manually</h2>
          <p className="text-stone text-sm mb-6">
            Don&apos;t want to connect a calendar? You can add events manually to get outfit suggestions.
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
