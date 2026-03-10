/**
 * Sourcing Service — Consumer sourcing requests API
 * Routes via Next.js rewrite: /api/v1/* → NEXT_PUBLIC_API_URL/api/v1/*
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-user-token');
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export interface ApiSourcingRequest {
  sourcing_id: string;
  consumer_id: string;
  looking_for: string;
  product_category: string;
  description: string;
  budget: string;
  priority: string;
  deadline: string;
  specifications: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSourcingRequestPayload {
  looking_for: string;
  product_category: string;
  description: string;
  budget: string;
  priority: string;
  deadline: string;
  specifications: string;
}

export async function getProductCategories(): Promise<string[]> {
  const res = await fetch('/api/v1/consumer/sourcing-requests/product-categories', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  const data = await res.json();
  return data.product_categories as string[];
}

export async function getSourcingRequests(): Promise<ApiSourcingRequest[]> {
  const res = await fetch('/api/v1/consumer/sourcing-requests', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch sourcing requests: ${res.status}`);
  return res.json();
}

export async function createSourcingRequest(
  payload: CreateSourcingRequestPayload
): Promise<ApiSourcingRequest> {
  const res = await fetch('/api/v1/consumer/sourcing-requests', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create sourcing request: ${res.status}`);
  return res.json();
}
