/**
 * Bespoke Orders Service
 * Consumer (UHNI) endpoints: /api/v1/consumer/bespoke-orders/*
 * Brand endpoints: /api/v1/brand/bespoke-orders/*
 *
 * Uses relative paths — proxied by Next.js to backend.
 */

import { fetchWithTimeout } from '@/lib/api-cache';
import type {
  BespokeOrder,
  BespokeOrderStatus,
  BespokeTimelineStep,
  BespokeMessage,
  BespokeDetailedSpec,
  BespokeTimelineEvent,
} from '@/types/uhni';

// ============================================
// API Response Types (snake_case from backend)
// ============================================

export interface ApiBespokeOrder {
  bespoke_id: string;
  customer_id: string;
  customer_email: string;
  order_title: string;
  brand_ids: string[];
  order_type: string;
  description: string;
  budget: number;
  timeline: string; // requested deadline text
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  inseam: number;
  sleeve_length: number;
  height: number;
  measurement_notes: string;
  fabric_preferences: string;
  color_preferences: string;
  occations_context: string; // API typo
  special_instructions: string;
  price: number;
  deposite: number; // API typo for deposit
  images: string[];
  customer_design_approval: boolean;
  estimate_completation: string; // API typo for estimated completion
  status: string;
  bespoke_timeline: ApiBespokeTimeline[];
  messages: ApiBespokeMessage[];
  created_at: string;
}

export interface ApiBespokeTimeline {
  status: string;
  title?: string;
  description?: string;
  is_completed?: boolean;
  completed_at?: string;
  estimated_date?: string;
  notes?: string;
}

export interface ApiBespokeMessage {
  message_id?: string;
  id?: string;
  type: 'customer' | 'brand';
  content: string;
  created_at: string;
  sender_name?: string;
}

// ============================================
// Auth Helpers
// ============================================

function consumerAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('moda-user-token')
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function brandAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('moda-brand-token')
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================
// Mappers: API → Frontend
// ============================================

const TIMELINE_STAGES: BespokeOrderStatus[] = [
  'consultation',
  'design_approval',
  'production',
  'fitting',
  'final_adjustments',
  'complete',
];

const STAGE_TITLES: Record<string, string> = {
  consultation: 'Consultation',
  design_approval: 'Design Approval',
  production: 'Production',
  fitting: 'Fitting',
  final_adjustments: 'Final Adjustments',
  complete: 'Complete',
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  consultation: 'Initial consultation and requirements gathering',
  design_approval: 'Design review and client approval',
  production: 'Crafting your bespoke piece',
  fitting: 'First fitting and adjustments',
  final_adjustments: 'Final touches and quality assurance',
  complete: 'Ready for delivery',
};

function mapApiTimelineToSteps(
  apiTimeline: ApiBespokeTimeline[],
  currentStatus: string
): BespokeTimelineStep[] {
  const currentIndex = TIMELINE_STAGES.indexOf(currentStatus as BespokeOrderStatus);

  // If the backend returns a structured timeline, use it
  if (apiTimeline && apiTimeline.length > 0) {
    return apiTimeline.map((item, index) => {
      const stage = (item.status || TIMELINE_STAGES[index]) as BespokeOrderStatus;
      const stageIndex = TIMELINE_STAGES.indexOf(stage);
      let stepStatus: 'completed' | 'current' | 'upcoming';
      if (item.is_completed) {
        stepStatus = 'completed';
      } else if (stageIndex === currentIndex) {
        stepStatus = 'current';
      } else if (stageIndex < currentIndex) {
        stepStatus = 'completed';
      } else {
        stepStatus = 'upcoming';
      }
      return {
        id: `step-${stage}`,
        stage,
        title: item.title || STAGE_TITLES[stage] || stage,
        description: item.description || STAGE_DESCRIPTIONS[stage] || '',
        status: stepStatus,
        completedAt: item.completed_at,
        estimatedDate: item.estimated_date,
        notes: item.notes,
      };
    });
  }

  // Fallback: generate from status
  return TIMELINE_STAGES.map((stage, index) => ({
    id: `step-${stage}`,
    stage,
    title: STAGE_TITLES[stage],
    description: STAGE_DESCRIPTIONS[stage],
    status:
      index < currentIndex
        ? ('completed' as const)
        : index === currentIndex
          ? ('current' as const)
          : ('upcoming' as const),
  }));
}

