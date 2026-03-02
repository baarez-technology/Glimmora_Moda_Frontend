import { useState, useCallback, useEffect } from 'react';
import type { FashionIdentity } from '@/types';
import * as userService from '@/services/user.service';

interface UseFashionIdentityProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

const STORAGE_KEY = 'moda-fashion-identity';

// Valid IDs that match onboarding options and backend expectations
const VALID_OCCASION_IDS = ['professional', 'social', 'casual', 'formal', 'travel', 'art'];
const VALID_AESTHETIC_IDS = ['minimal', 'classic', 'artistic', 'contemporary'];

/**
 * Sanitize a FashionIdentity by removing any occasion/aesthetic IDs
 * that don't match the current valid set (cleans up stale mock data).
 */
function sanitizeFashionIdentity(identity: FashionIdentity): FashionIdentity {
  return {
    ...identity,
    occasions: identity.occasions.filter(id => VALID_OCCASION_IDS.includes(id)),
    aesthetics: identity.aesthetics.filter(id => VALID_AESTHETIC_IDS.includes(id)),
  };
}

/**
 * Build a FashionIdentity from the backend UserData stored in moda-user-data.
 * Returns null if no valid data is found.
 */
function buildFromUserData(): FashionIdentity | null {
  try {
    const raw = localStorage.getItem('moda-user-data');
    if (!raw) return null;
    const userData = JSON.parse(raw);
    if (!userData.occasions?.length && !userData.aesthetics?.length) return null;
    return {
      occasions: (userData.occasions || []).filter((id: string) => VALID_OCCASION_IDS.includes(id)),
      aesthetics: (userData.aesthetics || []).filter((id: string) => VALID_AESTHETIC_IDS.includes(id)),
      confidenceLevel: 'guided',
      budgetRange: {
        min: userData.minimum_budget ?? 0,
        max: userData.maximum_budget ?? 0,
      },
      primaryLocation: '',
      travelDestinations: [],
    };
  } catch {
    return null;
  }
}

export function useFashionIdentity({ showToast, safeLocalStorageSave }: UseFashionIdentityProps) {
  const [fashionIdentity, setFashionIdentityState] = useState<FashionIdentity | null>(null);

  // Load default fashion identity from service on mount
  // Priority: localStorage (via initializeFashionIdentity) > backend UserData > mock service
  useEffect(() => {
    userService.getFashionIdentity().then(response => {
      if (response.success && response.data) {
        setFashionIdentityState(prev => {
          if (prev) return prev; // localStorage already loaded — don't overwrite

          // Try backend UserData first (has real user selections)
          const fromBackend = buildFromUserData();
          if (fromBackend && (fromBackend.occasions.length > 0 || fromBackend.aesthetics.length > 0)) {
            return fromBackend;
          }

          // Fall back to service response (mock) but sanitize stale IDs
          return response.data ? sanitizeFashionIdentity(response.data) : null;
        });
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
          // Sanitize any stale IDs from old format
          setFashionIdentityState(sanitizeFashionIdentity(parsed));
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored fashion identity:', e);
      }
    }

    // If no valid stored fashion identity, try to build from backend UserData
    const fromBackend = buildFromUserData();
    if (fromBackend && (fromBackend.occasions.length > 0 || fromBackend.aesthetics.length > 0)) {
      setFashionIdentityState(fromBackend);
      return;
    }

    // If nothing found, the useEffect fallback to service mock will handle it
  }, []);

  return {
    fashionIdentity,
    setFashionIdentity,
    updateFashionIdentity,
    persistFashionIdentity,
    initializeFashionIdentity
  };
}
