'use client';

import { Heart, Share2, Check, Bell, Eye, User, Sparkles, MessageCircle, ShoppingBag, Minus, Plus } from 'lucide-react';
import type { Product, ProductVariant } from '@/types';

interface ProductActionsProps {
  product: Product;
  sizeVariants: ProductVariant[];
  colorVariants: ProductVariant[];
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
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
  onQuantityChange: (qty: number) => void;
  showIntelligence: boolean;
}

export default function ProductActions({
  product,
  sizeVariants,
  colorVariants,
  selectedSize,
  selectedColor,
  quantity,
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
  onQuantityChange,
  showIntelligence
}: ProductActionsProps) {
  const needsSize = sizeVariants.length > 0 && !selectedSize;
  const needsColor = colorVariants.length > 0 && !selectedColor;
  const selectionIncomplete = needsSize || needsColor;

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

      {/* Quantity Selector */}
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.3em] uppercase text-taupe mb-3">Quantity</p>
        <div className="inline-flex items-center border border-sand">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-charcoal-deep border-x border-sand">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(Math.min(99, quantity + 1))}
            disabled={quantity >= 99}
            className="w-10 h-10 flex items-center justify-center text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
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
              disabled={sizeVariants.length > 0 && !selectedSize}
              className="group flex-1 py-4 px-4 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-warm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-charcoal-deep"
              title={sizeVariants.length > 0 && !selectedSize ? 'Please select a size first' : ''}
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
              disabled={sizeVariants.length > 0 && !selectedSize}
              className="group flex-1 py-4 px-4 border-2 border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-charcoal-deep"
              title={sizeVariants.length > 0 && !selectedSize ? 'Please select a size first' : ''}
            >
              <ShoppingBag size={16} />
              <span className="text-sm tracking-[0.1em] uppercase">Add to Cart</span>
            </button>
          )}
        </div>

        {/* Helper text when size is required */}
        {sizeVariants.length > 0 && !selectedSize && !inConsiderations && !inCart && (
          <p className="text-xs text-center text-stone">
            Please select a size to continue
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
    </>
  );
}
