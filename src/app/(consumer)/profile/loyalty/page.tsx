'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Star, Gift, TrendingUp, Lock, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getCurrencySymbol } from '@/lib/currency';
import { useAuth } from '@/context/AuthContext';
import * as loyaltyService from '@/services/loyalty.service';

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { userTier: contextTier, showToast, currency } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [spentPoints, setSpentPoints] = useState(0);
  const [serverLoyalty, setServerLoyalty] = useState<loyaltyService.LoyaltyResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/loyalty');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    setIsLoaded(true);
    let cancelled = false;
    loyaltyService.getLoyalty()
      .then(data => {
        if (cancelled) return;
        setServerLoyalty(data);
        setRedeemedRewards(data.redeemedRewards || []);
        setSpentPoints(data.spentPoints || 0);
        setLoadError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load loyalty data');
      });
    return () => { cancelled = true; };
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
    const activeTier = serverLoyalty?.tier || contextTier;
    return tiers[activeTier as keyof typeof tiers] || tiers.standard;
  }, [contextTier, serverLoyalty]);

  const totalSpent = serverLoyalty?.totalSpent ?? 0;
  const earnedPoints = serverLoyalty?.earnedPoints ?? Math.round(totalSpent * tierInfo.pointsMultiplier);
  const points = serverLoyalty?.availablePoints ?? (earnedPoints - spentPoints);
  const progressToNext = tierInfo.nextThreshold
    ? Math.min(100, Math.round((totalSpent / tierInfo.nextThreshold) * 100))
    : 100;

  // Reward catalog mirrors backend `_REWARD_CATALOGUE` in app/routes/loyalty.py
  const rewardIdMap: Record<string, string> = {
    '10% Off Next Purchase': 'reward_10_percent_off',
    'Free Express Shipping': 'reward_free_shipping',
    'Priority VIP Support': 'reward_priority_support',
    'Concierge Styling Call': 'reward_concierge_call',
  };

  const handleRedeem = async (rewardName: string, rewardPoints: number) => {
    if (points < rewardPoints) return;
    const rewardId = rewardIdMap[rewardName];
    if (!rewardId) {
      showToast('Reward unavailable', 'error');
      return;
    }
    try {
      const result = await loyaltyService.redeemReward(rewardId);
      setRedeemedRewards(result.redeemedRewards);
      setSpentPoints((serverLoyalty?.earnedPoints ?? earnedPoints) - result.remainingPoints);
      // Refresh full snapshot so derived totals stay correct.
      const fresh = await loyaltyService.getLoyalty().catch(() => null);
      if (fresh) setServerLoyalty(fresh);
      showToast(`Redeemed: ${rewardName}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Redemption failed', 'error');
    }
  };

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
    { tier: 'standard', items: [`Earn 1 point per ${getCurrencySymbol(currency)}1 spent`, 'Birthday reward', 'Early access to sales'] },
    { tier: 'preferred', items: ['Earn 1.5x points', 'Free styling sessions', 'Priority customer support', 'Exclusive collections access'] },
    { tier: 'uhni', items: ['Earn 3x points', 'Personal concierge', 'Private shopping events', 'Bespoke services', 'Autonomous shopping'] }
  ];

  const rewards = [
    { name: '10% Off Next Purchase', points: 500, available: points >= 500 },
    { name: 'Free Express Shipping', points: 250, available: points >= 250 },
    { name: 'Priority VIP Support', points: 1000, available: points >= 1000 },
    { name: 'Concierge Styling Call', points: 2500, available: points >= 2500 },
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {loadError && (
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-3">
          <div className="max-w-[1200px] mx-auto flex items-start gap-3">
            <span className="text-amber-600 text-sm mt-0.5">⚠</span>
            <p className="text-amber-800 text-sm">{loadError}</p>
          </div>
        </div>
      )}
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
            {rewards.map(reward => {
              const isRedeemed = redeemedRewards.includes(reward.name);
              return (
                <div key={reward.name} className="flex items-center justify-between py-4 border-b border-sand last:border-0">
                  <div>
                    <p className={`font-medium ${isRedeemed ? 'text-stone line-through' : 'text-charcoal-deep'}`}>{reward.name}</p>
                    <p className="text-xs text-stone">{reward.points.toLocaleString()} points</p>
                  </div>
                  {isRedeemed ? (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <Check size={12} />
                      Redeemed
                    </span>
                  ) : reward.available ? (
                    <button
                      onClick={() => handleRedeem(reward.name, reward.points)}
                      className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors"
                    >
                      Redeem
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-stone">
                      <Lock size={12} />
                      {(reward.points - points).toLocaleString()} pts needed
                    </span>
                  )}
                </div>
              );
            })}
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
              const isCurrentTier = tier.tier === (serverLoyalty?.tier || contextTier);
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
