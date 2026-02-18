/**
 * UHNI Service
 * Endpoints: /api/uhni/*
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type {
  PersonalConcierge,
  AutonomousShoppingSettings,
  SourcingRequest,
  BespokeOrder,
  AutonomousActivity,
  PriceNegotiation,
  PrivateCollection,
  UHNIProfile
} from '@/types/uhni';
import {
  mockConcierge,
  mockAutonomousSettings,
  mockSourcingRequests,
  mockBespokeOrders,
  mockAutonomousActivity,
  mockPriceNegotiations,
  mockPrivateCollections
} from '@/data/uhni';

// ============================================
// Concierge
// ============================================

export async function getConcierge(): Promise<ApiResponse<PersonalConcierge>> {
  return apiRequest<PersonalConcierge>('/api/uhni/concierge', {
    mockHandler: () => mockConcierge,
  });
}

export async function sendConciergeMessage(message: string): Promise<ApiResponse<{ sent: boolean }>> {
  return apiRequest<{ sent: boolean }>('/api/uhni/concierge/messages', {
    method: 'POST',
    body: { message },
    mockHandler: () => ({ sent: true }),
  });
}

// ============================================
// Autonomous Shopping
// ============================================

export async function getAutonomousSettings(): Promise<ApiResponse<AutonomousShoppingSettings>> {
  return apiRequest<AutonomousShoppingSettings>('/api/uhni/autonomous/settings', {
    mockHandler: () => mockAutonomousSettings,
  });
}

export async function updateAutonomousSettings(
  settings: Partial<AutonomousShoppingSettings>
): Promise<ApiResponse<AutonomousShoppingSettings>> {
  return apiRequest<AutonomousShoppingSettings>('/api/uhni/autonomous/settings', {
    method: 'PATCH',
    body: settings,
    mockHandler: () => ({ ...mockAutonomousSettings, ...settings }),
  });
}

export async function getAutonomousActivity(): Promise<ApiResponse<AutonomousActivity[]>> {
  return apiRequest<AutonomousActivity[]>('/api/uhni/autonomous/activity', {
    mockHandler: () => mockAutonomousActivity,
  });
}

export async function getAutonomousPurchases(): Promise<ApiResponse<AutonomousActivity[]>> {
  return apiRequest<AutonomousActivity[]>('/api/uhni/autonomous/purchases', {
    mockHandler: () => mockAutonomousActivity.filter(a => a.type === 'auto_purchased'),
  });
}

// ============================================
// Sourcing
// ============================================

export async function getSourcingRequests(): Promise<ApiResponse<SourcingRequest[]>> {
  return apiRequest<SourcingRequest[]>('/api/uhni/sourcing', {
    mockHandler: () => mockSourcingRequests,
  });
}

export async function createSourcingRequest(
  request: Omit<SourcingRequest, 'id'>
): Promise<ApiResponse<SourcingRequest>> {
  return apiRequest<SourcingRequest>('/api/uhni/sourcing', {
    method: 'POST',
    body: request,
    mockHandler: () => ({ ...request, id: generateMockId('sourcing') } as SourcingRequest),
  });
}

export async function getSourcingSearches(): Promise<ApiResponse<SourcingRequest[]>> {
  return apiRequest<SourcingRequest[]>('/api/uhni/sourcing/searches', {
    mockHandler: () => mockSourcingRequests.filter(r => r.status === 'sourcing'),
  });
}

// ============================================
// Bespoke Orders
// ============================================

export async function getBespokeOrders(): Promise<ApiResponse<BespokeOrder[]>> {
  return apiRequest<BespokeOrder[]>('/api/uhni/bespoke', {
    mockHandler: () => mockBespokeOrders,
  });
}

// ============================================
// Pricing / Negotiations
// ============================================

export async function getPriceNegotiations(): Promise<ApiResponse<PriceNegotiation[]>> {
  return apiRequest<PriceNegotiation[]>('/api/uhni/pricing/negotiations', {
    mockHandler: () => mockPriceNegotiations,
  });
}

// ============================================
// Private Collections & Shopping
// ============================================

export async function getPrivateCollections(): Promise<ApiResponse<PrivateCollection[]>> {
  return apiRequest<PrivateCollection[]>('/api/uhni/private-collections', {
    mockHandler: () => mockPrivateCollections,
  });
}

export async function getPrivateShopping(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return apiRequest<Record<string, unknown>[]>('/api/uhni/private-shopping', {
    mockHandler: () => [],
  });
}

// ============================================
// Events
// ============================================

export async function getExclusiveEvents(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return apiRequest<Record<string, unknown>[]>('/api/uhni/events', {
    mockHandler: () => [],
  });
}

// ============================================
// Heritage Archive
// ============================================

export async function getHeritageArchive(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return apiRequest<Record<string, unknown>[]>('/api/uhni/heritage-archive', {
    mockHandler: () => [],
  });
}

// ============================================
// Intelligence
// ============================================

export async function getIntelligenceInsights(): Promise<ApiResponse<Record<string, unknown>[]>> {
  return apiRequest<Record<string, unknown>[]>('/api/uhni/intelligence', {
    mockHandler: () => [],
  });
}
