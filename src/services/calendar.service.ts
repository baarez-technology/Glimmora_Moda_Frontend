/**
 * Calendar Service
 * Endpoints: /api/calendar/*
 */

import { apiRequest } from './api-client';
import type { ApiResponse } from './api-client';
import type { CalendarEvent, CalendarConnection } from '@/types';
import {
  mockCalendarConnections,
  baseCalendarEvents,
  getUpcomingEvents as mockGetUpcoming,
  getEventById as mockGetById,
  getEventsByType as mockGetByType
} from '@/data/calendar';

export async function getCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
  return apiRequest<CalendarEvent[]>('/api/calendar/events', {
    mockHandler: () => baseCalendarEvents as CalendarEvent[],
  });
}

export async function getCalendarConnections(): Promise<ApiResponse<CalendarConnection[]>> {
  return apiRequest<CalendarConnection[]>('/api/calendar/connections', {
    mockHandler: () => mockCalendarConnections,
  });
}

export async function getUpcomingEvents(days?: number): Promise<ApiResponse<CalendarEvent[]>> {
  return apiRequest<CalendarEvent[]>('/api/calendar/events/upcoming', {
    params: { days },
    mockHandler: () => mockGetUpcoming(days) as CalendarEvent[],
  });
}

export async function getEventById(id: string): Promise<ApiResponse<CalendarEvent | null>> {
  return apiRequest<CalendarEvent | null>(`/api/calendar/events/${id}`, {
    mockHandler: () => (mockGetById(id) as CalendarEvent) ?? null,
  });
}

export async function getEventsByType(eventType: string): Promise<ApiResponse<CalendarEvent[]>> {
  return apiRequest<CalendarEvent[]>(`/api/calendar/events/by-type/${eventType}`, {
    mockHandler: () => mockGetByType(eventType) as CalendarEvent[],
  });
}

export async function syncCalendar(provider: string): Promise<ApiResponse<{ synced: boolean }>> {
  return apiRequest<{ synced: boolean }>(`/api/calendar/sync/${provider}`, {
    method: 'POST',
    mockHandler: () => ({ synced: true }),
  });
}
