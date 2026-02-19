/**
 * Services Barrel Export
 *
 * Centralized API service layer for ModaGlimmora.
 * All data access should go through these services.
 *
 * Usage:
 *   import { productService, brandService } from '@/services';
 *   const { data } = await productService.getFeaturedProducts();
 *
 * To switch from mock to real API:
 *   import { configureApiClient } from '@/services';
 *   configureApiClient({ mode: 'real', baseUrl: 'https://api.modaglimmora.com' });
 */

// Core API client
export {
  configureApiClient,
  getApiConfig,
  apiRequest,
  apiPaginatedRequest,
  paginateMockData,
  generateMockId,
  ApiError,
} from './api-client';

export type {
  ApiResponse,
  ApiErrorResponse,
  ApiResult,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  ApiClientConfig,
} from './api-client';

// Domain Services
export * as authService from './auth.service';
export * as productService from './product.service';
export * as brandService from './brand.service';
export * as collectionService from './collection.service';
export * as orderService from './order.service';
export * as userService from './user.service';
export * as wardrobeService from './wardrobe.service';
export * as calendarService from './calendar.service';
export * as uhniService from './uhni.service';
export * as intelligenceService from './intelligence.service';
export * as brandPortalService from './brand-portal.service';
export * as brandIntelligenceService from './brand-intelligence.service';
export * as uploadService from './upload.service';
