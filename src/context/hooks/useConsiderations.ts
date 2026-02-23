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
    // Check if already in considerations before updating state
    const alreadyInConsiderations = considerations.some(c => c.productId === product.id);

    if (alreadyInConsiderations) {
      // Update existing item
      setConsiderations(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, selectedVariants: variants || item.selectedVariants, agiNote: agiNote || item.agiNote }
          : item
      ));
      showToast('Updated in your considerations', 'info');
    } else {
      // Add new item
      considerationCounter += 1;
      const newItem: ConsiderationItem = {
        id: `consideration-${Date.now()}-${considerationCounter}`,
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
        selectedVariants: variants || {},
        agiNote,
        quantity: 1
      };
      setConsiderations(prev => [...prev, newItem]);
      showToast(`${product.name} added to considerations`, 'success');
    }
  }, [showToast, considerations]);

  const removeFromConsiderations = useCallback((id: string) => {
    // Find item before updating state to get the name for toast
    const item = considerations.find(c => c.id === id);
    setConsiderations(prev => prev.filter(c => c.id !== id));
    if (item) {
      showToast(`${item.product.name} removed from considerations`, 'info');
    }
  }, [showToast, considerations]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setConsiderations(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  }, []);

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
    updateQuantity,
    clearConsiderations,
    isInConsiderations,
    persistConsiderations
  };
}
