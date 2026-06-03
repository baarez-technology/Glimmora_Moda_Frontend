/**
 * Brand Portal Mock Data
 *
 * Mock data for the B2B Brand Partner Dashboard.
 * Uses Dior as the example enterprise partner.
 */

import type {
  BrandPartner,
  BrandProduct,
  BrandCollection,
  GlobalInventoryOverview,
  BrandAnalytics,
  DemandSignal,
  RecentActivity,
  InventoryAlert,
  BrandOrder,
  HeritageEvent,
  BrandStory,
  StylingSession
} from '@/types/brand-portal';

import type {
  BespokeOrder,
  PriceNegotiation,
  PrivateCollection,
  SourcingRequest,
} from '@/types/uhni';

// ============================================
// BRAND PARTNER DATA
// ============================================

export const mockBrandPartner: BrandPartner = {
  id: 'partner-dior-001',
  brandId: 'dior',
  brandName: 'Dior',
  brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Dior_Logo.svg/320px-Dior_Logo.svg.png',
  tier: 'enterprise',
  status: 'active',
  partnerSince: '2021-03-15',
  teamMembers: [
    {
      id: 'tm-001',
      name: 'Marie Laurent',
      email: 'marie.laurent@dior.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      lastActive: '2024-01-30T14:30:00Z'
    },
    {
      id: 'tm-002',
      name: 'Pierre Dubois',
      email: 'pierre.dubois@dior.com',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      lastActive: '2024-01-30T12:15:00Z'
    },
    {
      id: 'tm-003',
      name: 'Sophie Martin',
      email: 'sophie.martin@dior.com',
      role: 'analyst',
      lastActive: '2024-01-29T18:00:00Z'
    }
  ],
  apiKeys: [
    {
      id: 'key-001',
      name: 'Production API',
      keyPrefix: 'sk_live_dior_****',
      createdAt: '2023-06-01T00:00:00Z',
      lastUsed: '2024-01-30T14:25:00Z',
      permissions: ['read', 'write']
    },
    {
      id: 'key-002',
      name: 'Analytics Read-Only',
      keyPrefix: 'sk_live_dior_****',
      createdAt: '2023-09-15T00:00:00Z',
      lastUsed: '2024-01-30T10:00:00Z',
      permissions: ['read']
    }
  ],
  settings: {
    notifications: {
      lowStockAlerts: true,
      orderUpdates: true,
      demandSignals: true,
      weeklyReports: true
    },
    integration: {
      webhookUrl: 'https://api.dior.com/webhooks/modaglimmora',
      syncFrequency: 'realtime'
    },
    display: {
      currency: 'EUR',
      timezone: 'Europe/Paris',
      language: 'en'
    }
  }
};

// ============================================
// BRAND PRODUCTS DATA
// ============================================

