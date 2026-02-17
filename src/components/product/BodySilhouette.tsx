'use client';

import { DigitalBodyTwin } from '@/types';

interface BodySilhouetteProps {
  silhouette: DigitalBodyTwin['silhouette'];
  viewAngle?: 'front' | 'side' | 'back';
  className?: string;
  showGuides?: boolean;
}

// SVG silhouettes for different body types
const silhouettePaths: Record<DigitalBodyTwin['silhouette'], { front: string; side: string; back: string }> = {
  petite: {
    front: `M50,10 C55,10 58,15 58,22 C58,28 55,32 50,32 C45,32 42,28 42,22 C42,15 45,10 50,10
            M50,32 L50,38 M38,45 L50,38 L62,45
            M50,38 Q48,55 46,75 Q44,90 45,110 L43,145 L40,180
            M50,38 Q52,55 54,75 Q56,90 55,110 L57,145 L60,180
            M46,75 Q40,78 35,82 Q30,85 28,90
            M54,75 Q60,78 65,82 Q70,85 72,90`,
    side: `M50,10 C55,10 58,15 58,22 C58,28 55,32 50,32
           M50,32 Q52,40 52,50 Q53,70 52,90 Q50,120 48,150 Q46,165 45,180
           M52,50 Q58,55 62,60 Q65,65 64,72 Q60,75 55,78
           M52,90 Q48,95 45,100 Q43,110 44,120`,
    back: `M50,10 C55,10 58,15 58,22 C58,28 55,32 50,32
           M50,32 L50,38 M38,45 L50,38 L62,45
           M50,38 Q48,55 46,75 Q44,90 45,110 L43,145 L40,180
           M50,38 Q52,55 54,75 Q56,90 55,110 L57,145 L60,180`
  },
  average: {
    front: `M50,8 C56,8 60,14 60,22 C60,30 56,35 50,35 C44,35 40,30 40,22 C40,14 44,8 50,8
            M50,35 L50,42 M35,50 L50,42 L65,50
            M50,42 Q47,60 44,80 Q41,100 42,120 L40,150 L38,185
            M50,42 Q53,60 56,80 Q59,100 58,120 L60,150 L62,185
            M44,80 Q36,84 30,88 Q24,92 22,98
            M56,80 Q64,84 70,88 Q76,92 78,98`,
    side: `M50,8 C56,8 60,14 60,22 C60,30 56,35 50,35
           M50,35 Q53,45 54,55 Q55,75 54,95 Q52,125 50,155 Q48,170 46,185
           M54,55 Q62,62 68,68 Q72,74 70,82 Q64,86 57,90
           M54,95 Q50,102 47,110 Q44,125 45,140`,
    back: `M50,8 C56,8 60,14 60,22 C60,30 56,35 50,35
           M50,35 L50,42 M35,50 L50,42 L65,50
           M50,42 Q47,60 44,80 Q41,100 42,120 L40,150 L38,185
           M50,42 Q53,60 56,80 Q59,100 58,120 L60,150 L62,185`
  },
  tall: {
    front: `M50,5 C57,5 62,12 62,22 C62,32 57,38 50,38 C43,38 38,32 38,22 C38,12 43,5 50,5
            M50,38 L50,48 M32,58 L50,48 L68,58
            M50,48 Q46,70 42,95 Q38,120 40,145 L38,170 L35,200
            M50,48 Q54,70 58,95 Q62,120 60,145 L62,170 L65,200
            M42,95 Q32,100 25,106 Q18,112 16,120
            M58,95 Q68,100 75,106 Q82,112 84,120`,
    side: `M50,5 C57,5 62,12 62,22 C62,32 57,38 50,38
           M50,38 Q54,52 56,68 Q58,90 56,115 Q54,145 52,175 Q50,188 48,200
           M56,68 Q66,76 74,84 Q80,92 78,102 Q70,108 60,115
           M56,115 Q52,125 48,138 Q44,155 46,175`,
    back: `M50,5 C57,5 62,12 62,22 C62,32 57,38 50,38
           M50,38 L50,48 M32,58 L50,48 L68,58
           M50,48 Q46,70 42,95 Q38,120 40,145 L38,170 L35,200
           M50,48 Q54,70 58,95 Q62,120 60,145 L62,170 L65,200`
  },
  curvy: {
    front: `M50,8 C56,8 60,14 60,22 C60,30 56,35 50,35 C44,35 40,30 40,22 C40,14 44,8 50,8
            M50,35 L50,42 M32,52 L50,42 L68,52
            M50,42 Q45,58 40,78 Q35,98 38,118 L36,148 L34,185
            M50,42 Q55,58 60,78 Q65,98 62,118 L64,148 L66,185
            M40,78 Q30,84 24,92 Q18,100 18,110
            M60,78 Q70,84 76,92 Q82,100 82,110
            M40,78 Q42,88 45,98 Q48,108 50,115 Q52,108 55,98 Q58,88 60,78`,
    side: `M50,8 C56,8 60,14 60,22 C60,30 56,35 50,35
           M50,35 Q55,48 58,62 Q62,80 60,100 Q56,130 52,160 Q48,175 46,185
           M58,62 Q68,70 76,80 Q82,90 80,102 Q72,110 62,118
           M60,100 Q56,112 52,126 Q48,145 50,165`,
    back: `M50,8 C56,8 60,14 60,22 C60,30 56,35 50,35
           M50,35 L50,42 M32,52 L50,42 L68,52
           M50,42 Q45,58 40,78 Q35,98 38,118 L36,148 L34,185
           M50,42 Q55,58 60,78 Q65,98 62,118 L64,148 L66,185`
  },
  athletic: {
    front: `M50,8 C57,8 62,14 62,23 C62,31 57,36 50,36 C43,36 38,31 38,23 C38,14 43,8 50,8
            M50,36 L50,44 M30,54 L50,44 L70,54
            M50,44 Q46,62 43,82 Q40,102 42,122 L40,152 L38,188
            M50,44 Q54,62 57,82 Q60,102 58,122 L60,152 L62,188
            M43,82 Q34,86 28,92 Q22,98 20,106
            M57,82 Q66,86 72,92 Q78,98 80,106
            M43,58 Q38,62 35,66 M57,58 Q62,62 65,66`,
    side: `M50,8 C57,8 62,14 62,23 C62,31 57,36 50,36
           M50,36 Q54,50 56,66 Q58,88 56,110 Q54,142 52,172 Q50,182 48,188
           M56,66 Q66,74 74,82 Q80,92 78,104 Q70,112 60,120
           M56,110 Q52,122 48,136 Q44,155 46,175`,
    back: `M50,8 C57,8 62,14 62,23 C62,31 57,36 50,36
           M50,36 L50,44 M30,54 L50,44 L70,54
           M50,44 Q46,62 43,82 Q40,102 42,122 L40,152 L38,188
           M50,44 Q54,62 57,82 Q60,102 58,122 L60,152 L62,188`
  }
};

