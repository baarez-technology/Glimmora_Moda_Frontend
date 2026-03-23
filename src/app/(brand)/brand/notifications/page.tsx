'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';

interface Notification {
  notification_id: string;
  brand_id: string;
  notification_type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moda-brand-token');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { setError('Not authenticated'); return; }
      const res = await window.fetch('/api/v1/brand/notifications?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    const token = getToken();
    if (!token) return;
    await window.fetch(`/api/v1/brand/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    const token = getToken();
    if (!token) return;
    await window.fetch('/api/v1/brand/notifications/read-all', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <BrandPageHeader
        title="Notifications"
        subtitle={`${notifications.length} notification${notifications.length !== 1 ? 's' : ''}${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
      >
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs tracking-[0.1em] uppercase border border-sand text-stone hover:border-charcoal-deep transition-colors"
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>
        )}
      </BrandPageHeader>

      <div className="p-8">
        {loading ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Loader2 size={32} className="mx-auto text-stone animate-spin mb-3" />
            <p className="text-stone text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-error/5 border border-error/20 p-6 text-center">
            <p className="text-sm text-error mb-3">{error}</p>
            <button onClick={loadNotifications} className="px-4 py-2 text-xs tracking-[0.1em] uppercase border border-error/30 text-error hover:bg-error/10 transition-colors">
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Bell size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No notifications</p>
          </div>
        ) : (
          <div className="bg-white border border-sand/50 divide-y divide-sand/30">
            {notifications.map((n, idx) => (
              <div
                key={`${n.notification_id}_${idx}`}
                onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                className={`px-6 py-5 hover:bg-parchment/30 transition-colors cursor-pointer flex items-start gap-4 ${n.is_read ? '' : 'bg-parchment/20'}`}
              >
                {/* Unread dot */}
                <div className="flex-shrink-0 mt-1.5">
                  <span className={`w-2 h-2 rounded-full block ${n.is_read ? 'bg-sand' : 'bg-gold-soft'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title + type badge */}
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm leading-snug ${n.is_read ? 'text-stone' : 'text-charcoal-deep font-medium'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 bg-parchment text-stone tracking-[0.1em] uppercase flex-shrink-0">
                      {n.notification_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Body */}
                  <p className="text-xs text-charcoal-deep/80 mt-1.5 leading-relaxed">{n.body}</p>

                  {/* Data fields rendered as readable text */}
                  {n.data && Object.keys(n.data).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {n.data.order_id && (
                        <span className="text-[11px] text-stone">Order: <span className="font-medium text-charcoal-deep">#{n.data.order_id.slice(-6).toUpperCase()}</span></span>
                      )}
                      {n.data.product_id && (
                        <span className="text-[11px] text-stone">Product ID: <span className="font-medium text-charcoal-deep">{n.data.product_id.slice(-6).toUpperCase()}</span></span>
                      )}
                      {n.data.city && n.data.country && (
                        <span className="text-[11px] text-stone">Location: <span className="font-medium text-charcoal-deep">{n.data.city}, {n.data.country}</span></span>
                      )}
                      {n.data.units && n.data.threshold && (
                        <span className="text-[11px] text-stone">Stock: <span className="font-medium text-charcoal-deep">{n.data.units} / {n.data.threshold} units</span></span>
                      )}
                      {n.data.criticality && (
                        <span className={`text-[10px] px-2 py-0.5 tracking-[0.1em] uppercase ${
                          n.data.criticality === 'high' ? 'bg-error/10 text-error' :
                          n.data.criticality === 'medium' ? 'bg-gold-soft/20 text-stone' :
                          'bg-sand/40 text-stone'
                        }`}>{n.data.criticality}</span>
                      )}
                      {n.data.amount && (
                        <span className="text-[11px] text-stone">Amount: <span className="font-medium text-charcoal-deep">{n.data.amount}</span></span>
                      )}
                      {n.data.regions && (
                        <span className="text-[11px] text-stone">Regions restocked: <span className="font-medium text-charcoal-deep">{n.data.regions}</span></span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-[10px] text-taupe mt-2">{formatDate(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
