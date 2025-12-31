import { Brand, Product, Collection, BrandStory, User, ConsiderationItem, AvailabilityIntelligence, CompleteOutfit, FitConfidence, DigitalBodyTwin, WardrobeAnalysis, FashionPassport, UserPreferences, CalendarEvent, CalendarConnection, PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, UHNIProfile, AutonomousActivity, UserTier } from '@/types';

// ============================================
// BRANDS
// ============================================

export const brands: Brand[] = [
  {
    id: 'dior',
    name: 'Dior',
    slug: 'dior',
    tagline: 'The Art of Elegance Since 1946',
    description: 'Founded by Christian Dior, the House of Dior has been setting the standard for haute couture and ready-to-wear fashion for over seven decades.',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    logoUrl: '/images/brands/dior-logo.svg',
    heritage: {
      founded: 1946,
      founder: 'Christian Dior',
      origin: 'Paris, France',
      story: 'In 1947, Christian Dior revolutionized fashion with his first collection, featuring the iconic "New Look" silhouette that celebrated femininity with its nipped waists and full skirts.'
    },
    collections: [],
    stories: []
  },
  {
    id: 'gucci',
    name: 'Gucci',
    slug: 'gucci',
    tagline: 'Redefining Luxury for the Modern World',
    description: 'From Florence to the world, Gucci represents the pinnacle of Italian craftsmanship combined with contemporary vision.',
    heroImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&q=80',
    logoUrl: '/images/brands/gucci-logo.svg',
    heritage: {
      founded: 1921,
      founder: 'Guccio Gucci',
      origin: 'Florence, Italy',
      story: 'Beginning as a small leather goods shop in Florence, Gucci has evolved into one of the world\'s most influential luxury fashion houses.'
    },
    collections: [],
    stories: []
  },
  {
    id: 'bottega-veneta',
    name: 'Bottega Veneta',
    slug: 'bottega-veneta',
    tagline: 'When Your Own Initials Are Enough',
    description: 'Known for its signature intrecciato weave, Bottega Veneta epitomizes understated luxury and exceptional craftsmanship.',
    heroImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&q=80',
    logoUrl: '/images/brands/bottega-logo.svg',
    heritage: {
      founded: 1966,
      founder: 'Michele Taddei',
      origin: 'Vicenza, Italy',
      story: 'Founded in the Veneto region of Italy, Bottega Veneta has built its reputation on exceptional leather craftsmanship and the iconic intrecciato technique.'
    },
    collections: [],
    stories: []
  },
  {
    id: 'hermes',
    name: 'Hermès',
    slug: 'hermes',
    tagline: 'Artisan Contemporary Since 1837',
    description: 'From equestrian beginnings to global luxury house, Hermès represents the finest in French savoir-faire.',
    heroImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1920&q=80',
    logoUrl: '/images/brands/hermes-logo.svg',
    heritage: {
      founded: 1837,
      founder: 'Thierry Hermès',
      origin: 'Paris, France',
      story: 'What began as a harness workshop has become the epitome of French luxury, known for exceptional craftsmanship and timeless design.'
    },
    collections: [],
    stories: []
  },
  {
    id: 'louis-vuitton',
    name: 'Louis Vuitton',
    slug: 'louis-vuitton',
    tagline: 'The Art of Travel',
    description: 'From legendary trunks to contemporary fashion, Louis Vuitton continues to inspire journeys both physical and imaginary.',
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1920&q=80',
    logoUrl: '/images/brands/lv-logo.svg',
    heritage: {
      founded: 1854,
      founder: 'Louis Vuitton',
      origin: 'Paris, France',
      story: 'Louis Vuitton revolutionized travel with innovative flat-topped trunks and has since become a symbol of luxury and refined taste worldwide.'
    },
    collections: [],
    stories: []
  }
];

// ============================================
// PRODUCTS
// ============================================

