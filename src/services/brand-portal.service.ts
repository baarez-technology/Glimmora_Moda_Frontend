/**
 * Brand Portal Service (B2B)
 * Endpoints: /api/brand-portal/*
 */

import { apiRequest, ApiError, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type {
  BrandPartner, BrandProduct, BrandCollection, GlobalInventoryOverview,
  BrandAnalytics, BrandOrder, RecentActivity, HeritageEvent,
  BrandStory, StylingSession
} from '@/types/brand-portal';
import type {
  BespokeOrder, PriceNegotiation, PrivateCollection,
  SourcingRequest, UHNIPriceOffer
} from '@/types/uhni';
import {
  mockBrandPartner, mockBrandProducts, mockBrandCollections,
  mockGlobalInventory, mockBrandAnalytics, mockRecentActivity,
  mockBrandOrders, mockBespokeOrders, mockPriceNegotiations,
  mockPrivateCollections, mockBrandSourcingRequests,
  mockHeritageEvents, mockBrandStories, mockUHNIOffers,
  mockStylingSessions
} from '@/data/brand-portal';

// ============================================
// Dashboard Aggregate
// ============================================

export interface BrandDashboardPayload {
  partner: BrandPartner;
  products: BrandProduct[];
  collections: BrandCollection[];
  orders: BrandOrder[];
  inventory: GlobalInventoryOverview;
  analytics: BrandAnalytics;
  recentActivity: RecentActivity[];
  bespokeOrders: BespokeOrder[];
  priceNegotiations: PriceNegotiation[];
  privateCollections: PrivateCollection[];
  sourcingRequests: SourcingRequest[];
  heritageEvents: HeritageEvent[];
  brandStories: BrandStory[];
  uhniOffers: UHNIPriceOffer[];
  stylingSessions: StylingSession[];
}

export async function getBrandDashboardData(): Promise<ApiResponse<BrandDashboardPayload>> {
  return apiRequest<BrandDashboardPayload>('/api/brand-portal/dashboard', {
    mockHandler: () => ({
      partner: mockBrandPartner,
      products: mockBrandProducts,
      collections: mockBrandCollections,
      orders: mockBrandOrders,
      inventory: mockGlobalInventory,
      analytics: mockBrandAnalytics,
      recentActivity: mockRecentActivity,
      bespokeOrders: mockBespokeOrders,
      priceNegotiations: mockPriceNegotiations,
      privateCollections: mockPrivateCollections,
      sourcingRequests: mockBrandSourcingRequests,
      heritageEvents: mockHeritageEvents,
      brandStories: mockBrandStories,
      uhniOffers: mockUHNIOffers,
      stylingSessions: mockStylingSessions,
    }),
  });
}

// ============================================
// Brand Partner
// ============================================

export async function getBrandPartner(): Promise<ApiResponse<BrandPartner>> {
  return apiRequest<BrandPartner>('/api/brand-portal/partner', {
    mockHandler: () => mockBrandPartner,
  });
}

// ============================================
// Products
// ============================================

export async function getBrandProducts(): Promise<ApiResponse<BrandProduct[]>> {
  return apiRequest<BrandProduct[]>('/api/brand-portal/products', {
    mockHandler: () => mockBrandProducts,
  });
}

export async function createBrandProduct(
  product: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<BrandProduct>> {
  return apiRequest<BrandProduct>('/api/brand-portal/products', {
    method: 'POST',
    body: product,
    mockHandler: () => ({
      ...product,
      id: generateMockId('bp-product'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BrandProduct),
  });
}

export async function updateBrandProduct(
  id: string,
  updates: Partial<BrandProduct>
): Promise<ApiResponse<BrandProduct>> {
  return apiRequest<BrandProduct>(`/api/brand-portal/products/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const existing = mockBrandProducts.find(p => p.id === id);
      if (!existing) throw new ApiError('NOT_FOUND', `Product ${id} not found`, 404);
      return { ...existing, ...updates, updatedAt: new Date().toISOString() };
    },
  });
}

export async function deleteBrandProduct(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiRequest<{ deleted: boolean }>(`/api/brand-portal/products/${id}`, {
    method: 'DELETE',
    mockHandler: () => ({ deleted: true }),
  });
}

// ============================================
// Collections
// ============================================

export async function getBrandCollections(): Promise<ApiResponse<BrandCollection[]>> {
  return apiRequest<BrandCollection[]>('/api/brand-portal/collections', {
    mockHandler: () => mockBrandCollections,
  });
}

export async function createBrandCollection(
  collection: Omit<BrandCollection, 'id'>
): Promise<ApiResponse<BrandCollection>> {
  return apiRequest<BrandCollection>('/api/brand-portal/collections', {
    method: 'POST',
    body: collection,
    mockHandler: () => ({
      ...collection,
      id: generateMockId('bp-collection'),
    } as BrandCollection),
  });
}

export async function updateBrandCollection(
  id: string,
  updates: Partial<BrandCollection>
): Promise<ApiResponse<BrandCollection>> {
  return apiRequest<BrandCollection>(`/api/brand-portal/collections/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const existing = mockBrandCollections.find(c => c.id === id);
      if (!existing) throw new ApiError('NOT_FOUND', `Collection ${id} not found`, 404);
      return { ...existing, ...updates };
    },
  });
}

// ============================================
// Orders
// ============================================

export async function getBrandOrders(): Promise<ApiResponse<BrandOrder[]>> {
  return apiRequest<BrandOrder[]>('/api/brand-portal/orders', {
    mockHandler: () => mockBrandOrders,
  });
}

export async function updateBrandOrderStatus(
  id: string,
  status: string
): Promise<ApiResponse<BrandOrder>> {
  return apiRequest<BrandOrder>(`/api/brand-portal/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
    mockHandler: () => {
      const existing = mockBrandOrders.find(o => o.id === id);
      if (!existing) throw new ApiError('NOT_FOUND', `Order ${id} not found`, 404);
      return { ...existing, status: status as BrandOrder['status'] };
    },
  });
}

// ============================================
// Inventory & Analytics
// ============================================

export async function getGlobalInventory(): Promise<ApiResponse<GlobalInventoryOverview>> {
  return apiRequest<GlobalInventoryOverview>('/api/brand-portal/inventory', {
    mockHandler: () => mockGlobalInventory,
  });
}

export async function getBrandAnalytics(period?: string): Promise<ApiResponse<BrandAnalytics>> {
  return apiRequest<BrandAnalytics>('/api/brand-portal/analytics', {
    params: { period },
    mockHandler: () => mockBrandAnalytics,
  });
}

// ============================================
// Bespoke Orders
// ============================================

export async function getBespokeOrders(): Promise<ApiResponse<BespokeOrder[]>> {
  return apiRequest<BespokeOrder[]>('/api/brand-portal/bespoke-orders', {
    mockHandler: () => mockBespokeOrders,
  });
}

export async function updateBespokeOrderStatus(
  id: string,
  status: string
): Promise<ApiResponse<BespokeOrder>> {
  return apiRequest<BespokeOrder>(`/api/brand-portal/bespoke-orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
    mockHandler: () => {
      const order = mockBespokeOrders.find(o => o.id === id);
      if (!order) throw new ApiError('NOT_FOUND', `Bespoke order ${id} not found`, 404);
      return { ...order, status, updatedAt: new Date().toISOString() } as BespokeOrder;
    },
  });
}

// ============================================
// Negotiations
// ============================================

export async function getPriceNegotiations(): Promise<ApiResponse<PriceNegotiation[]>> {
  return apiRequest<PriceNegotiation[]>('/api/brand-portal/negotiations', {
    mockHandler: () => mockPriceNegotiations,
  });
}

export async function submitCounterOffer(
  id: string,
  amount: number,
  message?: string
): Promise<ApiResponse<PriceNegotiation>> {
  return apiRequest<PriceNegotiation>(`/api/brand-portal/negotiations/${id}/counter`, {
    method: 'POST',
    body: { amount, message },
    mockHandler: () => {
      const negotiation = mockPriceNegotiations.find(n => n.id === id);
      if (!negotiation) throw new ApiError('NOT_FOUND', `Negotiation ${id} not found`, 404);
      return { ...negotiation, status: 'counter_offered' } as PriceNegotiation;
    },
  });
}

export async function approveNegotiation(id: string): Promise<ApiResponse<PriceNegotiation>> {
  return apiRequest<PriceNegotiation>(`/api/brand-portal/negotiations/${id}/approve`, {
    method: 'POST',
    mockHandler: () => {
      const n = mockPriceNegotiations.find(n => n.id === id);
      if (!n) throw new ApiError('NOT_FOUND', `Negotiation ${id} not found`, 404);
      return { ...n, status: 'approved' } as PriceNegotiation;
    },
  });
}

export async function declineNegotiation(id: string): Promise<ApiResponse<PriceNegotiation>> {
  return apiRequest<PriceNegotiation>(`/api/brand-portal/negotiations/${id}/decline`, {
    method: 'POST',
    mockHandler: () => {
      const n = mockPriceNegotiations.find(n => n.id === id);
      if (!n) throw new ApiError('NOT_FOUND', `Negotiation ${id} not found`, 404);
      return { ...n, status: 'declined' } as PriceNegotiation;
    },
  });
}

// ============================================
// Private Collections
// ============================================

export async function getPrivateCollections(): Promise<ApiResponse<PrivateCollection[]>> {
  return apiRequest<PrivateCollection[]>('/api/brand-portal/private-collections', {
    mockHandler: () => mockPrivateCollections,
  });
}

export async function createPrivateCollection(
  collection: Omit<PrivateCollection, 'id'>
): Promise<ApiResponse<PrivateCollection>> {
  return apiRequest<PrivateCollection>('/api/brand-portal/private-collections', {
    method: 'POST',
    body: collection,
    mockHandler: () => ({ ...collection, id: generateMockId('priv-col') }),
  });
}

export async function updatePrivateCollection(
  id: string,
  updates: Partial<PrivateCollection>
): Promise<ApiResponse<PrivateCollection>> {
  return apiRequest<PrivateCollection>(`/api/brand-portal/private-collections/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const existing = mockPrivateCollections.find(c => c.id === id);
      if (!existing) throw new ApiError('NOT_FOUND', `Private collection ${id} not found`, 404);
      return { ...existing, ...updates };
    },
  });
}

// ============================================
// Sourcing Requests
// ============================================

export async function getSourcingRequests(): Promise<ApiResponse<SourcingRequest[]>> {
  return apiRequest<SourcingRequest[]>('/api/brand-portal/sourcing-requests', {
    mockHandler: () => mockBrandSourcingRequests,
  });
}

export async function submitSourcingOption(
  requestId: string,
  option: { description: string; price: number; condition: string; source?: string }
): Promise<ApiResponse<SourcingRequest>> {
  return apiRequest<SourcingRequest>(`/api/brand-portal/sourcing-requests/${requestId}/options`, {
    method: 'POST',
    body: option,
    mockHandler: () => {
      const request = mockBrandSourcingRequests.find(r => r.id === requestId);
      if (!request) throw new ApiError('NOT_FOUND', `Sourcing request ${requestId} not found`, 404);
      return { ...request, updatedAt: new Date().toISOString() } as SourcingRequest;
    },
  });
}

// ============================================
// Heritage Events
// ============================================

export async function getHeritageEvents(): Promise<ApiResponse<HeritageEvent[]>> {
  return apiRequest<HeritageEvent[]>('/api/brand-portal/heritage-events', {
    mockHandler: () => mockHeritageEvents,
  });
}

export async function createHeritageEvent(
  event: Omit<HeritageEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<HeritageEvent>> {
  return apiRequest<HeritageEvent>('/api/brand-portal/heritage-events', {
    method: 'POST',
    body: event,
    mockHandler: () => ({ ...event, id: generateMockId('heritage') } as HeritageEvent),
  });
}

export async function updateHeritageEvent(
  id: string,
  updates: Partial<HeritageEvent>
): Promise<ApiResponse<HeritageEvent>> {
  return apiRequest<HeritageEvent>(`/api/brand-portal/heritage-events/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => ({ ...updates, id } as HeritageEvent),
  });
}

