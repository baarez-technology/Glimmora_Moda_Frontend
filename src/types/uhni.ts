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
  title?: string;
  description?: string;
  currency?: string;
  imageUrl?: string;
  sourceLocation?: string;
  brandName?: string;
  estimatedDelivery?: string;
  notes?: string;
  addedAt?: string;
}

export interface SourcingMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'brand' | 'concierge';
  content: string;
  createdAt: string;
}

export interface SourcingTimelineEvent {
  id: string;
  status: SourcingRequestStatus;
  note: string;
  updatedBy: 'brand' | 'client' | 'system';
  createdAt: string;
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
  messages?: SourcingMessage[];
  timeline?: SourcingTimelineEvent[];
  clientApprovalRequired?: boolean;
  category?: string;
  specifications?: string;
  priority?: 'standard' | 'urgent' | 'when_available';
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

export interface BespokeMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'brand';
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface BespokeDetailedSpec {
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    shoulders?: number;
    sleeveLength?: number;
    height?: number;
    notes?: string;
  };
  fabricPreferences?: string;
  colorPreferences?: string;
  referenceImages?: string[];
  specialInstructions?: string;
  occasionContext?: string;
  deliveryDeadline?: string;
}

export interface BespokeTimelineEvent {
  id: string;
  status: BespokeOrderStatus;
  note: string;
  updatedBy: 'brand' | 'system';
  createdAt: string;
}

export interface BespokeOrder {
  id: string;
  brandId: string;
  brandName: string;
  /** When multiple brands are selected for a bespoke commission */
  selectedBrands?: { id: string; name: string }[];
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
  // Bespoke flow fields
  messages?: BespokeMessage[];
  detailedSpec?: BespokeDetailedSpec;
  timelineEvents?: BespokeTimelineEvent[];
  brandNotes?: string;
  clientApprovalRequired?: boolean;
  clientApproved?: boolean;
}

// ============================================
// Private Collection Types
// ============================================

export type PrivateCollectionAccess = 'invitation' | 'request' | 'uhni_only';

export interface RequestedCustomer {
  customer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  first_name: string;
  last_name: string;
  notes?: string;
}

export interface UhniCustomer {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  phone?: string;
}

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
  notes?: string;
  customer_ids: string[];
  requested_customers: RequestedCustomer[];
  /** @deprecated use customer_ids */
  invitedClients?: string[];
  /** @deprecated use requested_customers */
  accessRequests?: CollectionAccessRequest[];
  deletedAt?: string;
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

export type NegotiationAction = 'approve' | 'decline' | 'counter';

