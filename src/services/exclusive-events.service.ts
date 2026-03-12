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

// ─── Private Shopping Events ──────────────────────────────────────────────────

export type ApiPrivateShoppingStatus = 'upcoming' | 'completed';

export interface ApiPrivateShoppingEvent {
  private_shopping_event_id: string;
  title: string;
  tagline: string;
  description: string;
  dress_code: string;
  private_shopping_status: ApiPrivateShoppingStatus;
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

export async function getPrivateShoppingEvents(): Promise<ApiPrivateShoppingEvent[]> {
  const res = await fetch('/api/v1/customer/private-shopping-events', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch private shopping events: ${res.status}`);
  return res.json();
}

export async function joinPrivateShoppingEvent(private_shopping_event_id: string): Promise<ApiPrivateShoppingEvent> {
  const res = await fetch(`/api/v1/customer/private-shopping-events/${private_shopping_event_id}/join`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to join shopping event: ${res.status}`);
  }
  return res.json();
}