export const mockBrandProducts: BrandProduct[] = [
  {
    id: 'dior-lady-dior-small',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Lady Dior Small',
    slug: 'lady-dior-small',
    tagline: 'An Icon of Elegance',
    description: 'The Lady Dior bag, created in 1995, has become a true icon of the House of Dior.',
    narrative: 'In 1995, Lady Diana was presented with this elegant creation...',
    price: 4900,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', alt: 'Lady Dior Small Black', type: 'hero' }
    ],
    variants: [
      { id: 'size-small', type: 'size', name: 'Small', value: 'small', available: true },
      { id: 'size-medium', type: 'size', name: 'Medium', value: 'medium', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-red', type: 'color', name: 'Cherry Red', value: '#8B2942', available: true }
    ],
    materials: [
      { name: 'Lambskin', composition: '100% Lambskin leather', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Cannage Quilting', description: 'Signature quilted pattern', duration: '3 hours' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 47,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 95, deliveryDays: 3 }
      ]
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['iconic', 'heritage', 'leather', 'evening'],
    visibility: 'public',
    experienceMode: 'iv_immersive',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: ['cannage-quilting', 'hand-stitching', 'lambskin'],
    status: 'published',
    sku: 'DLD-001-SM',
    totalStock: 47,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 15, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Europe', city: 'Milan', units: 12, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Tokyo', units: 10, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'New York', units: 3, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'Los Angeles', units: 7, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 92,
    performanceMetrics: {
      views: 12847,
      addToCart: 892,
      purchases: 234,
      conversionRate: 1.82,
      revenue: 1146600,
      avgTimeToDecision: 72
    },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z'
  },
  {
    id: 'dior-bar-jacket',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Bar Jacket',
    slug: 'bar-jacket',
    tagline: 'The New Look, Reimagined',
    description: 'First presented in 1947, the Bar Jacket defined feminine elegance.',
    narrative: 'The Bar Jacket is the heart of Dior\'s New Look revolution...',
    price: 3200,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', alt: 'Bar Jacket', type: 'hero' }
    ],
    variants: [
      { id: 'size-34', type: 'size', name: 'FR 34', value: '34', available: true },
      { id: 'size-36', type: 'size', name: 'FR 36', value: '36', available: true },
      { id: 'size-38', type: 'size', name: 'FR 38', value: '38', available: true },
      { id: 'color-ivory', type: 'color', name: 'Ivory', value: '#FAF8F5', available: true }
    ],
    materials: [
      { name: 'Wool-Silk Blend', composition: '70% Virgin Wool, 30% Silk', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Structured Shoulder', description: 'Carefully constructed padding', duration: '2 hours' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 24,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 98, deliveryDays: 2 }
      ]
    },
    collection: 'Autumn/Winter 2024',
    category: 'clothing',
    tags: ['tailoring', 'heritage', 'occasion'],
    visibility: 'public',
    experienceMode: 'iv_immersive',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: ['tailoring', 'couture', 'structured-shoulder'],
    status: 'published',
    sku: 'DBJ-001',
    totalStock: 24,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 10, lowStockThreshold: 3, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Europe', city: 'London', units: 8, lowStockThreshold: 3, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Hong Kong', units: 6, lowStockThreshold: 3, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 78,
    performanceMetrics: {
      views: 8234,
      addToCart: 456,
      purchases: 89,
      conversionRate: 1.08,
      revenue: 284800,
      avgTimeToDecision: 96
    },
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 'dior-saddle-bag',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Saddle Bag',
    slug: 'saddle-bag',
    tagline: 'Iconic Silhouette',
    description: 'The Saddle bag, designed by John Galliano in 1999.',
    narrative: 'A revolutionary design that challenged conventional bag shapes...',
    price: 3500,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80', alt: 'Saddle Bag', type: 'hero' }
    ],
    variants: [
      { id: 'size-medium', type: 'size', name: 'Medium', value: 'medium', available: true },
      { id: 'color-oblique', type: 'color', name: 'Oblique', value: '#8B6914', available: true }
    ],
    materials: [
      { name: 'Dior Oblique Canvas', composition: 'Coated canvas', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Pattern Placement', description: 'Precise oblique pattern alignment', duration: '2 hours' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 38,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 90, deliveryDays: 3 }
      ]
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['iconic', 'statement', 'everyday'],
    visibility: 'public',
    experienceMode: 'iv_immersive',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: ['pattern-alignment', 'oblique-canvas'],
    status: 'published',
    sku: 'DSB-001',
    totalStock: 38,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 14, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Seoul', units: 12, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'Miami', units: 12, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 85,
    performanceMetrics: {
      views: 10234,
      addToCart: 678,
      purchases: 156,
      conversionRate: 1.52,
      revenue: 546000,
      avgTimeToDecision: 48
    },
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2024-01-29T10:00:00Z'
  },
  {
    id: 'dior-j-adore-dress',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'J\'Adore Midi Dress',
    slug: 'j-adore-midi-dress',
    tagline: 'Effortless Elegance',
    description: 'A flowing silk midi dress embodying Dior\'s romantic spirit.',
    narrative: 'This dress captures the essence of Parisian elegance...',
    price: 4200,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', alt: 'J\'Adore Dress', type: 'hero' }
    ],
    variants: [
      { id: 'size-34', type: 'size', name: 'FR 34', value: '34', available: true },
      { id: 'size-36', type: 'size', name: 'FR 36', value: '36', available: false },
      { id: 'size-38', type: 'size', name: 'FR 38', value: '38', available: true },
      { id: 'color-champagne', type: 'color', name: 'Champagne', value: '#E8DCC4', available: true }
    ],
    materials: [
      { name: 'Silk Crepe', composition: '100% Silk', origin: 'France' }
    ],
    craftsmanship: [
      { title: 'Draping', description: 'Expert draping for flowing silhouette', duration: '4 hours' }
    ],
    ivEnabled: true,
    availability: {
      status: 'limited',
      quantity: 8,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 85, deliveryDays: 4 }
      ]
    },
    collection: 'Spring/Summer 2024',
    category: 'clothing',
    tags: ['evening', 'silk', 'romantic'],
    visibility: 'public',
    experienceMode: 'iv_immersive',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: ['draping', 'silk-crepe', 'hand-finished'],
    status: 'published',
    sku: 'DJD-001',
    totalStock: 8,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 4, lowStockThreshold: 3, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Europe', city: 'Milan', units: 2, lowStockThreshold: 3, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Tokyo', units: 2, lowStockThreshold: 3, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 88,
    performanceMetrics: {
      views: 6789,
      addToCart: 345,
      purchases: 67,
      conversionRate: 0.99,
      revenue: 281400,
      avgTimeToDecision: 120
    },
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2024-01-30T08:00:00Z'
  },
  {
    id: 'dior-walk-n-dior-sneaker',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Walk\'n\'Dior Sneaker',
    slug: 'walk-n-dior-sneaker',
    tagline: 'Casual Luxury',
    description: 'Luxury sneakers featuring the iconic Dior Oblique motif.',
    narrative: 'Where haute couture meets streetwear...',
    price: 990,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', alt: 'Walk\'n\'Dior', type: 'hero' }
    ],
    variants: [
      { id: 'size-36', type: 'size', name: 'EU 36', value: '36', available: true },
      { id: 'size-37', type: 'size', name: 'EU 37', value: '37', available: true },
      { id: 'size-38', type: 'size', name: 'EU 38', value: '38', available: true },
      { id: 'size-39', type: 'size', name: 'EU 39', value: '39', available: true },
      { id: 'color-blue', type: 'color', name: 'Dior Blue', value: '#4A5568', available: true }
    ],
    materials: [
      { name: 'Technical Canvas', composition: 'Dior Oblique technical fabric', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Assembly', description: 'Precision assembly of 40+ components', duration: '1.5 hours' }
    ],
    ivEnabled: false,
    availability: {
      status: 'available',
      quantity: 156,
      regions: [
        { region: 'Global', city: 'Worldwide', available: true, confidence: 95, deliveryDays: 5 }
      ]
    },
    collection: 'Accessories',
    category: 'shoes',
    tags: ['sneakers', 'casual', 'everyday'],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'direct_purchase',
    commerceEligible: true,
    craftTags: ['precision-assembly', 'oblique-canvas'],
    status: 'published',
    sku: 'DWD-001',
    totalStock: 156,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 45, lowStockThreshold: 15, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Europe', city: 'London', units: 32, lowStockThreshold: 10, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Tokyo', units: 38, lowStockThreshold: 15, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'New York', units: 41, lowStockThreshold: 15, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 94,
    performanceMetrics: {
      views: 24567,
      addToCart: 2345,
      purchases: 876,
      conversionRate: 3.57,
      revenue: 867240,
      avgTimeToDecision: 24
    },
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  },
  {
    id: 'dior-tribales-earrings',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Tribales Earrings',
    slug: 'tribales-earrings',
    tagline: 'Signature Pearl',
    description: 'Asymmetric pearl earrings with the iconic CD signature.',
    narrative: 'A modern interpretation of classic pearl jewelry...',
    price: 590,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', alt: 'Tribales Earrings', type: 'hero' }
    ],
    variants: [
      { id: 'color-gold', type: 'color', name: 'Gold', value: '#C9A962', available: true },
      { id: 'color-silver', type: 'color', name: 'Silver', value: '#C0C0C0', available: true }
    ],
    materials: [
      { name: 'Metal', composition: 'Gold-finish metal and resin pearls', origin: 'France' }
    ],
    craftsmanship: [
      { title: 'Pearl Setting', description: 'Hand-placed asymmetric pearls', duration: '45 minutes' }
    ],
    ivEnabled: false,
    availability: {
      status: 'available',
      quantity: 234,
      regions: [
        { region: 'Global', city: 'Worldwide', available: true, confidence: 99, deliveryDays: 3 }
      ]
    },
    collection: 'Jewelry',
    category: 'jewelry',
    tags: ['earrings', 'pearl', 'gift'],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'direct_purchase',
    commerceEligible: true,
    craftTags: ['pearl-setting', 'metal-finishing'],
    status: 'published',
    sku: 'DTE-001',
    totalStock: 234,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 78, lowStockThreshold: 20, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Shanghai', units: 89, lowStockThreshold: 25, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'New York', units: 67, lowStockThreshold: 20, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 76,
    performanceMetrics: {
      views: 18234,
      addToCart: 1567,
      purchases: 445,
      conversionRate: 2.44,
      revenue: 262550,
      avgTimeToDecision: 36
    },
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2024-01-29T14:00:00Z'
  },
  {
    id: 'dior-book-tote',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Book Tote',
    slug: 'book-tote',
    tagline: 'Modern Icon',
    description: 'The Book Tote has become a modern emblem of Dior.',
    narrative: 'Introduced by Maria Grazia Chiuri, the Book Tote represents the house\'s savoir-faire...',
    price: 3100,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', alt: 'Book Tote', type: 'hero' }
    ],
    variants: [
      { id: 'size-small', type: 'size', name: 'Small', value: 'small', available: true },
      { id: 'size-medium', type: 'size', name: 'Medium', value: 'medium', available: true },
      { id: 'size-large', type: 'size', name: 'Large', value: 'large', available: true },
      { id: 'color-oblique', type: 'color', name: 'Blue Oblique', value: '#4A5568', available: true },
      { id: 'color-toile', type: 'color', name: 'Toile de Jouy', value: '#FAF8F5', available: true }
    ],
    materials: [
      { name: 'Embroidered Canvas', composition: 'Dior Oblique embroidery', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Embroidery', description: 'Intricate Oblique pattern embroidery', duration: '5 hours' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 67,
      regions: [
        { region: 'Global', city: 'Worldwide', available: true, confidence: 92, deliveryDays: 4 }
      ]
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['tote', 'everyday', 'travel', 'statement'],
    visibility: 'public',
    experienceMode: 'iv_immersive',
    pricingVisibility: 'visible',
    commerceAction: 'add_to_considerations',
    commerceEligible: true,
    craftTags: ['oblique-embroidery', 'canvas', 'hand-finished'],
    status: 'published',
    sku: 'DBT-001',
    totalStock: 67,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 22, lowStockThreshold: 8, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Dubai', units: 18, lowStockThreshold: 6, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'New York', units: 15, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Singapore', units: 12, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 89,
    performanceMetrics: {
      views: 15678,
      addToCart: 1234,
      purchases: 312,
      conversionRate: 1.99,
      revenue: 967200,
      avgTimeToDecision: 56
    },
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2024-01-30T09:00:00Z'
  },
  {
    id: 'dior-miss-dior-pumps',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Miss Dior Pumps',
    slug: 'miss-dior-pumps',
    tagline: 'Timeless Femininity',
    description: 'Elegant pumps with the signature J\'Adior ribbon.',
    narrative: 'A tribute to the romantic elegance that defines Dior...',
    price: 890,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', alt: 'Miss Dior Pumps', type: 'hero' }
    ],
    variants: [
      { id: 'size-35', type: 'size', name: 'EU 35', value: '35', available: true },
      { id: 'size-36', type: 'size', name: 'EU 36', value: '36', available: true },
      { id: 'size-37', type: 'size', name: 'EU 37', value: '37', available: false },
      { id: 'size-38', type: 'size', name: 'EU 38', value: '38', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-nude', type: 'color', name: 'Nude', value: '#E8DCC4', available: true }
    ],
    materials: [
      { name: 'Patent Calfskin', composition: '100% Calfskin', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Ribbon Attachment', description: 'Hand-stitched J\'Adior ribbon', duration: '1 hour' }
    ],
    ivEnabled: false,
    availability: {
      status: 'available',
      quantity: 89,
      regions: [
        { region: 'Global', city: 'Worldwide', available: true, confidence: 88, deliveryDays: 5 }
      ]
    },
    collection: 'Shoes',
    category: 'shoes',
    tags: ['pumps', 'evening', 'classic'],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'direct_purchase',
    commerceEligible: true,
    craftTags: ['ribbon-attachment', 'patent-calfskin'],
    status: 'published',
    sku: 'DMP-001',
    totalStock: 89,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 32, lowStockThreshold: 10, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Europe', city: 'Milan', units: 24, lowStockThreshold: 8, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Tokyo', units: 18, lowStockThreshold: 8, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'Los Angeles', units: 15, lowStockThreshold: 5, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 72,
    performanceMetrics: {
      views: 11234,
      addToCart: 789,
      purchases: 198,
      conversionRate: 1.76,
      revenue: 176220,
      avgTimeToDecision: 48
    },
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-28T16:00:00Z'
  },
  {
    id: 'dior-30-montaigne-belt',
    brandId: 'dior',
    brandName: 'Dior',
    name: '30 Montaigne Belt',
    slug: '30-montaigne-belt',
    tagline: 'Signature Hardware',
    description: 'Leather belt with the iconic 30 Montaigne CD clasp.',
    narrative: 'Inspired by the address of Dior\'s flagship store...',
    price: 590,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: '30 Montaigne Belt', type: 'hero' }
    ],
    variants: [
      { id: 'size-75', type: 'size', name: '75cm', value: '75', available: true },
      { id: 'size-80', type: 'size', name: '80cm', value: '80', available: true },
      { id: 'size-85', type: 'size', name: '85cm', value: '85', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-tan', type: 'color', name: 'Tan', value: '#8B4513', available: true }
    ],
    materials: [
      { name: 'Calfskin', composition: '100% Calfskin', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Clasp Finishing', description: 'CD clasp with antique gold finish', duration: '30 minutes' }
    ],
    ivEnabled: false,
    availability: {
      status: 'available',
      quantity: 178,
      regions: [
        { region: 'Global', city: 'Worldwide', available: true, confidence: 96, deliveryDays: 3 }
      ]
    },
    collection: 'Accessories',
    category: 'accessories',
    tags: ['belt', 'leather', 'everyday'],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'direct_purchase',
    commerceEligible: true,
    craftTags: ['clasp-finishing', 'calfskin'],
    status: 'published',
    sku: 'DMB-001',
    totalStock: 178,
    regionalStock: [
      { region: 'Europe', city: 'Paris', units: 56, lowStockThreshold: 15, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Asia', city: 'Hong Kong', units: 48, lowStockThreshold: 15, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'New York', units: 42, lowStockThreshold: 12, lastUpdated: '2024-01-30T10:00:00Z' },
      { region: 'Americas', city: 'Miami', units: 32, lowStockThreshold: 10, lastUpdated: '2024-01-30T10:00:00Z' }
    ],
    demandScore: 68,
    performanceMetrics: {
      views: 8976,
      addToCart: 567,
      purchases: 234,
      conversionRate: 2.61,
      revenue: 138060,
      avgTimeToDecision: 24
    },
    createdAt: '2023-07-15T00:00:00Z',
    updatedAt: '2024-01-30T11:00:00Z'
  },
  {
    id: 'dior-dway-slides',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Dway Slides',
    slug: 'dway-slides',
    tagline: 'Relaxed Luxury',
    description: 'Embroidered slides perfect for resort and casual wear.',
    narrative: 'A relaxed take on luxury footwear...',
    price: 690,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80', alt: 'Dway Slides', type: 'hero' }
    ],
    variants: [
      { id: 'size-36', type: 'size', name: 'EU 36', value: '36', available: true },
      { id: 'size-37', type: 'size', name: 'EU 37', value: '37', available: true },
      { id: 'size-38', type: 'size', name: 'EU 38', value: '38', available: true },
      { id: 'size-39', type: 'size', name: 'EU 39', value: '39', available: true },
      { id: 'color-navy', type: 'color', name: 'Deep Blue', value: '#2C3E50', available: true }
    ],
    materials: [
      { name: 'Embroidered Cotton', composition: 'Cotton canvas with Oblique embroidery', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Embroidery', description: 'Dior Oblique pattern embroidery', duration: '2 hours' }
    ],
    ivEnabled: false,
    availability: {
      status: 'unavailable',
      quantity: 0,
      regions: []
    },
    collection: 'Resort 2025',
    category: 'shoes',
    tags: ['slides', 'casual', 'summer'],
    visibility: 'public',
    experienceMode: 'standard',
    pricingVisibility: 'visible',
    commerceAction: 'direct_purchase',
    commerceEligible: true,
    craftTags: ['oblique-embroidery', 'cotton-canvas'],
    status: 'draft',
    sku: 'DDS-001',
    totalStock: 0,
    regionalStock: [],
    demandScore: 0,
    performanceMetrics: {
      views: 0,
      addToCart: 0,
      purchases: 0,
      conversionRate: 0,
      revenue: 0,
      avgTimeToDecision: 0
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  }
];

// ============================================
// BRAND COLLECTIONS DATA
// ============================================

export const mockBrandCollections: BrandCollection[] = [
  {
    id: 'col-icons',
    name: 'Icons',
    slug: 'icons',
    season: 'Permanent',
    year: 2024,
    description: 'Timeless pieces that define the House of Dior.',
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    status: 'published',
    productIds: ['dior-lady-dior-small', 'dior-saddle-bag', 'dior-book-tote'],
    productCount: 3,
    totalRevenue: 2659800,
    viewCount: 38759,
    createdAt: '2021-03-15T00:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z'
  },
  {
    id: 'col-aw24',
    name: 'Autumn/Winter 2024',
    slug: 'autumn-winter-2024',
    season: 'Autumn/Winter',
    year: 2024,
    description: 'A celebration of Parisian elegance for the colder months.',
    heroImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
    status: 'published',
    productIds: ['dior-bar-jacket', 'dior-j-adore-dress'],
    productCount: 2,
    totalRevenue: 566200,
    viewCount: 15023,
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z'
  },
  {
    id: 'col-accessories',
    name: 'Accessories',
    slug: 'accessories',
    season: 'Permanent',
    year: 2024,
    description: 'Essential accessories to complete any look.',
    heroImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80',
    status: 'published',
    productIds: ['dior-tribales-earrings', 'dior-30-montaigne-belt', 'dior-walk-n-dior-sneaker', 'dior-miss-dior-pumps'],
    productCount: 4,
    totalRevenue: 1444070,
    viewCount: 63011,
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2024-01-30T11:00:00Z'
  },
  {
    id: 'col-resort25',
    name: 'Resort 2025',
    slug: 'resort-2025',
    season: 'Resort',
    year: 2025,
    description: 'Escape to elegance with our resort collection.',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    status: 'draft',
    productIds: ['dior-dway-slides'],
    productCount: 1,
    totalRevenue: 0,
    viewCount: 0,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  }
];

// ============================================
// GLOBAL INVENTORY DATA (G-SAIL)
// ============================================

export const mockGlobalInventory: GlobalInventoryOverview = {
  totalUnits: 1247,
  totalValue: 4682300,
  changePercent: 8.4,
  regions: [
    {
      region: 'Europe',
      totalUnits: 512,
      totalValue: 1924500,
      changePercent: 5.2,
      cities: [
        { city: 'Paris', units: 276, value: 1038200, changePercent: 4.8 },
        { city: 'Milan', units: 114, value: 428700, changePercent: 6.1 },
        { city: 'London', units: 122, value: 457600, changePercent: 5.0 }
      ]
    },
    {
      region: 'Asia',
      totalUnits: 468,
      totalValue: 1756800,
      changePercent: 12.5,
      cities: [
        { city: 'Tokyo', units: 156, value: 585900, changePercent: 15.2 },
        { city: 'Hong Kong', units: 102, value: 383100, changePercent: 10.8 },
        { city: 'Shanghai', units: 110, value: 413100, changePercent: 11.4 },
        { city: 'Seoul', units: 58, value: 217800, changePercent: 13.2 },
        { city: 'Singapore', units: 42, value: 157800, changePercent: 9.6 }
      ]
    },
    {
      region: 'Americas',
      totalUnits: 267,
      totalValue: 1001000,
      changePercent: 4.1,
      cities: [
        { city: 'New York', units: 108, value: 405600, changePercent: 3.8 },
        { city: 'Los Angeles', units: 73, value: 274100, changePercent: 4.5 },
        { city: 'Miami', units: 86, value: 321300, changePercent: 4.2 }
      ]
    }
  ],
  alerts: [
    {
      id: 'alert-001',
      type: 'low_stock',
      priority: 'high',
      productId: 'dior-lady-dior-small',
      productName: 'Lady Dior Small',
      region: 'Americas',
      city: 'New York',
      currentStock: 3,
      threshold: 5,
      message: 'Stock below threshold in New York boutique',
      createdAt: '2024-01-30T08:00:00Z'
    },
    {
      id: 'alert-002',
      type: 'low_stock',
      priority: 'medium',
      productId: 'dior-j-adore-dress',
      productName: 'J\'Adore Midi Dress',
      region: 'Europe',
      city: 'Milan',
      currentStock: 2,
      threshold: 3,
      message: 'Limited sizes available in Milan',
      createdAt: '2024-01-30T06:00:00Z'
    },
    {
      id: 'alert-003',
      type: 'restock_arriving',
      priority: 'low',
      productId: 'dior-saddle-bag',
      productName: 'Saddle Bag',
      region: 'Americas',
      city: 'Miami',
      currentStock: 12,
      message: 'Restock of 25 units arriving February 15',
      createdAt: '2024-01-29T14:00:00Z'
    },
    {
      id: 'alert-004',
      type: 'out_of_stock',
      priority: 'critical',
      productId: 'dior-bar-jacket',
      productName: 'Bar Jacket (Size FR 42)',
      region: 'Europe',
      city: 'Paris',
      currentStock: 0,
      message: 'Size FR 42 out of stock - high demand variant',
      createdAt: '2024-01-30T10:00:00Z'
    }
  ],
  lastSyncedAt: '2024-01-30T14:30:00Z'
};

// ============================================
// ANALYTICS DATA
// ============================================

export const mockBrandAnalytics: BrandAnalytics = {
  period: {
    start: '2024-01-01',
    end: '2024-01-30',
    label: 'January 2024'
  },
  revenue: {
    current: 2438500,
    previous: 2156200,
    changePercent: 13.1,
    currency: 'EUR',
    breakdown: [
      { category: 'bags', revenue: 1456800, percentage: 59.7 },
      { category: 'clothing', revenue: 478200, percentage: 19.6 },
      { category: 'shoes', revenue: 312400, percentage: 12.8 },
      { category: 'jewelry', revenue: 124800, percentage: 5.1 },
      { category: 'accessories', revenue: 66300, percentage: 2.8 }
    ]
  },
  orders: {
    totalOrders: 1847,
    changePercent: 11.2,
    averageOrderValue: 1320,
    aovChangePercent: 1.7,
    returnsCount: 42,
    returnRate: 2.3
  },
  demandSignals: [
    {
      id: 'ds-001',
      type: 'rising',
      category: 'bags',
      region: 'Asia',
      title: 'Bags trending in Asia Pacific',
      description: 'Bag category showing +24% growth in APAC region',
      changePercent: 24,
      confidence: 92,
      actionable: true,
      suggestedAction: 'Consider increasing APAC inventory allocation',
      createdAt: '2024-01-30T00:00:00Z'
    },
    {
      id: 'ds-002',
      type: 'seasonal',
      title: 'Valentine\'s Day Surge',
      description: 'Gift-appropriate items showing increased interest',
      changePercent: 45,
      confidence: 88,
      actionable: true,
      suggestedAction: 'Promote jewelry and small leather goods',
      createdAt: '2024-01-28T00:00:00Z'
    },
    {
      id: 'ds-003',
      type: 'trending',
      title: 'Walk\'n\'Dior Peak Demand',
      description: 'Sneakers maintaining highest conversion rate',
      changePercent: 18,
      confidence: 95,
      actionable: true,
      suggestedAction: 'Ensure adequate stock across all sizes',
      createdAt: '2024-01-29T00:00:00Z'
    },
    {
      id: 'ds-004',
      type: 'falling',
      category: 'accessories',
      region: 'Europe',
      title: 'Belt Category Softening',
      description: 'Belt sales down in European markets',
      changePercent: -8,
      confidence: 78,
      actionable: false,
      createdAt: '2024-01-27T00:00:00Z'
    }
  ],
  regionalMetrics: [
    { region: 'Europe', revenue: 975400, orders: 739, topProduct: 'Lady Dior Small', changePercent: 8.5 },
    { region: 'Asia', revenue: 926840, orders: 702, topProduct: 'Walk\'n\'Dior Sneaker', changePercent: 18.2 },
    { region: 'Americas', revenue: 536260, orders: 406, topProduct: 'Book Tote', changePercent: 9.4 }
  ],
  topProducts: [
    { id: 'dior-lady-dior-small', name: 'Lady Dior Small', sku: 'DLD-001-SM', revenue: 523600, units: 107, changePercent: 12.4 },
    { id: 'dior-walk-n-dior-sneaker', name: 'Walk\'n\'Dior Sneaker', sku: 'DWD-001', revenue: 387090, units: 391, changePercent: 22.1 },
    { id: 'dior-book-tote', name: 'Book Tote', sku: 'DBT-001', revenue: 344100, units: 111, changePercent: 15.8 },
    { id: 'dior-saddle-bag', name: 'Saddle Bag', sku: 'DSB-001', revenue: 245000, units: 70, changePercent: 8.3 },
    { id: 'dior-bar-jacket', name: 'Bar Jacket', sku: 'DBJ-001', revenue: 156800, units: 49, changePercent: 5.2 }
  ]
};

// ============================================
// RECENT ACTIVITY DATA
// ============================================

export const mockRecentActivity: RecentActivity[] = [
  {
    id: 'act-001',
    type: 'order',
    title: 'New Order #MG-28471',
    description: 'Lady Dior Small - Black - Paris Boutique',
    timestamp: '2024-01-30T14:15:00Z',
    metadata: { orderId: 'MG-28471', amount: 4900 }
  },
  {
    id: 'act-002',
    type: 'order',
    title: 'New Order #MG-28470',
    description: 'Walk\'n\'Dior Sneaker x2 - Tokyo',
    timestamp: '2024-01-30T13:45:00Z',
    metadata: { orderId: 'MG-28470', amount: 1980 }
  },
  {
    id: 'act-003',
    type: 'restock',
    title: 'Restock Completed',
    description: 'Tribales Earrings +50 units - Global',
    timestamp: '2024-01-30T12:00:00Z',
    metadata: { productId: 'dior-tribales-earrings', units: 50 }
  },
  {
    id: 'act-004',
    type: 'product_update',
    title: 'Product Updated',
    description: 'Book Tote - New color variant added',
    timestamp: '2024-01-30T10:30:00Z',
    metadata: { productId: 'dior-book-tote' }
  },
  {
    id: 'act-005',
    type: 'alert',
    title: 'Low Stock Alert',
    description: 'Lady Dior Small below threshold in NYC',
    timestamp: '2024-01-30T08:00:00Z',
    metadata: { alertId: 'alert-001' }
  },
  {
    id: 'act-006',
    type: 'order',
    title: 'New Order #MG-28469',
    description: 'J\'Adore Midi Dress - Milan',
    timestamp: '2024-01-30T07:30:00Z',
    metadata: { orderId: 'MG-28469', amount: 4200 }
  }
];

// ============================================
// ORDERS DATA
// ============================================

export const mockBrandOrders: BrandOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'MG-28471',
    status: 'confirmed',
    paymentStatus: 'paid',
    customer: {
      id: 'cust-001',
      name: 'Isabelle Moreau',
      email: 'isabelle.moreau@email.com',
      phone: '+33 6 12 34 56 78',
      tier: 'uhni'
    },
    items: [
      {
        productId: 'dior-lady-dior-small',
        productName: 'Lady Dior Small',
        sku: 'DLD-001-SM',
        variant: 'Black',
        quantity: 1,
        unitPrice: 4900,
        totalPrice: 4900
      }
    ],
    subtotal: 4900,
    shipping: 0,
    tax: 980,
    total: 5880,
    currency: 'EUR',
    shippingInfo: {
      address: '15 Avenue Montaigne',
      city: 'Paris',
      country: 'France',
      postalCode: '75008',
      method: 'Express Delivery',
      estimatedDelivery: '2024-02-02'
    },
    boutique: 'Paris Flagship',
    region: 'Europe',
    createdAt: '2024-01-30T14:15:00Z',
    updatedAt: '2024-01-30T14:15:00Z'
  },
  {
    id: 'ord-002',
    orderNumber: 'MG-28470',
    status: 'processing',
    paymentStatus: 'paid',
    customer: {
      id: 'cust-002',
      name: 'Yuki Tanaka',
      email: 'yuki.tanaka@email.jp',
      phone: '+81 90 1234 5678',
      tier: 'preferred'
    },
    items: [
      {
        productId: 'dior-walk-n-dior-sneaker',
        productName: 'Walk\'n\'Dior Sneaker',
        sku: 'DWD-001',
        variant: 'EU 37',
        quantity: 2,
        unitPrice: 990,
        totalPrice: 1980
      }
    ],
    subtotal: 1980,
    shipping: 50,
    tax: 198,
    total: 2228,
    currency: 'EUR',
    shippingInfo: {
      address: '2-4-1 Ginza',
      city: 'Tokyo',
      country: 'Japan',
      postalCode: '104-0061',
      method: 'International Express',
      trackingNumber: 'JP123456789',
      estimatedDelivery: '2024-02-05'
    },
    boutique: 'Tokyo Ginza',
    region: 'Asia',
    createdAt: '2024-01-30T13:45:00Z',
    updatedAt: '2024-01-30T13:45:00Z'
  },
  {
    id: 'ord-003',
    orderNumber: 'MG-28469',
    status: 'shipped',
    paymentStatus: 'paid',
    customer: {
      id: 'cust-003',
      name: 'Sophia Romano',
      email: 'sophia.romano@email.it',
      phone: '+39 02 1234 5678',
      tier: 'standard'
    },
    items: [
      {
        productId: 'dior-j-adore-dress',
        productName: 'J\'Adore Midi Dress',
        sku: 'DJD-001',
        variant: 'FR 36 - Champagne',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200
      }
    ],
    subtotal: 4200,
    shipping: 0,
    tax: 924,
    total: 5124,
    currency: 'EUR',
    shippingInfo: {
      address: 'Via Montenapoleone 12',
      city: 'Milan',
      country: 'Italy',
      postalCode: '20121',
      method: 'Express Delivery',
      trackingNumber: 'IT987654321',
      estimatedDelivery: '2024-02-01'
    },
    boutique: 'Milan Flagship',
    region: 'Europe',
    createdAt: '2024-01-30T07:30:00Z',
    updatedAt: '2024-01-30T10:00:00Z'
  },
  {
    id: 'ord-004',
    orderNumber: 'MG-28465',
    status: 'delivered',
    paymentStatus: 'paid',
    customer: {
      id: 'cust-004',
      name: 'Emma Williams',
      email: 'emma.williams@email.com',
      phone: '+1 212 555 0123',
      tier: 'uhni'
    },
    items: [
      {
        productId: 'dior-book-tote',
        productName: 'Book Tote',
        sku: 'DBT-001',
        variant: 'Large - Blue Oblique',
        quantity: 1,
        unitPrice: 3100,
        totalPrice: 3100
      },
      {
        productId: 'dior-tribales-earrings',
        productName: 'Tribales Earrings',
        sku: 'DTE-001',
        variant: 'Gold',
        quantity: 1,
        unitPrice: 590,
        totalPrice: 590
      }
    ],
    subtotal: 3690,
    shipping: 0,
    tax: 323,
    total: 4013,
    currency: 'EUR',
    shippingInfo: {
      address: '725 Fifth Avenue',
      city: 'New York',
      country: 'United States',
      postalCode: '10022',
      method: 'White Glove Delivery',
      trackingNumber: 'US456789123',
      estimatedDelivery: '2024-01-28'
    },
    boutique: 'New York Fifth Avenue',
    region: 'Americas',
    createdAt: '2024-01-25T16:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z'
  },
  {
    id: 'ord-005',
    orderNumber: 'MG-28460',
    status: 'pending',
    paymentStatus: 'pending',
    customer: {
      id: 'cust-005',
      name: 'Chen Wei',
      email: 'chen.wei@email.cn',
      tier: 'preferred'
    },
    items: [
      {
        productId: 'dior-saddle-bag',
        productName: 'Saddle Bag',
        sku: 'DSB-001',
        variant: 'Oblique',
        quantity: 1,
        unitPrice: 3500,
        totalPrice: 3500
      }
    ],
    subtotal: 3500,
    shipping: 75,
    tax: 455,
    total: 4030,
    currency: 'EUR',
    shippingInfo: {
      address: '88 Nanjing Road',
      city: 'Shanghai',
      country: 'China',
      postalCode: '200001',
      method: 'International Express',
      estimatedDelivery: '2024-02-08'
    },
    boutique: 'Shanghai Plaza 66',
    region: 'Asia',
    createdAt: '2024-01-30T09:00:00Z',
    updatedAt: '2024-01-30T09:00:00Z'
  },
  {
    id: 'ord-006',
    orderNumber: 'MG-28455',
    status: 'cancelled',
    paymentStatus: 'refunded',
    customer: {
      id: 'cust-006',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.es',
      tier: 'standard'
    },
    items: [
      {
        productId: 'dior-bar-jacket',
        productName: 'Bar Jacket',
        sku: 'DBJ-001',
        variant: 'FR 38 - Ivory',
        quantity: 1,
        unitPrice: 3200,
        totalPrice: 3200
      }
    ],
    subtotal: 3200,
    shipping: 0,
    tax: 672,
    total: 3872,
    currency: 'EUR',
    shippingInfo: {
      address: 'Paseo de Gracia 34',
      city: 'Barcelona',
      country: 'Spain',
      postalCode: '08007',
      method: 'Standard Delivery'
    },
    boutique: 'Barcelona Flagship',
    region: 'Europe',
    notes: 'Customer requested cancellation - size issue',
    createdAt: '2024-01-28T11:30:00Z',
    updatedAt: '2024-01-29T09:00:00Z'
  }
];

