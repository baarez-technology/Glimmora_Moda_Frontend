'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function UHNILoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to unified login page, preserving any redirect parameter
    const redirect = searchParams.get('redirect');
    const targetUrl = redirect
      ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
      : '/auth/login';

    router.replace(targetUrl);
  }, [router, searchParams]);

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sand text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}

export default function UHNILoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sand text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <UHNILoginRedirect />
    </Suspense>
  );
}
