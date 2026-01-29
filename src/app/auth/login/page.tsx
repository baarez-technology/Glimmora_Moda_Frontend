'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to consumer login, preserving any redirect parameter
    const redirect = searchParams.get('redirect');
    const targetUrl = redirect
      ? `/auth/login/consumer?redirect=${encodeURIComponent(redirect)}`
      : '/auth/login/consumer';

    router.replace(targetUrl);
  }, [router, searchParams]);

  // Show minimal loading state during redirect
  return (
    <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
