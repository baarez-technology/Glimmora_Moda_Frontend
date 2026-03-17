/**
 * Sourcing Service — Consumer sourcing requests API
 * Routes via Next.js rewrite: /api/v1/* → NEXT_PUBLIC_API_URL/api/v1/*
 *
 * When the API is unavailable, falls back to rich mock data showing the
 * full sourcing lifecycle (pending → sourcing → options_found → awaiting_approval → acquired → delivered).
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-user-token');
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── API Types ─────────────────────────────────────────────────────────

export interface ApiSourcingRequest {
  sourcing_id: string;
  consumer_id: string;
  looking_for: string;
  product_category: string;
  description: string;
  budget: string;
  priority: string;
  deadline: string;
  specifications: string;
  status: string;
  created_at: string;
  updated_at: string;
  brand_ids?: string[];
  brand_names?: string[];
}

export interface CreateSourcingRequestPayload {
  looking_for: string;
  product_category: string;
  description: string;
  budget: string;
  priority: string;
  deadline: string;
  specifications: string;
  brand_ids?: string[];
}

// ── Enrichment Types (for detail view) ────────────────────────────────

export interface SourcingTimelineStep {
  status: string;
  label: string;
  date?: string;
  completed: boolean;
  active: boolean;
}

export type NegotiationStatus = 'none' | 'negotiating' | 'counter_offered' | 'accepted' | 'declined';

export interface SourcingOptionItem {
  id: string;
  title: string;
  brandName?: string;
  source: string;
  sourceLocation: string;
  condition: 'new' | 'like_new' | 'excellent' | 'good';
  price: number;
  originalPrice?: number;
  currency: string;
  estimatedDelivery: string;
  conciergeNote?: string;
  selected?: boolean;
  negotiationStatus?: NegotiationStatus;
  proposedPrice?: number;
  counterPrice?: number;
  negotiationNote?: string;
  counterNote?: string;
}

export interface SourcingChatMessage {
  id: string;
  sender: 'client' | 'concierge' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface EnrichedSourcingRequest extends ApiSourcingRequest {
  timeline: SourcingTimelineStep[];
  options: SourcingOptionItem[];
  messages: SourcingChatMessage[];
  conciergeAssigned?: string;
}

// ── Status flow for timeline ──────────────────────────────────────────

const STATUS_FLOW: { status: string; label: string }[] = [
  { status: 'pending', label: 'Request Submitted' },
  { status: 'sourcing', label: 'Sourcing in Progress' },
  { status: 'options_found', label: 'Options Found' },
  { status: 'awaiting_approval', label: 'Awaiting Approval' },
  { status: 'acquired', label: 'Acquired' },
  { status: 'delivered', label: 'Delivered' },
];

function buildTimeline(
  currentStatus: string,
  dates?: Record<string, string>,
): SourcingTimelineStep[] {
  const currentIdx = STATUS_FLOW.findIndex(s => s.status === currentStatus);
  return STATUS_FLOW.map((step, i) => ({
    status: step.status,
    label: step.label,
    date: dates?.[step.status],
    completed: i < currentIdx,
    active: i === currentIdx,
  }));
}

// ── Mock Data ─────────────────────────────────────────────────────────

const MOCK_REQUESTS: ApiSourcingRequest[] = [
  {
    sourcing_id: 'SR-001',
    consumer_id: 'uhni-user',
    looking_for: 'Hermès Birkin 25 in Gold Togo',
    product_category: 'Handbags',
    description:
      'Looking for a Birkin 25 in Gold Togo leather with gold hardware. Prefer new or like-new condition from a verified source.',
    budget: '25000',
    priority: 'urgent',
    deadline: '2026-02-15',
    specifications: 'Gold Togo leather, Gold hardware (GHW), Size 25, Stamp U or later',
    status: 'delivered',
    created_at: '2025-12-10T10:00:00Z',
    updated_at: '2026-02-28T14:00:00Z',
    brand_ids: ['hermes'],
    brand_names: ['Hermès'],
  },
  {
    sourcing_id: 'SR-002',
    consumer_id: 'uhni-user',
    looking_for: 'Vintage Chanel Tweed Jacket (1990s)',
    product_category: 'Ready-to-Wear',
    description:
      'Seeking an authentic vintage Chanel tweed jacket from the Karl Lagerfeld era (1990-1999). Size 38 FR, preferably in classic pink/black tweed.',
    budget: '8500',
    priority: 'standard',
    deadline: '2026-04-30',
    specifications:
      'Size 38 FR, 1990s era, Pink or Black tweed, Gold buttons, Good to Excellent condition',
    status: 'acquired',
    created_at: '2026-01-28T09:00:00Z',
    updated_at: '2026-03-05T16:00:00Z',
    brand_ids: ['dior', 'gucci'],
    brand_names: ['Dior', 'Gucci'],
  },
  {
    sourcing_id: 'SR-003',
    consumer_id: 'uhni-user',
    looking_for: 'Patek Philippe Nautilus 5711/1A',
    product_category: 'Watches',
    description:
      'The iconic Patek Philippe Nautilus Ref. 5711/1A-010 with blue dial. Discontinued and extremely sought after. Open to pre-owned in excellent condition.',
    budget: '185000',
    priority: 'urgent',
    deadline: '2026-06-01',
    specifications:
      'Ref. 5711/1A-010, Blue dial, Stainless steel, Full set (box + papers), Post-2019 production',
    status: 'options_found',
    created_at: '2026-02-12T11:00:00Z',
    updated_at: '2026-03-08T09:30:00Z',
    brand_ids: ['hermes'],
    brand_names: ['Hermès'],
  },
  {
    sourcing_id: 'SR-004',
    consumer_id: 'uhni-user',
    looking_for: 'Monaco Grand Prix Weekend Wardrobe',
    product_category: 'Complete Looks',
    description:
      'Need complete designer looks for Monaco GP weekend — yacht party Friday, race day Saturday, gala dinner Sunday. European luxury brands preferred.',
    budget: '55000',
    priority: 'standard',
    deadline: '2026-05-15',
    specifications:
      'Three complete outfits, shoes & accessories. Yacht party (smart casual), Race day (sophisticated casual), Gala (black tie)',
    status: 'sourcing',
    created_at: '2026-02-25T14:00:00Z',
    updated_at: '2026-03-10T11:00:00Z',
    brand_ids: ['dior', 'bottega-veneta', 'hermes'],
    brand_names: ['Dior', 'Bottega Veneta', 'Hermès'],
  },
  {
    sourcing_id: 'SR-005',
    consumer_id: 'uhni-user',
    looking_for: 'Louis Vuitton Malle Courrier 110',
    product_category: 'Trunks & Travel',
    description:
      'Seeking the iconic Louis Vuitton Malle Courrier 110 trunk. Interested in either a vintage piece in excellent condition or commissioning a new bespoke piece.',
    budget: '42000',
    priority: 'when_available',
    deadline: '2026-09-01',
    specifications:
      'Monogram canvas, Lozine trim, Brass hardware, 110cm, Interior in good condition',
    status: 'awaiting_approval',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-03-06T10:00:00Z',
    brand_ids: ['louis-vuitton'],
    brand_names: ['Louis Vuitton'],
  },
  {
    sourcing_id: 'SR-006',
    consumer_id: 'uhni-user',
    looking_for: 'Cartier Santos de Cartier Skeleton',
    product_category: 'Watches',
    description:
      'Looking for the Cartier Santos de Cartier Skeleton in rose gold (WSSA0064). New or pre-owned with box and papers.',
    budget: '72000',
    priority: 'standard',
    deadline: '',
    specifications:
      'Ref. WSSA0064, Rose gold, Skeleton dial, Large model, Full set preferred',
    status: 'pending',
    created_at: '2026-03-11T15:00:00Z',
    updated_at: '2026-03-11T15:00:00Z',
    brand_ids: ['hermes', 'dior'],
    brand_names: ['Hermès', 'Dior'],
  },
  {
    sourcing_id: 'SR-007',
    consumer_id: 'uhni-user',
    looking_for: 'Van Cleef & Arpels Alhambra Necklace',
    product_category: 'Jewelry',
    description:
      'Vintage Alhambra long necklace, 20 motifs, yellow gold with mother-of-pearl. New from boutique preferred.',
    budget: '32000',
    priority: 'standard',
    deadline: '2026-05-01',
    specifications:
      'Vintage Alhambra, 20 motifs, Yellow gold, Mother-of-pearl, New with box & papers',
    status: 'options_found',
    created_at: '2026-02-20T09:00:00Z',
    updated_at: '2026-03-10T14:00:00Z',
    brand_ids: ['hermes', 'bottega-veneta'],
    brand_names: ['Hermès', 'Bottega Veneta'],
  },
  {
    sourcing_id: 'SR-008',
    consumer_id: 'uhni-user',
    looking_for: 'Loro Piana Cashmere Overcoat',
    product_category: 'Ready-to-Wear',
    description:
      'Seeking a Loro Piana baby cashmere overcoat in camel. Was available last season but sold out before I could purchase.',
    budget: '15000',
    priority: 'standard',
    deadline: '2026-04-15',
    specifications: 'Baby cashmere, Camel colour, Size 50 IT, Double-breasted preferred',
    status: 'cancelled',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-02-15T09:00:00Z',
    brand_ids: ['bottega-veneta'],
    brand_names: ['Bottega Veneta'],
  },
];

// ── Mock enrichment keyed by sourcing_id ──────────────────────────────

interface MockEnrichment {
  timeline_dates: Record<string, string>;
  options: SourcingOptionItem[];
  messages: SourcingChatMessage[];
  conciergeAssigned: string;
}

const MOCK_ENRICHMENT: Record<string, MockEnrichment> = {
  'SR-001': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2025-12-10',
      sourcing: '2025-12-12',
      options_found: '2026-01-08',
      awaiting_approval: '2026-01-10',
      acquired: '2026-02-02',
      delivered: '2026-02-28',
    },
    options: [
      {
        id: 'opt-001-a',
        title: 'Birkin 25 Gold Togo GHW — Boutique Allocation',
        brandName: 'Hermès',
        source: 'Hermès Faubourg Saint-Honoré',
        sourceLocation: 'Paris, France',
        condition: 'new',
        price: 21500,
        currency: 'EUR',
        estimatedDelivery: '4-6 weeks',
        conciergeNote:
          'Direct boutique allocation secured through our Paris network. Full warranty and boutique packaging.',
        selected: true,
      },
      {
        id: 'opt-001-b',
        title: 'Birkin 25 Gold Togo GHW — Pre-owned',
        brandName: 'Hermès',
        source: 'Verified Reseller — Rebag',
        sourceLocation: 'New York, USA',
        condition: 'like_new',
        price: 18900,
        originalPrice: 21500,
        currency: 'EUR',
        estimatedDelivery: '5-7 business days',
        conciergeNote:
          'Authenticated by Rebag. Original owner, used twice. Includes all packaging and receipt.',
      },
    ],
    messages: [
      {
        id: 'm001-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Hermès Birkin 25 in Gold Togo.',
        timestamp: '2025-12-10T10:00:00Z',
      },
      {
        id: 'm001-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Good morning! I've received your request for the Birkin 25. I'll be reaching out to our Hermès boutique contacts in Paris, London, and Tokyo. Given the high demand, I recommend we also consider pre-owned options as a parallel track.",
        timestamp: '2025-12-10T14:30:00Z',
      },
      {
        id: 'm001-3',
        sender: 'client',
        senderName: 'You',
        content:
          "Thank you, Isabella. I'd prefer new if possible, but open to pre-owned if the condition is excellent.",
        timestamp: '2025-12-10T16:00:00Z',
      },
      {
        id: 'm001-4',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Understood. I've activated our search across 12 boutiques and 3 trusted resellers. I'll keep you updated on progress.",
        timestamp: '2025-12-12T09:00:00Z',
      },
      {
        id: 'm001-5',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Great news! I've found two excellent options for you. One is a direct boutique allocation from Hermès Paris (brand new), and the other is a near-mint pre-owned piece from Rebag in New York. I've added both to your options — please review when convenient.",
        timestamp: '2026-01-08T11:00:00Z',
      },
      {
        id: 'm001-6',
        sender: 'client',
        senderName: 'You',
        content: "The boutique allocation looks perfect. Let's go with that one.",
        timestamp: '2026-01-10T08:30:00Z',
      },
      {
        id: 'm001-7',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Excellent choice! I've confirmed the allocation with the Paris boutique. The piece will be prepared and shipped with white-glove delivery. Expected delivery within 4-6 weeks.",
        timestamp: '2026-01-10T10:00:00Z',
      },
      {
        id: 'm001-8',
        sender: 'system',
        senderName: 'System',
        content: 'Item acquired — preparing for delivery.',
        timestamp: '2026-02-02T14:00:00Z',
      },
      {
        id: 'm001-9',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          'Your Birkin 25 has arrived and passed our quality inspection. It will be delivered tomorrow between 10:00-12:00 with our white-glove service.',
        timestamp: '2026-02-27T16:00:00Z',
      },
      {
        id: 'm001-10',
        sender: 'system',
        senderName: 'System',
        content: 'Item delivered successfully. Request completed.',
        timestamp: '2026-02-28T11:00:00Z',
      },
    ],
  },
  'SR-002': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-01-28',
      sourcing: '2026-01-30',
      options_found: '2026-02-18',
      awaiting_approval: '2026-02-20',
      acquired: '2026-03-05',
    },
    options: [
      {
        id: 'opt-002-a',
        title: 'Chanel Tweed Jacket FW 1995 — Pink/Black',
        brandName: 'Dior',
        source: 'Les Merveilles de Babellou',
        sourceLocation: 'Paris, France',
        condition: 'excellent',
        price: 7200,
        currency: 'EUR',
        estimatedDelivery: '3-5 business days',
        conciergeNote:
          'Authenticated Chanel piece from FW95. Size 38, pink and black tweed with gold CC buttons. Minor wear consistent with age. Comes with Chanel hanger.',
        selected: true,
      },
      {
        id: 'opt-002-b',
        title: 'Chanel Tweed Jacket SS 1997 — Classic Black',
        brandName: 'Gucci',
        source: 'Vestiaire Collective',
        sourceLocation: 'London, UK',
        condition: 'good',
        price: 5800,
        currency: 'EUR',
        estimatedDelivery: '7-10 business days',
        conciergeNote:
          'SS97 collection. Classic black tweed with silver buttons. Size 38. Good condition, some slight fading on shoulders.',
      },
    ],
    messages: [
      {
        id: 'm002-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Vintage Chanel Tweed Jacket.',
        timestamp: '2026-01-28T09:00:00Z',
      },
      {
        id: 'm002-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "I love this request! Vintage Chanel tweed from the 90s Lagerfeld era is truly special. I'm reaching out to our vintage specialists in Paris, London, and Milan.",
        timestamp: '2026-01-28T14:00:00Z',
      },
      {
        id: 'm002-3',
        sender: 'client',
        senderName: 'You',
        content:
          "I saw a pink/black one at an auction recently that sold for \u20AC9,000. Hoping we can find something more reasonable.",
        timestamp: '2026-01-29T11:00:00Z',
      },
      {
        id: 'm002-4',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Absolutely. The auction market is inflated right now. Our dealer network typically has better pricing. I've found two strong candidates — adding them to your options now.",
        timestamp: '2026-02-18T10:00:00Z',
      },
      {
        id: 'm002-5',
        sender: 'client',
        senderName: 'You',
        content: "The FW95 pink/black one is gorgeous. Let's secure it.",
        timestamp: '2026-02-20T09:00:00Z',
      },
      {
        id: 'm002-6',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Done! The piece has been purchased and is being professionally cleaned and pressed before shipment. You'll receive it within the week with a certificate of authenticity.",
        timestamp: '2026-03-05T16:00:00Z',
      },
    ],
  },
  'SR-003': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-02-12',
      sourcing: '2026-02-14',
      options_found: '2026-03-08',
    },
    options: [
      {
        id: 'opt-003-a',
        title: 'Nautilus 5711/1A-010 — Full Set 2021',
        brandName: 'Hermès',
        source: 'Watchfinder & Co.',
        sourceLocation: 'London, UK',
        condition: 'like_new',
        price: 178000,
        currency: 'EUR',
        estimatedDelivery: '3-5 business days (insured)',
        conciergeNote:
          'Full set with box, papers, and original receipt dated Sept 2021. Excellent condition — worn sparingly. Our top recommendation.',
        negotiationStatus: 'negotiating',
        proposedPrice: 165000,
        negotiationNote: 'Would you consider €165K for the 2021 full set? I believe this is a fair price given the current market for 5711s.',
      },
      {
        id: 'opt-003-b',
        title: 'Nautilus 5711/1A-010 — Full Set 2020',
        brandName: 'Hermès',
        source: 'Collector Network',
        sourceLocation: 'Geneva, Switzerland',
        condition: 'excellent',
        price: 170000,
        currency: 'EUR',
        estimatedDelivery: '5-7 business days (insured)',
        conciergeNote:
          'From a private collector in Geneva. 2020 production, full set. Slight bracelet stretch typical of regular wear. Serviced by Patek in 2024.',
        negotiationStatus: 'counter_offered',
        proposedPrice: 155000,
        counterPrice: 163000,
        negotiationNote: 'Interested at €155K — the bracelet stretch is a consideration.',
        counterNote: 'We can offer €163K which reflects the recent Patek service and full set provenance. This is our best price for this piece.',
      },
      {
        id: 'opt-003-c',
        title: 'Nautilus 5711/1A-010 — Watch Only 2019',
        brandName: 'Hermès',
        source: 'Hodinkee',
        sourceLocation: 'New York, USA',
        condition: 'excellent',
        price: 155000,
        currency: 'EUR',
        estimatedDelivery: '7-10 business days (insured)',
        conciergeNote:
          "Watch only (no box/papers), but authenticated by Hodinkee with their own guarantee. Best value option if papers aren't essential.",
      },
    ],
    messages: [
      {
        id: 'm003-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Patek Philippe Nautilus 5711/1A.',
        timestamp: '2026-02-12T11:00:00Z',
      },
      {
        id: 'm003-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "The Nautilus 5711 — one of the most coveted watches in the world. Since Patek discontinued this reference, prices have stabilized somewhat but it remains incredibly sought after. I'm tapping into our watch specialist network immediately.",
        timestamp: '2026-02-12T15:00:00Z',
      },
      {
        id: 'm003-3',
        sender: 'client',
        senderName: 'You',
        content: "I'd prefer a full set if possible. The provenance matters to me.",
        timestamp: '2026-02-13T09:00:00Z',
      },
      {
        id: 'm003-4',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Completely understand. Full set Nautilus pieces command a premium but are worth it for both enjoyment and investment value. I'm focusing our search on complete sets.",
        timestamp: '2026-02-14T10:00:00Z',
      },
      {
        id: 'm003-5',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "I've sourced three options ranging from \u20AC155K to \u20AC178K. The London piece is our top recommendation — 2021 production, pristine condition, full set. Please review the options at your convenience.",
        timestamp: '2026-03-08T09:30:00Z',
      },
    ],
  },
  'SR-004': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-02-25',
      sourcing: '2026-02-28',
    },
    options: [],
    messages: [
      {
        id: 'm004-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Monaco Grand Prix Weekend Wardrobe.',
        timestamp: '2026-02-25T14:00:00Z',
      },
      {
        id: 'm004-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "What an exciting request! I'm already curating looks for the three events. A few questions: Do you have color preferences? Any brands to avoid? Will you need accessories (watches, cufflinks, sunglasses)?",
        timestamp: '2026-02-25T17:00:00Z',
      },
      {
        id: 'm004-3',
        sender: 'client',
        senderName: 'You',
        content:
          'I tend to prefer neutral tones — navy, cream, dove grey. For the yacht party something relaxed but elegant. The gala should be standout. Accessories would be great too. No Gucci please.',
        timestamp: '2026-02-26T10:00:00Z',
      },
      {
        id: 'm004-4',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Perfect. Here's my initial direction:\n\nYacht Party: Loro Piana linen set in cream + Brunello Cucinelli cashmere knit\nRace Day: Zegna summer suit in navy + Berluti driving shoes\nGala: Dior Homme tuxedo + Tom Ford accessories\n\nI'll start pulling specific pieces and will have options ready within 2 weeks.",
        timestamp: '2026-02-28T11:00:00Z',
      },
      {
        id: 'm004-5',
        sender: 'client',
        senderName: 'You',
        content:
          'Love the direction! The Loro Piana for the yacht and Dior for gala sounds spot on.',
        timestamp: '2026-02-28T14:00:00Z',
      },
      {
        id: 'm004-6',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "I've contacted the Dior boutique on Avenue Montaigne about tuxedo options. Also, Loro Piana has a beautiful new linen collection that just arrived. I'll have a curated selection for you by next week.",
        timestamp: '2026-03-10T11:00:00Z',
      },
    ],
  },
  'SR-005': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-01-15',
      sourcing: '2026-01-18',
      options_found: '2026-02-10',
      awaiting_approval: '2026-03-06',
    },
    options: [
      {
        id: 'opt-005-a',
        title: 'Malle Courrier 110 — Vintage 1930s, Restored',
        brandName: 'Louis Vuitton',
        source: 'Malle Mania',
        sourceLocation: 'Paris, France',
        condition: 'excellent',
        price: 38500,
        currency: 'EUR',
        estimatedDelivery: '7-14 business days',
        conciergeNote:
          'A stunning 1930s Malle Courrier professionally restored by the Louis Vuitton heritage workshop. Monogram canvas in excellent condition, brass hardware re-polished, interior fully reconditioned.',
        selected: true,
        negotiationStatus: 'accepted',
        proposedPrice: 35000,
        negotiationNote: 'Would you consider €35K for the vintage piece?',
        counterNote: 'We accept €35,000 — a wonderful choice. This piece has extraordinary provenance.',
      },
      {
        id: 'opt-005-b',
        title: 'Malle Courrier 110 — Bespoke Commission',
        brandName: 'Louis Vuitton',
        source: 'Louis Vuitton Special Orders',
        sourceLocation: 'Asnières-sur-Seine, France',
        condition: 'new',
        price: 52000,
        currency: 'EUR',
        estimatedDelivery: '16-20 weeks',
        conciergeNote:
          'Commission a brand new piece from the LV Asnières workshop. Full customization including monogram hot-stamping, custom interior, and choice of hardware finish.',
      },
    ],
    messages: [
      {
        id: 'm005-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Louis Vuitton Malle Courrier 110.',
        timestamp: '2026-01-15T08:00:00Z',
      },
      {
        id: 'm005-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "The Malle Courrier is a magnificent piece. I'm exploring both vintage and bespoke commission routes. The vintage market for LV trunks is quite active — I'll see what's available.",
        timestamp: '2026-01-15T14:00:00Z',
      },
      {
        id: 'm005-3',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          'Two options ready for your review: a beautifully restored 1930s piece and the option to commission something entirely new from the Asnières workshop. The vintage piece has incredible patina and history.',
        timestamp: '2026-02-10T10:00:00Z',
      },
      {
        id: 'm005-4',
        sender: 'client',
        senderName: 'You',
        content:
          "The vintage restored piece is spectacular. The history behind it is exactly what I'm looking for. Let's proceed with that one.",
        timestamp: '2026-03-06T10:00:00Z',
      },
      {
        id: 'm005-5',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Wonderful choice! I've contacted Malle Mania to reserve it. They're preparing the final authentication documents and provenance certificate. I'll confirm the purchase once everything checks out.",
        timestamp: '2026-03-06T14:00:00Z',
      },
    ],
  },
  'SR-006': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-03-11',
    },
    options: [],
    messages: [
      {
        id: 'm006-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Cartier Santos de Cartier Skeleton.',
        timestamp: '2026-03-11T15:00:00Z',
      },
      {
        id: 'm006-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Thank you for your request! The Santos Skeleton in rose gold is a beautiful piece. I'll begin reaching out to our Cartier boutique contacts and trusted watch dealers. I'll have an initial update for you within 48 hours.",
        timestamp: '2026-03-11T17:30:00Z',
      },
    ],
  },
  'SR-007': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-02-20',
      sourcing: '2026-02-22',
      options_found: '2026-03-10',
    },
    options: [
      {
        id: 'opt-007-a',
        title: 'Vintage Alhambra 20 Motifs — Boutique Stock',
        brandName: 'Hermès',
        source: 'Van Cleef & Arpels — Place Vendôme',
        sourceLocation: 'Paris, France',
        condition: 'new',
        price: 30800,
        currency: 'EUR',
        estimatedDelivery: '5-7 business days',
        conciergeNote:
          'Current boutique stock, brand new with full packaging. Classic mother-of-pearl on yellow gold.',
        // No negotiation — clean option to select or negotiate
      },
      {
        id: 'opt-007-b',
        title: 'Vintage Alhambra 20 Motifs — Pre-owned Mint',
        brandName: 'Bottega Veneta',
        source: 'Collector Boutique',
        sourceLocation: 'Geneva, Switzerland',
        condition: 'like_new',
        price: 26500,
        currency: 'EUR',
        estimatedDelivery: '3-5 business days',
        conciergeNote:
          'Purchased in 2024, worn once. Complete set with box, papers, and original receipt.',
        // Declined negotiation — client tried too low, brand rejected
        negotiationStatus: 'declined',
        proposedPrice: 20000,
        negotiationNote: 'Could you do €20K? That seems fair for pre-owned.',
        counterNote: 'We cannot accommodate this discount on a near-new piece. The piece is priced competitively already at 14% below retail.',
      },
    ],
    messages: [
      {
        id: 'm007-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Van Cleef & Arpels Alhambra Necklace.',
        timestamp: '2026-02-20T09:00:00Z',
      },
      {
        id: 'm007-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Beautiful choice! The Vintage Alhambra is one of Van Cleef's most iconic pieces. I'll check boutique availability and our pre-owned network.",
        timestamp: '2026-02-20T12:00:00Z',
      },
      {
        id: 'm007-3',
        sender: 'client',
        senderName: 'You',
        content:
          "I'd prefer new from boutique if possible, but happy to consider pre-owned if the price is right.",
        timestamp: '2026-02-21T10:00:00Z',
      },
      {
        id: 'm007-4',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "I've found two options — one new from the Place Vendôme boutique and a near-mint pre-owned from Geneva. The pre-owned piece is a great value at €26,500 vs the €30,800 retail. Please review!",
        timestamp: '2026-03-10T14:00:00Z',
      },
      {
        id: 'm007-5',
        sender: 'system',
        senderName: 'System',
        content: 'Price negotiation for "Vintage Alhambra 20 Motifs — Pre-owned Mint" was declined by the brand.',
        timestamp: '2026-03-11T09:00:00Z',
      },
      {
        id: 'm007-6',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "The Geneva seller couldn't go lower than €26,500 — it's already well below retail. You still have the boutique option at full retail, or you can select the pre-owned at the listed price. What would you prefer?",
        timestamp: '2026-03-11T10:00:00Z',
      },
    ],
  },
  'SR-008': {
    conciergeAssigned: 'Isabella Martinez',
    timeline_dates: {
      pending: '2026-01-05',
      sourcing: '2026-01-08',
    },
    options: [],
    messages: [
      {
        id: 'm008-1',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request submitted for Loro Piana Cashmere Overcoat.',
        timestamp: '2026-01-05T10:00:00Z',
      },
      {
        id: 'm008-2',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "I'll reach out to Loro Piana directly. The baby cashmere overcoat in camel was indeed a popular piece last season.",
        timestamp: '2026-01-05T14:00:00Z',
      },
      {
        id: 'm008-3',
        sender: 'concierge',
        senderName: 'Isabella Martinez',
        content:
          "Unfortunately, Loro Piana confirms the camel baby cashmere overcoat is completely sold out worldwide with no restock planned. However, they're releasing a very similar piece in their Fall 2026 collection. Would you like me to secure a pre-order?",
        timestamp: '2026-02-10T11:00:00Z',
      },
      {
        id: 'm008-4',
        sender: 'client',
        senderName: 'You',
        content:
          "That's disappointing. I'll wait for the Fall collection then. Please cancel this request for now.",
        timestamp: '2026-02-15T09:00:00Z',
      },
      {
        id: 'm008-5',
        sender: 'system',
        senderName: 'System',
        content: 'Sourcing request cancelled by client.',
        timestamp: '2026-02-15T09:00:00Z',
      },
    ],
  },
};

// ── Enrich a request with timeline, options, messages ──────────────────

export function enrichSourcingRequest(
  req: ApiSourcingRequest,
): EnrichedSourcingRequest {
  const enrichment = MOCK_ENRICHMENT[req.sourcing_id];
  if (!enrichment) {
    return {
      ...req,
      timeline: buildTimeline(req.status),
      options: [],
      messages: [],
    };
  }
  return {
    ...req,
    timeline: buildTimeline(req.status, enrichment.timeline_dates),
    options: enrichment.options,
    messages: enrichment.messages,
    conciergeAssigned: enrichment.conciergeAssigned,
  };
}

// ── localStorage helpers (demo persistence) ─────────────────────────

const LS_CREATED_KEY = 'moda-sourcing-created';
const LS_ENRICHMENT_KEY = 'moda-sourcing-enrichment';

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

function getLocalEnrichment(): Record<string, MockEnrichment> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LS_ENRICHMENT_KEY) || '{}');
  } catch { return {}; }
}

function saveLocalEnrichment(data: Record<string, MockEnrichment>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_ENRICHMENT_KEY, JSON.stringify(data));
}

/** Save the full enriched state of a request (for detail page persistence) */
export function saveSourcingState(req: EnrichedSourcingRequest) {
  // Update the base request in local storage
  const localReqs = getLocalRequests();
  const idx = localReqs.findIndex(r => r.sourcing_id === req.sourcing_id);
  const base: ApiSourcingRequest = {
    sourcing_id: req.sourcing_id,
    consumer_id: req.consumer_id,
    looking_for: req.looking_for,
    product_category: req.product_category,
    description: req.description,
    budget: req.budget,
    priority: req.priority,
    deadline: req.deadline,
    specifications: req.specifications,
    status: req.status,
    created_at: req.created_at,
    updated_at: new Date().toISOString(),
    brand_ids: req.brand_ids,
    brand_names: req.brand_names,
  };
  if (idx >= 0) {
    localReqs[idx] = base;
  } else {
    // Also check if it's a mock request that was modified
    localReqs.push(base);
  }
  saveLocalRequests(localReqs);

  // Save enrichment
  const enrichments = getLocalEnrichment();
  enrichments[req.sourcing_id] = {
    conciergeAssigned: req.conciergeAssigned || 'Isabella Martinez',
    timeline_dates: Object.fromEntries(
      req.timeline.filter(s => s.date).map(s => [s.status, s.date!]),
    ),
    options: req.options,
    messages: req.messages,
  };
  saveLocalEnrichment(enrichments);
}

