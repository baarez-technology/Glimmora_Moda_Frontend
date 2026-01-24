/**
 * Heritage & Cultural Journey Types (SOW V10.2)
 *
 * Heritage events and cultural journey types for brand storytelling.
 */

// ============================================
// Heritage Events
// ============================================

export type HeritageEventSignificance = 'milestone' | 'collection' | 'innovation' | 'cultural' | 'collaboration' | 'award';

export interface HeritageEvent {
  id: string;
  brandId: string;
  year: number;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  significance: HeritageEventSignificance;
  relatedProducts?: string[];
  videoUrl?: string;
}

// ============================================
// Cultural Journeys
// ============================================

export type JourneyType = 'art' | 'travel' | 'craft' | 'eras' | 'icons' | 'sustainability';

export interface JourneyStop {
  id: string;
  order: number;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gallery';
  relatedBrands: string[];
  relatedProducts: string[];
  relatedStories: string[];
  interactiveElement?: 'quiz' | 'timeline' | 'comparison' | 'gallery';
}

export interface CulturalJourney {
  id: string;
  type: JourneyType;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  stops: JourneyStop[];
  duration: string; // "15 min read"
  difficulty: 'beginner' | 'intermediate' | 'connoisseur';
}
