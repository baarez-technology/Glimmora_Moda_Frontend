/**
 * Style DNA Service
 * Endpoint: GET /api/v1/customer/style-dna
 *
 * Server-aggregated Style DNA snapshot — archetype, top categories, color
 * palette, brand affinities, style keywords. Replaces the prior client-side
 * fan-out across multiple services that caused render race conditions.
 */

function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

export interface BrandAffinity {
  brandId: string;
  brandName: string;
  score: number;
}

export interface StyleDna {
  archetype: string;
  topCategories: string[];
  colorPalette: string[];
  brandAffinities: BrandAffinity[];
  styleKeywords: string[];
  generatedAt: string;
}

export async function getStyleDna(): Promise<StyleDna | null> {
  const token = getUserToken();
  if (!token) return null;

  const res = await fetch('/api/v1/customer/style-dna', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 404) return null;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Style DNA request failed (${res.status})`);
  }

  return res.json();
}
