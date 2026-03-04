'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

// UHNI Portal Layout — auth guard only
// Navigation is handled by the shared consumer Header (same look as rest of the site)
// Each UHNI page manages its own content layout

export default function UHNILayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isUHNI, isHydrated } = useApp();

  useEffect(() => {
    if (isHydrated && !isUHNI) {
      router.push('/auth/login/uhni');
    }
  }, [isUHNI, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone tracking-wider">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isUHNI) return null;

  return <>{children}</>;
}
