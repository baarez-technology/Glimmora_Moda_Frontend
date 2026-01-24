import type { Trip, TripActivity, PackingItem, WeatherData } from '@/types';
import { products } from './products';
import { mockCalendarEvents } from './calendar';

// ============================================
// WEATHER DATA
// ============================================

export const mockWeatherData: WeatherData = {
  location: 'Paris, France',
  coordinates: { lat: 48.8566, lng: 2.3522 },
  timezone: 'Europe/Paris',
  current: {
    temperature: 8,
    feelsLike: 5,
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy',
    humidity: 72,
    windSpeed: 15,
    uvIndex: 2,
    visibility: 10
  },
  forecast: [
    { date: '2025-01-25', high: 10, low: 4, condition: 'Sunny', icon: 'sunny', precipitationChance: 10, humidity: 65, sunrise: '08:32', sunset: '17:42' },
    { date: '2025-01-26', high: 9, low: 3, condition: 'Cloudy', icon: 'cloudy', precipitationChance: 30, humidity: 75, sunrise: '08:31', sunset: '17:44' },
    { date: '2025-01-27', high: 7, low: 2, condition: 'Rainy', icon: 'rainy', precipitationChance: 80, humidity: 85, sunrise: '08:30', sunset: '17:45' },
    { date: '2025-01-28', high: 8, low: 3, condition: 'Partly Cloudy', icon: 'partly-cloudy', precipitationChance: 25, humidity: 70, sunrise: '08:29', sunset: '17:47' },
    { date: '2025-01-29', high: 11, low: 5, condition: 'Sunny', icon: 'sunny', precipitationChance: 5, humidity: 60, sunrise: '08:28', sunset: '17:49' },
  ],
  lastUpdated: new Date().toISOString()
};

export function getMockWeather(): WeatherData {
  return mockWeatherData;
}

// ============================================
// TRIPS
// ============================================

export const mockTrips: Trip[] = [
  {
    id: 'trip-milan-fw',
    name: 'Milan Fashion Week',
    destination: 'Milan, Italy',
    destinationImage: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1920',
    departureDate: '2025-02-19',
    returnDate: '2025-02-24',
    activities: ['business', 'formal', 'cultural', 'nightlife'],
    packingList: [
      { id: 'pack-1', productId: 'dior-bar-jacket', product: products.find(p => p.id === 'dior-bar-jacket'), category: 'Outerwear', name: 'Bar Jacket', quantity: 1, packed: false, isFromWardrobe: true, isSuggested: false, forActivities: ['business', 'formal'], priority: 'essential' },
      { id: 'pack-2', productId: 'gucci-horsebit-loafer', product: products.find(p => p.id === 'gucci-horsebit-loafer'), category: 'Shoes', name: 'Horsebit Loafers', quantity: 1, packed: false, isFromWardrobe: true, isSuggested: false, forActivities: ['business', 'cultural'], priority: 'essential' },
      { id: 'pack-3', productId: 'bottega-cassette', product: products.find(p => p.id === 'bottega-cassette'), category: 'Bags', name: 'Cassette Bag', quantity: 1, packed: false, isFromWardrobe: false, isSuggested: true, suggestedReason: 'Italian house for Italian fashion week - perfect statement piece', forActivities: ['business', 'formal', 'cultural'], priority: 'recommended' },
    ],
    events: mockCalendarEvents.filter(e => e.id === 'evt-004'),
    notes: 'Remember to confirm show invitations and restaurant reservations',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:00:00Z'
  }
];

export function getTripById(id: string): Trip | undefined {
  return mockTrips.find(t => t.id === id);
}

export function getAllTrips(): Trip[] {
  return mockTrips;
}

// ============================================
// PACKING RECOMMENDATIONS
// ============================================

