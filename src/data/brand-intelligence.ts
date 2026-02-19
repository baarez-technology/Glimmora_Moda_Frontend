/**
 * Brand Intelligence Mock Data
 *
 * Realistic mock datasets for all 11 brand intelligence features (B17-B27).
 * Data is modeled around Dior as the primary brand partner.
 */

import type {
  DemandSimulation,
  BrandIntelligenceSignal,
  BrandConciergeConfig,
  MemoryImprint,
  BrandDigitalTwin,
  CulturalAuthority,
  BoutiquePerformance,
  CounterfeitAlert,
  DropSimulation,
  HeritageAsset,
  ClientArchetype,
} from '@/types/brand-intelligence';

// ============================================
// B17: Design-to-Demand Simulation
// ============================================

export const mockDemandSimulations: DemandSimulation[] = [
  {
    id: 'ds-001',
    concept: 'Dior Jardin Nocturne',
    description:
      'A capsule evening-wear collection inspired by midnight botanical gardens, featuring hand-embroidered floral appliques on structured silk gazar silhouettes.',
    targetAudience: 'Women 28-45, haute couture collectors and red-carpet clients',
    demandScore: 87,
    regionBreakdown: [
      { region: 'Europe', score: 91, population: 3200000, trend: 'rising' },
      { region: 'Middle East', score: 94, population: 1800000, trend: 'rising' },
      { region: 'North America', score: 82, population: 4100000, trend: 'stable' },
      { region: 'Asia Pacific', score: 85, population: 5600000, trend: 'rising' },
    ],
    sellBeforeMake: false,
    estimatedUnits: 4200,
    pricePoint: 8900,
    category: 'Haute Couture',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'ds-002',
    concept: 'Dior Homme Urban Voyager',
    description:
      'Technical menswear capsule blending tailored construction with performance fabrics. Features water-resistant wool blends and modular layering pieces for the global traveler.',
    targetAudience: 'Men 30-50, luxury business travelers and tech executives',
    demandScore: 74,
    regionBreakdown: [
      { region: 'Europe', score: 78, population: 2900000, trend: 'stable' },
      { region: 'North America', score: 81, population: 3700000, trend: 'rising' },
      { region: 'Asia Pacific', score: 72, population: 4800000, trend: 'rising' },
      { region: 'Middle East', score: 62, population: 900000, trend: 'stable' },
    ],
    sellBeforeMake: true,
    estimatedUnits: 11500,
    pricePoint: 3200,
    category: 'Ready-to-Wear',
    createdAt: '2026-01-28T14:15:00Z',
  },
  {
    id: 'ds-003',
    concept: 'Dior Saddle Reimagined',
    description:
      'Limited-edition reinterpretation of the iconic Saddle Bag in upcycled heritage fabrics sourced from Dior archival textiles, paired with hand-patinated brass hardware.',
    targetAudience: 'Women 22-40, sustainability-conscious luxury collectors',
    demandScore: 93,
    regionBreakdown: [
      { region: 'Europe', score: 90, population: 3500000, trend: 'rising' },
      { region: 'North America', score: 95, population: 4300000, trend: 'rising' },
      { region: 'Asia Pacific', score: 96, population: 6100000, trend: 'rising' },
      { region: 'Middle East', score: 78, population: 1200000, trend: 'stable' },
    ],
    sellBeforeMake: true,
    estimatedUnits: 8000,
    pricePoint: 5400,
    category: 'Leather Goods',
    createdAt: '2026-02-05T11:00:00Z',
  },
];

// ============================================
// B18: Intelligence Agent
// ============================================

