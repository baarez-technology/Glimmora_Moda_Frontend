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
  UHNIPriceOffer
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

export const mockBespokeOrders: BespokeOrder[] = [
  {
    id: 'bespoke-001',
    brandId: 'dior',
    brandName: 'Dior',
    type: 'made_to_measure',
    title: 'Custom Bar Jacket',
    description: 'Made-to-measure Bar Jacket with personalized monogram and custom fabric selection.',
    specifications: [
      { category: 'Fabric', label: 'Material', value: 'Wool-Silk Blend', notes: 'Custom ivory shade' },
      { category: 'Fabric', label: 'Lining', value: 'Silk Jacquard', notes: 'CD monogram pattern' },
      { category: 'Design', label: 'Button Style', value: 'Pearl CD Buttons' },
      { category: 'Design', label: 'Monogram', value: 'I.M.', notes: 'Interior label' }
    ],
    measurements: {
      chest: 88,
      waist: 68,
      hips: 92,
      shoulders: 38,
      sleeves: 60,
      length: 58
    },
    status: 'production',
    timeline: [
      { id: 'step-1', stage: 'consultation', title: 'Initial Consultation', description: 'Design preferences and measurements', status: 'completed', completedAt: '2024-01-05T10:00:00Z' },
      { id: 'step-2', stage: 'design_approval', title: 'Design Approval', description: 'Final design and fabric selection', status: 'completed', completedAt: '2024-01-12T14:00:00Z' },
      { id: 'step-3', stage: 'production', title: 'Production', description: 'Artisan crafting in Paris atelier', status: 'current', estimatedDate: '2024-02-15T00:00:00Z' },
      { id: 'step-4', stage: 'fitting', title: 'First Fitting', description: 'In-store fitting appointment', status: 'upcoming', estimatedDate: '2024-02-20T00:00:00Z' },
      { id: 'step-5', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Any necessary alterations', status: 'upcoming', estimatedDate: '2024-02-25T00:00:00Z' },
      { id: 'step-6', stage: 'complete', title: 'Complete', description: 'Ready for collection', status: 'upcoming', estimatedDate: '2024-03-01T00:00:00Z' }
    ],
    estimatedCompletion: '2024-03-01',
    price: 8500,
    depositPaid: 4250,
    depositPercentage: 50,
    atelierContact: 'atelier.paris@dior.com',
    progressImages: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
    ],
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-28T16:00:00Z'
  },
  {
    id: 'bespoke-002',
    brandId: 'dior',
    brandName: 'Dior',
    type: 'custom_design',
    title: 'Bespoke Evening Gown',
    description: 'One-of-a-kind evening gown for Monaco Gala, inspired by vintage Dior archives.',
    specifications: [
      { category: 'Design', label: 'Silhouette', value: 'A-Line Ball Gown' },
      { category: 'Fabric', label: 'Primary', value: 'Silk Duchess Satin', notes: 'Midnight blue' },
      { category: 'Fabric', label: 'Overlay', value: 'French Lace', notes: 'Hand-embroidered' },
      { category: 'Detail', label: 'Embellishment', value: 'Crystal beading' },
      { category: 'Detail', label: 'Train', value: 'Cathedral length' }
    ],
    measurements: {
      bust: 86,
      waist: 66,
      hips: 90,
      length: 150
    },
    status: 'design_approval',
    timeline: [
      { id: 'step-1', stage: 'consultation', title: 'Initial Consultation', description: 'Vision and inspiration discussion', status: 'completed', completedAt: '2024-01-20T11:00:00Z' },
      { id: 'step-2', stage: 'design_approval', title: 'Design Approval', description: 'Sketch review and fabric selection', status: 'current', estimatedDate: '2024-02-01T00:00:00Z' },
      { id: 'step-3', stage: 'production', title: 'Production', description: 'Haute Couture creation', status: 'upcoming', estimatedDate: '2024-03-15T00:00:00Z' },
      { id: 'step-4', stage: 'fitting', title: 'Fittings', description: 'Multiple fitting sessions', status: 'upcoming', estimatedDate: '2024-03-25T00:00:00Z' },
      { id: 'step-5', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Perfect finishing', status: 'upcoming', estimatedDate: '2024-04-05T00:00:00Z' },
      { id: 'step-6', stage: 'complete', title: 'Complete', description: 'Ready for Monaco Gala', status: 'upcoming', estimatedDate: '2024-04-15T00:00:00Z' }
    ],
    estimatedCompletion: '2024-04-15',
    price: 45000,
    depositPaid: 22500,
    depositPercentage: 50,
    atelierContact: 'haute.couture@dior.com',
    progressImages: [],
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z'
  },
  {
    id: 'bespoke-003',
    brandId: 'dior',
    brandName: 'Dior',
    type: 'modification',
    title: 'Lady Dior Customization',
    description: 'Personalized Lady Dior bag with custom hardware and monogram.',
    specifications: [
      { category: 'Base', label: 'Model', value: 'Lady Dior Medium' },
      { category: 'Material', label: 'Leather', value: 'Lambskin', notes: 'Powder pink' },
      { category: 'Hardware', label: 'Metal', value: 'Champagne Gold' },
      { category: 'Personalization', label: 'Charms', value: 'Custom D.I.O.R. + initials E.W.' }
    ],
    status: 'fitting',
    timeline: [
      { id: 'step-1', stage: 'consultation', title: 'Consultation', description: 'Customization options', status: 'completed', completedAt: '2024-01-10T15:00:00Z' },
      { id: 'step-2', stage: 'design_approval', title: 'Design Confirmation', description: 'Final specifications approved', status: 'completed', completedAt: '2024-01-14T10:00:00Z' },
      { id: 'step-3', stage: 'production', title: 'Production', description: 'Custom creation', status: 'completed', completedAt: '2024-01-25T16:00:00Z' },
      { id: 'step-4', stage: 'fitting', title: 'Quality Check', description: 'Final inspection and presentation', status: 'current', estimatedDate: '2024-01-30T00:00:00Z' },
      { id: 'step-5', stage: 'complete', title: 'Complete', description: 'Ready for delivery', status: 'upcoming', estimatedDate: '2024-02-01T00:00:00Z' }
    ],
    estimatedCompletion: '2024-02-01',
    price: 6200,
    depositPaid: 6200,
    depositPercentage: 100,
    progressImages: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'
    ],
    createdAt: '2024-01-10T15:00:00Z',
    updatedAt: '2024-01-28T09:00:00Z'
  }
];

