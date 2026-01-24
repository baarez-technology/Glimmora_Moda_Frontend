/**
 * Climate & Sustainability Types (SOW V10.2)
 *
 * Climate suitability and sustainability score types.
 */

// ============================================
// Climate Suitability
// ============================================

export interface ClimateSuitability {
  productId: string;
  temperatureRange: { min: number; max: number }; // Celsius
  humidity: 'low' | 'medium' | 'high' | 'any';
  weather: ('sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy')[];
  seasons: ('spring' | 'summer' | 'autumn' | 'winter')[];
  climates: ('tropical' | 'temperate' | 'continental' | 'arid' | 'polar')[];
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  activityLevel: 'low' | 'moderate' | 'high';
}

// ============================================
// Sustainability Score
// ============================================

export interface SustainabilityScore {
  productId: string;
  overallScore: number; // 0-100
  breakdown: {
    materials: number;
    production: number;
    packaging: number;
    transport: number;
    longevity: number;
    endOfLife: number;
  };
  certifications: string[];
  carbonFootprint: string; // "12kg CO2e"
  waterUsage: string; // "50L"
  recyclability: 'high' | 'medium' | 'low' | 'none';
  repairability: 'high' | 'medium' | 'low';
  biodegradable: boolean;
  veganFriendly: boolean;
  highlights: string[];
  improvements: string[];
}
