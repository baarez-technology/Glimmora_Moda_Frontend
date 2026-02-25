/**
 * Brand Types
 *
 * Brand, collection, and brand story type definitions.
 */

import type { Product } from './product';

// Story Section
export interface StorySection {
  type: 'text' | 'image' | 'video' | 'quote' | 'timeline';
  content: string;
  caption?: string;
  mediaUrl?: string;
}

// Brand Story
export interface BrandStory {
  id: string;
  brandId: string;
  title: string;
  slug: string;
  type: 'heritage' | 'craftsmanship' | 'collection' | 'collaboration' | 'artisan';
  excerpt: string;
  content: StorySection[];
  heroImage: string;
  publishedAt: string;
  readTime: number;
  relatedProducts: string[];
}

// Collection
export interface Collection {
  id: string;
  brandId?: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description: string;
  heroImage: string;
  products: Product[];
  productCount?: number;
}

// Brand
export interface Brand {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
  logoUrl: string;
  heritage: {
    founded: number;
    founder: string;
    origin: string;
    story: string;
  };
  collections: Collection[];
  stories: BrandStory[];
}
