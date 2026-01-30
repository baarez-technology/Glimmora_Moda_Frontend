'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

// UHNI Portal Layout
// This layout guards all UHNI-exclusive routes under /uhni/*
// Only users with userTier === 'uhni' can access these routes

export default function UHNILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isUHNI, isHydrated } = useApp();

  useEffect(() => {
    // Wait for auth state to hydrate from localStorage
    if (isHydrated && !isUHNI) {
      // Redirect non-UHNI users to UHNI login page
      router.push('/auth/login/uhni');
    }
  }, [isUHNI, isHydrated, router]);

  // Show loading spinner while auth state is hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-sand tracking-wider">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render content for non-UHNI users (will redirect in useEffect)
  if (!isUHNI) {
    return null;
  }

  // Render UHNI content for authenticated UHNI users
  return <>{children}</>;
}
