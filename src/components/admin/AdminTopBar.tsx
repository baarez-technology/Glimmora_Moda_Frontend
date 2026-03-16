'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Settings, LogOut, User, ChevronDown, Search } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

const mockNotifications = [
  { id: 1, text: 'New brand application from Maison Lumière', time: '5m ago', unread: true },
  { id: 2, text: '3 content items pending moderation', time: '12m ago', unread: true },
  { id: 3, text: 'System alert: CDN response time elevated', time: '1h ago', unread: true },
  { id: 4, text: 'GDPR data export request completed', time: '3h ago', unread: false },
  { id: 5, text: 'Monthly analytics report generated', time: '5h ago', unread: false },
];

export function AdminTopBar() {
  const { admin, logout } = useAdmin();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login?mode=admin');
  };

  return (
    <div className="sticky top-0 z-30 h-14 bg-white border-b border-sand/50 flex items-center justify-between px-8">
      {/* Left: search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
          <input
            type="text"
            placeholder="Search pages, users, brands..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-parchment/50 border border-sand/50 text-charcoal-deep placeholder:text-stone/40 focus:outline-none focus:border-charcoal-deep/30 transition-colors"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 hover:bg-parchment transition-colors rounded"
          >
            <Bell size={18} strokeWidth={1.5} className="text-charcoal-deep/70" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white shadow-xl border border-sand/50 z-50">
              <div className="px-4 py-3 border-b border-sand/50 flex items-center justify-between">
                <span className="text-xs font-medium tracking-[0.1em] uppercase text-charcoal-deep">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-gold-soft font-medium">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-sand/20 last:border-0 hover:bg-parchment/50 transition-colors cursor-pointer ${
                      n.unread ? 'bg-parchment/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {n.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />
                      )}
                      <div className={n.unread ? '' : 'ml-4'}>
                        <p className="text-xs text-charcoal-deep leading-relaxed">{n.text}</p>
                        <p className="text-[10px] text-stone mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/security"
                onClick={() => setShowNotifications(false)}
                className="block px-4 py-2.5 text-center text-[10px] tracking-[0.15em] uppercase text-charcoal-deep hover:bg-parchment/50 transition-colors border-t border-sand/50"
              >
                View All Activity
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-sand/60 mx-1" />

        {/* Profile */}
        {admin && (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-parchment transition-colors rounded"
            >
              <div className="w-8 h-8 bg-charcoal-deep rounded-full flex items-center justify-center text-xs text-ivory-cream font-medium">
                {admin.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-charcoal-deep leading-none">{admin.name}</p>
                <p className="text-[10px] text-stone capitalize mt-0.5">{admin.role.replace('_', ' ')}</p>
              </div>
              <ChevronDown size={14} className="text-stone" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white shadow-xl border border-sand/50 z-50">
                <div className="px-4 py-3 border-b border-sand/50">
                  <p className="text-sm font-medium text-charcoal-deep">{admin.name}</p>
                  <p className="text-[10px] text-stone mt-0.5">{admin.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone hover:bg-parchment/50 hover:text-charcoal-deep transition-colors"
                  >
                    <User size={14} strokeWidth={1.5} />
                    Profile Settings
                  </Link>
                  <Link
                    href="/admin/configuration"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone hover:bg-parchment/50 hover:text-charcoal-deep transition-colors"
                  >
                    <Settings size={14} strokeWidth={1.5} />
                    Platform Config
                  </Link>
                </div>
                <div className="border-t border-sand/50 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-xs text-stone hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={14} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
