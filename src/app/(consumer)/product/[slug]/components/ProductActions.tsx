'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Share2, Check, Bell, Eye, User, Sparkles, MessageCircle, ShoppingBag, DollarSign, X, Crown, TrendingDown } from 'lucide-react';
import type { Product, ProductVariant } from '@/types';
import type { PricingTier } from '@/types/pricing-tiers';

interface ProductActionsProps {
  product: Product;
  sizeVariants: ProductVariant[];
  colorVariants: ProductVariant[];
  selectedSize: string | null;
  selectedColor: string | null;
  inConsiderations: boolean;
  inCart: boolean;
  inWardrobe: boolean;
  watchingRestock: boolean;
  onAddToConsiderations: () => void;
  onRemoveFromConsiderations: () => void;
  onAddToCart: () => void;
  onAddToWardrobe: () => void;
  onRemoveFromWardrobe: () => void;
  onShare: () => void;
  onNotifyRestock: () => void;
  onShowIV: () => void;
  onShowViewOnMe: () => void;
  onShowIntelligence: () => void;
  onShowConcierge: () => void;
  showIntelligence: boolean;
  isUHNI?: boolean;
  onNegotiatePrice?: (proposedPrice: number, message: string) => void;
  pricingTier?: PricingTier;
  hasPriceAlert?: boolean;
  onSetPriceAlert?: (targetPrice: number) => void;
}