export const products: Product[] = [
  // Dior Products
  {
    id: 'dior-lady-dior-small',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Lady Dior Small',
    slug: 'lady-dior-small',
    tagline: 'An Icon of Elegance',
    description: 'The Lady Dior bag, created in 1995, has become a true icon of the House of Dior.',
    narrative: 'In 1995, Lady Diana was presented with this elegant creation, and it quickly became her favorite accessory. The bag\'s clean lines and quilted Cannage pattern reflect the architectural refinement of Dior couture. Each Lady Dior is crafted by skilled artisans who dedicate over 8 hours to creating a single bag.',
    price: 4900,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', alt: 'Lady Dior Small Black', type: 'hero' },
      { id: 'img2', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80', alt: 'Lady Dior Detail', type: 'detail' },
      { id: 'img3', url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80', alt: 'Lady Dior Lifestyle', type: 'lifestyle' }
    ],
    variants: [
      { id: 'size-small', type: 'size', name: 'Small', value: 'small', available: true },
      { id: 'size-medium', type: 'size', name: 'Medium', value: 'medium', available: true },
      { id: 'size-large', type: 'size', name: 'Large', value: 'large', available: false },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-red', type: 'color', name: 'Cherry Red', value: '#8B2942', available: true },
      { id: 'color-beige', type: 'color', name: 'Sand Beige', value: '#D4CBBF', available: true }
    ],
    materials: [
      { name: 'Lambskin', composition: '100% Lambskin leather', origin: 'Italy', sustainability: 'Responsibly sourced' },
      { name: 'Metal Hardware', composition: 'Palladium-finish metal', origin: 'France' }
    ],
    craftsmanship: [
      { title: 'Cannage Quilting', description: 'The signature quilted pattern inspired by Napoleon III chairs', duration: '3 hours' },
      { title: 'Hand Stitching', description: 'Each stitch placed with precision by master artisans', duration: '4 hours', artisans: 2 },
      { title: 'D.I.O.R Charms', description: 'Individually crafted letter charms, polished to perfection', duration: '1 hour' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 12,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 95, deliveryDays: 3 },
        { region: 'Europe', city: 'Milan', available: true, confidence: 88, deliveryDays: 4 },
        { region: 'Asia', city: 'Tokyo', available: true, confidence: 92, deliveryDays: 5 },
        { region: 'Americas', city: 'New York', available: false, confidence: 15, deliveryDays: 7 }
      ]
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['iconic', 'heritage', 'leather', 'evening']
  },
  {
    id: 'dior-bar-jacket',
    brandId: 'dior',
    brandName: 'Dior',
    name: 'Bar Jacket',
    slug: 'bar-jacket',
    tagline: 'The New Look, Reimagined',
    description: 'First presented in 1947, the Bar Jacket defined feminine elegance for a generation.',
    narrative: 'The Bar Jacket is the heart of Dior\'s New Look revolution. With its sculpted waist and padded hips, it celebrated feminine curves at a time when fashion was austere. Today\'s interpretation honors this heritage while embracing contemporary tailoring techniques.',
    price: 3200,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', alt: 'Bar Jacket', type: 'hero' },
      { id: 'img2', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', alt: 'Bar Jacket Detail', type: 'detail' }
    ],
    variants: [
      { id: 'size-34', type: 'size', name: 'FR 34', value: '34', available: true },
      { id: 'size-36', type: 'size', name: 'FR 36', value: '36', available: true },
      { id: 'size-38', type: 'size', name: 'FR 38', value: '38', available: true },
      { id: 'size-40', type: 'size', name: 'FR 40', value: '40', available: true },
      { id: 'size-42', type: 'size', name: 'FR 42', value: '42', available: false },
      { id: 'color-ivory', type: 'color', name: 'Ivory', value: '#FAF8F5', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true }
    ],
    materials: [
      { name: 'Wool-Silk Blend', composition: '70% Virgin Wool, 30% Silk', origin: 'Italy' },
      { name: 'Silk Lining', composition: '100% Silk', origin: 'France' },
      { name: 'Buttons', composition: 'Natural Horn', origin: 'France' }
    ],
    craftsmanship: [
      { title: 'Structured Shoulder', description: 'Carefully constructed padding for the signature silhouette', duration: '2 hours' },
      { title: 'Waist Tailoring', description: 'Hand-finished darts creating the cinched waist', duration: '3 hours', artisans: 1 }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 8,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 98, deliveryDays: 2 },
        { region: 'Europe', city: 'London', available: true, confidence: 85, deliveryDays: 4 }
      ]
    },
    collection: 'Autumn/Winter 2024',
    category: 'clothing',
    tags: ['tailoring', 'heritage', 'occasion', 'investment']
  },
  // Gucci Products
  {
    id: 'gucci-jackie-1961',
    brandId: 'gucci',
    brandName: 'Gucci',
    name: 'Jackie 1961',
    slug: 'jackie-1961',
    tagline: 'A Legend Reborn',
    description: 'Originally created in the 1950s, the Jackie bag was renamed in honor of Jacqueline Kennedy Onassis.',
    narrative: 'The Jackie bag embodies Gucci\'s heritage of Italian craftsmanship. Its curved half-moon shape and distinctive piston closure have made it one of the most recognizable bags in fashion history. This modern reinterpretation maintains the classic silhouette while introducing contemporary proportions.',
    price: 2950,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', alt: 'Jackie 1961', type: 'hero' },
      { id: 'img2', url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', alt: 'Jackie Detail', type: 'detail' }
    ],
    variants: [
      { id: 'size-small', type: 'size', name: 'Small', value: 'small', available: true },
      { id: 'size-medium', type: 'size', name: 'Medium', value: 'medium', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-cream', type: 'color', name: 'Cream', value: '#FAF8F5', available: true },
      { id: 'color-brown', type: 'color', name: 'Cuir', value: '#8B6914', available: true }
    ],
    materials: [
      { name: 'Leather', composition: '100% Calfskin', origin: 'Italy', sustainability: 'LWG certified tannery' }
    ],
    craftsmanship: [
      { title: 'Piston Closure', description: 'The signature hardware, individually polished', duration: '30 minutes' },
      { title: 'Edge Painting', description: 'Hand-painted edges for a refined finish', duration: '1 hour' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 15,
      regions: [
        { region: 'Europe', city: 'Florence', available: true, confidence: 99, deliveryDays: 3 },
        { region: 'Europe', city: 'Paris', available: true, confidence: 92, deliveryDays: 3 }
      ]
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['iconic', 'heritage', 'everyday', 'leather']
  },
  {
    id: 'gucci-horsebit-loafer',
    brandId: 'gucci',
    brandName: 'Gucci',
    name: 'Horsebit Loafer',
    slug: 'horsebit-loafer',
    tagline: 'Equestrian Heritage',
    description: 'The Horsebit loafer, introduced in 1953, features the iconic metal horsebit detail.',
    narrative: 'Drawing from Gucci\'s equestrian heritage, the Horsebit loafer has transcended its origins to become a symbol of refined style. The distinctive metal hardware references the brand\'s roots in saddlery and leather goods.',
    price: 890,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80', alt: 'Horsebit Loafer', type: 'hero' }
    ],
    variants: [
      { id: 'size-38', type: 'size', name: 'IT 38', value: '38', available: true },
      { id: 'size-39', type: 'size', name: 'IT 39', value: '39', available: true },
      { id: 'size-40', type: 'size', name: 'IT 40', value: '40', available: true },
      { id: 'size-41', type: 'size', name: 'IT 41', value: '41', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-brown', type: 'color', name: 'Cognac', value: '#8B4513', available: true }
    ],
    materials: [
      { name: 'Leather', composition: '100% Calfskin', origin: 'Italy' },
      { name: 'Hardware', composition: 'Antique gold-finish metal', origin: 'Italy' }
    ],
    craftsmanship: [
      { title: 'Blake Stitch Construction', description: 'Traditional Italian shoemaking technique', duration: '4 hours' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 20,
      regions: [
        { region: 'Europe', city: 'Florence', available: true, confidence: 95, deliveryDays: 3 }
      ]
    },
    collection: 'Icons',
    category: 'shoes',
    tags: ['iconic', 'classic', 'everyday', 'leather']
  },
  // Bottega Veneta Products
  {
    id: 'bottega-cassette',
    brandId: 'bottega-veneta',
    brandName: 'Bottega Veneta',
    name: 'Cassette Bag',
    slug: 'cassette-bag',
    tagline: 'Intrecciato Evolved',
    description: 'A modern interpretation of Bottega Veneta\'s iconic intrecciato technique.',
    narrative: 'The Cassette represents the evolution of Bottega Veneta\'s signature craft. The oversized intrecciato weave creates a contemporary silhouette while honoring decades of artisanal expertise. Each bag requires strips of leather to be meticulously woven by hand.',
    price: 3200,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80', alt: 'Cassette Bag', type: 'hero' }
    ],
    variants: [
      { id: 'size-small', type: 'size', name: 'Small', value: 'small', available: true },
      { id: 'size-medium', type: 'size', name: 'Medium', value: 'medium', available: true },
      { id: 'color-black', type: 'color', name: 'Black', value: '#1A1816', available: true },
      { id: 'color-green', type: 'color', name: 'Bottega Green', value: '#2D5A27', available: true },
      { id: 'color-caramel', type: 'color', name: 'Caramel', value: '#C68642', available: true }
    ],
    materials: [
      { name: 'Nappa Leather', composition: '100% Nappa lambskin', origin: 'Italy', sustainability: 'Carbon neutral production' }
    ],
    craftsmanship: [
      { title: 'Intrecciato Weaving', description: 'Over 100 strips of leather hand-woven', duration: '6 hours', artisans: 1 }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 10,
      regions: [
        { region: 'Europe', city: 'Milan', available: true, confidence: 94, deliveryDays: 3 }
      ]
    },
    collection: 'Core',
    category: 'bags',
    tags: ['signature', 'contemporary', 'leather', 'everyday']
  },
  // Hermès Products
  {
    id: 'hermes-birkin-30',
    brandId: 'hermes',
    brandName: 'Hermès',
    name: 'Birkin 30',
    slug: 'birkin-30',
    tagline: 'The Ultimate Symbol of Luxury',
    description: 'Created in 1984 for Jane Birkin, this bag has become the most coveted accessory in the world.',
    narrative: 'Legend has it that Jean-Louis Dumas, then chairman of Hermès, sat next to Jane Birkin on a flight. As she struggled with her bag, he sketched the design that would become the Birkin. Each bag is crafted by a single artisan over 18-25 hours.',
    price: 9500,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80', alt: 'Birkin 30', type: 'hero' }
    ],
    variants: [
      { id: 'size-25', type: 'size', name: 'Birkin 25', value: '25', available: false },
      { id: 'size-30', type: 'size', name: 'Birkin 30', value: '30', available: true },
      { id: 'size-35', type: 'size', name: 'Birkin 35', value: '35', available: false },
      { id: 'color-noir', type: 'color', name: 'Noir', value: '#1A1816', available: true },
      { id: 'color-gold', type: 'color', name: 'Gold', value: '#C9A962', available: false },
      { id: 'color-etoupe', type: 'color', name: 'Etoupe', value: '#8B7355', available: true }
    ],
    materials: [
      { name: 'Togo Leather', composition: '100% Calfskin with natural grain', origin: 'France' },
      { name: 'Hardware', composition: 'Palladium-plated metal', origin: 'France' }
    ],
    craftsmanship: [
      { title: 'Single Artisan', description: 'One craftsperson creates the entire bag', duration: '18-25 hours', artisans: 1 },
      { title: 'Saddle Stitching', description: 'Traditional technique using two needles', duration: '8 hours' },
      { title: 'Sangles', description: 'Hand-crafted closure straps', duration: '2 hours' }
    ],
    ivEnabled: false,
    availability: {
      status: 'limited',
      quantity: 2,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 60, deliveryDays: 14 }
      ],
      restockDate: '2024-03-01'
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['iconic', 'investment', 'heritage', 'exclusive']
  },
  {
    id: 'hermes-silk-scarf',
    brandId: 'hermes',
    brandName: 'Hermès',
    name: 'Carré Silk Scarf',
    slug: 'carre-silk-scarf',
    tagline: 'A Canvas of Dreams',
    description: 'The Hermès silk scarf, or Carré, is a masterpiece of design and craftsmanship.',
    narrative: 'Since 1937, Hermès has produced these wearable works of art. Each design takes up to two years to develop, and the printing process requires up to 45 screens for a single scarf. The silk comes from Brazilian farms, woven in Lyon, and printed in Hermès\' own workshops.',
    price: 450,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', alt: 'Silk Scarf', type: 'hero' }
    ],
    variants: [
      { id: 'size-70', type: 'size', name: '70cm', value: '70', available: true },
      { id: 'size-90', type: 'size', name: '90cm', value: '90', available: true },
      { id: 'design-equestrian', type: 'color', name: 'Brides de Gala', value: 'equestrian', available: true },
      { id: 'design-jungle', type: 'color', name: 'Jungle Love', value: 'jungle', available: true }
    ],
    materials: [
      { name: 'Silk Twill', composition: '100% Mulberry silk', origin: 'Brazil/France', sustainability: 'Sustainable silk farming' }
    ],
    craftsmanship: [
      { title: 'Design', description: 'Up to 2 years of artistic development', duration: '24 months' },
      { title: 'Screen Printing', description: 'Up to 45 colors, each requiring a separate screen', duration: '6 hours' },
      { title: 'Hand Rolling', description: 'Edges rolled and stitched by hand', duration: '30 minutes' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 50,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 99, deliveryDays: 2 },
        { region: 'Global', city: 'Worldwide', available: true, confidence: 95, deliveryDays: 5 }
      ]
    },
    collection: 'Accessories',
    category: 'accessories',
    tags: ['silk', 'art', 'heritage', 'gift']
  },
  // Louis Vuitton Products
  {
    id: 'lv-speedy-25',
    brandId: 'louis-vuitton',
    brandName: 'Louis Vuitton',
    name: 'Speedy 25 Bandoulière',
    slug: 'speedy-25',
    tagline: 'Travel in Style',
    description: 'A compact version of the iconic Keepall, the Speedy has been a Louis Vuitton icon since 1930.',
    narrative: 'The Speedy was born from the desire to create a smaller, city-friendly version of the Keepall travel bag. Audrey Hepburn was famously photographed carrying her Speedy, cementing its place in fashion history. The Bandoulière version adds a practical crossbody strap.',
    price: 1480,
    currency: 'EUR',
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', alt: 'Speedy 25', type: 'hero' }
    ],
    variants: [
      { id: 'size-20', type: 'size', name: 'Speedy 20', value: '20', available: true },
      { id: 'size-25', type: 'size', name: 'Speedy 25', value: '25', available: true },
      { id: 'size-30', type: 'size', name: 'Speedy 30', value: '30', available: true },
      { id: 'canvas-mono', type: 'color', name: 'Monogram', value: 'monogram', available: true },
      { id: 'canvas-damier', type: 'color', name: 'Damier Ebene', value: 'damier', available: true }
    ],
    materials: [
      { name: 'Canvas', composition: 'Coated canvas with cowhide trim', origin: 'France/Spain' },
      { name: 'Hardware', composition: 'Brass with gold-color finish', origin: 'France' }
    ],
    craftsmanship: [
      { title: 'Pattern Alignment', description: 'Monogram perfectly aligned across seams', duration: '2 hours' },
      { title: 'Leather Trim', description: 'Vachetta leather that develops patina over time', duration: '1 hour' }
    ],
    ivEnabled: true,
    availability: {
      status: 'available',
      quantity: 25,
      regions: [
        { region: 'Europe', city: 'Paris', available: true, confidence: 98, deliveryDays: 2 },
        { region: 'Global', city: 'Worldwide', available: true, confidence: 90, deliveryDays: 5 }
      ]
    },
    collection: 'Icons',
    category: 'bags',
    tags: ['iconic', 'heritage', 'everyday', 'canvas']
  }
];

