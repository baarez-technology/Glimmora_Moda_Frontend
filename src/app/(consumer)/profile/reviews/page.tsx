'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Package, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyReviews, type ApiReview } from '@/services/review.service';

function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || rating)
                ? 'fill-gold-muted text-gold-muted'
                : 'text-sand fill-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ConsumerReviewsPage() {
  const { isAuthenticated, isHydrated } = useAuth();

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) loadData();
  }, [isHydrated, isAuthenticated, loadData]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand/30">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div
            className={`transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Your Feedback
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em]">
              My Reviews
            </h1>
          </div>
        </div>
      </div>

      <div
        className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-10 transition-all duration-700 delay-200 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 animate-pulse">
                <div className="h-4 bg-sand/30 rounded w-32 mb-3" />
                <div className="h-3 bg-sand/20 rounded w-48" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <section>
            <h2 className="text-xs tracking-[0.2em] uppercase text-taupe mb-4">
              Submitted Reviews ({reviews.length})
            </h2>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.review_id} className="bg-white border border-sand/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-20 flex-shrink-0 bg-parchment overflow-hidden flex items-center justify-center">
                        <Package size={20} className="text-stone/40" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className="text-[10px] text-taupe font-mono">
                              Product #{review.product_id.slice(-6).toUpperCase()}
                            </p>
                            <Link
                              href={`/profile/orders/${review.order_id}`}
                              className="text-xs text-stone hover:text-charcoal-deep underline underline-offset-2 transition-colors"
                            >
                              Order #{review.order_id.slice(-6).toUpperCase()}
                            </Link>
                          </div>
                          <span className="text-xs text-stone whitespace-nowrap">
                            {formatDate(review.created_at)}
                          </span>
                        </div>

                        <StarRating rating={review.rating} size={14} />

                        <h4 className="text-sm font-medium text-charcoal-deep mt-3">
                          {review.review_title}
                        </h4>
                        <p className="text-sm text-stone mt-1 leading-relaxed">
                          {review.review_description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-sand/50">
                <div className="w-14 h-14 mx-auto mb-5 bg-parchment flex items-center justify-center">
                  <MessageSquare size={24} className="text-stone" />
                </div>
                <h3 className="font-display text-lg text-charcoal-deep mb-2">No reviews yet</h3>
                <p className="text-stone text-sm max-w-sm mx-auto">
                  Once you receive your orders, you can rate and review products from the orders page.
                </p>
                <Link
                  href="/profile/orders"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                >
                  View Orders
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
