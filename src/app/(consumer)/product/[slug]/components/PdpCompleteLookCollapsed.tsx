'use client';

import { useState } from 'react';
import { Shirt, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { CompleteOutfit } from '@/types/intelligence';

interface PdpCompleteLookCollapsedProps {
  productName: string;
  outfitsAvailable: number;
  outfits: CompleteOutfit[];
  /** Component to render when expanded. Pass the existing <OutfitSuggestions /> here. */
  expandedContent: React.ReactNode;
}

/**
 * Collapsed-by-default Complete-the-Look trigger that hoists this USP into the
 * action area of the PDP (above the page fold). When the customer expands it,
 * the existing OutfitSuggestions component renders inline.
 */
export default function PdpCompleteLookCollapsed({
  productName,
  outfitsAvailable,
  outfits,
  expandedContent,
}: PdpCompleteLookCollapsedProps) {
  const [expanded, setExpanded] = useState(false);

  // No outfits and no expansion → render nothing to avoid empty card noise.
  if (!outfitsAvailable && outfits.length === 0) return null;

  const occasions = Array.from(new Set(outfits.map(o => o.occasion))).slice(0, 3);
  const subLabel =
    outfits.length > 0
      ? `${outfits.length} curated ${outfits.length === 1 ? 'outfit' : 'outfits'}${occasions.length ? ' · ' + occasions.join(' · ') : ''}`
      : `Build a full look around ${productName}`;

  return (
    <div className="rounded-xl border border-sand bg-parchment/40 hover:bg-parchment/60 transition-colors duration-300 mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-deep/8 flex items-center justify-center">
            <Shirt size={16} strokeWidth={1.75} className="text-charcoal-deep" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={12} strokeWidth={2} className="text-gold-deep" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold-deep">
                Complete the look
              </span>
            </div>
            <p className="text-sm text-charcoal-deep mt-1">{subLabel}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-stone">
          {expanded ? (
            <>Hide <ChevronUp size={14} /></>
          ) : (
            <>View <ChevronDown size={14} /></>
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-sand/60 bg-white/40 p-2 md:p-4">
          {expandedContent}
        </div>
      )}
    </div>
  );
}
