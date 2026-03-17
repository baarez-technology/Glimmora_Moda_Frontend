/**
 * Consumer Task Service
 * Routes via Next.js rewrite: /api/v1/customer/tasks/* → backend
 */

import type { ConciergeTask } from '@/types/uhni';

function getToken(): string | null {
  try { return localStorage.getItem('moda-user-token'); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiTask {
  task_id: string;
  customer_id: string;
  title: string;
  description: string | null;
  type: string | null;
  priority: string | null;
  due_date: string | null;
  instructions: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  due_date?: string;
  instructions?: string;
  notes?: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export function apiTaskToConciergeTask(doc: ApiTask): ConciergeTask {
  return {
    id: doc.task_id,
    type: (doc.type as ConciergeTask['type']) ?? 'styling',
    title: doc.title,
    description: doc.description ?? '',
    status: (doc.status as ConciergeTask['status']) ?? 'pending',
    assignedTo: 'Isabella Romano',
    priority: (doc.priority as ConciergeTask['priority']) ?? 'normal',
    dueDate: doc.due_date ?? '',
    notes: doc.notes ? [doc.notes] : [],
    clientInstructions: doc.instructions ?? undefined,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

// ─── API Functions ─────────────────────────────────────────────────────────────

const BASE = '/api/v1/customer/tasks';

export async function fetchConsumerTasks(): Promise<ConciergeTask[]> {
  const docs = await apiFetch<ApiTask[]>(BASE);
  return docs.map(apiTaskToConciergeTask);
}

export async function createConsumerTask(payload: CreateTaskPayload): Promise<ConciergeTask> {
  const doc = await apiFetch<ApiTask>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return apiTaskToConciergeTask(doc);
}

export async function updateConsumerTask(
  taskId: string,
  fields: Partial<CreateTaskPayload & { status: string }>
): Promise<ConciergeTask> {
  const doc = await apiFetch<ApiTask>(`${BASE}/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  return apiTaskToConciergeTask(doc);
}
