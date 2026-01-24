import type { Brand } from '@/types';

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
    heroImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80',
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
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
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
    heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80',
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
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80',
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
    heroImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1920&q=80',
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

// Helper functions
export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find(b => b.slug === slug);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find(b => b.id === id);
}
