/**
 * Calendar Types
 *
 * Calendar events, connections, outfit suggestions, and user preferences.
 */

import type { Product } from './product';

// Calendar Provider
export type CalendarProvider = 'google' | 'apple' | 'outlook' | 'manual';

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
  event_id: string;
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
}

export interface CalendarConnectionStatus {
  connected: boolean;
  your_user_id?: string;
  email?: string;
  grant_id?: string;
  provider?: string;
  calendar_id?: string | null;
  detail?: string;
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
