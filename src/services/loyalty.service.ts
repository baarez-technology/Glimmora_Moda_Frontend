/**
 * Loyalty Service
 * Endpoints: /api/v1/customer/loyalty
 */

import { getStoredUserToken } from './auth.service';

export interface LoyaltyResponse {
  tier: 'standard' | 'preferred' | 'uhni';
  earnedPoints: number;
  spentPoints: number;
  availablePoints: number;
  totalSpent: number;
  redeemedRewards: string[];
  nextTierThreshold: number | null;
  pointsMultiplier: number;
}

export interface LoyaltyRedeemResponse {
  success: boolean;
  remainingPoints: number;
  redeemedRewards: string[];
}

function authHeaders(): Record<string, string> {
  const token = getStoredUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getLoyalty(): Promise<LoyaltyResponse> {
  const res = await fetch('/api/v1/customer/loyalty', { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch loyalty (${res.status})`);
  }
  return res.json();
}

export async function redeemReward(rewardId: string): Promise<LoyaltyRedeemResponse> {
  const res = await fetch('/api/v1/customer/loyalty/redeem', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ rewardId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to redeem reward (${res.status})`);
  }
  return res.json();
}
