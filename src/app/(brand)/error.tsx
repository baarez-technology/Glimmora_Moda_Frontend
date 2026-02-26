'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function BrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Brand portal error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <h2 className="font-display text-2xl text-charcoal-deep mb-4">
          Something went wrong
        </h2>
        <p className="text-sm text-stone mb-8">
          An error occurred in the brand portal. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-white text-sm rounded-lg hover:bg-charcoal-deep/90 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
          <Link
            href="/brand"
            className="inline-flex items-center gap-2 px-6 py-3 border border-sand text-charcoal-deep text-sm rounded-lg hover:bg-sand/20 transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
