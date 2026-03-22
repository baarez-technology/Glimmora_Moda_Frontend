'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Star,
  Package,
  PenLine,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import {
  getReviewsByCustomer,
  getReviewableOrders,
  submitReview,
} from '@/services/reviews.service';
import type { ProductReview, ReviewableOrder } from '@/services/reviews.service';

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
  const { showToast } = useApp();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewable, setReviewable] = useState<ReviewableOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [formTarget, setFormTarget] = useState<ReviewableOrder | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(() => {
    try {
      setReviews(getReviewsByCustomer());
      setReviewable(getReviewableOrders());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      loadData();
    }
  }, [isHydrated, isAuthenticated, loadData]);

  const openReviewForm = (order: ReviewableOrder) => {
    setFormTarget(order);
    setFormRating(0);
    setFormTitle('');
    setFormContent('');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formTarget) return;
    if (formRating === 0) {
      showToast('Please select a star rating', 'error');
      return;
    }
    if (!formTitle.trim()) {
      showToast('Please enter a review title', 'error');
      return;
    }
    if (!formContent.trim()) {
      showToast('Please write your review', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      submitReview({
        order_id: formTarget.order_id,
        product_id: formTarget.product_id,
        product_name: formTarget.product_name,
        product_image: formTarget.product_image,
        brand_name: formTarget.brand_name,
        rating: formRating,
        title: formTitle.trim(),
        content: formContent.trim(),
      });
      showToast('Review submitted successfully!', 'success');
      setShowForm(false);
      setFormTarget(null);
      loadData(); // Refresh data
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to submit review',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <>
            {/* Pending Reviews Section */}
            {reviewable.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs tracking-[0.2em] uppercase text-taupe mb-4">
                  Pending Reviews ({reviewable.length})
                </h2>
                <div className="space-y-3">
                  {reviewable.map((item) => (
                    <div
                      key={`${item.order_id}-${item.product_id}`}
                      className="bg-white border border-sand/50 p-5 flex items-center gap-4"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-20 flex-shrink-0 bg-parchment overflow-hidden">
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-stone/40" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base text-charcoal-deep truncate">
                          {item.product_name}
                        </h3>
                        {item.brand_name && (
                          <p className="text-xs text-stone mt-0.5">{item.brand_name}</p>
                        )}
                        <p className="text-[10px] text-taupe mt-1">
                          Order #{item.order_id}
                        </p>
                      </div>

                      {/* Write Review Button */}
                      <button
                        onClick={() => openReviewForm(item)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors flex-shrink-0"
                      >
                        <PenLine size={14} />
                        Write Review
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Reviews Section */}
            <section>
              <h2 className="text-xs tracking-[0.2em] uppercase text-taupe mb-4">
                Submitted Reviews ({reviews.length})
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white border border-sand/50 p-6"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-20 flex-shrink-0 bg-parchment overflow-hidden">
                          {review.product_image ? (
                            <Image
                              src={review.product_image}
                              alt={review.product_name}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-stone/40" />
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-display text-base text-charcoal-deep">
                                {review.product_name}
                              </h3>
                              {review.brand_name && (
                                <p className="text-xs text-stone">{review.brand_name}</p>
                              )}
                            </div>
                            <span className="text-xs text-stone whitespace-nowrap">
                              {formatDate(review.created_at)}
                            </span>
                          </div>

                          <StarRating rating={review.rating} size={14} />

                          <h4 className="text-sm font-medium text-charcoal-deep mt-3">
                            {review.title}
                          </h4>
                          <p className="text-sm text-stone mt-1 leading-relaxed">
                            {review.content}
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
                  <h3 className="font-display text-lg text-charcoal-deep mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-stone text-sm max-w-sm mx-auto">
                    Once you receive your orders, you can share your experience by writing reviews here.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Review Form Modal */}
      {showForm && formTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand/30">
              <h2 className="font-display text-xl text-charcoal-deep">Write a Review</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-stone hover:text-charcoal-deep transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-sand/20">
                <div className="w-14 h-18 flex-shrink-0 bg-parchment overflow-hidden">
                  {formTarget.product_image ? (
                    <Image
                      src={formTarget.product_image}
                      alt={formTarget.product_name}
                      width={56}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-18 flex items-center justify-center bg-parchment">
                      <Package size={18} className="text-stone/40" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-base text-charcoal-deep">
                    {formTarget.product_name}
                  </h3>
                  {formTarget.brand_name && (
                    <p className="text-xs text-stone">{formTarget.brand_name}</p>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-3">
                  Your Rating
                </label>
                <StarRating
                  rating={formRating}
                  size={28}
                  interactive
                  onRate={setFormRating}
                />
                {formRating > 0 && (
                  <p className="text-xs text-stone mt-1">
                    {formRating === 5
                      ? 'Exceptional'
                      : formRating === 4
                        ? 'Very Good'
                        : formRating === 3
                          ? 'Good'
                          : formRating === 2
                            ? 'Fair'
                            : 'Poor'}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-4 py-3 border border-sand/50 text-sm text-charcoal-deep placeholder:text-stone focus:outline-none focus:border-charcoal-deep transition-colors bg-ivory-cream"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-taupe mb-2">
                  Your Review
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share your thoughts on quality, fit, craftsmanship..."
                  rows={4}
                  className="w-full px-4 py-3 border border-sand/50 text-sm text-charcoal-deep placeholder:text-stone focus:outline-none focus:border-charcoal-deep transition-colors bg-ivory-cream resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-sand/30">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:bg-parchment transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || formRating === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
