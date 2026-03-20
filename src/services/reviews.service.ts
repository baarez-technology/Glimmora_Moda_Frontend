/**
 * Customer Reviews Service
 *
 * Manages product reviews using localStorage as a temporary data store.
 * Consumers can submit reviews for delivered orders; brands can view all their reviews.
 */

import { getStoredUserToken } from './auth.service';

// ── Types ────────────────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  brand_name: string;
  customer_id: string;
  customer_name: string;
  rating: number; // 1-5
  title: string;
  content: string;
  created_at: string;
}

export interface ReviewableOrder {
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  brand_name: string;
}

export interface SubmitReviewData {
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  brand_name: string;
  rating: number;
  title: string;
  content: string;
}

// ── localStorage helpers ─────────────────────────────────────────────

const LS_KEY = 'moda-reviews';

function readAllReviews(): ProductReview[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAllReviews(reviews: ProductReview[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(reviews));
}

// ── Helpers to get current user info ─────────────────────────────────

function getCurrentCustomerId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const token = getStoredUserToken();
    if (token) {
      // Decode JWT payload to extract user_id
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub || '';
    }
  } catch { /* ignore */ }
  return 'consumer-user';
}

function getCurrentCustomerName(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem('moda-auth-user');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.first_name && data.last_name) return `${data.first_name} ${data.last_name}`;
      if (data.name) return data.name;
    }
  } catch { /* ignore */ }
  return 'Verified Customer';
}

// ── Brand helpers ────────────────────────────────────────────────────

function getCurrentBrandName(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem('moda-brand-partner');
    if (stored) {
      const data = JSON.parse(stored);
      return data.brandName || '';
    }
  } catch { /* ignore */ }
  return '';
}

// ── Service Functions ────────────────────────────────────────────────

/** Get all reviews submitted by the current customer */
export function getReviewsByCustomer(): ProductReview[] {
  const customerId = getCurrentCustomerId();
  return readAllReviews().filter(r => r.customer_id === customerId);
}

/** Get all reviews for the current brand (by brand_name match) */
export function getReviewsByBrand(): ProductReview[] {
  const brandName = getCurrentBrandName();
  if (!brandName) return readAllReviews(); // Fallback: return all if brand not identified
  return readAllReviews().filter(r => r.brand_name.toLowerCase() === brandName.toLowerCase());
}

/** Submit a new review */
export function submitReview(data: SubmitReviewData): ProductReview {
  const reviews = readAllReviews();

  // Prevent duplicate reviews for the same order+product
  const existing = reviews.find(
    r => r.order_id === data.order_id && r.product_id === data.product_id
  );
  if (existing) {
    throw new Error('You have already reviewed this product for this order.');
  }

  const review: ProductReview = {
    id: `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    order_id: data.order_id,
    product_id: data.product_id,
    product_name: data.product_name,
    product_image: data.product_image,
    brand_name: data.brand_name,
    customer_id: getCurrentCustomerId(),
    customer_name: getCurrentCustomerName(),
    rating: Math.max(1, Math.min(5, Math.round(data.rating))),
    title: data.title,
    content: data.content,
    created_at: new Date().toISOString(),
  };

  reviews.unshift(review);
  writeAllReviews(reviews);
  return review;
}

/** Get delivered orders that haven't been reviewed yet */
export function getReviewableOrders(): ReviewableOrder[] {
  if (typeof window === 'undefined') return [];

  // Read orders from the order-management service localStorage
  let orders: Array<{
    order_id: string;
    delivery_status: string;
    products: Array<{
      product_id: string;
      product_name: string;
      product_image?: string;
      brand_id?: string;
    }>;
  }> = [];

  try {
    const stored = localStorage.getItem('moda-customer-orders');
    if (stored) {
      orders = JSON.parse(stored);
    }
  } catch { /* ignore */ }

  // Also check old key
  if (orders.length === 0) {
    try {
      const stored = localStorage.getItem('moda-orders');
      if (stored) {
        const oldOrders = JSON.parse(stored);
        orders = oldOrders.map((o: Record<string, unknown>) => ({
          order_id: (o.order_id || o.id || '') as string,
          delivery_status: (o.delivery_status || o.status || '') as string,
          products: ((o.products || o.items || []) as Array<Record<string, unknown>>).map((item) => ({
            product_id: (item.product_id || item.productId || '') as string,
            product_name: (item.product_name || (item.product as Record<string, unknown>)?.name || '') as string,
            product_image: (item.product_image || ((item.product as Record<string, unknown>)?.images as Array<Record<string, unknown>> | undefined)?.[0]?.url || '') as string,
          })),
        }));
      }
    } catch { /* ignore */ }
  }

  // Filter to delivered orders only
  const deliveredOrders = orders.filter(o => o.delivery_status === 'delivered');

  // Get existing reviews to exclude already-reviewed products
  const existingReviews = readAllReviews();
  const reviewedKeys = new Set(existingReviews.map(r => `${r.order_id}::${r.product_id}`));

  const reviewable: ReviewableOrder[] = [];

  for (const order of deliveredOrders) {
    for (const product of (order.products || [])) {
      const key = `${order.order_id}::${product.product_id}`;
      if (!reviewedKeys.has(key)) {
        reviewable.push({
          order_id: order.order_id,
          product_id: product.product_id,
          product_name: product.product_name,
          product_image: product.product_image,
          brand_name: '', // Will be filled if available
        });
      }
    }
  }

  return reviewable;
}
