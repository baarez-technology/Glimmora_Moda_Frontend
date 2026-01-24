/**
 * Order Types
 *
 * Order, order items, and address type definitions.
 */

import type { Product } from './product';

// Order Status
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// Address
export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Order Item
export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariants: {
    size?: string;
    color?: string;
  };
}

// Order
export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  currency: string;
  shippingAddress: Address;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}
