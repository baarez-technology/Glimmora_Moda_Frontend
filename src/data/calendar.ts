import type { CalendarEvent, CalendarConnection } from '@/types';

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
// BASE CALENDAR EVENTS (without outfit suggestions)
// Outfit suggestions are generated dynamically based on user's wardrobe
// ============================================

export const baseCalendarEvents: Omit<CalendarEvent, 'outfitSuggestions'>[] = [
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  }
];

// Legacy export for backward compatibility (will be replaced by dynamic generation)
export const mockCalendarEvents: CalendarEvent[] = baseCalendarEvents.map(event => ({
  ...event,
  outfitSuggestions: [] // Empty - will be populated dynamically
}));

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
