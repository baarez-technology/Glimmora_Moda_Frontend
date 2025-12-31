// Brand Types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
  logoUrl: string;
  heritage: {
    founded: number;
    founder: string;
    origin: string;
    story: string;
  };
  collections: Collection[];
  stories: BrandStory[];
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  heroImage: string;
  products: Product[];
}

// Product Types
export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  narrative: string;
  price: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  materials: Material[];
  craftsmanship: CraftsmanshipDetail[];
  ivEnabled: boolean;
  availability: Availability;
  collection?: string;
  category: ProductCategory;
  tags: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'hero' | 'detail' | 'lifestyle' | 'editorial';
}

export interface ProductVariant {
  id: string;
  type: 'size' | 'color' | 'material';
  name: string;
  value: string;
  available: boolean;
  additionalPrice?: number;
}

export interface Material {
  name: string;
  composition: string;
  origin: string;
  sustainability?: string;
}

export interface CraftsmanshipDetail {
  title: string;
  description: string;
  duration?: string;
  artisans?: number;
}

export interface Availability {
  status: 'available' | 'limited' | 'unavailable' | 'pre-order';
  quantity?: number;
  regions: RegionAvailability[];
  restockDate?: string;
}

export interface RegionAvailability {
  region: string;
  city: string;
  available: boolean;
  confidence: number;
  deliveryDays: number;
}

export type ProductCategory =
  | 'bags'
  | 'clothing'
  | 'shoes'
  | 'accessories'
  | 'jewelry'
  | 'watches';

// Brand Story Types
export interface BrandStory {
  id: string;
  brandId: string;
  title: string;
  slug: string;
  type: 'heritage' | 'craftsmanship' | 'collection' | 'collaboration' | 'artisan';
  excerpt: string;
  content: StorySection[];
  heroImage: string;
  publishedAt: string;
  readTime: number;
  relatedProducts: string[];
}

export interface StorySection {
  type: 'text' | 'image' | 'video' | 'quote' | 'timeline';
  content: string;
  caption?: string;
  mediaUrl?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  fashionIdentity?: FashionIdentity;
  wardrobe: WardrobeItem[];
  considerations: ConsiderationItem[];
  orders: Order[];
}

export interface FashionIdentity {
  occasions: string[];
  aesthetics: string[];
  confidenceLevel: 'decisive' | 'guided' | 'advisory';
  budgetRange?: {
    min: number;
    max: number;
  };
  primaryLocation: string;
  travelDestinations: string[];
  bodyTwin?: BodyTwin;
}

export interface BodyTwin {
  id: string;
  silhouette: 'petite' | 'average' | 'tall' | 'curvy';
  measurements?: {
    height?: number;
    chest?: number;
    waist?: number;
    hips?: number;
  };
}

export interface WardrobeItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
  wearCount: number;
  lastWorn?: string;
  outfitCompatibility: string[];
}

export interface ConsiderationItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
  selectedVariants: {
    size?: string;
    color?: string;
  };
  agiNote?: string;
}

// Order Types
export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  currency: string;
  shippingAddress: Address;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariants: {
    size?: string;
    color?: string;
  };
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// AGI Types
export interface AGIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: AGISuggestion[];
}

export interface AGISuggestion {
  type: 'product' | 'story' | 'collection' | 'action';
  title: string;
  description: string;
  link?: string;
  productId?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// Calendar Types
export type CalendarProvider = 'google' | 'apple' | 'outlook' | 'manual';

export type EventType =
  | 'business_meeting'
  | 'dinner_party'
  | 'wedding'
  | 'gala'
  | 'gallery_opening'
  | 'cocktail_party'
  | 'travel'
  | 'date_night'
  | 'brunch'
  | 'conference'
  | 'interview'
  | 'casual_outing'
  | 'theater'
  | 'concert'
  | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: EventType;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  venue?: string;
  description?: string;
  dressCode?: 'casual' | 'smart_casual' | 'business' | 'cocktail' | 'formal' | 'black_tie';
  weather?: {
    condition: string;
    temperature: number;
    unit: 'C' | 'F';
  };
  outfitSuggestions?: OutfitSuggestion[];
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0-100
  items: OutfitItem[];
  agiReasoning: string;
}

export interface OutfitItem {
  type: 'wardrobe' | 'suggested';
  productId: string;
  product: Product;
  category: string;
  note?: string;
}

export interface CalendarConnection {
  provider: CalendarProvider;
  connected: boolean;
  email?: string;
  lastSynced?: string;
  calendarsSelected?: string[];
}

