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
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Product Awareness</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => {
                const AwarenessIcon = getAwarenessIcon(item.awareness);
                const DisplayModeIcon = getDisplayModeIcon(item.displayMode);
                const relevancePercent = Math.round(item.relevanceScore * 100);
                return (
                  <div key={item.id} className="bg-white border border-sand/30 overflow-hidden flex flex-col">
                    <div className="relative w-full aspect-square bg-parchment">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-charcoal-deep/80 backdrop-blur-sm px-2 py-1 flex items-center gap-1.5">
                        <Gauge size={12} className="text-gold-soft" />
                        <span className="text-[10px] text-ivory-cream font-medium">{relevancePercent}%</span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getAwarenessBadge(item.awareness)}`}>
                          <AwarenessIcon size={12} />
                          {item.awareness}
                        </span>
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getDisplayModeBadge(item.displayMode)}`}>
                          <DisplayModeIcon size={12} />
                          {item.displayMode}
                        </span>
                      </div>

                      <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-1">{item.brandName}</p>
                      <h3 className="font-display text-lg text-charcoal-deep mb-2">{item.productName}</h3>
                      <p className="font-display text-xl text-charcoal-deep mb-4">{formatCurrency(item.price)}</p>

                      <p className="text-sm text-stone leading-relaxed mt-auto">{item.context}</p>

                      <div className="mt-4 pt-4 border-t border-sand/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Relevance</span>
                          <span className="text-xs text-charcoal-deep font-medium">{relevancePercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-parchment overflow-hidden">
                          <div
                            className="h-full bg-gold-soft transition-all duration-500"
                            style={{ width: `${relevancePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && isLoaded && (
              <div className="text-center py-16">
                <Radio size={40} className="text-stone/40 mx-auto mb-4" />
                <p className="text-stone">No silent commerce items available</p>
              </div>
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
