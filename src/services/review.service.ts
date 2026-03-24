/**
 * Customer Review API Service
 * Endpoints: /api/v1/customer/reviews
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-user-token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export interface ApiReview {
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

export interface CreateReviewPayload {
  order_id: string;
  product_id: string;
  rating: number;
  review_title: string;
  review_description: string;
}

export async function createReview(payload: CreateReviewPayload): Promise<ApiReview> {
  const res = await fetch('/api/v1/customer/reviews', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit review');
  }
  return res.json();
}

export async function getMyReviews(): Promise<ApiReview[]> {
  const res = await fetch('/api/v1/customer/reviews', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load reviews');
  const data = await res.json();
  return data.reviews ?? [];
}

export async function deleteReview(reviewId: string): Promise<void> {
  const res = await fetch(`/api/v1/customer/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete review');
}