// ============================================
// Brand Stories
// ============================================

export async function getBrandStories(): Promise<ApiResponse<BrandStory[]>> {
  return apiRequest<BrandStory[]>('/api/brand-portal/stories', {
    mockHandler: () => mockBrandStories,
  });
}

export async function createBrandStory(
  story: Omit<BrandStory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<BrandStory>> {
  return apiRequest<BrandStory>('/api/brand-portal/stories', {
    method: 'POST',
    body: story,
    mockHandler: () => ({
      ...story,
      id: generateMockId('story'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BrandStory),
  });
}

export async function updateBrandStory(
  id: string,
  updates: Partial<BrandStory>
): Promise<ApiResponse<BrandStory>> {
  return apiRequest<BrandStory>(`/api/brand-portal/stories/${id}`, {
    method: 'PATCH',
    body: updates,
    mockHandler: () => {
      const existing = mockBrandStories.find(s => s.id === id);
      if (!existing) throw new ApiError('NOT_FOUND', `Story ${id} not found`, 404);
      return { ...existing, ...updates, updatedAt: new Date().toISOString() };
    },
  });
}

// ============================================
// UHNI Offers
// ============================================

export async function getUHNIOffers(): Promise<ApiResponse<UHNIPriceOffer[]>> {
  return apiRequest<UHNIPriceOffer[]>('/api/brand-portal/uhni-offers', {
    mockHandler: () => mockUHNIOffers,
  });
}

export async function createUHNIOffer(
  offer: Omit<UHNIPriceOffer, 'id'>
): Promise<ApiResponse<UHNIPriceOffer>> {
  return apiRequest<UHNIPriceOffer>('/api/brand-portal/uhni-offers', {
    method: 'POST',
    body: offer,
    mockHandler: () => ({ ...offer, id: generateMockId('offer') }),
  });
}

// ============================================
// Styling Sessions
// ============================================

export async function getStylingSessions(): Promise<ApiResponse<StylingSession[]>> {
  return apiRequest<StylingSession[]>('/api/brand-portal/styling-sessions', {
    mockHandler: () => mockStylingSessions,
  });
}

export async function updateStylingSessionStatus(
  id: string,
  status: StylingSession['status']
): Promise<ApiResponse<StylingSession>> {
  return apiRequest<StylingSession>(`/api/brand-portal/styling-sessions/${id}/status`, {
    method: 'PATCH',
    body: { status },
    mockHandler: () => {
      const session = mockStylingSessions.find(s => s.id === id);
      if (!session) throw new ApiError('NOT_FOUND', `Styling session ${id} not found`, 404);
      return { ...session, status };
    },
  });
}

export async function createStylingSession(
  session: Omit<StylingSession, 'id'>
): Promise<ApiResponse<StylingSession>> {
  return apiRequest<StylingSession>('/api/brand-portal/styling-sessions', {
    method: 'POST',
    body: session,
    mockHandler: () => ({ ...session, id: generateMockId('styling') }),
  });
}

export async function getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
  return apiRequest<RecentActivity[]>('/api/brand-portal/activity', {
    mockHandler: () => mockRecentActivity,
  });
}
