'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, isLoggingOut } = useAuth();
  const [clientReady, setClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check localStorage on client mount only (not during SSR)
  useEffect(() => {
    try {
      setHasToken(!!localStorage.getItem('moda-user-token'));
    } catch {
      setHasToken(false);
    }
    setClientReady(true);
  }, []);

  // Re-check token when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      setHasToken(true);
    }
  }, [isAuthenticated]);

  const effectivelyAuthenticated = isAuthenticated || hasToken;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!clientReady || !isHydrated) return;
    if (isLoggingOut) return;

    if (!effectivelyAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [clientReady, isHydrated, effectivelyAuthenticated, isLoggingOut, pathname, router]);

  // Show loading until both client and auth are ready
  if (!clientReady || !isHydrated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold-muted border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-stone text-sm tracking-[0.1em] uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show brief loading while redirect happens
  if (!effectivelyAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-muted border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
