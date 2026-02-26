'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Layers, Scale, Thermometer, Droplets, Sparkles, ChevronDown } from 'lucide-react';
import { FabricSimulation as FabricSimulationType } from '@/types';

interface FabricSimulationProps {
  simulation: FabricSimulationType;
  className?: string;
}

const MetricBar = ({ value, max = 5, color = 'gold-soft' }: { value: number; max?: number; color?: string }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <motion.div
        key={i}
        className={`h-1.5 w-6 rounded-full ${i < value ? `bg-${color}` : 'bg-stone/20'}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: i * 0.1, duration: 0.3 }}
        style={{ backgroundColor: i < value ? '#C9A962' : undefined }}
      />
    ))}
  </div>
);

const fabricMovementAnimation = {
  minimal: {
    rotate: [0, 1, 0, -1, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
  },
  moderate: {
    rotate: [0, 3, 0, -3, 0],
    y: [0, -2, 0, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
  },
  flowing: {
    rotate: [0, 5, 0, -5, 0],
    y: [0, -5, 2, -3, 0],
    scaleY: [1, 1.02, 1, 1.02, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }
  }
};

export default function FabricSimulation({
  simulation,
  className = ''
}: FabricSimulationProps) {
  const [expanded, setExpanded] = useState(false);
  const [activePreview, setActivePreview] = useState<'drape' | 'structure' | 'movement'>('drape');

  const previewContent = {
    drape: {
      icon: <Layers className="w-5 h-5" />,
      title: 'Drape',
      description: simulation.drapeLevel >= 4
        ? 'Elegant, fluid drape that flows with movement'
        : simulation.drapeLevel >= 3
        ? 'Balanced drape with natural fall'
        : 'Structured with minimal drape'
    },
    structure: {
      icon: <Scale className="w-5 h-5" />,
      title: 'Structure',
      description: simulation.structureLevel >= 4
        ? 'Highly structured, maintains shape beautifully'
        : simulation.structureLevel >= 3
        ? 'Moderate structure with some flexibility'
        : 'Soft and unstructured, moves freely'
    },
    movement: {
      icon: <Wind className="w-5 h-5" />,
      title: 'Movement',
      description: simulation.movement === 'flowing'
        ? 'Graceful, continuous movement with every step'
        : simulation.movement === 'moderate'
        ? 'Natural movement that follows your motions'
        : 'Minimal movement, stays in place'
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header — clickable toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-soft/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gold-soft" />
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">Fabric Intelligence</p>
            <p className="text-sm text-stone">IV™ Material Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gold-soft/15 text-gold-deep capitalize">
            {simulation.weight}
          </span>
          <ChevronDown
            size={20}
            className={`text-greige transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-sand">
          {/* Animated Preview */}
          <div className="relative h-48 bg-gradient-to-b from-stone/5 to-stone/10 flex items-center justify-center overflow-hidden">
            <motion.div
              className="relative"
              animate={fabricMovementAnimation[simulation.movement]}
            >
              {/* Abstract fabric visualization */}
              <svg viewBox="0 0 120 100" className="w-40 h-32">
                <defs>
                  <linearGradient id="fabricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C9A962" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#E8E2DB" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#C9A962" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Fabric shape based on drape level */}
                <motion.path
                  d={simulation.drapeLevel >= 4
                    ? "M10,10 Q30,5 60,10 Q90,15 110,10 L110,85 Q90,95 60,90 Q30,85 10,90 Z"
                    : simulation.drapeLevel >= 3
                    ? "M10,10 Q35,8 60,10 Q85,12 110,10 L110,85 Q85,88 60,85 Q35,82 10,85 Z"
                    : "M10,10 L110,10 L110,85 L10,85 Z"}
                  fill="url(#fabricGrad)"
                  stroke="#C9A962"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />

                {/* Fold lines based on structure */}
                {simulation.structureLevel <= 3 && (
                  <>
                    <motion.line
                      x1="30" y1="20" x2="35" y2="80"
                      stroke="#8B8680"
                      strokeWidth="0.5"
                      strokeDasharray="3,3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ delay: 0.5 }}
                    />
                    <motion.line
                      x1="80" y1="20" x2="85" y2="80"
                      stroke="#8B8680"
                      strokeWidth="0.5"
                      strokeDasharray="3,3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ delay: 0.6 }}
                    />
                  </>
                )}
              </svg>
            </motion.div>

            {/* Preview type indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {(['drape', 'structure', 'movement'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActivePreview(type)}
                  className={`px-3 py-1 text-xs tracking-wider uppercase rounded-full transition-all ${
                    activePreview === type
                      ? 'bg-charcoal-deep text-ivory-cream'
                      : 'bg-white/80 text-charcoal-deep hover:bg-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="p-5 space-y-4">
            {/* Primary Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Layers className="w-4 h-4 text-stone/60" />
                </div>
                <MetricBar value={simulation.drapeLevel} />
                <p className="text-[10px] tracking-wider uppercase text-stone/70 mt-1">Drape</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Scale className="w-4 h-4 text-stone/60" />
                </div>
                <MetricBar value={simulation.structureLevel} />
                <p className="text-[10px] tracking-wider uppercase text-stone/70 mt-1">Structure</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Wind className="w-4 h-4 text-stone/60" />
                </div>
                <MetricBar value={simulation.movement === 'flowing' ? 5 : simulation.movement === 'moderate' ? 3 : 1} />
                <p className="text-[10px] tracking-wider uppercase text-stone/70 mt-1">Movement</p>
              </div>
            </div>

            {/* Secondary Attributes */}
            <div className="pt-4 border-t border-stone/10 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 bg-stone/5 rounded-lg">
                <Thermometer className="w-4 h-4 text-stone/60" />
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-stone/50">Weight</p>
                  <p className="text-xs font-medium text-charcoal-deep capitalize">{simulation.weight}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-stone/5 rounded-lg">
                <Droplets className="w-4 h-4 text-stone/60" />
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-stone/50">Breathability</p>
                  <p className="text-xs font-medium text-charcoal-deep capitalize">{simulation.breathability}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-stone/10">
              <div className="flex items-center gap-2 mb-2">
                {previewContent[activePreview].icon}
                <h4 className="text-sm font-medium text-charcoal-deep">{previewContent[activePreview].title}</h4>
              </div>
              <p className="text-xs text-stone/70 leading-relaxed">
                {previewContent[activePreview].description}
              </p>
            </div>

            {/* Texture & Care */}
            <div className="flex items-center justify-between pt-3 border-t border-stone/10 text-xs">
              <span className="text-stone/60">Texture: <span className="text-charcoal-deep">{simulation.texture}</span></span>
              <span className="text-stone/60">Care: <span className="text-charcoal-deep capitalize">{simulation.careComplexity}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