function mapApiMessages(apiMessages: ApiBespokeMessage[]): BespokeMessage[] {
  if (!apiMessages || !Array.isArray(apiMessages)) return [];
  return apiMessages.map((msg, index) => ({
    id: msg.message_id || msg.id || `msg-${index}`,
    senderId: msg.type === 'customer' ? 'uhni-user' : 'brand-user',
    senderName: msg.sender_name || (msg.type === 'customer' ? 'You' : 'Brand Atelier'),
    senderRole: msg.type === 'customer' ? ('client' as const) : ('brand' as const),
    content: msg.content,
    createdAt: msg.created_at,
  }));
}

export function mapApiBespokeToFrontend(api: ApiBespokeOrder): BespokeOrder {
  const measurements: Record<string, number> = {};
  if (api.chest) measurements.chest = api.chest;
  if (api.waist) measurements.waist = api.waist;
  if (api.hips) measurements.hips = api.hips;
  if (api.shoulders) measurements.shoulders = api.shoulders;
  if (api.inseam) measurements.inseam = api.inseam;
  if (api.sleeve_length) measurements.sleeveLength = api.sleeve_length;
  if (api.height) measurements.height = api.height;

  const detailedSpec: BespokeDetailedSpec = {
    measurements: {
      chest: api.chest || undefined,
      waist: api.waist || undefined,
      hips: api.hips || undefined,
      shoulders: api.shoulders || undefined,
      inseam: api.inseam || undefined,
      sleeveLength: api.sleeve_length || undefined,
      height: api.height || undefined,
      notes: api.measurement_notes || undefined,
    },
    fabricPreferences: api.fabric_preferences || undefined,
    colorPreferences: api.color_preferences || undefined,
    occasionContext: api.occations_context || undefined,
    specialInstructions: api.special_instructions || undefined,
  };

  const status = (api.status || 'consultation') as BespokeOrderStatus;

  return {
    id: api.bespoke_id,
    brandId: api.brand_ids?.[0] || '',
    brandName: '', // brand_ids only has IDs, names resolved in UI if needed
    selectedBrands: api.brand_ids?.map(id => ({ id, name: '' })),
    type: (api.order_type || 'custom_design') as BespokeOrder['type'],
    title: api.order_title || '',
    description: api.description || '',
    specifications: [],
    measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
    status,
    timeline: mapApiTimelineToSteps(api.bespoke_timeline, status),
    estimatedCompletion: api.estimate_completation || '',
    price: api.price || 0,
    depositPaid: api.deposite || 0,
    depositPercentage: api.price > 0 && api.deposite > 0
      ? Math.round((api.deposite / api.price) * 100)
      : 0,
    progressImages: api.images || [],
    createdAt: api.created_at || new Date().toISOString(),
    updatedAt: api.created_at || new Date().toISOString(),
    messages: mapApiMessages(api.messages),
    detailedSpec,
    timelineEvents: [],
    clientApprovalRequired: status === 'design_approval' && !api.customer_design_approval,
    clientApproved: api.customer_design_approval || false,
    // Extra fields for reference
    customerId: api.customer_id,
    customerEmail: api.customer_email,
    budget: api.budget,
  } as BespokeOrder & { customerId?: string; customerEmail?: string; budget?: number };
}

// ============================================
// Consumer (UHNI) Endpoints
// ============================================

