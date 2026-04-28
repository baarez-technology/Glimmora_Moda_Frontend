'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Globe,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Scissors,
  MessageSquare,
  Lock,
  Search,
  Clock,
  BookOpen,
  Calendar,
  Brain,
  Activity,
  Bot,
  Fingerprint,
  Network,
  Shield,
  Store,
  MapPin,
  AlertTriangle,
  Rocket,
  Gem,
  Users,
  TrendingUp,
  Wand2,
  RotateCcw,
  Bell,
  CheckCheck,
  X
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  phase?: 1 | 2 | 3;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/brand', icon: LayoutDashboard },
      { label: 'Orders', href: '/brand/orders', icon: ShoppingBag },
      { label: 'Returns', href: '/brand/returns', icon: RotateCcw }
    ]
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', href: '/brand/products', icon: Package },
      { label: 'Collections', href: '/brand/collections', icon: FolderOpen },
      { label: 'Inventory', href: '/brand/inventory', icon: Globe }
    ]
  },
  {
    title: 'UHNI Services',
    items: [
      { label: 'Bespoke Orders', href: '/brand/bespoke', icon: Scissors },
      { label: 'Negotiations', href: '/brand/negotiations', icon: MessageSquare },
      { label: 'Private Collections', href: '/brand/private-collections', icon: Lock },
      { label: 'Sourcing Requests', href: '/brand/sourcing', icon: Search }
    ]
  },
  {
    title: 'Content',
    items: [
      { label: 'Heritage', href: '/brand/heritage', icon: Clock },
      { label: 'Stories', href: '/brand/stories', icon: BookOpen },
    ]
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/brand/analytics', icon: BarChart3 },
      { label: 'Reviews', href: '/brand/reviews', icon: MessageSquare },
      { label: 'Styling Sessions', href: '/brand/styling-sessions', icon: Calendar },
      { label: 'Shop Locations', href: '/brand/locations', icon: MapPin }
    ]
  },
  {
    title: 'Intelligence',
    collapsible: true,
    items: [
      { label: 'Design-to-Demand', href: '/brand/intelligence/design-demand', icon: Brain, phase: 2 },
      { label: 'Intelligence Agent', href: '/brand/intelligence/agent', icon: Activity, phase: 1 },
      { label: 'Brand Concierge', href: '/brand/intelligence/concierge', icon: Bot, phase: 1 },
      { label: 'Memory Imprint', href: '/brand/intelligence/memory', icon: Fingerprint, phase: 3 },
      { label: 'Digital Twin', href: '/brand/intelligence/digital-twin', icon: Network, phase: 3 },
      { label: 'Cultural Authority', href: '/brand/intelligence/cultural-authority', icon: Shield, phase: 3 },
      { label: 'Boutiques', href: '/brand/intelligence/boutiques', icon: Store, phase: 1 },
      { label: 'Counterfeit Detection', href: '/brand/intelligence/counterfeit', icon: AlertTriangle, phase: 3 },
      { label: 'Drop Simulator', href: '/brand/intelligence/drop-simulator', icon: Rocket, phase: 2 },
      { label: 'Heritage DNA', href: '/brand/intelligence/heritage', icon: Gem, phase: 2 },
      { label: 'Client Genome', href: '/brand/intelligence/client-genome', icon: Users, phase: 1 },
      { label: 'Grey-Market', href: '/brand/intelligence/grey-market', icon: AlertTriangle },
      { label: 'Shadow Demand', href: '/brand/intelligence/shadow-demand', icon: TrendingUp },
      { label: 'Curator Studio', href: '/brand/intelligence/curator', icon: Wand2 }
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', href: '/brand/settings', icon: Settings }
    ]
  }
];

