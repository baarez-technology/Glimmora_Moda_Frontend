import type { Product } from '@/types';

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

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter(p => p.brandId === brandId);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.slice(0, 6);
}
