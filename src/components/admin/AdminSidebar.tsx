'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  DollarSign,
  Activity,
  ToggleLeft,
} from 'lucide-react';

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
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Brand Partners', href: '/admin/brands', icon: Building2 },
      { label: 'Moderation', href: '/admin/moderation', icon: FileCheck },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Configuration', href: '/admin/configuration', icon: ToggleLeft },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Finance', href: '/admin/finance', icon: DollarSign },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Security', href: '/admin/security', icon: Shield },
      { label: 'System Health', href: '/admin/system', icon: Activity },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-charcoal-deep flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="font-display text-lg text-ivory-cream tracking-wide">
              ModaGlimmora
            </h1>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 hover:bg-white/10 transition-colors text-stone/70 hover:text-ivory-cream rounded ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Portal label */}
      {!collapsed && (
        <div className="px-6 py-3 border-b border-white/10">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold-soft">
            Admin Console
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone/50 mb-2 px-3">
                {section.title}
              </p>
            )}
            {collapsed && <div className="border-t border-white/5 my-2" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-white/10 text-ivory-cream'
                        : 'text-stone/60 hover:text-ivory-cream hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} className="flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && active && <ChevronRight size={14} className="text-gold-soft" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom branding */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-[9px] tracking-[0.15em] uppercase text-stone/30 text-center">
            Platform v10.3
          </p>
        </div>
      )}
    </aside>
  );
}
