/**
 * Calendar Types
 *
 * Calendar events, connections, outfit suggestions, and user preferences.
 */

import type { Product } from './product';

// Calendar Provider
export type CalendarProvider = 'google' | 'icloud' | 'microsoft' | 'manual';

// Event Type
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

// Outfit Item
export interface OutfitItem {
  type: 'wardrobe' | 'suggested';
  productId: string;
  product: Product;
  category: string;
  note?: string;
}

// Outfit Suggestion
export interface OutfitSuggestion {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0-100
  items: OutfitItem[];
  agiReasoning: string;
}

// Calendar Event
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
  backendOutfitSuggestions?: BackendOutfitRecommendation;
}

// Calendar Connection
export interface CalendarConnection {
  provider: CalendarProvider;
  connected: boolean;
  email?: string;
  lastSynced?: string;
  calendarsSelected?: string[];
}

// User Preferences
// ─── Backend Response Types ──────────────────────────────────────────────────

export interface BackendCalendarEvent {
  customer_id: string;
  calendar_event_id: string;
  source: string;
  title: string;
  description: string | null;
  event_date: string;
  event_day: string;
  event_time: string | null;
  location: string | null;
  tags: string[];
  weather: string | null;
  tempressure: number | null;
  sky_tag: string | null;
  role: string;
  outfit_suggestions: BackendOutfitRecommendation | null;
}

export interface BackendOutfitProduct {
  product_id: string;
  product_name: string;
  brand_id: string;
  brand_name: string;
  sku: string;
  status: string;
  price: number;
  offer_price: number;
  discount_percentage: number;
  sizes: string[];
  collection_name: string;
  product_category: string;
  tagline: string;
  product_description: string;
  product_image: string;
  occasions: string[];
  aesthetics: string[];
  color: string;
  pattern: string;
  fabrics: string;
  image_urls: string[];
  score: number;
  is_wardrobe: boolean;
}

export interface BackendOutfitItem {
  product_category: string;
  color: string;
  pattern: string;
  fabrics: string;
  suitable_product: BackendOutfitProduct | null;
}

export interface BackendOutfitRecommendation {
  title: string;
  description: string;
  style_note: string;
  outfit_suggestions: BackendOutfitItem[];
  style_score: number;
  cached: boolean;
}

export interface CalendarConnectionStatus {
  connected: boolean;
  your_user_id?: string;
  grants?: { google: string | null; microsoft: string | null; icloud: string | null };
  emails?: { google?: string; microsoft?: string; icloud?: string };
  detail?: string;
}

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  google: 'Google Calendar',
  icloud: 'Apple Calendar',
  microsoft: 'Outlook Calendar',
};

// ─── Manual Event Request ────────────────────────────────────────────────────

export interface ManualEventRequest {
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string;
  location?: string;
  description?: string;
}

// ─── Suggestion Preferences ─────────────────────────────────────────────────

export interface SuggestionPreferences {
  include_weather_in_suggestions: boolean;
  prioritize_wardrobe_items: boolean;
  daily_outfit_reminders: boolean;
  suggest_new_pieces: boolean;
}

// ─── User Preferences ───────────────────────────────────────────────────────

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
