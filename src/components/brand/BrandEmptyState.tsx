'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BrandEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  accent?: 'gold' | 'success' | 'warning' | 'error';
}

const RING_MAP: Record<NonNullable<BrandEmptyStateProps['accent']>, { ring: string; text: string }> = {
  gold: { ring: 'border-gold-soft/40', text: 'text-gold-soft' },
  success: { ring: 'border-success/40', text: 'text-success' },
  warning: { ring: 'border-warning/40', text: 'text-warning' },
  error: { ring: 'border-error/40', text: 'text-error' },
};

/**
 * Editorial empty state used when a section has no data.
 * Gold-ringed icon medallion + Cormorant Garamond heading + descriptive copy.
 */
export function BrandEmptyState({
  icon: Icon,
  title,
  description,
  action,
  accent = 'gold',
}: BrandEmptyStateProps) {
  const ring = RING_MAP[accent];
  return (
    <div className="bg-white border border-sand/40 px-8 py-20 text-center">
      <div className={`w-16 h-16 mx-auto mb-5 border ${ring.ring} rounded-full flex items-center justify-center`}>
        <Icon size={22} strokeWidth={1.5} className={ring.text} />
      </div>
      <p className="font-display text-2xl text-charcoal-deep mb-2 tracking-[-0.01em]">{title}</p>
      {description && (
        <p className="text-sm text-stone max-w-md mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
}