export interface PriceNegotiation {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug?: string;
  brandName: string;
  originalPrice: number;
  proposedPrice: number;
  counterOffer?: number;
  status: NegotiationStatus;
  clientMessage?: string;
  brandMessage?: string;
  respondedAt?: string;
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
  targetClientIds?: string[];
  isPrivate?: boolean;
  claimedBy?: string[];
  claimedCount?: number;
  maxClaims?: number;
  originalPrice?: number;
  productSlug?: string;
  brandName?: string;
  productImage?: string;
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

// ============================================
// Exclusive Events (UHNI Events Page)
// ============================================

export type ExclusiveEventType = 'exhibition' | 'gala' | 'masterclass' | 'launch' | 'experience';
export type RegistrationStatus = 'open' | 'registered' | 'waitlist' | 'closed';

export interface ExclusiveEvent {
  id: string;
  title: string;
  type: ExclusiveEventType;
  host: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  time: string;
  description: string;
  highlights: string[];
  registrationStatus: RegistrationStatus;
  maxAttendees: number;
  spotsLeft: number;
  image?: string;
}

// ============================================
// Private Shopping Events
// ============================================

export type PrivateShoppingStatus = 'upcoming' | 'rsvp_confirmed' | 'completed' | 'invite_only';

export interface PrivateShoppingEvent {
  id: string;
  title: string;
  designer: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  status: PrivateShoppingStatus;
  maxGuests: number;
  guestsConfirmed: number;
  dressCode?: string;
  perks: string[];
  image?: string;
}

// ============================================
// Heritage Archive
// ============================================

export interface HeritageArchiveItem {
  id: string;
  title: string;
  brand: string;
  era: string;
  description: string;
  significance: string;
  image: string;
  relatedProducts: string[];
}

// ============================================
// Intelligence Insights
// ============================================

export type InsightCategory = 'style_trend' | 'market_signal' | 'wardrobe_gap' | 'investment_piece';
export type InsightTrend = 'rising' | 'stable' | 'declining';

export interface IntelligenceInsight {
  id: string;
  title: string;
  category: InsightCategory;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  trend: InsightTrend;
  confidence: number;
  date: string;
}

// ============================================
// U13: Zero-UI Commerce
// ============================================

export interface ZeroUITrigger {
  id: string;
  type: 'restock' | 'seasonal' | 'event' | 'travel';
  description: string;
  enabled: boolean;
  lastTriggered?: string;
}

export interface ZeroUIConfig {
  autoReplenish: boolean;
  invisibleCheckout: boolean;
  wardrobePreparation: boolean;
  triggers: ZeroUITrigger[];
  preferences: {
    maxAutoSpend: number;
    preferredBrands: string[];
    excludedCategories: string[];
    notifyBefore: boolean;
    notifyAfter: boolean;
  };
}

// ============================================
// U14: Invisible Commerce
// ============================================

export type InvisibleMethod = 'concierge' | 'auto' | 'scheduled';
export type DiscretionLevel = 'standard' | 'high' | 'maximum';

export interface InvisibleTransaction {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  method: InvisibleMethod;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  discretionLevel: DiscretionLevel;
  noDigitalTrail: boolean;
  amount: number;
  date: string;
}

// ============================================
// U15: Concierge Execution Tasks
// ============================================

export type ConciergeTaskType = 'styling' | 'sourcing' | 'delivery' | 'reservation' | 'alteration';
export type ConciergeTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ConciergeTaskPriority = 'low' | 'normal' | 'medium' | 'high' | 'urgent';

export interface ConciergeTask {
  id: string;
  type: ConciergeTaskType;
  title: string;
  description: string;
  status: ConciergeTaskStatus;
  assignedTo: string;
  priority: ConciergeTaskPriority;
  dueDate: string;
  notes: string[];
  clientInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

// Concierge Appointments
export type AppointmentType = 'styling_session' | 'private_viewing' | 'consultation' | 'fitting' | 'video_call' | 'phone_call';
export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';

export interface ConciergeAppointment {
  id: string;
  type: AppointmentType;
  title: string;
  date: string;
  time: string;
  duration: number; // minutes
  durationMinutes?: number; // alias for duration
  scheduledAt?: string; // ISO datetime string (computed from date+time if not provided)
  notes?: string;
  status: AppointmentStatus;
  conciergeId: string;
  conciergeName: string;
  createdAt: string;
  meetingLink?: string; // for video_call appointments
}

export interface ConciergeTaskInput {
  title: string;
  description: string;
  type: ConciergeTaskType;
  priority: ConciergeTaskPriority;
  dueDate: string;
  clientInstructions?: string;
}

// ============================================
// U16: Silent Commerce
// ============================================

export type AwarenessLevel = 'passive' | 'active' | 'urgent';
export type DisplayMode = 'ambient' | 'card' | 'notification';

export interface SilentCommerceItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brandName: string;
  price: number;
  awareness: AwarenessLevel;
  context: string;
  displayMode: DisplayMode;
  relevanceScore: number;
}

// ============================================
// Collection Invitation & Access Request Types
// ============================================

export interface CollectionInvitation {
  id: string;
  collectionId: string;
  collectionName: string;
  brandName: string;
  brandId: string;
  sentAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
}

export interface CollectionAccessRequest {
  id: string;
  collectionId: string;
  clientId: string;
  clientName: string;
  clientTier: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedAt?: string;
  reviewNote?: string;
}

// ============================================
// Claimed Offers
// ============================================

export interface ClaimedOffer {
  id: string;
  offerId: string;
  offerTitle: string;
  brandName: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  originalPrice: number;
  discountedPrice: number;
  discountLabel: string;
  claimedAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
}
