'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Public paths — accessible to unauthenticated visitors.
// The page component is responsible for rendering anonymous vs authenticated views.
const PUBLIC_PATHS = ['/'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, isLoggingOut } = useAuth();
  const [clientReady, setClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    try {
      setHasToken(!!localStorage.getItem('moda-user-token'));
    } catch {
      setHasToken(false);
    }
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setHasToken(true);
    }
  }, [isAuthenticated]);

  const effectivelyAuthenticated = isAuthenticated || hasToken;
  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (!clientReady || !isHydrated) return;
    if (isLoggingOut) return;
    if (publicPath) return;

    if (!effectivelyAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [clientReady, isHydrated, effectivelyAuthenticated, isLoggingOut, pathname, router, publicPath]);

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

  if (!publicPath && !effectivelyAuthenticated) {
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
