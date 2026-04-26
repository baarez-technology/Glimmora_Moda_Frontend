/**
 * Intelligence Types
 *
 * G-SAIL Availability Intelligence, Fit Confidence, Digital Body Twin,
 * Wardrobe Analysis, Complete Outfit, and Fashion Passport types.
 */

import type { Product } from './product';

// ============================================
// G-SAIL Availability Intelligence
// ============================================

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

// ============================================
// Complete Outfit
// ============================================

import type { OutfitItem } from './calendar';

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

// ============================================
// Fit Confidence
// ============================================

export interface FitConfidence {
  overallScore: number;
  suggestedSize: string;
  availableSizes: string[];
  breakdown: {
    sizeMatch: number;
    styleMatch: number;
    proportionMatch: number;
  };
  measurementAnalysis: {
    chestDifferenceCm: number | null;
    waistDifferenceCm: number | null;
    shoulderAlignment: string | null;
    sleeveLengthEstimate: string | null;
  };
  confidenceInterval?: {
    sizeRange: string;
    lowerBoundPercent: number;
    upperBoundPercent: number;
    lowConfidenceFlag: boolean;
    explanation: string;
  };
  sizeNotes: string[];
  returnRisk: 'low' | 'medium' | 'high';
  returnRiskScore: number;
  recommendation: string;
  bodyTwinUsed: boolean;
  fitEngineVersion: string;
}

// ============================================
// Digital Body Twin
// ============================================

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

// ============================================
// Wardrobe Analysis
// ============================================

export interface WardrobeGap {
  id: string;
  category: string;
  priority: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;
  occasionsUnlocked: string[];
  suggestedProducts: Product[];
}

export interface WardrobeAnalysis {
  totalPieces: number;
  versatilityScore: number;
  categories: Record<string, number>;
  occasionCoverage: Record<string, number>;
  gaps: WardrobeGap[];
  styleBalance: string;
  agiInsight: string;
}

// ============================================
// Fashion Passport
// ============================================

export interface PassportMaterial {
  name: string;
  origin: string;
  certification?: string;
  sustainability?: string;
}

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
