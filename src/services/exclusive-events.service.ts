function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('moda-user-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ApiEventType = 'exhibitions' | 'galas' | 'masterclasses' | 'launches' | 'experiences';

export interface ApiExclusiveEvent {
  uhni_exclusive_event_id: string;
  event_type: ApiEventType;
  title: string;
  tagline: string;
  description: string;
  type: string;
  date: string;
  time: string;
  date_day: string;
  location: string;
  spots: number;
  highlights: string[];
  connected_uhni_customers_ids: string[];
  is_already_joined: boolean;
  created_at: string;
  updated_at: string;
}

export async function getExclusiveEvents(): Promise<ApiExclusiveEvent[]> {
  const res = await fetch('/api/v1/customer/exclusive-events', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch exclusive events: ${res.status}`);
  return res.json();
}

export async function joinExclusiveEvent(uhni_exclusive_event_id: string): Promise<ApiExclusiveEvent> {
  const res = await fetch(`/api/v1/customer/exclusive-events/${uhni_exclusive_event_id}/join`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to join event: ${res.status}`);
  }
  return res.json();
}

// Private shopping events have been moved to private-shopping.service.ts
