import type { BrandStory } from '@/types';

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

// Helper functions
export function getStoryBySlug(slug: string): BrandStory | undefined {
  return brandStories.find(s => s.slug === slug);
}

export function getStoryById(id: string): BrandStory | undefined {
  return brandStories.find(s => s.id === id);
}

export function getStoriesByBrand(brandId: string): BrandStory[] {
  return brandStories.filter(s => s.brandId === brandId);
}

export function getFeaturedStories(): BrandStory[] {
  return brandStories.slice(0, 3);
}