// ============================================
// DEMAND SIGNALS DATA
// ============================================

export const mockDemandSignals: DemandSignal[] = mockBrandAnalytics.demandSignals;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBrandProductById(id: string): BrandProduct | undefined {
  return mockBrandProducts.find(p => p.id === id);
}

export function getBrandProductBySku(sku: string): BrandProduct | undefined {
  return mockBrandProducts.find(p => p.sku === sku);
}

export function getBrandProductsByStatus(status: BrandProduct['status']): BrandProduct[] {
  return mockBrandProducts.filter(p => p.status === status);
}

export function getLowStockProducts(threshold: number = 10): BrandProduct[] {
  return mockBrandProducts.filter(p => p.totalStock > 0 && p.totalStock <= threshold);
}

export function getBrandCollectionById(id: string): BrandCollection | undefined {
  return mockBrandCollections.find(c => c.id === id);
}

export function getActiveAlerts(): InventoryAlert[] {
  return mockGlobalInventory.alerts.filter(a => !a.resolvedAt);
}

export function getBrandOrderById(id: string): BrandOrder | undefined {
  return mockBrandOrders.find(o => o.id === id);
}

export function getBrandOrderByNumber(orderNumber: string): BrandOrder | undefined {
  return mockBrandOrders.find(o => o.orderNumber === orderNumber);
}

