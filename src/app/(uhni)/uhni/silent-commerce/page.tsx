'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Crown,
  Radio,
  Eye,
  EyeOff,
  Bell,
  Gauge,
  Layers,
  AlertTriangle,
  UserCheck,
  Cpu,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  Info,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { SilentCommerceItem, AwarenessLevel, DisplayMode, InvisibleTransaction, InvisibleMethod, DiscretionLevel } from '@/types/uhni';

type Tab = 'awareness' | 'transactions';

export default function SilentCommercePage() {
  const searchParams = useSearchParams();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const initialTab = searchParams.get('tab') === 'transactions' ? 'transactions' : 'awareness';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [items, setItems] = useState<SilentCommerceItem[]>([]);
  const [transactions, setTransactions] = useState<InvisibleTransaction[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      uhniService.getSilentCommerceItems().then(res => {
        if (res.data) setItems(res.data);
      }),
      uhniService.getInvisibleTransactions().then(res => {
        if (res.data) setTransactions(res.data);
      }),
    ]).catch(() => {
      showToast('Failed to load data', 'error');
    }).finally(() => {
      setIsLoaded(true);
    });
  }, []);

  // Awareness helpers
  const getAwarenessBadge = (level: AwarenessLevel) => {
    switch (level) {
      case 'passive': return 'bg-info/10 text-info';
      case 'active': return 'bg-warning/10 text-warning';
      case 'urgent': return 'bg-error/10 text-error';
    }
  };

  const getAwarenessIcon = (level: AwarenessLevel) => {
    switch (level) {
      case 'passive': return Radio;
      case 'active': return Eye;
      case 'urgent': return AlertTriangle;
    }
  };

  const getDisplayModeBadge = (mode: DisplayMode) => {
    switch (mode) {
      case 'ambient': return 'bg-purple-100 text-purple-700';
      case 'card': return 'bg-gold-soft/20 text-gold-deep';
      case 'notification': return 'bg-green-100 text-green-700';
    }
  };

  const getDisplayModeIcon = (mode: DisplayMode) => {
    switch (mode) {
      case 'ambient': return Layers;
      case 'card': return Layers;
      case 'notification': return Bell;
    }
  };

  // Transaction helpers
  const getMethodBadge = (method: InvisibleMethod) => {
    switch (method) {
      case 'concierge': return 'bg-gold-soft/20 text-gold-deep';
      case 'auto': return 'bg-info/10 text-info';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
    }
  };

  const getMethodIcon = (method: InvisibleMethod) => {
    switch (method) {
      case 'concierge': return UserCheck;
      case 'auto': return Cpu;
      case 'scheduled': return Clock;
    }
  };

  const getDiscretionBadge = (level: DiscretionLevel) => {
    switch (level) {
      case 'standard': return 'bg-stone/10 text-stone';
      case 'high': return 'bg-warning/10 text-warning';
      case 'maximum': return 'bg-error/10 text-error';
    }
  };

  const getDiscretionIcon = (level: DiscretionLevel) => {
    switch (level) {
      case 'standard': return ShieldCheck;
      case 'high': return ShieldAlert;
      case 'maximum': return Shield;
    }
  };

  const getStatusBadge = (status: InvisibleTransaction['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'processing': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-stone/10 text-stone';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'awareness', label: 'Awareness', count: items.length },
    { key: 'transactions', label: 'Transactions', count: transactions.length },
  ];

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
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Silent Commerce
            </h1>
            <p className="text-sand mt-3">Ambient discovery and discreet transactions</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-10 border-b border-ivory-cream/10">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-sm tracking-[0.1em] uppercase transition-colors relative flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'text-gold-soft'
                    : 'text-sand/60 hover:text-sand'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 ${
                    activeTab === tab.key ? 'bg-gold-soft/20 text-gold-soft' : 'bg-ivory-cream/10 text-sand/60'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-soft" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══════════════════════════════════════════════ */}
        {/* TAB 1: Awareness (from Silent Commerce)        */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'awareness' && (
          <>
            {/* How it works */}
            <div className="mb-8 bg-parchment border border-sand p-5 flex gap-4">
              <Info size={18} className="text-stone flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal-deep mb-1">How Silent Commerce Works</p>
                <p className="text-sm text-stone leading-relaxed">
                  Based on your style profile, browsing patterns, and upcoming events, our AI quietly surfaces items
                  you might love. Select items to add to your cart or wishlist — you&apos;re always in control.
                </p>
              </div>
            </div>

            {items.length === 0 && isLoaded ? (
              <div className="text-center py-16 bg-white border border-sand">
                <Radio size={40} className="text-taupe/40 mx-auto mb-4" />
                <p className="text-charcoal-deep font-medium mb-2">No items prepared yet</p>
                <p className="text-sm text-stone mb-6 max-w-md mx-auto">
                  Browse products and build your wardrobe so Silent Commerce can learn your preferences.
                </p>
                <Link
                  href="/uhni/discover"
                  className="inline-block px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                {/* Items count + Select All */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand">
                  <p className="text-sm text-charcoal-deep">
                    <span className="font-medium">{items.length} items</span> prepared for you
                  </p>
                  <button
                    onClick={() => {
                      if (selectedItems.size === items.length) {
                        setSelectedItems(new Set());
                      } else {
                        setSelectedItems(new Set(items.map(i => i.id)));
                      }
                    }}
                    className="text-sm font-medium tracking-[0.1em] uppercase text-charcoal-deep hover:text-gold-deep transition-colors"
                  >
                    {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Item Cards */}
                <div className="space-y-4">
                  {items.map(item => {
                    const AwarenessIcon = getAwarenessIcon(item.awareness);
                    const relevancePercent = Math.round(item.relevanceScore * 100);
                    const isSelected = selectedItems.has(item.id);

                    return (
                      <div key={item.id} className="bg-white border border-sand/50 overflow-hidden">
                        {/* Product Row */}
                        <div className="flex gap-4 p-5">
                          {/* Checkbox */}
                          <button
                            onClick={() => {
                              setSelectedItems(prev => {
                                const next = new Set(prev);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                return next;
                              });
                            }}
                            className={`flex-shrink-0 w-5 h-5 mt-1 border transition-colors flex items-center justify-center ${
                              isSelected
                                ? 'bg-charcoal-deep border-charcoal-deep'
                                : 'border-sand hover:border-charcoal-deep'
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-ivory-cream" />}
                          </button>

                          {/* Image */}
                          <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                            <div className="relative w-[90px] h-[110px] bg-parchment overflow-hidden">
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                              />
                              {/* Awareness indicator */}
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                item.awareness === 'urgent' ? 'bg-error' :
                                item.awareness === 'active' ? 'bg-gold-soft' : 'bg-info/50'
                              }`} />
                            </div>
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-0.5">
                              {item.brandName}
                            </p>
                            <Link href={`/product/${item.productId}`} className="hover:underline decoration-sand">
                              <p className="text-sm font-medium text-charcoal-deep leading-tight mb-1">
                                {item.productName}
                              </p>
                            </Link>
                            <p className="font-display text-lg text-charcoal-deep">
                              {formatCurrency(item.price)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase inline-flex items-center gap-1 ${getAwarenessBadge(item.awareness)}`}>
                                <AwarenessIcon size={10} />
                                {item.awareness}
                              </span>
                            </div>
                          </div>

                          {/* Relevance Score */}
                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center gap-1.5">
                              <Gauge size={14} className="text-gold-soft" />
                              <span className="text-sm font-medium text-charcoal-deep">{relevancePercent}%</span>
                            </div>
                            <p className="text-[9px] text-taupe mt-0.5">match</p>
                          </div>
                        </div>

                        {/* Context / Reason */}
                        <div className="px-5 pb-4">
                          <div className="bg-parchment/50 border border-sand/30 px-4 py-3">
                            <p className="text-xs text-stone leading-relaxed">{item.context}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Summary */}
                {items.length > 0 && (
                  <div className="mt-8 border-t border-sand pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Selected Total</p>
                        <p className="text-lg font-display text-charcoal-deep">
                          {formatCurrency(
                            items.filter(i => selectedItems.has(i.id)).reduce((sum, i) => sum + i.price, 0)
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Full Cart Value</p>
                        <p className="text-lg font-display text-charcoal-deep">
                          {formatCurrency(items.reduce((sum, i) => sum + i.price, 0))}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedItems.size === 0) return;
                          showToast(`${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} added to cart`, 'success');
                          setSelectedItems(new Set());
                        }}
                        disabled={selectedItems.size === 0}
                        className={`flex-1 py-3.5 text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-colors ${
                          selectedItems.size > 0
                            ? 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
                            : 'bg-sand text-stone cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag size={16} />
                        Add to Cart ({selectedItems.size})
                      </button>
                      <button
                        onClick={() => {
                          if (selectedItems.size === 0) return;
                          showToast(`${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} added to wishlist`, 'success');
                          setSelectedItems(new Set());
                        }}
                        disabled={selectedItems.size === 0}
                        className={`px-6 py-3.5 text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 border transition-colors ${
                          selectedItems.size > 0
                            ? 'border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream'
                            : 'border-sand text-stone cursor-not-allowed'
                        }`}
                      >
                        <Heart size={16} />
                        Wishlist
                      </button>
                    </div>

                    <p className="text-xs text-taupe text-center mt-4">
                      Items are prepared based on your preferences and expire after 30 days.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* TAB 2: Transactions (from Invisible Commerce)  */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === 'transactions' && (
          <>
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Transaction Log</h2>
            <div className="space-y-4">
              {transactions.map(transaction => {
                const MethodIcon = getMethodIcon(transaction.method);
                const DiscretionIcon = getDiscretionIcon(transaction.discretionLevel);
                return (
                  <div key={transaction.id} className="bg-white border border-sand/30 p-6">
                    <div className="flex items-start gap-5">
                      <div className="relative w-20 h-20 flex-shrink-0 bg-parchment overflow-hidden">
                        <Image
                          src={transaction.productImage}
                          alt={transaction.productName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display text-lg text-charcoal-deep mb-1">{transaction.productName}</h3>
                            <p className="text-xs text-stone">{formatDate(transaction.date)}</p>
                          </div>
                          <p className="font-display text-xl text-charcoal-deep flex-shrink-0 ml-4">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>

                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getMethodBadge(transaction.method)}`}>
                            <MethodIcon size={12} />
                            {transaction.method}
                          </span>
                          <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getDiscretionBadge(transaction.discretionLevel)}`}>
                            <DiscretionIcon size={12} />
                            {transaction.discretionLevel}
                          </span>
                          <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(transaction.status)}`}>
                            {transaction.status}
                          </span>
                          {transaction.noDigitalTrail && (
                            <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-charcoal-deep/5 text-charcoal-deep inline-flex items-center gap-1.5">
                              <EyeOff size={12} />
                              No Trail
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {transactions.length === 0 && isLoaded && (
              <div className="text-center py-16">
                <EyeOff size={40} className="text-stone/40 mx-auto mb-4" />
                <p className="text-stone">No discreet transactions found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
