'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAdmin();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&mode=admin`);
    }
  }, [isAuthenticated, isHydrated, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment/30">
      <AdminSidebar />
      <main className="ml-64">
        {children}
      </main>
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
