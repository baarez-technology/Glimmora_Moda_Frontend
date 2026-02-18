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