// ============================================
// COLLECTIONS
// ============================================

export const collections: Collection[] = [
  {
    id: 'dior-aw24',
    name: 'Autumn/Winter 2024',
    slug: 'autumn-winter-2024',
    season: 'Autumn/Winter',
    year: 2024,
    description: 'A celebration of Dior\'s tailoring heritage with contemporary vision.',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    products: products.filter(p => p.brandId === 'dior')
  },
  {
    id: 'gucci-icons',
    name: 'Gucci Icons',
    slug: 'gucci-icons',
    season: 'Timeless',
    year: 2024,
    description: 'The enduring pieces that define Gucci\'s heritage.',
    heroImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&q=80',
    products: products.filter(p => p.brandId === 'gucci')
  },
  {
    id: 'hermes-classics',
    name: 'Hermès Classics',
    slug: 'hermes-classics',
    season: 'Timeless',
    year: 2024,
    description: 'Masterpieces of French savoir-faire.',
    heroImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1920&q=80',
    products: products.filter(p => p.brandId === 'hermes')
  }
];

// ============================================
// BRAND STORIES
// ============================================

export const brandStories: BrandStory[] = [
  {
    id: 'lady-dior-story',
    brandId: 'dior',
    title: 'The Lady Dior Legacy',
    slug: 'lady-dior-legacy',
    type: 'heritage',
    excerpt: 'How a bag created for a princess became an eternal icon of elegance.',
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1920&q=80',
    publishedAt: '2024-01-15',
    readTime: 8,
    relatedProducts: ['dior-lady-dior-small'],
    content: [
      {
        type: 'text',
        content: 'In 1995, a bag was created that would become inseparable from one of the most photographed women in the world. When First Lady Bernadette Chirac presented Princess Diana with a black Dior bag during a visit to Paris, neither could have known they were participating in fashion history.'
      },
      {
        type: 'image',
        content: 'The original Lady Dior, 1995',
        mediaUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80'
      },
      {
        type: 'text',
        content: 'Princess Diana was so taken with the bag that she ordered it in every color. She carried it constantly, from royal engagements to casual outings, cementing its status as the ultimate symbol of refined elegance.'
      },
      {
        type: 'quote',
        content: '"The Lady Dior is not just a bag—it is a declaration of timeless elegance."',
        caption: '— Maria Grazia Chiuri, Creative Director'
      },
      {
        type: 'text',
        content: 'The bag\'s design draws inspiration from the Napoleon III chairs that Christian Dior loved, their caned seats inspiring the now-iconic Cannage pattern. Each bag requires over eight hours of meticulous handwork.'
      }
    ]
  },
  {
    id: 'gucci-jackie-story',
    brandId: 'gucci',
    title: 'Jackie: A Fashion Romance',
    slug: 'jackie-fashion-romance',
    type: 'heritage',
    excerpt: 'The story of how Jacqueline Kennedy Onassis gave her name to fashion history.',
    heroImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&q=80',
    publishedAt: '2024-02-01',
    readTime: 6,
    relatedProducts: ['gucci-jackie-1961'],
    content: [
      {
        type: 'text',
        content: 'Originally known simply as the Gucci Constance, this curved hobo bag was created in the 1950s. But it wasn\'t until Jacqueline Kennedy Onassis made it her constant companion that it achieved legendary status.'
      },
      {
        type: 'text',
        content: 'Photographers captured her carrying the bag everywhere—shopping, traveling, attending events. By the 1970s, it had been renamed in her honor, a rare tribute to a living style icon.'
      }
    ]
  },
  {
    id: 'hermes-craftsmanship',
    brandId: 'hermes',
    title: 'Inside the Hermès Atelier',
    slug: 'hermes-atelier',
    type: 'craftsmanship',
    excerpt: 'A journey into the workshops where dreams become reality.',
    heroImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1920&q=80',
    publishedAt: '2024-01-20',
    readTime: 10,
    relatedProducts: ['hermes-birkin-30', 'hermes-silk-scarf'],
    content: [
      {
        type: 'text',
        content: 'In the quiet workshops of Hermès, time moves differently. Here, a single artisan may spend their entire career perfecting one craft—be it leather stitching, silk printing, or enamel work.'
      },
      {
        type: 'text',
        content: 'Each Birkin bag is crafted by a single artisan from start to finish, a process that takes between 18 and 25 hours. This is not manufacturing—this is creation.'
      },
      {
        type: 'quote',
        content: '"We don\'t make bags. We create companions for life."',
        caption: '— Master Artisan, Hermès'
      }
    ]
  },
  {
    id: 'bottega-intrecciato',
    brandId: 'bottega-veneta',
    title: 'The Art of Intrecciato',
    slug: 'art-of-intrecciato',
    type: 'craftsmanship',
    excerpt: 'How a weaving technique became the signature of silent luxury.',
    heroImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1920&q=80',
    publishedAt: '2024-02-10',
    readTime: 7,
    relatedProducts: ['bottega-cassette'],
    content: [
      {
        type: 'text',
        content: 'In the Veneto region of Italy, artisans have practiced the intrecciato weave for generations. This technique involves weaving thin strips of leather together without visible stitching, creating a supple, distinctive texture.'
      },
      {
        type: 'text',
        content: 'The phrase "When your own initials are enough" captures Bottega Veneta\'s philosophy perfectly. The intrecciato pattern is so recognizable that no logo is needed—those who know, know.'
      }
    ]
  }
];

