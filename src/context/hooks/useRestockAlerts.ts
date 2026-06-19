'use client';

import { useState, useCallback } from 'react';
import type { Product } from '@/types';
import {
  subscribeRestockAlert,
  unsubscribeRestockAlert,
  listRestockAlerts,
  type ServerRestockSubscription,
} from '@/services/restock-alert.service';

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

function serverToLocal(sub: ServerRestockSubscription): RestockAlert {
  alertCounter += 1;
  // Server doesn't return full Product — fill minimum required shape from subscription data.
  const product = {
    id: sub.productId,
    name: sub.productName,
    images: sub.productImage
      ? [{ id: '1', url: sub.productImage, alt: sub.productName, type: 'hero' as const }]
      : [],
  } as unknown as Product;
  return {
    id: `alert-${Date.now()}-${alertCounter}`,
    productId: sub.productId,
    product,
    status: 'watching',
    createdAt: sub.subscribedAt,
  };
}

export function useRestockAlerts({ showToast, safeLocalStorageSave }: UseRestockAlertsProps) {
  const [restockAlerts, setRestockAlerts] = useState<RestockAlert[]>([]);

  // Hydrate from BE — call once on mount when token is available.
  const hydrateRestockAlerts = useCallback(async () => {
    try {
      const subs = await listRestockAlerts();
      setRestockAlerts(subs.map(serverToLocal));
    } catch {
      // Silent — caller renders empty list if BE unavailable.
    }
  }, []);

  const addRestockAlert = useCallback(async (product: Product, size?: string, color?: string) => {
    if (restockAlerts.some(a => a.productId === product.id)) {
      showToast('Already watching this item', 'info');
      return;
    }
    try {
      await subscribeRestockAlert(product.id);
      alertCounter += 1;
      const newAlert: RestockAlert = {
        id: `alert-${Date.now()}-${alertCounter}`,
        productId: product.id,
        product,
        preferredSize: size,
        preferredColor: color,
        status: 'watching',
        createdAt: new Date().toISOString(),
      };
      setRestockAlerts(prev => [...prev, newAlert]);
      showToast('You will be notified when available', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not subscribe';
      showToast(msg, 'error');
    }
  }, [restockAlerts, showToast]);

  const removeRestockAlert = useCallback(async (id: string) => {
    const alert = restockAlerts.find(a => a.id === id);
    if (!alert) return;
    try {
      await unsubscribeRestockAlert(alert.productId);
      setRestockAlerts(prev => prev.filter(a => a.id !== id));
      showToast('Alert removed', 'info');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not unsubscribe';
      showToast(msg, 'error');
    }
  }, [restockAlerts, showToast]);

  const hasRestockAlert = useCallback((productId: string) => {
    return restockAlerts.some(a => a.productId === productId);
  }, [restockAlerts]);

  // Kept for backwards compat — localStorage is no longer the source of truth, BE is.
  const persistAlerts = useCallback((items: RestockAlert[]) => {
    safeLocalStorageSave('moda-restock-alerts', items);
  }, [safeLocalStorageSave]);

  return {
    restockAlerts,
    setRestockAlerts,
    addRestockAlert,
    removeRestockAlert,
    hasRestockAlert,
    hydrateRestockAlerts,
    persistAlerts,
  };
}
