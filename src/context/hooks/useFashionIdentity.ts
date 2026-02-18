import { useState, useCallback, useEffect } from 'react';
import type { FashionIdentity } from '@/types';
import * as userService from '@/services/user.service';

interface UseFashionIdentityProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

const STORAGE_KEY = 'moda-fashion-identity';

export function useFashionIdentity({ showToast, safeLocalStorageSave }: UseFashionIdentityProps) {
  const [fashionIdentity, setFashionIdentityState] = useState<FashionIdentity | null>(null);

  // Load default fashion identity from service on mount
  useEffect(() => {
    userService.getFashionIdentity().then(response => {
      if (response.success) {
        setFashionIdentityState(prev => prev ?? response.data);
      }
    }).catch(() => { /* keep null */ });
  }, []);

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
    // If no valid stored data, service default will be loaded via useEffect
  }, []);

  return {
    fashionIdentity,
    setFashionIdentity,
    updateFashionIdentity,
    persistFashionIdentity,
    initializeFashionIdentity
  };
}
