'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Info, Check } from 'lucide-react';
import * as wardrobeService from '@/services/wardrobe.service';
import type { GapAnalysisItem, WardrobeGapAnalysisResponse } from '@/services/wardrobe.service';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

type PageState = 'EMPTY' | 'LOADING' | 'RESULTS' | 'ERROR';

function formatExpiryDate(dateStr?: string): string {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SilentCartPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { addToConsiderations } = useApp();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login/consumer?redirect=/profile/silent-cart');
  }, [isAuthenticated, isHydrated, router]);

  const [pageState, setPageState] = useState<PageState>('LOADING');
  const [gapAnalysis, setGapAnalysis] = useState<WardrobeGapAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Load silent cart on mount
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    // Try to load cached silent cart first, fallback to gap analysis
    wardrobeService.getSilentCart()
      .then((data) => {
        setGapAnalysis(data);
        setPageState('RESULTS');
      })
      .catch(() => {
        // No cached result, run analysis
        wardrobeService.getWardrobeGapAnalysis(false)
          .then((data) => {
            setGapAnalysis(data);
            setPageState('RESULTS');
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Failed to load silent cart');
            setPageState('ERROR');
          });
      });
  }, [isHydrated, isAuthenticated]);

  const gaps = gapAnalysis?.gap_analysis?.filter(g => g.matched_product) || [];

  const toggleItem = useCallback((idx: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === gaps.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(gaps.map((_, i) => i)));
    }
  }, [selectedItems.size, gaps]);

  const selectedTotal = Array.from(selectedItems).reduce((sum, idx) => {
    const p = gaps[idx]?.matched_product;
    return sum + (p ? (p.offer_price || p.price) : 0);
  }, 0);

  const fullCartValue = gaps.reduce((sum, g) => {
    const p = g.matched_product;
    return sum + (p ? (p.offer_price || p.price) : 0);
  }, 0);

  const handleMoveToConsiderations = useCallback(() => {
    const items = Array.from(selectedItems).map(idx => gaps[idx]).filter(Boolean);
    items.forEach((gap) => {
      const p = gap.matched_product;
      if (!p) return;
      const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      addToConsiderations({
        id: p.product_id,
        brandId: p.brand_id,
        brandName: p.brand_name,
        name: p.product_name,
        slug,
        tagline: p.tagline || '',
        description: p.product_description || '',
        narrative: '',
        price: p.offer_price || p.price,
        currency: 'EUR',
        images: (p.image_urls?.length ? p.image_urls : p.product_image ? [p.product_image] : []).map((url, i) => ({
          id: String(i + 1),
          url,
          alt: p.product_name,
          type: i === 0 ? 'hero' as const : 'detail' as const,
        })),
        variants: [],
        materials: [],
        craftsmanship: [],
        ivEnabled: false,
        availability: { status: p.is_low_stock ? 'limited' as const : 'available' as const, regions: [] },
        collection: p.collection_name,
        category: (p.product_category as 'bags' | 'clothing' | 'shoes' | 'accessories' | 'jewelry') || 'clothing',
        tags: [...(p.occasions || []), ...(p.aesthetics || [])],
        visibility: 'public',
        experienceMode: 'standard',
        pricingVisibility: 'visible',
        commerceAction: 'add_to_considerations',
        commerceEligible: true,
        craftTags: [],
      });
    });
    setSelectedItems(new Set());
  }, [selectedItems, gaps, addToConsiderations]);

  // Reason text generator based on suggestion data
  const getReasonText = (gap: GapAnalysisItem): string => {
    const s = gap.suggestion;
    if (s.title) return s.title;
    return `Complements items in your wardrobe and fills a style gap`;
  };

  const getEventText = (gap: GapAnalysisItem): string | null => {
    const p = gap.matched_product;
    if (p?.occasions && p.occasions.length > 0) {
      return p.occasions[0];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-[720px] mx-auto px-6 md:px-8 py-10">

        {/* How Silent Cart Works */}
        <div className="mb-10 flex gap-4">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D4C5A9] flex items-center justify-center">
            <span className="text-xs font-semibold text-[#3D3529]">1</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-1">How Silent Cart Works</h2>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              Based on your browsing patterns, style preferences, and upcoming calendar events, I&apos;ve quietly prepared these
              items for your consideration. Each piece has been selected to complement your existing wardrobe and align with
              your aesthetic.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {pageState === 'LOADING' && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-[#3D3529] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B6560]">Preparing your silent cart...</p>
          </div>
        )}

        {/* Error State */}
        {pageState === 'ERROR' && (
          <div className="text-center py-16 bg-white border border-[#E8E3DB]">
            <p className="text-[#6B6560] mb-4">{error || 'Could not load silent cart.'}</p>
            <button
              onClick={() => {
                setPageState('LOADING');
                wardrobeService.getWardrobeGapAnalysis(true)
                  .then((data) => { setGapAnalysis(data); setPageState('RESULTS'); })
                  .catch((err) => { setError(err instanceof Error ? err.message : 'Failed'); setPageState('ERROR'); });
              }}
              className="text-sm tracking-wide uppercase text-[#3D3529] hover:text-[#1A1A1A] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {pageState === 'RESULTS' && gaps.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#E8E3DB]">
            <p className="text-lg font-medium text-[#1A1A1A] mb-2">No items prepared yet</p>
            <p className="text-sm text-[#6B6560] mb-6 max-w-md mx-auto">
              Add items to your wardrobe and browse products so the Silent Cart can learn your preferences.
            </p>
            <Link
              href="/discover"
              className="inline-block px-6 py-3 bg-[#3D3529] text-white text-sm tracking-wide uppercase hover:bg-[#1A1A1A] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Results */}
        {pageState === 'RESULTS' && gaps.length > 0 && (
          <>
            {/* Items count + Select All */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E3DB]">
              <p className="text-sm text-[#1A1A1A]">
                <span className="font-semibold">{gaps.length} items</span> prepared
              </p>
              <button
                onClick={toggleSelectAll}
                className="text-sm font-medium tracking-wide uppercase text-[#3D3529] hover:text-[#1A1A1A] transition-colors"
              >
                {selectedItems.size === gaps.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Item Cards */}
            <div className="space-y-6">
              {gaps.map((gap, idx) => {
                const p = gap.matched_product!;
                const imgSrc = p.image_urls?.[0] || p.product_image;
                const isSelected = selectedItems.has(idx);
                const matchScore = Math.round(gap.product_match_score * 100);
                const eventText = getEventText(gap);
                const slug = p.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const productUrl = `/product/${slug}?productId=${p.product_id}`;

                return (
                  <div key={idx} className="bg-white border border-[#E8E3DB] overflow-hidden">
                    {/* Product Row */}
                    <div className="flex gap-4 p-5">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItem(idx)}
                        className={`flex-shrink-0 w-5 h-5 mt-1 border transition-colors ${
                          isSelected
                            ? 'bg-[#3D3529] border-[#3D3529]'
                            : 'border-[#C5BDB1] hover:border-[#8B8680]'
                        } flex items-center justify-center`}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </button>

                      {/* Image */}
                      <Link href={productUrl} className="flex-shrink-0">
                        <div className="relative w-[90px] h-[110px] bg-[#F5F0EB] overflow-hidden">
                          {imgSrc && (
                            <Image
                              src={imgSrc}
                              alt={p.product_name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8B8680] mb-0.5">
                          {p.brand_name}
                        </p>
                        <Link href={productUrl} className="hover:underline">
                          <p className="text-sm font-medium text-[#1A1A1A] leading-tight mb-1">
                            {p.product_name}
                          </p>
                        </Link>
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          &euro;{(p.offer_price || p.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Reason Tag */}
                    <div className="px-5 pb-4">
                      <div className="bg-[#F7F4EF] border border-[#E8E3DB] px-4 py-3 mb-3">
                        <p className="text-xs text-[#6B6560] leading-relaxed">
                          {getReasonText(gap)}
                        </p>
                        {eventText && (
                          <p className="text-[10px] text-[#8B8680] mt-1.5">
                            For: {eventText}
                          </p>
                        )}
                      </div>

                      {/* Match + Expiry */}
                      <div className="flex items-center gap-4 text-[11px] text-[#8B8680]">
                        <span>{matchScore}% match confidence</span>
                        <span className="w-1 h-1 rounded-full bg-[#C5BDB1]" />
                        <span>Expires {formatExpiryDate()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="mt-8 border-t border-[#E8E3DB] pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8B8680] mb-1">Selected Items Total</p>
                  <p className="text-lg font-semibold text-[#1A1A1A]">
                    &euro;{selectedTotal.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8B8680] mb-1">Full Cart Value</p>
                  <p className="text-lg font-semibold text-[#1A1A1A]">
                    &euro;{fullCartValue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMoveToConsiderations}
                  disabled={selectedItems.size === 0}
                  className={`flex-1 py-3.5 text-sm tracking-wide uppercase text-center transition-colors ${
                    selectedItems.size > 0
                      ? 'bg-[#3D3529] text-white hover:bg-[#1A1A1A]'
                      : 'bg-[#C5BDB1] text-white cursor-not-allowed'
                  }`}
                >
                  Move to Considerations ({selectedItems.size})
                </button>
                <Link
                  href="/profile"
                  className="px-6 py-3.5 text-sm tracking-wide uppercase text-[#3D3529] border border-[#3D3529] hover:bg-[#3D3529] hover:text-white transition-colors text-center"
                >
                  View Considerations &rsaquo;
                </Link>
              </div>

              <p className="text-xs text-[#8B8680] text-center mt-4">
                Items moved to Considerations can be reviewed before purchase.
              </p>
            </div>
          </>
        )}

        {/* About Silent Cart */}
        <div className="mt-10 border border-[#E8E3DB] bg-[#F7F4EF] p-6">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-[#8B8680] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-2">About Silent Cart</p>
              <p className="text-sm text-[#6B6560] leading-relaxed">
                The Silent Cart feature observes your browsing patterns, wardrobe composition, and upcoming events to prepare
                items you might love. It&apos;s designed to help, not pressure. Items expire after 30 days and you&apos;re always in control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
