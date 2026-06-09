'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ConsumerLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auth guard: if the user is already authenticated, send them home instead
    // of looping them back through the login page (BUG_23 fix).
    const userToken = localStorage.getItem('moda-user-token');
    const userData = localStorage.getItem('moda-user-data');
    if (userToken && userData) {
      try {
        const parsed = JSON.parse(userData);
        router.replace(parsed?.role === 'uhni' ? '/uhni' : '/');
        return;
      } catch { /* fall through to normal redirect */ }
    }

    // Redirect to unified login page, preserving any redirect parameter
    const redirect = searchParams.get('redirect');
    const targetUrl = redirect
      ? `/auth/login?mode=consumer&redirect=${encodeURIComponent(redirect)}`
      : '/auth/login?mode=consumer';

    router.replace(targetUrl);
  }, [router, searchParams]);

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}

export default function ConsumerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <ConsumerLoginRedirect />
    </Suspense>
  );
}
