// Shared in-memory store for cross-context styling sessions
// In production this would be replaced by API calls

import type { StylingSession } from '@/types/brand-portal';

type Listener = (sessions: StylingSession[]) => void;
const listeners: Listener[] = [];
let sharedSessions: StylingSession[] = [];

export function getSharedSessions(): StylingSession[] {
  return sharedSessions;
}

export function addSharedSession(session: StylingSession): void {
  sharedSessions = [session, ...sharedSessions];
  listeners.forEach(fn => fn(sharedSessions));
}

export function updateSharedSessionStatus(
  sessionId: string,
  status: StylingSession['status'],
  extras?: Partial<StylingSession>
): void {
  sharedSessions = sharedSessions.map(s =>
    s.id === sessionId
      ? { ...s, ...extras, status, updatedAt: new Date().toISOString() }
      : s
  );
  listeners.forEach(fn => fn(sharedSessions));
}

export function subscribeToSessions(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const index = listeners.indexOf(fn);
    if (index > -1) listeners.splice(index, 1);
  };
}
