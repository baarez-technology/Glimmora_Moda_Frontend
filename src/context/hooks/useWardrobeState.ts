'use client';

import { useState, useCallback } from 'react';
import type { Product, WardrobeItem } from '@/types';
import * as productService from '@/services/product.service';

// Counter to ensure unique IDs even when called multiple times in the same millisecond
let wardrobeCounter = 0;

interface UseWardrobeStateProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

export function useWardrobeState({ showToast, safeLocalStorageSave }: UseWardrobeStateProps) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);

  const initializeWardrobe = useCallback((storedWardrobe: string | null) => {
    if (storedWardrobe) {
      setWardrobe(JSON.parse(storedWardrobe));
    } else {
      // Demo: seed wardrobe with one product for showcase
      productService.getAllProducts().then(response => {
        if (response.success) {
          const diorProduct = response.data.find(p => p.brandName === 'Dior');
          if (diorProduct) {
            setWardrobe([{
              id: 'wardrobe-1',
              productId: diorProduct.id,
              product: diorProduct,
              addedAt: new Date().toISOString(),
              wearCount: 5,
              lastWorn: '2024-01-15',
              outfitCompatibility: ['professional', 'evening']
            }]);
          }
        }
      }).catch(() => { /* start with empty wardrobe */ });
    }
  }, []);

  const addToWardrobe = useCallback((product: Product) => {
    // Check if already in wardrobe before updating state
    const alreadyInWardrobe = wardrobe.some(w => w.productId === product.id);

    if (alreadyInWardrobe) {
      showToast('Already in your wardrobe', 'info');
      return;
    }

    wardrobeCounter += 1;
    const newItem: WardrobeItem = {
      id: `wardrobe-${Date.now()}-${wardrobeCounter}`,
      productId: product.id,
      product,
      addedAt: new Date().toISOString(),
      wearCount: 0,
      outfitCompatibility: []
    };

    setWardrobe(prev => [...prev, newItem]);
    showToast(`${product.name} added to wardrobe`, 'success');
  }, [showToast, wardrobe]);

  const removeFromWardrobe = useCallback((id: string) => {
    const item = wardrobe.find(w => w.id === id);
    setWardrobe(prev => prev.filter(w => w.id !== id));
    if (item) {
      showToast(`${item.product.name} removed from wardrobe`, 'info');
    }
  }, [showToast, wardrobe]);

  const isInWardrobe = useCallback((productId: string) => {
    return wardrobe.some(w => w.productId === productId);
  }, [wardrobe]);

  // Persist to localStorage
  const persistWardrobe = useCallback((items: WardrobeItem[]) => {
    safeLocalStorageSave('moda-wardrobe', items);
  }, [safeLocalStorageSave]);

  return {
    wardrobe,
    setWardrobe,
    initializeWardrobe,
    addToWardrobe,
    removeFromWardrobe,
    isInWardrobe,
    persistWardrobe
  };
}
