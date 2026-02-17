'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Leaf, Snowflake, ArrowRight, Sparkles, Archive, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface SeasonalRotationProps {
  products: Product[];
  className?: string;
}

type Season = 'spring' | 'summer' | 'fall' | 'winter';

const seasonConfig = {
  spring: { icon: <Cloud className="w-5 h-5" />, label: 'Spring', color: 'emerald', emoji: '🌸' },
  summer: { icon: <Sun className="w-5 h-5" />, label: 'Summer', color: 'amber', emoji: '☀️' },
  fall: { icon: <Leaf className="w-5 h-5" />, label: 'Fall', color: 'orange', emoji: '🍂' },
  winter: { icon: <Snowflake className="w-5 h-5" />, label: 'Winter', color: 'sky', emoji: '❄️' }
};

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function getNextSeason(current: Season): Season {
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
  const currentIndex = seasons.indexOf(current);
  return seasons[(currentIndex + 1) % 4];
}

// Categorize products by season suitability
function categorizeProduct(product: Product): Season[] {
  const seasons: Season[] = [];

  // Simple heuristics based on product name/description
  const name = product.name.toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const combined = `${name} ${desc}`;

  // Summer items
  if (combined.includes('silk') || combined.includes('linen') || combined.includes('light') ||
      combined.includes('summer') || combined.includes('sandal') || combined.includes('beach')) {
    seasons.push('summer');
  }

  // Winter items
  if (combined.includes('wool') || combined.includes('cashmere') || combined.includes('coat') ||
      combined.includes('winter') || combined.includes('fur') || combined.includes('heavy')) {
    seasons.push('winter');
  }

  // Spring/Fall items
  if (combined.includes('blazer') || combined.includes('cardigan') || combined.includes('jacket') ||
      combined.includes('trench') || combined.includes('layering')) {
    seasons.push('spring', 'fall');
  }

  // Default: all seasons for versatile pieces
  if (seasons.length === 0) {
    return ['spring', 'summer', 'fall', 'winter'];
  }

  return seasons;
}

export default function SeasonalRotation({
  products,
  className = ''
}: SeasonalRotationProps) {
  const currentSeason = getCurrentSeason();
  const nextSeason = getNextSeason(currentSeason);

  const categorizedProducts = useMemo(() => {
    return products.map(p => ({
      product: p,
      seasons: categorizeProduct(p)
    }));
  }, [products]);

  // Items to bring out (for current season, currently stored)
  const bringOut = categorizedProducts.filter(p =>
    p.seasons.includes(currentSeason) && !p.seasons.includes(getNextSeason(getNextSeason(currentSeason)))
  ).slice(0, 4);

  // Items to store (for opposite season)
  const toStore = categorizedProducts.filter(p =>
    !p.seasons.includes(currentSeason) && !p.seasons.includes(nextSeason)
  ).slice(0, 4);

  // All-season items
  const allSeason = categorizedProducts.filter(p =>
    p.seasons.length >= 3
  ).slice(0, 4);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Season Header */}
      <motion.div
        className="bg-gradient-to-r from-gold-soft/20 to-amber-100/30 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{seasonConfig[currentSeason].emoji}</div>
            <div>
              <p className="text-xs tracking-wider uppercase text-stone/60 mb-1">Current Season</p>
              <h2 className="text-2xl font-display text-charcoal-deep">{seasonConfig[currentSeason].label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone/60">
            <span className="text-sm">Coming up:</span>
            <span className="text-xl">{seasonConfig[nextSeason].emoji}</span>
            <span className="text-sm font-medium text-charcoal-deep">{seasonConfig[nextSeason].label}</span>
          </div>
        </div>
      </motion.div>

      {/* Rotation Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bring Out */}
        <motion.div
          className="bg-white rounded-xl border border-stone/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="px-5 py-4 border-b border-stone/10 bg-emerald-50">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
              <h3 className="font-medium text-charcoal-deep">Time to Bring Out</h3>
            </div>
            <p className="text-xs text-stone/60 mt-1">Perfect for {seasonConfig[currentSeason].label}</p>
          </div>
          <div className="p-4">
            {bringOut.length > 0 ? (
              <div className="space-y-3">
                {bringOut.map(({ product }) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 p-2 hover:bg-stone/5 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-stone/5 rounded-lg overflow-hidden relative">
                      <Image src={product.images[0]?.url || ''} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
                      <p className="text-xs text-emerald-600">Ready to wear</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone/50 text-center py-4">Your wardrobe is ready!</p>
            )}
          </div>
        </motion.div>

        {/* Store Away */}
        <motion.div
          className="bg-white rounded-xl border border-stone/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="px-5 py-4 border-b border-stone/10 bg-amber-50">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              <h3 className="font-medium text-charcoal-deep">Consider Storing</h3>
            </div>
            <p className="text-xs text-stone/60 mt-1">Off-season pieces</p>
          </div>
          <div className="p-4">
            {toStore.length > 0 ? (
              <div className="space-y-3">
                {toStore.map(({ product }) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 p-2 hover:bg-stone/5 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-stone/5 rounded-lg overflow-hidden relative">
                      <Image src={product.images[0]?.url || ''} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
                      <p className="text-xs text-amber-600">Store until needed</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone/50 text-center py-4">Nothing to store right now</p>
            )}
          </div>
        </motion.div>

        {/* All Season Favorites */}
        <motion.div
          className="bg-white rounded-xl border border-stone/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="px-5 py-4 border-b border-stone/10 bg-gold-soft/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-soft" />
              <h3 className="font-medium text-charcoal-deep">Year-Round Stars</h3>
            </div>
            <p className="text-xs text-stone/60 mt-1">Always in rotation</p>
          </div>
          <div className="p-4">
            {allSeason.length > 0 ? (
              <div className="space-y-3">
                {allSeason.map(({ product }) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 p-2 hover:bg-stone/5 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-stone/5 rounded-lg overflow-hidden relative">
                      <Image src={product.images[0]?.url || ''} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
                      <p className="text-xs text-gold-soft">Versatile piece</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone/50 text-center py-4">No versatile pieces yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        className="bg-stone/5 rounded-xl p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-sm font-medium text-charcoal-deep mb-3">Seasonal Care Tips</h4>
        <ul className="text-sm text-stone/70 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-gold-soft">•</span>
            Clean items before storing to prevent stains from setting
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-soft">•</span>
            Use breathable garment bags for delicate pieces
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-soft">•</span>
            Store leather in a cool, dry place with stuffing to maintain shape
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
