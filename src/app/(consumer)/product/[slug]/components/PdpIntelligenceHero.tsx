'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ruler, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { FitConfidence, DigitalBodyTwin } from '@/types/intelligence';

interface PdpIntelligenceHeroProps {
  productSlug: string;
  fitConfidence: FitConfidence | null;
  bodyTwin: DigitalBodyTwin | undefined;
  loading?: boolean;
  /** Optional render of the detailed FitConfidenceCard inline when user clicks "Why?". */
  expandedDetail?: React.ReactNode;
}

function ConfidencePill({ score }: { score: number }) {
  const tone =
    score >= 80 ? 'bg-success/12 text-success'
    : score >= 60 ? 'bg-warning/12 text-warning'
    : 'bg-error/12 text-error';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${tone}`}>
      {score}% confidence
    </span>
  );
}

function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' | string }) {
  const map: Record<string, string> = {
    low: 'bg-success/10 text-success',
    medium: 'bg-warning/12 text-warning',
    high: 'bg-error/12 text-error',
  };
  const label =
    risk === 'low' ? 'Low return risk'
    : risk === 'medium' ? 'Medium return risk'
    : 'High return risk';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight ${map[risk] ?? 'bg-stone/10 text-stone'}`}>
      {label}
    </span>
  );
}

export default function PdpIntelligenceHero({
  productSlug,
  fitConfidence,
  bodyTwin,
  loading,
  expandedDetail,
}: PdpIntelligenceHeroProps) {
  const [showDetail, setShowDetail] = useState(false);

  // ── State 1: Loading (cached fit usually returns sub-50ms, this only flashes on first load) ──
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-mesh-luxe border border-sand p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-parchment animate-pulse" />
          <div className="h-3 w-32 bg-parchment rounded animate-pulse" />
        </div>
        <div className="h-8 w-48 bg-parchment rounded animate-pulse mb-2" />
        <div className="h-3 w-64 bg-parchment rounded animate-pulse" />
      </div>
    );
  }

  // ── State 2: No Body Twin — educational empty state ──
  if (!bodyTwin) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-mesh-luxe border border-gold-soft/30 p-6 mb-6 shadow-card-lift">
        <div className="absolute inset-x-0 top-0 h-px bg-hairline-gold opacity-80" aria-hidden="true" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gold-soft/15 border border-gold-soft/30 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} strokeWidth={1.75} className="text-gold-deep" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold-deep mb-2">
              Unlock per-product sizing
            </p>
            <h3
              className="font-display font-light text-xl text-charcoal-deep tracking-[-0.02em] mb-2"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Capture your Digital Body Twin
            </h3>
            <p className="text-sm text-stone leading-relaxed mb-4">
              11 measurements, 90 seconds. Every product page from now on will tell you the recommended size, fit confidence, and return risk — calibrated to your body.
            </p>
            <Link
              href={`/profile/body-twin?return_to=${encodeURIComponent(`/product/${productSlug}`)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal-deep text-ivory-cream text-xs font-semibold tracking-[0.18em] uppercase hover:bg-noir transition-all shadow-glow-noir hover:shadow-glow-gold"
            >
              <Ruler size={14} strokeWidth={2} />
              Capture in 90 sec
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── State 3: Has Body Twin + fit data → hero card with size, confidence, risk ──
  const score = Math.round(fitConfidence?.overallScore ?? 0);
  const suggestedSize = fitConfidence?.suggestedSize ?? '—';
  const sleeveNote = fitConfidence?.measurementAnalysis?.sleeveLengthEstimate;
  const shoulderNote = fitConfidence?.measurementAnalysis?.shoulderAlignment;
  const oneLine =
    sleeveNote || shoulderNote
      ? [sleeveNote, shoulderNote].filter(Boolean).join(' · ')
      : 'Tailored to your measurements.';

  // Heuristic risk from score (BE doesn't directly expose returnRisk on FitConfidence type)
  const risk: 'low' | 'medium' | 'high' =
    score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high';

  return (
    <div className="relative overflow-hidden rounded-xl bg-mesh-luxe border border-gold-soft/30 mb-6 shadow-card-lift">
      <div className="absolute inset-x-0 top-0 h-px bg-hairline-gold opacity-80" aria-hidden="true" />
      <div
        className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.35) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Ruler size={14} strokeWidth={2} className="text-gold-deep" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold-deep">
              Your Body Twin says
            </span>
          </div>
          <RiskBadge risk={risk} />
        </div>

        <div className="flex items-baseline gap-4 mb-2">
          <span
            className="font-display font-light text-[3rem] text-charcoal-deep leading-none tracking-[-0.03em] font-mono-tight"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {suggestedSize}
          </span>
          <ConfidencePill score={score} />
        </div>

        <p className="text-sm text-stone leading-relaxed mb-4">{oneLine}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {expandedDetail && (
            <button
              type="button"
              onClick={() => setShowDetail(s => !s)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-charcoal-deep/15 bg-white/60 backdrop-blur text-charcoal-deep text-[11px] font-semibold tracking-[0.15em] uppercase hover:border-charcoal-deep/40 hover:bg-white transition-all"
            >
              {showDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showDetail ? 'Hide detail' : 'Why?'}
            </button>
          )}
          <Link
            href={`/profile/body-twin?return_to=${encodeURIComponent(`/product/${productSlug}`)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
          >
            Update twin
          </Link>
          {risk === 'high' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-error">
              <AlertCircle size={12} />
              Consider sizing up
            </span>
          )}
        </div>

        {showDetail && expandedDetail && (
          <div className="mt-6 pt-6 border-t border-sand/60">
            {expandedDetail}
          </div>
        )}
      </div>
    </div>
  );
}