// ============================================
// MOCK USER
// ============================================

export const mockUser: User = {
  id: 'user-1',
  email: 'sophia@example.com',
  name: 'Sophia Chen',
  fashionIdentity: {
    occasions: ['professional', 'social-events', 'art-cultural'],
    aesthetics: ['classic-timeless', 'minimal-structured'],
    confidenceLevel: 'guided',
    budgetRange: { min: 500, max: 5000 },
    primaryLocation: 'Paris',
    travelDestinations: ['Milan', 'Tokyo', 'New York'],
    bodyTwin: {
      id: 'bt-1',
      silhouette: 'average'
    }
  },
  wardrobe: [
    {
      id: 'w1',
      productId: 'dior-bar-jacket',
      product: products.find(p => p.id === 'dior-bar-jacket')!,
      addedAt: '2024-09-15',
      wearCount: 12,
      lastWorn: '2024-12-20',
      outfitCompatibility: ['gucci-horsebit-loafer']
    }
  ],
  considerations: [],
  orders: []
};

// ============================================
// CONSIDERATION ITEMS (Shopping Cart alternative)
// ============================================

export const mockConsiderations: ConsiderationItem[] = [
  {
    id: 'c1',
    productId: 'dior-lady-dior-small',
    product: products.find(p => p.id === 'dior-lady-dior-small')!,
    addedAt: '2024-12-27',
    selectedVariants: {
      size: 'small',
      color: 'Black'
    },
    agiNote: 'This bag complements your wardrobe beautifully. It would pair well with the Bar Jacket you own.'
  },
  {
    id: 'c2',
    productId: 'gucci-horsebit-loafer',
    product: products.find(p => p.id === 'gucci-horsebit-loafer')!,
    addedAt: '2024-12-26',
    selectedVariants: {
      size: '38',
      color: 'Black'
    },
    agiNote: 'A versatile classic that transitions from office to evening effortlessly.'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find(b => b.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter(p => p.brandId === brandId);
}

export function getStoryBySlug(slug: string): BrandStory | undefined {
  return brandStories.find(s => s.slug === slug);
}

export function getStoriesByBrand(brandId: string): BrandStory[] {
  return brandStories.filter(s => s.brandId === brandId);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.slice(0, 6);
}

export function getFeaturedStories(): BrandStory[] {
  return brandStories.slice(0, 3);
}

// Calendar Events Mock Data
export const mockCalendarConnections: CalendarConnection[] = [
  {
    provider: 'google',
    connected: true,
    email: 'alexandra.chen@email.com',
    lastSynced: '2024-12-30T10:30:00',
    calendarsSelected: ['Personal', 'Work']
  },
  {
    provider: 'apple',
    connected: false
  },
  {
    provider: 'outlook',
    connected: false
  }
];

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Gallery Opening - Contemporary Art Exhibition',
    eventType: 'gallery_opening',
    date: '2025-01-15',
    time: '19:00',
    endTime: '22:00',
    location: 'Paris',
    venue: 'Galerie Perrotin, Le Marais',
    description: 'Opening night for the new contemporary art exhibition featuring emerging artists.',
    dressCode: 'cocktail',
    weather: {
      condition: 'Clear',
      temperature: 8,
      unit: 'C'
    },
    outfitSuggestions: [
      {
        id: 'sug-001',
        name: 'Artistic Elegance',
        description: 'A sophisticated look that balances artistic expression with Parisian chic.',
        confidence: 95,
        items: [
          {
            type: 'wardrobe',
            productId: 'dior-bar-jacket',
            product: products.find(p => p.id === 'dior-bar-jacket') || products[0],
            category: 'Jacket',
            note: 'Your Bar Jacket is perfect for gallery events'
          },
          {
            type: 'suggested',
            productId: 'dior-lady-dior-small',
            product: products.find(p => p.id === 'dior-lady-dior-small') || products[0],
            category: 'Bag',
            note: 'Complements the jacket beautifully'
          }
        ],
        agiReasoning: 'Based on your preference for minimalist aesthetics and the cocktail dress code, this combination offers sophisticated elegance suitable for a Parisian gallery setting.'
      },
      {
        id: 'sug-002',
        name: 'Contemporary Edge',
        description: 'A modern interpretation with Italian craftsmanship at its core.',
        confidence: 88,
        items: [
          {
            type: 'suggested',
            productId: 'bottega-cassette-bag',
            product: products.find(p => p.id === 'bottega-cassette-bag') || products[2],
            category: 'Bag',
            note: 'The Intrecciato weave makes an artistic statement'
          },
          {
            type: 'wardrobe',
            productId: 'gucci-horsebit-loafer',
            product: products.find(p => p.id === 'gucci-horsebit-loafer') || products[1],
            category: 'Shoes',
            note: 'From your wardrobe - pairs well with tailored pieces'
          }
        ],
        agiReasoning: 'The Bottega Veneta aesthetic aligns with contemporary art appreciation. The artisanal craftsmanship will resonate with the gallery environment.'
      }
    ]
  },
  {
    id: 'evt-002',
    title: 'Board Meeting - Q1 Strategy Review',
    eventType: 'business_meeting',
    date: '2025-01-08',
    time: '09:00',
    endTime: '12:00',
    location: 'Paris',
    venue: 'Corporate Headquarters',
    description: 'Quarterly board meeting to review strategic initiatives.',
    dressCode: 'business',
    weather: {
      condition: 'Cloudy',
      temperature: 6,
      unit: 'C'
    },
    outfitSuggestions: [
      {
        id: 'sug-003',
        name: 'Executive Presence',
        description: 'Commanding yet refined professional attire.',
        confidence: 92,
        items: [
          {
            type: 'wardrobe',
            productId: 'dior-bar-jacket',
            product: products.find(p => p.id === 'dior-bar-jacket') || products[0],
            category: 'Jacket',
            note: 'The iconic silhouette projects confidence'
          },
          {
            type: 'suggested',
            productId: 'hermes-kelly-28',
            product: products.find(p => p.id === 'hermes-kelly-28') || products[3],
            category: 'Bag',
            note: 'The Kelly signals success without ostentation'
          }
        ],
        agiReasoning: 'For high-stakes business settings, classic pieces with heritage value create an impression of stability and refined taste.'
      }
    ]
  },
  {
    id: 'evt-003',
    title: 'Anniversary Dinner',
    eventType: 'dinner_party',
    date: '2025-01-20',
    time: '20:00',
    endTime: '23:00',
    location: 'Paris',
    venue: 'Le Cinq, Four Seasons George V',
    description: 'Celebrating 10th wedding anniversary at a Michelin-starred restaurant.',
    dressCode: 'formal',
    weather: {
      condition: 'Clear',
      temperature: 5,
      unit: 'C'
    },
    outfitSuggestions: [
      {
        id: 'sug-004',
        name: 'Timeless Romance',
        description: 'An enchanting ensemble for a special evening.',
        confidence: 97,
        items: [
          {
            type: 'suggested',
            productId: 'dior-lady-dior-small',
            product: products.find(p => p.id === 'dior-lady-dior-small') || products[0],
            category: 'Bag',
            note: 'The Lady Dior in black is quintessentially romantic'
          },
          {
            type: 'suggested',
            productId: 'gucci-horsebit-loafer',
            product: products.find(p => p.id === 'gucci-horsebit-loafer') || products[1],
            category: 'Shoes',
            note: 'Elegant comfort for an evening of celebration'
          }
        ],
        agiReasoning: 'For this milestone celebration at one of Paris\'s most romantic settings, pieces that embody timeless elegance will create lasting memories.'
      }
    ]
  },
  {
    id: 'evt-004',
    title: 'Milan Fashion Week',
    eventType: 'travel',
    date: '2025-02-19',
    time: '08:00',
    location: 'Milan',
    venue: 'Various Venues',
    description: 'Attending Milan Fashion Week shows and events.',
    dressCode: 'cocktail',
    weather: {
      condition: 'Partly Cloudy',
      temperature: 12,
      unit: 'C'
    },
    outfitSuggestions: [
      {
        id: 'sug-005',
        name: 'Fashion Forward',
        description: 'Make a statement at the world\'s fashion capital.',
        confidence: 90,
        items: [
          {
            type: 'suggested',
            productId: 'bottega-cassette-bag',
            product: products.find(p => p.id === 'bottega-cassette-bag') || products[2],
            category: 'Bag',
            note: 'An Italian house for Italian Fashion Week'
          },
          {
            type: 'suggested',
            productId: 'gucci-jackie-1961',
            product: products.find(p => p.id === 'gucci-jackie-1961') || products[1],
            category: 'Bag',
            note: 'Alternative: A fashion icon for fashion week'
          }
        ],
        agiReasoning: 'Fashion Week calls for pieces that demonstrate both fashion awareness and personal style. Italian craftsmanship will be especially appreciated in Milan.'
      }
    ]
  },
  {
    id: 'evt-005',
    title: 'Charity Gala - Opera Benefit',
    eventType: 'gala',
    date: '2025-02-28',
    time: '19:30',
    endTime: '23:30',
    location: 'Paris',
    venue: 'Palais Garnier',
    description: 'Annual charity gala supporting young opera performers.',
    dressCode: 'black_tie',
    weather: {
      condition: 'Clear',
      temperature: 9,
      unit: 'C'
    },
    outfitSuggestions: [
      {
        id: 'sug-006',
        name: 'Opera Grandeur',
        description: 'Befitting the magnificence of Palais Garnier.',
        confidence: 94,
        items: [
          {
            type: 'suggested',
            productId: 'hermes-kelly-28',
            product: products.find(p => p.id === 'hermes-kelly-28') || products[3],
            category: 'Bag',
            note: 'The Kelly in gold adds refined opulence'
          },
          {
            type: 'wardrobe',
            productId: 'dior-bar-jacket',
            product: products.find(p => p.id === 'dior-bar-jacket') || products[0],
            category: 'Jacket',
            note: 'Can be styled for black tie with the right accessories'
          }
        ],
        agiReasoning: 'For a black-tie event at Palais Garnier, heritage pieces with impeccable craftsmanship honor both the venue and the cause.'
      }
    ]
  },
  {
    id: 'evt-006',
    title: 'Sunday Brunch - Birthday Celebration',
    eventType: 'brunch',
    date: '2025-01-12',
    time: '11:30',
    endTime: '14:00',
    location: 'Paris',
    venue: 'Café de Flore',
    description: 'Birthday brunch for close friend.',
    dressCode: 'smart_casual',
    weather: {
      condition: 'Sunny',
      temperature: 7,
      unit: 'C'
    },
    outfitSuggestions: [
      {
        id: 'sug-007',
        name: 'Parisian Weekend',
        description: 'Effortlessly chic for a leisurely brunch.',
        confidence: 91,
        items: [
          {
            type: 'wardrobe',
            productId: 'gucci-horsebit-loafer',
            product: products.find(p => p.id === 'gucci-horsebit-loafer') || products[1],
            category: 'Shoes',
            note: 'Your loafers are perfect for daytime elegance'
          },
          {
            type: 'suggested',
            productId: 'lv-capucines-mm',
            product: products.find(p => p.id === 'lv-capucines-mm') || products[4],
            category: 'Bag',
            note: 'The Capucines transitions beautifully from day to evening'
          }
        ],
        agiReasoning: 'Weekend brunch at Café de Flore calls for relaxed sophistication. These pieces capture the essence of Parisian savoir-vivre.'
      }
    ]
  }
];