export default function ProductActions({
  product,
  sizeVariants,
  colorVariants,
  selectedSize,
  selectedColor,
  inConsiderations,
  inCart,
  inWardrobe,
  watchingRestock,
  onAddToConsiderations,
  onRemoveFromConsiderations,
  onAddToCart,
  onAddToWardrobe,
  onRemoveFromWardrobe,
  onShare,
  onNotifyRestock,
  onShowIV,
  onShowViewOnMe,
  onShowIntelligence,
  onShowConcierge,
  showIntelligence,
  isUHNI,
  onNegotiatePrice,
  pricingTier = 'standard',
  hasPriceAlert,
  onSetPriceAlert
}: ProductActionsProps) {
  const router = useRouter();
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState('');
  const [negotiateMessage, setNegotiateMessage] = useState('');
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const needsSize = sizeVariants.length > 0 && !selectedSize;
  const needsColor = colorVariants.length > 0 && !selectedColor;
  const selectionIncomplete = needsSize || needsColor;
  const canSetPriceAlert = pricingTier === 'preferred' || pricingTier === 'uhni';

  return (
    <>
      {/* IV™ Button - See How It Looks */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={onShowIV}
          className="flex-1 py-4 px-6 border border-gold-muted text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-muted/10 group"
          title="Immersive Visualization™ - Visualize this piece on your Digital Body Twin with AI-powered styling"
        >
          <Eye size={18} className="text-gold-muted" />
          <span className="text-sm tracking-[0.15em] uppercase">IV™</span>
        </button>
        <button
          onClick={onShowViewOnMe}
          className="flex-1 py-4 px-6 border border-sapphire-subtle text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-sapphire-subtle/10 group"
          title="View on Me - See how this piece looks on your body type"
        >
          <User size={18} className="text-sapphire-subtle" />
          <span className="text-sm tracking-[0.15em] uppercase">View on Me</span>
        </button>
      </div>

      {/* Intelligence Panel Toggle */}
      <button
        onClick={onShowIntelligence}
        className="w-full mb-6 py-4 px-6 bg-sapphire-deep/5 border border-sapphire-subtle/20 text-charcoal-deep flex items-center justify-between transition-all duration-300 hover:bg-sapphire-deep/10"
        title="AI-powered availability intelligence (G-SAIL™) and personalized fit recommendations"
      >
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-sapphire-subtle" />
          <span className="text-sm tracking-[0.1em]">Fashion Intelligence</span>
        </div>
        <span className="text-xs text-stone">
          {showIntelligence ? 'Hide' : 'Show Details'}
        </span>
      </button>

      {/* Availability Status */}
      {product.availability.status !== 'available' && (
        <div className="mb-8 p-5 bg-parchment">
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-2 h-2 rounded-full ${
              product.availability.status === 'limited' ? 'bg-gold-muted' : 'bg-taupe'
            }`} />
            <p className="text-sm font-medium text-charcoal-deep">
              {product.availability.status === 'limited' ? 'Limited Availability' : 'Currently Unavailable'}
            </p>
          </div>
          <p className="text-sm text-stone">
            {product.availability.status === 'limited'
              ? 'This piece is part of a limited edition. Reserve early to secure your size.'
              : 'This piece is currently sold out. Request notification when available.'
            }
          </p>
        </div>
      )}

      {/* Main Actions */}
      <div className="space-y-4">
        {/* Add to Considerations + Add to Cart — side by side */}
        <div className="flex gap-3">
          {inConsiderations ? (
            <button
              onClick={onRemoveFromConsiderations}
              className="group flex-1 py-4 px-4 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-warm"
            >
              <Check size={16} />
              <span className="text-sm tracking-[0.1em] uppercase">In Your Considerations</span>
            </button>
          ) : (
            <button
              onClick={onAddToConsiderations}
              disabled={selectionIncomplete}
              className="group flex-1 py-4 px-4 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-warm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-charcoal-deep"
              title={selectionIncomplete ? 'Please select size and color first' : ''}
            >
              <Heart size={16} />
              <span className="text-sm tracking-[0.1em] uppercase">Add to Considerations</span>
            </button>
          )}

          {inCart ? (
            <button
              disabled
              className="group flex-1 py-4 px-4 bg-gold-muted/10 border border-gold-muted/30 text-gold-deep flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span className="text-sm tracking-[0.1em] uppercase">In Cart</span>
            </button>
          ) : (
            <button
              onClick={onAddToCart}
              disabled={selectionIncomplete}
              className="group flex-1 py-4 px-4 border-2 border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-charcoal-deep"
              title={selectionIncomplete ? 'Please select size and color first' : ''}
            >
              <ShoppingBag size={16} />
              <span className="text-sm tracking-[0.1em] uppercase">Add to Cart</span>
            </button>
          )}
        </div>

        {/* Helper text when selection is incomplete */}
        {selectionIncomplete && !inConsiderations && !inCart && (
          <p className="text-xs text-center text-stone">
            Please select {needsSize && needsColor ? 'size and color' : needsSize ? 'a size' : 'a color'} to continue
          </p>
        )}

        {/* Add to Wardrobe - I Own This */}
        {inWardrobe ? (
          <button
            onClick={onRemoveFromWardrobe}
            className="group w-full py-3 px-6 bg-success/10 border border-success/30 text-success flex items-center justify-center gap-3 transition-all duration-300 hover:bg-success/20"
          >
            <Check size={16} />
            <span className="text-sm tracking-[0.15em] uppercase">In My Wardrobe</span>
          </button>
        ) : (
          <button
            onClick={onAddToWardrobe}
            disabled={selectionIncomplete}
            className="group w-full py-3 px-6 border border-gold-muted/50 text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-muted/10 hover:border-gold-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gold-muted/50"
            title={selectionIncomplete ? 'Please select size and color first' : 'Add this piece to your Digital Wardrobe'}
          >
            <ShoppingBag size={16} className="text-gold-muted" />
            <span className="text-sm tracking-[0.15em] uppercase">Add to Wardrobe</span>
          </button>
        )}

        {/* Helper text when selection is incomplete */}
        {selectionIncomplete && !inWardrobe && (
          <p className="text-xs text-center text-stone">
            Please select {needsSize && needsColor ? 'size and color' : needsSize ? 'a size' : 'a color'} to add to wardrobe
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onShare}
            className="flex-1 py-4 px-6 border border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream"
          >
            <Share2 size={16} />
            <span className="text-sm tracking-[0.15em] uppercase">Share</span>
          </button>

          {watchingRestock ? (
            <button
              className="flex-1 py-4 px-6 border border-charcoal-deep bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3"
              disabled
            >
              <Bell size={16} />
              <span className="text-sm tracking-[0.15em] uppercase">Watching</span>
            </button>
          ) : (
            <button
              onClick={onNotifyRestock}
              className="flex-1 py-4 px-6 border border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream"
            >
              <Bell size={16} />
              <span className="text-sm tracking-[0.15em] uppercase">Notify</span>
            </button>
          )}
        </div>

        {/* Price Alert - Preferred & UHNI only */}
        {canSetPriceAlert && onSetPriceAlert && (
          hasPriceAlert ? (
            <button
              disabled
              className="w-full py-3 px-6 bg-success/10 border border-success/30 text-success flex items-center justify-center gap-3"
            >
              <Check size={16} />
              <span className="text-sm tracking-[0.15em] uppercase">Price Alert Set</span>
            </button>
          ) : (
            <button
              onClick={() => setShowPriceAlertModal(true)}
              className="w-full py-3 px-6 border border-gold-muted/50 text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-muted/10 hover:border-gold-muted"
            >
              <TrendingDown size={16} className="text-gold-muted" />
              <span className="text-sm tracking-[0.15em] uppercase">Set Price Alert</span>
              <span className="text-[10px] text-taupe ml-1">{pricingTier === 'uhni' ? 'UHNI' : 'Member'}</span>
            </button>
          )
        )}

        {/* Upgrade prompt for Standard users */}
        {pricingTier === 'standard' && (
          <Link
            href="/pricing-tiers"
            className="w-full py-3 px-6 bg-parchment border border-sand/50 text-stone flex items-center justify-center gap-3 transition-all duration-300 hover:bg-sand/20"
          >
            <TrendingDown size={16} className="text-taupe" />
            <span className="text-sm tracking-[0.1em]">Upgrade for Price Alerts</span>
          </Link>
        )}
      </div>

      {/* Quick Concierge */}
      <button
        onClick={onShowConcierge}
        className="w-full mt-6 py-4 px-6 border border-dashed border-taupe/30 text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:border-charcoal-deep hover:bg-parchment group"
      >
        <MessageCircle size={18} className="text-taupe group-hover:text-charcoal-deep transition-colors" />
        <span className="text-sm tracking-[0.1em]">Questions about this piece?</span>
        <span className="text-[10px] tracking-[0.15em] uppercase text-taupe group-hover:text-charcoal-deep transition-colors">Ask Concierge</span>
      </button>

      {/* UHNI: Negotiate Price */}
      {false && isUHNI && onNegotiatePrice && (
        <>
          <button
            onClick={() => setShowNegotiateModal(true)}
            className="w-full mt-4 py-4 px-6 bg-charcoal-deep/5 border border-gold-muted/40 text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-muted/10 hover:border-gold-muted"
          >
            <Crown size={16} className="text-gold-muted" />
            <span className="text-sm tracking-[0.15em] uppercase">Negotiate Price</span>
            <span className="text-[10px] text-taupe ml-1">UHNI Exclusive</span>
          </button>

          {/* UHNI: Ask Concierge About This Product */}
          <button
            onClick={() => {
              // Store product context in sessionStorage for concierge
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(
                  'concierge-product-context',
                  JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    brandName: product.brandName,
                    price: product.price,
                    slug: product.slug,
                    imageUrl: product.images?.[0]?.url || '',
                    timestamp: Date.now()
                  })
                )
              }
              router.push('/uhni/concierge')
            }}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-sand text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors text-sm tracking-[0.1em] uppercase mt-2"
          >
            <MessageCircle size={15} />
            Ask Concierge
          </button>

          {/* Negotiate Price Modal */}
          {showNegotiateModal && (
            <div className="fixed inset-0 bg-noir/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-md w-full">
                <div className="flex items-center justify-between px-6 py-4 border-b border-sand/50">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-gold-muted" />
                    <h3 className="font-display text-lg text-charcoal-deep">Negotiate Price</h3>
                  </div>
                  <button onClick={() => setShowNegotiateModal(false)} className="text-taupe hover:text-charcoal-deep">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-sm text-charcoal-deep font-medium">{product.name}</p>
                    <p className="text-xs text-taupe">{product.brandName}</p>
                    <p className="text-lg font-display text-charcoal-deep mt-1">
                      €{product.price.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] tracking-[0.15em] uppercase text-taupe block mb-2">
                      Your Proposed Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                      <input
                        type="number"
                        value={negotiatePrice}
                        onChange={(e) => setNegotiatePrice(e.target.value)}
                        placeholder="Enter your offer"
                        className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                    {negotiatePrice && parseFloat(negotiatePrice) > 0 && (
                      <p className="text-xs text-taupe mt-1">
                        {Math.round(((product.price - parseFloat(negotiatePrice)) / product.price) * 100)}% below retail
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] tracking-[0.15em] uppercase text-taupe block mb-2">
                      Message to Brand (Optional)
                    </label>
                    <textarea
                      value={negotiateMessage}
                      onChange={(e) => setNegotiateMessage(e.target.value)}
                      rows={3}
                      placeholder="Why this price? Mention loyalty, bulk interest, etc."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none text-sm"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowNegotiateModal(false)}
                      className="flex-1 py-3 px-4 border border-sand text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const price = parseFloat(negotiatePrice);
                        if (isNaN(price) || price <= 0) return;
                        onNegotiatePrice?.(price, negotiateMessage);
                        setShowNegotiateModal(false);
                        setNegotiatePrice('');
                        setNegotiateMessage('');
                      }}
                      disabled={!negotiatePrice || parseFloat(negotiatePrice) <= 0}
                      className="flex-1 py-3 px-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                    >
                      Submit Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Price Alert Modal */}
      {showPriceAlertModal && (
        <div className="fixed inset-0 bg-noir/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand/50">
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-gold-muted" />
                <h3 className="font-display text-lg text-charcoal-deep">Set Price Alert</h3>
              </div>
              <button onClick={() => setShowPriceAlertModal(false)} className="text-taupe hover:text-charcoal-deep">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm text-charcoal-deep font-medium">{product.name}</p>
                <p className="text-xs text-taupe">{product.brandName}</p>
                <p className="text-lg font-display text-charcoal-deep mt-1">
                  Current: €{product.price.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-taupe block mb-2">
                  Your Target Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                  <input
                    type="number"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    placeholder="Notify me when price drops to..."
                    className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
                {alertTargetPrice && parseFloat(alertTargetPrice) > 0 && parseFloat(alertTargetPrice) < product.price && (
                  <p className="text-xs text-taupe mt-1">
                    Alert when price drops {Math.round(((product.price - parseFloat(alertTargetPrice)) / product.price) * 100)}% below current
                  </p>
                )}
                {alertTargetPrice && parseFloat(alertTargetPrice) >= product.price && (
                  <p className="text-xs text-error mt-1">
                    Target price must be below current price
                  </p>
                )}
              </div>

              <div className="bg-parchment p-4">
                <p className="text-xs text-stone">
                  We'll notify you when the price drops to or below your target. Price alerts are available for Preferred and UHNI members.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPriceAlertModal(false)}
                  className="flex-1 py-3 px-4 border border-sand text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const price = parseFloat(alertTargetPrice);
                    if (isNaN(price) || price <= 0 || price >= product.price) return;
                    onSetPriceAlert?.(price);
                    setShowPriceAlertModal(false);
                    setAlertTargetPrice('');
                  }}
                  disabled={!alertTargetPrice || parseFloat(alertTargetPrice) <= 0 || parseFloat(alertTargetPrice) >= product.price}
                  className="flex-1 py-3 px-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                >
                  Set Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
