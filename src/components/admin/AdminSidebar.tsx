'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  FileCheck,
  DollarSign,
  Activity,
  ToggleLeft,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

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

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdmin();

  const handleLogout = () => {
    logout();
    router.push('/auth/login?mode=admin');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-charcoal-deep border-r border-charcoal-deep flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="block">
          <h1 className="font-display text-xl text-ivory-cream tracking-wide">
            ModaGlimmora
          </h1>
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold-soft mt-1 block">
            Admin Console
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone/60 mb-2 px-3">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 group ${
                      active
                        ? 'bg-white/10 text-ivory-cream'
                        : 'text-stone/70 hover:text-ivory-cream hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={14} className="text-gold-soft" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin User */}
      <div className="p-4 border-t border-white/10">
        {admin && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gold-soft/20 rounded-full flex items-center justify-center text-sm text-gold-soft font-medium">
              {admin.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ivory-cream truncate">{admin.name}</p>
              <p className="text-[10px] text-gold-soft/70 truncate capitalize">
                {admin.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm text-stone/70 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