export function getUpcomingEvents(days: number = 30): CalendarEvent[] {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return mockCalendarEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= futureDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getEventById(id: string): CalendarEvent | undefined {
  return mockCalendarEvents.find(e => e.id === id);
}

// ============================================
// AVAILABILITY INTELLIGENCE (G-SAIL™)
// ============================================

export function getMockAvailabilityIntelligence(productId: string): AvailabilityIntelligence {
  const product = products.find(p => p.id === productId);
  return {
    productId,
    currentStatus: product?.availability.status || 'available',
    localConfidence: 87,
    alternatives: [
      {
        type: 'geography',
        region: 'Europe',
        city: 'Milan',
        availabilityConfidence: 94,
        deliveryDays: 4,
        priceDifference: 0,
        reason: 'Available at the Milan flagship store with verified stock.'
      },
      {
        type: 'geography',
        region: 'Asia',
        city: 'Tokyo',
        availabilityConfidence: 88,
        deliveryDays: 6,
        priceDifference: 120,
        reason: 'In stock at Ginza boutique. Price difference due to regional pricing.'
      },
      {
        type: 'equivalent',
        availabilityConfidence: 92,
        reason: 'Similar silhouette and craftsmanship from the same collection.',
        product: products.find(p => p.id !== productId && p.category === product?.category)
      }
    ],
    restockPrediction: product?.availability.status === 'limited' ? {
      estimatedDate: '2025-02-15',
      probability: 75
    } : undefined,
    conciergeOption: true
  };
}

// ============================================
// COMPLETE OUTFITS
// ============================================

export function getMockOutfits(product: Product): CompleteOutfit[] {
  const relatedProducts = products.filter(p => p.id !== product.id);

  return [
    {
      id: 'outfit-1',
      name: 'Power Professional',
      occasion: 'Business Meeting',
      description: 'A commanding yet refined ensemble perfect for important meetings and presentations.',
      items: [
        {
          type: 'suggested',
          productId: product.id,
          product: product,
          category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
        },
        {
          type: 'wardrobe',
          productId: 'dior-bar-jacket',
          product: products.find(p => p.id === 'dior-bar-jacket') || relatedProducts[0],
          category: 'Jacket',
          note: 'From your wardrobe'
        },
        {
          type: 'suggested',
          productId: 'gucci-horsebit-loafer',
          product: products.find(p => p.id === 'gucci-horsebit-loafer') || relatedProducts[1],
          category: 'Shoes'
        }
      ],
      compatibilityScore: 94,
      totalPrice: product.price + 3200 + 890,
      agiReasoning: 'The structured lines of the Bar Jacket complement the sophistication of this piece, while the Horsebit Loafers ground the look with Italian craftsmanship. This combination projects confidence and refined taste.'
    },
    {
      id: 'outfit-2',
      name: 'Gallery Evening',
      occasion: 'Art & Culture',
      description: 'An artistically sophisticated look for cultural events and gallery openings.',
      items: [
        {
          type: 'suggested',
          productId: product.id,
          product: product,
          category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
        },
        {
          type: 'suggested',
          productId: 'bottega-cassette',
          product: products.find(p => p.id === 'bottega-cassette') || relatedProducts[2],
          category: 'Bag',
          note: 'The intrecciato weave adds artistic texture'
        },
        {
          type: 'suggested',
          productId: 'hermes-silk-scarf',
          product: products.find(p => p.id === 'hermes-silk-scarf') || relatedProducts[3],
          category: 'Accessory'
        }
      ],
      compatibilityScore: 91,
      totalPrice: product.price + 3200 + 450,
      agiReasoning: 'For cultural environments, this ensemble balances artistic expression with understated luxury. The Bottega intrecciato weave resonates with craft appreciation, while the Hermès scarf adds a touch of heritage artistry.'
    },
    {
      id: 'outfit-3',
      name: 'Weekend Elegance',
      occasion: 'Brunch & Leisure',
      description: 'Effortlessly chic for relaxed yet refined weekend occasions.',
      items: [
        {
          type: 'suggested',
          productId: product.id,
          product: product,
          category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
        },
        {
          type: 'suggested',
          productId: 'gucci-jackie-1961',
          product: products.find(p => p.id === 'gucci-jackie-1961') || relatedProducts[0],
          category: 'Bag',
          note: 'Iconic relaxed sophistication'
        }
      ],
      compatibilityScore: 88,
      totalPrice: product.price + 2950,
      agiReasoning: 'The Jackie bag\'s curved silhouette brings a relaxed elegance that perfectly complements weekend styling while maintaining an air of refined taste.'
    }
  ];
}

// ============================================
// FIT CONFIDENCE
// ============================================

export const mockFitConfidence: FitConfidence = {
  overallScore: 87,
  suggestedSize: 'FR 38',
  breakdown: {
    sizeMatch: 92,
    styleMatch: 85,
    proportionMatch: 84
  },
  sizeNotes: [
    'Based on your measurements, size FR 38 should fit comfortably through the shoulders',
    'The structured waist will sit at your natural waistline',
    'Sleeve length is optimal for your proportions'
  ],
  returnRisk: 'low',
  recommendation: 'Based on your Body Twin profile and previous purchases, this piece should fit beautifully. The structured silhouette complements your style preferences for classic tailoring.'
};

// ============================================
// DIGITAL BODY TWIN
// ============================================

export const mockBodyTwin: DigitalBodyTwin = {
  id: 'bt-user-1',
  userId: 'user-1',
  silhouette: 'average',
  measurements: {
    height: 168,
    chest: 88,
    waist: 68,
    hips: 96,
    inseam: 78,
    shoulders: 38
  },
  fitPreferences: {
    tops: 'fitted',
    bottoms: 'relaxed',
    dresses: 'fitted'
  },
  proportions: {
    shoulder: 'medium',
    torso: 'medium',
    legs: 'medium'
  },
  preferredFit: 'fitted',
  createdAt: '2024-06-15T10:00:00Z',
  updatedAt: '2024-12-20T14:30:00Z'
};

// ============================================
// WARDROBE ANALYSIS
// ============================================

export const mockWardrobeAnalysis: WardrobeAnalysis = {
  totalPieces: 24,
  versatilityScore: 78,
  categories: {
    bags: 4,
    clothing: 12,
    shoes: 5,
    accessories: 3
  },
  occasionCoverage: {
    professional: 85,
    evening: 70,
    casual: 90,
    formal: 45,
    travel: 60
  },
  gaps: [
    {
      id: 'gap-1',
      category: 'Evening Clutch',
      priority: 'essential',
      reason: 'Your wardrobe lacks a formal evening bag for black-tie events.',
      occasionsUnlocked: ['Gala', 'Opera', 'Formal Dinner'],
      suggestedProducts: products.filter(p => p.category === 'bags').slice(0, 2)
    },
    {
      id: 'gap-2',
      category: 'Silk Scarf',
      priority: 'recommended',
      reason: 'A versatile silk scarf would add styling options to your existing pieces.',
      occasionsUnlocked: ['Professional', 'Travel', 'Art Events'],
      suggestedProducts: products.filter(p => p.id === 'hermes-silk-scarf')
    },
    {
      id: 'gap-3',
      category: 'Classic Pumps',
      priority: 'nice-to-have',
      reason: 'Black pumps would complete several professional and evening ensembles.',
      occasionsUnlocked: ['Professional', 'Evening', 'Cocktail'],
      suggestedProducts: products.filter(p => p.category === 'shoes').slice(0, 2)
    }
  ],
  styleBalance: 'Classic-Contemporary',
  agiInsight: 'Your wardrobe shows a strong foundation in classic pieces with contemporary touches. To maximize versatility, consider adding more transitional pieces that work across multiple occasions. The current gap in formal accessories limits your evening options.'
};

// ============================================
// FASHION PASSPORT (AUTHENTICITY)
// ============================================

// ============================================
// USER PREFERENCES
// ============================================

export const mockUserPreferences: UserPreferences = {
  id: 'pref-1',
  userId: 'user-1',
  notifications: {
    restockAlerts: true,
    newArrivals: false,
    priceChanges: true,
    outfitSuggestions: true,
    eventReminders: true
  },
  privacy: {
    shareWardrobeInsights: true,
    allowAGILearning: true,
    shareStylePreferences: true
  },
  shopping: {
    budgetMin: 500,
    budgetMax: 15000,
    preferredBrands: ['bottega-veneta', 'celine', 'the-row'],
    excludedCategories: []
  },
  display: {
    currency: 'EUR',
    measurementUnit: 'metric'
  }
};

// ============================================
// RESTOCK NOTIFICATIONS
// ============================================

export const mockRestockNotifications = [
  {
    id: 'rn-1',
    productId: 'hermes-birkin-30',
    product: products.find(p => p.id === 'hermes-birkin-30')!,
    status: 'watching',
    createdAt: '2024-12-15T10:00:00Z',
    preferredSize: 'Birkin 30',
    preferredColor: 'Noir'
  },
  {
    id: 'rn-2',
    productId: 'dior-lady-dior-small',
    product: products.find(p => p.id === 'dior-lady-dior-small')!,
    status: 'available',
    createdAt: '2024-12-20T14:30:00Z',
    notifiedAt: '2024-12-28T09:00:00Z',
    preferredSize: 'Large',
    preferredColor: 'Cherry Red'
  },
  {
    id: 'rn-3',
    productId: 'bottega-cassette',
    product: products.find(p => p.id === 'bottega-cassette')!,
    status: 'notified',
    createdAt: '2024-12-10T08:00:00Z',
    notifiedAt: '2024-12-25T11:00:00Z',
    preferredSize: 'Medium',
    preferredColor: 'Bottega Green'
  }
];

// ============================================
// SILENT CART
// ============================================

export const mockSilentCart = {
  id: 'sc-1',
  userId: 'user-1',
  items: [
    {
      productId: 'gucci-jackie-1961',
      product: products.find(p => p.id === 'gucci-jackie-1961')!,
      addedAt: '2024-12-20T10:00:00Z',
      reason: 'Browsed multiple times and matches your aesthetic preferences',
      confidence: 88,
      occasion: 'Gallery Opening',
      expiresAt: '2025-01-15T23:59:59Z'
    },
    {
      productId: 'hermes-silk-scarf',
      product: products.find(p => p.id === 'hermes-silk-scarf')!,
      addedAt: '2024-12-22T15:30:00Z',
      reason: 'Complements items in your wardrobe and fills a style gap',
      confidence: 92,
      occasion: 'Business Meeting',
      expiresAt: '2025-01-10T23:59:59Z'
    }
  ],
  totalValue: (products.find(p => p.id === 'gucci-jackie-1961')?.price || 0) +
              (products.find(p => p.id === 'hermes-silk-scarf')?.price || 0),
  lastUpdated: '2024-12-28T10:00:00Z',
  agiExplanation: 'Based on your browsing patterns, style preferences, and upcoming calendar events, I\'ve quietly prepared these items for your consideration. Each piece has been selected to complement your existing wardrobe and align with your aesthetic.'
};

// ============================================
// UHNI (Ultra High Net-worth Individual) DATA
// ============================================

// Current User Tier (toggle this to test UHNI features)
export const mockUserTier: UserTier = 'uhni';

// Personal Concierge
export const mockConcierge: PersonalConcierge = {
  id: 'concierge-1',
  name: 'Isabella Martinez',
  title: 'Senior Fashion Concierge',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  email: 'isabella.martinez@modaglimmora.com',
  phone: '+33 1 42 86 82 82',
  availability: 'available',
  specialties: ['Haute Couture', 'Rare Vintage', 'Bespoke Tailoring', 'Private Collections'],
  languages: ['English', 'French', 'Italian', 'Spanish'],
  assignedSince: '2024-06-15',
  bio: 'With over 15 years of experience in luxury fashion, Isabella specializes in sourcing rare pieces and coordinating bespoke experiences for discerning clients. Previously with Dior and Hermès private client services.'
};

// Autonomous Shopping Settings
export const mockAutonomousSettings: AutonomousShoppingSettings = {
  enabled: true,
  monthlyBudget: 50000,
  currentMonthSpend: 12400,
  autoApproveThreshold: 5000,
  categories: ['bags', 'accessories', 'jewelry'],
  excludedBrands: [],
  preferredBrands: ['dior', 'hermes', 'bottega-veneta'],
  requireReviewBefore: 'purchase',
  notificationPreference: 'immediate',
  invisibleCommerceMode: false,
  discreetPackaging: true
};

// Sourcing Requests
export const mockSourcingRequests: SourcingRequest[] = [
  {
    id: 'sr-1',
    type: 'specific_item',
    status: 'options_found',
    title: 'Hermès Birkin 25 in Gold Togo',
    description: 'Looking for a Birkin 25 in Gold Togo leather with gold hardware. Prefer new or like-new condition.',
    budget: { min: 15000, max: 25000, flexible: true },
    deadline: '2025-03-01',
    conciergeNotes: [
      {
        id: 'note-1',
        author: 'concierge',
        content: 'I\'ve identified three potential sources for this piece. One from our Paris boutique allocation, one pre-owned in excellent condition from a trusted reseller.',
        timestamp: '2024-12-26T14:30:00Z'
      },
      {
        id: 'note-2',
        author: 'client',
        content: 'I prefer new if possible. What\'s the timeline for the boutique allocation?',
        timestamp: '2024-12-26T16:00:00Z'
      },
      {
        id: 'note-3',
        author: 'concierge',
        content: 'The boutique allocation typically takes 4-8 weeks. I\'ve put you on the priority list. In the meantime, I\'ve added the pre-owned option for your consideration.',
        timestamp: '2024-12-27T09:00:00Z'
      }
    ],
    foundOptions: [
      {
        id: 'opt-1',
        customDescription: 'Hermès Birkin 25 Gold Togo GHW - Boutique Allocation',
        source: 'Hermès Paris - George V',
        condition: 'new',
        price: 21500,
        availableUntil: '2025-02-15',
        conciergeRecommendation: 'Recommended - Direct from boutique with full warranty',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
      },
      {
        id: 'opt-2',
        customDescription: 'Hermès Birkin 25 Gold Togo GHW - Pre-owned',
        source: 'Verified Reseller - Rebag',
        condition: 'like_new',
        price: 18900,
        originalPrice: 21500,
        provenance: 'Original owner, purchased 2023, used twice',
        availableUntil: '2025-01-10',
        conciergeRecommendation: 'Excellent value - authenticated with documentation',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
      }
    ],
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-27T09:00:00Z'
  },
  {
    id: 'sr-2',
    type: 'occasion',
    status: 'sourcing',
    title: 'Monaco Grand Prix Weekend Wardrobe',
    description: 'Need complete looks for Monaco GP weekend - yacht party Friday, race day Saturday, gala dinner Sunday.',
    occasion: 'Monaco Grand Prix 2025',
    budget: { min: 30000, max: 60000, flexible: true },
    deadline: '2025-05-15',
    conciergeNotes: [
      {
        id: 'note-4',
        author: 'concierge',
        content: 'I\'m curating options from Dior, Valentino, and Brunello Cucinelli for the yacht party. For race day, considering Loro Piana and Zegna. The gala will feature options from Givenchy and Alexander McQueen.',
        timestamp: '2024-12-28T11:00:00Z'
      }
    ],
    foundOptions: [],
    createdAt: '2024-12-25T14:00:00Z',
    updatedAt: '2024-12-28T11:00:00Z'
  }
];

// Bespoke Orders
export const mockBespokeOrders: BespokeOrder[] = [
  {
    id: 'bespoke-1',
    brandId: 'dior',
    brandName: 'Dior',
    type: 'made_to_measure',
    title: 'Custom Bar Jacket',
    description: 'Made-to-measure Bar Jacket in midnight navy wool with personalized gold buttons bearing client initials.',
    specifications: [
      { category: 'Fabric', label: 'Material', value: 'Super 150s Wool', notes: 'From Loro Piana mill' },
      { category: 'Fabric', label: 'Color', value: 'Midnight Navy' },
      { category: 'Details', label: 'Buttons', value: 'Custom Gold', notes: 'Engraved with initials "SC"' },
      { category: 'Details', label: 'Lining', value: 'Silk Jacquard', notes: 'Dior oblique pattern' },
      { category: 'Fit', label: 'Silhouette', value: 'Classic Bar', notes: 'Slightly nipped waist per fitting' }
    ],
    measurements: {
      bust: 88,
      waist: 68,
      hips: 94,
      shoulders: 38,
      sleeveLength: 60
    },
    status: 'production',
    timeline: [
      {
        id: 'step-1',
        stage: 'consultation',
        title: 'Initial Consultation',
        description: 'Discussed design preferences, fabric selection, and customization options',
        status: 'completed',
        completedAt: '2024-11-15T10:00:00Z'
      },
      {
        id: 'step-2',
        stage: 'design_approval',
        title: 'Design Approval',
        description: 'Finalized design sketches and fabric swatches',
        status: 'completed',
        completedAt: '2024-11-28T14:00:00Z'
      },
      {
        id: 'step-3',
        stage: 'production',
        title: 'Atelier Production',
        description: 'Master tailors crafting the piece at Dior Paris atelier',
        status: 'current',
        estimatedDate: '2025-01-20'
      },
      {
        id: 'step-4',
        stage: 'fitting',
        title: 'First Fitting',
        description: 'Fitting appointment at Dior Paris',
        status: 'upcoming',
        estimatedDate: '2025-01-25'
      },
      {
        id: 'step-5',
        stage: 'final_adjustments',
        title: 'Final Adjustments',
        description: 'Any necessary alterations after fitting',
        status: 'upcoming',
        estimatedDate: '2025-02-01'
      },
      {
        id: 'step-6',
        stage: 'complete',
        title: 'Delivery',
        description: 'White-glove delivery to your address',
        status: 'upcoming',
        estimatedDate: '2025-02-10'
      }
    ],
    estimatedCompletion: '2025-02-10',
    price: 12500,
    depositPaid: 6250,
    depositPercentage: 50,
    atelierContact: 'Maison Dior Couture Atelier, 30 Avenue Montaigne, Paris',
    progressImages: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'
    ],
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z'
  }
];

