import type { Collection } from '@/types';
import { products } from './products';

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

// Helper functions
export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}

export function getCollectionById(id: string): Collection | undefined {
  return collections.find(c => c.id === id);
}

export function getCollectionsByBrand(brandId: string): Collection[] {
  return collections.filter(c =>
    c.products.some(p => p.brandId === brandId)
  );
}