export const mockIntelligenceSignals: BrandIntelligenceSignal[] = [
  {
    id: 'sig-001',
    type: 'demand',
    title: 'Surging demand for Dior couture in Middle East',
    region: 'Middle East',
    metric: 'Search Volume Index',
    value: 142,
    trend: 'up',
    recommendation:
      'Increase couture trunk show frequency in Riyadh and Dubai. Consider a dedicated Ramadan capsule for Q1 2026.',
    confidence: 0.91,
    date: '2026-02-12T08:00:00Z',
  },
  {
    id: 'sig-002',
    type: 'validation',
    title: 'Celebrity endorsement lift for Lady Dior',
    region: 'Global',
    metric: 'Brand Mention Lift',
    value: 67,
    trend: 'up',
    recommendation:
      'Amplify organic celebrity touchpoints through curated gifting around award season. Coordinate with PR on red-carpet strategy.',
    confidence: 0.87,
    date: '2026-02-10T12:30:00Z',
  },
  {
    id: 'sig-003',
    type: 'timing',
    title: 'Optimal window for Pre-Fall launch in Asia Pacific',
    region: 'Asia Pacific',
    metric: 'Launch Window Score',
    value: 88,
    trend: 'stable',
    recommendation:
      'Schedule Pre-Fall 2026 reveal for March 15-22 to avoid Lunar New Year wind-down and capitalize on spring shopping momentum in Seoul, Tokyo, and Shanghai.',
    confidence: 0.84,
    date: '2026-02-08T16:45:00Z',
  },
  {
    id: 'sig-004',
    type: 'competition',
    title: 'Chanel accelerating leather goods expansion',
    region: 'Europe',
    metric: 'Competitive Pressure Index',
    value: 73,
    trend: 'up',
    recommendation:
      'Reinforce Dior leather goods differentiation through heritage storytelling. Accelerate Saddle Bag relaunch timeline to maintain category leadership.',
    confidence: 0.79,
    date: '2026-02-06T10:15:00Z',
  },
  {
    id: 'sig-005',
    type: 'sentiment',
    title: 'Positive sentiment spike around Dior sustainability pledge',
    region: 'North America',
    metric: 'Net Sentiment Score',
    value: 82,
    trend: 'up',
    recommendation:
      'Double down on sustainability narrative in North American campaigns. Feature upcycled materials prominently in Spring editorial content.',
    confidence: 0.92,
    date: '2026-02-14T09:00:00Z',
  },
  {
    id: 'sig-006',
    type: 'demand',
    title: 'Declining interest in logo-heavy accessories',
    region: 'Asia Pacific',
    metric: 'Category Demand Index',
    value: -18,
    trend: 'down',
    recommendation:
      'Shift APAC accessory merchandising toward understated, monogram-subtle styles. Prioritize quiet luxury positioning for the region.',
    confidence: 0.86,
    date: '2026-02-11T14:20:00Z',
  },
];

// ============================================
// B19: AGI Concierge Config
// ============================================

export const mockBrandConciergeConfig: BrandConciergeConfig = {
  personality:
    'Refined and knowledgeable Dior brand ambassador with deep expertise in Maison heritage, couture craftsmanship, and contemporary collections. Speaks with elegant precision and warmth.',
  tone: 'formal',
  culturalAnchors: [
    'French haute couture tradition',
    'Italian artisan craftsmanship',
    'Parisian savoir-faire',
    'Mediterranean aesthetic sensibility',
  ],
  activeVisitors: 47,
  conversations: [
    {
      id: 'conv-001',
      visitorId: 'vis-8291',
      topic: 'Enquiry about Dior Privee made-to-measure evening gown for Monaco Grand Prix',
      status: 'active',
      sentiment: 'positive',
      startedAt: '2026-02-18T10:12:00Z',
    },
    {
      id: 'conv-002',
      visitorId: 'vis-4517',
      topic: 'Assistance selecting heritage-inspired bridal accessories from the Archive collection',
      status: 'active',
      sentiment: 'positive',
      startedAt: '2026-02-18T09:45:00Z',
    },
    {
      id: 'conv-003',
      visitorId: 'vis-6103',
      topic: 'Repair and restoration enquiry for vintage Dior Bar Jacket purchased at auction',
      status: 'escalated',
      sentiment: 'neutral',
      startedAt: '2026-02-17T16:30:00Z',
    },
  ],
  responseLanguages: ['French', 'English', 'Italian', 'Mandarin', 'Arabic', 'Japanese', 'Korean'],
  knowledgeBase: [
    'Dior Complete Collection Archive 1947-2026',
    'Maison Dior Heritage & Craftsmanship Guide',
    'Current Season Lookbook & Pricing',
    'Global Boutique Directory & Services',
    'Dior Privee Made-to-Measure Protocol',
    'After-Sales Care & Restoration Guidelines',
  ],
};

