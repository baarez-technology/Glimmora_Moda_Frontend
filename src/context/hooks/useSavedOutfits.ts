'use client';

import { useState, useCallback } from 'react';

// Counter to ensure unique IDs even when called multiple times in the same millisecond
let outfitCounter = 0;

export interface SavedOutfit {
  id: string;
  name: string;
  eventId?: string;
  items: string[]; // product IDs
  savedAt: string;
}

interface UseSavedOutfitsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

export function useSavedOutfits({ showToast, safeLocalStorageSave }: UseSavedOutfitsProps) {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);

  const saveOutfit = useCallback((name: string, productIds: string[], eventId?: string) => {
    outfitCounter += 1;
    const newOutfit: SavedOutfit = {
      id: `outfit-${Date.now()}-${outfitCounter}`,
      name,
      eventId,
      items: productIds,
      savedAt: new Date().toISOString()
    };
    setSavedOutfits(prev => [...prev, newOutfit]);
    showToast(`"${name}" outfit saved`, 'success');
  }, [showToast]);

  const removeOutfit = useCallback((id: string) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== id));
    showToast('Outfit removed', 'info');
  }, [showToast]);

  // Persist to localStorage
  const persistOutfits = useCallback((items: SavedOutfit[]) => {
    safeLocalStorageSave('moda-outfits', items);
  }, [safeLocalStorageSave]);

  return {
    savedOutfits,
    setSavedOutfits,
    saveOutfit,
    removeOutfit,
    persistOutfits
  };
}
