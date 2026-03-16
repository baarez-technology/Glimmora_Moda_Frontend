// Shared in-memory store for cross-context data
// In production this would be replaced by API calls

import type { UHNIPriceOffer } from '@/types/uhni';

type Listener = (offers: UHNIPriceOffer[]) => void;
const listeners: Listener[] = [];

// ────────────────────────────────────────────────────────────
// 9 offers covering every state and type the backend needs:
//
// OFFER TYPES:  product, collection, brand
// DISCOUNT TYPES:  percentage, fixed
// STATES:  active, claimed, expiring-soon, nearly-full, private, upcoming, expired
//
// FLOW: Brand creates offer → UHNI client sees it → claims → offer wallet
//       Brand tracks claims, can set limits, private targeting, conditions
// ────────────────────────────────────────────────────────────

let sharedOffers: UHNIPriceOffer[] = [

  // ── 1. PRODUCT — active, unclaimed, percentage discount ───────────
  {
    id: 'offer-001',
    type: 'product',
    targetId: 'dior-lady-dior-small',
    targetName: 'Lady Dior Small — Cannage Lambskin',
    targetImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    productSlug: 'dior-lady-dior-small',
    brandName: 'Dior',
    discountType: 'percentage',
    discountValue: 15,
    originalPrice: 4900,
    validFrom: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['UHNI clients only', 'One per client', 'Not combinable with other offers'],
    isPrivate: false,
    claimedCount: 3,
    maxClaims: 20,
    claimed: false,
  },

  // ── 2. COLLECTION — active, unclaimed, fixed discount ─────────────
  {
    id: 'offer-002',
    type: 'collection',
    targetId: 'dior-spring-2026',
    targetName: 'Dior Spring 2026 Preview',
    targetImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    brandName: 'Dior',
    discountType: 'fixed',
    discountValue: 500,
    originalPrice: 0,
    validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Valid on first purchase from collection', 'Minimum spend €2,000', 'Cannot combine with other offers'],
    isPrivate: false,
    claimedCount: 8,
    maxClaims: 50,
    claimed: false,
  },

  // ── 3. BRAND-WIDE — active, unclaimed, percentage ─────────────────
  {
    id: 'offer-003',
    type: 'brand',
    targetId: 'gucci',
    targetName: 'Gucci',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    brandName: 'Gucci',
    discountType: 'percentage',
    discountValue: 10,
    originalPrice: 0,
    validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Valid on full-price items only', 'Minimum purchase €1,500', 'Loyalty tier reward — recurring quarterly'],
    isPrivate: false,
    claimedCount: 12,
    maxClaims: 0, // unlimited
    claimed: false,
  },

  // ── 4. PRODUCT — already claimed by client ────────────────────────
  {
    id: 'offer-004',
    type: 'product',
    targetId: 'bottega-cassette',
    targetName: 'Cassette Bag — Padded Intrecciato',
    targetImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    productSlug: 'bottega-cassette',
    brandName: 'Bottega Veneta',
    discountType: 'percentage',
    discountValue: 12,
    originalPrice: 3800,
    validFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['One per client', 'Includes complimentary dust bag'],
    isPrivate: false,
    claimedCount: 7,
    maxClaims: 15,
    claimed: true,
    claimedBy: ['uhni-user'],
  },

  // ── 5. PRIVATE — targeted to specific UHNI clients only ───────────
  {
    id: 'offer-005',
    type: 'product',
    targetId: 'hermes-silk-scarf',
    targetName: 'Hermès Carré 90 — Grand Manège',
    targetImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    productSlug: 'hermes-silk-scarf',
    brandName: 'Hermès',
    discountType: 'fixed',
    discountValue: 100,
    originalPrice: 450,
    validFrom: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Private invitation — you were selected based on purchase history', 'One per client', 'Cannot be transferred'],
    isPrivate: true,
    targetClientIds: ['uhni-user'],
    claimedCount: 0,
    maxClaims: 1,
    claimed: false,
  },

  // ── 6. EXPIRING SOON — less than 2 days remaining ─────────────────
  {
    id: 'offer-006',
    type: 'brand',
    targetId: 'dior',
    targetName: 'Dior',
    targetImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    brandName: 'Dior',
    discountType: 'fixed',
    discountValue: 300,
    originalPrice: 0,
    validFrom: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Spring Weekend Special', 'Minimum purchase €2,500', 'Complimentary gift wrapping included'],
    isPrivate: false,
    claimedCount: 18,
    maxClaims: 25,
    claimed: false,
  },

  // ── 7. NEARLY FULL — only 1 claim remaining ──────────────────────
  {
    id: 'offer-007',
    type: 'product',
    targetId: 'gucci-jackie-1961',
    targetName: 'Jackie 1961 Medium Shoulder Bag',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    productSlug: 'gucci-jackie-1961',
    brandName: 'Gucci',
    discountType: 'percentage',
    discountValue: 20,
    originalPrice: 3200,
    validFrom: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Flash offer — limited availability', 'One per client', 'While stock lasts'],
    isPrivate: false,
    claimedCount: 4,
    maxClaims: 5,
    claimed: false,
  },

  // ── 8. UPCOMING — starts in 4 days (brand can see, client cannot yet) ──
  {
    id: 'offer-008',
    type: 'collection',
    targetId: 'bottega-summer-2026',
    targetName: 'Bottega Veneta Summer 2026',
    targetImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    brandName: 'Bottega Veneta',
    discountType: 'percentage',
    discountValue: 8,
    originalPrice: 0,
    validFrom: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 34 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Early access preview for UHNI clients', 'Minimum purchase €3,000'],
    isPrivate: false,
    claimedCount: 0,
    maxClaims: 30,
    claimed: false,
  },

  // ── 9. EXPIRED — ended yesterday (brand can see in history) ───────
  {
    id: 'offer-009',
    type: 'brand',
    targetId: 'hermes',
    targetName: 'Hermès',
    targetImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    brandName: 'Hermès',
    discountType: 'percentage',
    discountValue: 5,
    originalPrice: 0,
    validFrom: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Winter appreciation offer', 'Full-price items only'],
    isPrivate: false,
    claimedCount: 22,
    maxClaims: 0,
    claimed: false,
  },
];

export function getSharedOffers(): UHNIPriceOffer[] {
  return sharedOffers;
}

export function addSharedOffer(offer: UHNIPriceOffer): void {
  sharedOffers = [offer, ...sharedOffers];
  listeners.forEach(fn => fn(sharedOffers));
}

export function updateSharedOfferClaimCount(offerId: string): void {
  sharedOffers = sharedOffers.map(o =>
    o.id === offerId
      ? { ...o, claimedCount: (o.claimedCount || 0) + 1 }
      : o
  );
  listeners.forEach(fn => fn(sharedOffers));
}

export function subscribeToOffers(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const index = listeners.indexOf(fn);
    if (index > -1) listeners.splice(index, 1);
  };
}
