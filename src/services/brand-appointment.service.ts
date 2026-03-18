/**
 * Brand Appointment Service
 * Uses /api/v1/brand/appointments — proxied to backend via next.config.js rewrite.
 */

function getToken(): string | null {
  try { return localStorage.getItem('moda-brand-token'); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiBrandAppointment {
  appointment_id: string;
  customer_id: string;
  brand_id: string;
  appointment_type: string;
  date: string;
  time: string;
  duration: string | null;
  notes: string | null;
  location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

const BASE = '/api/v1/brand/appointments';

export async function fetchBrandAppointments(): Promise<ApiBrandAppointment[]> {
  return apiFetch<ApiBrandAppointment[]>(`${BASE}/`);
}

export async function fetchBrandAppointment(appointmentId: string): Promise<ApiBrandAppointment> {
  return apiFetch<ApiBrandAppointment>(`${BASE}/${appointmentId}`);
}

export async function rescheduleBrandAppointment(
  appointmentId: string,
  date: string,
  time: string
): Promise<ApiBrandAppointment> {
  return apiFetch<ApiBrandAppointment>(
    `${BASE}/${appointmentId}/reschedule`,
    {
      method: 'PATCH',
      body: JSON.stringify({ date, time }),
    }
  );
}

export async function cancelBrandAppointment(
  appointmentId: string
): Promise<ApiBrandAppointment> {
  return apiFetch<ApiBrandAppointment>(`${BASE}/${appointmentId}/cancel`, { method: 'PATCH' });
}
