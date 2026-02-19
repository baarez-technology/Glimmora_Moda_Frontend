'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Star, MessageCircle, ThumbsUp, ThumbsDown, Camera, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as productService from '@/services/product.service';
import { OutfitFeedback, Product } from '@/types';

interface OutfitHistoryEntry {
  id: string;
  date: string;
  occasion: string;
  productIds: string[];
  feedback?: OutfitFeedback;
}

function buildSampleHistory(products: Product[]): OutfitHistoryEntry[] {
  // Generate dates relative to current date
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return [
    {
      id: 'outfit-1',
      date: daysAgo(3),
      occasion: 'Business Meeting',
      productIds: [products[0]?.id, products[2]?.id].filter(Boolean),
      feedback: {
        id: 'fb-1',
        outfitId: 'outfit-1',
        outfitItems: [products[0]?.id, products[2]?.id].filter(Boolean),
        wornDate: daysAgo(3),
        rating: 5 as const,
        feedback: {
          comfort: 5,
          appropriateness: 5,
          confidence: 5,
          compliments: 3,
          wouldWearAgain: true
        },
        occasion: 'business-meeting',
        notes: 'Received so many compliments! Perfect for the client presentation.',
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 'outfit-2',
      date: daysAgo(5),
      occasion: 'Dinner Date',
      productIds: [products[1]?.id, products[3]?.id].filter(Boolean),
      feedback: {
        id: 'fb-2',
        outfitId: 'outfit-2',
        outfitItems: [products[1]?.id, products[3]?.id].filter(Boolean),
        wornDate: daysAgo(5),
        rating: 4 as const,
        feedback: {
          comfort: 4,
          appropriateness: 5,
          confidence: 5,
          compliments: 2,
          wouldWearAgain: true
        },
        occasion: 'romantic-dinner',
        notes: 'Felt very elegant. The shoes were a bit tight after a few hours.',
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 'outfit-3',
      date: daysAgo(8),
      occasion: 'Weekend Brunch',
      productIds: [products[0]?.id].filter(Boolean)
    }
  ];
}

export default function WardrobeHistoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<OutfitHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<OutfitHistoryEntry | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comfort: 0,
    style: 0,
    notes: '',
    wouldWearAgain: true
  });
  const feedbackModalRef = useRef<HTMLDivElement>(null);

  // ESC key handler for feedback modal
  useEffect(() => {
    if (!showFeedbackModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFeedbackModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showFeedbackModal]);

  // Auto-focus modal when opened
  useEffect(() => {
    if (showFeedbackModal) feedbackModalRef.current?.focus();
  }, [showFeedbackModal]);

  useEffect(() => {
    async function loadData() {
      try {
        const productsRes = await productService.getAllProducts();
        const loadedProducts = productsRes.data ?? [];
        setProducts(loadedProducts);

        // Load from localStorage or use sample data
        const saved = typeof window !== 'undefined' ? localStorage.getItem('modaglimmora_outfit_history') : null;
        if (saved) {
          setHistory(JSON.parse(saved));
        } else {
          setHistory(buildSampleHistory(loadedProducts));
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getProductsForEntry = (entry: OutfitHistoryEntry): Product[] => {
    return entry.productIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);
  };

  const submitFeedback = () => {
    if (!selectedEntry) return;

    const feedback: OutfitFeedback = {
      id: `fb-${Date.now()}`,
      outfitId: selectedEntry.id,
      outfitItems: selectedEntry.productIds,
      wornDate: selectedEntry.date,
      rating: feedbackData.rating as 1 | 2 | 3 | 4 | 5,
      feedback: {
        comfort: feedbackData.comfort,
        appropriateness: feedbackData.style,
        confidence: feedbackData.style,
        compliments: 0,
        wouldWearAgain: feedbackData.wouldWearAgain
      },
      occasion: selectedEntry.occasion.toLowerCase().replace(' ', '-'),
      notes: feedbackData.notes,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = history.map(entry =>
      entry.id === selectedEntry.id ? { ...entry, feedback } : entry
    );

    setHistory(updatedHistory);
    localStorage.setItem('modaglimmora_outfit_history', JSON.stringify(updatedHistory));
    setShowFeedbackModal(false);
    setSelectedEntry(null);
    setFeedbackData({ rating: 0, comfort: 0, style: 0, notes: '', wouldWearAgain: true });
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <p className="text-xs text-stone/60 mb-2">{label}</p>
      <div className="flex gap-1" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' && star < 5) onChange(star + 1);
              if (e.key === 'ArrowLeft' && star > 1) onChange(star - 1);
            }}
            className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft rounded"
            aria-label={`Rate ${star} out of 5 stars`}
            aria-pressed={star <= value}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= value ? 'fill-gold-soft text-gold-soft' : 'text-stone/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/wardrobe"
              className="flex items-center gap-2 text-stone/70 hover:text-charcoal-deep transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Wardrobe</span>
            </Link>
            <h1 className="font-display text-lg text-charcoal-deep">Outfit History</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Summary */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-xl p-5 border border-stone/20 text-center">
            <p className="text-3xl font-display text-charcoal-deep">{history.length}</p>
            <p className="text-xs text-stone/60 mt-1">Outfits Worn</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-stone/20 text-center">
            <p className="text-3xl font-display text-charcoal-deep">
              {history.filter(h => h.feedback).length}
            </p>
            <p className="text-xs text-stone/60 mt-1">Reviewed</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-stone/20 text-center">
            <p className="text-3xl font-display text-gold-soft">
              {history.filter(h => h.feedback?.feedback?.wouldWearAgain).length}
            </p>
            <p className="text-xs text-stone/60 mt-1">Would Repeat</p>
          </div>
        </motion.div>

        {/* History Timeline */}
        <div className="space-y-4">
          {history.map((entry, index) => {
            const entryProducts = getProductsForEntry(entry);
            return (
              <motion.div
                key={entry.id}
                className="bg-white rounded-xl border border-stone/20 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-stone/60 mb-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <h3 className="font-medium text-charcoal-deep">{entry.occasion}</h3>
                    </div>
                    {entry.feedback ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        {entry.feedback.rating}/5
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowFeedbackModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-gold-soft/10 text-gold-soft rounded-full text-xs hover:bg-gold-soft/20 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Add Review
                      </button>
                    )}
                  </div>

                  {/* Products */}
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {entryProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-20 h-20 bg-stone/5 rounded-lg overflow-hidden relative">
                          <Image
                            src={product.images[0]?.url || ''}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="text-xs text-stone/60 mt-1 truncate w-20">{product.name}</p>
                      </Link>
                    ))}
                  </div>

                  {/* Feedback Summary */}
                  {entry.feedback && (
                    <div className="mt-4 pt-4 border-t border-stone/10">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-xs text-stone/60">
                          <span>Comfort:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < entry.feedback!.feedback.comfort ? 'fill-gold-soft text-gold-soft' : 'text-stone/20'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-stone/60">
                          <span>Confidence:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < entry.feedback!.feedback.confidence ? 'fill-gold-soft text-gold-soft' : 'text-stone/20'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {entry.feedback.feedback.wouldWearAgain ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <ThumbsUp className="w-3 h-3" /> Would wear again
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600">
                              <ThumbsDown className="w-3 h-3" /> Maybe not
                            </span>
                          )}
                        </div>
                      </div>
                      {entry.feedback.notes && (
                        <p className="text-sm text-stone/70 italic">"{entry.feedback.notes}"</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-stone/20 mx-auto mb-4" />
            <h3 className="text-xl font-display text-charcoal-deep mb-2">No outfit history yet</h3>
            <p className="text-stone/60">Start tracking your outfits to build your style history</p>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
          <div
            className="absolute inset-0 bg-charcoal-deep/50 backdrop-blur-sm"
            onClick={() => setShowFeedbackModal(false)}
          />
          <motion.div
            ref={feedbackModalRef}
            tabIndex={-1}
            className="relative bg-white rounded-2xl w-full max-w-md p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 id="feedback-modal-title" className="text-xl font-display text-charcoal-deep mb-2">How was this outfit?</h2>
            <p className="text-sm text-stone/60 mb-6">{selectedEntry.occasion} - {new Date(selectedEntry.date).toLocaleDateString()}</p>

            <div className="space-y-6">
              <StarRating
                label="Overall Rating"
                value={feedbackData.rating}
                onChange={(v) => setFeedbackData({ ...feedbackData, rating: v })}
              />
              <StarRating
                label="Comfort"
                value={feedbackData.comfort}
                onChange={(v) => setFeedbackData({ ...feedbackData, comfort: v })}
              />
              <StarRating
                label="Style Match"
                value={feedbackData.style}
                onChange={(v) => setFeedbackData({ ...feedbackData, style: v })}
              />

              <div>
                <p className="text-xs text-stone/60 mb-2">Would you wear this again?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, wouldWearAgain: true })}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      feedbackData.wouldWearAgain
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone/10 text-stone/70'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, wouldWearAgain: false })}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      !feedbackData.wouldWearAgain
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone/10 text-stone/70'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-stone/60 mb-2">Notes (optional)</p>
                <textarea
                  value={feedbackData.notes}
                  onChange={(e) => setFeedbackData({ ...feedbackData, notes: e.target.value })}
                  placeholder="Any thoughts on this outfit..."
                  className="w-full p-3 border border-stone/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gold-soft/50"
                  rows={3}
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={!feedbackData.rating}
                className="w-full py-3 bg-charcoal-deep text-ivory-cream rounded-lg hover:bg-charcoal-deep/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Review
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
