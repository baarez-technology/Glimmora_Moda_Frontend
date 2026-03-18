/**
 * Upload Service
 * Endpoints: /api/upload/*
 *
 * Placeholder service for file uploads.
 * In mock mode, returns fake URLs.
 * Backend team: implement with S3/Cloudinary/etc.
 */

import { apiRequest, generateMockId } from './api-client';
import type { ApiResponse } from './api-client';

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  createdAt: string;
}

export async function uploadImage(file: File): Promise<ApiResponse<UploadResult>> {
  return apiRequest<UploadResult>('/api/upload/image', {
    method: 'POST',
    body: { filename: file.name, size: file.size, contentType: file.type },
    mockHandler: () => ({
      id: generateMockId('upload'),
      url: `https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80`,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      createdAt: new Date().toISOString(),
    }),
  });
}

export async function uploadDocument(file: File): Promise<ApiResponse<UploadResult>> {
  return apiRequest<UploadResult>('/api/upload/document', {
    method: 'POST',
    body: { filename: file.name, size: file.size, contentType: file.type },
    mockHandler: () => ({
      id: generateMockId('doc'),
      url: `/uploads/${file.name}`,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      createdAt: new Date().toISOString(),
    }),
  });
}

// ─── Real API Upload (FormData with auth) ───────────────────────────────────

function getUserToken(): string | null {
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

/**
 * Upload an image file to the backend via FormData.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImageFile(file: File): Promise<string> {
  // const token = getUserToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/v1/upload`, {
    method: 'POST',
    // headers: {
    //   ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  console.log('[uploadImageFile] response:', data);
  console.log('[uploadImageFile] public URL:', data.url);
  return data.url;
}

// ─── Virtual Try-On API ──────────────────────────────────────────────────────

export interface VirtualTryOnResult {
  image_url: string;
  timing_ms: {
    download_ms: number;
    gemini_ms: number;
    upload_ms: number;
    total_ms: number;
  };
}

/**
 * Call the virtual try-on endpoint.
 * Sends the model (person) photo URL and garment (product) photo URL,
 * returns the S3 URL of the AI-generated try-on image.
 */
export async function virtualTryOn(
  modelImageUrl: string,
  garmentImageUrl: string,
  productName?: string,
): Promise<VirtualTryOnResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body: Record<string, string> = {
    model_image: modelImageUrl,
    garment_image: garmentImageUrl,
  };
  if (productName) {
    body.product_name = productName;
  }

  const res = await fetch(`/api/v1/customer/virtual-tryon`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Virtual try-on failed');
  }

  return res.json();
}

export async function getUploadUrl(
  filename: string,
  contentType: string
): Promise<ApiResponse<{ uploadUrl: string; publicUrl: string }>> {
  return apiRequest<{ uploadUrl: string; publicUrl: string }>('/api/upload/presigned-url', {
    method: 'POST',
    body: { filename, contentType },
    mockHandler: () => ({
      uploadUrl: `https://storage.example.com/upload/${filename}`,
      publicUrl: `https://cdn.example.com/${filename}`,
    }),
  });
}