// ============================================
// B20: Brand Memory Imprint
// ============================================

export const mockMemoryImprints: MemoryImprint[] = [
  {
    id: 'mi-001',
    touchpoint: 'store_visit',
    label: 'Flagship Boutique Experience',
    recallScore: 92,
    emotionalResonance: 88,
    returnProbability: 76,
    sampleSize: 14200,
    period: '2026-Q1',
  },
  {
    id: 'mi-002',
    touchpoint: 'event',
    label: 'Dior Cruise 2026 Show Invitation',
    recallScore: 97,
    emotionalResonance: 95,
    returnProbability: 89,
    sampleSize: 3800,
    period: '2026-Q1',
  },
  {
    id: 'mi-003',
    touchpoint: 'online_browse',
    label: 'Dior.com Personalized Homepage',
    recallScore: 61,
    emotionalResonance: 54,
    returnProbability: 48,
    sampleSize: 287000,
    period: '2026-Q1',
  },
  {
    id: 'mi-004',
    touchpoint: 'purchase',
    label: 'First Haute Couture Purchase',
    recallScore: 98,
    emotionalResonance: 96,
    returnProbability: 91,
    sampleSize: 1250,
    period: '2026-Q1',
  },
  {
    id: 'mi-005',
    touchpoint: 'social_media',
    label: 'Behind-the-Scenes Atelier Content',
    recallScore: 72,
    emotionalResonance: 78,
    returnProbability: 55,
    sampleSize: 892000,
    period: '2026-Q1',
  },
];

// ============================================
// B21: Brand Digital Twin
// ============================================

export const mockBrandDigitalTwin: BrandDigitalTwin = {
  id: 'twin-dior-001',
  brandName: 'Dior',
  nodes: [
    {
      id: 'node-001',
      type: 'heritage',
      label: 'New Look 1947',
      connections: ['node-002', 'node-004', 'node-006'],
      strength: 0.97,
    },
    {
      id: 'node-002',
      type: 'collection',
      label: 'Cruise 2026',
      connections: ['node-001', 'node-003', 'node-005'],
      strength: 0.85,
    },
    {
      id: 'node-003',
      type: 'product',
      label: 'Lady Dior Bag',
      connections: ['node-001', 'node-002', 'node-004'],
      strength: 0.93,
    },
    {
      id: 'node-004',
      type: 'cultural',
      label: 'Parisian Femininity',
      connections: ['node-001', 'node-003', 'node-006'],
      strength: 0.91,
    },
    {
      id: 'node-005',
      type: 'collection',
      label: 'Dior Homme Spring 2026',
      connections: ['node-002', 'node-006'],
      strength: 0.78,
    },
    {
      id: 'node-006',
      type: 'heritage',
      label: 'Bar Jacket Silhouette',
      connections: ['node-001', 'node-004', 'node-005'],
      strength: 0.95,
    },
  ],
  metrics: {
    brandEquity: 94,
    culturalRelevance: 88,
    heritageStrength: 97,
    innovationIndex: 81,
    customerLoyalty: 86,
  },
  lastUpdated: '2026-02-17T22:00:00Z',
};

// ============================================
// B22: Cultural Brand Capital Engine (CBCE)
// ============================================

