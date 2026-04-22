'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Check, AlertCircle, ChevronDown, Sparkles, Ruler, Shield } from 'lucide-react';
import type { FitConfidence, DigitalBodyTwin } from '@/types';

interface FitConfidenceCardProps {
  fitConfidence: FitConfidence;
  bodyTwin?: DigitalBodyTwin;
  selectedSize?: string | null;
}

export default function FitConfidenceCard({ fitConfidence, bodyTwin, selectedSize }: FitConfidenceCardProps) {
  const [expanded, setExpanded] = useState(true);

  const getReturnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success bg-success/10';
      case 'medium': return 'text-gold-deep bg-gold-muted/20';
      case 'high': return 'text-error bg-error/10';
      default: return 'text-stone bg-sand';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-gold-deep';
    return 'text-stone';
  };

  const getAlignmentColor = (value: string | null) => {
    if (!value) return 'text-stone';
    if (value === 'good' || value === 'optimal') return 'text-success';
    if (value === 'moderate') return 'text-gold-deep';
    return 'text-stone';
  };

  const ma = fitConfidence.measurementAnalysis;
  const hasMeasurements = ma && (
    ma.chestDifferenceCm !== null ||
    ma.waistDifferenceCm !== null ||
    ma.shoulderAlignment !== null ||
    ma.sleeveLengthEstimate !== null
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
            <User size={20} className="text-sapphire-subtle" />
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">Fit Confidence</p>
            <p className="text-sm text-stone">
              {fitConfidence.bodyTwinUsed
                ? 'Based on your Digital Body Twin'
                : bodyTwin
                  ? 'Based on your Body Twin'
                  : 'Set up Body Twin for accuracy'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-2xl font-display ${getScoreColor(fitConfidence.overallScore)}`}>
              {fitConfidence.overallScore}%
            </div>
            <p className="text-[9px] text-stone/60 tracking-wider">estimate</p>
          </div>
          <ChevronDown
            size={20}
            className={`text-greige transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-sand pt-4">
          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Size recommendation is an estimate. Check the brand&apos;s size guide for exact measurements before ordering.
            </p>
          </div>

          {/* Size Recommendation */}
          <div className="flex items-center justify-between mb-4 p-3 bg-parchment rounded-lg">
            <div>
              <p className="text-sm text-greige">Recommended Size</p>
              {fitConfidence.confidenceInterval?.sizeRange ? (
                <p className="font-display text-lg text-charcoal-deep">{fitConfidence.confidenceInterval.sizeRange}</p>
              ) : (
                <p className="font-display text-lg text-charcoal-deep">{fitConfidence.suggestedSize}</p>
              )}
              <p className="text-[10px] text-stone/60 mt-0.5">Estimated — verify with brand size chart</p>
            </div>
            {selectedSize === fitConfidence.suggestedSize ? (
              <div className="flex items-center gap-2 text-success text-sm">
                <Check size={16} />
                Selected
              </div>
            ) : (
              <span className="text-sm text-gold-deep">Select this size</span>
            )}
          </div>

          {/* Low confidence warning */}
          {fitConfidence.confidenceInterval?.lowConfidenceFlag && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-700">Low confidence prediction</p>
                <p className="text-xs text-red-600 mt-0.5">{fitConfidence.confidenceInterval.explanation || 'Limited data available for this product. We strongly recommend checking the brand size guide.'}</p>
              </div>
            </div>
          )}

          {/* Available Sizes */}
          {fitConfidence.availableSizes && fitConfidence.availableSizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fitConfidence.availableSizes.map((size) => (
                <span
                  key={size}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    size === fitConfidence.suggestedSize
                      ? 'bg-sapphire-deep/10 border-sapphire-subtle text-sapphire-subtle'
                      : 'bg-sand/30 border-sand text-stone'
                  }`}
                >
                  {size}
                  {size === fitConfidence.suggestedSize && ' (Best)'}
                </span>
              ))}
            </div>
          )}

          {/* Score Breakdown */}
          <div className="space-y-3 mb-4">
            {[
              { label: 'Size Match', value: fitConfidence.breakdown.sizeMatch },
              { label: 'Style Match', value: fitConfidence.breakdown.styleMatch },
              { label: 'Proportion Match', value: fitConfidence.breakdown.proportionMatch },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone">{label}</span>
                  <span className={getScoreColor(value)}>{value}%</span>
                </div>
                <div className="h-2 bg-sand rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sapphire-subtle rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Measurement Analysis */}
          {hasMeasurements && (
            <div className="mb-4 p-3 bg-parchment/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Ruler size={14} className="text-sapphire-subtle" />
                <p className="text-sm font-medium text-charcoal-deep">Measurement Analysis</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ma.chestDifferenceCm !== null && (
                  <div>
                    <p className="text-[11px] text-greige uppercase tracking-wider">Chest Diff</p>
                    <p className="text-sm text-charcoal-deep font-medium">
                      {ma.chestDifferenceCm === 0 ? 'Perfect' : `${ma.chestDifferenceCm > 0 ? '+' : ''}${ma.chestDifferenceCm} cm`}
                    </p>
                  </div>
                )}
                {ma.waistDifferenceCm !== null && (
                  <div>
                    <p className="text-[11px] text-greige uppercase tracking-wider">Waist Diff</p>
                    <p className="text-sm text-charcoal-deep font-medium">
                      {ma.waistDifferenceCm === 0 ? 'Perfect' : `${ma.waistDifferenceCm > 0 ? '+' : ''}${ma.waistDifferenceCm} cm`}
                    </p>
                  </div>
                )}
                {ma.shoulderAlignment && (
                  <div>
                    <p className="text-[11px] text-greige uppercase tracking-wider">Shoulders</p>
                    <p className={`text-sm font-medium capitalize ${getAlignmentColor(ma.shoulderAlignment)}`}>
                      {ma.shoulderAlignment}
                    </p>
                  </div>
                )}
                {ma.sleeveLengthEstimate && (
                  <div>
                    <p className="text-[11px] text-greige uppercase tracking-wider">Sleeve Length</p>
                    <p className={`text-sm font-medium capitalize ${getAlignmentColor(ma.sleeveLengthEstimate)}`}>
                      {ma.sleeveLengthEstimate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fit Notes */}
          {fitConfidence.sizeNotes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-charcoal-deep mb-2">Fit Notes</p>
              <ul className="space-y-1">
                {fitConfidence.sizeNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-stone">
                    <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Return Risk */}
          <div className="flex items-center justify-between p-3 bg-parchment rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-stone" />
              <span className="text-sm text-stone">Return Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone">{fitConfidence.returnRiskScore}%</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReturnRiskColor(fitConfidence.returnRisk)}`}>
                {fitConfidence.returnRisk.charAt(0).toUpperCase() + fitConfidence.returnRisk.slice(1)}
              </span>
            </div>
          </div>

          {/* AGI Recommendation */}
          <div className="p-3 bg-sapphire-deep/5 rounded-lg border border-sapphire-subtle/20">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-sapphire-subtle mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone">{fitConfidence.recommendation}</p>
            </div>
          </div>

          {/* Engine Version */}
          {fitConfidence.fitEngineVersion && (
            <p className="mt-3 text-[10px] text-greige/60 text-right tracking-wider">
              Fit Engine {fitConfidence.fitEngineVersion}
            </p>
          )}

          {/* Body Twin Link */}
          {!bodyTwin && !fitConfidence.bodyTwinUsed && (
            <Link
              href="/profile/body-twin"
              className="mt-4 block text-center text-sm text-gold-muted hover:text-gold-deep"
            >
              Set up your Digital Body Twin for more accurate predictions →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
