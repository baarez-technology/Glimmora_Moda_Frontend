/**
 * Lightweight in-memory API cache with TTL + request deduplication + fetch timeout.
 *
 * Usage:
 *   const data = await cachedFetch('brands', () => getRecommendedBrands(), 300_000);
 *   const res = await fetchWithTimeout('/api/v1/brands', { headers }, 10_000);
 *
 * - Deduplicates in-flight requests (same key → same promise)
 * - Returns cached data if it's still within TTL
 * - Automatically evicts stale entries
 * - fetchWithTimeout aborts requests that exceed the timeout
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Default TTL: 5 minutes */
const DEFAULT_TTL = 5 * 60 * 1000;

/** Default fetch timeout: 15 seconds */
const DEFAULT_TIMEOUT = 15_000;

/**
 * Wrapper around fetch() that auto-aborts after a timeout.
 *
 * @param url      Request URL
 * @param options  Standard RequestInit options
 * @param timeout  Timeout in ms (default 15s)
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    // Auto-redirect to login on 401 (expired/invalid token)
    if (response.status === 401 && typeof window !== 'undefined') {
      const isAuthEndpoint = url.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('moda-user-token');
        localStorage.removeItem('moda-brand-token');
        try { sessionStorage.clear(); } catch { /* ignore */ }
        window.location.href = '/auth/login';
        throw new Error('Session expired — redirecting to login');
      }
    }
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Fetch data with caching + request deduplication.
 *
 * @param key    Unique cache key (e.g. 'brands', 'product-detail-123')
 * @param fetcher  Async function that returns the data
 * @param ttl    Time-to-live in ms (default 5 min)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // 1. Return cached if fresh
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  // 2. Deduplicate in-flight requests
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  // 3. Make the real call
  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, expiresAt: Date.now() + ttl });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

/** Invalidate a specific cache key */
export function invalidateCache(key: string) {
  cache.delete(key);
  inflight.delete(key);
}

/** Invalidate all keys matching a prefix (e.g. 'product-' clears all product caches) */
export function invalidateCacheByPrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) {
      inflight.delete(key);
    }
  }
}

/** Clear the entire cache */
export function clearCache() {
  cache.clear();
  inflight.clear();
}