export const mockCulturalAuthority: CulturalAuthority[] = [
  {
    id: 'ca-001',
    dimension: 'Heritage',
    score: 96,
    maxScore: 100,
    trend: 'stable',
    risks: [
      'Over-reliance on archival references may limit perception of modernity among Gen Z audiences',
    ],
    recommendations: [
      'Introduce heritage-forward collaborations with emerging artists to bridge tradition and contemporary culture',
      'Develop immersive digital experiences around key archival moments',
    ],
    lastAssessed: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ca-002',
    dimension: 'Innovation',
    score: 79,
    maxScore: 100,
    trend: 'improving',
    risks: [
      'Competitors like Balenciaga and Loewe are investing heavily in tech-driven retail experiences',
      'Slow adoption of AI-powered personalization compared to LVMH sister brands',
    ],
    recommendations: [
      'Accelerate rollout of AR try-on across all product categories',
      'Launch pilot program for AI-curated personal shopping in top 10 flagship locations',
    ],
    lastAssessed: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ca-003',
    dimension: 'Craftsmanship',
    score: 94,
    maxScore: 100,
    trend: 'stable',
    risks: [
      'Aging artisan workforce in key ateliers with limited apprenticeship pipeline',
    ],
    recommendations: [
      'Expand Dior Metiers d\'Art apprenticeship program with recruitment in new regions',
      'Create documentary content series showcasing artisan techniques to reinforce brand value perception',
    ],
    lastAssessed: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ca-004',
    dimension: 'Cultural Relevance',
    score: 85,
    maxScore: 100,
    trend: 'improving',
    risks: [
      'Brand narrative may feel Eurocentric to growing Middle Eastern and African luxury consumer segments',
    ],
    recommendations: [
      'Deepen cultural partnerships in Riyadh, Lagos, and Mumbai through locally resonant creative directors',
      'Commission region-specific capsule collections that honor local craft traditions',
    ],
    lastAssessed: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ca-005',
    dimension: 'Sustainability',
    score: 71,
    maxScore: 100,
    trend: 'improving',
    risks: [
      'Greenwashing scrutiny intensifying across luxury sector',
      'Supply chain traceability gaps in exotic leather sourcing',
    ],
    recommendations: [
      'Publish fully audited supply chain transparency report by Q3 2026',
      'Set measurable targets for upcycled material usage in Ready-to-Wear and accelerate circular economy programs',
    ],
    lastAssessed: '2026-02-01T10:00:00Z',
  },
];

// ============================================
// B23: Boutique Performance Index (BPI)
// ============================================

export const mockBoutiquePerformances: BoutiquePerformance[] = [
  {
    boutiqueId: 'bout-001',
    name: 'Dior 30 Montaigne',
    city: 'Paris',
    region: 'Europe',
    scores: {
      experience: 96,
      conversion: 42,
      service: 94,
      ambiance: 98,
    },
    rank: 1,
    totalBoutiques: 235,
    revenue: 48200000,
    footfall: 312000,
    lastAudit: '2026-01-20T09:00:00Z',
  },
  {
    boutiqueId: 'bout-002',
    name: 'Dior Via Montenapoleone',
    city: 'Milan',
    region: 'Europe',
    scores: {
      experience: 91,
      conversion: 38,
      service: 89,
      ambiance: 93,
    },
    rank: 4,
    totalBoutiques: 235,
    revenue: 31500000,
    footfall: 198000,
    lastAudit: '2026-01-22T09:00:00Z',
  },
  {
    boutiqueId: 'bout-003',
    name: 'Dior Ginza',
    city: 'Tokyo',
    region: 'Asia Pacific',
    scores: {
      experience: 93,
      conversion: 51,
      service: 97,
      ambiance: 91,
    },
    rank: 2,
    totalBoutiques: 235,
    revenue: 42800000,
    footfall: 275000,
    lastAudit: '2026-01-25T09:00:00Z',
  },
  {
    boutiqueId: 'bout-004',
    name: 'Dior 57th Street',
    city: 'New York',
    region: 'North America',
    scores: {
      experience: 88,
      conversion: 45,
      service: 86,
      ambiance: 90,
    },
    rank: 7,
    totalBoutiques: 235,
    revenue: 37100000,
    footfall: 245000,
    lastAudit: '2026-01-18T09:00:00Z',
  },
];

