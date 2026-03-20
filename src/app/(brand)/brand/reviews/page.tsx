'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';
import { getReviewsByBrand } from '@/services/reviews.service';
import type { ProductReview } from '@/services/reviews.service';

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating
              ? 'fill-gold-muted text-gold-muted'
              : 'text-sand fill-transparent'
          }`}
        />
      ))}
    </div>
  );
}

type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

export default function BrandReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');

  useEffect(() => {
    try {
      const data = getReviewsByBrand();
      setReviews(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed metrics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      const r = review.rating as 1 | 2 | 3 | 4 | 5;
      if (dist[r] !== undefined) dist[r]++;
    }
    return dist;
  }, [reviews]);

  const fiveStarCount = ratingDistribution[5];

  const filteredReviews = useMemo(() => {
    if (ratingFilter === 'all') return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <BrandPageHeader
        title="Customer Reviews"
        subtitle={
          totalReviews > 0
            ? `${totalReviews} review${totalReviews !== 1 ? 's' : ''} received`
            : 'No reviews yet'
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/brand' },
          { label: 'Reviews' },
        ]}
      />

      <div className="p-8 space-y-8">
        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-sand/50 p-6 animate-pulse">
                <div className="h-4 bg-sand/30 rounded w-24 mb-3" />
                <div className="h-8 bg-sand/20 rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                label="Total Reviews"
                value={totalReviews}
              />
              <MetricCard
                label="Average Rating"
                value={averageRating > 0 ? averageRating.toFixed(1) : '--'}
                suffix={averageRating > 0 ? '/5' : ''}
              />
              <MetricCard
                label="5-Star Reviews"
                value={fiveStarCount}
                suffix={totalReviews > 0 ? ` (${Math.round((fiveStarCount / totalReviews) * 100)}%)` : ''}
              />
            </div>

            {/* Rating Distribution */}
            {totalReviews > 0 && (
              <div className="bg-white border border-sand/50 p-6">
                <h3 className="text-xs tracking-[0.2em] uppercase text-taupe mb-5">
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = ratingDistribution[star];
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-charcoal-deep w-12 text-right">
                          {star} star{star !== 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-4 bg-parchment rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-gold-muted transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-stone w-16 text-right">
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rating Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs tracking-[0.15em] uppercase text-taupe mr-2">
                Filter:
              </span>
              {(['all', 5, 4, 3, 2, 1] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setRatingFilter(val)}
                  className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors border ${
                    ratingFilter === val
                      ? 'bg-charcoal-deep text-ivory-cream border-charcoal-deep'
                      : 'bg-white text-stone border-sand/50 hover:text-charcoal-deep hover:border-charcoal-deep'
                  }`}
                >
                  {val === 'all' ? 'All' : `${val}-Star`}
                </button>
              ))}
            </div>

            {/* Review Cards */}
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-sand/50 p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-parchment rounded-full flex items-center justify-center text-sm text-stone font-medium">
                          {(review.customer_name || 'V')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">
                            {review.customer_name || 'Verified Customer'}
                          </p>
                          <p className="text-xs text-stone">
                            {review.product_name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-stone whitespace-nowrap">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    <StarRating rating={review.rating} />

                    <h4 className="text-sm font-medium text-charcoal-deep mt-3">
                      {review.title}
                    </h4>
                    <p className="text-sm text-stone mt-1 leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-sand/50">
                <div className="w-14 h-14 mx-auto mb-5 bg-parchment flex items-center justify-center">
                  <MessageSquare size={24} className="text-stone" />
                </div>
                <h3 className="font-display text-lg text-charcoal-deep mb-2">
                  {ratingFilter === 'all'
                    ? 'No reviews yet'
                    : `No ${ratingFilter}-star reviews`}
                </h3>
                <p className="text-stone text-sm max-w-sm mx-auto">
                  {ratingFilter === 'all'
                    ? 'Customer reviews will appear here once your products are reviewed.'
                    : 'Try selecting a different rating filter.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
