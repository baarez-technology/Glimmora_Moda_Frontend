'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Check, AlertCircle, ChevronDown, Sparkles } from 'lucide-react';
import type { FitConfidence, DigitalBodyTwin } from '@/types';

interface FitConfidenceCardProps {
  fitConfidence: FitConfidence;
  bodyTwin?: DigitalBodyTwin;
  selectedSize?: string | null;
}

export default function FitConfidenceCard({ fitConfidence, bodyTwin, selectedSize }: FitConfidenceCardProps) {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
            <User size={20} className="text-sapphire-subtle" />
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">Fit Confidence</p>
            <p className="text-sm text-stone">
              {bodyTwin ? 'Based on your Body Twin' : 'Set up Body Twin for accuracy'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-display ${getScoreColor(fitConfidence.overallScore)}`}>
            {fitConfidence.overallScore}%
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
          {/* Size Recommendation */}
          <div className="flex items-center justify-between mb-4 p-3 bg-parchment rounded-lg">
            <div>
              <p className="text-sm text-greige">Recommended Size</p>
              <p className="font-display text-lg text-charcoal-deep">{fitConfidence.suggestedSize}</p>
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

          {/* Score Breakdown */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone">Size Match</span>
                <span className={getScoreColor(fitConfidence.breakdown.sizeMatch)}>
                  {fitConfidence.breakdown.sizeMatch}%
                </span>
              </div>
              <div className="h-2 bg-sand rounded-full overflow-hidden">
                <div
                  className="h-full bg-sapphire-subtle rounded-full transition-all"
                  style={{ width: `${fitConfidence.breakdown.sizeMatch}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone">Style Match</span>
                <span className={getScoreColor(fitConfidence.breakdown.styleMatch)}>
                  {fitConfidence.breakdown.styleMatch}%
                </span>
              </div>
              <div className="h-2 bg-sand rounded-full overflow-hidden">
                <div
                  className="h-full bg-sapphire-subtle rounded-full transition-all"
                  style={{ width: `${fitConfidence.breakdown.styleMatch}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone">Proportion Match</span>
                <span className={getScoreColor(fitConfidence.breakdown.proportionMatch)}>
                  {fitConfidence.breakdown.proportionMatch}%
                </span>
              </div>
              <div className="h-2 bg-sand rounded-full overflow-hidden">
                <div
                  className="h-full bg-sapphire-subtle rounded-full transition-all"
                  style={{ width: `${fitConfidence.breakdown.proportionMatch}%` }}
                />
              </div>
            </div>
          </div>

          {/* Size Notes */}
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
              <AlertCircle size={16} className="text-stone" />
              <span className="text-sm text-stone">Return Risk</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReturnRiskColor(fitConfidence.returnRisk)}`}>
              {fitConfidence.returnRisk.charAt(0).toUpperCase() + fitConfidence.returnRisk.slice(1)}
            </span>
          </div>

          {/* AGI Recommendation */}
          <div className="p-3 bg-sapphire-deep/5 rounded-lg border border-sapphire-subtle/20">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-sapphire-subtle mt-0.5 flex-shrink-0" />
              <p className="text-sm text-stone">{fitConfidence.recommendation}</p>
            </div>
          </div>

          {/* Body Twin Link */}
          {!bodyTwin && (
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
