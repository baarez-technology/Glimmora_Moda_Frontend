/**
 * Calendar Service
 * Real backend integration: /api/v1/calendar/*
 * Uses moda-user-token for auth (consumer/uhni users).
 */

import type {
  CalendarEvent,
  EventType,
  BackendCalendarEvent,
  CalendarConnectionStatus,
  ManualEventRequest,
  SuggestionPreferences,
} from '@/types';

// ─── Auth helper ─────────────────────────────────────────────────────────────

function getUserToken(): string | null {
  return typeof window !== 'undefined'
    ? localStorage.getItem('moda-user-token')
    : null;
}

function getUserAuthHeaders(): Record<string, string> {
  const token = getUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Tag → EventType mapping ─────────────────────────────────────────────────

const TAG_TO_EVENT_TYPE: Record<string, EventType> = {
  business: 'business_meeting',
  meeting: 'business_meeting',
  corporate: 'business_meeting',
  office: 'business_meeting',
  dinner: 'dinner_party',
  dining: 'dinner_party',
  restaurant: 'dinner_party',
  wedding: 'wedding',
  gala: 'gala',
  charity: 'gala',
  gallery: 'gallery_opening',
  art: 'gallery_opening',
  exhibition: 'gallery_opening',
  cocktail: 'cocktail_party',
  party: 'cocktail_party',
  travel: 'travel',
  trip: 'travel',
  vacation: 'travel',
  date: 'date_night',
  romantic: 'date_night',
  brunch: 'brunch',
  breakfast: 'brunch',
  conference: 'conference',
  summit: 'conference',
  seminar: 'conference',
  interview: 'interview',
  casual: 'casual_outing',
  outing: 'casual_outing',
  theater: 'theater',
  theatre: 'theater',
  opera: 'theater',
  concert: 'concert',
  music: 'concert',
  festival: 'concert',
};

function inferEventType(tags: string[]): EventType {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    // Try exact match first
    if (TAG_TO_EVENT_TYPE[lower]) return TAG_TO_EVENT_TYPE[lower];
    // Try partial match
    for (const [keyword, eventType] of Object.entries(TAG_TO_EVENT_TYPE)) {
      if (lower.includes(keyword)) return eventType;
    }
  }
  return 'other';
}

// ─── Backend → Frontend event mapping ────────────────────────────────────────

export function mapBackendToFrontendEvent(
  ev: BackendCalendarEvent
): CalendarEvent {
  const weather =
    (ev.sky_tag || ev.weather) && ev.tempressure != null
      ? {
          condition: ev.sky_tag || ev.weather || 'Unknown',
          temperature: ev.tempressure,
          unit: 'C' as const,
        }
      : undefined;

  return {
    id: ev.event_id,
    title: ev.title || 'Untitled Event',
    eventType: inferEventType(ev.tags || []),
    date: ev.event_date,
    time: ev.event_time || 'TBD',
    location: ev.location || undefined,
    venue: ev.location || undefined,
    description: ev.description || undefined,
    weather,
    // outfitSuggestions are generated client-side by AppContext
  };
}

// ─── API functions ───────────────────────────────────────────────────────────

/** Initiate OAuth connection — returns auth_url for redirect */
export async function connectCalendar(
  provider: string
): Promise<{ auth_url: string }> {
  const res = await fetch(`/api/v1/calendar/connect/${provider}`, {
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to connect' }));
    throw new Error(err.detail || `Connect failed (${res.status})`);
  }

  return res.json();
}

/** Check if current user has a calendar connection */
export async function getConnectionStatus(): Promise<CalendarConnectionStatus> {
  if (!getUserToken()) return { connected: false };

  const res = await fetch(`/api/v1/calendar/connection`, {
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to check connection' }));
    throw new Error(err.detail || `Connection check failed (${res.status})`);
  }

  return res.json();
}

/** List available calendars for connected user */
export async function listCalendars(): Promise<{
  status: string;
  count: number;
  calendars: Array<{ id: string; name: string; [key: string]: unknown }>;
}> {
  const res = await fetch(`/api/v1/calendar/calendars`, {
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to list calendars' }));
    throw new Error(err.detail || `List calendars failed (${res.status})`);
  }

  return res.json();
}

/** Select which calendar to use for events */
export async function selectCalendar(calendarId: string): Promise<void> {
  const res = await fetch(
    `/api/v1/calendar/calendars/select?calendar_id=${encodeURIComponent(calendarId)}`,
    {
      method: 'POST',
      headers: getUserAuthHeaders(),
    }
  );

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to select calendar' }));
    throw new Error(err.detail || `Select calendar failed (${res.status})`);
  }
}

/** Get calendar events from DB (optionally refresh from Nylas first) */
export async function getCalendarEvents(
  refresh = false
): Promise<BackendCalendarEvent[]> {
  // Skip API call entirely if user is not authenticated
  if (!getUserToken()) return [];

  const url = `/api/v1/calendar/events${refresh ? '?refresh=true' : ''}`;
  const res = await fetch(url, {
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to get events' }));
    throw new Error(err.detail || `Get events failed (${res.status})`);
  }

  return res.json();
}

/** Force refresh events from Nylas, save to DB, return events */
export async function refreshCalendarEvents(): Promise<BackendCalendarEvent[]> {
  const res = await fetch(`/api/v1/calendar/events/refresh`, {
    method: 'POST',
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to refresh events' }));
    throw new Error(err.detail || `Refresh failed (${res.status})`);
  }

  return res.json();
}

/** Add a manual event (no calendar connection required) */
export async function addManualEvent(
  data: ManualEventRequest
): Promise<BackendCalendarEvent> {
  const res = await fetch(`/api/v1/calendar/events`, {
    method: 'POST',
    headers: getUserAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to add event' }));
    throw new Error(err.detail || `Add event failed (${res.status})`);
  }

  return res.json();
}

/** Get suggestion preferences */
export async function getSuggestionPreferences(): Promise<SuggestionPreferences> {
  const res = await fetch(`/api/v1/suggestion-preferences`, {
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to get preferences' }));
    throw new Error(err.detail || `Get preferences failed (${res.status})`);
  }

  return res.json();
}

/** Update suggestion preferences (partial) */
export async function updateSuggestionPreferences(
  data: Partial<SuggestionPreferences>
): Promise<SuggestionPreferences> {
  const res = await fetch(`/api/v1/suggestion-preferences`, {
    method: 'PATCH',
    headers: getUserAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to update preferences' }));
    throw new Error(err.detail || `Update preferences failed (${res.status})`);
  }

  return res.json();
}

/** Disconnect calendar (revoke grant, remove connection) */
export async function disconnectCalendar(): Promise<void> {
  const res = await fetch(`/api/v1/calendar/disconnect`, {
    method: 'DELETE',
    headers: getUserAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: 'Failed to disconnect' }));
    throw new Error(err.detail || `Disconnect failed (${res.status})`);
  }
}
