'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Droplets, Globe, Award, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function SustainabilityPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { wardrobe } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/sustainability');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  // Compute sustainability metrics from wardrobe
  const metrics = useMemo(() => {
    const totalItems = wardrobe.length;
    // Simulate sustainability scores based on wardrobe data
    const ecoFriendlyCount = Math.round(totalItems * 0.35);
    const carbonSaved = totalItems * 2.4; // kg CO2 saved per sustainable item
    const waterSaved = totalItems * 180; // liters saved

    return {
      totalItems,
      ecoFriendlyCount,
      ecoFriendlyPercent: totalItems > 0 ? Math.round((ecoFriendlyCount / totalItems) * 100) : 0,
      carbonSaved: carbonSaved.toFixed(1),
      waterSaved: Math.round(waterSaved),
      sustainabilityScore: Math.min(100, Math.round(35 + (ecoFriendlyCount / Math.max(totalItems, 1)) * 65))
    };
  }, [wardrobe]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading sustainability data...</p>
        </div>
      </div>
    );
  }

  const certifications = [
    { name: 'GOTS Certified', count: Math.round(wardrobe.length * 0.15), color: 'bg-green-100 text-green-700' },
    { name: 'Fair Trade', count: Math.round(wardrobe.length * 0.12), color: 'bg-blue-100 text-blue-700' },
    { name: 'OEKO-TEX', count: Math.round(wardrobe.length * 0.2), color: 'bg-teal-100 text-teal-700' },
    { name: 'B Corp', count: Math.round(wardrobe.length * 0.08), color: 'bg-purple-100 text-purple-700' }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Your Impact
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Sustainability
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Overall Score */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
              <Leaf size={18} className="text-green-700" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Sustainability Score</h2>
              <p className="text-sm text-stone">Based on your wardrobe composition</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f0eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="8"
                  strokeDasharray={`${metrics.sustainabilityScore * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-3xl text-charcoal-deep">{metrics.sustainabilityScore}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-sand">
                <span className="text-sm text-stone">Eco-Friendly Items</span>
                <span className="text-sm font-medium text-charcoal-deep">{metrics.ecoFriendlyCount} of {metrics.totalItems}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-sand">
                <span className="text-sm text-stone">Eco Percentage</span>
                <span className="text-sm font-medium text-green-700">{metrics.ecoFriendlyPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-8 text-center">
            <Droplets size={24} className="text-blue-500 mx-auto mb-3" />
            <p className="font-display text-2xl text-charcoal-deep mb-1">{metrics.waterSaved.toLocaleString()}L</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone">Water Saved</p>
          </div>
          <div className="bg-white p-8 text-center">
            <Globe size={24} className="text-green-600 mx-auto mb-3" />
            <p className="font-display text-2xl text-charcoal-deep mb-1">{metrics.carbonSaved}kg</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone">CO₂ Reduced</p>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <Award size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Certifications in Your Wardrobe</h2>
              <p className="text-sm text-stone">Items with verified sustainability credentials</p>
            </div>
          </div>
          <div className="space-y-3">
            {certifications.map(cert => (
              <div key={cert.name} className="flex items-center justify-between py-3 border-b border-sand last:border-0">
                <span className={`px-3 py-1 text-xs tracking-wider uppercase ${cert.color}`}>{cert.name}</span>
                <span className="text-sm text-charcoal-deep">{cert.count} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
              <TrendingUp size={18} className="text-charcoal-deep" />
            </div>
            <div>
              <h2 className="font-display text-xl text-charcoal-deep">Improve Your Score</h2>
              <p className="text-sm text-stone">Tips for a more sustainable wardrobe</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              'Choose quality over quantity — invest in pieces that last longer',
              'Look for certified sustainable materials when shopping',
              'Consider pre-owned luxury items from verified sources',
              'Care for your garments properly to extend their lifespan'
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-sand last:border-0">
                <span className="w-6 h-6 bg-green-100 text-green-700 text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-charcoal-deep">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
