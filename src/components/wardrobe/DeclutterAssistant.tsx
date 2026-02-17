'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Heart, RefreshCw, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface DeclutterAssistantProps {
  products: Product[];
  wearHistory?: Record<string, number>; // productId -> wear count
  className?: string;
}

interface DeclutterSuggestion {
  product: Product;
  reason: string;
  action: 'donate' | 'resale' | 'keep' | 'consider';
  estimatedValue?: number;
  tip?: string;
}

function getResaleEstimate(product: Product): number {
  // Estimate resale value based on brand and original price
  const brandMultipliers: Record<string, number> = {
    'Hermès': 0.9,
    'Chanel': 0.85,
    'Louis Vuitton': 0.7,
    'Dior': 0.6,
    'Gucci': 0.5,
    'Bottega Veneta': 0.55
  };

  const multiplier = brandMultipliers[product.brandName] || 0.4;
  return Math.round(product.price * multiplier);
}

export default function DeclutterAssistant({
  products,
  wearHistory = {},
  className = ''
}: DeclutterAssistantProps) {
  const suggestions = useMemo((): DeclutterSuggestion[] => {
    return products.map(product => {
      const wears = wearHistory[product.id] || 0;
      const monthsOwned = 6; // Assume 6 months for demo
      const wearsPerMonth = wears / monthsOwned;
      const resaleValue = getResaleEstimate(product);

      // Never worn items
      if (wears === 0 && product.price > 500) {
        return {
          product,
          reason: 'Never worn - consider if it fits your lifestyle',
          action: 'consider' as const,
          estimatedValue: resaleValue,
          tip: 'Try styling it differently or consider resale if it doesn\'t match your current style'
        };
      }

      // Rarely worn expensive items
      if (wearsPerMonth < 0.5 && product.price > 1000) {
        return {
          product,
          reason: `Only worn ${wears} time${wears !== 1 ? 's' : ''} - high cost per wear`,
          action: 'resale' as const,
          estimatedValue: resaleValue,
          tip: `Potential resale value: $${resaleValue.toLocaleString()}`
        };
      }

      // Frequently worn items - keep!
      if (wearsPerMonth >= 2) {
        return {
          product,
          reason: 'Wardrobe workhorse - well-loved piece',
          action: 'keep' as const,
          tip: 'Great investment! Consider protecting it for longevity'
        };
      }

      // Lower value items worn rarely - donate
      if (wearsPerMonth < 1 && product.price < 500) {
        return {
          product,
          reason: 'Rarely worn - could bring joy to someone else',
          action: 'donate' as const,
          tip: 'Tax-deductible donation opportunity'
        };
      }

      // Default: keep
      return {
        product,
        reason: 'Moderately used - fits your lifestyle',
        action: 'keep' as const
      };
    }).sort((a, b) => {
      const actionOrder = { resale: 0, donate: 1, consider: 2, keep: 3 };
      return actionOrder[a.action] - actionOrder[b.action];
    });
  }, [products, wearHistory]);

  const stats = useMemo(() => {
    const toResale = suggestions.filter(s => s.action === 'resale');
    const toDonate = suggestions.filter(s => s.action === 'donate');
    const potentialValue = toResale.reduce((sum, s) => sum + (s.estimatedValue || 0), 0);

    return { toResale, toDonate, potentialValue };
  }, [suggestions]);

  const actionConfig = {
    resale: { icon: <DollarSign className="w-4 h-4" />, color: 'emerald', label: 'Consider Reselling' },
    donate: { icon: <Heart className="w-4 h-4" />, color: 'pink', label: 'Consider Donating' },
    consider: { icon: <RefreshCw className="w-4 h-4" />, color: 'amber', label: 'Reconsider' },
    keep: { icon: <Sparkles className="w-4 h-4" />, color: 'gold-soft', label: 'Keep' }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white rounded-xl p-5 border border-stone/20 text-center">
          <DollarSign className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-display text-charcoal-deep">${stats.potentialValue.toLocaleString()}</p>
          <p className="text-xs text-stone/60">Potential Resale Value</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone/20 text-center">
          <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-display text-charcoal-deep">{stats.toResale.length}</p>
          <p className="text-xs text-stone/60">Items to Consider</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone/20 text-center">
          <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
          <p className="text-2xl font-display text-charcoal-deep">{stats.toDonate.length}</p>
          <p className="text-xs text-stone/60">For Donation</p>
        </div>
      </motion.div>

      {/* Suggestions by Action */}
      {(['resale', 'consider', 'donate'] as const).map((action) => {
        const actionSuggestions = suggestions.filter(s => s.action === action);
        if (actionSuggestions.length === 0) return null;

        const config = actionConfig[action];

        return (
          <motion.div
            key={action}
            className="bg-white rounded-xl border border-stone/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`px-5 py-4 border-b border-stone/10 bg-${config.color}-50`}
              style={{ backgroundColor: action === 'resale' ? '#d1fae5' : action === 'donate' ? '#fce7f3' : '#fef3c7' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <h3 className="font-medium text-charcoal-deep">{config.label}</h3>
                  <span className="text-xs text-stone/50">({actionSuggestions.length} items)</span>
                </div>
                {action === 'resale' && stats.potentialValue > 0 && (
                  <span className="text-sm font-medium text-emerald-600">
                    ~${stats.potentialValue.toLocaleString()} potential
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-stone/10">
              {actionSuggestions.map(({ product, reason, estimatedValue, tip }) => (
                <div key={product.id} className="p-4 hover:bg-stone/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <Link href={`/product/${product.slug}`}>
                      <div className="w-20 h-20 bg-stone/5 rounded-lg overflow-hidden relative flex-shrink-0">
                        <Image src={product.images[0]?.url || ''} alt={product.name} fill className="object-cover" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-charcoal-deep">{product.name}</p>
                          <p className="text-xs text-stone/60">{product.brandName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-charcoal-deep">${product.price.toLocaleString()}</p>
                          {estimatedValue && (
                            <p className="text-xs text-emerald-600">Resale: ~${estimatedValue.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-stone/70 mt-2">{reason}</p>
                      {tip && (
                        <p className="text-xs text-gold-soft mt-1">💡 {tip}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Resale Platform Links */}
      {stats.toResale.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-medium text-charcoal-deep mb-3">Recommended Resale Platforms</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Vestiaire Collective', focus: 'Luxury fashion' },
              { name: 'The RealReal', focus: 'Authenticated luxury' },
              { name: 'Rebag', focus: 'Handbags & accessories' },
              { name: 'Fashionphile', focus: 'Pre-owned luxury' }
            ].map((platform) => (
              <a
                key={platform.name}
                href="#"
                className="p-3 bg-white rounded-lg text-center hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-charcoal-deep">{platform.name}</p>
                <p className="text-xs text-stone/60">{platform.focus}</p>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Donation Info */}
      {stats.toDonate.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="font-medium text-charcoal-deep mb-2">Donation Impact</h4>
          <p className="text-sm text-stone/70 mb-3">
            Your donations can support women entering the workforce, sustainability initiatives, and communities in need.
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-charcoal-deep hover:shadow-md transition-shadow"
            >
              Schedule Pickup
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-charcoal-deep hover:shadow-md transition-shadow"
            >
              Find Drop-off Locations
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
