/**
 * Authentication Service
 * Endpoints: /api/auth/*
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type { UserTier } from '@/types';
import { fetchWithTimeout } from '@/lib/api-cache';

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
    language: string;
    timezone: string;
    currency: string;
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
  const res = await fetchWithTimeout(`/api/v1/auth/login`, {
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
  language?: string;
  timezone?: string;
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

export interface BrandRegisterPayload {
  brand_name: string;
  brand_category: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  job_title: string;
}

export async function brandRegister(
  payload: BrandRegisterPayload
): Promise<BrandLoginResponse> {
  const res = await fetchWithTimeout(`/api/v1/auth/brand/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || `Registration failed (${res.status})`);
  }

  return res.json();
}

export async function updateBrandProfile(
  payload: BrandProfileUpdatePayload
): Promise<BrandLoginResponse['brand']> {
  const token = localStorage.getItem('moda-brand-token');
  const res = await fetchWithTimeout(`/api/v1/brand/me`, {
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
  const res = await fetchWithTimeout(`/api/v1/brand/me/change-password`, {
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

export async function brandLogout(): Promise<void> {
  const token = localStorage.getItem('moda-brand-token');
  const refreshToken = localStorage.getItem('moda-brand-refresh-token');
  // Fire-and-forget: blacklist tokens on server, then clear locally regardless
  if (token) {
    fetchWithTimeout('/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }
  localStorage.removeItem('moda-brand-token');
  localStorage.removeItem('moda-brand-refresh-token');
  localStorage.removeItem('moda-brand-data');
  localStorage.removeItem('moda-brand-auth');
}

// ============================================
// Real User (Consumer / UHNI) Authentication
// ============================================

export interface UserData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_picture: string | null;
  notifications?: {
    new_arrivals: boolean;
    price_changes: boolean;
    restock_alerts: boolean;
    style_insights: boolean;
  };
  language?: string;
  currency?: string;
  occasions: string[];
  aesthetics: string[];
  minimum_budget: number | null;
  maximum_budget: number | null;
  context_set: boolean;
  is_active: boolean;
  is_2fa_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserTokenResponse {
  access_token: string | null;
  refresh_token: string | null;
  token_type: string;
  context_required: boolean | null;
  user: UserData | null;
  requires_2fa?: boolean;
  pre_auth_token?: string;
  message?: string;
}

export interface UserRegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'consumer' | 'uhni';
}

export interface UserContextPayload {
  occasions: string[];
  aesthetics: string[];
  minimum_budget: number;
  maximum_budget: number;
}

export async function userLogin(credentials: {
  email: string;
  password: string;
  role: 'consumer' | 'uhni';
}): Promise<UserTokenResponse> {
  const res = await fetchWithTimeout(`/api/v1/user/auth/login`, {
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

export async function userRegister(
  payload: UserRegisterPayload
): Promise<UserTokenResponse> {
  const res = await fetchWithTimeout(`/api/v1/user/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || `Registration failed (${res.status})`);
  }

  return res.json();
}

export async function setUserContext(
  payload: UserContextPayload
): Promise<UserData> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/set-context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to set context' }));
    throw new Error(err.detail || `Failed to set context (${res.status})`);
  }

  const updated: UserData = await res.json();
  localStorage.setItem('moda-user-data', JSON.stringify(updated));
  return updated;
}

export function storeUserAuth(data: { access_token: string; refresh_token: string; user: UserData }): void {
  localStorage.setItem('moda-user-token', data.access_token);
  localStorage.setItem('moda-user-refresh-token', data.refresh_token);
  localStorage.setItem('moda-user-data', JSON.stringify(data.user));
}

export function getStoredUserData(): UserData | null {
  try {
    const raw = localStorage.getItem('moda-user-data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredUserToken(): string | null {
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

export async function userLogout(): Promise<void> {
  const token = localStorage.getItem('moda-user-token');
  const refreshToken = localStorage.getItem('moda-user-refresh-token');
  // Fire-and-forget: blacklist tokens on server, then clear locally regardless
  if (token) {
    fetchWithTimeout('/api/v1/user/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }
  localStorage.removeItem('moda-user-token');
  localStorage.removeItem('moda-user-refresh-token');
  localStorage.removeItem('moda-user-data');
}

// ============================================
// Get Current User (GET /api/v1/user/auth/me)
// ============================================

export async function getUserById(): Promise<UserData> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch user' }));
    throw new Error(err.detail || `Failed to fetch user (${res.status})`);
  }

  const user: UserData = await res.json();
  // Keep local storage in sync with latest data
  localStorage.setItem('moda-user-data', JSON.stringify(user));
  return user;
}

// ============================================
// Update User Profile (PATCH /api/v1/user/auth/me)
// ============================================

export interface UserProfileUpdatePayload {
  notifications?: {
    new_arrivals?: boolean;
    price_changes?: boolean;
    restock_alerts?: boolean;
    style_insights?: boolean;
  };
  language?: string;
  currency?: string;
}

export async function updateUserProfile(
  payload: UserProfileUpdatePayload
): Promise<UserData> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/me`, {
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

  const updated: UserData = await res.json();
  localStorage.setItem('moda-user-data', JSON.stringify(updated));
  return updated;
}

// ============================================
// Delete User Account (DELETE /api/v1/user/auth/me)
// ============================================

export async function deleteUserAccount(): Promise<string> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete account' }));
    throw new Error(err.detail || `Failed to delete account (${res.status})`);
  }

  return res.json();
}

// ============================================
// Change Password (POST /api/v1/user/auth/change-password)
// ============================================

export async function changeUserPassword(payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ message: string }> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to change password' }));
    const detail = err.detail;
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ')
      : typeof detail === 'string'
        ? detail
        : `Failed to change password (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

// ============================================
// 2FA Setup (POST /api/v1/user/auth/2fa/setup)
// ============================================

export interface TwoFASetupResponse {
  secret: string;
  provisioning_uri: string;
  qr_code_url: string;
  message: string;
}

export async function setup2FA(): Promise<TwoFASetupResponse> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/2fa/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: '',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to setup 2FA' }));
    throw new Error(err.detail || `Failed to setup 2FA (${res.status})`);
  }

  return res.json();
}

// ============================================
// 2FA Verify Setup (POST /api/v1/user/auth/2fa/verify-setup)
// ============================================

export async function verify2FASetup(totp_code: string): Promise<{ message: string; is_2fa_enabled: boolean }> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/2fa/verify-setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ totp_code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid code' }));
    throw new Error(err.detail || `Failed to verify 2FA (${res.status})`);
  }

  return res.json();
}

// ============================================
// 2FA Disable (POST /api/v1/user/auth/2fa/disable)
// ============================================

export async function disable2FA(totp_code: string): Promise<{ message: string; is_2fa_enabled: boolean }> {
  const token = localStorage.getItem('moda-user-token');
  const res = await fetchWithTimeout(`/api/v1/user/auth/2fa/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ totp_code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid code' }));
    throw new Error(err.detail || `Failed to disable 2FA (${res.status})`);
  }

  return res.json();
}

// ============================================
// 2FA Verify Login (POST /api/v1/user/auth/2fa/verify-login)
// ============================================

export async function verify2FALogin(pre_auth_token: string, totp_code: string): Promise<UserTokenResponse> {
  const res = await fetchWithTimeout(`/api/v1/user/auth/2fa/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pre_auth_token, totp_code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid code' }));
    throw new Error(err.detail || `2FA verification failed (${res.status})`);
  }

  return res.json();
}

// ============================================
// Firebase Social Auth (Google / Apple)
// ============================================

// ============================================
// Forgot / Reset Password
// ============================================

/** Send OTP to email for brand or consumer/uhni */
export async function forgotPasswordRequest(email: string, isBrand: boolean): Promise<{ message: string }> {
  const url = isBrand ? '/api/v1/auth/forgot-password' : '/api/v1/user/auth/forgot-password';
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

/** Resend OTP */
export async function forgotPasswordResend(email: string, isBrand: boolean): Promise<{ message: string }> {
  const url = isBrand ? '/api/v1/auth/forgot-password/resend' : '/api/v1/user/auth/forgot-password/resend';
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Resend failed' }));
    throw new Error(err.detail || `Resend failed (${res.status})`);
  }
  return res.json();
}

