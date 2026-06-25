'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface PdpSilentCartButtonProps {
  inConsiderations: boolean;
  onAddToConsiderations: () => void;
  onRemoveFromConsiderations: () => void;
}

/**
 * Small ✨ icon button next to Add-to-Cart that toggles the product in/out of the
 * customer's "Silent Cart" considerations. The Silent Cart is the AI wardrobe-gap
 * surface (USP 7) — every consideration feeds that signal.
 */
export default function PdpSilentCartButton({
  inConsiderations,
  onAddToConsiderations,
  onRemoveFromConsiderations,
}: PdpSilentCartButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={inConsiderations ? onRemoveFromConsiderations : onAddToConsiderations}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocus={() => setTooltipOpen(true)}
        onBlur={() => setTooltipOpen(false)}
        aria-label={inConsiderations ? 'Remove from Silent Cart' : 'Save to Silent Cart'}
        aria-pressed={inConsiderations}
        className={`
          relative w-12 h-12 rounded-full
          border transition-all duration-300
          flex items-center justify-center
          ${inConsiderations
            ? 'bg-gold-soft/15 border-gold-soft/40 shadow-glow-gold animate-pulse-gold'
            : 'bg-white border-sand hover:border-charcoal-deep/30 hover:bg-parchment/60'}
        `}
      >
        <Sparkles
          size={18}
          strokeWidth={inConsiderations ? 2.25 : 1.75}
          className={inConsiderations ? 'text-gold-deep' : 'text-stone'}
        />
      </button>

      {tooltipOpen && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 mb-2 w-64 z-20 px-3 py-2 rounded-lg bg-noir text-ivory-cream text-[11px] leading-relaxed shadow-glow-noir"
        >
          <p className="font-semibold tracking-tight mb-0.5">
            {inConsiderations ? 'Saved to Silent Cart' : 'Save to Silent Cart'}
          </p>
          <p className="text-ivory-warm/70 tracking-tight">
            Your AI watches this taste signal and surfaces wardrobe gaps you didn&apos;t search for.
          </p>
        </div>
      )}
    </div>
  );
}
