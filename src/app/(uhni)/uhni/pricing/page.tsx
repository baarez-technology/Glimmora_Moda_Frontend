'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, DollarSign, Crown, Check, Clock, Bell, Tag, TrendingDown, MessageCircle, ArrowRight, AlertCircle, Gift, Package, FolderOpen, Building, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getPriceNegotiations,
  getPriceAlerts,
  getPricingTiers,
  getPricingSummary,
  acceptNegotiation,
  declineNegotiation,
} from '@/services/uhni.service';
import type { NegotiationStatus, PriceNegotiation, UHNIPriceAlert, UHNIPricingTier, UHNIPricingSummary } from '@/types';
import type { UHNIPriceOffer } from '@/types/uhni';
import type { PriceAlert } from '@/types/pricing-tiers';

export default function PricingPage() {
  const {
    concierge, showToast,
    priceNegotiations: contextNegotiations, respondToCounterOffer,
    uhniOffers, claimedOffers, claimOffer,
    priceAlerts: contextPriceAlerts, deletePriceAlert, togglePriceAlert
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'negotiations' | 'offers' | 'alerts'>('negotiations');

  const [negotiations, setNegotiations] = useState<PriceNegotiation[]>([]);
  const [alerts, setAlerts] = useState<UHNIPriceAlert[]>([]);
  const [tiers, setTiers] = useState<UHNIPricingTier[]>([]);
  const [summary, setSummary] = useState<UHNIPricingSummary | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Offer detail modal
  const [selectedOffer, setSelectedOffer] = useState<UHNIPriceOffer | null>(null);
  const [showOfferDetail, setShowOfferDetail] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [negRes, alertRes, tierRes, sumRes] = await Promise.all([
          getPriceNegotiations(),
          getPriceAlerts(),
          getPricingTiers(),
          getPricingSummary(),
        ]);
        setNegotiations(() => {
          const serviceIds = new Set(negRes.data.map((n: PriceNegotiation) => n.id));
          const contextOnly = contextNegotiations.filter(n => !serviceIds.has(n.id));
          return [...contextOnly, ...negRes.data];
        });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      respondToCounterOffer(id, 'accept');
      await acceptNegotiation(id);
      setNegotiations(prev => prev.map(n => n.id === id ? { ...n, status: 'accepted' as NegotiationStatus } : n));
    } catch {
      showToast('Failed to accept offer', 'error');
    }
  };

  const handleRejectOffer = async (id: string) => {
    try {
      respondToCounterOffer(id, 'reject');
      await declineNegotiation(id);
      setNegotiations(prev => prev.map(n => n.id === id ? { ...n, status: 'declined' as NegotiationStatus } : n));
    } catch {
      showToast('Failed to decline offer', 'error');
    }
  };

  // Offer helpers
  const isOfferClaimed = (offerId: string) => claimedOffers.some(c => c.offerId === offerId);

  const getDiscountDisplay = (offer: UHNIPriceOffer) => {
    if (offer.discountType === 'percentage') return `${offer.discountValue}% off`;
    return `€${offer.discountValue.toLocaleString()} off`;
  };

  const getOfferTypeIcon = (type: UHNIPriceOffer['type']) => {
    switch (type) {
      case 'product': return Package;
      case 'collection': return FolderOpen;
      case 'brand': return Building;
      default: return Tag;
    }
  };

  const getOfferTypeBadge = (type: UHNIPriceOffer['type']) => {
    switch (type) {
      case 'product': return 'bg-gold-soft/20 text-gold-deep';
      case 'collection': return 'bg-champagne/30 text-gold-muted';
      case 'brand': return 'bg-parchment text-charcoal-deep';
      default: return 'bg-parchment text-stone';
    }
  };

  const getOfferTargetUrl = (offer: UHNIPriceOffer): string | null => {
    switch (offer.type) {
      case 'product':
        return offer.productSlug ? `/product/${offer.productSlug}` : null;
      case 'collection':
        return offer.targetId ? `/uhni/collections` : null;
      case 'brand':
        return offer.targetId ? `/brands/${offer.targetId}` : null;
      default:
        return null;
    }
  };

  const getOfferTargetLabel = (type: UHNIPriceOffer['type']) => {
    switch (type) {
      case 'product': return 'View Product';
      case 'collection': return 'View Collection';
      case 'brand': return 'View Brand';
      default: return 'View';
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
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Available Offers</p>
            <p className="font-display text-2xl text-charcoal-deep">{uhniOffers.length}</p>
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
            { value: 'negotiations' as const, label: 'Negotiations', count: negotiations.length, actionCount: negotiations.filter(n => n.status === 'counter_offered').length },
            { value: 'offers' as const, label: 'Special Offers', count: uhniOffers.length, actionCount: 0 },
            { value: 'alerts' as const, label: 'Price Alerts', count: contextPriceAlerts.length + alerts.length, actionCount: contextPriceAlerts.filter(a => a.triggeredAt).length },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-colors relative ${
                activeTab === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label} ({tab.count})
              {tab.actionCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-gold-soft text-noir text-[10px] font-medium rounded-full">
                  {tab.actionCount}
                </span>
              )}
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
                    <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                      <Image
                        src={negotiation.productImage}
                        alt={negotiation.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
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
                      {/* Negotiation History Timeline */}
                      <div className="mb-4">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Negotiation History</span>
                        <div className="relative pl-5 border-l border-sand/60 space-y-4">
                          {/* Step 1: Client proposed */}
                          <div className="relative">
                            <div className="absolute -left-[22.5px] top-0.5 w-4 h-4 rounded-full bg-charcoal-deep flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-ivory-cream" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-charcoal-deep">You proposed</span>
                                <span className="text-xs font-medium text-charcoal-deep">{formatCurrency(negotiation.proposedPrice)}</span>
                              </div>
                              {negotiation.clientMessage && (
                                <p className="text-sm text-stone mt-1 italic">&ldquo;{negotiation.clientMessage}&rdquo;</p>
                              )}
                              <p className="text-[10px] text-taupe mt-1">
                                {new Date(negotiation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          {/* Concierge notes (if any) */}
                          {negotiation.conciergeNotes.map((note, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[22.5px] top-0.5 w-4 h-4 rounded-full bg-gold-soft/40 flex items-center justify-center">
                                <Crown size={8} className="text-gold-deep" />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gold-muted">Concierge</span>
                                <p className="text-sm text-stone mt-0.5">{note}</p>
                              </div>
                            </div>
                          ))}

                          {/* Step 2: Brand responded (counter/approved/declined) */}
                          {(negotiation.status === 'counter_offered' || negotiation.status === 'approved' || negotiation.status === 'declined') && (
                            <div className="relative">
                              <div className={`absolute -left-[22.5px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                                negotiation.status === 'counter_offered' ? 'bg-gold-soft' :
                                negotiation.status === 'approved' ? 'bg-success' : 'bg-error/70'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-charcoal-deep">{negotiation.brandName}</span>
                                  {negotiation.status === 'counter_offered' && negotiation.counterOffer && (
                                    <span className="text-xs font-medium text-gold-deep">countered at {formatCurrency(negotiation.counterOffer)}</span>
                                  )}
                                  {negotiation.status === 'approved' && (
                                    <span className="text-xs font-medium text-success">approved your price</span>
                                  )}
                                  {negotiation.status === 'declined' && (
                                    <span className="text-xs font-medium text-error">declined</span>
                                  )}
                                </div>
                                {negotiation.brandMessage && (
                                  <p className="text-sm text-stone mt-1 italic">&ldquo;{negotiation.brandMessage}&rdquo;</p>
                                )}
                                {negotiation.respondedAt && (
                                  <p className="text-[10px] text-taupe mt-1">
                                    {new Date(negotiation.respondedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Step 3: Client accepted/rejected counter */}
                          {negotiation.status === 'accepted' && (
                            <div className="relative">
                              <div className="absolute -left-[22.5px] top-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                                <Check size={10} className="text-white" />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-success">You accepted the counter offer</span>
                                <p className="text-[10px] text-taupe mt-1">
                                  Final price: <span className="font-medium text-charcoal-deep">{formatCurrency(negotiation.counterOffer || negotiation.proposedPrice)}</span>
                                  {' · Saved '}
                                  <span className="font-medium text-success">{formatCurrency(negotiation.originalPrice - (negotiation.counterOffer || negotiation.proposedPrice))}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Pending indicator */}
                          {negotiation.status === 'pending' && (
                            <div className="relative">
                              <div className="absolute -left-[22.5px] top-0.5 w-4 h-4 rounded-full bg-sand flex items-center justify-center">
                                <Clock size={8} className="text-stone" />
                              </div>
                              <span className="text-xs text-taupe italic">Awaiting brand response...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {daysRemaining > 0 ? (
                            <span className={`text-xs ${daysRemaining <= 2 ? 'text-warning font-medium' : 'text-taupe'}`}>
                              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                            </span>
                          ) : (
                            <span className="text-xs text-error">Expired</span>
                          )}
                        </div>
                        {negotiation.status === 'counter_offered' && daysRemaining > 0 && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptOffer(negotiation.id)}
                              className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                            >
                              Accept Counter
                            </button>
                            <button
                              onClick={() => handleRejectOffer(negotiation.id)}
                              className="px-4 py-2 border border-error/30 text-error text-xs tracking-[0.1em] uppercase hover:bg-error/10 transition-colors"
                            >
                              Decline
                            </button>
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
          <div className="space-y-6">
            {/* Claimed offers wallet */}
            {claimedOffers.filter(c => c.status === 'active').length > 0 && (
              <div className="bg-gold-soft/10 border border-gold-soft/30 p-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold-muted mb-4">
                  Your Offer Wallet — {claimedOffers.filter(c => c.status === 'active').length} Active
                </p>
                <div className="space-y-3">
                  {claimedOffers.filter(c => c.status === 'active').map(claimed => (
                    <div
                      key={claimed.id}
                      className="bg-white border border-gold-soft/20 p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-charcoal-deep">{claimed.offerTitle}</p>
                        <p className="text-xs text-stone mt-0.5">
                          {claimed.brandName}
                          {claimed.productName && ` · ${claimed.productName}`}
                        </p>
                        <p className="text-xs text-taupe mt-0.5">
                          Expires {new Date(claimed.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-display text-gold-deep">{claimed.discountLabel}</p>
                        {claimed.productSlug ? (
                          <Link
                            href={`/product/${claimed.productSlug}`}
                            className="text-xs text-stone hover:text-charcoal-deep transition-colors underline mt-1 block"
                          >
                            View Product
                          </Link>
                        ) : claimed.productId ? (
                          <Link
                            href={claimed.brandName ? `/brands/${claimed.brandName.toLowerCase().replace(/\s+/g, '-')}` : '#'}
                            className="text-xs text-stone hover:text-charcoal-deep transition-colors underline mt-1 block"
                          >
                            View Brand
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available offers */}
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">
                Available Offers — {uhniOffers.length} exclusive
              </p>

              {uhniOffers.length === 0 ? (
                <div className="bg-white border border-sand p-12 text-center">
                  <Gift size={48} className="mx-auto text-taupe/40 mb-4" />
                  <p className="text-stone text-sm">No offers available right now</p>
                  <p className="text-taupe text-xs mt-1">Exclusive offers from your preferred brands will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uhniOffers.map(offer => {
                    const daysLeft = getDaysRemaining(offer.validUntil);
                    const claimed = isOfferClaimed(offer.id);
                    const TypeIcon = getOfferTypeIcon(offer.type);
                    const claimsRemaining = offer.maxClaims
                      ? offer.maxClaims - (offer.claimedCount || 0)
                      : null;

                    return (
                      <div
                        key={offer.id}
                        className={`bg-white border p-6 transition-colors ${
                          claimed ? 'border-success/30 bg-success/5' : 'border-sand'
                        }`}
                      >
                        <div className="flex items-start gap-5">
                          {/* Offer image or icon */}
                          <div className="w-16 h-16 bg-parchment flex items-center justify-center flex-shrink-0">
                            {offer.productImage ? (
                              <img src={offer.productImage} alt={offer.targetName} className="w-full h-full object-cover" />
                            ) : (
                              <TypeIcon size={24} className="text-stone" />
                            )}
                          </div>

                          {/* Offer info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-[10px] px-2 py-0.5 tracking-[0.1em] uppercase ${getOfferTypeBadge(offer.type)}`}>
                                {offer.type}
                              </span>
                              {offer.isPrivate && (
                                <span className="text-[10px] px-2 py-0.5 tracking-[0.1em] uppercase bg-gold-soft/30 text-gold-deep">
                                  Private
                                </span>
                              )}
                              {daysLeft <= 3 && daysLeft > 0 && (
                                <span className="text-[10px] px-2 py-0.5 tracking-[0.1em] uppercase bg-error/10 text-error">
                                  Expires soon
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] tracking-[0.15em] uppercase text-gold-muted">
                              {offer.brandName}
                            </p>
                            {(() => {
                              const targetUrl = getOfferTargetUrl(offer);
                              return targetUrl ? (
                                <Link href={targetUrl} className="font-medium text-charcoal-deep mt-0.5 hover:text-gold-deep transition-colors underline decoration-sand hover:decoration-gold-deep block">
                                  {offer.targetName}
                                </Link>
                              ) : (
                                <p className="font-medium text-charcoal-deep mt-0.5">{offer.targetName}</p>
                              );
                            })()}

                            {/* Discount display */}
                            <div className="flex items-baseline gap-2 mt-2">
                              <p className="font-display text-2xl text-charcoal-deep">
                                {getDiscountDisplay(offer)}
                              </p>
                              {offer.type === 'product' && (offer.originalPrice || 0) > 0 && (
                                <p className="text-sm text-stone">
                                  on €{(offer.originalPrice || 0).toLocaleString()}
                                </p>
                              )}
                            </div>

                            {/* Conditions */}
                            {offer.conditions && offer.conditions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {offer.conditions.map((cond, i) => (
                                  <span key={i} className="text-[10px] text-stone bg-parchment px-2 py-0.5">
                                    {cond}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Expiry and claims info */}
                            <div className="flex items-center gap-4 mt-3">
                              <p className={`text-xs ${daysLeft <= 3 ? 'text-error' : 'text-taupe'}`}>
                                {daysLeft > 0
                                  ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                                  : 'Expired'
                                }
                              </p>
                              {claimsRemaining !== null && (
                                <p className="text-xs text-taupe">
                                  {claimsRemaining} of {offer.maxClaims} remaining
                                </p>
                              )}
                              {(offer.claimedCount || 0) > 0 && (
                                <p className="text-xs text-taupe">{offer.claimedCount} claimed</p>
                              )}
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {claimed ? (
                              <div className="flex items-center gap-2">
                                <Check size={16} className="text-success" />
                                <span className="text-sm text-success font-medium">Claimed</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => claimOffer(offer)}
                                  disabled={daysLeft <= 0 || (claimsRemaining !== null && claimsRemaining <= 0)}
                                  className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  Claim Offer
                                </button>
                                <button
                                  onClick={() => { setSelectedOffer(offer); setShowOfferDetail(true); }}
                                  className="px-5 py-2 border border-sand text-stone text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors whitespace-nowrap"
                                >
                                  View Details
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Active alerts from context */}
            {contextPriceAlerts.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">
                  Your Price Alerts — {contextPriceAlerts.filter(a => a.isActive).length} active
                </p>
                <div className="space-y-4">
                  {contextPriceAlerts.map((alert) => {
                    const priceGap = alert.currentPrice - alert.targetPrice;
                    const percentageGap = ((priceGap / alert.currentPrice) * 100).toFixed(1);
                    const isTriggered = alert.triggeredAt !== undefined;

                    return (
                      <div
                        key={alert.id}
                        className={`bg-white p-6 border transition-all ${
                          isTriggered
                            ? 'border-success/30 bg-success/5'
                            : alert.isActive
                            ? 'border-sand'
                            : 'border-sand/50 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <Link
                            href={`/product/${alert.productSlug}`}
                            className="relative w-full md:w-24 h-24 flex-shrink-0 group overflow-hidden"
                          >
                            {alert.productImage ? (
                              <Image
                                src={alert.productImage}
                                alt={alert.productName}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-parchment flex items-center justify-center">
                                <Tag size={24} className="text-taupe" />
                              </div>
                            )}
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span className="text-xs text-taupe">{alert.brandName}</span>
                                <Link
                                  href={`/product/${alert.productSlug}`}
                                  className="block font-display text-lg text-charcoal-deep hover:text-noir transition-colors"
                                >
                                  {alert.productName}
                                </Link>
                              </div>
                              <div className="flex items-center gap-2">
                                {isTriggered ? (
                                  <div className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success flex items-center gap-1.5">
                                    <Check size={12} />
                                    Price Dropped!
                                  </div>
                                ) : alert.isActive ? (
                                  <div className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-parchment text-stone flex items-center gap-1.5">
                                    <Clock size={12} />
                                    Monitoring
                                  </div>
                                ) : (
                                  <div className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-sand/50 text-taupe">
                                    Paused
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-6 mt-3">
                              <div>
                                <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Current Price</span>
                                <span className="text-charcoal-deep">{formatCurrency(alert.currentPrice)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Your Target</span>
                                <span className="text-charcoal-deep font-medium">{formatCurrency(alert.targetPrice)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Gap</span>
                                <span className="text-gold-muted">{percentageGap}% ({formatCurrency(priceGap)})</span>
                              </div>
                              {isTriggered && alert.triggeredPrice && (
                                <div>
                                  <span className="text-[10px] tracking-[0.1em] uppercase text-success block">Triggered At</span>
                                  <span className="text-success font-medium">{formatCurrency(alert.triggeredPrice)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-sand/50">
                              <p className="text-xs text-taupe">
                                Created {new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => togglePriceAlert(alert.id)}
                                  className="px-3 py-1.5 text-xs tracking-[0.1em] uppercase border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
                                >
                                  {alert.isActive ? 'Pause' : 'Resume'}
                                </button>
                                <button
                                  onClick={() => deletePriceAlert(alert.id)}
                                  className="px-3 py-1.5 text-xs tracking-[0.1em] uppercase border border-error/30 text-error hover:bg-error/10 transition-colors"
                                >
                                  Remove
                                </button>
                                {isTriggered && (
                                  <Link
                                    href={`/product/${alert.productSlug}`}
                                    className="px-4 py-1.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                                  >
                                    View Product
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Service-based alerts (legacy) */}
            {alerts.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">
                  Service Alerts — {alerts.length} items
                </p>
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const priceGap = alert.currentPrice - alert.targetPrice;
                    const percentageGap = ((priceGap / alert.currentPrice) * 100).toFixed(1);

                    return (
                      <div key={alert.id} className="bg-white p-6 border border-sand">
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
                </div>
              </div>
            )}

            {contextPriceAlerts.length === 0 && alerts.length === 0 && (
              <div className="text-center py-16 bg-white border border-sand">
                <Bell size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-charcoal-deep font-medium mb-2">No price alerts set</p>
                <p className="text-stone text-sm mb-6 max-w-md mx-auto">
                  Set price alerts on any product to be notified when the price drops to your target.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                >
                  Browse Collection
                  <ArrowRight size={14} />
                </Link>
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

      {/* Offer Detail Modal */}
      {showOfferDetail && selectedOffer && (
        <div
          className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOfferDetail(false)}
        >
          <div
            className="bg-white max-w-lg w-full p-8 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Offer Details</h3>
              <button
                onClick={() => setShowOfferDetail(false)}
                className="p-2 hover:bg-sand/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold-muted mb-1">{selectedOffer.brandName}</p>
                <p className="font-display text-2xl text-charcoal-deep">{selectedOffer.targetName}</p>
                <p className="text-3xl font-display text-charcoal-deep mt-3">{getDiscountDisplay(selectedOffer)}</p>
                {selectedOffer.type === 'product' && (selectedOffer.originalPrice || 0) > 0 && (
                  <p className="text-sm text-stone mt-1">
                    Original price: €{(selectedOffer.originalPrice || 0).toLocaleString()}
                    {' → '}€
                    {(selectedOffer.discountType === 'percentage'
                      ? Math.round((selectedOffer.originalPrice || 0) * (1 - selectedOffer.discountValue / 100))
                      : (selectedOffer.originalPrice || 0) - selectedOffer.discountValue
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="border-t border-sand pt-4">
                <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-2">Validity</p>
                <p className="text-sm text-charcoal-deep">
                  {new Date(selectedOffer.validFrom).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {' — '}
                  {new Date(selectedOffer.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {selectedOffer.conditions && selectedOffer.conditions.length > 0 && (
                <div className="border-t border-sand pt-4">
                  <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-2">Conditions</p>
                  <ul className="space-y-1">
                    {selectedOffer.conditions.map((cond, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone">
                        <span className="w-1 h-1 rounded-full bg-taupe mt-2 flex-shrink-0" />
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedOffer.maxClaims && selectedOffer.maxClaims > 0 && (
                <div className="border-t border-sand pt-4">
                  <p className="text-xs tracking-[0.1em] uppercase text-taupe mb-1">Availability</p>
                  <p className="text-sm text-charcoal-deep">
                    {selectedOffer.maxClaims - (selectedOffer.claimedCount || 0)} of {selectedOffer.maxClaims} remaining
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              {!isOfferClaimed(selectedOffer.id) ? (
                <button
                  onClick={() => { claimOffer(selectedOffer); setShowOfferDetail(false); }}
                  className="w-full px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Claim This Offer
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3">
                  <Check size={18} className="text-success" />
                  <p className="text-success font-medium">You have claimed this offer</p>
                </div>
              )}
              {(() => {
                const targetUrl = getOfferTargetUrl(selectedOffer);
                return targetUrl ? (
                  <Link
                    href={targetUrl}
                    onClick={() => setShowOfferDetail(false)}
                    className="w-full px-6 py-3 border border-gold-soft text-gold-deep hover:bg-gold-soft/10 transition-colors text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={16} />
                    {getOfferTargetLabel(selectedOffer.type)}
                  </Link>
                ) : null;
              })()}
              <button
                onClick={() => setShowOfferDetail(false)}
                className="w-full px-6 py-3 border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
