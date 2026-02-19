'use client';

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
  ShoppingBag,
  Scissors,
  MessageSquare,
  Lock,
  Search,
  Clock,
  BookOpen,
  Gift,
  Calendar
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/brand', icon: LayoutDashboard },
      { label: 'Orders', href: '/brand/orders', icon: ShoppingBag }
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
      { label: 'UHNI Offers', href: '/brand/offers', icon: Gift }
    ]
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/brand/analytics', icon: BarChart3 },
      { label: 'Styling Sessions', href: '/brand/styling-sessions', icon: Calendar }
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', href: '/brand/settings', icon: Settings }
    ]
  }
];

export function BrandSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { partner, logout } = useBrand();

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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-sand flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-sand">
        <Link href="/brand" className="block">
          <h1 className="font-display text-xl text-charcoal-deep tracking-wide">
            ModaGlimmora
          </h1>
          <span className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1 block">
            Brand Portal
          </span>
        </Link>
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
                {partner.tier}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigation.map(section => (
          <div key={section.title}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2 px-3">
              {section.title}
            </p>
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
                    {active && (
                      <ChevronRight size={14} className="text-taupe" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