// Autonomous Activity Feed
export const mockAutonomousActivity: AutonomousActivity[] = [
  {
    id: 'activity-1',
    type: 'prepared',
    product: products.find(p => p.id === 'gucci-jackie-1961')!,
    price: 2900,
    reason: 'Matches your style preferences and complements 3 items in your wardrobe',
    timestamp: '2024-12-28T08:00:00Z',
    autoApproveDeadline: '2024-12-30T08:00:00Z',
    status: 'pending'
  },
  {
    id: 'activity-2',
    type: 'auto_purchased',
    product: products.find(p => p.id === 'hermes-silk-scarf')!,
    price: 450,
    reason: 'Within auto-approve threshold, perfect for your upcoming business meetings',
    timestamp: '2024-12-27T14:30:00Z',
    status: 'completed'
  },
  {
    id: 'activity-3',
    type: 'awaiting_approval',
    product: products.find(p => p.id === 'bottega-cassette')!,
    price: 3200,
    reason: 'Last one available in your preferred color, above auto-approve threshold',
    timestamp: '2024-12-26T10:00:00Z',
    autoApproveDeadline: '2024-12-28T10:00:00Z',
    status: 'pending'
  }
];

// Complete UHNI Profile
export const mockUHNIProfile: UHNIProfile = {
  userId: 'user-1',
  tier: 'uhni',
  memberSince: '2024-06-15',
  concierge: mockConcierge,
  autonomousSettings: mockAutonomousSettings,
  sourcingRequests: mockSourcingRequests,
  bespokeOrders: mockBespokeOrders,
  privateCollectionAccess: ['dior-private-2025', 'hermes-invitation'],
  lifetimeValue: 287500,
  preferences: {
    communicationPreference: 'all',
    preferredContactTimes: ['10:00-12:00', '15:00-18:00'],
    specialRequests: ['Prefer European sizes', 'Allergic to nickel - gold hardware only']
  }
};

