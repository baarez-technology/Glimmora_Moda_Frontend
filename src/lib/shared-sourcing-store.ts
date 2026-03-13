/**
 * Shared Sourcing Store — connects UHNI and Brand sourcing flows via localStorage
 *
 * Both portals read/write the same localStorage keys:
 * - moda-sourcing-created: ApiSourcingRequest[] (request metadata)
 * - moda-sourcing-enrichment: Record<string, MockEnrichment> (options, messages, timeline)
 *
 * This file provides:
 * - Type mapping between UHNI types and Brand types
 * - Read functions for brand side to see UHNI-created requests
 * - Write functions for brand side to add options/respond to negotiations
 * - In-memory listener pattern for cross-context reactivity
 */

import type {
  ApiSourcingRequest,
  SourcingOptionItem,
  SourcingChatMessage,
  EnrichedSourcingRequest,
} from '@/services/sourcing.service';
import type {
  SourcingRequest,
  SourcingOption,
  SourcingMessage,
  SourcingRequestStatus,
} from '@/types/uhni';

// ── localStorage keys (same as sourcing.service.ts) ─────────────────

const LS_CREATED_KEY = 'moda-sourcing-created';
const LS_ENRICHMENT_KEY = 'moda-sourcing-enrichment';

interface StoredEnrichment {
  conciergeAssigned?: string;
  timeline_dates?: Record<string, string>;
  options: SourcingOptionItem[];
  messages: SourcingChatMessage[];
}

function getLocalRequests(): ApiSourcingRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_CREATED_KEY) || '[]');
  } catch { return []; }
}

function saveLocalRequests(requests: ApiSourcingRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_CREATED_KEY, JSON.stringify(requests));
}

function getLocalEnrichment(): Record<string, StoredEnrichment> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LS_ENRICHMENT_KEY) || '{}');
  } catch { return {}; }
}

function saveLocalEnrichment(data: Record<string, StoredEnrichment>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_ENRICHMENT_KEY, JSON.stringify(data));
}

// ── In-memory listener pattern ──────────────────────────────────────

type Listener = () => void;
const listeners: Listener[] = [];

export function notifySourcingListeners() {
  listeners.forEach(fn => fn());
}

