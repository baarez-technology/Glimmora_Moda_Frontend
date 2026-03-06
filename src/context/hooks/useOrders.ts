'use client';

import { useState, useCallback } from 'react';
import type { ConsiderationItem } from '@/types';

export interface OrderRecord {
  id: string;
  items: ConsiderationItem[];
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
}

interface UseOrdersProps {
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

export function useOrders({ safeLocalStorageSave }: UseOrdersProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const addOrder = useCallback((items: ConsiderationItem[], total: number) => {
    const orderId = `MG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const newOrder: OrderRecord = {
      id: orderId,
      items,
      total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: deliveryDate.toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    return orderId;
  }, []);

  // Persist to localStorage
  const persistOrders = useCallback((items: OrderRecord[]) => {
    safeLocalStorageSave('moda-orders', items);
  }, [safeLocalStorageSave]);

  return {
    orders,
    setOrders,
    addOrder,
    persistOrders
  };
}