// User Preferences Types
export interface UserPreferences {
  id: string;
  userId: string;
  notifications: {
    restockAlerts: boolean;
    newArrivals: boolean;
    priceChanges: boolean;
    outfitSuggestions: boolean;
    eventReminders: boolean;
  };
  privacy: {
    shareWardrobeInsights: boolean;
    allowAGILearning: boolean;
    shareStylePreferences: boolean;
  };
  shopping: {
    budgetMin: number;
    budgetMax: number;
    preferredBrands: string[];
    excludedCategories: string[];
  };
  display: {
    currency: 'EUR' | 'USD' | 'GBP';
    measurementUnit: 'metric' | 'imperial';
  };
}

// G-SAIL™ Availability Intelligence Types
export interface AvailabilityIntelligence {
  productId: string;
  currentStatus: 'available' | 'limited' | 'unavailable' | 'pre-order';
  localConfidence: number;
  alternatives: AvailabilityAlternative[];
  restockPrediction?: {
    estimatedDate: string;
    probability: number;
  };
  conciergeOption?: boolean;
}

export interface AvailabilityAlternative {
  type: 'geography' | 'equivalent' | 'restock';
  region?: string;
  city?: string;
  availabilityConfidence: number;
  deliveryDays?: number;
  priceDifference?: number;
  reason: string;
  product?: Product;
}

// Complete Outfit Types
export interface CompleteOutfit {
  id: string;
  name: string;
  occasion: string;
  description: string;
  items: OutfitItem[];
  compatibilityScore: number;
  totalPrice: number;
  agiReasoning: string;
}

// Fit Confidence Types
export interface FitConfidence {
  overallScore: number;
  suggestedSize: string;
  breakdown: {
    sizeMatch: number;
    styleMatch: number;
    proportionMatch: number;
  };
  sizeNotes: string[];
  returnRisk: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface DigitalBodyTwin {
  id: string;
  userId: string;
  silhouette: 'petite' | 'average' | 'tall' | 'curvy' | 'athletic';
  measurements: {
    height?: number;
    chest?: number;
    bust?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    shoulders?: number;
  };
  fitPreferences: {
    tops: 'fitted' | 'relaxed' | 'oversized';
    bottoms: 'fitted' | 'relaxed' | 'wide';
    dresses: 'fitted' | 'relaxed' | 'flowing';
  };
  proportions: {
    shoulder: 'narrow' | 'medium' | 'broad';
    torso: 'short' | 'medium' | 'long';
    legs: 'short' | 'medium' | 'long';
  };
  preferredFit: 'fitted' | 'regular' | 'relaxed' | 'oversized';
  createdAt: string;
  updatedAt: string;
}

// Wardrobe Analysis Types
export interface WardrobeAnalysis {
  totalPieces: number;
  versatilityScore: number;
  categories: Record<string, number>;
  occasionCoverage: Record<string, number>;
  gaps: WardrobeGap[];
  styleBalance: string;
  agiInsight: string;
}

export interface WardrobeGap {
  id: string;
  category: string;
  priority: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;
  occasionsUnlocked: string[];
  suggestedProducts: Product[];
}

// Fashion Passport Types
export interface FashionPassport {
  id: string;
  productId: string;
  serialNumber: string;
  authenticity: {
    verified: boolean;
    verifiedAt: string;
    verificationMethod: string;
  };
  provenance: {
    createdIn: string;
    createdAt: string;
    artisans?: number;
    craftingHours?: number;
  };
  materials: PassportMaterial[];
  ownership: {
    currentOwner: string;
    purchaseDate: string;
    transferHistory?: {
      type: string;
      date: string;
    }[];
  };
  care: {
    servicingAvailable: boolean;
    warrantyExpires?: string;
    instructions: string[];
  };
}

export interface PassportMaterial {
  name: string;
  origin: string;
  certification?: string;
  sustainability?: string;
}

// ============================================
// UHNI (Ultra High Net-worth Individual) Types
// ============================================

// User Tier System
export type UserTier = 'standard' | 'preferred' | 'uhni';

// Personal Concierge
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

// Autonomous Shopping Settings (Zero-UI Commerce)
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

// Sourcing Request Types
export type SourcingRequestType = 'specific_item' | 'category' | 'occasion' | 'bespoke';
export type SourcingRequestStatus = 'pending' | 'sourcing' | 'options_found' | 'awaiting_approval' | 'acquired' | 'delivered' | 'cancelled';

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

// Bespoke Order Types
export type BespokeOrderType = 'made_to_measure' | 'custom_design' | 'modification';
export type BespokeOrderStatus = 'consultation' | 'design_approval' | 'production' | 'fitting' | 'final_adjustments' | 'complete';

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

// Private Collection Types
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

// Autonomous Activity Types
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

// UHNI Profile (extends base User)
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
