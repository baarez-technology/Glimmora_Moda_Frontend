/**
 * Brand Story Service (Real Backend API)
 * Endpoints: /api/v1/story/*
 */

function getToken(): string | null {
  try {
    return localStorage.getItem('moda-brand-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Response Types ─────────────────────────────────────────────────────────

export interface StoryResponse {
  story_id: string;
  brand_id: string;
  title: string;
  story_type: string;
  story_type_subtype: string;
  excerpt: string;
  image_url: string;
  content: Record<string, unknown>[];
  product_list: string[];
  status: string;
  sections: number;
  read_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryCreatePayload {
  title: string;
  story_type: string;
  story_type_subtype: string;
  excerpt: string;
  image_url: string;
  status: string;
  content: Record<string, unknown>[];
  product_list: string[];
  sections: number;
  read_time: number;
}

export interface StoryUpdatePayload {
  title?: string;
  story_type?: string;
  story_type_subtype?: string;
  excerpt?: string;
  image_url?: string;
  status?: string;
  content?: Record<string, unknown>[];
  product_list?: string[];
  sections?: number;
  read_time?: number;
}

export interface ProductListItem {
  product_id: number;
  image_url: string;
  product_name: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchStories(): Promise<StoryResponse[]> {
  const res = await fetch('/api/v1/story', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch stories' }));
    throw new Error(err.detail || `Failed to fetch stories (${res.status})`);
  }

  return res.json();
}

export async function fetchStory(storyId: string): Promise<StoryResponse> {
  const res = await fetch(`/api/v1/story/${storyId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Story not found' }));
    throw new Error(err.detail || `Failed to fetch story (${res.status})`);
  }

  return res.json();
}

export async function createStory(payload: StoryCreatePayload): Promise<StoryResponse> {
  const res = await fetch('/api/v1/story', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create story' }));
    throw new Error(err.detail || `Failed to create story (${res.status})`);
  }

  return res.json();
}

export async function updateStory(
  storyId: string,
  payload: StoryUpdatePayload
): Promise<StoryResponse> {
  const res = await fetch(`/api/v1/story/${storyId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update story' }));
    throw new Error(err.detail || `Failed to update story (${res.status})`);
  }

  return res.json();
}

export async function softDeleteStory(storyId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/v1/story/${storyId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete story' }));
    throw new Error(err.detail || `Failed to delete story (${res.status})`);
  }

  return res.json();
}

export async function restoreStory(storyId: string): Promise<StoryResponse> {
  const res = await fetch(`/api/v1/story/${storyId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_active: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to restore story' }));
    throw new Error(err.detail || `Failed to restore story (${res.status})`);
  }

  return res.json();
}

export async function fetchProductsList(): Promise<ProductListItem[]> {
  const res = await fetch('/api/v1/product/products-list', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch products list' }));
    throw new Error(err.detail || `Failed to fetch products list (${res.status})`);
  }

  return res.json();
}