/** Verify OTP — returns reset_token */
export async function forgotPasswordVerify(email: string, otp: string, isBrand: boolean): Promise<{ reset_token: string }> {
  const url = isBrand ? '/api/v1/auth/forgot-password/verify' : '/api/v1/user/auth/forgot-password/verify';
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid OTP' }));
    throw new Error(err.detail || `Verification failed (${res.status})`);
  }
  return res.json();
}

/** Reset password using verified OTP */
export async function resetPassword(email: string, otp: string, new_password: string, isBrand: boolean): Promise<{ message: string }> {
  const url = isBrand ? '/api/v1/auth/reset-password' : '/api/v1/user/auth/reset-password';
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, new_password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Reset failed' }));
    throw new Error(err.detail || `Reset failed (${res.status})`);
  }
  return res.json();
}

export async function socialSignIn(
  provider: 'google' | 'apple',
  idToken: string,
  role: 'consumer' | 'uhni'
): Promise<UserTokenResponse> {
  const res = await fetchWithTimeout(`/api/v1/user/auth/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Social sign-in failed' }));
    throw new Error(err.detail || `Social sign-in failed (${res.status})`);
  }

  return res.json();
}

// ─── SuperAdmin Auth ─────────────────────────────────────────────────────────

export interface SuperAdminLoginResponse {
  requires_2fa: boolean;
  access_token?: string;
  refresh_token?: string;
  pre_auth_token?: string;
  message?: string;
  admin?: {
    superadmin_id: string;
    name: string;
    email: string;
    role: string;
    profile_picture?: string | null;
    currency?: string;
    timezone?: string;
    language?: string;
    is_active: boolean;
    is_2fa_enabled: boolean;
  };
}

export async function superadminLogin(
  credentials: { email: string; password: string }
): Promise<SuperAdminLoginResponse> {
  const res = await fetchWithTimeout('/api/v1/superadmin/auth/login', {
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

export async function superadminVerify2FALogin(
  pre_auth_token: string,
  totp_code: string,
): Promise<SuperAdminLoginResponse> {
  const res = await fetchWithTimeout('/api/v1/superadmin/auth/2fa/verify-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pre_auth_token, totp_code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid code' }));
    throw new Error(err.detail || `Verification failed (${res.status})`);
  }
  return res.json();
}

export function storeSuperadminAuth(data: SuperAdminLoginResponse): void {
  if (!data.access_token || !data.admin) return;
  localStorage.setItem('moda-superadmin-token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('moda-superadmin-refresh-token', data.refresh_token);
  }
  localStorage.setItem('moda-superadmin-data', JSON.stringify(data.admin));
}
