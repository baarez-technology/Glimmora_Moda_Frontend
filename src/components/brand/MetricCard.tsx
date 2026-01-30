'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  size?: 'default' | 'large';
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel = 'vs last period',
  trend,
  prefix = '',
  suffix = '',
  size = 'default'
}: MetricCardProps) {
  // Determine trend from change if not provided
  const effectiveTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);

  const getTrendColor = () => {
    switch (effectiveTrend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-stone';
    }
  };

  const getTrendIcon = () => {
    switch (effectiveTrend) {
      case 'up': return <TrendingUp size={14} />;
      case 'down': return <TrendingDown size={14} />;
      default: return <Minus size={14} />;
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Format large numbers with commas
      return val.toLocaleString();
    }
    return val;
  };

  const formatChange = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  return (
    <div className="bg-white p-6 border border-sand/50">
      <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
        {label}
      </p>
      <p className={`font-display text-charcoal-deep ${size === 'large' ? 'text-4xl' : 'text-3xl'}`}>
        {prefix}{formatValue(value)}{suffix}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm">
            {formatChange(change)}
          </span>
          <span className="text-xs text-taupe ml-1">
            {changeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for grids
export function MetricCardCompact({
  label,
  value,
  change,
  trend,
  icon: Icon
}: {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
}) {
  const effectiveTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);

  const getTrendColor = () => {
    switch (effectiveTrend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-stone';
    }
  };

  return (
    <div className="bg-white p-4 border border-sand/50 flex items-center gap-4">
      {Icon && (
        <div className="w-10 h-10 bg-parchment flex items-center justify-center text-stone">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-stone">{label}</p>
        <p className="font-display text-xl text-charcoal-deep">{value}</p>
      </div>
      {change !== undefined && (
        <span className={`text-sm ${getTrendColor()}`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// Summary card for key stats
export function SummaryCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-sand/50">
      <div className="px-6 py-4 border-b border-sand/50">
        <h3 className="text-sm font-medium text-charcoal-deep">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
