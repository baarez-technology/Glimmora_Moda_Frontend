'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('moda-admin-sidebar');
    if (saved === 'collapsed') setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('moda-admin-sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&mode=admin`);
    }
  }, [isAuthenticated, isHydrated, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-64'}`}>
        <AdminTopBar />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
