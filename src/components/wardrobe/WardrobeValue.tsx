'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Repeat, Award, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface WardrobeValueProps {
  products: Product[];
  outfitHistory?: { productIds: string[]; wornAt: string }[];
  className?: string;
}

export default function WardrobeValue({
  products,
  outfitHistory = [],
  className = ''
}: WardrobeValueProps) {
  const stats = useMemo(() => {
    // Total value
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);

    // Calculate wears per item
    const wearCounts: Record<string, number> = {};
    outfitHistory.forEach(entry => {
      entry.productIds.forEach(id => {
        wearCounts[id] = (wearCounts[id] || 0) + 1;
      });
    });

    // Cost per wear (only for items that have been worn)
    const costPerWearItems = products
      .filter(p => wearCounts[p.id])
      .map(p => ({
        product: p,
        wears: wearCounts[p.id],
        costPerWear: p.price / wearCounts[p.id]
      }));

    const avgCostPerWear = costPerWearItems.length > 0
      ? costPerWearItems.reduce((sum, item) => sum + item.costPerWear, 0) / costPerWearItems.length
      : 0;

    // Most worn items
    const mostWorn = [...costPerWearItems]
      .sort((a, b) => b.wears - a.wears)
      .slice(0, 3);

    // Best value (lowest cost per wear)
    const bestValue = [...costPerWearItems]
      .filter(item => item.wears >= 3) // At least 3 wears
      .sort((a, b) => a.costPerWear - b.costPerWear)
      .slice(0, 3);

    // Underutilized (high price, low wears)
    const underutilized = products
      .filter(p => !wearCounts[p.id] || wearCounts[p.id] < 2)
      .filter(p => p.price > 500)
      .slice(0, 3);

    // Category breakdown
    const categoryValues: Record<string, { count: number; value: number }> = {};
    products.forEach(p => {
      if (!categoryValues[p.category]) {
        categoryValues[p.category] = { count: 0, value: 0 };
      }
      categoryValues[p.category].count++;
      categoryValues[p.category].value += p.price;
    });

    return {
      totalValue,
      itemCount: products.length,
      avgItemValue: products.length > 0 ? totalValue / products.length : 0,
      avgCostPerWear,
      mostWorn,
      bestValue,
      underutilized,
      categoryValues,
      totalWears: Object.values(wearCounts).reduce((sum, w) => sum + w, 0)
    };
  }, [products, outfitHistory]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-white rounded-xl p-5 border border-stone/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-stone/50 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Total Value</span>
          </div>
          <p className="text-2xl font-display text-charcoal-deep">
            ${stats.totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-stone/50 mt-1">{stats.itemCount} items</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-5 border border-stone/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 text-stone/50 mb-2">
            <Repeat className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Avg Cost/Wear</span>
          </div>
          <p className="text-2xl font-display text-charcoal-deep">
            ${Math.round(stats.avgCostPerWear).toLocaleString()}
          </p>
          <p className="text-xs text-stone/50 mt-1">{stats.totalWears} total wears</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-5 border border-stone/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-stone/50 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Avg Item Value</span>
          </div>
          <p className="text-2xl font-display text-charcoal-deep">
            ${Math.round(stats.avgItemValue).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-gold-soft to-amber-500 rounded-xl p-5 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Value Score</span>
          </div>
          <p className="text-2xl font-display">
            {stats.avgCostPerWear < 100 ? 'Excellent' :
             stats.avgCostPerWear < 200 ? 'Great' :
             stats.avgCostPerWear < 500 ? 'Good' : 'Building'}
          </p>
        </motion.div>
      </div>

      {/* Best Value Items */}
      {stats.bestValue.length > 0 && (
        <motion.div
          className="bg-white rounded-xl border border-stone/20 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold-soft" />
            <h3 className="font-medium text-charcoal-deep">Best Value Items</h3>
            <span className="text-xs text-stone/50">(Lowest cost per wear)</span>
          </div>
          <div className="space-y-3">
            {stats.bestValue.map((item, i) => (
              <div key={item.product.id} className="flex items-center gap-4 p-3 bg-stone/5 rounded-lg">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden relative">
                  {item.product.images[0]?.url && (
                    <Image src={item.product.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-deep truncate">{item.product.name}</p>
                  <p className="text-xs text-stone/60">{item.wears} wears</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">
                    ${Math.round(item.costPerWear)}/wear
                  </p>
                  <p className="text-xs text-stone/50">${item.product.price.toLocaleString()} total</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Underutilized Items */}
      {stats.underutilized.length > 0 && (
        <motion.div
          className="bg-amber-50 rounded-xl border border-amber-200 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-charcoal-deep">Underutilized Pieces</h3>
            <span className="text-xs text-amber-600">(Wear more often!)</span>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {stats.underutilized.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-32">
                <div className="aspect-square bg-white rounded-lg overflow-hidden mb-2 relative">
                  {product.images[0]?.url && (
                    <Image src={product.images[0].url} alt="" fill sizes="128px" className="object-cover" />
                  )}
                </div>
                <p className="text-xs text-charcoal-deep truncate">{product.name}</p>
                <p className="text-xs text-amber-600">${product.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <motion.div
        className="bg-white rounded-xl border border-stone/20 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-medium text-charcoal-deep mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(stats.categoryValues)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([category, data]) => {
              const percentage = (data.value / stats.totalValue) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-charcoal-deep capitalize">{category}</span>
                    <span className="text-sm text-stone/60">
                      ${data.value.toLocaleString()} ({data.count})
                    </span>
                  </div>
                  <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-soft rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
