'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function ConsumerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Consumer page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ivory-cream flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
          Something Went Wrong
        </span>
        <h2 className="font-display text-2xl text-charcoal-deep mb-4">
          We encountered an issue
        </h2>
        <p className="text-sm text-stone mb-8 leading-relaxed">
          An unexpected error occurred while loading this page. Please try again or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wider uppercase rounded-full hover:bg-charcoal-deep/90 transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-charcoal-deep text-charcoal-deep text-sm tracking-wider uppercase rounded-full hover:bg-charcoal-deep hover:text-ivory-cream transition-colors"
          >
            <Home size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
