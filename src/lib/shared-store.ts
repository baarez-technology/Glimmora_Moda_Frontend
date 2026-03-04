// Shared in-memory store for cross-context data
// In production this would be replaced by API calls

import type { UHNIPriceOffer } from '@/types/uhni';

type Listener = (offers: UHNIPriceOffer[]) => void;
const listeners: Listener[] = [];
let sharedOffers: UHNIPriceOffer[] = [
  {
    id: 'offer-demo-1',
    type: 'product',
    targetId: 'product-demo-1',
    targetName: 'Silk Evening Gown',
    targetImage: '',
    productSlug: 'silk-evening-gown',
    brandName: 'Maison Lumière',
    discountType: 'percentage',
    discountValue: 15,
    originalPrice: 8500,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['UHNI clients only', 'One per client'],
    isPrivate: false,
    claimedCount: 2,
    maxClaims: 10,
    claimed: false,
  },
  {
    id: 'offer-demo-2',
    type: 'brand',
    targetId: 'brand-demo-1',
    targetName: 'Atelier Voss',
    targetImage: '',
    brandName: 'Atelier Voss',
    discountType: 'percentage',
    discountValue: 10,
    originalPrice: 0,
    validFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['UHNI clients only', 'Applies to full-price items'],
    isPrivate: false,
    claimedCount: 5,
    maxClaims: 0,
    claimed: false,
  },
  {
    id: 'offer-demo-3',
    type: 'collection',
    targetId: 'collection-demo-1',
    targetName: 'Automne 2026 Collection',
    targetImage: '',
    brandName: 'Haus Berlin',
    discountType: 'fixed',
    discountValue: 500,
    originalPrice: 0,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    conditions: ['Invitation only', 'Minimum purchase €3000'],
    isPrivate: true,
    targetClientIds: ['uhni-user'],
    claimedCount: 0,
    maxClaims: 5,
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
