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
  ExclusiveEvent,
  PrivateShoppingEvent,
  HeritageArchiveItem,
  IntelligenceInsight,
  ZeroUIConfig,
  InvisibleTransaction,
  ConciergeTask,
  SilentCommerceItem
} from '@/types/uhni';
import {
  mockConcierge,
  mockAutonomousSettings,
  mockSourcingRequests,
  mockBespokeOrders,
  mockAutonomousActivity,
  mockPriceNegotiations,
  mockPrivateCollections,
  mockExclusiveEvents,
  mockPrivateShoppingEvents,
  mockHeritageArchiveItems,
  mockIntelligenceInsights,
  mockZeroUIConfig,
  mockInvisibleTransactions,
  mockConciergeTasks,
  mockSilentCommerceItems
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

export async function getPrivateShopping(): Promise<ApiResponse<PrivateShoppingEvent[]>> {
  return apiRequest<PrivateShoppingEvent[]>('/api/uhni/private-shopping', {
    mockHandler: () => mockPrivateShoppingEvents,
  });
}

// ============================================
// Events
// ============================================

export async function getExclusiveEvents(): Promise<ApiResponse<ExclusiveEvent[]>> {
  return apiRequest<ExclusiveEvent[]>('/api/uhni/events', {
    mockHandler: () => mockExclusiveEvents,
  });
}

// ============================================
// Heritage Archive
// ============================================

export async function getHeritageArchive(): Promise<ApiResponse<HeritageArchiveItem[]>> {
  return apiRequest<HeritageArchiveItem[]>('/api/uhni/heritage-archive', {
    mockHandler: () => mockHeritageArchiveItems,
  });
}

// ============================================
// Intelligence
// ============================================

export async function getIntelligenceInsights(): Promise<ApiResponse<IntelligenceInsight[]>> {
  return apiRequest<IntelligenceInsight[]>('/api/uhni/intelligence', {
    mockHandler: () => mockIntelligenceInsights,
  });
}

// ============================================
// U13: Zero-UI Commerce
// ============================================

export async function getZeroUIConfig(): Promise<ApiResponse<ZeroUIConfig>> {
  return apiRequest<ZeroUIConfig>('/api/uhni/zero-ui/config', {
    mockHandler: () => mockZeroUIConfig,
  });
}

export async function updateZeroUIConfig(
  config: Partial<ZeroUIConfig>
): Promise<ApiResponse<ZeroUIConfig>> {
  return apiRequest<ZeroUIConfig>('/api/uhni/zero-ui/config', {
    method: 'PATCH',
    body: config,
    mockHandler: () => ({ ...mockZeroUIConfig, ...config }),
  });
}

// ============================================
// U14: Invisible Commerce
// ============================================

export async function getInvisibleTransactions(): Promise<ApiResponse<InvisibleTransaction[]>> {
  return apiRequest<InvisibleTransaction[]>('/api/uhni/invisible-commerce/transactions', {
    mockHandler: () => mockInvisibleTransactions,
  });
}

// ============================================
// U15: Concierge Tasks
// ============================================

export async function getConciergeTasks(): Promise<ApiResponse<ConciergeTask[]>> {
  return apiRequest<ConciergeTask[]>('/api/uhni/concierge-tasks', {
    mockHandler: () => mockConciergeTasks,
  });
}

export async function updateConciergeTask(
  id: string,
  updates: Partial<ConciergeTask>
): Promise<ApiResponse<ConciergeTask>> {
  return apiRequest<ConciergeTask>(`/api/uhni/concierge-tasks/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const task = mockConciergeTasks.find(t => t.id === id);
      if (!task) throw new Error(`Task ${id} not found`);
      return { ...task, ...updates };
    },
  });
}

// ============================================
// U16: Silent Commerce
// ============================================

export async function getSilentCommerceItems(): Promise<ApiResponse<SilentCommerceItem[]>> {
  return apiRequest<SilentCommerceItem[]>('/api/uhni/silent-commerce', {
    mockHandler: () => mockSilentCommerceItems,
  });
}
