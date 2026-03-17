'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Check localStorage directly for a valid token.
 * This is needed because after login, `storeUserAuth()` writes to localStorage
 * synchronously BEFORE `router.push()`, but the React AuthContext state update
 * may not have committed yet when AuthGuard renders on the target page.
 */
function hasTokenInStorage(): boolean {
  try {
    return !!localStorage.getItem('moda-user-token');
  } catch {
    return false;
  }
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, isLoggingOut } = useAuth();

  // Also check localStorage as a synchronous fallback
  const hasToken = hasTokenInStorage();
  const effectivelyAuthenticated = isAuthenticated || hasToken;

  useEffect(() => {
    // Don't redirect during logout (state is transitioning)
    if (isLoggingOut) return;

    if (isHydrated && !effectivelyAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [isHydrated, effectivelyAuthenticated, isLoggingOut, pathname, router]);

  // Show loading state while checking authentication
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold-muted border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-stone text-sm tracking-[0.1em] uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated (and no token in storage)
  if (!effectivelyAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center max-w-md px-8">
          <h2 className="font-display text-3xl text-charcoal-deep mb-4">Welcome to ModaGlimmora</h2>
          <p className="text-stone mb-6">
            Sign in to access your personalized fashion experience.
          </p>
          <div className="w-8 h-8 border-2 border-gold-muted border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-taupe text-sm mt-4">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
