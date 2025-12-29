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
