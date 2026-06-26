'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import AvailabilityIntelligence from '@/components/product/AvailabilityIntelligence';
import FitConfidenceCard from '@/components/product/FitConfidenceCard';
import ClimateSuitability from '@/components/product/ClimateSuitability';
import SustainabilityScore from '@/components/product/SustainabilityScore';
import FabricSimulation from '@/components/product/FabricSimulation';
import type {
  AvailabilityIntelligence as AvailabilityIntelligenceType,
  FitConfidence,
  DigitalBodyTwin,
  FabricSimulation as FabricSimulationType,
  ClimateSuitability as ClimateSuitabilityType,
  SustainabilityScore as SustainabilityScoreType,
  ProductVariant
} from '@/types';

interface ProductIntelligencePanelProps {
  isVisible: boolean;
  availabilityIntelligence: AvailabilityIntelligenceType;
  fitConfidence: FitConfidence | null;
  climateSuitability: ClimateSuitabilityType;
  sustainabilityScore: SustainabilityScoreType;
  fabricSimulation?: FabricSimulationType;
  bodyTwin?: DigitalBodyTwin;
  selectedSize: string | null;
  sizeVariants: ProductVariant[];
  onNotifyRestock: () => void;
}

/** Honest empty state for Fit Confidence when no real API result is available. */
function FitConfidenceEmptyState() {
  // Check for a token client-side to decide which CTA to show.
  // This component is only rendered inside the intelligence panel (client component),
  // so localStorage is always available here.
  let hasToken = false;
  try {
    hasToken = Boolean(
      typeof window !== 'undefined' && localStorage.getItem('moda-user-token')
    );
  } catch {
    // ignore
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
          <User size={20} className="text-sapphire-subtle" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-charcoal-deep">Fit Confidence</p>
          {hasToken ? (
            <p className="text-sm text-stone">
              Set up your{' '}
              <Link href="/profile/body-twin" className="underline text-gold-deep hover:text-gold-muted">
                Digital Body Twin
              </Link>{' '}
              to see your personalised fit analysis.
            </p>
          ) : (
            <p className="text-sm text-stone">
              <Link href="/auth/login?mode=consumer" className="underline text-gold-deep hover:text-gold-muted">
                Sign in
              </Link>{' '}
              to see your fit analysis for this piece.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductIntelligencePanel({
  isVisible,
  availabilityIntelligence,
  fitConfidence,
  climateSuitability,
  sustainabilityScore,
  fabricSimulation,
  bodyTwin,
  selectedSize,
  sizeVariants,
  onNotifyRestock
}: ProductIntelligencePanelProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-8 space-y-4 animate-slide-up">
      {/* G-SAIL™ Availability — has its own collapsible */}
      <AvailabilityIntelligence
        availability={availabilityIntelligence}
        onNotifyRestock={onNotifyRestock}
      />

      {/* Fit Confidence — only shown when real API data is available */}
      {sizeVariants.length > 0 && (
        fitConfidence ? (
          <FitConfidenceCard
            fitConfidence={fitConfidence}
            bodyTwin={bodyTwin}
            selectedSize={selectedSize}
          />
        ) : (
          <FitConfidenceEmptyState />
        )
      )}

      {/* Climate Suitability */}
      <ClimateSuitability suitability={climateSuitability} />

      {/* Sustainability Score */}
      <SustainabilityScore score={sustainabilityScore} />

      {/* Fabric Simulation */}
      {fabricSimulation && (
        <FabricSimulation simulation={fabricSimulation} />
      )}
    </div>
  );
}
