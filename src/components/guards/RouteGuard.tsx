'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserTier } from '@/types';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredTier: UserTier | UserTier[];
  redirectTo?: string;
}

export default function RouteGuard({ children, requiredTier, redirectTo = '/auth/login' }: RouteGuardProps) {
  const router = useRouter();
  const { userTier, isAuthenticated } = useAuth();

  useEffect(() => {
    const allowedTiers = Array.isArray(requiredTier) ? requiredTier : [requiredTier];

    // Check if user has required tier
    if (!allowedTiers.includes(userTier)) {
      router.push(redirectTo);
    }
  }, [userTier, requiredTier, redirectTo, router]);

  const allowedTiers = Array.isArray(requiredTier) ? requiredTier : [requiredTier];

  // Don't render children if user doesn't have access
  if (!allowedTiers.includes(userTier)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-cream">
        <div className="text-center">
          <h2 className="text-2xl font-display text-charcoal-deep mb-4">Access Restricted</h2>
          <p className="text-stone mb-6">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
