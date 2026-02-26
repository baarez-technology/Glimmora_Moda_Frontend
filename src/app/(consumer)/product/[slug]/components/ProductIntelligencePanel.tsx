'use client';

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
  fitConfidence: FitConfidence;
  climateSuitability: ClimateSuitabilityType;
  sustainabilityScore: SustainabilityScoreType;
  fabricSimulation?: FabricSimulationType;
  bodyTwin?: DigitalBodyTwin;
  selectedSize: string | null;
  sizeVariants: ProductVariant[];
  onNotifyRestock: () => void;
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

      {/* Fit Confidence — has its own collapsible */}
      {sizeVariants.length > 0 && (
        <FitConfidenceCard
          fitConfidence={fitConfidence}
          bodyTwin={bodyTwin}
          selectedSize={selectedSize}
        />
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
