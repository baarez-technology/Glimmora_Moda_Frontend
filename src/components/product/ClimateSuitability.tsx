'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Sun, Wind, Snowflake, CloudRain, Cloud, Home, TreePine, Activity, ChevronDown } from 'lucide-react';
import { ClimateSuitability as ClimateSuitabilityType } from '@/types';

interface ClimateSuitabilityProps {
  suitability: ClimateSuitabilityType;
  className?: string;
}

const climateIcons: Record<string, React.ReactNode> = {
  tropical: <Sun className="w-4 h-4" />,
  temperate: <CloudRain className="w-4 h-4" />,
  continental: <Wind className="w-4 h-4" />,
  arid: <Sun className="w-4 h-4" />,
  polar: <Snowflake className="w-4 h-4" />
};

const climateLabels: Record<string, string> = {
  tropical: 'Tropical',
  temperate: 'Temperate',
  continental: 'Continental',
  arid: 'Arid/Desert',
  polar: 'Cold/Polar'
};

const weatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4" />,
  cloudy: <Cloud className="w-4 h-4" />,
  rainy: <CloudRain className="w-4 h-4" />,
  snowy: <Snowflake className="w-4 h-4" />,
  windy: <Wind className="w-4 h-4" />
};

const seasonEmojis: Record<string, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️'
};

const humidityLabels: Record<string, string> = {
  low: 'Low Humidity',
  medium: 'Medium Humidity',
  high: 'High Humidity',
  any: 'Any Humidity'
};

export default function ClimateSuitability({
  suitability,
  className = ''
}: ClimateSuitabilityProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate a simple overall suitability based on flexibility
  const flexibilityScore = Math.round(
    ((suitability.climates.length / 5) * 40) +
    ((suitability.seasons.length / 4) * 30) +
    ((suitability.weather.length / 5) * 30)
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header — clickable toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">Climate Suitability</p>
            <p className="text-sm text-stone">Weather performance analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            flexibilityScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
            flexibilityScore >= 40 ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {flexibilityScore >= 70 ? 'Versatile' : flexibilityScore >= 40 ? 'Moderate' : 'Specific'}
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
          {/* Temperature Range */}
          <div className="p-5 border-b border-stone/10">
            <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-3">Temperature Range</h4>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-charcoal-deep">{suitability.temperatureRange.min}°C</span>
              </div>
              <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-charcoal-deep rounded-full"
                  style={{
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-charcoal-deep">{suitability.temperatureRange.max}°C</span>
              </div>
            </div>
            <p className="text-xs text-stone/60 text-center">
              Suitable for {suitability.temperatureRange.min}°C to {suitability.temperatureRange.max}°C
            </p>
          </div>

          {/* Weather & Humidity */}
          <div className="p-5 border-b border-stone/10">
            <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-3">Weather Conditions</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {suitability.weather.map((weather) => (
                <div
                  key={weather}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-xs"
                >
                  {weatherIcons[weather]}
                  <span className="capitalize">{weather}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone/60">
              <Droplets className="w-4 h-4" />
              <span>{humidityLabels[suitability.humidity]}</span>
            </div>
          </div>

          {/* Suitable Climates */}
          <div className="p-5 border-b border-stone/10">
            <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-3">Best Climates</h4>
            <div className="flex flex-wrap gap-2">
              {suitability.climates.map((climate) => (
                <div
                  key={climate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
                >
                  {climateIcons[climate]}
                  <span>{climateLabels[climate] || climate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings & Activity */}
          <div className="p-5 border-b border-stone/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-2">Setting</h4>
                <div className="flex items-center gap-2 text-sm text-charcoal-deep">
                  {suitability.indoorOutdoor === 'indoor' ? (
                    <><Home className="w-4 h-4 text-stone/60" /> Indoor</>
                  ) : suitability.indoorOutdoor === 'outdoor' ? (
                    <><TreePine className="w-4 h-4 text-stone/60" /> Outdoor</>
                  ) : (
                    <><Home className="w-4 h-4 text-stone/60" /> Indoor & Outdoor</>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs tracking-wider uppercase text-stone/50 mb-2">Activity Level</h4>
                <div className="flex items-center gap-2 text-sm text-charcoal-deep">
                  <Activity className="w-4 h-4 text-stone/60" />
                  <span className="capitalize">{suitability.activityLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seasonal Notes */}
          <div className="px-5 py-4 bg-stone/5">
            <div className="flex items-start gap-3">
              <div className="flex gap-1 mt-0.5">
                {suitability.seasons.map(season => (
                  <span key={season}>{seasonEmojis[season]}</span>
                ))}
              </div>
              <p className="text-xs text-stone/70">
                Best worn in {suitability.seasons.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