export async function fetchConsumerBespokeOrders(): Promise<BespokeOrder[]> {
  const res = await fetchWithTimeout('/api/v1/consumer/bespoke-orders', {
    headers: consumerAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch bespoke orders: ${res.status}`);
  const data: ApiBespokeOrder[] = await res.json();
  return data.map(mapApiBespokeToFrontend);
}

export async function fetchConsumerBespokeOrder(bespokeId: string): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(`/api/v1/consumer/bespoke-orders/${bespokeId}`, {
    headers: consumerAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch bespoke order: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export interface CreateBespokePayload {
  order_title: string;
  brand_ids: string[];
  order_type: string;
  description: string;
  budget: number;
  timeline: string; // requested deadline
  chest?: number;
  waist?: number;
  hips?: number;
  shoulders?: number;
  inseam?: number;
  sleeve_length?: number;
  height?: number;
  measurement_notes?: string;
  fabric_preferences?: string;
  color_preferences?: string;
  occations_context?: string;
  special_instructions?: string;
}

export async function createConsumerBespokeOrder(
  payload: CreateBespokePayload
): Promise<BespokeOrder> {
  const res = await fetchWithTimeout('/api/v1/consumer/bespoke-orders', {
    method: 'POST',
    headers: consumerAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.[0]?.msg || `Failed to create bespoke order: ${res.status}`);
  }
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export async function approveConsumerDesign(bespokeId: string): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(
    `/api/v1/consumer/bespoke-orders/${bespokeId}/design-approval`,
    {
      method: 'PATCH',
      headers: consumerAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error(`Failed to approve design: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export async function addConsumerMessage(
  bespokeId: string,
  message: string
): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(
    `/api/v1/consumer/bespoke-orders/${bespokeId}/messages?message=${encodeURIComponent(message)}`,
    {
      method: 'POST',
      headers: consumerAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

// ============================================
// Brand Endpoints
// ============================================

export async function fetchBrandBespokeOrders(): Promise<BespokeOrder[]> {
  const res = await fetchWithTimeout('/api/v1/brand/bespoke-orders/', {
    headers: brandAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch brand bespoke orders: ${res.status}`);
  const data: ApiBespokeOrder[] = await res.json();
  return data.map(mapApiBespokeToFrontend);
}

export async function fetchBrandBespokeOrder(bespokeId: string): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(`/api/v1/brand/bespoke-orders/${bespokeId}`, {
    headers: brandAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch brand bespoke order: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export interface UpdateBrandBespokePayload {
  images?: string[];
  price?: number;
  deposite?: number;
  estimate_completation?: string;
}

export async function updateBrandBespokeOrder(
  bespokeId: string,
  payload: UpdateBrandBespokePayload
): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(`/api/v1/brand/bespoke-orders/${bespokeId}`, {
    method: 'PATCH',
    headers: brandAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update bespoke order: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export async function updateBrandBespokeTimelineDates(
  bespokeId: string,
  timeline: { status: string; estimated_date: string }[]
): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(
    `/api/v1/brand/bespoke-orders/${bespokeId}/timeline-dates`,
    {
      method: 'PATCH',
      headers: brandAuthHeaders(),
      body: JSON.stringify({ timeline }),
    }
  );
  if (!res.ok) throw new Error(`Failed to update timeline dates: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export async function updateBrandBespokeStatus(
  bespokeId: string,
  status: string,
  notes?: string
): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(
    `/api/v1/brand/bespoke-orders/${bespokeId}/status`,
    {
      method: 'PATCH',
      headers: brandAuthHeaders(),
      body: JSON.stringify({ status, notes: notes || '' }),
    }
  );
  if (!res.ok) throw new Error(`Failed to update bespoke status: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}

export async function addBrandMessage(
  bespokeId: string,
  message: string
): Promise<BespokeOrder> {
  const res = await fetchWithTimeout(
    `/api/v1/brand/bespoke-orders/${bespokeId}/messages?message=${encodeURIComponent(message)}`,
    {
      method: 'POST',
      headers: brandAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error(`Failed to send brand message: ${res.status}`);
  const data: ApiBespokeOrder = await res.json();
  return mapApiBespokeToFrontend(data);
}
