'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Crown,
  Radio,
  Eye,
  Bell,
  Gauge,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { SilentCommerceItem, AwarenessLevel, DisplayMode } from '@/types/uhni';

export default function SilentCommercePage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState<SilentCommerceItem[]>([]);

  useEffect(() => {
    uhniService.getSilentCommerceItems().then(res => {
      if (res.data) setItems(res.data);
      setIsLoaded(true);
    });
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Silent Commerce
            </h1>
            <p className="text-sand mt-3">Ambient product awareness and discovery</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Product Awareness Cards */}
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Product Awareness</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const AwarenessIcon = getAwarenessIcon(item.awareness);
            const DisplayModeIcon = getDisplayModeIcon(item.displayMode);
            const relevancePercent = Math.round(item.relevanceScore * 100);
            return (
              <div key={item.id} className="bg-white border border-sand/30 overflow-hidden flex flex-col">
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-parchment">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                  {/* Relevance Score Overlay */}
                  <div className="absolute top-3 right-3 bg-charcoal-deep/80 backdrop-blur-sm px-2 py-1 flex items-center gap-1.5">
                    <Gauge size={12} className="text-gold-soft" />
                    <span className="text-[10px] text-ivory-cream font-medium">{relevancePercent}%</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Badges */}
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

                  {/* Product Info */}
                  <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-1">{item.brandName}</p>
                  <h3 className="font-display text-lg text-charcoal-deep mb-2">{item.productName}</h3>
                  <p className="font-display text-xl text-charcoal-deep mb-4">{formatCurrency(item.price)}</p>

                  {/* Context */}
                  <p className="text-sm text-stone leading-relaxed mt-auto">{item.context}</p>

                  {/* Relevance Bar */}
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
      </div>
    </div>
  );
}