// ============================================
// B24: Counterfeit Digital Detection (CDDI)
// ============================================

export const mockCounterfeitAlerts: CounterfeitAlert[] = [
  {
    id: 'cf-001',
    productId: 'prod-LD-2026',
    productName: 'Lady Dior Medium Lambskin',
    riskLevel: 'critical',
    source: 'DHgate Marketplace',
    sourceUrl: 'https://example.com/counterfeit/listing-9281',
    similarity: 0.94,
    detectedAt: '2026-02-15T07:22:00Z',
    status: 'investigating',
    region: 'Asia Pacific',
  },
  {
    id: 'cf-002',
    productId: 'prod-SD-2026',
    productName: 'Dior Saddle Bag Oblique Canvas',
    riskLevel: 'high',
    source: 'Instagram Marketplace',
    sourceUrl: 'https://example.com/counterfeit/listing-4457',
    similarity: 0.87,
    detectedAt: '2026-02-12T14:10:00Z',
    status: 'confirmed',
    region: 'North America',
  },
  {
    id: 'cf-003',
    productId: 'prod-BJ-2026',
    productName: 'Dior Bar Jacket Replica',
    riskLevel: 'medium',
    source: 'AliExpress',
    sourceUrl: 'https://example.com/counterfeit/listing-7730',
    similarity: 0.72,
    detectedAt: '2026-02-08T19:45:00Z',
    status: 'new',
    region: 'Europe',
  },
];

// ============================================
// B25: Global Drop Strategy Simulator (GDSS)
// ============================================

export const mockDropSimulations: DropSimulation[] = [
  {
    id: 'drop-001',
    dropName: 'Dior Riviera Summer 2026',
    collection: 'Summer 2026 Ready-to-Wear',
    launchDate: '2026-04-15T10:00:00Z',
    regions: [
      {
        region: 'Europe',
        demandScore: 89,
        optimalDate: '2026-04-15',
        estimatedSellThrough: 0.78,
        competitorActivity: 'medium',
      },
      {
        region: 'North America',
        demandScore: 84,
        optimalDate: '2026-04-18',
        estimatedSellThrough: 0.72,
        competitorActivity: 'high',
      },
      {
        region: 'Asia Pacific',
        demandScore: 91,
        optimalDate: '2026-04-12',
        estimatedSellThrough: 0.83,
        competitorActivity: 'low',
      },
      {
        region: 'Middle East',
        demandScore: 76,
        optimalDate: '2026-04-20',
        estimatedSellThrough: 0.65,
        competitorActivity: 'medium',
      },
    ],
    overallDemandForecast: 86,
    riskFactors: [
      'Gucci Summer campaign launches same week in North America',
      'Potential shipping delays through Suez Canal affecting Middle East delivery timelines',
      'Unseasonably cool spring forecast in Northern Europe may delay warm-weather purchases',
    ],
    recommendation:
      'Stagger the launch with Asia Pacific first on April 12, followed by Europe on April 15 and North America on April 18. Delay Middle East drop to April 20 to avoid Ramadan overlap. Prioritize digital channels for the first 48 hours to build exclusivity.',
    status: 'simulated',
    createdAt: '2026-02-10T13:00:00Z',
  },
  {
    id: 'drop-002',
    dropName: 'Dior x Hajime Sorayama Collaboration',
    collection: 'Limited Edition Capsule',
    launchDate: '2026-06-01T08:00:00Z',
    regions: [
      {
        region: 'Asia Pacific',
        demandScore: 97,
        optimalDate: '2026-06-01',
        estimatedSellThrough: 0.95,
        competitorActivity: 'low',
      },
      {
        region: 'North America',
        demandScore: 88,
        optimalDate: '2026-06-01',
        estimatedSellThrough: 0.82,
        competitorActivity: 'medium',
      },
      {
        region: 'Europe',
        demandScore: 82,
        optimalDate: '2026-06-03',
        estimatedSellThrough: 0.74,
        competitorActivity: 'low',
      },
    ],
    overallDemandForecast: 91,
    riskFactors: [
      'Limited production run may fuel resale market and dilute brand positioning',
      'Artist collaboration fatigue in the market following heavy 2025 competitor activity',
    ],
    recommendation:
      'Execute a simultaneous global digital drop on June 1 with physical exclusives at Tokyo Ginza and New York 57th Street flagships. Implement blockchain authentication for every piece to combat immediate resale counterfeiting.',
    status: 'draft',
    createdAt: '2026-02-16T09:30:00Z',
  },
];

