/**
 * Travel & Planning Types (SOW V10.2)
 *
 * Trip, packing, and multi-day planning types.
 */

import type { Product } from './product';
import type { CalendarEvent } from './calendar';
import type { WeatherData } from './weather';

// ============================================
// Trip Activity Types
// ============================================

export type TripActivity = 'business' | 'casual' | 'formal' | 'outdoor' | 'beach' | 'cultural' | 'nightlife' | 'sports' | 'wellness';

// ============================================
// Packing Items
// ============================================

export interface PackingItem {
  id: string;
  productId?: string;
  product?: Product;
  category: string;
  name: string;
  quantity: number;
  packed: boolean;
  isFromWardrobe: boolean;
  isSuggested: boolean;
  suggestedReason?: string;
  forActivities: TripActivity[];
  priority: 'essential' | 'recommended' | 'optional';
}

// ============================================
// Trip
// ============================================

export interface Trip {
  id: string;
  name: string;
  destination: string;
  destinationImage?: string;
  departureDate: string;
  returnDate: string;
  activities: TripActivity[];
  weather?: WeatherData;
  packingList: PackingItem[];
  events: CalendarEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Multi-Day Planning
// ============================================

export interface PlannedOutfit {
  id: string;
  eventId?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  items: string[]; // product IDs
  savedOutfitId?: string;
  notes?: string;
  rating?: number;
}

export interface PlanDay {
  date: string;
  dayNumber: number;
  events: CalendarEvent[];
  outfits: PlannedOutfit[];
  notes?: string;
}

export interface MultiDayPlan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  days: PlanDay[];
  tripId?: string;
  createdAt: string;
  updatedAt: string;
}
