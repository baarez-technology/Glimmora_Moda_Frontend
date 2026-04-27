/**
 * VIP Alerts Service
 * Endpoints: /api/v1/customer/vip-alerts
 */

import { getStoredUserToken } from './auth.service';

export interface VIPAlertApi {
  id: string;
  type: 'product_launch' | 'private_sale' | 'event' | 'collection_preview' | 'priority_access';
  title: string;
  description: string;
  brand: string;
  priority: 'urgent' | 'high' | 'normal';
  image?: string;
  expiresAt: string;
  actionLabel: string;
  actionUrl: string;
  metadata?: {
    location?: string;
    date?: string;
    availableSpots?: number;
    discount?: string;
  };
  read: boolean;
  dismissed?: boolean;
  createdAt: string;
}

function authHeaders(): Record<string, string> {
  const token = getStoredUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function listVipAlerts(includeDismissed = false): Promise<VIPAlertApi[]> {
  const qs = includeDismissed ? '?include_dismissed=true' : '';
  const res = await fetch(`/api/v1/customer/vip-alerts${qs}`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch VIP alerts (${res.status})`);
  }
  return res.json();
}

export async function markRead(alertId: string): Promise<void> {
  await fetch(`/api/v1/customer/vip-alerts/${alertId}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function dismissAlert(alertId: string): Promise<void> {
  await fetch(`/api/v1/customer/vip-alerts/${alertId}/dismiss`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function markAllRead(): Promise<void> {
  await fetch('/api/v1/customer/vip-alerts/read-all', {
    method: 'POST',
    headers: authHeaders(),
  });
}
