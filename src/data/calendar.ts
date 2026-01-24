import type { CalendarEvent, CalendarConnection } from '@/types';
import { products } from './products';

// ============================================
// CALENDAR CONNECTIONS
// ============================================

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

// ============================================
// CALENDAR EVENTS
// ============================================

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

// Helper functions
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

export function getEventsByType(eventType: string): CalendarEvent[] {
  return mockCalendarEvents.filter(e => e.eventType === eventType);
}
