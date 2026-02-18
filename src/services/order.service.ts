/**
 * Order Service
 * Endpoints: /api/orders/*
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';
import type { Order, OrderStatus, ConsiderationItem, Address } from '@/types';

export interface CreateOrderRequest {
  items: ConsiderationItem[];
  total: number;
  shippingAddress?: Address;
}

export async function getOrders(): Promise<ApiResponse<Order[]>> {
  return apiRequest<Order[]>('/api/orders', {
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-orders');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    },
  });
}

export async function getOrderById(id: string): Promise<ApiResponse<Order | null>> {
  return apiRequest<Order | null>(`/api/orders/${id}`, {
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-orders');
        const orders: Order[] = stored ? JSON.parse(stored) : [];
        return orders.find(o => o.id === id) ?? null;
      } catch { return null; }
    },
  });
}

export async function createOrder(request: CreateOrderRequest): Promise<ApiResponse<Order>> {
  return apiRequest<Order>('/api/orders', {
    method: 'POST',
    body: request,
    mockHandler: () => {
      const order: Order = {
        id: generateMockId('order'),
        items: request.items.map(item => ({
          productId: item.productId,
          product: item.product,
          quantity: 1,
          price: item.product.price,
          selectedVariants: item.selectedVariants,
        })),
        total: request.total,
        currency: 'EUR',
        status: 'confirmed' as OrderStatus,
        createdAt: new Date().toISOString(),
        shippingAddress: request.shippingAddress ?? {
          fullName: '', line1: '', city: '', state: '', postalCode: '', country: '', phone: '',
        },
      };
      return order;
    },
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  return apiRequest<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
    mockHandler: () => {
      try {
        const stored = localStorage.getItem('moda-orders');
        const orders: Order[] = stored ? JSON.parse(stored) : [];
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error(`Order ${id} not found`);
        return { ...order, status };
      } catch { throw new Error(`Order ${id} not found`); }
    },
  });
}