// ── API Base ──────────────────────────────────────────────────────────

const BASE = '/api/consumer-sourcing';

// ── API Functions ─────────────────────────────────────────────────────

export async function getProductCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/product-categories`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.product_categories as string[];
  } catch {
    return ['Handbags', 'Ready-to-Wear', 'Watches', 'Jewelry', 'Shoes', 'Accessories', 'Trunks & Travel', 'Complete Looks', 'Fine Art', 'Home & Living'];
  }
}

export async function getSourcingRequests(): Promise<ApiSourcingRequest[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load sourcing requests: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function getSourcingRequestById(sourcingId: string): Promise<ApiSourcingRequest | null> {
  try {
    const res = await fetch(`${BASE}/${sourcingId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function selectSourcingOption(sourcingId: string, optionId: string): Promise<void> {
  await fetch(`${BASE}/${sourcingId}/product-options/${optionId}/select`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function sendConsumerMessage(sourcingId: string, message: string): Promise<void> {
  await fetch(`${BASE}/${sourcingId}/messages?message=${encodeURIComponent(message)}`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function addConsumerNegotiation(
  sourcingId: string,
  optionId: string,
  offerPrice: number,
  notes: string,
): Promise<void> {
  await fetch(
    `${BASE}/${sourcingId}/product-options/${optionId}/negotiations?offer_price=${offerPrice}&notes=${encodeURIComponent(notes)}`,
    { method: 'POST', headers: authHeaders() },
  );
}

export async function acceptConsumerNegotiation(
  sourcingId: string,
  optionId: string,
  negotiationsId: string,
): Promise<void> {
  await fetch(
    `${BASE}/${sourcingId}/product-options/${optionId}/negotiations/${negotiationsId}/accept`,
    { method: 'PATCH', headers: authHeaders() },
  );
}

/** Map real API product_options → SourcingOptionItem[] */
function mapApiOptions(apiReq: ApiSourcingRequest): SourcingOptionItem[] {
  const raw = (apiReq as unknown as { product_options?: unknown[] }).product_options;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((opt: unknown) => {
    const o = opt as Record<string, unknown>;
    const negs = Array.isArray(o.negotiations) ? (o.negotiations as Record<string, unknown>[]) : [];
    const realNegs = negs.filter(n => n.negotiations_id);
    const lastNeg = realNegs[realNegs.length - 1];

    let negotiationStatus: NegotiationStatus = 'none';
    let proposedPrice: number | undefined;
    let negotiationNote: string | undefined;

    if (lastNeg) {
      if (lastNeg.is_accepted) {
        negotiationStatus = 'accepted';
        proposedPrice = lastNeg.offer_price as number;
      } else {
        negotiationStatus = 'negotiating';
        proposedPrice = lastNeg.offer_price as number;
        negotiationNote = lastNeg.notes as string | undefined;
      }
    }

    const price = o.price as number;
    const offerPrice = o.offer_price as number;

    return {
      id: o.option_product_id as string,
      title: o.option_title as string,
      brandName: o.source_name as string | undefined,
      source: o.source_name as string,
      sourceLocation: o.source_location as string,
      condition: 'new' as const,
      price,
      originalPrice: offerPrice < price ? price : undefined,
      currency: 'EUR',
      estimatedDelivery: o.estimate_delivery as string,
      conciergeNote: o.notes as string | undefined,
      selected: o.is_customer_selected as boolean,
      negotiationStatus,
      proposedPrice,
      negotiationNote,
      // store the negotiations_id of the last negotiation for accept/decline
      counterPrice: lastNeg && !lastNeg.is_accepted ? lastNeg.offer_price as number : undefined,
      counterNote: lastNeg && !lastNeg.is_accepted ? lastNeg.notes as string | undefined : undefined,
    } as SourcingOptionItem & { _negId?: string };
  });
}

/** Map real API messages → SourcingChatMessage[] */
function mapApiMessages(apiReq: ApiSourcingRequest): SourcingChatMessage[] {
  const raw = (apiReq as unknown as { messages?: unknown[] }).messages;
  if (!Array.isArray(raw)) return [];
  return raw.map((m: unknown, idx: number) => {
    const msg = m as Record<string, unknown>;
    const isClient = msg.type === 'customer';
    return {
      id: `api-msg-${idx}`,
      sender: isClient ? ('client' as const) : ('concierge' as const),
      senderName: isClient ? 'You' : 'Brand',
      content: msg.message as string,
      timestamp: msg.created_at as string,
    };
  });
}

/** Override enrichment: uses real API data when available, otherwise mock */
export function enrichSourcingRequestWithLocal(
  req: ApiSourcingRequest,
): EnrichedSourcingRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiReq: any = req;
  const hasRealData = apiReq.product_options !== undefined || apiReq.timelines !== undefined;

  if (hasRealData) {
    // Build timeline dates from timelines array
    const timelineDates: Record<string, string> = {};
    if (Array.isArray(apiReq.timelines)) {
      for (const t of apiReq.timelines) {
        timelineDates[t.status] = t.updated_at;
      }
    }
    return {
      ...req,
      timeline: buildTimeline(req.status, timelineDates),
      options: mapApiOptions(req),
      messages: mapApiMessages(req),
      conciergeAssigned: undefined,
    };
  }

  // Fall back to local enrichment or mock
  const localEnrichments = getLocalEnrichment();
  const local = localEnrichments[req.sourcing_id];
  if (local) {
    return {
      ...req,
      timeline: buildTimeline(req.status, local.timeline_dates),
      options: local.options,
      messages: local.messages,
      conciergeAssigned: local.conciergeAssigned,
    };
  }
  return enrichSourcingRequest(req);
}

export async function createSourcingRequest(
  payload: CreateSourcingRequestPayload,
): Promise<ApiSourcingRequest> {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch {
    // API unavailable — create locally for demo
    const now = new Date().toISOString();
    const id = `SR-${String(Date.now()).slice(-6)}`;
    const newReq: ApiSourcingRequest = {
      sourcing_id: id,
      consumer_id: 'uhni-user',
      looking_for: payload.looking_for,
      product_category: payload.product_category,
      description: payload.description,
      budget: payload.budget,
      priority: payload.priority,
      deadline: payload.deadline,
      specifications: payload.specifications,
      status: 'pending',
      created_at: now,
      updated_at: now,
      brand_ids: payload.brand_ids,
      brand_names: payload.brand_ids?.map(bid => {
        const nameMap: Record<string, string> = {
          dior: 'Dior', gucci: 'Gucci', hermes: 'Hermès',
          'louis-vuitton': 'Louis Vuitton', 'bottega-veneta': 'Bottega Veneta',
        };
        return nameMap[bid] || bid;
      }),
    };
    // Save to localStorage
    const existing = getLocalRequests();
    existing.unshift(newReq);
    saveLocalRequests(existing);
    // Save initial enrichment with welcome message
    const enrichments = getLocalEnrichment();
    enrichments[id] = {
      conciergeAssigned: 'Isabella Martinez',
      timeline_dates: { pending: now.split('T')[0] },
      options: [],
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          sender: 'system',
          senderName: 'System',
          content: `Sourcing request submitted for ${payload.looking_for}.`,
          timestamp: now,
        },
        {
          id: `msg-${Date.now()}-2`,
          sender: 'concierge',
          senderName: 'Isabella Martinez',
          content: `Thank you for your request! I'll begin reaching out to our brand partners to source "${payload.looking_for}" for you. I'll have an initial update within 48 hours.`,
          timestamp: new Date(Date.now() + 60000).toISOString(),
        },
      ],
    };
    saveLocalEnrichment(enrichments);
    return newReq;
  }
}