export function subscribeToSourcingChanges(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

// ── Type Mapping: UHNI → Brand ──────────────────────────────────────

function mapOptionItemToBrand(item: SourcingOptionItem): SourcingOption {
  return {
    id: item.id,
    title: item.title,
    customDescription: item.title,
    brandName: item.brandName,
    source: item.source || 'Brand Inventory',
    sourceLocation: item.sourceLocation,
    condition: item.condition || 'new',
    price: item.price,
    originalPrice: item.originalPrice,
    currency: item.currency,
    estimatedDelivery: item.estimatedDelivery,
    conciergeRecommendation: item.conciergeNote,
    notes: item.conciergeNote,
    images: [],
    negotiationStatus: item.negotiationStatus,
    proposedPrice: item.proposedPrice,
    counterPrice: item.counterPrice,
    negotiationNote: item.negotiationNote,
    counterNote: item.counterNote,
  };
}

function mapMessageToBrand(msg: SourcingChatMessage): SourcingMessage {
  return {
    id: msg.id,
    senderId: msg.sender === 'client' ? 'uhni-user' : msg.sender === 'concierge' ? 'concierge' : 'system',
    senderName: msg.senderName,
    senderRole: msg.sender === 'client' ? 'client' : 'concierge',
    content: msg.content,
    createdAt: msg.timestamp,
  };
}

/**
 * Read all UHNI-created sourcing requests as Brand-typed SourcingRequest[]
 */
export function getUhniSourcingRequests(): SourcingRequest[] {
  const requests = getLocalRequests();
  const enrichments = getLocalEnrichment();

  return requests.map((req): SourcingRequest => {
    const enrichment = enrichments[req.sourcing_id];
    const budgetNum = Number(req.budget) || 0;

    return {
      id: req.sourcing_id,
      type: 'specific_item',
      status: (req.status || 'pending') as SourcingRequestStatus,
      title: req.looking_for,
      description: req.description,
      budget: { min: budgetNum, max: budgetNum, flexible: true },
      deadline: req.deadline,
      category: req.product_category,
      specifications: req.specifications,
      priority: (req.priority || 'standard') as 'standard' | 'urgent' | 'when_available',
      conciergeNotes: [],
      foundOptions: enrichment
        ? enrichment.options.map(mapOptionItemToBrand)
        : [],
      messages: enrichment
        ? enrichment.messages.map(mapMessageToBrand)
        : [],
      createdAt: req.created_at,
      updatedAt: req.updated_at,
    };
  });
}

// ── Type Mapping: Brand → UHNI ──────────────────────────────────────

function mapBrandOptionToItem(opt: SourcingOption): SourcingOptionItem {
  return {
    id: opt.id,
    title: opt.title || opt.customDescription || '',
    brandName: opt.brandName,
    source: opt.source || 'Brand Inventory',
    sourceLocation: opt.sourceLocation || '',
    condition: opt.condition || 'new',
    price: opt.price,
    originalPrice: opt.originalPrice,
    currency: opt.currency || 'EUR',
    estimatedDelivery: opt.estimatedDelivery || '',
    conciergeNote: opt.conciergeRecommendation || opt.notes,
    negotiationStatus: opt.negotiationStatus,
    proposedPrice: opt.proposedPrice,
    counterPrice: opt.counterPrice,
    negotiationNote: opt.negotiationNote,
    counterNote: opt.counterNote,
  };
}

// ── Brand-side Write Functions ───────────────────────────────────────

/**
 * Brand adds an option to a UHNI sourcing request
 */
export function writeBrandOptionToUhni(sourcingId: string, option: SourcingOption) {
  const enrichments = getLocalEnrichment();
  if (!enrichments[sourcingId]) {
    enrichments[sourcingId] = {
      conciergeAssigned: 'Isabella Martinez',
      timeline_dates: {},
      options: [],
      messages: [],
    };
  }
  enrichments[sourcingId].options.push(mapBrandOptionToItem(option));

  // Also add a system message
  enrichments[sourcingId].messages.push({
    id: `msg-${Date.now()}`,
    sender: 'system',
    senderName: 'System',
    content: `Brand submitted a new option: ${option.title || option.customDescription || 'New option'} — €${option.price.toLocaleString()}`,
    timestamp: new Date().toISOString(),
  });

  saveLocalEnrichment(enrichments);

  // Update request status to options_found if still pending/sourcing
  const requests = getLocalRequests();
  const req = requests.find(r => r.sourcing_id === sourcingId);
  if (req && (req.status === 'pending' || req.status === 'sourcing')) {
    req.status = 'options_found';
    req.updated_at = new Date().toISOString();
    saveLocalRequests(requests);
  }

  notifySourcingListeners();
}

/**
 * Brand responds to a client's price negotiation
 */
export function writeBrandNegotiationResponse(
  sourcingId: string,
  optionId: string,
  action: 'accept' | 'counter' | 'decline',
  counterPrice?: number,
  counterNote?: string,
) {
  const enrichments = getLocalEnrichment();
  const enrichment = enrichments[sourcingId];
  if (!enrichment) return;

  const option = enrichment.options.find(o => o.id === optionId);
  if (!option) return;

  if (action === 'accept') {
    option.negotiationStatus = 'accepted';
    enrichment.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'system',
      senderName: 'System',
      content: `Brand accepted the proposed price of €${(option.proposedPrice || option.price).toLocaleString()} for "${option.title}"`,
      timestamp: new Date().toISOString(),
    });
  } else if (action === 'counter') {
    option.negotiationStatus = 'counter_offered';
    option.counterPrice = counterPrice;
    option.counterNote = counterNote;
    enrichment.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'system',
      senderName: 'System',
      content: `Brand counter-offered €${(counterPrice || 0).toLocaleString()} for "${option.title}"`,
      timestamp: new Date().toISOString(),
    });
  } else if (action === 'decline') {
    option.negotiationStatus = 'declined';
    enrichment.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'system',
      senderName: 'System',
      content: `Brand declined the negotiation for "${option.title}"`,
      timestamp: new Date().toISOString(),
    });
  }

  saveLocalEnrichment(enrichments);
  notifySourcingListeners();
}

/**
 * Brand sends a message on a UHNI sourcing request
 */
export function writeBrandMessage(sourcingId: string, content: string) {
  const enrichments = getLocalEnrichment();
  if (!enrichments[sourcingId]) {
    enrichments[sourcingId] = {
      conciergeAssigned: 'Isabella Martinez',
      timeline_dates: {},
      options: [],
      messages: [],
    };
  }
  enrichments[sourcingId].messages.push({
    id: `msg-${Date.now()}`,
    sender: 'concierge', // brand messages show as concierge on UHNI side
    senderName: 'Brand Sourcing Team',
    content,
    timestamp: new Date().toISOString(),
  });
  saveLocalEnrichment(enrichments);
  notifySourcingListeners();
}

/**
 * Brand updates the status of a UHNI sourcing request
 */
export function writeBrandStatusUpdate(sourcingId: string, newStatus: string) {
  const requests = getLocalRequests();
  const req = requests.find(r => r.sourcing_id === sourcingId);
  if (req) {
    req.status = newStatus;
    req.updated_at = new Date().toISOString();
    saveLocalRequests(requests);
  }

  // Also update timeline dates in enrichment
  const enrichments = getLocalEnrichment();
  if (enrichments[sourcingId]) {
    if (!enrichments[sourcingId].timeline_dates) enrichments[sourcingId].timeline_dates = {};
    enrichments[sourcingId].timeline_dates![newStatus] = new Date().toISOString();
    saveLocalEnrichment(enrichments);
  }

  notifySourcingListeners();
}
