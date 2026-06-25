'use client';

import { Camera, Sparkles, ArrowRight } from 'lucide-react';

interface PdpTryOnPromoteProps {
  productName: string;
  /** True when the customer already has a try-on photo uploaded. Drives the sub-label. */
  hasUploadedPhoto: boolean;
  onLaunch: () => void;
  disabled?: boolean;
}

/**
 * Promoted Virtual Try-On call-to-action. Sits between variant selection and Add-to-Cart
 * so it lands in the customer's natural eyeline. Two micro-states differ only in the
 * sub-label so the button itself is a consistent visual anchor.
 */
export default function PdpTryOnPromote({
  productName,
  hasUploadedPhoto,
  onLaunch,
  disabled,
}: PdpTryOnPromoteProps) {
  return (
    <button
      type="button"
      onClick={onLaunch}
      disabled={disabled}
      aria-label={`Virtually try on ${productName}`}
      className={`
        group relative w-full overflow-hidden
        rounded-xl border border-gold-soft/40
        bg-gradient-to-r from-gold-soft/15 via-gold-soft/10 to-gold-soft/15
        hover:from-gold-soft/25 hover:via-gold-soft/15 hover:to-gold-soft/25
        transition-all duration-300
        shadow-card-lift hover:shadow-glow-gold
        py-5 px-6 mb-4
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {/* Animated shine sweep on hover */}
      <span
        className="absolute inset-0 bg-shine-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundSize: '200% 100%' }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-charcoal-deep flex items-center justify-center shadow-glow-noir">
            <Camera size={18} strokeWidth={1.75} className="text-gold-soft" />
          </div>
          <div className="text-left">
            <p
              className="font-display font-light text-lg text-charcoal-deep tracking-[-0.01em] leading-tight"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Try this on you
            </p>
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone mt-0.5">
              {hasUploadedPhoto
                ? 'See it on your photo in 15 seconds'
                : 'Upload one photo, unlock every try-on'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 text-charcoal-deep">
          {!hasUploadedPhoto && (
            <Sparkles size={14} strokeWidth={2} className="text-gold-deep animate-pulse" />
          )}
          <ArrowRight
            size={18}
            strokeWidth={2}
            className="text-charcoal-deep group-hover:translate-x-1 transition-transform duration-300"
          />
        </span>
      </div>
    </button>
  );
}
