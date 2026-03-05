'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  User,
  Check,
  ChevronRight,
  ShoppingBag,
  Package,
  Tag,
  Percent,
  Clock,
  Bell,
  HeadphonesIcon,
  Calendar,
  Handshake,
  Scissors,
  Globe,
  Lock,
  Gift,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TIER_DEFINITIONS, getTierDefinition, getTierRank, canUpgradeTo, getBenefitsForTier } from '@/lib/pricing-tiers';
import type { PricingTier, TierBenefit } from '@/types/pricing-tiers';
import { TierBadge } from '@/components/shared/TierBadge';

// Icon mapping for benefits
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShoppingBag,
  Package,
  Sparkles,
  Tag,
  Percent,
  Clock,
  Bell,
  HeadphonesIcon,
  Calendar,
  Handshake,
  Scissors,
  Crown,
  Globe,
  Lock,
  Gift,
  Zap,
  User,
};

const TierIcon = ({ tier, size = 20 }: { tier: PricingTier; size?: number }) => {
  switch (tier) {
    case 'uhni':
      return <Crown size={size} />;
    case 'preferred':
      return <Sparkles size={size} />;
    default:
      return <User size={size} />;
  }
};

function BenefitIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = iconMap[iconName] || ShoppingBag;
  return <Icon size={16} className={className} />;
}

export default function PricingTiersPage() {
  const { pricingTier, tierSince, tierUpgradeRequest, requestTierUpgrade, isUHNI } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const currentDefinition = getTierDefinition(pricingTier);
  const memberSince = new Date(tierSince).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero */}
      <section className="relative bg-charcoal-deep py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold-soft/5 to-transparent" />
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 relative">
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-taupe hover:text-ivory-cream transition-colors text-sm mb-6"
            >
              <ArrowLeft size={14} />
              <span>Back to Profile</span>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <TierBadge tier={pricingTier} size="lg" />
                </div>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-2">
                  Your Membership
                </h1>
                <p className="text-taupe text-sm">
                  Member since {memberSince} &middot; {currentDefinition.tagline}
                </p>
              </div>

              {tierUpgradeRequest && tierUpgradeRequest.status === 'pending' && (
                <div className="bg-gold-soft/10 border border-gold-soft/30 px-6 py-4">
                  <p className="text-gold-soft text-sm font-medium">Upgrade Request Pending</p>
                  <p className="text-taupe text-xs mt-1">
                    Your request to upgrade to {getTierDefinition(tierUpgradeRequest.toTier).label} is being reviewed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-8">
              Compare Tiers
            </span>

            <div className="grid md:grid-cols-3 gap-6">
              {TIER_DEFINITIONS.map((definition) => {
                const isCurrentTier = definition.tier === pricingTier;
                const canUpgrade = canUpgradeTo(pricingTier, definition.tier);
                const hasPendingRequest =
                  tierUpgradeRequest?.status === 'pending' &&
                  tierUpgradeRequest.toTier === definition.tier;

                return (
                  <div
                    key={definition.tier}
                    className={`relative border transition-all ${
                      isCurrentTier
                        ? 'border-charcoal-deep bg-white shadow-lg'
                        : 'border-sand/50 bg-white hover:border-sand'
                    }`}
                  >
                    {/* Current tier indicator */}
                    {isCurrentTier && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-charcoal-deep text-ivory-cream text-[9px] tracking-[0.3em] uppercase px-3 py-1">
                          Your Tier
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div className={`p-6 ${definition.tier === 'uhni' ? 'bg-charcoal-deep' : 'bg-parchment'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 flex items-center justify-center ${
                            definition.tier === 'uhni'
                              ? 'bg-gold-soft/20 text-gold-soft'
                              : definition.tier === 'preferred'
                              ? 'bg-champagne/50 text-gold-muted'
                              : 'bg-sand/50 text-stone'
                          }`}
                        >
                          <TierIcon tier={definition.tier} />
                        </div>
                        <div>
                          <h3
                            className={`font-display text-lg ${
                              definition.tier === 'uhni' ? 'text-ivory-cream' : 'text-charcoal-deep'
                            }`}
                          >
                            {definition.label}
                          </h3>
                          <p
                            className={`text-xs ${
                              definition.tier === 'uhni' ? 'text-taupe' : 'text-stone'
                            }`}
                          >
                            {definition.tagline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="p-6 border-b border-sand/50">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-taupe mb-3">Requirements</p>
                      <ul className="space-y-2">
                        {definition.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-stone">
                            <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-taupe" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="p-6">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-taupe mb-3">Benefits</p>
                      <ul className="space-y-3">
                        {definition.benefits.map((benefit) => (
                          <li key={benefit.id} className="flex items-start gap-3">
                            <div className="w-6 h-6 flex items-center justify-center bg-parchment flex-shrink-0">
                              <BenefitIcon iconName={benefit.icon} className="text-stone" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-charcoal-deep">{benefit.title}</p>
                              <p className="text-xs text-taupe">{benefit.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action */}
                    <div className="p-6 pt-0">
                      {isCurrentTier ? (
                        <div className="flex items-center gap-2 text-sm text-charcoal-deep">
                          <Check size={16} />
                          <span>Current Tier</span>
                        </div>
                      ) : canUpgrade && !hasPendingRequest ? (
                        <button
                          onClick={() => requestTierUpgrade(definition.tier)}
                          className="w-full py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-charcoal-deep/90 transition-colors"
                        >
                          Request Upgrade
                        </button>
                      ) : hasPendingRequest ? (
                        <div className="text-center py-3 bg-gold-soft/10 border border-gold-soft/30 text-gold-muted text-xs tracking-wider uppercase">
                          Pending Review
                        </div>
                      ) : (
                        <div className="text-center py-3 text-taupe text-xs">
                          Included in your tier
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Your Benefits */}
      <section className="py-14 lg:py-20 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-8">
              Your Benefits
            </span>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getBenefitsForTier(pricingTier).map((benefit) => (
                <div key={benefit.id} className="bg-white border border-sand/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-parchment">
                      <BenefitIcon iconName={benefit.icon} className="text-stone" />
                    </div>
                    <TierBadge tier={benefit.tier} size="sm" variant="minimal" showIcon={false} />
                  </div>
                  <h4 className="text-sm font-medium text-charcoal-deep mb-1">{benefit.title}</h4>
                  <p className="text-xs text-taupe">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* UHNI Invitation CTA (for non-UHNI users) */}
      {!isUHNI && (
        <section className="py-14 lg:py-20">
          <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
            <div className={`bg-charcoal-deep p-10 lg:p-16 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={14} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/60">
                    By Invitation Only
                  </span>
                </div>
                <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1.1] mb-4">
                  UHNI Membership
                </h2>
                <p className="text-taupe text-sm mb-6 leading-relaxed">
                  Our most exclusive tier offers unparalleled access to bespoke services, private
                  collections, AI-powered personal concierge, and the ability to negotiate directly with
                  brands. Available by invitation only to ultra-high-net-worth individuals.
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold-soft/15 text-gold-soft hover:bg-gold-soft/25 transition-colors text-xs tracking-wider uppercase"
                >
                  <span>Learn More</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
