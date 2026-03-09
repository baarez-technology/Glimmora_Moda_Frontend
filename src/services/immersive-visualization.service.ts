/**
 * Immersive Visualization Service
 * Endpoint: GET /api/v1/customer/immersive-visualization?product_id=...
 *
 * Fetches the authenticated consumer's digital body twin and the specified product,
 * then uses GPT-4o to generate a personalised fit analysis.
 */

import { fetchWithTimeout } from '@/lib/api-cache';
import { getStoredUserToken } from './auth.service';

// ============================================
// Types
// ============================================

export interface FitAnalysis {
  shoulders: string;
  chest: string;
  waist: string;
  length: string;
  recommendations: string[];
}

export interface ImmersiveVisualizationResponse {
  consumer_id: string;
  product_id: string;
  product_name: string;
  fit_analysis: FitAnalysis;
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
 * GET /api/v1/customer/immersive-visualization?product_id=...
 * Returns personalised fit analysis (shoulders, chest, waist, length + recommendations).
 * Returns null if user is not logged in or API call fails.
 */
export async function getImmersiveVisualization(
  productId: string,
): Promise<ImmersiveVisualizationResponse | null> {
  const token = getStoredUserToken();
  if (!token) return null;

  try {
    const res = await fetchWithTimeout(
      `/api/v1/customer/immersive-visualization?product_id=${encodeURIComponent(productId)}`,
      { method: 'GET', headers: authHeaders() },
    );

    if (!res.ok) {
      console.log('[immersive-visualization] API error:', res.status);
      return null;
    }

    const data: ImmersiveVisualizationResponse = await res.json();
    return data;
  } catch (err) {
    console.log('[immersive-visualization] Network error (backend may be offline):', err);
    return null;
  }
}
