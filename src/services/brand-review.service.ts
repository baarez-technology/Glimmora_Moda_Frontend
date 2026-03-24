/**
 * Brand Review API Service
 * Endpoints: /api/v1/brand/reviews
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-brand-token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export interface BrandApiReview {
  review_id: string;
  order_id: string;
  product_id: string;
  brand_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_profile_picture: string | null;
  rating: number;
  review_title: string;
  review_description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getBrandReviews(): Promise<BrandApiReview[]> {
  const res = await fetch('/api/v1/brand/reviews', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load reviews');
  const data = await res.json();
  return data.reviews ?? [];
}

export async function getBrandReviewDetail(reviewId: string): Promise<BrandApiReview> {
  const res = await fetch(`/api/v1/brand/reviews/${reviewId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load review');
  return res.json();
}

export async function deleteBrandReview(reviewId: string): Promise<void> {
  const res = await fetch(`/api/v1/brand/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete review');
}
