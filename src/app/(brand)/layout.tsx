'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BrandProvider, useBrand } from '@/context/BrandContext';
import { BrandSidebar } from '@/components/brand/BrandSidebar';
import { MaintenanceGate } from '@/components/MaintenanceGate';

function BrandLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useBrand();

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&mode=brand`);
    }
  }, [isAuthenticated, isHydrated, router, pathname]);

  // Show loading state while hydrating or not authenticated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone">Loading Brand Portal...</p>
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
    <MaintenanceGate>
      <div className="min-h-screen bg-ivory-cream">
        <BrandSidebar />
        <main className="ml-64">
          {children}
        </main>
      </div>
    </MaintenanceGate>
  );
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider>
      <BrandLayoutContent>{children}</BrandLayoutContent>
    </BrandProvider>
  );
}
