/**
 * Authentication Service
 * Endpoints: /api/auth/*
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type { UserTier } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
  tier?: UserTier;
}

export interface LoginResponse {
  token: string;
  userTier: UserTier;
  userId: string;
}

export interface SessionResponse {
  userId: string;
  email: string;
  userTier: UserTier;
  isAuthenticated: boolean;
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: credentials,
    mockHandler: () => ({
      token: `mock-jwt-${generateMockId('token')}`,
      userTier: credentials.tier || 'preferred',
      userId: `user-${generateMockId('usr')}`,
    }),
  });
}

export async function logout(): Promise<ApiResponse<{ success: boolean }>> {
  return apiRequest<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
    mockHandler: () => ({ success: true }),
  });
}

export async function getCurrentSession(): Promise<ApiResponse<SessionResponse | null>> {
  return apiRequest<SessionResponse | null>('/api/auth/session', {
    mockHandler: () => {
      try {
        const tier = localStorage.getItem('moda-user-tier');
        if (tier && tier !== 'standard') {
          return {
            userId: 'user-sophia-chen',
            email: 'sophia@example.com',
            userTier: tier as UserTier,
            isAuthenticated: true,
          };
        }
      } catch { /* ignore */ }
      return null;
    },
  });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: data,
    mockHandler: () => ({
      token: `mock-jwt-${generateMockId('token')}`,
      userTier: 'standard' as UserTier,
      userId: generateMockId('user'),
    }),
  });
}

export async function loginAsBrand(credentials: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ token: string; partnerId: string }>> {
  return apiRequest<{ token: string; partnerId: string }>('/api/auth/brand-login', {
    method: 'POST',
    body: credentials,
    mockHandler: () => ({
      token: `mock-brand-jwt-${generateMockId('token')}`,
      partnerId: 'partner-dior-001',
    }),
  });
}

// ============================================
// Real Brand Login (Backend API)
// ============================================

export interface BrandLoginRequest {
  email: string;
  password: string;
  device?: {
    device_type?: string;
    device_fcm_token?: string;
    device_name?: string;
    browse_type?: string;
  };
}

export interface BrandLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  brand: {
    brand_id: string;
    brand_name: string;
    brand_logo: string | null;
    brand_category: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_picture: string | null;
    email: string;
    phone_number: string;
    job_title: string;
    email_notification: {
      order_updates: boolean;
      inventory_alerts: boolean;
      weekly_reports: boolean;
    };
    push_notification: {
      order_updates: boolean;
      urgent_alerts: boolean;
      daily_digest: boolean;
    };
    devices: unknown[];
    is_active: boolean;
    is_2fa_enabled: boolean;
    created_at: string;
    updated_at: string;
  };
}

export async function brandLogin(credentials: BrandLoginRequest): Promise<BrandLoginResponse> {
  const res = await fetch(`/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || `Login failed (${res.status})`);
  }

  return res.json();
}

export interface BrandProfileUpdatePayload {
  brand_name?: string;
  brand_logo?: string;
  brand_category?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  profile_picture?: string;
  phone_number?: string;
  job_title?: string;
  email_notification?: {
    order_updates?: boolean;
    inventory_alerts?: boolean;
    weekly_reports?: boolean;
  };
  push_notification?: {
    order_updates?: boolean;
    urgent_alerts?: boolean;
    daily_digest?: boolean;
  };
}

export async function updateBrandProfile(
  payload: BrandProfileUpdatePayload
): Promise<BrandLoginResponse['brand']> {
  const token = localStorage.getItem('moda-brand-token');
  const res = await fetch(`/api/v1/brand/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
    throw new Error(err.detail || `Failed to update profile (${res.status})`);
  }

  const updated = await res.json();
  // Keep localStorage in sync so Header and other components see fresh data
  localStorage.setItem('moda-brand-data', JSON.stringify(updated));
  return updated;
}

export async function brandChangePassword(payload: {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}): Promise<{ message: string }> {
  const token = localStorage.getItem('moda-brand-token');
  const res = await fetch(`/api/v1/brand/me/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to change password' }));
    throw new Error(err.detail || `Failed to change password (${res.status})`);
  }

  return res.json();
}

export function brandLogout(): void {
  localStorage.removeItem('moda-brand-token');
  localStorage.removeItem('moda-brand-refresh-token');
  localStorage.removeItem('moda-brand-data');
  localStorage.removeItem('moda-brand-auth');
}
