'use client';

import { useState } from 'react';
import { ChevronDown, Thermometer, Leaf, Sparkles } from 'lucide-react';
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

/** Generic collapsible wrapper for intelligence sections */
function CollapsibleSection({ title, subtitle, icon, children }: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
            {icon}
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">{title}</p>
            <p className="text-sm text-stone">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-greige transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-sand pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

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

      {/* Climate Suitability — wrapped in collapsible */}
      <CollapsibleSection
        title="Climate Suitability"
        subtitle="Weather performance analysis"
        icon={<Thermometer size={20} className="text-sky-600" />}
      >
        <ClimateSuitability suitability={climateSuitability} className="border-0 shadow-none rounded-none" />
      </CollapsibleSection>

      {/* Sustainability Score — wrapped in collapsible */}
      <CollapsibleSection
        title="Sustainability"
        subtitle="Environmental impact score"
        icon={<Leaf size={20} className="text-emerald-600" />}
      >
        <SustainabilityScore score={sustainabilityScore} className="border-0 shadow-none rounded-none" />
      </CollapsibleSection>

      {/* Fabric Simulation — wrapped in collapsible */}
      {fabricSimulation && (
        <CollapsibleSection
          title="Fabric Intelligence"
          subtitle="Material simulation"
          icon={<Sparkles size={20} className="text-gold-soft" />}
        >
          <FabricSimulation simulation={fabricSimulation} className="border-0 shadow-none rounded-none" />
        </CollapsibleSection>
      )}
    </div>
  );
}
