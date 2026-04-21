'use client';

import { ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface IntelligencePageWrapperProps {
  title: string;
  subtitle: string;
  acronym?: string;
  phase?: number;
  status?: string;
  backendNote?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  showHeuristicBanner?: boolean;
}

export default function IntelligencePageWrapper({
  title,
  subtitle,
  acronym,
  children,
  isLoading,
  error,
  showHeuristicBanner = true,
}: IntelligencePageWrapperProps) {
  return (
    <div>
      {/* Intelligence Header */}
      <div className="px-8 py-6 border-b border-sand/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            {acronym && (
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold-muted font-medium">
                  {acronym}
                </span>
              </div>
            )}
            <h1 className="font-display text-2xl text-charcoal-deep">{title}</h1>
            <p className="text-stone text-sm mt-1">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Heuristic Disclaimer Banner */}
      {showHeuristicBanner && (
        <div className="mx-8 mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800 mb-0.5 flex items-center gap-1">
              <Info size={11} />
              Heuristic Indicators
            </p>
            <p className="text-xs text-amber-700">
              These metrics are based on behavioral proxies and are being refined with machine learning.
              Use as directional guidance only — not as definitive business intelligence.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-sand/30" />
                ))}
              </div>
              <div className="h-48 bg-sand/30" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-sand/30" />
                <div className="h-32 bg-sand/30" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertCircle size={40} className="mx-auto text-error/40 mb-4" />
                <p className="text-stone text-sm mb-1">Failed to load intelligence data</p>
                <p className="text-taupe text-xs">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
