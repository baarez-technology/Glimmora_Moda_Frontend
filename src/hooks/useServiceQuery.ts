/**
 * useServiceQuery — Data fetching hook for service layer
 *
 * Wraps async service calls with loading/error/data state.
 * Replaces direct mock data imports in client components.
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useServiceQuery(
 *     () => productService.getFeaturedProducts()
 *   );
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '@/services/api-client';

interface UseServiceQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useServiceQuery<T>(
  queryFn: () => Promise<ApiResponse<T>>,
  options?: {
    enabled?: boolean;
    initialData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseServiceQueryResult<T> {
  const [data, setData] = useState<T | null>(options?.initialData ?? null);
  const [isLoading, setIsLoading] = useState(options?.enabled !== false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await queryFnRef.current();
      if (!mountedRef.current) return;
      if (response.success) {
        setData(response.data);
        options?.onSuccess?.(response.data);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      options?.onError?.(message);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    if (options?.enabled !== false) {
      fetchData();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, options?.enabled]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * useServiceMutation — For create/update/delete operations
 *
 * Usage:
 *   const { mutate, isLoading, error } = useServiceMutation(
 *     (data) => productService.createProduct(data)
 *   );
 *   await mutate(newProductData);
 */
interface UseServiceMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput | null>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useServiceMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<ApiResponse<TOutput>>,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
  }
): UseServiceMutationResult<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (input: TInput): Promise<TOutput | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mutationFn(input);
      if (response.success) {
        options?.onSuccess?.(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mutation failed';
      setError(message);
      options?.onError?.(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, reset };
}