// ============================================
// B26: Heritage Preservation AI (HPAI)
// ============================================

export const mockHeritageAssets: HeritageAsset[] = [
  {
    assetId: 'ha-001',
    name: 'Original Bar Suit',
    era: 'Post-War / New Look',
    year: 1947,
    significance: 'iconic',
    description:
      'The foundational piece of the Maison. Christian Dior\'s debut Bar Suit from the Spring 1947 "Corolle" collection that defined the New Look silhouette with its cinched waist and full skirt, revolutionizing post-war fashion.',
    digitalStatus: 'complete',
    preservationScore: 89,
    lastInspection: '2026-01-10T10:00:00Z',
    image: '/assets/heritage/bar-suit-1947.jpg',
  },
  {
    assetId: 'ha-002',
    name: 'Miss Dior Dress',
    era: 'Golden Age of Couture',
    year: 1949,
    significance: 'iconic',
    description:
      'Iconic evening gown from the Autumn/Winter 1949 "Trompe-l\'oeil" collection. A masterwork of draped silk faille with hand-sewn floral embroidery that took over 300 hours to complete in the Dior atelier.',
    digitalStatus: 'complete',
    preservationScore: 84,
    lastInspection: '2026-01-12T10:00:00Z',
    image: '/assets/heritage/miss-dior-1949.jpg',
  },
  {
    assetId: 'ha-003',
    name: 'Junon Ball Gown',
    era: 'Golden Age of Couture',
    year: 1949,
    significance: 'iconic',
    description:
      'Breathtaking ball gown composed of hundreds of hand-cut and hand-stitched iridescent petals in pale pink silk. Widely regarded as one of the most spectacular couture creations of the 20th century.',
    digitalStatus: 'processing',
    preservationScore: 78,
    lastInspection: '2025-11-20T10:00:00Z',
    image: '/assets/heritage/junon-1949.jpg',
  },
  {
    assetId: 'ha-004',
    name: 'Toile de Jouy Atelier Samples',
    era: 'Modern Revival',
    year: 2018,
    significance: 'important',
    description:
      'Original hand-painted toile samples by Maria Grazia Chiuri\'s design studio that reintroduced the Toile de Jouy motif as a modern Dior house code. These design development pieces bridge 18th-century French decorative arts with contemporary fashion.',
    digitalStatus: 'scanning',
    preservationScore: 95,
    lastInspection: '2026-02-01T10:00:00Z',
    image: '/assets/heritage/toile-de-jouy-2018.jpg',
  },
];

// ============================================
// B27: Ultra-Premium Client Genome (UPCG)
// ============================================

