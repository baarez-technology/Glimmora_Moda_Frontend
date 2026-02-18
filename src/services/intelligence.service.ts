/**
 * Intelligence Service (G-SAIL, fit, sustainability, fabric)
 * Endpoints: /api/intelligence/*
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type { AvailabilityIntelligence, FashionPassport } from '@/types/intelligence';
import type { HeritageEvent, CulturalJourney } from '@/types/heritage';
import {
  getMockAvailabilityIntelligence,
  getMockFashionPassport,
  heritageEvents,
  getHeritageEventsByBrand as mockGetHeritageByBrand,
  culturalJourneys,
  getCulturalJourneyById as mockGetJourneyById,
  getCulturalJourneysByType as mockGetJourneysByType
} from '@/data/intelligence';
import {
  fabricSimulations,
  contextSimulations,
  climateSuitability,
  sustainabilityScores,
  materialFeels,
  getFabricSimulation as mockGetFabric,
  getContextSimulations as mockGetContextSims,
  getClimateSuitability as mockGetClimate,
  getSustainabilityScore as mockGetSustainability,
  getMaterialFeel as mockGetMaterial,
  getProductContextSimulations as mockGetProductContextSims
} from '@/data/product-features';
import type { Trip, PackingItem, WeatherData } from '@/types';
import {
  getTripById as mockGetTripById,
  getAllTrips as mockGetAllTrips,
  getPackingRecommendations as mockGetPacking,
  getMockWeather
} from '@/data/travel';

// ============================================
// G-SAIL Intelligence
// ============================================

export async function getAvailabilityIntelligence(
  productId: string
): Promise<ApiResponse<AvailabilityIntelligence>> {
  return apiRequest<AvailabilityIntelligence>(`/api/intelligence/availability/${productId}`, {
    mockHandler: () => getMockAvailabilityIntelligence(productId),
  });
}

export async function getFashionPassport(productId: string): Promise<ApiResponse<FashionPassport>> {
  return apiRequest<FashionPassport>(`/api/intelligence/passport/${productId}`, {
    mockHandler: () => getMockFashionPassport(productId),
  });
}

// ============================================
// Heritage & Cultural Journeys
// ============================================

export async function getHeritageEvents(): Promise<ApiResponse<HeritageEvent[]>> {
  return apiRequest<HeritageEvent[]>('/api/intelligence/heritage', {
    mockHandler: () => heritageEvents,
  });
}

export async function getHeritageEventsByBrand(brandId: string): Promise<ApiResponse<HeritageEvent[]>> {
  return apiRequest<HeritageEvent[]>(`/api/intelligence/heritage/by-brand/${brandId}`, {
    mockHandler: () => mockGetHeritageByBrand(brandId),
  });
}

export async function getCulturalJourneys(): Promise<ApiResponse<CulturalJourney[]>> {
  return apiRequest<CulturalJourney[]>('/api/intelligence/journeys', {
    mockHandler: () => culturalJourneys,
  });
}

export async function getCulturalJourneyById(id: string): Promise<ApiResponse<CulturalJourney | null>> {
  return apiRequest<CulturalJourney | null>(`/api/intelligence/journeys/${id}`, {
    mockHandler: () => mockGetJourneyById(id) ?? null,
  });
}

export async function getCulturalJourneysByType(type: string): Promise<ApiResponse<CulturalJourney[]>> {
  return apiRequest<CulturalJourney[]>(`/api/intelligence/journeys/by-type/${type}`, {
    mockHandler: () => mockGetJourneysByType(type),
  });
}

// ============================================
// Product Features
// ============================================

export async function getFabricSimulation(productId: string): Promise<ApiResponse<typeof fabricSimulations[string] | null>> {
  return apiRequest(`/api/intelligence/fabric/${productId}`, {
    mockHandler: () => mockGetFabric(productId) ?? null,
  });
}

export async function getContextSimulations(): Promise<ApiResponse<typeof contextSimulations>> {
  return apiRequest('/api/intelligence/context-simulations', {
    mockHandler: () => mockGetContextSims(),
  });
}

export async function getProductContextSimulations(productId: string): Promise<ApiResponse<ReturnType<typeof mockGetProductContextSims>>> {
  return apiRequest(`/api/intelligence/context-simulations/${productId}`, {
    mockHandler: () => mockGetProductContextSims(productId),
  });
}

export async function getClimateSuitability(productId: string): Promise<ApiResponse<typeof climateSuitability[string] | null>> {
  return apiRequest(`/api/intelligence/climate/${productId}`, {
    mockHandler: () => mockGetClimate(productId) ?? null,
  });
}

export async function getSustainabilityScore(productId: string): Promise<ApiResponse<typeof sustainabilityScores[string] | null>> {
  return apiRequest(`/api/intelligence/sustainability/${productId}`, {
    mockHandler: () => mockGetSustainability(productId) ?? null,
  });
}

export async function getMaterialFeel(productId: string): Promise<ApiResponse<typeof materialFeels[string] | null>> {
  return apiRequest(`/api/intelligence/material-feel/${productId}`, {
    mockHandler: () => mockGetMaterial(productId) ?? null,
  });
}

// ============================================
// Travel & Packing
// ============================================

export async function getAllTrips(): Promise<ApiResponse<Trip[]>> {
  return apiRequest<Trip[]>('/api/travel/trips', {
    mockHandler: () => mockGetAllTrips(),
  });
}

export async function getTripById(id: string): Promise<ApiResponse<Trip | null>> {
  return apiRequest<Trip | null>(`/api/travel/trips/${id}`, {
    mockHandler: () => mockGetTripById(id) ?? null,
  });
}

export async function getPackingRecommendations(trip: Trip): Promise<ApiResponse<PackingItem[]>> {
  return apiRequest<PackingItem[]>(`/api/travel/trips/${trip.id}/packing`, {
    mockHandler: () => mockGetPacking(trip),
  });
}

export async function getWeather(location?: string): Promise<ApiResponse<WeatherData>> {
  return apiRequest<WeatherData>('/api/travel/weather', {
    params: { location },
    mockHandler: () => getMockWeather(),
  });
}