// Helper function to get UHNI data
export function getUHNIProfile(): UHNIProfile | null {
  if (mockUserTier === 'uhni') {
    return mockUHNIProfile;
  }
  return null;
}

export function getMockFashionPassport(productId: string): FashionPassport {
  const product = products.find(p => p.id === productId);

  return {
    id: `passport-${productId}`,
    productId,
    serialNumber: `MGP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    authenticity: {
      verified: true,
      verifiedAt: '2024-12-28T10:30:00Z',
      verificationMethod: 'NFC chip + visual inspection'
    },
    provenance: {
      createdIn: product?.materials[0]?.origin || 'France',
      createdAt: '2024-10-15T00:00:00Z',
      artisans: product?.craftsmanship[0]?.artisans || 1,
      craftingHours: parseInt(product?.craftsmanship[0]?.duration?.replace(/\D/g, '') || '8')
    },
    materials: (product?.materials || []).map(m => ({
      name: m.name,
      origin: m.origin,
      certification: m.sustainability ? 'Certified Sustainable' : undefined,
      sustainability: m.sustainability
    })),
    ownership: {
      currentOwner: 'Sophia Chen',
      purchaseDate: '2024-12-28T00:00:00Z',
      transferHistory: []
    },
    care: {
      servicingAvailable: true,
      warrantyExpires: '2026-12-28T00:00:00Z',
      instructions: [
        'Store in dust bag when not in use',
        'Avoid exposure to direct sunlight',
        'Clean with soft, dry cloth only',
        'Keep away from water and moisture',
        'Professional cleaning recommended annually'
      ]
    }
  };
}
