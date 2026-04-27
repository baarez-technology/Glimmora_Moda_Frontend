/**
 * Push Notification Service
 * Endpoint: POST /api/v1/customer/push-subscription
 *
 * Registers the browser's PushSubscription with the backend so the server
 * can deliver Web Push notifications via Firebase / web-push.
 */

import { getStoredUserToken } from './auth.service';

function authHeaders(): Record<string, string> {
  const token = getStoredUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration('/sw.js');
    if (existing) return existing;
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

export async function registerPushSubscription(): Promise<boolean> {
  if (typeof window === 'undefined' || !('PushManager' in window)) return false;
  const reg = await ensureServiceWorker();
  if (!reg) return false;

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
          ? (urlBase64ToUint8Array(vapidKey) as unknown as BufferSource)
          : undefined,
      });
    } catch {
      return false;
    }
  }

  const json = sub.toJSON();
  const res = await fetch('/api/v1/customer/push-subscription', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      endpoint: json.endpoint,
      expirationTime: json.expirationTime ?? null,
      keys: {
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? '',
      },
    }),
  });
  return res.ok;
}

export async function unregisterPushSubscription(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => {});
    await fetch(`/api/v1/customer/push-subscription?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).catch(() => {});
  }
}