export default function BodySilhouette({
  silhouette,
  viewAngle = 'front',
  className = '',
  showGuides = false
}: BodySilhouetteProps) {
  const paths = silhouettePaths[silhouette] || silhouettePaths.average;
  const path = paths[viewAngle];

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 200"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8E2DB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D4CBBF" stopOpacity="0.5" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Silhouette path */}
        <path
          d={path}
          fill="none"
          stroke="#8B8680"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
          className="transition-all duration-500"
        />

        {/* Guide lines for product placement */}
        {showGuides && (
          <g className="opacity-30">
            {/* Horizontal guides */}
            <line x1="10" y1="40" x2="90" y2="40" stroke="#C9A962" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="10" y1="80" x2="90" y2="80" stroke="#C9A962" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="10" y1="120" x2="90" y2="120" stroke="#C9A962" strokeWidth="0.5" strokeDasharray="2,2" />
            {/* Vertical center guide */}
            <line x1="50" y1="5" x2="50" y2="195" stroke="#C9A962" strokeWidth="0.5" strokeDasharray="2,2" />
          </g>
        )}
      </svg>

      {/* Silhouette label */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="text-[9px] tracking-[0.15em] uppercase text-stone/60">
          {silhouette} · {viewAngle}
        </span>
      </div>
    </div>
  );
}
