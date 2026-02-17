'use client';

import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-parchment flex items-center justify-center mb-6">
        <Icon size={32} className="text-taupe" />
      </div>

      <h3 className="font-display text-2xl text-charcoal-deep mb-3">
        {title}
      </h3>

      <p className="text-stone max-w-md mb-8">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
        >
          <span className="text-sm tracking-[0.15em] uppercase">{actionLabel}</span>
          <ArrowRight size={16} />
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
        >
          <span className="text-sm tracking-[0.15em] uppercase">{actionLabel}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
