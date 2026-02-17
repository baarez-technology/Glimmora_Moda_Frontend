import { useState, useCallback } from 'react';
import type { FashionIdentity } from '@/types';
import { mockUser } from '@/data/mock-data';

interface UseFashionIdentityProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

const STORAGE_KEY = 'moda-fashion-identity';

export function useFashionIdentity({ showToast, safeLocalStorageSave }: UseFashionIdentityProps) {
  // Initialize with mockUser data as default
  const [fashionIdentity, setFashionIdentityState] = useState<FashionIdentity | null>(mockUser.fashionIdentity ?? null);

  const setFashionIdentity = useCallback((identity: FashionIdentity | null) => {
    setFashionIdentityState(identity);
  }, []);

  const updateFashionIdentity = useCallback((identity: FashionIdentity) => {
    setFashionIdentityState(identity);
    showToast('Style profile updated successfully', 'success');
  }, [showToast]);

  const persistFashionIdentity = useCallback((identity: FashionIdentity | null) => {
    if (identity) {
      safeLocalStorageSave(STORAGE_KEY, identity);
    }
  }, [safeLocalStorageSave]);

  const initializeFashionIdentity = useCallback((storedData: string | null) => {
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Validate that parsed data has required fields
        if (parsed.occasions && parsed.aesthetics) {
          setFashionIdentityState(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored fashion identity:', e);
      }
    }
    // If no valid stored data, keep using mockUser default
    setFashionIdentityState(mockUser.fashionIdentity ?? null);
  }, []);

  return {
    fashionIdentity,
    setFashionIdentity,
    updateFashionIdentity,
    persistFashionIdentity,
    initializeFashionIdentity
  };
}