export function getPackingRecommendations(trip: Trip): PackingItem[] {
  const items: PackingItem[] = [];

  // Helper to create a PackingItem with all required properties
  const createItem = (
    id: string,
    name: string,
    category: string,
    quantity: number,
    forActivities: TripActivity[] = [],
    priority: 'essential' | 'recommended' | 'optional' = 'recommended',
    productId?: string
  ): PackingItem => ({
    id,
    name,
    category,
    quantity,
    packed: false,
    isFromWardrobe: !!productId,
    isSuggested: !productId,
    forActivities,
    priority,
    productId
  });

  // Base essentials
  items.push(
    createItem(`pack-${Date.now()}-1`, 'Passport & Documents', 'essentials', 1, [], 'essential'),
    createItem(`pack-${Date.now()}-2`, 'Phone Charger', 'essentials', 1, [], 'essential'),
    createItem(`pack-${Date.now()}-3`, 'Toiletry Bag', 'essentials', 1, [], 'essential')
  );

  // Activity-based recommendations
  if (trip.activities.includes('beach')) {
    items.push(
      createItem(`pack-${Date.now()}-4`, 'Sunscreen SPF 50+', 'essentials', 1, ['beach'], 'essential'),
      createItem(`pack-${Date.now()}-5`, 'Lightweight Linen Shirt', 'outfits', 2, ['beach', 'casual']),
      createItem(`pack-${Date.now()}-6`, 'Swimwear', 'outfits', 2, ['beach'], 'essential'),
      createItem(`pack-${Date.now()}-7`, 'Sandals', 'footwear', 1, ['beach', 'casual']),
      createItem(`pack-${Date.now()}-8`, 'Sun Hat', 'accessories', 1, ['beach']),
      createItem(`pack-${Date.now()}-9`, 'Sunglasses', 'accessories', 1, ['beach', 'outdoor'])
    );
  }

  if (trip.activities.includes('outdoor') || trip.activities.includes('sports')) {
    items.push(
      createItem(`pack-${Date.now()}-10`, 'Warm Jacket', 'outfits', 1, ['outdoor']),
      createItem(`pack-${Date.now()}-11`, 'Comfortable Sweater', 'outfits', 2, ['outdoor', 'casual']),
      createItem(`pack-${Date.now()}-12`, 'Layering Pieces', 'outfits', 2, ['outdoor']),
      createItem(`pack-${Date.now()}-13`, 'Scarf', 'accessories', 1, ['outdoor']),
      createItem(`pack-${Date.now()}-15`, 'Walking Boots', 'footwear', 1, ['outdoor'])
    );
  }

  if (!trip.activities.some(a => ['beach', 'outdoor', 'sports'].includes(a))) {
    items.push(
      createItem(`pack-${Date.now()}-16`, 'Versatile Blazer', 'outfits', 1, ['business', 'casual', 'cultural']),
      createItem(`pack-${Date.now()}-17`, 'Day Dress', 'outfits', 2, ['casual', 'cultural']),
      createItem(`pack-${Date.now()}-18`, 'Comfortable Walking Shoes', 'footwear', 1, ['casual', 'cultural']),
      createItem(`pack-${Date.now()}-19`, 'Light Cardigan', 'outfits', 1, ['casual'])
    );
  }

  // Activity-based recommendations
  if (trip.activities.includes('formal') || trip.activities.includes('nightlife')) {
    items.push(
      createItem(`pack-${Date.now()}-20`, 'Evening Dress', 'outfits', 1, ['formal', 'nightlife']),
      createItem(`pack-${Date.now()}-21`, 'Elegant Heels', 'footwear', 1, ['formal', 'nightlife']),
      createItem(`pack-${Date.now()}-22`, 'Statement Jewelry', 'accessories', 1, ['formal', 'nightlife'])
    );
  }

  if (trip.activities.includes('business')) {
    items.push(
      createItem(`pack-${Date.now()}-23`, 'Professional Blouse', 'outfits', 2, ['business']),
      createItem(`pack-${Date.now()}-24`, 'Tailored Trousers', 'outfits', 1, ['business']),
      createItem(`pack-${Date.now()}-25`, 'Classic Pumps', 'footwear', 1, ['business'])
    );
  }

  // Add products from user's wardrobe
  const wardrobeProducts = products.slice(0, 3);
  wardrobeProducts.forEach((product, i) => {
    items.push(createItem(
      `pack-${Date.now()}-wardrobe-${i}`,
      product.name,
      'outfits',
      1,
      ['casual'],
      'recommended',
      product.id
    ));
  });

  return items;
}
