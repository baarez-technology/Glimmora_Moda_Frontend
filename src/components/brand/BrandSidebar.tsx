'use client';

import { useState } from 'react';
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
  Gift,
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
  RotateCcw
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
      { label: 'UHNI Offers', href: '/brand/offers', icon: Gift }
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

export function BrandSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { partner, logout } = useBrand();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    Intelligence: true
  });

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
