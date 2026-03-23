'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotifCountResponse {
  total: number;
  unread: number;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-brand-token');
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

export function BrandTopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch unread count on mount and periodically
  const fetchCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await window.fetch('/api/v1/brand/notifications/count', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data: NotifCountResponse = await res.json();
        setUnreadCount(data.unread);
      }
    } catch (err) {
      console.error('[BrandTopBar] Failed to fetch notification count:', err);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Fetch full notifications when dropdown opens
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await window.fetch('/api/v1/brand/notifications?limit=10', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread ?? 0);
      }
    } catch (err) {
      console.error('[BrandTopBar] Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleToggleDropdown = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) fetchNotifications();
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      const token = getToken();
      if (!token) return;
      await window.fetch('/api/v1/brand/notifications/' + notificationId + '/read', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[BrandTopBar] Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = getToken();
      if (!token) return;
      await window.fetch('/api/v1/brand/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[BrandTopBar] Failed to mark all read:', err);
    }
  };

  return (
    <div className="sticky top-0 z-30 h-12 bg-white border-b border-sand/50 flex items-center justify-end px-8">
      <div ref={notifRef} className="relative">
        <button
          onClick={handleToggleDropdown}
          className="relative p-2 hover:bg-parchment transition-colors rounded"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.5} className="text-charcoal-deep/70" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-white shadow-xl border border-sand/50 z-50">
            <div className="px-4 py-3 border-b border-sand/50 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.1em] uppercase text-charcoal-deep">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <span className="text-[10px] text-gold-soft font-medium">{unreadCount} new</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-stone hover:text-charcoal-deep transition-colors flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <CheckCheck size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loadingNotifs ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-5 h-5 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-stone">No notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`px-4 py-3 border-b border-sand/20 last:border-0 hover:bg-parchment/50 transition-colors cursor-pointer ${n.is_read ? '' : 'bg-parchment/30'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />
                      )}
                      <div className={n.is_read ? 'ml-4' : ''}>
                        <p className="text-xs font-medium text-charcoal-deep">{n.title}</p>
                        <p className="text-xs text-stone leading-relaxed mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-taupe mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/brand/notifications"
              onClick={() => setShowNotifications(false)}
              className="block px-4 py-2.5 text-center text-[10px] tracking-[0.15em] uppercase text-charcoal-deep hover:bg-parchment/50 transition-colors border-t border-sand/50"
            >
              Notification Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
