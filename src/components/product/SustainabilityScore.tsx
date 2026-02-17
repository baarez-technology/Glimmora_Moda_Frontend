'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Droplets, Factory, Recycle, Truck, Award, ChevronDown, ExternalLink } from 'lucide-react';
import { SustainabilityScore as SustainabilityScoreType } from '@/types';

interface SustainabilityScoreProps {
  score: SustainabilityScoreType;
  className?: string;
}

const categoryConfig = {
  materials: { icon: <Leaf className="w-4 h-4" />, label: 'Materials', color: 'emerald' },
  production: { icon: <Factory className="w-4 h-4" />, label: 'Production', color: 'blue' },
  packaging: { icon: <Recycle className="w-4 h-4" />, label: 'Packaging', color: 'amber' },
  transport: { icon: <Truck className="w-4 h-4" />, label: 'Transport', color: 'purple' },
  waterUsage: { icon: <Droplets className="w-4 h-4" />, label: 'Water Usage', color: 'sky' }
};

function ScoreRing({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { ring: 40, stroke: 4, text: 'text-sm' },
    md: { ring: 80, stroke: 6, text: 'text-2xl' },
    lg: { ring: 120, stroke: 8, text: 'text-4xl' }
  };

  const config = sizes[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#C9A962';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={config.ring} height={config.ring} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={config.stroke}
        />
        {/* Score circle */}
        <motion.circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className={`absolute ${config.text} font-display text-charcoal-deep`}>
        {score}
      </span>
    </div>
  );
}

function CategoryScore({
  category,
  score,
  description
}: {
  category: keyof typeof categoryConfig;
  score: number;
  description?: string;
}) {
  const config = categoryConfig[category];

  return (
    <div className="flex items-center gap-3 p-3 bg-stone/5 rounded-lg">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${config.color}-100 text-${config.color}-600`}
        style={{
          backgroundColor: `var(--${config.color}-100, #ecfdf5)`,
          color: `var(--${config.color}-600, #059669)`
        }}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-charcoal-deep">{config.label}</span>
          <span className="text-sm text-charcoal-deep">{score}/100</span>
        </div>
        <div className="h-1.5 bg-stone/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
        {description && (
          <p className="text-xs text-stone/60 mt-1 truncate">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function SustainabilityScore({
  score,
  className = ''
}: SustainabilityScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGrade = () => {
    if (score.overallScore >= 90) return { grade: 'A+', label: 'Exceptional', color: 'emerald' };
    if (score.overallScore >= 80) return { grade: 'A', label: 'Excellent', color: 'emerald' };
    if (score.overallScore >= 70) return { grade: 'B', label: 'Good', color: 'green' };
    if (score.overallScore >= 60) return { grade: 'C', label: 'Average', color: 'amber' };
    return { grade: 'D', label: 'Needs Improvement', color: 'red' };
  };

  const gradeInfo = getGrade();

  return (
    <div className={`bg-white rounded-xl border border-stone/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone/10 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-4">
          <ScoreRing score={score.overallScore} size="md" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-charcoal-deep">Sustainability Score</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${gradeInfo.color}-100 text-${gradeInfo.color}-700`}
                style={{
                  backgroundColor: gradeInfo.color === 'emerald' ? '#d1fae5' : gradeInfo.color === 'amber' ? '#fef3c7' : '#fee2e2',
                  color: gradeInfo.color === 'emerald' ? '#047857' : gradeInfo.color === 'amber' ? '#b45309' : '#b91c1c'
                }}
              >
                Grade {gradeInfo.grade}
              </span>
            </div>
            <p className="text-sm text-stone/70 mt-1">{gradeInfo.label} environmental performance</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-stone/10">
        <div className="text-center">
          <Leaf className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-display text-charcoal-deep">{score.carbonFootprint}</p>
          <p className="text-[10px] text-stone/50 uppercase tracking-wider">kg CO₂</p>
        </div>
        <div className="text-center">
          <Droplets className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-lg font-display text-charcoal-deep">{score.waterUsage}</p>
          <p className="text-[10px] text-stone/50 uppercase tracking-wider">L Water</p>
        </div>
        <div className="text-center">
          <Recycle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-display text-charcoal-deep">{score.recyclability}%</p>
          <p className="text-[10px] text-stone/50 uppercase tracking-wider">Recyclable</p>
        </div>
      </div>

      {/* Certifications */}
      {score.certifications && score.certifications.length > 0 && (
        <div className="px-5 py-4 border-b border-stone/10">
          <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </h4>
          <div className="flex flex-wrap gap-2">
            {score.certifications.map((cert, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 flex items-center justify-between text-sm text-stone/70 hover:bg-stone/5 transition-colors"
      >
        <span>Detailed Breakdown</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              <CategoryScore
                category="materials"
                score={score.breakdown.materials}
                description="Sustainable and ethically sourced materials"
              />
              <CategoryScore
                category="production"
                score={score.breakdown.production}
                description="Ethical manufacturing practices"
              />
              <CategoryScore
                category="packaging"
                score={score.breakdown.packaging}
                description="Eco-friendly packaging materials"
              />
              <CategoryScore
                category="transport"
                score={score.breakdown.transport}
                description="Carbon-efficient logistics"
              />
            </div>

            {/* Source Link */}
            <div className="px-5 pb-5">
              <a
                href="#"
                className="flex items-center gap-2 text-xs text-gold-soft hover:underline"
              >
                <span>View full sustainability report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
