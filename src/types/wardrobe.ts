/**
 * Wardrobe Management Types (SOW V10.2)
 *
 * Outfit feedback, seasonal suggestions, declutter suggestions,
 * wardrobe value, and material feel types.
 */

import type { Product } from './product';

// ============================================
// Outfit Feedback & Tracking
// ============================================

export interface OutfitFeedback {
  id: string;
  outfitId: string;
  outfitItems: string[]; // product IDs
  eventId?: string;
  eventName?: string;
  wornDate: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: {
    comfort: number; // 1-5
    appropriateness: number; // 1-5
    confidence: number; // 1-5
    compliments: number; // count
    wouldWearAgain: boolean;
  };
  notes?: string;
  photos?: string[];
  weather?: {
    condition: string;
    temperature: number;
  };
  occasion?: string;
  location?: string;
  tags?: string[];
  createdAt: string;
}

// ============================================
// Seasonal Rotation
// ============================================

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalSuggestion {
  id: string;
  action: 'bring-out' | 'store' | 'maintain';
  productIds: string[];
  reason: string;
  currentSeason: Season;
  targetSeason?: Season;
  location: string;
  priority: 'high' | 'medium' | 'low';
  tips?: string[];
}

// ============================================
// Declutter Suggestions
// ============================================

export interface DeclutterSuggestion {
  id: string;
  productId: string;
  product: Product;
  reason: 'unworn' | 'rarely-worn' | 'outdated' | 'duplicate' | 'no-longer-fits' | 'damaged';
  reasonDetail: string;
  lastWorn?: string;
  wearCount: number;
  daysSinceLastWorn: number;
  suggestedAction: 'donate' | 'resell' | 'recycle' | 'keep' | 'repair';
  estimatedResaleValue?: number;
  donationPartners?: string[];
  confidence: number; // 0-100
}

// ============================================
// Material Feel & Sensory
// ============================================

export interface MaterialFeel {
  productId: string;
  texture: string; // "Buttery soft with a subtle grain"
  weight: string; // "Substantial without being heavy"
  temperature: string; // "Cool to the touch, warming with wear"
  comfort: string; // "Moves with your body, never restricts"
  sound?: string; // "Whisper-quiet silk movement"
  aging: string; // "Develops a beautiful patina over time"
  sensoryHighlights: string[];
  agiDescription: string; // Full AGI-generated sensory narrative
}

// ============================================
// Wardrobe Value & Analytics
// ============================================

export interface WardrobeItemValue {
  id: string;
  productId: string;
  product: Product;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  appreciation: number; // percentage
  wearCount: number;
  costPerWear: number;
  lastWorn?: string;
  condition: 'excellent' | 'good' | 'fair' | 'worn';
  resaleReadiness: 'high' | 'medium' | 'low';
}

export interface WardrobeValueMetrics {
  totalPurchaseValue: number;
  currentEstimatedValue: number;
  totalAppreciation: number; // Can be negative
  appreciationPercentage: number;
  averageCostPerWear: number;
  bestValueItems: WardrobeItemValue[];
  worstValueItems: WardrobeItemValue[];
  appreciatingItems: WardrobeItemValue[];
  depreciatingItems: WardrobeItemValue[];
  categoryBreakdown: Record<string, { count: number; value: number; costPerWear: number }>;
  brandBreakdown: Record<string, { count: number; value: number; costPerWear: number }>;
  monthlySpendTrend: { month: string; amount: number }[];
  investmentGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  agiInsight: string;
}