interface SidebarNotification {
  notification_id: string;
  notification_type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

export function BrandSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { partner, logout } = useBrand();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    Intelligence: true
  });

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<SidebarNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
      if (!token) return;
      const res = await fetch('/api/v1/brand/notifications/count', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread ?? 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
      if (!token) return;
      const res = await fetch('/api/v1/brand/notifications?limit=10', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread ?? 0);
      }
    } catch {}
    finally { setLoadingNotifs(false); }
  };

  const handleToggleNotifs = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
      if (!token) return;
      await fetch('/api/v1/brand/notifications/' + id + '/read', {
        method: 'PATCH', headers: { Authorization: 'Bearer ' + token },
      });
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
      if (!token) return;
      await fetch('/api/v1/brand/notifications/read-all', {
        method: 'PATCH', headers: { Authorization: 'Bearer ' + token },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login?mode=brand');
  };

  const isActive = (href: string) => {
    if (href === '/brand') {
      return pathname === '/brand';
    }
    return pathname.startsWith(href);
  };

  const isSectionActive = (section: NavSection) => {
    return section.items.some(item => isActive(item.href));
  };

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Auto-expand intelligence section if a child is active
  const intelligenceActive = navigation.find(s => s.title === 'Intelligence');
  if (intelligenceActive && isSectionActive(intelligenceActive) && collapsedSections['Intelligence']) {
    // This will be handled in the render - we check it there
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-sand flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-sand">
        <div className="flex items-start justify-between">
          <Link href="/brand" className="block flex-1">
            <h1 className="font-display text-xl text-charcoal-deep tracking-wide">
              ModaGlimmora
            </h1>
            <span className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1 block">
              Brand Portal
            </span>
          </Link>
          <div ref={notifRef} className="relative flex-shrink-0 mt-0.5">
            <button
              onClick={handleToggleNotifs}
              className="relative p-1.5 hover:bg-parchment transition-colors rounded"
              aria-label="Notifications"
            >
              <Bell size={17} strokeWidth={1.5} className="text-charcoal-deep/70" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[15px] h-[15px] bg-red-500 text-white text-[8px] font-semibold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white shadow-xl border border-sand/50 z-50">
                <div className="px-4 py-3 border-b border-sand/50 flex items-center justify-between">
                  <span className="text-xs font-medium tracking-[0.1em] uppercase text-charcoal-deep">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="text-[10px] text-gold-soft font-medium">{unreadCount} new</span>
                        <button onClick={handleMarkAllRead} className="text-[10px] text-stone hover:text-charcoal-deep transition-colors" title="Mark all read">
                          <CheckCheck size={12} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-stone hover:text-charcoal-deep transition-colors">
                      <X size={13} />
                    </button>
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
                    notifications.map((n, idx) => (
                      <div
                        key={`${n.notification_id}_${idx}`}
                        onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                        className={`px-4 py-3 border-b border-sand/20 last:border-0 hover:bg-parchment/50 transition-colors cursor-pointer ${n.is_read ? '' : 'bg-parchment/30'}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />}
                          <div className={n.is_read ? 'ml-4' : ''}>
                            <p className="text-xs font-medium text-charcoal-deep">{n.title}</p>
                            <p className="text-xs text-stone leading-relaxed mt-0.5">{n.body}</p>
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
                  View All Notifications
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Badge */}
      {partner && (
        <div className="px-6 py-4 border-b border-sand bg-parchment/30">
          <div className="flex items-center gap-3">
            {partner.brandLogo ? (
              <img
                src={partner.brandLogo}
                alt={partner.brandName}
                className="w-10 h-10 object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-charcoal-deep text-ivory-cream flex items-center justify-center text-sm font-display">
                {partner.brandName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-charcoal-deep">{partner.brandName}</p>
              <p className="text-[10px] tracking-[0.1em] uppercase text-gold-muted">
                {partner.brandCategory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigation.map(section => {
          const isCollapsible = section.collapsible;
          const isCollapsed = collapsedSections[section.title] && !isSectionActive(section);

          return (
            <div key={section.title}>
              {isCollapsible ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full text-[10px] tracking-[0.2em] uppercase text-taupe mb-2 px-3 hover:text-charcoal-deep transition-colors"
                >
                  <span>{section.title}</span>
                  {isCollapsed ? (
                    <ChevronRight size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </button>
              ) : (
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2 px-3">
                  {section.title}
                </p>
              )}
              {!isCollapsed && (
                <div className="space-y-1">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 group ${
                          active
                            ? 'bg-parchment text-charcoal-deep'
                            : 'text-stone hover:text-charcoal-deep hover:bg-parchment/50'
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.5} />
                        <span className="flex-1">{item.label}</span>
                        {item.phase && (
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            item.phase === 1 ? 'bg-success' : item.phase === 2 ? 'bg-info' : 'bg-gold-soft'
                          }`} />
                        )}
                        {active && (
                          <ChevronRight size={14} className="text-taupe" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sand">
        {partner && partner.teamMembers[0] && (
          <Link
            href="/brand/profile"
            className="flex items-center gap-3 px-3 py-2 mb-2 hover:bg-parchment/50 transition-colors rounded"
          >
            {partner.teamMembers[0].avatar ? (
              <img
                src={partner.teamMembers[0].avatar}
                alt={partner.teamMembers[0].name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center text-sm text-stone">
                {partner.teamMembers[0].name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-charcoal-deep truncate">
                {partner.teamMembers[0].name}
              </p>
              <p className="text-[10px] text-taupe truncate">
                {partner.teamMembers[0].role}
              </p>
            </div>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm text-stone hover:text-error transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
