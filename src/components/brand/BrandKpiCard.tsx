'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Accent = 'gold' | 'warning' | 'success' | 'info' | 'error' | 'neutral';

interface BrandKpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
  icon?: LucideIcon;
  delta?: { value: number; direction: 'up' | 'down' };
}

const ACCENT_BG: Record<Accent, string> = {
  gold: 'bg-gold-soft/15 text-gold-deep',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/15 text-success',
  info: 'bg-info/15 text-info',
  error: 'bg-error/15 text-error',
  neutral: 'bg-charcoal-deep/10 text-charcoal-deep',
};

const ACCENT_THREAD: Record<Accent, string> = {
  gold: 'from-gold-soft/0 via-gold-soft to-gold-soft/0',
  warning: 'from-warning/0 via-warning to-warning/0',
  success: 'from-success/0 via-success to-success/0',
  info: 'from-info/0 via-info to-info/0',
  error: 'from-error/0 via-error to-error/0',
  neutral: 'from-charcoal-deep/0 via-charcoal-deep/60 to-charcoal-deep/0',
};

export function BrandKpiCard({
  label,
  value,
  hint,
  accent = 'neutral',
  icon: Icon,
  delta,
}: BrandKpiCardProps) {
  return (
    <div className="group relative bg-white rounded-xl border border-sand/50 p-6 shadow-card-lift hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-500 overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${ACCENT_THREAD[accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        aria-hidden="true"
      />
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background:
            accent === 'gold'
              ? 'radial-gradient(circle, rgba(201,169,98,0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(74,85,104,0.18) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between mb-5">
        <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone">
          {label}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ACCENT_BG[accent]}`}>
            <Icon size={16} strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="relative flex items-baseline gap-2 mb-2">
        <p
          className="font-display font-light text-[2.5rem] text-charcoal-deep leading-none tracking-[-0.03em] font-mono-tight"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {value}
        </p>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
              delta.direction === 'up' ? 'text-success' : 'text-error'
            }`}
          >
            {delta.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta.value)}%
          </span>
        )}
      </div>

      {hint && (
        <p className="text-xs text-taupe tracking-tight">{hint}</p>
      )}
    </div>
  );
}
