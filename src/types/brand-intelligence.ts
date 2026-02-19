/**
 * Brand Intelligence Types (B17-B27)
 *
 * Types for brand portal intelligence features:
 * Design-to-Demand, Intelligence Agent, AGI Concierge,
 * Memory Imprint, Digital Twin, Cultural Authority,
 * Boutique Performance, Counterfeit Detection,
 * Drop Simulator, Heritage Preservation, Client Genome.
 */

// ============================================
// B17: Design-to-Demand Simulation
// ============================================

export interface RegionDemand {
  region: string;
  score: number;
  population: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface DemandSimulation {
  id: string;
  concept: string;
  description: string;
  targetAudience: string;
  demandScore: number;
  regionBreakdown: RegionDemand[];
  sellBeforeMake: boolean;
  estimatedUnits: number;
  pricePoint: number;
  category: string;
  createdAt: string;
}

// ============================================
// B18: Intelligence Agent
// ============================================

export type SignalType = 'demand' | 'validation' | 'timing' | 'competition' | 'sentiment';

export interface BrandIntelligenceSignal {
  id: string;
  type: SignalType;
  title: string;
  region: string;
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
  confidence: number;
  date: string;
}

// ============================================
// B19: AGI Concierge Config
// ============================================

export interface ConciergeConversation {
  id: string;
  visitorId: string;
  topic: string;
  status: 'active' | 'resolved' | 'escalated';
  sentiment: 'positive' | 'neutral' | 'negative';
  startedAt: string;
}

export interface BrandConciergeConfig {
  personality: string;
  tone: 'formal' | 'approachable' | 'playful' | 'authoritative';
  culturalAnchors: string[];
  activeVisitors: number;
  conversations: ConciergeConversation[];
  responseLanguages: string[];
  knowledgeBase: string[];
}

// ============================================
// B20: Brand Memory Imprint
// ============================================

export type TouchpointType = 'store_visit' | 'online_browse' | 'purchase' | 'event' | 'social_media' | 'customer_service';

export interface MemoryImprint {
  id: string;
  touchpoint: TouchpointType;
  label: string;
  recallScore: number;
  emotionalResonance: number;
  returnProbability: number;
  sampleSize: number;
  period: string;
}

// ============================================
// B21: Brand Digital Twin
// ============================================

export interface DigitalTwinNode {
  id: string;
  type: 'collection' | 'heritage' | 'cultural' | 'product';
  label: string;
  connections: string[];
  strength: number;
}

export interface DigitalTwinMetrics {
  brandEquity: number;
  culturalRelevance: number;
  heritageStrength: number;
  innovationIndex: number;
  customerLoyalty: number;
}

export interface BrandDigitalTwin {
  id: string;
  brandName: string;
  nodes: DigitalTwinNode[];
  metrics: DigitalTwinMetrics;
  lastUpdated: string;
}

// ============================================
// B22: Cultural Brand Capital Engine (CBCE)
// ============================================

export interface CulturalAuthority {
  id: string;
  dimension: string;
  score: number;
  maxScore: number;
  trend: 'improving' | 'stable' | 'declining';
  risks: string[];
  recommendations: string[];
  lastAssessed: string;
}

// ============================================
// B23: Boutique Performance Index (BPI)
// ============================================

export interface BoutiqueScores {
  experience: number;
  conversion: number;
  service: number;
  ambiance: number;
}

export interface BoutiquePerformance {
  boutiqueId: string;
  name: string;
  city: string;
  region: string;
  scores: BoutiqueScores;
  rank: number;
  totalBoutiques: number;
  revenue: number;
  footfall: number;
  lastAudit: string;
}

// ============================================
// B24: Counterfeit Digital Detection (CDDI)
// ============================================

export type CounterfeitRiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type CounterfeitStatus = 'new' | 'investigating' | 'confirmed' | 'resolved' | 'dismissed';

export interface CounterfeitAlert {
  id: string;
  productId: string;
  productName: string;
  riskLevel: CounterfeitRiskLevel;
  source: string;
  sourceUrl?: string;
  similarity: number;
  detectedAt: string;
  status: CounterfeitStatus;
  region: string;
}

// ============================================
// B25: Global Drop Strategy Simulator (GDSS)
// ============================================

export interface DropRegionForecast {
  region: string;
  demandScore: number;
  optimalDate: string;
  estimatedSellThrough: number;
  competitorActivity: 'low' | 'medium' | 'high';
}

export interface DropSimulation {
  id: string;
  dropName: string;
  collection: string;
  launchDate: string;
  regions: DropRegionForecast[];
  overallDemandForecast: number;
  riskFactors: string[];
  recommendation: string;
  status: 'draft' | 'simulated' | 'approved' | 'launched';
  createdAt: string;
}

// ============================================
// B26: Heritage Preservation AI (HPAI)
// ============================================

export type DigitalStatus = 'not_started' | 'scanning' | 'processing' | 'complete';

export interface HeritageAsset {
  assetId: string;
  name: string;
  era: string;
  year?: number;
  significance: 'iconic' | 'important' | 'notable' | 'standard';
  description: string;
  digitalStatus: DigitalStatus;
  preservationScore: number;
  lastInspection?: string;
  image?: string;
}

// ============================================
// B27: Ultra-Premium Client Genome (UPCG)
// ============================================

export interface SpendPattern {
  category: string;
  percentage: number;
  averageOrderValue: number;
}

export interface BehaviorTrait {
  trait: string;
  strength: number;
  description: string;
}

export interface ClientArchetype {
  archetypeId: string;
  label: string;
  description: string;
  clientCount: number;
  preferences: string[];
  spendPattern: SpendPattern[];
  behaviorTraits: BehaviorTrait[];
  averageLifetimeValue: number;
  retentionRate: number;
}
