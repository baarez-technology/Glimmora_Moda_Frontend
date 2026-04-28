/**
 * Fit Confidence Service
 * Endpoint: POST /api/v1/customer/fit-confidence
 *
 * Calls the real backend to get GPT-4o-powered fit analysis
 * for a (customer, product) pair. Requires customer auth token.
 */

import type { FitConfidence } from '@/types';
import { fetchWithTimeout } from '@/lib/api-cache';

function getUserToken(): string | null {
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Raw API response shape (matches backend FitConfidenceResponse)
interface FitConfidenceApiResponse {
  fit_confidence_id: string;
  customer_id: string;
  product_id: string;
  recommended_size: string;
  available_sizes: string[];
  confidence_scores: {
    size_match_percent: number;
    style_match_percent: number;
    proportion_match_percent: number;
    overall_confidence_percent: number;
  };
  measurement_analysis: {
    chest_difference_cm: number | null;
    waist_difference_cm: number | null;
    shoulder_alignment: string | null;
    sleeve_length_estimate: string | null;
  };
  fit_notes: string[];
  return_risk: {
    level: 'low' | 'medium' | 'high';
    risk_score_percent: number;
  };
  confidence_interval?: {
    size_range: string;
    lower_bound_percent: number;
    upper_bound_percent: number;
    low_confidence_flag: boolean;
    explanation: string;
  };
  body_twin_used: boolean;
  fit_engine_version: string;
  created_at: string;
}

function mapToFitConfidence(api: FitConfidenceApiResponse): FitConfidence {
  return {
    overallScore: api.confidence_scores.overall_confidence_percent,
    suggestedSize: api.recommended_size,
    availableSizes: api.available_sizes,
    breakdown: {
      sizeMatch: api.confidence_scores.size_match_percent,
      styleMatch: api.confidence_scores.style_match_percent,
      proportionMatch: api.confidence_scores.proportion_match_percent,
    },
    measurementAnalysis: {
      chestDifferenceCm: api.measurement_analysis.chest_difference_cm,
      waistDifferenceCm: api.measurement_analysis.waist_difference_cm,
      shoulderAlignment: api.measurement_analysis.shoulder_alignment,
      sleeveLengthEstimate: api.measurement_analysis.sleeve_length_estimate,
    },
    confidenceInterval: api.confidence_interval
      ? {
          sizeRange: api.confidence_interval.size_range,
          lowerBoundPercent: api.confidence_interval.lower_bound_percent,
          upperBoundPercent: api.confidence_interval.upper_bound_percent,
          lowConfidenceFlag: api.confidence_interval.low_confidence_flag,
          explanation: api.confidence_interval.explanation,
        }
      : undefined,
    sizeNotes: api.fit_notes,
    returnRisk: api.return_risk.level,
    returnRiskScore: api.return_risk.risk_score_percent,
    recommendation: `Based on your Digital Body Twin, ${api.recommended_size} is your best fit with ${api.confidence_scores.overall_confidence_percent}% confidence.`,
    bodyTwinUsed: api.body_twin_used,
    fitEngineVersion: api.fit_engine_version,
  };
}

/**
 * Fetch personalised fit confidence from the backend.
 * Returns null if the user is not logged in or the API call fails.
 */
export async function getFitConfidenceFromAPI(
  productId: string,
  productSizes: string[],
): Promise<FitConfidence | null> {
  const token = getUserToken();
  if (!token) return null;

  try {
    const res = await fetchWithTimeout(`/api/v1/customer/fit-confidence`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        product_id: productId,
        product_sizes: productSizes,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.log('[fit-confidence] API error:', res.status, err);
      return null;
    }

    const data: FitConfidenceApiResponse = await res.json();
    return mapToFitConfidence(data);
  } catch (err) {
    console.log('[fit-confidence] Network error (backend may be offline):', err);
    return null;
  }
}