export const mockClientArchetypes: ClientArchetype[] = [
  {
    archetypeId: 'arch-001',
    label: 'The Heritage Connoisseur',
    description:
      'Ultra-high-net-worth clients who view Dior acquisitions as cultural investments. They prioritize heritage pieces, couture commissions, and archive-inspired limited editions. Deeply loyal with multi-generational brand relationships.',
    clientCount: 1840,
    preferences: [
      'Haute Couture',
      'Limited Editions',
      'Heritage Collections',
      'Private Trunk Shows',
      'Made-to-Measure',
    ],
    spendPattern: [
      { category: 'Haute Couture', percentage: 45, averageOrderValue: 42000 },
      { category: 'Leather Goods', percentage: 25, averageOrderValue: 8500 },
      { category: 'Fine Jewelry', percentage: 20, averageOrderValue: 28000 },
      { category: 'Ready-to-Wear', percentage: 10, averageOrderValue: 6200 },
    ],
    behaviorTraits: [
      {
        trait: 'Brand Loyalty',
        strength: 0.96,
        description: 'Extremely loyal; rarely purchases from competing maisons. Average relationship tenure exceeds 12 years.',
      },
      {
        trait: 'Event Attendance',
        strength: 0.88,
        description: 'Attends 80% of invited brand events including runway shows, private viewings, and Maison dinners.',
      },
      {
        trait: 'Digital Engagement',
        strength: 0.42,
        description: 'Prefers in-person boutique experiences. Minimal online purchasing; uses digital channels primarily for appointment booking.',
      },
    ],
    averageLifetimeValue: 2850000,
    retentionRate: 0.94,
  },
  {
    archetypeId: 'arch-002',
    label: 'The Digital Luxurist',
    description:
      'Affluent digital-native clients aged 25-38 who discover and purchase primarily through online and social channels. They value exclusivity, newness, and shareable brand moments. High velocity purchasers with strong seasonal spending patterns.',
    clientCount: 12400,
    preferences: [
      'Ready-to-Wear',
      'Sneakers & Streetwear',
      'Accessories',
      'Online Exclusives',
      'Collaboration Pieces',
    ],
    spendPattern: [
      { category: 'Ready-to-Wear', percentage: 35, averageOrderValue: 3800 },
      { category: 'Accessories', percentage: 30, averageOrderValue: 1900 },
      { category: 'Footwear', percentage: 25, averageOrderValue: 1400 },
      { category: 'Fragrances & Beauty', percentage: 10, averageOrderValue: 320 },
    ],
    behaviorTraits: [
      {
        trait: 'Digital Engagement',
        strength: 0.95,
        description: 'Highly active across all digital touchpoints. Follows brand on 3+ social platforms and opens 72% of CRM communications.',
      },
      {
        trait: 'Trend Responsiveness',
        strength: 0.91,
        description: 'Purchases within 48 hours of new drop announcements. Strong correlation between social media exposure and conversion.',
      },
      {
        trait: 'Brand Loyalty',
        strength: 0.63,
        description: 'Moderately loyal; cross-shops with Balenciaga, Loewe, and Bottega Veneta. Retainable through exclusive early access programs.',
      },
    ],
    averageLifetimeValue: 385000,
    retentionRate: 0.72,
  },
  {
    archetypeId: 'arch-003',
    label: 'The Occasion Collector',
    description:
      'High-net-worth clients who engage with the Maison around milestone life events -- weddings, galas, milestone birthdays, and business achievements. Spending is concentrated but substantial, with long dormant periods between purchases.',
    clientCount: 28600,
    preferences: [
      'Evening Wear',
      'Fine Jewelry',
      'Bridal',
      'Fragrances',
      'Gifting',
    ],
    spendPattern: [
      { category: 'Evening Wear', percentage: 40, averageOrderValue: 12500 },
      { category: 'Fine Jewelry', percentage: 30, averageOrderValue: 18000 },
      { category: 'Fragrances & Beauty', percentage: 15, averageOrderValue: 450 },
      { category: 'Leather Goods', percentage: 15, averageOrderValue: 4200 },
    ],
    behaviorTraits: [
      {
        trait: 'Purchase Frequency',
        strength: 0.35,
        description: 'Low frequency buyer averaging 2-3 transactions per year, concentrated around personal milestones and holiday gifting seasons.',
      },
      {
        trait: 'Service Dependency',
        strength: 0.89,
        description: 'Relies heavily on personal styling consultations. Conversion rate doubles when assigned a dedicated client advisor.',
      },
      {
        trait: 'Gifting Propensity',
        strength: 0.82,
        description: 'Over 40% of purchases are gifts for others. Highly responsive to curated gifting guides and engraving/personalization services.',
      },
    ],
    averageLifetimeValue: 620000,
    retentionRate: 0.78,
  },
];
