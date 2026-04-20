'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, DollarSign, Crown, Check, Clock, Bell, Tag, TrendingDown, MessageCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPrice } from '@/lib/currency';
import {
  getPriceNegotiations,
  getPriceAlerts,
  getPricingSummary,
  acceptNegotiation,
  declineNegotiation,
} from '@/services/uhni.service';
import type { NegotiationStatus, PriceNegotiation, UHNIPriceAlert, UHNIPricingSummary } from '@/types';

export default function PricingPage() {
  const {
    concierge, showToast,
    priceNegotiations: contextNegotiations, respondToCounterOffer,
    priceAlerts: contextPriceAlerts, deletePriceAlert, togglePriceAlert
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'negotiations' | 'alerts'>('negotiations');

  const [negotiations, setNegotiations] = useState<PriceNegotiation[]>([]);
  const [alerts, setAlerts] = useState<UHNIPriceAlert[]>([]);
  const [summary, setSummary] = useState<UHNIPricingSummary | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [negRes, alertRes, sumRes] = await Promise.all([
          getPriceNegotiations(),
          getPriceAlerts(),
          getPricingSummary(),
        ]);
        setNegotiations(() => {
          const serviceIds = new Set(negRes.data.map((n: PriceNegotiation) => n.id));
          const contextOnly = contextNegotiations.filter(n => !serviceIds.has(n.id));
          return [...contextOnly, ...negRes.data];
        });
        setAlerts(alertRes.data);
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

  const formatCurrency = (amount: number) => formatPrice(amount);

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
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">UHNI Exclusive</span>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Private Pricing
                </h1>
              </div>
            </div>
            <p className="text-sand mt-4 max-w-xl">
              Your active negotiations and price alerts. As a UHNI member, enjoy concierge-assisted price negotiations on any item.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
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
            <Bell size={20} className="text-stone mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Price Alerts</p>
            <p className="font-display text-2xl text-charcoal-deep">{summary?.priceAlertsSet ?? 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-parchment p-1 mb-8">
          {[
            { value: 'negotiations' as const, label: 'Negotiations', count: negotiations.length, actionCount: negotiations.filter(n => n.status === 'counter_offered').length },
            { value: 'alerts' as const, label: 'Price Alerts', count: contextPriceAlerts.length + alerts.length, actionCount: contextPriceAlerts.filter(a => a.triggeredAt).length },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-colors relative ${
                activeTab === tab.value ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
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
                      <Image src={negotiation.productImage} alt={negotiation.productName} fill className="object-cover" />
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
                          <span className="text-charcoal-deep">{formatCurrency(negotiation.originalPrice)}</span>
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
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${daysRemaining <= 2 ? 'text-warning font-medium' : daysRemaining === 0 ? 'text-error' : 'text-taupe'}`}>
                          {daysRemaining > 0 ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining` : 'Expired'}
                        </span>
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
                <Link href="/discover" className="inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-noir">
                  Browse Collection <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {contextPriceAlerts.map((alert) => {
              const priceGap = alert.currentPrice - alert.targetPrice;
              const percentageGap = ((priceGap / alert.currentPrice) * 100).toFixed(1);
              const isTriggered = alert.triggeredAt !== undefined;
              return (
                <div
                  key={alert.id}
                  className={`bg-white p-6 border transition-all ${isTriggered ? 'border-success/30 bg-success/5' : alert.isActive ? 'border-sand' : 'border-sand/50 opacity-60'}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <Link href={`/product/${alert.productSlug}`} className="relative w-full md:w-24 h-24 flex-shrink-0 group overflow-hidden">
                      {alert.productImage ? (
                        <Image src={alert.productImage} alt={alert.productName} fill className="object-cover transition-transform group-hover:scale-105" />
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
                          <Link href={`/product/${alert.productSlug}`} className="block font-display text-lg text-charcoal-deep hover:text-noir transition-colors">
                            {alert.productName}
                          </Link>
                        </div>
                        <div className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase flex items-center gap-1.5 ${isTriggered ? 'bg-success/10 text-success' : alert.isActive ? 'bg-parchment text-stone' : 'bg-sand/50 text-taupe'}`}>
                          {isTriggered ? <><Check size={12} /> Price Dropped!</> : alert.isActive ? <><Clock size={12} /> Monitoring</> : 'Paused'}
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
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-sand/50">
                        <p className="text-xs text-taupe">
                          Created {new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => togglePriceAlert(alert.id)} className="px-3 py-1.5 text-xs tracking-[0.1em] uppercase border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors">
                            {alert.isActive ? 'Pause' : 'Resume'}
                          </button>
                          <button onClick={() => deletePriceAlert(alert.id)} className="px-3 py-1.5 text-xs tracking-[0.1em] uppercase border border-error/30 text-error hover:bg-error/10 transition-colors">
                            Remove
                          </button>
                          {isTriggered && (
                            <Link href={`/product/${alert.productSlug}`} className="px-4 py-1.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors">
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
            {contextPriceAlerts.length === 0 && alerts.length === 0 && (
              <div className="text-center py-16 bg-white border border-sand">
                <Bell size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-charcoal-deep font-medium mb-2">No price alerts set</p>
                <p className="text-stone text-sm mb-6 max-w-md mx-auto">
                  Set price alerts on any product to be notified when the price reaches your target.
                </p>
                <Link href="/discover" className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors">
                  Browse Collection <ArrowRight size={14} />
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
                <h3 className="font-display text-xl text-ivory-cream mb-2">Start a New Negotiation</h3>
                <p className="text-sand text-sm mb-6">
                  Found something you love? {concierge.name} can negotiate pricing on any item in our collection.
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