// ============================================
// PRICE NEGOTIATIONS DATA
// ============================================

export const mockPriceNegotiations: PriceNegotiation[] = [
  {
    id: 'neg-001',
    productId: 'dior-lady-dior-small',
    productName: 'Lady Dior Small',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 4900,
    proposedPrice: 4200,
    status: 'pending',
    conciergeNotes: [
      'UHNI client with 5-year purchase history',
      'Lifetime value exceeds €250,000',
      'Considering bulk purchase of 3 items'
    ],
    createdAt: '2026-01-28T10:00:00Z',
    expiresAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'neg-002',
    productId: 'dior-book-tote',
    productName: 'Book Tote Large',
    productImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 3100,
    proposedPrice: 2600,
    counterOffer: 2850,
    status: 'counter_offered',
    conciergeNotes: [
      'New UHNI client',
      'First luxury purchase',
      'High potential for repeat business'
    ],
    createdAt: '2026-01-25T14:00:00Z',
    expiresAt: '2026-02-10T14:00:00Z'
  },
  {
    id: 'neg-003',
    productId: 'dior-bar-jacket',
    productName: 'Bar Jacket',
    productImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 3200,
    proposedPrice: 2800,
    status: 'approved',
    conciergeNotes: [
      'VIP client attending Fashion Week',
      'Will be photographed in the piece',
      'Strong brand ambassador potential'
    ],
    createdAt: '2024-01-20T09:00:00Z',
    expiresAt: '2024-01-27T09:00:00Z'
  },
  {
    id: 'neg-004',
    productId: 'dior-saddle-bag',
    productName: 'Saddle Bag',
    productImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 3500,
    proposedPrice: 2500,
    status: 'declined',
    conciergeNotes: [
      'Requested discount exceeds policy limits',
      'Suggested alternative from outlet collection'
    ],
    createdAt: '2024-01-22T11:00:00Z',
    expiresAt: '2024-01-29T11:00:00Z'
  }
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
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    accessLevel: 'uhni_only',
    products: [],
    previewDate: '2024-02-01T00:00:00Z',
    releaseDate: '2024-02-15T00:00:00Z',
    invitationRequired: false,
    hasAccess: true
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
    hasAccess: false
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
    hasAccess: false
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
        condition: 'excellent',
        price: 12500,
        originalPrice: 2800,
        provenance: 'Original purchase from Avenue Montaigne boutique',
        availableUntil: '2024-02-15T00:00:00Z',
        conciergeRecommendation: 'Highly recommend - excellent provenance and condition',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80']
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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
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
      { id: 'sec-3', type: 'image', content: '', mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', caption: 'The Dior atelier where Marie-Claire creates her masterpieces' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
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

// ============================================
// UHNI PRICE OFFERS DATA
// ============================================

export const mockUHNIOffers: UHNIPriceOffer[] = [
  {
    id: 'offer-001',
    type: 'product',
    targetId: 'dior-lady-dior-small',
    targetName: 'Lady Dior Small',
    targetImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: '2024-02-01T00:00:00Z',
    validUntil: '2024-02-14T23:59:59Z',
    claimed: false,
    conditions: ['UHNI tier only', 'One per client', 'Not combinable with other offers']
  },
  {
    id: 'offer-002',
    type: 'collection',
    targetId: 'col-icons',
    targetName: 'Icons Collection',
    targetImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2024-01-15T00:00:00Z',
    validUntil: '2024-02-28T23:59:59Z',
    claimed: true,
    conditions: ['Minimum purchase €5,000', 'UHNI tier only']
  },
  {
    id: 'offer-003',
    type: 'brand',
    targetId: 'dior',
    targetName: 'Dior',
    targetImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    discountType: 'fixed',
    discountValue: 500,
    validFrom: '2024-02-10T00:00:00Z',
    validUntil: '2024-02-17T23:59:59Z',
    claimed: false,
    conditions: ['Valentine\'s Day Special', 'Minimum purchase €3,000', 'Complimentary gift wrapping included']
  }
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

export function getUHNIOfferById(id: string): UHNIPriceOffer | undefined {
  return mockUHNIOffers.find(o => o.id === id);
}

export function getStylingSessionById(id: string): StylingSession | undefined {
  return mockStylingSessions.find(s => s.id === id);
}
