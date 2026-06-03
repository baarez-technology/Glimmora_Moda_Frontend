/**
 * Centralized API Client
 *
 * Dual-mode client that supports mock data (current) and real API (future).
 * Backend team: implement REST endpoints matching the endpoint strings in service files.
 * Switch to real mode: configureApiClient({ mode: 'real', baseUrl: 'https://api.modaglimmora.com' })
 */

// ============================================
// Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: true;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: true;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// ============================================
// Configuration
// ============================================

export interface ApiClientConfig {
  mode: 'mock' | 'real';
  baseUrl?: string;
  mockDelay?: number;
  headers?: Record<string, string>;
  onError?: (error: ApiError) => void;
  getAuthToken?: () => string | null;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// Client Instance
// ============================================

const DEFAULT_CONFIG: ApiClientConfig = {
  mode: 'mock',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  mockDelay: 300,
  getAuthToken: () => {
    try {
      return localStorage.getItem('moda-brand-token');
    } catch {
      return null;
    }
  },
};

let config: ApiClientConfig = { ...DEFAULT_CONFIG };

export function configureApiClient(overrides: Partial<ApiClientConfig>): void {
  config = { ...config, ...overrides };
}

export function getApiConfig(): Readonly<ApiClientConfig> {
  return config;
}

// ============================================
// Request Deduplication
// ============================================

// Tracks in-flight GET requests by cache key so concurrent identical calls share one fetch
const pendingRequests = new Map<string, Promise<ApiResponse<unknown>>>();

function getDedupeKey(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const sorted = params ? Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('&') : '';
  return `${endpoint}?${sorted}`;
}

// ============================================
// Internal Helpers
// ============================================

async function simulateDelay(): Promise<void> {
  if (config.mode !== 'mock' || !config.mockDelay) return;
  const jitter = config.mockDelay * 0.2;
  const delay = config.mockDelay + (Math.random() * jitter * 2 - jitter);
  return new Promise(resolve => setTimeout(resolve, delay));
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const url = new URL(endpoint, base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };
  const token = config.getAuthToken?.();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================
// Core Request Functions
// ============================================

/**
 * Execute an API request.
 * In mock mode: runs mockHandler with simulated delay.
 * In real mode: calls fetch() against the configured baseUrl.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    mockHandler: () => T | Promise<T>;
  }
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params, mockHandler } = options;

  if (config.mode === 'mock') {
    await simulateDelay();
    const data = await mockHandler();
    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // Deduplicate concurrent identical GET requests
  if (method === 'GET') {
    const key = getDedupeKey(endpoint, params);
    const existing = pendingRequests.get(key);
    if (existing) return existing as Promise<ApiResponse<T>>;
    const promise = executeRequest<T>(endpoint, method, body, params).finally(() => pendingRequests.delete(key));
    pendingRequests.set(key, promise as Promise<ApiResponse<unknown>>);
    return promise;
  }

  return executeRequest<T>(endpoint, method, body, params);
}

async function executeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body: unknown,
  params: Record<string, string | number | boolean | undefined> | undefined,
): Promise<ApiResponse<T>> {
  const maxAttempts = method === 'GET' ? 3 : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
    let response: Response;
    try {
      response = await fetch(buildUrl(endpoint, params), {
        method,
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      lastError = fetchErr;
      continue;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status >= 500 && attempt < maxAttempts - 1) {
      lastError = new ApiError('SERVER_ERROR', `Server error ${response.status}`, response.status);
      continue;
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        const current = window.location.pathname;
        // Skip auto-redirect on auth pages and the public landing page —
        // landing fires no auth-required calls, but any leaked one (e.g. stale
        // Header API call) must not bounce anonymous visitors to /auth/login.
        const isPublicPath = current === '/' || current.startsWith('/auth');
        if (!isPublicPath) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(current)}&reason=session_expired`;
        }
      }
      const errorBody = await response.json().catch(() => ({}));
      const err = new ApiError(
        errorBody.code || 'HTTP_ERROR',
        errorBody.message || `Request failed with status ${response.status}`,
        response.status,
        errorBody.details
      );
      config.onError?.(err);
      throw err;
    }

    const responseData = await response.json();
    return {
      data: responseData.data ?? responseData,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  const finalError = lastError instanceof ApiError
    ? lastError
    : new ApiError('NETWORK_ERROR', lastError instanceof Error ? lastError.message : 'Request failed after retries');
  config.onError?.(finalError);
  throw finalError;
}

// ============================================
// Pagination Helpers
// ============================================

export function paginateMockData<T>(
  data: T[],
  params: PaginationParams = {}
): PaginatedResponse<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: data.slice(start, end),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    success: true,
    timestamp: new Date().toISOString(),
  };
}

export async function apiPaginatedRequest<T>(
  endpoint: string,
  options: {
    pagination?: PaginationParams;
    filters?: FilterParams;
    mockHandler: (pagination: PaginationParams, filters?: FilterParams) => T[];
  }
): Promise<PaginatedResponse<T>> {
  const { pagination = {}, filters, mockHandler } = options;

  if (config.mode === 'mock') {
    await simulateDelay();
    const allData = mockHandler(pagination, filters);
    return paginateMockData(allData, pagination);
  }

  // Real API mode
  const params: Record<string, string | number | boolean | undefined> = {};
  if (pagination.page) params.page = pagination.page;
  if (pagination.pageSize) params.pageSize = pagination.pageSize;
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params[key] = String(value);
    });
  }

  const response = await fetch(buildUrl(endpoint, params), {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new ApiError('HTTP_ERROR', `Request failed: ${response.status}`, response.status);
  }
  return response.json();
}

// ============================================
// ID Generator (for mock CRUD)
// ============================================

let idCounter = 0;
export function generateMockId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}
