'use client';

import { useState, useCallback } from 'react';
import type { Product, ConsiderationItem } from '@/types';

interface UseConsiderationsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

// Counter to ensure unique IDs even when called multiple times in the same millisecond
let considerationCounter = 0;

export function useConsiderations({ showToast, safeLocalStorageSave }: UseConsiderationsProps) {
  const [considerations, setConsiderations] = useState<ConsiderationItem[]>([]);

  const addToConsiderations = useCallback((
    product: Product,
    variants?: { size?: string; color?: string },
    agiNote?: string
  ) => {
    setConsiderations(prev => {
      const existingIndex = prev.findIndex(c => c.productId === product.id);

      if (existingIndex >= 0) {
        // Update existing item
        const updated = prev.map((item, index) =>
          index === existingIndex
            ? { ...item, selectedVariants: variants || item.selectedVariants, agiNote: agiNote || item.agiNote }
            : item
        );
        showToast('Updated in your considerations', 'info');
        return updated;
      } else {
        // Add new item
        considerationCounter += 1;
        const newItem: ConsiderationItem = {
          id: `consideration-${Date.now()}-${considerationCounter}`,
          productId: product.id,
          product,
          addedAt: new Date().toISOString(),
          selectedVariants: variants || {},
          agiNote
        };
        showToast(`${product.name} added to considerations`, 'success');
        return [...prev, newItem];
      }
    });
  }, [showToast]);

  const removeFromConsiderations = useCallback((id: string) => {
    setConsiderations(prev => {
      const item = prev.find(c => c.id === id);
      if (item) {
        showToast(`${item.product.name} removed from considerations`, 'info');
      }
      return prev.filter(c => c.id !== id);
    });
  }, [showToast]);

  const clearConsiderations = useCallback(() => {
    setConsiderations([]);
  }, []);

  const isInConsiderations = useCallback((productId: string) => {
    return considerations.some(c => c.productId === productId);
  }, [considerations]);

  // Persist to localStorage
  const persistConsiderations = useCallback((items: ConsiderationItem[]) => {
    safeLocalStorageSave('moda-considerations', items);
  }, [safeLocalStorageSave]);

  return {
    considerations,
    setConsiderations,
    addToConsiderations,
    removeFromConsiderations,
    clearConsiderations,
    isInConsiderations,
    persistConsiderations
  };
}
