/**
 * User Service
 * Endpoints: /api/users/*
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type { User, FashionIdentity } from '@/types';
import type { DigitalBodyTwin } from '@/types/intelligence';
import { mockUser, mockUserPreferences, mockRestockNotifications, mockSilentCart } from '@/data/users';

// ============================================
// User Profile
// ============================================

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiRequest<User>('/api/users/me', {
    mockHandler: () => mockUser,
  });
}

export async function updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
  return apiRequest<User>('/api/users/me', {
    method: 'PATCH',
    body: updates,
    mockHandler: () => ({ ...mockUser, ...updates }),
  });
}

// ============================================
// Fashion Identity
// ============================================

export async function getFashionIdentity(): Promise<ApiResponse<FashionIdentity | null>> {
  return apiRequest<FashionIdentity | null>('/api/users/me/fashion-identity', {
    mockHandler: () => {
      try {
        // 1. Check localStorage (most up-to-date local state)
        const stored = localStorage.getItem('moda-fashion-identity');
        if (stored) return JSON.parse(stored);

        // 2. Build from backend UserData if available (has real selections)
        const userData = localStorage.getItem('moda-user-data');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.occasions?.length || parsed.aesthetics?.length) {
            return {
              occasions: parsed.occasions || [],
              aesthetics: parsed.aesthetics || [],
              confidenceLevel: 'guided' as const,
              budgetRange: {
                min: parsed.minimum_budget ?? 0,
                max: parsed.maximum_budget ?? 0,
              },
              primaryLocation: '',
              travelDestinations: [],
            };
          }
        }

        // 3. Fall back to mock data (first-time users only)
        return mockUser.fashionIdentity ?? null;
      } catch { return mockUser.fashionIdentity ?? null; }
    },
  });
}

export async function updateFashionIdentity(
  identity: FashionIdentity
): Promise<ApiResponse<FashionIdentity>> {
  return apiRequest<FashionIdentity>('/api/users/me/fashion-identity', {
    method: 'PUT',
    body: identity,
    mockHandler: () => identity,
  });
}

// ============================================
// Body Twin
// ============================================

export async function getBodyTwin(): Promise<ApiResponse<DigitalBodyTwin | null>> {
  return apiRequest<DigitalBodyTwin | null>('/api/users/me/body-twin', {
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-body-twin');
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    },
  });
}

export async function updateBodyTwin(bodyTwin: DigitalBodyTwin): Promise<ApiResponse<DigitalBodyTwin>> {
  return apiRequest<DigitalBodyTwin>('/api/users/me/body-twin', {
    method: 'PUT',
    body: bodyTwin,
    mockHandler: () => bodyTwin,
  });
}

// ============================================
// Preferences
// ============================================

export async function getUserPreferences(): Promise<ApiResponse<typeof mockUserPreferences>> {
  return apiRequest('/api/users/me/preferences', {
    mockHandler: () => mockUserPreferences,
  });
}

export async function getRestockNotifications(): Promise<ApiResponse<typeof mockRestockNotifications>> {
  return apiRequest('/api/users/me/restock-notifications', {
    mockHandler: () => mockRestockNotifications,
  });
}

export async function getSilentCart(): Promise<ApiResponse<typeof mockSilentCart>> {
  return apiRequest('/api/users/me/silent-cart', {
    mockHandler: () => mockSilentCart,
  });
}

// ============================================
// Addresses
// ============================================

export interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export async function getAddresses(): Promise<ApiResponse<Address[]>> {
  return apiRequest<Address[]>('/api/users/me/addresses', {
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-addresses');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    },
  });
}

export async function createAddress(address: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
  return apiRequest<Address>('/api/users/me/addresses', {
    method: 'POST',
    body: address,
    mockHandler: () => ({ ...address, id: generateMockId('addr') }),
  });
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<ApiResponse<Address>> {
  return apiRequest<Address>(`/api/users/me/addresses/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-addresses');
        const addresses: Address[] = stored ? JSON.parse(stored) : [];
        const existing = addresses.find(a => a.id === id);
        if (!existing) throw new Error('Address not found');
        return { ...existing, ...updates };
      } catch { throw new Error('Address not found'); }
    },
  });
}

export async function deleteAddress(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiRequest<{ deleted: boolean }>(`/api/users/me/addresses/${id}`, {
    method: 'DELETE',
    mockHandler: () => ({ deleted: true }),
  });
}

// ============================================
// Payment Methods
// ============================================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  label: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export async function getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
  return apiRequest<PaymentMethod[]>('/api/users/me/payment-methods', {
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-payment-methods');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    },
  });
}

export async function createPaymentMethod(
  method: Omit<PaymentMethod, 'id'>
): Promise<ApiResponse<PaymentMethod>> {
  return apiRequest<PaymentMethod>('/api/users/me/payment-methods', {
    method: 'POST',
    body: method,
    mockHandler: () => ({ ...method, id: generateMockId('pm') }),
  });
}

export async function deletePaymentMethod(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiRequest<{ deleted: boolean }>(`/api/users/me/payment-methods/${id}`, {
    method: 'DELETE',
    mockHandler: () => ({ deleted: true }),
  });
}
