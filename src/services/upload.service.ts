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
 * Falls back to a client-side data URL if the API is unavailable.
 */
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  const token = getUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/v1/customer/upload/image', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload image');
  }

  const data = await res.json();
  return data.url || data.image_url || data.public_url;
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