export function getBrandOrdersByStatus(status: BrandOrder['status']): BrandOrder[] {
  return mockBrandOrders.filter(o => o.status === status);
}

// ============================================
// BESPOKE ORDERS DATA
// ============================================
// IDs are shared with UHNI side (src/data/uhni.ts) so both portals
// show the SAME orders from different perspectives.
//
// STATUS FLOW: consultation → design_approval → production → fitting → final_adjustments → complete
// ────────────────────────────────────────────────────────────

export const mockBespokeOrders: BespokeOrder[] = [

  // ── 1. CONSULTATION — new request, brand needs to schedule meeting ──
  {
    id: 'bespoke-001',
    brandId: 'dior',
    brandName: 'Dior',
    selectedBrands: [{ id: 'dior', name: 'Dior' }],
    type: 'made_to_measure',
    title: 'Custom Bar Jacket — Midnight Navy',
    description: 'Made-to-measure Bar Jacket in midnight navy Super 150s wool with personalized gold buttons bearing initials. Inspired by the 1947 New Look silhouette with modern proportions.',
    specifications: [],
    detailedSpec: {
      measurements: { chest: 88, waist: 68, hips: 94, shoulders: 38, sleeveLength: 60, height: 172, notes: 'Slightly asymmetric shoulders — right 0.5cm higher' },
      fabricPreferences: 'Super 150s wool from Loro Piana mill. Navy or midnight blue. Silk jacquard lining with Dior oblique pattern.',
      colorPreferences: 'Midnight navy exterior, ivory silk lining',
      referenceImages: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
      specialInstructions: 'Monogram "S.C." on interior label. Gold buttons engraved with initials. Nipped waist silhouette per classic Bar Jacket proportions.',
      occasionContext: 'Business formal — board meetings, client dinners, galas',
      deliveryDeadline: '2026-06-15',
    },
    measurements: { chest: 88, waist: 68, hips: 94, shoulders: 38, sleeveLength: 60 },
    status: 'consultation',
    timeline: [
      { id: 'bs1-step-1', stage: 'consultation', title: 'Initial Consultation', description: 'Meeting with client to discuss vision, fabric selection, and take precise measurements', status: 'current', estimatedDate: '2026-03-20T14:00:00Z', notes: 'Appointment scheduled at 30 Avenue Montaigne, Paris — 2:00 PM' },
      { id: 'bs1-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Present sketches, fabric swatches, and get client sign-off', status: 'upcoming', estimatedDate: '2026-04-03T00:00:00Z' },
      { id: 'bs1-step-3', stage: 'production', title: 'Atelier Production', description: 'Master tailors craft the piece at the Paris atelier (4-6 weeks)', status: 'upcoming', estimatedDate: '2026-05-15T00:00:00Z' },
      { id: 'bs1-step-4', stage: 'fitting', title: 'First Fitting', description: 'In-person fitting to check silhouette and proportions', status: 'upcoming', estimatedDate: '2026-05-22T00:00:00Z' },
      { id: 'bs1-step-5', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Fine-tuning after fitting — button placement, hem length, shoulder alignment', status: 'upcoming', estimatedDate: '2026-06-01T00:00:00Z' },
      { id: 'bs1-step-6', stage: 'complete', title: 'Delivery', description: 'White-glove delivery with garment bag and care documentation', status: 'upcoming', estimatedDate: '2026-06-15T00:00:00Z' },
    ],
    estimatedCompletion: '2026-06-15',
    price: 8500,
    depositPaid: 0,
    depositPercentage: 50,
    atelierContact: 'atelier.paris@dior.com',
    progressImages: [],
    messages: [
      { id: 'bs1-msg-1', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'I\'d like to commission a custom Bar Jacket in midnight navy. Inspired by the 1947 original but with modern proportions. I have a board dinner in June.', createdAt: '2026-03-11T09:00:00Z' },
      { id: 'bs1-msg-2', senderId: 'brand-user', senderName: 'Dior Atelier', senderRole: 'brand', content: 'Welcome! We\'d be delighted to create this for you. I\'ve reviewed your measurements and fabric preferences. Let\'s schedule your consultation at our Avenue Montaigne atelier — would March 20th at 2 PM work?', createdAt: '2026-03-12T11:00:00Z' },
      { id: 'bs1-msg-3', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'Perfect, March 20th works. Should I bring any reference photos or inspiration?', createdAt: '2026-03-12T14:00:00Z' },
      { id: 'bs1-msg-4', senderId: 'brand-user', senderName: 'Dior Atelier', senderRole: 'brand', content: 'Please bring any images you love. We\'ll have fabric swatches from our Loro Piana selection ready, plus our archive sketches of the classic Bar silhouette for reference.', createdAt: '2026-03-12T16:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs1-tl-1', status: 'consultation', note: 'Bespoke commission received — scheduling initial consultation', updatedBy: 'system', createdAt: '2026-03-11T09:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: false,
    createdAt: '2026-03-11T09:00:00Z',
    updatedAt: '2026-03-12T16:00:00Z',
  },

  // ── 2. DESIGN APPROVAL — sketches sent, waiting for client sign-off ──
  {
    id: 'bespoke-002',
    brandId: 'dior',
    brandName: 'Dior',
    selectedBrands: [{ id: 'dior', name: 'Dior' }],
    type: 'custom_design',
    title: 'Bespoke Evening Gown — Monaco Gala',
    description: 'One-of-a-kind evening gown for the Monaco Spring Gala, inspired by vintage Dior archives. A-line ball gown in midnight blue silk duchess satin with hand-embroidered French lace overlay and crystal beading.',
    specifications: [
      { category: 'Design', label: 'Silhouette', value: 'A-Line Ball Gown', notes: 'Inspired by 1953 Vivante line' },
      { category: 'Fabric', label: 'Primary', value: 'Silk Duchess Satin', notes: 'Midnight blue — custom dyed' },
      { category: 'Fabric', label: 'Overlay', value: 'French Chantilly Lace', notes: 'Hand-embroidered floral motif' },
      { category: 'Detail', label: 'Embellishment', value: 'Swarovski Crystal Beading', notes: 'Cascading from bodice to hip' },
      { category: 'Detail', label: 'Train', value: 'Cathedral Length (2m)', notes: 'Detachable for reception' },
    ],
    detailedSpec: {
      measurements: { chest: 86, waist: 66, hips: 90, height: 170, notes: 'Will wear 10cm heels — adjust hem accordingly' },
      fabricPreferences: 'Silk duchess satin in deep midnight blue. French lace for overlay — not machine-made. Crystal embellishment should be subtle, not overpowering.',
      colorPreferences: 'Midnight blue to navy spectrum. No black, no bright blue.',
      specialInstructions: 'Cathedral-length train must be detachable via hidden hooks for the reception. Built-in corset for support. Concealed pockets on both sides.',
      occasionContext: 'Monaco Spring Gala — May 5th black-tie event, 200 guests, outdoor terrace followed by indoor ballroom',
      deliveryDeadline: '2026-04-28',
    },
    measurements: { bust: 86, waist: 66, hips: 90 },
    status: 'design_approval',
    timeline: [
      { id: 'bs2-step-1', stage: 'consultation', title: 'Initial Consultation', description: 'Vision discussion — silhouette, fabric, and occasion requirements', status: 'completed', completedAt: '2026-02-10T11:00:00Z', notes: 'Client brought mood board with 1950s archive references' },
      { id: 'bs2-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Reviewing final sketches and fabric swatches — awaiting client sign-off', status: 'current', estimatedDate: '2026-03-15T00:00:00Z', notes: '3 design variations sent on Mar 5 — client leaning towards Variation B + C train' },
      { id: 'bs2-step-3', stage: 'production', title: 'Haute Couture Production', description: 'Hand-sewn by master seamstresses at the Haute Couture atelier (5-6 weeks)', status: 'upcoming', estimatedDate: '2026-04-10T00:00:00Z' },
      { id: 'bs2-step-4', stage: 'fitting', title: 'Fittings (2 Sessions)', description: 'Muslin toile fitting first, then final fabric fitting', status: 'upcoming', estimatedDate: '2026-04-17T00:00:00Z' },
      { id: 'bs2-step-5', stage: 'final_adjustments', title: 'Final Adjustments & Beading', description: 'Crystal application, hem finishing, and final press', status: 'upcoming', estimatedDate: '2026-04-24T00:00:00Z' },
      { id: 'bs2-step-6', stage: 'complete', title: 'Delivery', description: 'Delivered in custom garment case with care instructions', status: 'upcoming', estimatedDate: '2026-04-28T00:00:00Z' },
    ],
    estimatedCompletion: '2026-04-28',
    price: 45000,
    depositPaid: 22500,
    depositPercentage: 50,
    atelierContact: 'haute.couture@dior.com',
    progressImages: [],
    messages: [
      { id: 'bs2-msg-1', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'I need a show-stopping gown for the Monaco Spring Gala on May 5th. Thinking vintage Dior — the 1950s silhouettes.', createdAt: '2026-02-08T10:00:00Z' },
      { id: 'bs2-msg-2', senderId: 'brand-user', senderName: 'Dior Haute Couture', senderRole: 'brand', content: 'What a beautiful vision. We\'ve pulled references from the 1953 Vivante line and the 1957 Fuseau collection. Shall we meet Feb 10 to discuss in person?', createdAt: '2026-02-09T14:00:00Z' },
      { id: 'bs2-msg-3', senderId: 'brand-user', senderName: 'Dior Haute Couture', senderRole: 'brand', content: 'Following our consultation, we\'ve prepared 3 design variations. All feature the A-line silhouette, with different lace and beading options. Sketches sent — please confirm your preference so we can begin production.', createdAt: '2026-03-05T16:00:00Z' },
      { id: 'bs2-msg-4', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'These are stunning! I\'m leaning towards Variation B with the cascading crystals. Can we add the detachable train from Variation C?', createdAt: '2026-03-06T09:00:00Z' },
      { id: 'bs2-msg-5', senderId: 'brand-user', senderName: 'Dior Haute Couture', senderRole: 'brand', content: 'Absolutely — Variation B with the cathedral train is a wonderful combination. I\'ll update the final sketch. Once the client gives the green light, we\'ll begin sourcing the fabric immediately.', createdAt: '2026-03-06T15:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs2-tl-1', status: 'consultation', note: 'Haute couture commission received — evening gown for Monaco Gala', updatedBy: 'system', createdAt: '2026-02-08T10:00:00Z' },
      { id: 'bs2-tl-2', status: 'consultation', note: 'In-person consultation completed — silhouette and fabric direction confirmed', updatedBy: 'brand', createdAt: '2026-02-10T17:00:00Z' },
      { id: 'bs2-tl-3', status: 'design_approval', note: '3 design variations sent to client — awaiting selection and approval', updatedBy: 'brand', createdAt: '2026-03-05T16:00:00Z' },
    ],
    clientApprovalRequired: true,
    clientApproved: false,
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-03-06T15:00:00Z',
  },

  // ── 3. PRODUCTION — design approved, in the workshop ──────────────
  {
    id: 'bespoke-003',
    brandId: 'hermes',
    brandName: 'Hermès',
    selectedBrands: [{ id: 'hermes', name: 'Hermès' }],
    type: 'modification',
    title: 'Custom Kelly 28 — Rose Sakura with Gold Hardware',
    description: 'Personalized Hermès Kelly 28 Sellier in Rose Sakura Epsom leather with champagne gold hardware. Custom interior hot-stamping and a hand-painted strap.',
    specifications: [
      { category: 'Base', label: 'Model', value: 'Kelly 28 Sellier' },
      { category: 'Material', label: 'Leather', value: 'Epsom', notes: 'Rose Sakura — spring 2026 exclusive color' },
      { category: 'Hardware', label: 'Metal', value: 'Champagne Gold', notes: 'Brushed finish, not polished' },
      { category: 'Personalization', label: 'Hot Stamp', value: '"A.S." in gold foil', notes: 'Interior flap — 1cm height' },
      { category: 'Personalization', label: 'Strap', value: 'Hand-painted cherry blossom motif', notes: 'By the leather painting atelier' },
    ],
    measurements: {},
    status: 'production',
    timeline: [
      { id: 'bs3-step-1', stage: 'consultation', title: 'Consultation', description: 'Discussed customization options with private client team', status: 'completed', completedAt: '2026-01-20T10:00:00Z', notes: 'Client selected Rose Sakura from new seasonal palette' },
      { id: 'bs3-step-2', stage: 'design_approval', title: 'Design Confirmation', description: 'Approved final specifications — leather, hardware, hot-stamp placement', status: 'completed', completedAt: '2026-01-28T14:00:00Z', notes: 'Hand-painted strap design approved Jan 28' },
      { id: 'bs3-step-3', stage: 'production', title: 'Artisan Production', description: 'Single artisan crafting the Kelly over 18-25 hours at the Pantin atelier', status: 'current', estimatedDate: '2026-04-01T00:00:00Z', notes: 'Assigned to master saddler — leather cutting completed, stitching in progress' },
      { id: 'bs3-step-4', stage: 'fitting', title: 'Quality Inspection', description: 'Final quality check, hardware fitting, and hand-painted strap application', status: 'upcoming', estimatedDate: '2026-04-08T00:00:00Z' },
      { id: 'bs3-step-5', stage: 'final_adjustments', title: 'Final Touches', description: 'Hot-stamping, final conditioning, and presentation packaging', status: 'upcoming', estimatedDate: '2026-04-12T00:00:00Z' },
      { id: 'bs3-step-6', stage: 'complete', title: 'Delivery', description: 'Presented in signature orange box with documentation of provenance', status: 'upcoming', estimatedDate: '2026-04-18T00:00:00Z' },
    ],
    estimatedCompletion: '2026-04-18',
    price: 32000,
    depositPaid: 16000,
    depositPercentage: 50,
    atelierContact: 'private.clients@hermes.com',
    progressImages: [
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    ],
    messages: [
      { id: 'bs3-msg-1', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'I\'d love a Kelly 28 in the new Rose Sakura color. Can we add custom gold hardware and a hand-painted strap?', createdAt: '2026-01-18T09:00:00Z' },
      { id: 'bs3-msg-2', senderId: 'brand-user', senderName: 'Hermès Private Client', senderRole: 'brand', content: 'Rose Sakura is an excellent choice — exclusive to spring 2026. We can offer champagne gold hardware with a brushed finish. The hand-painted strap will be done by our leather painting atelier. Shall we discuss on Jan 20?', createdAt: '2026-01-19T11:00:00Z' },
      { id: 'bs3-msg-3', senderId: 'brand-user', senderName: 'Hermès Private Client', senderRole: 'brand', content: 'Production update: the Kelly has been assigned to one of our most experienced saddlers. Leather has been cut and hand-stitching with saddle stitch is underway. Estimated 3 more weeks for main construction.', createdAt: '2026-03-10T14:00:00Z' },
      { id: 'bs3-msg-4', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'Wonderful, thank you for the update! Can\'t wait to see the finished piece.', createdAt: '2026-03-10T16:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs3-tl-1', status: 'consultation', note: 'Custom Kelly request received — Rose Sakura with gold hardware', updatedBy: 'system', createdAt: '2026-01-18T09:00:00Z' },
      { id: 'bs3-tl-2', status: 'consultation', note: 'In-person consultation at Faubourg — customization options finalized', updatedBy: 'brand', createdAt: '2026-01-20T17:00:00Z' },
      { id: 'bs3-tl-3', status: 'design_approval', note: 'Design approved — leather, hardware, hot-stamp placement, and strap painting confirmed', updatedBy: 'brand', createdAt: '2026-01-28T14:00:00Z' },
      { id: 'bs3-tl-4', status: 'production', note: 'Production started — assigned to master saddler at Pantin atelier', updatedBy: 'brand', createdAt: '2026-02-15T10:00:00Z' },
      { id: 'bs3-tl-5', status: 'production', note: 'Leather cutting complete, hand-stitching in progress', updatedBy: 'brand', createdAt: '2026-03-10T14:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2026-01-18T09:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
  },

  // ── 4. FITTING — first fitting done, minor adjustments needed ─────
  {
    id: 'bespoke-004',
    brandId: 'bottega-veneta',
    brandName: 'Bottega Veneta',
    selectedBrands: [{ id: 'bottega-veneta', name: 'Bottega Veneta' }],
    type: 'made_to_measure',
    title: 'Custom Intrecciato Blazer — Cashmere',
    description: 'Made-to-measure blazer in Bottega Veneta\'s signature intrecciato-weave cashmere. Relaxed silhouette with custom mother-of-pearl buttons and silk lining.',
    specifications: [
      { category: 'Fabric', label: 'Material', value: 'Cashmere-Wool Blend', notes: 'Woven in intrecciato pattern — Vicenza atelier' },
      { category: 'Fabric', label: 'Color', value: 'Parakeet Green', notes: 'Bottega SS26 signature color' },
      { category: 'Fabric', label: 'Lining', value: 'Mulberry Silk', notes: 'Tonal contrast — deep forest green' },
      { category: 'Details', label: 'Buttons', value: 'Mother of Pearl', notes: 'Custom-cut, 2.5cm diameter' },
      { category: 'Fit', label: 'Silhouette', value: 'Relaxed Single-Breasted', notes: 'Slightly oversized through the shoulders' },
    ],
    detailedSpec: {
      measurements: { chest: 92, waist: 72, shoulders: 40, sleeveLength: 62, height: 175 },
      fabricPreferences: 'Intrecciato-weave cashmere. No synthetics. Mulberry silk lining.',
      colorPreferences: 'Parakeet green (SS26 color). Deep forest green lining.',
      specialInstructions: 'Relaxed but not oversized. Interior pocket large enough for a phone. No brand labels on exterior.',
      occasionContext: 'Smart casual — gallery openings, private dinners, weekend travel',
    },
    measurements: { chest: 92, waist: 72, shoulders: 40, sleeveLength: 62 },
    status: 'fitting',
    timeline: [
      { id: 'bs4-step-1', stage: 'consultation', title: 'Consultation', description: 'Met with MTM team in Milan — fabric and design direction', status: 'completed', completedAt: '2026-01-08T14:00:00Z', notes: 'Selected intrecciato cashmere and parakeet green from seasonal palette' },
      { id: 'bs4-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Approved design with fabric swatch and button selection', status: 'completed', completedAt: '2026-01-15T10:00:00Z', notes: 'Client approved after reviewing muslin prototype photos' },
      { id: 'bs4-step-3', stage: 'production', title: 'Production', description: 'Intrecciato weaving and blazer construction at the Vicenza atelier', status: 'completed', completedAt: '2026-02-28T16:00:00Z', notes: 'Weaving took 2 weeks longer than standard due to cashmere delicacy' },
      { id: 'bs4-step-4', stage: 'fitting', title: 'First Fitting', description: 'In-person fitting at Milan showroom — checking fit and proportions', status: 'current', estimatedDate: '2026-03-12T00:00:00Z', notes: 'Completed Mar 12 — sleeve +1cm, shoulder seam slightly forward needed' },
      { id: 'bs4-step-5', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Adjusting sleeve length and shoulder placement per fitting notes', status: 'upcoming', estimatedDate: '2026-03-22T00:00:00Z' },
      { id: 'bs4-step-6', stage: 'complete', title: 'Delivery', description: 'Shipped in signature packaging', status: 'upcoming', estimatedDate: '2026-03-28T00:00:00Z' },
    ],
    estimatedCompletion: '2026-03-28',
    price: 6800,
    depositPaid: 3400,
    depositPercentage: 50,
    atelierContact: 'mtm.milan@bottegaveneta.com',
    progressImages: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    ],
    messages: [
      { id: 'bs4-msg-1', senderId: 'brand-user', senderName: 'Bottega Veneta MTM', senderRole: 'brand', content: 'The blazer is ready for first fitting! Milan showroom reserved for March 12 at 11 AM. The intrecciato weave turned out beautifully.', createdAt: '2026-03-05T10:00:00Z' },
      { id: 'bs4-msg-2', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'Can\'t wait! I\'ll be there at 11.', createdAt: '2026-03-05T12:00:00Z' },
      { id: 'bs4-msg-3', senderId: 'brand-user', senderName: 'Bottega Veneta MTM', senderRole: 'brand', content: 'Thank you for coming to the fitting today! The blazer sits beautifully. Two small adjustments noted: +1cm on sleeve length and a slight forward shift of the shoulder seam. Will be completed within 10 days.', createdAt: '2026-03-12T15:00:00Z' },
      { id: 'bs4-msg-4', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'Agreed on both adjustments. The fabric feels incredible — the intrecciato texture is even more beautiful in person. Thank you!', createdAt: '2026-03-12T17:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs4-tl-1', status: 'consultation', note: 'Commission received — intrecciato cashmere blazer', updatedBy: 'system', createdAt: '2026-01-06T09:00:00Z' },
      { id: 'bs4-tl-2', status: 'consultation', note: 'Consultation at Milan showroom — fabric and design finalized', updatedBy: 'brand', createdAt: '2026-01-08T17:00:00Z' },
      { id: 'bs4-tl-3', status: 'design_approval', note: 'Design approved by client — muslin prototype confirmed', updatedBy: 'brand', createdAt: '2026-01-15T10:00:00Z' },
      { id: 'bs4-tl-4', status: 'production', note: 'Intrecciato weaving started at Vicenza atelier', updatedBy: 'brand', createdAt: '2026-01-22T10:00:00Z' },
      { id: 'bs4-tl-5', status: 'production', note: 'Construction complete — ready for fitting', updatedBy: 'brand', createdAt: '2026-02-28T16:00:00Z' },
      { id: 'bs4-tl-6', status: 'fitting', note: 'First fitting completed — minor adjustments needed: +1cm sleeves, shoulder seam shift', updatedBy: 'brand', createdAt: '2026-03-12T15:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2026-01-06T09:00:00Z',
    updatedAt: '2026-03-12T17:00:00Z',
  },

  // ── 5. FINAL ADJUSTMENTS — nearly complete, last touches ──────────
  {
    id: 'bespoke-005',
    brandId: 'gucci',
    brandName: 'Gucci',
    selectedBrands: [{ id: 'gucci', name: 'Gucci' }],
    type: 'custom_design',
    title: 'Custom Bamboo Handle Clutch — Evening Edition',
    description: 'Bespoke evening clutch featuring Gucci\'s iconic bamboo handle with custom python-print leather and hand-applied gold leaf interior.',
    specifications: [
      { category: 'Design', label: 'Shape', value: 'Envelope Clutch with Bamboo Clasp' },
      { category: 'Material', label: 'Exterior', value: 'Python-Print Calfskin', notes: 'Emerald green base with gold accent' },
      { category: 'Material', label: 'Interior', value: 'Suede with Gold Leaf Lining', notes: 'Hand-applied gold leaf — Florentine technique' },
      { category: 'Hardware', label: 'Clasp', value: 'Bamboo + 18k Gold Plated' },
      { category: 'Personalization', label: 'Initials', value: '"A.S." — blind embossed on interior flap' },
    ],
    measurements: {},
    status: 'final_adjustments',
    timeline: [
      { id: 'bs5-step-1', stage: 'consultation', title: 'Consultation', description: 'Discussed design at Gucci Garden, Florence', status: 'completed', completedAt: '2025-12-10T11:00:00Z', notes: 'Client wanted a modern take on the iconic bamboo handle' },
      { id: 'bs5-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Approved final design with leather and bamboo samples', status: 'completed', completedAt: '2025-12-20T14:00:00Z', notes: 'Selected emerald python-print after seeing 5 samples' },
      { id: 'bs5-step-3', stage: 'production', title: 'Production', description: 'Handcrafted at the Gucci ArtLab in Florence', status: 'completed', completedAt: '2026-02-14T16:00:00Z', notes: 'Gold leaf application took 3 additional days for precision' },
      { id: 'bs5-step-4', stage: 'fitting', title: 'Quality Review', description: 'Final quality inspection and bamboo clasp fitting', status: 'completed', completedAt: '2026-02-20T10:00:00Z', notes: 'Bamboo clasp realigned for smoother opening — 2mm adjustment' },
      { id: 'bs5-step-5', stage: 'final_adjustments', title: 'Final Touches', description: 'Blind embossing initials, final conditioning, and presentation prep', status: 'current', estimatedDate: '2026-03-18T00:00:00Z', notes: 'Embossing completed — leather conditioning and packaging in progress' },
      { id: 'bs5-step-6', stage: 'complete', title: 'Delivery', description: 'Delivered in Gucci signature box with artisan certificate', status: 'upcoming', estimatedDate: '2026-03-22T00:00:00Z' },
    ],
    estimatedCompletion: '2026-03-22',
    price: 4200,
    depositPaid: 4200,
    depositPercentage: 100,
    atelierContact: 'artlab.florence@gucci.com',
    progressImages: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    ],
    messages: [
      { id: 'bs5-msg-1', senderId: 'brand-user', senderName: 'Gucci ArtLab', senderRole: 'brand', content: 'Great news — production is complete! The gold leaf lining came out exquisitely. Proceeding with quality review and bamboo clasp fitting this week.', createdAt: '2026-02-14T16:00:00Z' },
      { id: 'bs5-msg-2', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'That\'s wonderful! Any photos of the gold leaf interior?', createdAt: '2026-02-15T09:00:00Z' },
      { id: 'bs5-msg-3', senderId: 'brand-user', senderName: 'Gucci ArtLab', senderRole: 'brand', content: 'Photos attached! The Florentine technique creates a beautiful organic pattern — each piece is unique. We also made a minor 2mm adjustment to the bamboo clasp for smoother opening.', createdAt: '2026-02-20T10:00:00Z' },
      { id: 'bs5-msg-4', senderId: 'brand-user', senderName: 'Gucci ArtLab', senderRole: 'brand', content: 'Final update: initials have been blind-embossed on the interior flap. We\'re doing final leather conditioning and preparing the presentation packaging. Expected delivery by March 22.', createdAt: '2026-03-14T11:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs5-tl-1', status: 'consultation', note: 'Bespoke clutch commission — bamboo handle with custom materials', updatedBy: 'system', createdAt: '2025-12-08T09:00:00Z' },
      { id: 'bs5-tl-2', status: 'design_approval', note: 'Design approved — emerald python-print with gold leaf interior', updatedBy: 'brand', createdAt: '2025-12-20T14:00:00Z' },
      { id: 'bs5-tl-3', status: 'production', note: 'Production started at Gucci ArtLab, Florence', updatedBy: 'brand', createdAt: '2026-01-10T10:00:00Z' },
      { id: 'bs5-tl-4', status: 'production', note: 'Gold leaf application complete — main construction finished', updatedBy: 'brand', createdAt: '2026-02-14T16:00:00Z' },
      { id: 'bs5-tl-5', status: 'fitting', note: 'Quality review complete — bamboo clasp realigned', updatedBy: 'brand', createdAt: '2026-02-20T10:00:00Z' },
      { id: 'bs5-tl-6', status: 'final_adjustments', note: 'Blind embossing done — conditioning and packaging in progress', updatedBy: 'brand', createdAt: '2026-03-14T11:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2025-12-08T09:00:00Z',
    updatedAt: '2026-03-14T11:00:00Z',
  },

  // ── 6. COMPLETE — fully delivered, end of lifecycle ────────────────
  {
    id: 'bespoke-006',
    brandId: 'dior',
    brandName: 'Dior',
    selectedBrands: [{ id: 'dior', name: 'Dior' }],
    type: 'modification',
    title: 'Lady Dior My ABCDior — Powder Pink Customization',
    description: 'Personalized Lady Dior in powder pink lambskin with custom champagne gold D.I.O.R. charms and hand-painted "S" initial charm. My ABCDior personalization program.',
    specifications: [
      { category: 'Base', label: 'Model', value: 'Lady Dior Medium' },
      { category: 'Material', label: 'Leather', value: 'Cannage Lambskin', notes: 'Powder pink' },
      { category: 'Hardware', label: 'Metal', value: 'Champagne Gold', notes: 'Light gold finish' },
      { category: 'Personalization', label: 'Charms', value: 'D.I.O.R. + Custom "S" Initial', notes: 'Hand-painted enamel "S" charm in navy blue' },
      { category: 'Personalization', label: 'Interior', value: 'Hot-stamped "For S.C. with love"', notes: 'Inside flap — gold foil' },
    ],
    measurements: {},
    status: 'complete',
    timeline: [
      { id: 'bs6-step-1', stage: 'consultation', title: 'Consultation', description: 'Discussed My ABCDior customization options at boutique', status: 'completed', completedAt: '2025-11-15T14:00:00Z', notes: 'Selected powder pink with champagne gold from customization palette' },
      { id: 'bs6-step-2', stage: 'design_approval', title: 'Design Confirmation', description: 'Approved charm selection and hot-stamp text', status: 'completed', completedAt: '2025-11-20T10:00:00Z', notes: 'Custom "S" charm to be hand-painted in navy enamel' },
      { id: 'bs6-step-3', stage: 'production', title: 'Production', description: 'Bag assembly and custom charm creation at the atelier', status: 'completed', completedAt: '2026-01-10T16:00:00Z', notes: 'Hand-painting the initial charm took extra care — beautiful result' },
      { id: 'bs6-step-4', stage: 'fitting', title: 'Quality Inspection', description: 'Final review of leather quality, hardware, and personalization', status: 'completed', completedAt: '2026-01-15T10:00:00Z', notes: 'Passed QC — all charms securely attached, hot-stamp crisp and centered' },
      { id: 'bs6-step-5', stage: 'final_adjustments', title: 'Final Preparation', description: 'Conditioning, packaging in gift box with ribbon', status: 'completed', completedAt: '2026-01-18T14:00:00Z', notes: 'Packaged with care card, dust bag, and charm maintenance guide' },
      { id: 'bs6-step-6', stage: 'complete', title: 'Delivered', description: 'White-glove delivery to client residence', status: 'completed', completedAt: '2026-01-22T11:00:00Z', notes: 'Delivered by private client courier — client delighted' },
    ],
    estimatedCompletion: '2026-01-22',
    price: 6200,
    depositPaid: 6200,
    depositPercentage: 100,
    atelierContact: 'my.abcdior@dior.com',
    progressImages: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    ],
    messages: [
      { id: 'bs6-msg-1', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'I\'d like to customize a Lady Dior as a gift for myself — powder pink with a personal initial charm.', createdAt: '2025-11-14T10:00:00Z' },
      { id: 'bs6-msg-2', senderId: 'brand-user', senderName: 'Dior My ABCDior', senderRole: 'brand', content: 'Lovely choice! We offer the My ABCDior personalization program. You can select your charms, hardware color, and even add a hand-painted initial. Shall we meet at the boutique?', createdAt: '2025-11-14T14:00:00Z' },
      { id: 'bs6-msg-3', senderId: 'brand-user', senderName: 'Dior My ABCDior', senderRole: 'brand', content: 'The Lady Dior has passed quality inspection! The hand-painted "S" charm is gorgeous — navy enamel against powder pink is a stunning contrast. Preparing packaging now.', createdAt: '2026-01-15T10:00:00Z' },
      { id: 'bs6-msg-4', senderId: 'uhni-user', senderName: 'Client', senderRole: 'client', content: 'It\'s absolutely perfect! Thank you so much — the hand-painted charm is even more beautiful than I imagined.', createdAt: '2026-01-22T14:00:00Z' },
      { id: 'bs6-msg-5', senderId: 'brand-user', senderName: 'Dior My ABCDior', senderRole: 'brand', content: 'We\'re so glad you love it! Remember, the charm maintenance guide is in your box. If you ever want to add new charms, we\'re here for you.', createdAt: '2026-01-22T16:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs6-tl-1', status: 'consultation', note: 'My ABCDior customization request received', updatedBy: 'system', createdAt: '2025-11-14T10:00:00Z' },
      { id: 'bs6-tl-2', status: 'consultation', note: 'Boutique consultation — powder pink, champagne gold, custom S charm selected', updatedBy: 'brand', createdAt: '2025-11-15T17:00:00Z' },
      { id: 'bs6-tl-3', status: 'design_approval', note: 'Design confirmed — charm layout and hot-stamp text approved by client', updatedBy: 'brand', createdAt: '2025-11-20T10:00:00Z' },
      { id: 'bs6-tl-4', status: 'production', note: 'Production started — bag assembly and custom charm painting', updatedBy: 'brand', createdAt: '2025-12-01T10:00:00Z' },
      { id: 'bs6-tl-5', status: 'production', note: 'Hand-painted initial charm completed — assembly in progress', updatedBy: 'brand', createdAt: '2025-12-20T14:00:00Z' },
      { id: 'bs6-tl-6', status: 'fitting', note: 'Quality inspection passed — all personalization verified', updatedBy: 'brand', createdAt: '2026-01-15T10:00:00Z' },
      { id: 'bs6-tl-7', status: 'final_adjustments', note: 'Final conditioning and gift packaging prepared', updatedBy: 'brand', createdAt: '2026-01-18T14:00:00Z' },
      { id: 'bs6-tl-8', status: 'complete', note: 'Delivered via white-glove courier — client confirmed receipt', updatedBy: 'brand', createdAt: '2026-01-22T11:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2025-11-14T10:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
  },
];

// ============================================
// PRICE NEGOTIATIONS DATA
// ============================================

export const mockPriceNegotiations: PriceNegotiation[] = [
  // ────────────────────────────────────────────────────────────
  // IDs are shared with UHNI side (src/data/uhni.ts) so both
  // portals show the SAME negotiations from different perspectives.
  //
  // FLOW: client proposes → brand responds (approve / counter / decline)
  //       if counter → client responds (accept / reject)
  // ────────────────────────────────────────────────────────────

  // STATE 1: PENDING — client proposed price, brand needs to respond
  // Brand action required: Approve, Counter, or Decline
  {
    id: 'neg-001',
    productId: 'dior-lady-dior-small',
    productName: 'Lady Dior Small — Cannage Lambskin',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 4900,
    proposedPrice: 4200,
    status: 'pending',
    clientMessage: 'I\'m purchasing 3 pieces this month for a personal wardrobe refresh. Would €4,200 work for the Lady Dior? Happy to commit to all 3 today.',
    conciergeNotes: [
      'UHNI client with 5-year purchase history, lifetime value €250k+',
      'Bulk purchase of 3 items — leverage for approval',
      'Client prefers quick resolution, responds within 24h'
    ],
    createdAt: '2026-03-11T10:00:00Z',
    expiresAt: '2026-03-25T10:00:00Z'
  },

  // STATE 2: PENDING (urgent) — expiring in 2 days, needs immediate brand attention
  {
    id: 'neg-002',
    productId: 'hermes-birkin-30',
    productName: 'Birkin 30 Togo Leather — Gold Hardware',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    brandName: 'Hermès',
    originalPrice: 21500,
    proposedPrice: 19500,
    status: 'pending',
    clientMessage: 'I\'ve been on the waitlist for 8 months. As a loyal client with 4 prior Hermès purchases, would €19,500 be possible?',
    conciergeNotes: [
      'URGENT: Expires in 2 days — brand response needed immediately',
      'Client has 4 prior Hermès purchases totalling €68,000',
      'Waitlisted 8 months — high risk of losing to competitor if declined'
    ],
    createdAt: '2026-03-01T14:00:00Z',
    expiresAt: '2026-03-15T14:00:00Z'
  },

  // STATE 3: COUNTER_OFFERED — brand sent counter price, waiting for client
  // Brand has responded, now waiting for client to accept or reject
  {
    id: 'neg-003',
    productId: 'dior-book-tote',
    productName: 'Book Tote Large — Toile de Jouy',
    productImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 3100,
    proposedPrice: 2600,
    counterOffer: 2850,
    status: 'counter_offered',
    clientMessage: 'First time purchasing Dior — would €2,600 be possible as a new client?',
    brandMessage: 'Welcome to the Dior family! We can offer €2,850 as a first-purchase courtesy, which includes complimentary gift wrapping and our signature Dior care kit.',
    respondedAt: '2026-03-10T15:00:00Z',
    conciergeNotes: [
      'New UHNI client — first luxury purchase through ModaGlimmora',
      'High potential for repeat business — converted from competitor platform',
      'Counter includes welcome gift package (care kit + wrapping)'
    ],
    createdAt: '2026-03-08T14:00:00Z',
    expiresAt: '2026-03-22T14:00:00Z'
  },

  // STATE 4: COUNTER_OFFERED — higher-value item, second round
  {
    id: 'neg-004',
    productId: 'bottega-cassette',
    productName: 'Cassette Bag — Padded Intrecciato Nappa',
    productImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    brandName: 'Bottega Veneta',
    originalPrice: 3800,
    proposedPrice: 3000,
    counterOffer: 3500,
    status: 'counter_offered',
    clientMessage: 'I love the Cassette — could we do €3,000? I\'m also eyeing the Pouch for next month.',
    brandMessage: 'We appreciate your interest in multiple pieces. We can offer €3,500 for the Cassette, with a priority reservation on the Pouch and 10% loyalty discount on your next purchase.',
    respondedAt: '2026-03-09T11:00:00Z',
    conciergeNotes: [
      'Client mentioned interest in Pouch too — cross-sell opportunity',
      'Counter includes 10% loyalty discount voucher for next purchase',
      'Brand is building relationship for multi-purchase client'
    ],
    createdAt: '2026-03-07T10:00:00Z',
    expiresAt: '2026-03-21T10:00:00Z'
  },

  // STATE 5: APPROVED — brand accepted client's price directly (no counter needed)
  {
    id: 'neg-005',
    productId: 'gucci-jackie-1961',
    productName: 'Jackie 1961 Medium Shoulder Bag',
    productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    brandName: 'Gucci',
    originalPrice: 3200,
    proposedPrice: 2800,
    status: 'approved',
    clientMessage: 'I\'m buying multiple items this season — would €2,800 be possible for the Jackie 1961?',
    brandMessage: 'Approved! As a valued multi-purchase client, we\'re delighted to honour this price. Your 12.5% discount reflects your loyalty.',
    respondedAt: '2026-03-09T15:30:00Z',
    conciergeNotes: [
      'Client is a high-volume buyer — 6 Gucci purchases in last 12 months',
      'Brand approved immediately — strong relationship',
      'Discount: €400 (12.5% off listed price)'
    ],
    createdAt: '2026-03-07T09:00:00Z',
    expiresAt: '2026-03-21T09:00:00Z'
  },

  // STATE 6: ACCEPTED — full cycle complete (proposed → countered → client accepted)
  {
    id: 'neg-006',
    productId: 'dior-j-adore-set',
    productName: "J'Adore Gift Set — Eau de Parfum + Travel Spray",
    productImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 420,
    proposedPrice: 350,
    counterOffer: 380,
    status: 'accepted',
    clientMessage: 'Buying as an anniversary gift — could we do €350?',
    brandMessage: 'We can offer €380 which includes complimentary engraving on the travel spray — a lovely personal touch for an anniversary.',
    respondedAt: '2026-03-06T09:00:00Z',
    conciergeNotes: [
      'Client accepted counter offer on Mar 7',
      'Engraving arranged: "With Love, A." on travel spray',
      'Final price: €380 (saved €40 / 9.5% off listed)'
    ],
    createdAt: '2026-03-04T10:00:00Z',
    expiresAt: '2026-03-18T10:00:00Z'
  },

  // STATE 7: DECLINED — brand rejected (discount too steep for core product)
  {
    id: 'neg-007',
    productId: 'lv-capucines-mm',
    productName: 'Capucines MM — Taurillon Leather',
    productImage: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=400&q=80',
    brandName: 'Louis Vuitton',
    originalPrice: 8900,
    proposedPrice: 6500,
    status: 'declined',
    clientMessage: 'Would €6,500 be possible for the Capucines? I saw a similar price at a competitor.',
    brandMessage: 'Thank you for your interest. The Capucines MM is a signature piece with fixed global pricing — we are unable to accommodate discounts on this item. We\'d be happy to suggest seasonal pieces with more flexibility.',
    respondedAt: '2026-03-05T16:00:00Z',
    conciergeNotes: [
      'Requested discount (27%) exceeds Louis Vuitton\'s strict no-discount policy on core leather goods',
      'Suggested alternative: explore seasonal items or pre-loved for better pricing',
      'LV maintains price parity globally — no exceptions on Capucines line'
    ],
    createdAt: '2026-03-03T11:00:00Z',
    expiresAt: '2026-03-17T11:00:00Z'
  },
];

// ============================================
// PRIVATE COLLECTIONS DATA
// ============================================

export const mockPrivateCollections: PrivateCollection[] = [
  {
    id: 'priv-col-001',
    name: 'Atelier Exclusives 2024',
    brandId: 'dior',
    brandName: 'Dior',
    description: 'A curated selection of limited-edition pieces available exclusively to our most valued clients. Each item is numbered and comes with a certificate of authenticity.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    accessLevel: 'uhni_only',
    products: [],
    previewDate: '2024-02-01T00:00:00Z',
    releaseDate: '2024-02-15T00:00:00Z',
    invitationRequired: false,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'priv-col-002',
    name: 'Heritage Archive Revival',
    brandId: 'dior',
    brandName: 'Dior',
    description: 'Reimagined classics from the Dior archives, meticulously recreated using original techniques and materials.',
    heroImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
    accessLevel: 'invitation',
    products: [],
    previewDate: '2024-03-01T00:00:00Z',
    releaseDate: '2024-03-15T00:00:00Z',
    invitationRequired: true,
    hasAccess: false,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'priv-col-003',
    name: 'Artisan Series: Japanese Craft',
    brandId: 'dior',
    brandName: 'Dior',
    description: 'A collaboration with Japanese master artisans, featuring traditional techniques applied to Dior classics.',
    heroImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
    accessLevel: 'request',
    products: [],
    previewDate: '2024-04-01T00:00:00Z',
    releaseDate: '2024-04-20T00:00:00Z',
    invitationRequired: false,
    hasAccess: false,
    customer_ids: [],
    requested_customers: [],
  }
];

// ============================================
// SOURCING REQUESTS DATA
// ============================================

export const mockBrandSourcingRequests: SourcingRequest[] = [
  {
    id: 'source-001',
    type: 'specific_item',
    status: 'sourcing',
    title: 'Vintage Lady Dior (1997)',
    description: 'Client seeking original Lady Dior from the Princess Diana era. Preferably in black lambskin with gold hardware. Museum-quality condition preferred.',
    referenceImages: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'
    ],
    budget: {
      min: 8000,
      max: 15000,
      flexible: true
    },
    deadline: '2024-03-15T00:00:00Z',
    conciergeNotes: [
      { id: 'note-1', author: 'concierge', content: 'Client is a collector specializing in vintage Dior. Very knowledgeable about authenticity markers.', timestamp: '2024-01-20T10:00:00Z' }
    ],
    foundOptions: [
      {
        id: 'opt-001',
        customDescription: 'Vintage Lady Dior Medium (1998), Black Cannage Lambskin',
        source: 'Verified Vintage Partner - Paris',
        condition: 'excellent' as const,
        price: 12500,
        originalPrice: 2800,
        provenance: 'Original purchase from Avenue Montaigne boutique',
        availableUntil: '2024-02-15T00:00:00Z',
        conciergeRecommendation: 'Highly recommend - excellent provenance and condition',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'],
        negotiationStatus: 'negotiating' as const,
        proposedPrice: 10500,
        negotiationNote: 'Lovely piece — would you consider €10,500 given the age? Happy to proceed quickly.',
      }
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z'
  },
  {
    id: 'source-002',
    type: 'occasion',
    status: 'pending',
    title: 'Met Gala 2024 Ensemble',
    description: 'Client attending Met Gala requires complete look. Theme: "Garden of Time". Open to both current collection and archive pieces.',
    budget: {
      min: 50000,
      max: 150000,
      flexible: true
    },
    deadline: '2024-04-01T00:00:00Z',
    occasion: 'Met Gala 2024',
    conciergeNotes: [
      { id: 'note-1', author: 'concierge', content: 'A-list client with significant media presence. This is a PR opportunity.', timestamp: '2024-01-25T09:00:00Z' }
    ],
    foundOptions: [],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z'
  },
  {
    id: 'source-003',
    type: 'category',
    status: 'options_found',
    title: 'Statement Jewelry for Anniversary',
    description: 'Client seeking exceptional Dior fine jewelry piece for 25th wedding anniversary gift. Preference for pieces with sapphires or diamonds.',
    budget: {
      min: 20000,
      max: 50000,
      flexible: false
    },
    deadline: '2024-02-14T00:00:00Z',
    occasion: 'Anniversary',
    conciergeNotes: [
      { id: 'note-1', author: 'concierge', content: 'Time-sensitive - anniversary is Feb 14th', timestamp: '2024-01-22T11:00:00Z' }
    ],
    foundOptions: [
      {
        id: 'opt-002',
        customDescription: 'Dior Rose des Vents Necklace - White Gold & Diamonds',
        source: 'Dior Fine Jewelry - Place Vendôme',
        condition: 'new',
        price: 35000,
        availableUntil: '2024-02-10T00:00:00Z',
        conciergeRecommendation: 'Beautiful piece, timeless design',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80']
      },
      {
        id: 'opt-003',
        customDescription: 'Dior et Moi Sapphire & Diamond Ring',
        source: 'Dior Fine Jewelry - Place Vendôme',
        condition: 'new',
        price: 42000,
        availableUntil: '2024-02-10T00:00:00Z',
        conciergeRecommendation: 'Exceptional piece, very limited availability',
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80']
      }
    ],
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-27T15:00:00Z'
  }
];

// ============================================
// HERITAGE EVENTS DATA
// ============================================

export const mockHeritageEvents: HeritageEvent[] = [
  {
    id: 'heritage-001',
    brandId: 'dior',
    year: 1947,
    title: 'The New Look',
    description: 'Christian Dior revolutionizes fashion with his debut collection.',
    longDescription: 'On February 12, 1947, Christian Dior presented his first collection at 30 Avenue Montaigne. The "Corolle" line, nicknamed the "New Look" by Harper\'s Bazaar editor Carmel Snow, featured rounded shoulders, cinched waists, and full skirts that used up to 20 meters of fabric. This revolutionary silhouette marked a dramatic departure from wartime austerity and established Dior as a defining force in haute couture.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    significance: 'milestone',
    relatedProducts: ['dior-bar-jacket'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'heritage-002',
    brandId: 'dior',
    year: 1995,
    title: 'Lady Dior is Born',
    description: 'The iconic Lady Dior bag is created and named after Princess Diana.',
    longDescription: 'Originally named "Chouchou," this quilted handbag became an instant icon when Princess Diana began carrying it in 1995. The bag was officially renamed "Lady Dior" in her honor in 1996. Its distinctive cannage quilting, inspired by the Napoleon III chairs used in Dior\'s first fashion show, and the iconic D.I.O.R. charms have made it one of the most recognizable luxury bags in the world.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    significance: 'collection',
    relatedProducts: ['dior-lady-dior-small'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'heritage-003',
    brandId: 'dior',
    year: 1999,
    title: 'The Saddle Bag Debut',
    description: 'John Galliano introduces the revolutionary Saddle Bag.',
    longDescription: 'Creative Director John Galliano introduced the Saddle Bag in his Spring 2000 collection. Its distinctive curved shape, inspired by equestrian saddles, challenged conventional bag design and became a defining accessory of the early 2000s. The bag was relaunched in 2018 and continues to be a bestseller.',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
    significance: 'innovation',
    relatedProducts: ['dior-saddle-bag'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'heritage-004',
    brandId: 'dior',
    year: 2017,
    title: 'Maria Grazia Chiuri Appointment',
    description: 'First female Creative Director in Dior\'s history.',
    longDescription: 'Maria Grazia Chiuri becomes the first woman to lead Dior\'s creative direction, bringing a feminist perspective to the house. Her debut collection featured the now-iconic "We Should All Be Feminists" T-shirt, and she introduced the Book Tote, which has become a modern Dior classic.',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    significance: 'milestone',
    relatedProducts: ['dior-book-tote'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'heritage-005',
    brandId: 'dior',
    year: 2022,
    title: 'Sustainability Initiative',
    description: 'Launch of eco-responsible practices across all ateliers.',
    longDescription: 'Dior announces comprehensive sustainability commitments, including the use of 85% traceable materials and the elimination of single-use plastics. The brand also launches partnerships with artisan communities worldwide to preserve traditional craftsmanship.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    significance: 'innovation',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// ============================================
// BRAND STORIES DATA
// ============================================

export const mockBrandStories: BrandStory[] = [
  {
    id: 'story-001',
    brandId: 'dior',
    title: 'The Art of Cannage',
    type: 'craftsmanship',
    excerpt: 'Discover the intricate craft behind Dior\'s signature quilted pattern, a technique perfected over seven decades.',
    content: [
      { id: 'sec-1', type: 'text', content: 'The Cannage pattern, inspired by the Napoleon III chairs used in Christian Dior\'s first fashion show in 1947, has become one of the most recognizable design elements in luxury fashion.' },
      { id: 'sec-2', type: 'image', content: '', mediaUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', caption: 'Lady Dior featuring the iconic Cannage quilting' },
      { id: 'sec-3', type: 'text', content: 'Each Lady Dior bag requires over 3 hours of meticulous hand-stitching to create the perfect quilted pattern. The artisans in our Florentine workshops have trained for years to master this technique.' },
      { id: 'sec-4', type: 'quote', content: 'Every stitch tells a story of dedication and artistry that spans generations.', caption: 'Master Artisan, Dior Leather Goods Atelier' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    publishedAt: '2024-01-15T10:00:00Z',
    status: 'published',
    relatedProducts: ['dior-lady-dior-small'],
    readTime: 5,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'story-002',
    brandId: 'dior',
    title: 'The Bar Jacket: 75 Years of Revolution',
    type: 'heritage',
    excerpt: 'How one jacket changed fashion forever and continues to inspire designers today.',
    content: [
      { id: 'sec-1', type: 'text', content: 'When Christian Dior presented his Bar Jacket in 1947, he didn\'t just create a garment—he created a revolution. The jacket\'s nipped waist and padded hips celebrated femininity in a way that post-war fashion had forgotten.' },
      { id: 'sec-2', type: 'image', content: '', mediaUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', caption: 'The timeless silhouette of the Bar Jacket' },
      { id: 'sec-3', type: 'timeline', content: '1947: Original debut | 1997: 50th anniversary edition | 2017: Maria Grazia Chiuri\'s reinterpretation | 2022: 75th anniversary celebration' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
    publishedAt: '2024-01-20T10:00:00Z',
    status: 'published',
    relatedProducts: ['dior-bar-jacket'],
    readTime: 7,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'story-003',
    brandId: 'dior',
    title: 'Meet the Artisan: Marie-Claire\'s 40 Years',
    type: 'artisan',
    excerpt: 'A portrait of dedication: one woman\'s four-decade journey as a Dior seamstress.',
    content: [
      { id: 'sec-1', type: 'text', content: 'Marie-Claire Dubois joined the Dior atelier in 1984, fresh from her apprenticeship in Lyon. Today, at 62, she is one of the most respected "petites mains" in haute couture.' },
      { id: 'sec-2', type: 'quote', content: 'I have sewn gowns for princesses, movie stars, and brides. But every piece receives the same love and attention. That is what Dior means to me.', caption: 'Marie-Claire Dubois, Master Seamstress' },
      { id: 'sec-3', type: 'image', content: '', mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', caption: 'The Dior atelier where Marie-Claire creates her masterpieces' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    status: 'draft',
    relatedProducts: [],
    readTime: 6,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 'story-004',
    brandId: 'dior',
    title: 'Spring/Summer 2024: A Garden in Bloom',
    type: 'collection',
    excerpt: 'Explore the inspirations behind Maria Grazia Chiuri\'s latest collection.',
    content: [
      { id: 'sec-1', type: 'text', content: 'For Spring/Summer 2024, Maria Grazia Chiuri drew inspiration from the gardens of Christian Dior\'s childhood home in Granville. The collection features botanical prints, delicate embroidery, and a palette of garden greens and floral hues.' },
      { id: 'sec-2', type: 'image', content: '', mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', caption: 'Floral motifs dominate the Spring/Summer 2024 collection' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    publishedAt: '2024-01-22T10:00:00Z',
    status: 'published',
    relatedProducts: ['dior-j-adore-dress'],
    readTime: 4,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z'
  }
];

export const _removedUHNIOffers = [

  // ── 1. PRODUCT — active, unclaimed, percentage discount ───────────
  {
    id: 'offer-001',
    type: 'product',
    targetId: 'dior-lady-dior-small',
    targetName: 'Lady Dior Small — Cannage Lambskin',
    targetImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    productSlug: 'dior-lady-dior-small',
    brandName: 'Dior',
    discountType: 'percentage',
    discountValue: 15,
    originalPrice: 4900,
    validFrom: '2026-03-10T00:00:00Z',
    validUntil: '2026-03-31T23:59:59Z',
    conditions: ['UHNI clients only', 'One per client', 'Not combinable with other offers'],
    isPrivate: false,
    claimedCount: 3,
    maxClaims: 20,
    claimed: false,
  },

  // ── 2. COLLECTION — active, unclaimed, fixed discount ─────────────
  {
    id: 'offer-002',
    type: 'collection',
    targetId: 'dior-spring-2026',
    targetName: 'Dior Spring 2026 Preview',
    targetImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    brandName: 'Dior',
    discountType: 'fixed',
    discountValue: 500,
    originalPrice: 0,
    validFrom: '2026-03-08T00:00:00Z',
    validUntil: '2026-04-07T23:59:59Z',
    conditions: ['Valid on first purchase from collection', 'Minimum spend €2,000', 'Cannot combine with other offers'],
    isPrivate: false,
    claimedCount: 8,
    maxClaims: 50,
    claimed: false,
  },

  // ── 3. BRAND-WIDE — active, unclaimed, percentage, unlimited claims ─
  {
    id: 'offer-003',
    type: 'brand',
    targetId: 'gucci',
    targetName: 'Gucci',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    brandName: 'Gucci',
    discountType: 'percentage',
    discountValue: 10,
    originalPrice: 0,
    validFrom: '2026-03-06T00:00:00Z',
    validUntil: '2026-04-03T23:59:59Z',
    conditions: ['Valid on full-price items only', 'Minimum purchase €1,500', 'Loyalty tier reward — recurring quarterly'],
    isPrivate: false,
    claimedCount: 12,
    maxClaims: 0, // unlimited
    claimed: false,
  },

  // ── 4. PRODUCT — already claimed by client ────────────────────────
  {
    id: 'offer-004',
    type: 'product',
    targetId: 'bottega-cassette',
    targetName: 'Cassette Bag — Padded Intrecciato',
    targetImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    productSlug: 'bottega-cassette',
    brandName: 'Bottega Veneta',
    discountType: 'percentage',
    discountValue: 12,
    originalPrice: 3800,
    validFrom: '2026-03-03T00:00:00Z',
    validUntil: '2026-03-23T23:59:59Z',
    conditions: ['One per client', 'Includes complimentary dust bag'],
    isPrivate: false,
    claimedCount: 7,
    maxClaims: 15,
    claimed: true,
    claimedBy: ['uhni-user'],
  },

  // ── 5. PRIVATE — targeted to specific UHNI clients only ───────────
  {
    id: 'offer-005',
    type: 'product',
    targetId: 'hermes-silk-scarf',
    targetName: 'Hermès Carré 90 — Grand Manège',
    targetImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    productSlug: 'hermes-silk-scarf',
    brandName: 'Hermès',
    discountType: 'fixed',
    discountValue: 100,
    originalPrice: 450,
    validFrom: '2026-03-12T00:00:00Z',
    validUntil: '2026-03-27T23:59:59Z',
    conditions: ['Private invitation — selected based on purchase history', 'One per client', 'Cannot be transferred'],
    isPrivate: true,
    targetClientIds: ['uhni-user'],
    claimedCount: 0,
    maxClaims: 1,
    claimed: false,
  },

  // ── 6. EXPIRING SOON — less than 2 days remaining ─────────────────
  {
    id: 'offer-006',
    type: 'brand',
    targetId: 'dior',
    targetName: 'Dior',
    targetImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    brandName: 'Dior',
    discountType: 'fixed',
    discountValue: 300,
    originalPrice: 0,
    validFrom: '2026-03-01T00:00:00Z',
    validUntil: '2026-03-14T23:59:59Z',
    conditions: ['Spring Weekend Special', 'Minimum purchase €2,500', 'Complimentary gift wrapping included'],
    isPrivate: false,
    claimedCount: 18,
    maxClaims: 25,
    claimed: false,
  },

  // ── 7. NEARLY FULL — only 1 claim remaining ──────────────────────
  {
    id: 'offer-007',
    type: 'product',
    targetId: 'gucci-jackie-1961',
    targetName: 'Jackie 1961 Medium Shoulder Bag',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    productSlug: 'gucci-jackie-1961',
    brandName: 'Gucci',
    discountType: 'percentage',
    discountValue: 20,
    originalPrice: 3200,
    validFrom: '2026-03-07T00:00:00Z',
    validUntil: '2026-03-21T23:59:59Z',
    conditions: ['Flash offer — limited availability', 'One per client', 'While stock lasts'],
    isPrivate: false,
    claimedCount: 4,
    maxClaims: 5,
    claimed: false,
  },

  // ── 8. UPCOMING — starts in 4 days (brand can see, client cannot yet) ──
  {
    id: 'offer-008',
    type: 'collection',
    targetId: 'bottega-summer-2026',
    targetName: 'Bottega Veneta Summer 2026',
    targetImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    brandName: 'Bottega Veneta',
    discountType: 'percentage',
    discountValue: 8,
    originalPrice: 0,
    validFrom: '2026-03-17T00:00:00Z',
    validUntil: '2026-04-16T23:59:59Z',
    conditions: ['Early access preview for UHNI clients', 'Minimum purchase €3,000'],
    isPrivate: false,
    claimedCount: 0,
    maxClaims: 30,
    claimed: false,
  },

  // ── 9. EXPIRED — ended yesterday (brand can see in history) ───────
  {
    id: 'offer-009',
    type: 'brand',
    targetId: 'hermes',
    targetName: 'Hermès',
    targetImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    brandName: 'Hermès',
    discountType: 'percentage',
    discountValue: 5,
    originalPrice: 0,
    validFrom: '2026-02-26T00:00:00Z',
    validUntil: '2026-03-12T23:59:59Z',
    conditions: ['Winter appreciation offer', 'Full-price items only'],
    isPrivate: false,
    claimedCount: 22,
    maxClaims: 0, // unlimited
    claimed: false,
  },
];

// ============================================
// STYLING SESSIONS DATA
// ============================================

export const mockStylingSessions: StylingSession[] = [
  {
    id: 'session-001',
    brandId: 'dior',
    scheduledAt: '2026-02-05T10:00:00Z',
    duration: 90,
    type: 'in_store',
    status: 'scheduled',
    notes: 'Client interested in complete wardrobe refresh for Spring season. Focus on professional attire.',
    customerId: 'cust-001',
    customerName: 'Isabelle Moreau',
    customerEmail: 'isabelle.moreau@email.com',
    customerTier: 'uhni',
    location: 'Dior 30 Avenue Montaigne, Paris',
    stylistName: 'Sophie Beaumont',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'session-002',
    brandId: 'dior',
    scheduledAt: '2026-02-08T14:00:00Z',
    duration: 60,
    type: 'virtual',
    status: 'scheduled',
    notes: 'Virtual consultation for evening wear selection. Client based in Tokyo.',
    customerId: 'cust-002',
    customerName: 'Yuki Tanaka',
    customerEmail: 'yuki.tanaka@email.jp',
    customerTier: 'preferred',
    stylistName: 'Marie Laurent',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z'
  },
  {
    id: 'session-003',
    brandId: 'dior',
    scheduledAt: '2026-02-10T11:00:00Z',
    duration: 120,
    type: 'home',
    status: 'scheduled',
    notes: 'Home visit for trunk show preview. Selection of 15 pieces from upcoming collection.',
    customerId: 'cust-004',
    customerName: 'Emma Williams',
    customerEmail: 'emma.williams@email.com',
    customerTier: 'uhni',
    location: '725 Fifth Avenue, New York, NY',
    stylistName: 'Pierre Dubois',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'session-004',
    brandId: 'dior',
    scheduledAt: '2024-01-25T15:00:00Z',
    duration: 90,
    type: 'in_store',
    status: 'completed',
    notes: 'Bridal consultation - mother of the bride outfit selection. Purchased Bar Jacket and accessories.',
    customerId: 'cust-003',
    customerName: 'Sophia Romano',
    customerEmail: 'sophia.romano@email.it',
    customerTier: 'standard',
    location: 'Dior Via Montenapoleone, Milan',
    stylistName: 'Giulia Ferretti',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-25T17:00:00Z'
  },
  {
    id: 'session-005',
    brandId: 'dior',
    scheduledAt: '2024-01-28T10:00:00Z',
    duration: 60,
    type: 'virtual',
    status: 'cancelled',
    notes: 'Client had schedule conflict - to be rescheduled',
    customerId: 'cust-005',
    customerName: 'Chen Wei',
    customerEmail: 'chen.wei@email.cn',
    customerTier: 'preferred',
    stylistName: 'Li Wei',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-27T09:00:00Z'
  }
];

// ============================================
// HELPER FUNCTIONS FOR NEW DATA
// ============================================

export function getBespokeOrderById(id: string): BespokeOrder | undefined {
  return mockBespokeOrders.find(o => o.id === id);
}

export function getNegotiationById(id: string): PriceNegotiation | undefined {
  return mockPriceNegotiations.find(n => n.id === id);
}

export function getPrivateCollectionById(id: string): PrivateCollection | undefined {
  return mockPrivateCollections.find(c => c.id === id);
}

export function getSourcingRequestById(id: string): SourcingRequest | undefined {
  return mockBrandSourcingRequests.find(r => r.id === id);
}

export function getHeritageEventById(id: string): HeritageEvent | undefined {
  return mockHeritageEvents.find(e => e.id === id);
}

export function getBrandStoryById(id: string): BrandStory | undefined {
  return mockBrandStories.find(s => s.id === id);
}

export function getStylingSessionById(id: string): StylingSession | undefined {
  return mockStylingSessions.find(s => s.id === id);
}
