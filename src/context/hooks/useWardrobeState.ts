'use client';

import { useState, useCallback } from 'react';
import type { Product, WardrobeItem } from '@/types';
import { products } from '@/data/mock-data';

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
      // Initialize with first product from mock data for demo
      const diorProduct = products.find(p => p.brandName === 'Dior');
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
  }, []);

  const addToWardrobe = useCallback((product: Product) => {
    setWardrobe(prev => {
      if (prev.some(w => w.productId === product.id)) {
        showToast('Already in your wardrobe', 'info');
        return prev;
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
      showToast(`${product.name} added to wardrobe`, 'success');
      return [...prev, newItem];
    });
  }, [showToast]);

  const removeFromWardrobe = useCallback((id: string) => {
    setWardrobe(prev => {
      const item = prev.find(w => w.id === id);
      if (item) {
        showToast(`${item.product.name} removed from wardrobe`, 'info');
      }
      return prev.filter(w => w.id !== id);
    });
  }, [showToast]);

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
