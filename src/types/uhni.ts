/**
 * UHNI (Ultra High Net-worth Individual) Types
 *
 * Personal concierge, autonomous shopping, sourcing requests,
 * bespoke orders, private collections, and UHNI profile types.
 */

import type { Product, ProductCategory } from './product';

// ============================================
// User Tier System
// ============================================

export type UserTier = 'standard' | 'preferred' | 'uhni';

// ============================================
// Personal Concierge
// ============================================

export interface PersonalConcierge {
  id: string;
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone: string;
  availability: 'available' | 'busy' | 'offline';
  specialties: string[];
  languages: string[];
  assignedSince: string;
  bio: string;
}

// ============================================
// Autonomous Shopping Settings (Zero-UI Commerce)
// ============================================

export interface AutonomousShoppingSettings {
  enabled: boolean;
  monthlyBudget: number;
  currentMonthSpend: number;
  autoApproveThreshold: number;
  categories: ProductCategory[];
  excludedBrands: string[];
  preferredBrands: string[];
  requireReviewBefore: 'purchase' | 'shipment' | 'never';
  notificationPreference: 'immediate' | 'daily_digest' | 'weekly';
  invisibleCommerceMode: boolean;
  discreetPackaging: boolean;
}

// ============================================
// Sourcing Request Types
// ============================================

export type SourcingRequestType = 'specific_item' | 'category' | 'occasion' | 'bespoke';
export type SourcingRequestStatus = 'pending' | 'sourcing' | 'options_found' | 'awaiting_approval' | 'acquired' | 'delivered' | 'cancelled';

export interface SourcingNote {
  id: string;
  author: 'concierge' | 'client';
  content: string;
  timestamp: string;
}

export interface SourcingOption {
  id: string;
  product?: Product;
  customDescription?: string;
  source: string;
  condition: 'new' | 'like_new' | 'excellent' | 'good';
  price: number;
  originalPrice?: number;
  provenance?: string;
  availableUntil?: string;
  conciergeRecommendation?: string;
  images: string[];
}

export interface SourcingRequest {
  id: string;
  type: SourcingRequestType;
  status: SourcingRequestStatus;
  title: string;
  description: string;
  referenceImages?: string[];
  budget?: {
    min: number;
    max: number;
    flexible: boolean;
  };
  deadline?: string;
  occasion?: string;
  conciergeNotes: SourcingNote[];
  foundOptions: SourcingOption[];
  selectedOptionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Bespoke Order Types
// ============================================

export type BespokeOrderType = 'made_to_measure' | 'custom_design' | 'modification';
export type BespokeOrderStatus = 'consultation' | 'design_approval' | 'production' | 'fitting' | 'final_adjustments' | 'complete';

export interface BespokeSpecification {
  category: string;
  label: string;
  value: string;
  notes?: string;
}

export interface BespokeTimelineStep {
  id: string;
  stage: BespokeOrderStatus;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  completedAt?: string;
  estimatedDate?: string;
  notes?: string;
}

export interface BespokeOrder {
  id: string;
  brandId: string;
  brandName: string;
  type: BespokeOrderType;
  title: string;
  description: string;
  specifications: BespokeSpecification[];
  measurements?: Record<string, number>;
  status: BespokeOrderStatus;
  timeline: BespokeTimelineStep[];
  estimatedCompletion: string;
  price: number;
  depositPaid: number;
  depositPercentage: number;
  atelierContact?: string;
  progressImages: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Private Collection Types
// ============================================

export type PrivateCollectionAccess = 'invitation' | 'request' | 'uhni_only';

export interface PrivateCollection {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  description: string;
  heroImage: string;
  accessLevel: PrivateCollectionAccess;
  products: Product[];
  previewDate: string;
  releaseDate: string;
  invitationRequired: boolean;
  hasAccess: boolean;
}

// ============================================
// Autonomous Activity Types
// ============================================

export type AutonomousActivityType = 'prepared' | 'auto_purchased' | 'awaiting_approval' | 'shipped' | 'declined';

export interface AutonomousActivity {
  id: string;
  type: AutonomousActivityType;
  product: Product;
  price: number;
  reason: string;
  timestamp: string;
  autoApproveDeadline?: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
}

// ============================================
// UHNI Profile
// ============================================

export interface UHNIProfile {
  userId: string;
  tier: 'uhni';
  memberSince: string;
  concierge: PersonalConcierge;
  autonomousSettings: AutonomousShoppingSettings;
  sourcingRequests: SourcingRequest[];
  bespokeOrders: BespokeOrder[];
  privateCollectionAccess: string[];
  lifetimeValue: number;
  preferences: {
    communicationPreference: 'chat' | 'email' | 'phone' | 'all';
    preferredContactTimes: string[];
    specialRequests: string[];
  };
}

// ============================================
// UHNI Pricing & Negotiation Types
// ============================================

export type NegotiationStatus = 'pending' | 'approved' | 'counter_offered' | 'declined' | 'accepted';

export interface PriceNegotiation {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brandName: string;
  originalPrice: number;
  proposedPrice: number;
  counterOffer?: number;
  status: NegotiationStatus;
  conciergeNotes: string[];
  createdAt: string;
  expiresAt: string;
}

export interface UHNIPriceOffer {
  id: string;
  type: 'product' | 'collection' | 'brand';
  targetId: string;
  targetName: string;
  targetImage?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  claimed: boolean;
  conditions?: string[];
}

export interface UHNIPriceAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brandName: string;
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  createdAt: string;
}

export interface UHNIPricingTier {
  tier: 'standard' | 'preferred' | 'uhni';
  label: string;
  description: string;
  benefits: string[];
  averageDiscount?: number;
}

export interface UHNIPricingSummary {
  lifetimeSavings: number;
  activeNegotiations: number;
  pendingOffers: number;
  priceAlertsSet: number;
}

// ============================================
// Enhanced G-SAIL (Global Sourcing) Types
// ============================================

export type AvailabilitySearchStatus = 'searching' | 'found' | 'secured' | 'unavailable';
export type AvailabilitySearchPriority = 'standard' | 'high' | 'urgent';

export interface UHNIAvailabilitySearch {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brandName: string;
  status: AvailabilitySearchStatus;
  priority: AvailabilitySearchPriority;
  createdAt: string;
  alternatives: EnhancedAlternative[];
  conciergeAssigned: boolean;
}

export interface EnhancedAlternative {
  id: string;
  type: 'geography' | 'equivalent';
  region: string;
  city: string;
  boutiqueName?: string;
  availabilityConfidence: number;
  deliveryDays: number;
  priceDifference: number;
  reason: string;
  holdAvailable: boolean;
  holdExpiresAt?: string;
  conciergeNote?: string;
  verifiedAt: string;
}

export interface GlobalNetworkStats {
  activeSearches: number;
  regionsConnected: number;
  boutiquesNetwork: number;
  averageDeliveryDays: number;
  successRate: number;
}

export interface RestockPrediction {
  productId: string;
  productName: string;
  productImage: string;
  brandName: string;
  estimatedDate: string;
  probability: number;
  alertEnabled: boolean;
}
