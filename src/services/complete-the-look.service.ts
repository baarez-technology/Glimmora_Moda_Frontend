/**
 * Complete the Look Service
 * Endpoint: POST /api/v1/consumer/complete-the-look
 *
 * Uses the consumer's wardrobe, style preferences, and budget to suggest
 * products that complete the outfit for a given event.
 * GPT-4o generates suggestions, matched via Elasticsearch hybrid search.
 */

import { fetchWithTimeout } from '@/lib/api-cache';
import { getStoredUserToken } from './auth.service';

// ============================================
// Types
// ============================================

export interface CompleteTheLookProduct {
  product_id: string;
  product_name: string;
  product_category: string;
  product_image: string;
  price: number;
  in_wardrobe: boolean;
}

export interface CompleteTheLookRequest {
  event_title: string;
  event_short_description: string;
  current_product_id: string;
  current_product_name?: string;
  current_product_category?: string;
}

export interface CompleteTheLookResponse {
  consumer_id: string;
  current_product_id: string;
  current_product_name: string;
  event_title: string;
  products: CompleteTheLookProduct[];
  match_score: number;
  reason: string;
}

// ============================================
// API
// ============================================

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getStoredUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * POST /api/v1/consumer/complete-the-look
 * Returns outfit completion suggestions for the given event + product.
 * Returns null if user is not logged in or API call fails.
 */
export async function getCompleteTheLook(
  payload: CompleteTheLookRequest,
): Promise<CompleteTheLookResponse | null> {
  const token = getStoredUserToken();
  if (!token) return null;

  try {
    const res = await fetchWithTimeout('/api/v1/consumer/complete-the-look', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.log('[complete-the-look] API error:', res.status);
      return null;
    }

    const data: CompleteTheLookResponse = await res.json();
    return data;
  } catch (err) {
    console.log('[complete-the-look] Network error (backend may be offline):', err);
    return null;
  }
}
