/**
 * Weather Integration Types (SOW V10.2)
 *
 * Weather data and calendar provider configuration types.
 */

// ============================================
// Calendar Provider Configuration
// ============================================

export interface CalendarProviderConfig {
  id: 'google' | 'icloud' | 'microsoft' | 'manual';
  name: string;
  icon: string;
  connected: boolean;
  authUrl?: string;
  scopes?: string[];
  lastSync?: string;
  error?: string;
}

export interface CalendarSyncConfig {
  provider: CalendarProviderConfig['id'];
  calendars: { id: string; name: string; color: string; enabled: boolean }[];
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  autoDetectDressCode: boolean;
  autoSuggestOutfits: boolean;
  reminderHoursBefore: number;
}

// ============================================
// Weather Data
// ============================================

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitationChance: number;
  humidity: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  location: string;
  coordinates?: { lat: number; lng: number };
  timezone: string;
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    visibility: number;
  };
  forecast: WeatherForecast[];
  lastUpdated: string;
}
