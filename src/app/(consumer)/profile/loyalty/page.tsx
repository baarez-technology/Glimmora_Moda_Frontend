'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Star, Gift, TrendingUp, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { userTier, orders } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/loyalty');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  const tierInfo = useMemo(() => {
    const tiers = {
      standard: {
        name: 'Standard',
        icon: Star,
        color: 'text-stone',
        bgColor: 'bg-stone/10',
        pointsMultiplier: 1,
        nextTier: 'Preferred',
        nextThreshold: 5000,
      },
      preferred: {
        name: 'Preferred',
        icon: Crown,
        color: 'text-gold-deep',
        bgColor: 'bg-gold-soft/10',
        pointsMultiplier: 1.5,
        nextTier: 'UHNI',
        nextThreshold: 25000,
      },
      uhni: {
        name: 'UHNI',
        icon: Crown,
        color: 'text-gold-soft',
        bgColor: 'bg-gold-soft/20',
        pointsMultiplier: 3,
        nextTier: null,
        nextThreshold: null,
      }
    };
    return tiers[userTier as keyof typeof tiers] || tiers.standard;
  }, [userTier]);

  // Calculate points from orders
  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [orders]);

  const points = Math.round(totalSpent * tierInfo.pointsMultiplier);
  const progressToNext = tierInfo.nextThreshold
    ? Math.min(100, Math.round((totalSpent / tierInfo.nextThreshold) * 100))
    : 100;

  const TierIcon = tierInfo.icon;

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading loyalty data...</p>
        </div>
      </div>
    );
  }

  const benefits = [
    { tier: 'standard', items: ['Earn 1 point per €1 spent', 'Birthday reward', 'Early access to sales'] },
    { tier: 'preferred', items: ['Earn 1.5x points', 'Free styling sessions', 'Priority customer support', 'Exclusive collections access'] },
    { tier: 'uhni', items: ['Earn 3x points', 'Personal concierge', 'Private shopping events', 'Bespoke services', 'Autonomous shopping'] }
  ];

  const rewards = [
    { name: '10% Off Next Purchase', points: 500, available: points >= 500 },
    { name: 'Free Express Shipping', points: 250, available: points >= 250 },
    { name: 'Exclusive Preview Access', points: 1000, available: points >= 1000 },
    { name: 'Private Styling Session', points: 2500, available: points >= 2500 },
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Rewards
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Loyalty &amp; Rewards
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Current Tier */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-16 h-16 ${tierInfo.bgColor} flex items-center justify-center`}>
              <TierIcon size={28} className={tierInfo.color} />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone">Current Tier</p>
              <h2 className="font-display text-3xl text-charcoal-deep">{tierInfo.name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-4 bg-parchment">
              <p className="font-display text-3xl text-charcoal-deep">{points.toLocaleString()}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1">Total Points</p>
            </div>
            <div className="text-center p-4 bg-parchment">
              <p className="font-display text-3xl text-charcoal-deep">{tierInfo.pointsMultiplier}x</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1">Points Multiplier</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {tierInfo.nextTier && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-stone">Progress to {tierInfo.nextTier}</span>
                <span className="text-charcoal-deep font-medium">{progressToNext}%</span>
              </div>
              <div className="h-2 bg-sand/30 overflow-hidden">
                <div
                  className="h-full bg-charcoal-deep transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-xs text-stone mt-2">
                &euro;{Math.max(0, (tierInfo.nextThreshold || 0) - totalSpent).toLocaleString()} more to reach {tierInfo.nextTier}
              </p>
            </div>
          )}
        </div>

        {/* Rewards Catalog */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Gift size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Available Rewards</h2>
              <p className="text-sm text-stone">Redeem your points</p>
            </div>
          </div>
          <div className="space-y-3">
            {rewards.map(reward => (
              <div key={reward.name} className="flex items-center justify-between py-4 border-b border-sand last:border-0">
                <div>
                  <p className="font-medium text-charcoal-deep">{reward.name}</p>
                  <p className="text-xs text-stone">{reward.points.toLocaleString()} points</p>
                </div>
                {reward.available ? (
                  <button className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors">
                    Redeem
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-stone">
                    <Lock size={12} />
                    {(reward.points - points).toLocaleString()} pts needed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <TrendingUp size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Tier Benefits</h2>
              <p className="text-sm text-stone">What each tier offers</p>
            </div>
          </div>
          <div className="space-y-6">
            {benefits.map(tier => {
              const isCurrentTier = tier.tier === userTier;
              return (
                <div key={tier.tier} className={`p-4 ${isCurrentTier ? 'bg-gold-soft/5 border border-gold-soft/20' : 'bg-parchment/50'}`}>
                  <p className={`text-sm font-medium mb-3 capitalize ${isCurrentTier ? 'text-gold-deep' : 'text-charcoal-deep'}`}>
                    {tier.tier} {isCurrentTier && '(Current)'}
                  </p>
                  <ul className="space-y-2">
                    {tier.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-stone">
                        <Star size={12} className={isCurrentTier ? 'text-gold-soft' : 'text-stone/40'} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
