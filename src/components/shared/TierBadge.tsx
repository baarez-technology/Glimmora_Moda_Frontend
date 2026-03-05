'use client';

import { Crown, Sparkles, User } from 'lucide-react';
import type { PricingTier } from '@/types/pricing-tiers';
import { getTierDefinition } from '@/lib/pricing-tiers';

interface TierBadgeProps {
  tier: PricingTier;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'pill';
  showIcon?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-[9px] px-2 py-0.5 gap-1',
  md: 'text-[10px] px-2.5 py-1 gap-1.5',
  lg: 'text-xs px-3 py-1.5 gap-2',
};

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 14,
};

const TierIcon = ({ tier, size }: { tier: PricingTier; size: number }) => {
  switch (tier) {
    case 'uhni':
      return <Crown size={size} />;
    case 'preferred':
      return <Sparkles size={size} />;
    default:
      return <User size={size} />;
  }
};

export function TierBadge({
  tier,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className = '',
}: TierBadgeProps) {
  const definition = getTierDefinition(tier);

  const baseStyles = `inline-flex items-center font-medium tracking-wider uppercase whitespace-nowrap ${sizeStyles[size]}`;

  const variantStyles = {
    default: `${definition.color} ${definition.textColor} border ${definition.borderColor}`,
    minimal: `${definition.textColor} bg-transparent`,
    pill: `${definition.color} ${definition.textColor} border ${definition.borderColor} rounded-full`,
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {showIcon && <TierIcon tier={tier} size={iconSizes[size]} />}
      <span>{definition.label}</span>
    </span>
  );
}

export function TierBadgeInteractive({
  tier,
  size = 'md',
  onClick,
  className = '',
}: TierBadgeProps & { onClick?: () => void }) {
  const definition = getTierDefinition(tier);

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center font-medium tracking-wider uppercase whitespace-nowrap transition-all hover:scale-105 hover:shadow-sm ${sizeStyles[size]} ${definition.color} ${definition.textColor} border ${definition.borderColor} ${className}`}
    >
      <TierIcon tier={tier} size={iconSizes[size]} />
      <span>{definition.label}</span>
    </button>
  );
}
