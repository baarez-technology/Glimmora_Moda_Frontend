/**
 * Digital Body Twin Service
 * Endpoints: /api/v1/customer/digital-body-twin
 *
 * Manages a customer's body measurements, fit preferences, proportions,
 * and silhouette. One record per customer — create, read, partial update.
 */

import type { DigitalBodyTwin } from '@/types/intelligence';

// ─── Auth Helper ────────────────────────────────────────────────────────────

function getUserToken(): string | null {
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── API Response Types (matching backend Pydantic models) ────────────────

export interface DigitalBodyTwinApiResponse {
  digital_body_twin_id: string;
  customer_id: string;
  measurements: {
    height_cm: number | null;
    chest_cm: number | null;
    waist_cm: number | null;
    hips_cm: number | null;
    inseam_cm: number | null;
  };
  fit_preferences: {
    general: string | null;
    tops: string | null;
    bottoms: string | null;
    dresses: string | null;
  };
  proportions: {
    shoulder_width: string | null;
    torso_length: string | null;
    leg_length: string | null;
  };
  silhouette: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Mappers ────────────────────────────────────────────────────────────────

/** Convert API response → frontend DigitalBodyTwin */
function fromApi(res: DigitalBodyTwinApiResponse): DigitalBodyTwin {
  return {
    id: res.digital_body_twin_id,
    userId: res.customer_id,
    silhouette: (res.silhouette as DigitalBodyTwin['silhouette']) || 'average',
    measurements: {
      height: res.measurements.height_cm ?? undefined,
      bust: res.measurements.chest_cm ?? undefined,
      waist: res.measurements.waist_cm ?? undefined,
      hips: res.measurements.hips_cm ?? undefined,
      inseam: res.measurements.inseam_cm ?? undefined,
    },
    fitPreferences: {
      tops: (res.fit_preferences.tops as DigitalBodyTwin['fitPreferences']['tops']) || 'relaxed',
      bottoms: (res.fit_preferences.bottoms as DigitalBodyTwin['fitPreferences']['bottoms']) || 'relaxed',
      dresses: (res.fit_preferences.dresses as DigitalBodyTwin['fitPreferences']['dresses']) || 'relaxed',
    },
    proportions: {
      shoulder: (res.proportions.shoulder_width as DigitalBodyTwin['proportions']['shoulder']) || 'medium',
      torso: (res.proportions.torso_length as DigitalBodyTwin['proportions']['torso']) || 'medium',
      legs: (res.proportions.leg_length as DigitalBodyTwin['proportions']['legs']) || 'medium',
    },
    preferredFit: (res.fit_preferences.general as DigitalBodyTwin['preferredFit']) || 'regular',
    createdAt: res.created_at,
    updatedAt: res.updated_at,
  };
}

/** Convert frontend DigitalBodyTwin → API create payload */
function toCreatePayload(bt: DigitalBodyTwin) {
  return {
    measurements: {
      height_cm: bt.measurements.height ?? null,
      chest_cm: bt.measurements.bust ?? null,
      waist_cm: bt.measurements.waist ?? null,
      hips_cm: bt.measurements.hips ?? null,
      inseam_cm: bt.measurements.inseam ?? null,
    },
    fit_preferences: {
      general: bt.preferredFit,
      tops: bt.fitPreferences.tops,
      bottoms: bt.fitPreferences.bottoms,
      dresses: bt.fitPreferences.dresses,
    },
    proportions: {
      shoulder_width: bt.proportions.shoulder,
      torso_length: bt.proportions.torso,
      leg_length: bt.proportions.legs,
    },
    silhouette: bt.silhouette,
  };
}

// ─── API Functions ────────────────────────────────────────────────────────

/** GET /api/v1/customer/digital-body-twin */
export async function getDigitalBodyTwin(): Promise<DigitalBodyTwin | null> {
  const res = await fetch('/api/v1/customer/digital-body-twin', {
    method: 'GET',
    headers: authHeaders(),
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch digital body twin');
  }

  const data: DigitalBodyTwinApiResponse = await res.json();
  return fromApi(data);
}

/** POST /api/v1/customer/digital-body-twin */
export async function createDigitalBodyTwin(bodyTwin: DigitalBodyTwin): Promise<DigitalBodyTwin> {
  const res = await fetch('/api/v1/customer/digital-body-twin', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(toCreatePayload(bodyTwin)),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create digital body twin');
  }

  const data: DigitalBodyTwinApiResponse = await res.json();
  return fromApi(data);
}

/** PATCH /api/v1/customer/digital-body-twin */
export async function updateDigitalBodyTwin(bodyTwin: DigitalBodyTwin): Promise<DigitalBodyTwin> {
  const res = await fetch('/api/v1/customer/digital-body-twin', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(toCreatePayload(bodyTwin)),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update digital body twin');
  }

  const data: DigitalBodyTwinApiResponse = await res.json();
  return fromApi(data);
}
