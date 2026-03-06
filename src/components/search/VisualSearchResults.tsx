'use client';

import { motion } from 'framer-motion';
import { Eye, Heart, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VisualSearchResult } from '@/types';

interface VisualSearchResultsProps {
  results: VisualSearchResult[];
  isLoading?: boolean;
  className?: string;
}

function SimilarityBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-gold-soft';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-stone/50';
  };

  return (
    <div className={`px-2 py-1 rounded-full ${getColor()} text-white text-xs font-medium flex items-center gap-1`}>
      <TrendingUp className="w-3 h-3" />
      {score}% match
    </div>
  );
}

export default function VisualSearchResults({
  results,
  isLoading = false,
  className = ''
}: VisualSearchResultsProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-stone/10 rounded-xl aspect-[3/4]"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="w-16 h-16 bg-stone/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-stone/40" />
        </div>
        <h3 className="text-lg font-display text-charcoal-deep mb-2">No matches found</h3>
        <p className="text-sm text-stone/60 max-w-md mx-auto">
          Try uploading a different image or adjust your search. Our AI works best with clear product photos.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-soft" />
          <span className="text-sm text-stone/70">
            Found {results.length} similar piece{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((result, index) => (
          <motion.div
            key={result.product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/product/${result.product.slug}?productId=${result.product.id}`}>
              <div className="group bg-white rounded-xl border border-stone/20 overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[3/4] bg-stone/5 overflow-hidden">
                  <Image
                    src={result.product.images[0]?.url || ''}
                    alt={result.product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Similarity badge */}
                  <div className="absolute top-3 left-3">
                    <SimilarityBadge score={result.similarityScore} />
                  </div>

                  {/* Match reasons tooltip on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white">
                      <p className="text-xs mb-2">Match factors:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.matchedAttributes.slice(0, 3).map((attr: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white/20 rounded text-[10px] capitalize"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick action */}
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white">
                    <Heart className="w-4 h-4 text-charcoal-deep" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-stone/60 mb-1">{result.product.brandName}</p>
                  <h3 className="font-medium text-charcoal-deep text-sm line-clamp-1 group-hover:text-gold-soft transition-colors">
                    {result.product.name}
                  </h3>
                  <p className="text-sm text-charcoal-deep mt-2">
                    ${result.product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
