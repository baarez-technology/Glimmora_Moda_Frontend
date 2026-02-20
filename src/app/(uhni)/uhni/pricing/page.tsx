'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, DollarSign, Crown, Check, Clock, Bell, Tag, TrendingDown, MessageCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getPriceNegotiations,
  getPriceOffers,
  getPriceAlerts,
  getPricingTiers,
  getPricingSummary,
  acceptNegotiation,
  claimOffer
} from '@/services/uhni.service';
import type { NegotiationStatus, PriceNegotiation, UHNIPriceOffer, UHNIPriceAlert, UHNIPricingTier, UHNIPricingSummary } from '@/types';

export default function PricingPage() {
  const { concierge, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'negotiations' | 'offers' | 'alerts'>('negotiations');

  const [negotiations, setNegotiations] = useState<PriceNegotiation[]>([]);
  const [offers, setOffers] = useState<UHNIPriceOffer[]>([]);
  const [alerts, setAlerts] = useState<UHNIPriceAlert[]>([]);
  const [tiers, setTiers] = useState<UHNIPricingTier[]>([]);
  const [summary, setSummary] = useState<UHNIPricingSummary | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [negRes, offRes, alertRes, tierRes, sumRes] = await Promise.all([
          getPriceNegotiations(),
          getPriceOffers(),
          getPriceAlerts(),
          getPricingTiers(),
          getPricingSummary(),
        ]);
        setNegotiations(negRes.data);
        setOffers(offRes.data);
        setAlerts(alertRes.data);
        setTiers(tierRes.data);
        setSummary(sumRes.data);
      } catch {
        showToast('Failed to load pricing data', 'error');
      } finally {
        setIsDataLoading(false);
      }
    };
    loadData();
  }, []);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: NegotiationStatus) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', className: 'bg-gold-muted/10 text-gold-muted', icon: Clock };
      case 'approved':
        return { text: 'Approved', className: 'bg-success/10 text-success', icon: Check };
      case 'counter_offered':
        return { text: 'Counter Offer', className: 'bg-gold-soft/10 text-gold-soft', icon: Tag };
      case 'declined':
        return { text: 'Declined', className: 'bg-error/10 text-error', icon: AlertCircle };
      case 'accepted':
        return { text: 'Accepted', className: 'bg-success/10 text-success', icon: Check };
      default:
        return { text: status, className: 'bg-parchment text-stone', icon: Clock };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getDaysRemaining = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleAcceptOffer = async (id: string) => {
    try {
      await acceptNegotiation(id);
      setNegotiations(prev => prev.map(n => n.id === id ? { ...n, status: 'accepted' as NegotiationStatus } : n));
      showToast('Offer accepted successfully', 'success');
    } catch {
      showToast('Failed to accept offer', 'error');
    }
  };

  const handleClaimOffer = async (id: string, _name: string) => {
    try {
      await claimOffer(id);
      setOffers(prev => prev.map(o => o.id === id ? { ...o, claimed: true } : o));
      showToast('Offer claimed — your concierge will follow up', 'success');
    } catch {
      showToast('Failed to claim offer', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <DollarSign size={28} className="text-gold-soft" />
              </div>
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                  UHNI Exclusive
                </span>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Private Pricing
                </h1>
              </div>
            </div>
            <p className="text-sand mt-4 max-w-xl">
              Your exclusive pricing benefits, active negotiations, and special offers. As a UHNI member, enjoy concierge-assisted price negotiations on any item.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6">
            <TrendingDown size={20} className="text-success mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Lifetime Savings</p>
            <p className="font-display text-2xl text-charcoal-deep">{formatCurrency(summary?.lifetimeSavings ?? 0)}</p>
          </div>
          <div className="bg-white p-6">
            <Clock size={20} className="text-gold-muted mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Active Negotiations</p>
            <p className="font-display text-2xl text-charcoal-deep">{summary?.activeNegotiations ?? 0}</p>
          </div>
          <div className="bg-white p-6">
            <Tag size={20} className="text-gold-soft mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Pending Offers</p>
            <p className="font-display text-2xl text-charcoal-deep">{summary?.pendingOffers ?? 0}</p>
          </div>
          <div className="bg-white p-6">
            <Bell size={20} className="text-stone mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Price Alerts</p>
            <p className="font-display text-2xl text-charcoal-deep">{summary?.priceAlertsSet ?? 0}</p>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h2 className="font-display text-xl text-charcoal-deep mb-6">Your Pricing Tier</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const isCurrentTier = tier.tier === 'uhni';
              return (
                <div
                  key={tier.tier}
                  className={`p-6 ${isCurrentTier ? 'bg-charcoal-deep' : 'bg-white'} relative`}
                >
                  {isCurrentTier && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gold-soft text-noir text-[10px] tracking-[0.1em] uppercase">
                      Your Tier
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    {isCurrentTier && <Crown size={16} className="text-gold-soft" />}
                    <h3 className={`font-display text-lg ${isCurrentTier ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                      {tier.label}
                    </h3>
                  </div>
                  <p className={`text-sm mb-4 ${isCurrentTier ? 'text-sand' : 'text-stone'}`}>
                    {tier.description}
                  </p>
                  {tier.averageDiscount && (
                    <p className={`text-sm font-medium mb-4 ${isCurrentTier ? 'text-gold-soft' : 'text-success'}`}>
                      Average {tier.averageDiscount}% savings
                    </p>
                  )}
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${isCurrentTier ? 'text-sand/80' : 'text-stone'}`}>
                        <Check size={14} className={`mt-0.5 ${isCurrentTier ? 'text-gold-soft' : 'text-success'}`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-parchment p-1 mb-8">
          {[
            { value: 'negotiations' as const, label: 'Negotiations', count: negotiations.length },
            { value: 'offers' as const, label: 'Special Offers', count: offers.filter(o => !o.claimed).length },
            { value: 'alerts' as const, label: 'Price Alerts', count: alerts.length },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-colors ${
                activeTab === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Negotiations Tab */}
        {activeTab === 'negotiations' && (
          <div className="space-y-4">
            {negotiations.map((negotiation) => {
              const status = getStatusBadge(negotiation.status);
              const StatusIcon = status.icon;
              const daysRemaining = getDaysRemaining(negotiation.expiresAt);

              return (
                <div key={negotiation.id} className="bg-white p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                      <Image
                        src={negotiation.productImage}
                        alt={negotiation.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-xs text-taupe">{negotiation.brandName}</span>
                          <h3 className="font-display text-lg text-charcoal-deep">{negotiation.productName}</h3>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 ${status.className}`}>
                          <StatusIcon size={12} />
                          <span className="text-[10px] tracking-[0.1em] uppercase">{status.text}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex flex-wrap gap-6 mb-4">
                        <div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Original Price</span>
                          <span className="text-charcoal-deep line-through">{formatCurrency(negotiation.originalPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Your Proposal</span>
                          <span className="text-charcoal-deep">{formatCurrency(negotiation.proposedPrice)}</span>
                        </div>
                        {negotiation.counterOffer && (
                          <div>
                            <span className="text-[10px] tracking-[0.1em] uppercase text-gold-soft block">Counter Offer</span>
                            <span className="font-medium text-gold-soft">{formatCurrency(negotiation.counterOffer)}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {negotiation.conciergeNotes.length > 0 && (
                        <div className="bg-parchment p-4 mb-4">
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block mb-2">Concierge Notes</span>
                          {negotiation.conciergeNotes.map((note, idx) => (
                            <p key={idx} className="text-sm text-stone">{note}</p>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-taupe">
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                        </span>
                        {negotiation.status === 'counter_offered' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptOffer(negotiation.id)}
                              className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                            >
                              Accept Counter
                            </button>
                            <Link
                              href="/uhni/concierge"
                              className="px-4 py-2 border border-sand text-charcoal-deep text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
                            >
                              Negotiate Further
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {negotiations.length === 0 && (
              <div className="text-center py-16 bg-white">
                <DollarSign size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-stone mb-4">No active negotiations.</p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-noir"
                >
                  Browse Collection <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.filter(o => !o.claimed).map((offer) => {
              const daysRemaining = getDaysRemaining(offer.validUntil);

              return (
                <div key={offer.id} className="bg-white overflow-hidden">
                  {offer.targetImage && (
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={offer.targetImage}
                        alt={offer.targetName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-gold-soft text-noir text-sm font-medium">
                        {offer.discountType === 'percentage'
                          ? `${offer.discountValue}% OFF`
                          : `${formatCurrency(offer.discountValue)} OFF`
                        }
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">{offer.type}</span>
                    <h3 className="font-display text-lg text-charcoal-deep mb-2">{offer.targetName}</h3>

                    {offer.conditions && (
                      <ul className="mb-4 space-y-1">
                        {offer.conditions.map((condition, idx) => (
                          <li key={idx} className="text-xs text-stone">• {condition}</li>
                        ))}
                      </ul>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-sand">
                      <span className="text-xs text-taupe">
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                      </span>
                      <button
                        onClick={() => handleClaimOffer(offer.id, offer.targetName)}
                        disabled={daysRemaining === 0}
                        className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Claim Offer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const priceGap = alert.currentPrice - alert.targetPrice;
              const percentageGap = ((priceGap / alert.currentPrice) * 100).toFixed(1);

              return (
                <div key={alert.id} className="bg-white p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-24 h-24 flex-shrink-0">
                      <Image
                        src={alert.productImage}
                        alt={alert.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs text-taupe">{alert.brandName}</span>
                          <h3 className="font-display text-lg text-charcoal-deep">{alert.productName}</h3>
                        </div>
                        <div className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase ${
                          alert.triggered ? 'bg-success/10 text-success' : 'bg-parchment text-stone'
                        }`}>
                          {alert.triggered ? 'Triggered!' : 'Monitoring'}
                        </div>
                      </div>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Current Price</span>
                          <span className="text-charcoal-deep">{formatCurrency(alert.currentPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Your Target</span>
                          <span className="text-charcoal-deep">{formatCurrency(alert.targetPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Gap</span>
                          <span className="text-gold-muted">{percentageGap}% ({formatCurrency(priceGap)})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {alerts.length === 0 && (
              <div className="text-center py-16 bg-white">
                <Bell size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-stone">No price alerts set.</p>
              </div>
            )}
          </div>
        )}

        {/* Concierge CTA */}
        {concierge && (
          <div className="mt-12 bg-charcoal-deep p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gold-soft/20 flex items-center justify-center flex-shrink-0">
                <Crown size={24} className="text-gold-soft" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-ivory-cream mb-2">
                  Start a New Negotiation
                </h3>
                <p className="text-sand text-sm mb-6">
                  Found something you love? {concierge.name} can negotiate pricing on any item in our collection. UHNI members enjoy an average 12% savings through concierge negotiations.
                </p>
                <Link
                  href="/uhni/concierge"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-soft/10 text-gold-soft text-xs tracking-[0.15em] uppercase hover:bg-gold-soft/20 transition-colors"
                >
                  <MessageCircle size={14} />
                  Contact Concierge
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
