/**
 * Conversation Service
 * Real backend integration: /api/v1/customer/conversations
 * Uses moda-user-token for auth (consumer/uhni users).
 *
 * WebSocket frame protocol (outbound):
 *   { type: "message", content: string }  — send a user message
 *   { type: "ping" }                       — keepalive
 *
 * WebSocket frame protocol (inbound):
 *   { type: "connected", conversation_id, dialog_state }
 *   { type: "intent",    intent }
 *   { type: "rag",       citations: string[] }
 *   { type: "token",     delta: string }        — streaming token
 *   { type: "message",   message_id: string }   — message persisted
 *   { type: "error",     detail: string }
 *   { type: "pong" }
 */

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function getUserToken(): string | null {
  return typeof window !== 'undefined'
    ? localStorage.getItem('moda-user-token')
    : null;
}

function getAuthHeaders(): Record<string, string> {
  const token = getUserToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationMeta {
  conversation_id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
  dialog_state: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  created_at: string;
}

export interface RestMessageResponse {
  message_id: string | null;
  conversation_id: string;
  intent: string | null;
  content: string;
  citations: string[];
}

// ─── Inbound WS frame types ───────────────────────────────────────────────────

export type WsInboundFrame =
  | { type: 'connected'; conversation_id: string; dialog_state: string }
  | { type: 'intent'; intent: string }
  | { type: 'rag'; citations: string[] }
  | { type: 'token'; delta: string }
  | { type: 'message'; message_id: string }
  | { type: 'error'; detail: string }
  | { type: 'pong' };

// ─── REST: create conversation ────────────────────────────────────────────────

export async function createConversation(title?: string): Promise<ConversationMeta> {
  const res = await fetch('/api/v1/customer/conversations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title: title ?? 'AI Concierge session' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create conversation' }));
    throw new Error(err.detail || `Create conversation failed (${res.status})`);
  }

  return res.json();
}

// ─── REST: non-streaming message fallback ────────────────────────────────────

export async function sendMessageRest(
  conversationId: string,
  content: string,
  brandId?: string,
): Promise<RestMessageResponse> {
  const url = brandId
    ? `/api/v1/customer/conversations/${conversationId}/messages?brand_id=${encodeURIComponent(brandId)}`
    : `/api/v1/customer/conversations/${conversationId}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to send message' }));
    throw new Error(err.detail || `Send message failed (${res.status})`);
  }

  return res.json();
}

// ─── WebSocket: streaming chat ────────────────────────────────────────────────

export interface WsSession {
  /** Send a user message via the open WebSocket */
  sendMessage(content: string): void;
  /** Close the WebSocket gracefully */
  close(): void;
}

export interface WsCallbacks {
  /** Called when the connection is established */
  onConnected?: (conversationId: string) => void;
  /** Called for each streamed token */
  onToken: (delta: string) => void;
  /** Called once the full assistant message is persisted */
  onMessageDone?: (messageId: string) => void;
  /** Called with citations when available */
  onCitations?: (citations: string[]) => void;
  /** Called on any error frame or connection error */
  onError?: (detail: string) => void;
  /** Called when the socket closes (any reason) */
  onClose?: () => void;
}

/**
 * Open a WebSocket to the conversation streaming endpoint.
 * Returns a WsSession handle so the caller can send messages and close.
 *
 * The base URL for the WebSocket is derived from NEXT_PUBLIC_API_URL
 * (strips the http/https prefix and replaces with ws/wss).
 */
export function connectWebSocket(
  conversationId: string,
  token: string,
  callbacks: WsCallbacks,
  brandId?: string,
): WsSession {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const wsBase = apiBase.replace(/^http/, 'ws');
  const brandParam = brandId ? `&brand_id=${encodeURIComponent(brandId)}` : '';
  const url = `${wsBase}/api/v1/customer/conversations/ws/${conversationId}?token=${encodeURIComponent(token)}${brandParam}`;

  const ws = new WebSocket(url);

  ws.addEventListener('open', () => {
    // ping immediately to confirm connection before first message
  });

  ws.addEventListener('message', (event) => {
    let frame: WsInboundFrame;
    try {
      frame = JSON.parse(event.data as string) as WsInboundFrame;
    } catch {
      return;
    }

    switch (frame.type) {
      case 'connected':
        callbacks.onConnected?.(frame.conversation_id);
        break;
      case 'token':
        callbacks.onToken(frame.delta);
        break;
      case 'message':
        callbacks.onMessageDone?.(frame.message_id);
        break;
      case 'rag':
        callbacks.onCitations?.(frame.citations);
        break;
      case 'error':
        callbacks.onError?.(frame.detail);
        break;
      // pong and intent are silently ignored for now
    }
  });

  ws.addEventListener('error', () => {
    callbacks.onError?.('WebSocket connection error');
  });

  ws.addEventListener('close', () => {
    callbacks.onClose?.();
  });

  return {
    sendMessage(content: string) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'message', content }));
      }
    },
    close() {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
  };
}
