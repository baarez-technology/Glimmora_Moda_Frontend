/**
 * Consumer Appointment Service
 * Routes via Next.js rewrite: /api/v1/customer/appointments/* → backend
 */

import type { ConciergeAppointment } from '@/types/uhni';

function getToken(): string | null {
  try { return localStorage.getItem('moda-user-token'); } catch { return null; }
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

export interface ApiAppointment {
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

export interface CreateAppointmentPayload {
  appointment_type: string;
  brand_id: string;
  date: string;
  time: string;
  duration?: string;
  notes?: string;
  location?: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function formatTypeLabel(type: string): string {
  const map: Record<string, string> = {
    styling_session: 'Styling Session',
    private_viewing: 'Private Viewing',
    consultation: 'Consultation',
    fitting: 'Fitting',
    video_call: 'Video Call',
    phone_call: 'Phone Call',
  };
  return map[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function mapStatus(status: string): ConciergeAppointment['status'] {
  if (status === 'scheduled') return 'upcoming';
  if (status === 'rescheduled') return 'rescheduled';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  return 'upcoming';
}

export function apiApptToConciergeAppointment(doc: ApiAppointment): ConciergeAppointment {
  return {
    id: doc.appointment_id,
    type: doc.appointment_type as ConciergeAppointment['type'],
    title: formatTypeLabel(doc.appointment_type),
    date: doc.date,
    time: doc.time,
    duration: doc.duration ? (parseInt(doc.duration) || 60) : 60,
    notes: doc.notes ?? undefined,
    location: (doc.location as ConciergeAppointment['location']) ?? undefined,
    brandId: doc.brand_id || undefined,
    status: mapStatus(doc.status),
    conciergeId: 'isabella',
    conciergeName: 'Isabella Romano',
    createdAt: doc.created_at,
  };
}

// ─── API Functions ─────────────────────────────────────────────────────────────

const BASE = '/api/v1/customer/appointments';

export async function fetchConsumerAppointments(): Promise<ConciergeAppointment[]> {
  const docs = await apiFetch<ApiAppointment[]>(BASE);
  return docs.map(apiApptToConciergeAppointment);
}

export async function createConsumerAppointment(
  payload: CreateAppointmentPayload
): Promise<ConciergeAppointment> {
  const doc = await apiFetch<ApiAppointment>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return apiApptToConciergeAppointment(doc);
}

export async function patchConsumerAppointment(
  appointmentId: string,
  fields: Record<string, string>
): Promise<ConciergeAppointment> {
  const doc = await apiFetch<ApiAppointment>(`${BASE}/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  return apiApptToConciergeAppointment(doc);
}
