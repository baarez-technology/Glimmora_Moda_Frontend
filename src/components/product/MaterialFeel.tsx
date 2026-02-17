'use client';

import { motion } from 'framer-motion';
import { Hand, Feather, Thermometer, Heart, Clock, Sparkles } from 'lucide-react';
import { MaterialFeel as MaterialFeelType } from '@/types';

interface MaterialFeelProps {
  material: MaterialFeelType;
  className?: string;
}

const textureDescriptions: Record<string, { icon: React.ReactNode; description: string }> = {
  smooth: { icon: '🪞', description: 'Glides effortlessly against skin' },
  soft: { icon: '☁️', description: 'Plush and comforting to the touch' },
  crisp: { icon: '📄', description: 'Clean, structured feel with subtle stiffness' },
  textured: { icon: '🌊', description: 'Interesting surface with depth and dimension' },
  silky: { icon: '✨', description: 'Luxuriously fluid with a gentle sheen' },
  rough: { icon: '🪨', description: 'Natural, rustic character' },
  fuzzy: { icon: '🧸', description: 'Soft, cozy surface texture' },
  cool: { icon: '❄️', description: 'Refreshingly cool against skin' }
};

const weightLabels: Record<string, string> = {
  featherlight: 'Barely there',
  light: 'Light and airy',
  medium: 'Balanced weight',
  substantial: 'Noticeable presence',
  heavy: 'Luxuriously weighty'
};

const temperatureLabels: Record<string, string> = {
  cooling: 'Keeps you cool',
  neutral: 'Temperature neutral',
  warming: 'Provides warmth',
  insulating: 'Excellent insulation'
};

export default function MaterialFeel({
  material,
  className = ''
}: MaterialFeelProps) {
  const textureInfo = textureDescriptions[material.texture] || textureDescriptions.smooth;

  return (
    <div className={`bg-white rounded-xl border border-stone/20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone/10 bg-gradient-to-r from-amber-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Hand className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-charcoal-deep">Material Experience</h3>
            <p className="text-xs text-stone/70">How it feels in real life</p>
          </div>
        </div>
      </div>

      {/* Texture Highlight */}
      <div className="p-5 bg-gradient-to-br from-stone/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{textureInfo.icon}</div>
          <div>
            <p className="text-xs tracking-wider uppercase text-stone/50 mb-1">Texture</p>
            <h4 className="font-medium text-charcoal-deep capitalize mb-1">{material.texture}</h4>
            <p className="text-sm text-stone/70">{textureInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="p-5 grid grid-cols-2 gap-4">
        {/* Weight */}
        <div className="p-4 bg-stone/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Feather className="w-4 h-4 text-stone/60" />
            <span className="text-xs tracking-wider uppercase text-stone/50">Weight</span>
          </div>
          <p className="font-medium text-charcoal-deep capitalize">{material.weight}</p>
          <p className="text-xs text-stone/60 mt-1">
            {weightLabels[material.weight] || 'Balanced'}
          </p>
        </div>

        {/* Temperature */}
        <div className="p-4 bg-stone/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-stone/60" />
            <span className="text-xs tracking-wider uppercase text-stone/50">Temperature</span>
          </div>
          <p className="font-medium text-charcoal-deep capitalize">{material.temperature}</p>
          <p className="text-xs text-stone/60 mt-1">
            {temperatureLabels[material.temperature] || 'Neutral feel'}
          </p>
        </div>

        {/* Comfort */}
        <div className="p-4 bg-stone/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-stone/60" />
            <span className="text-xs tracking-wider uppercase text-stone/50">Comfort</span>
          </div>
          <p className="font-medium text-charcoal-deep">{material.comfort}</p>
        </div>

        {/* Aging */}
        <div className="p-4 bg-stone/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-stone/60" />
            <span className="text-xs tracking-wider uppercase text-stone/50">Ages</span>
          </div>
          <p className="font-medium text-charcoal-deep capitalize">{material.aging}</p>
          <p className="text-xs text-stone/60 mt-1">
            {material.aging === 'beautifully' ? 'Develops character over time' :
             material.aging === 'gracefully' ? 'Maintains quality with care' :
             'Requires regular maintenance'}
          </p>
        </div>
      </div>

      {/* AGI Description */}
      {material.agiDescription && (
        <div className="mx-5 mb-5 p-4 bg-gold-soft/10 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold-soft/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-gold-soft" />
            </div>
            <div>
              <p className="text-xs text-gold-soft font-medium mb-1">AGI Material Intelligence</p>
              <p className="text-sm text-stone/70 leading-relaxed italic">
                "{material.agiDescription}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sensory Highlights */}
      {material.sensoryHighlights && material.sensoryHighlights.length > 0 && (
        <div className="px-5 py-4 border-t border-stone/10 bg-stone/5">
          <p className="text-xs text-stone/50 mb-2">Sensory Highlights</p>
          <div className="flex flex-wrap gap-2">
            {material.sensoryHighlights.map((highlight, i) => (
              <span key={i} className="px-2 py-1 bg-white rounded-full text-xs text-charcoal-deep">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
