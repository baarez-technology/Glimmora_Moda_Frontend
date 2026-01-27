'use client';

import { useState, useCallback } from 'react';
import type { Product } from '@/types';

// Counter to ensure unique IDs even when called multiple times in the same millisecond
let alertCounter = 0;

export interface RestockAlert {
  id: string;
  productId: string;
  product: Product;
  preferredSize?: string;
  preferredColor?: string;
  status: 'watching' | 'available' | 'notified';
  createdAt: string;
  notifiedAt?: string;
}

interface UseRestockAlertsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

export function useRestockAlerts({ showToast, safeLocalStorageSave }: UseRestockAlertsProps) {
  const [restockAlerts, setRestockAlerts] = useState<RestockAlert[]>([]);

  const addRestockAlert = useCallback((product: Product, size?: string, color?: string) => {
    setRestockAlerts(prev => {
      if (prev.some(a => a.productId === product.id)) {
        showToast('Already watching this item', 'info');
        return prev;
      }

      alertCounter += 1;
      const newAlert: RestockAlert = {
        id: `alert-${Date.now()}-${alertCounter}`,
        productId: product.id,
        product,
        preferredSize: size,
        preferredColor: color,
        status: 'watching',
        createdAt: new Date().toISOString()
      };
      showToast('You will be notified when available', 'success');
      return [...prev, newAlert];
    });
  }, [showToast]);

  const removeRestockAlert = useCallback((id: string) => {
    setRestockAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert removed', 'info');
  }, [showToast]);

  const hasRestockAlert = useCallback((productId: string) => {
    return restockAlerts.some(a => a.productId === productId);
  }, [restockAlerts]);

  // Persist to localStorage
  const persistAlerts = useCallback((items: RestockAlert[]) => {
    safeLocalStorageSave('moda-restock-alerts', items);
  }, [safeLocalStorageSave]);

  return {
    restockAlerts,
    setRestockAlerts,
    addRestockAlert,
    removeRestockAlert,
    hasRestockAlert,
    persistAlerts
  };
}
