'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Palette, Sparkles, Target, MapPin, Compass } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function StyleDNAPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { fashionIdentity, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/style-dna');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading style DNA...</p>
        </div>
      </div>
    );
  }

  const confidenceLevels = {
    decisive: { label: 'Decisive', description: 'You know exactly what you want', color: 'bg-success/10 text-success' },
    guided: { label: 'Guided', description: 'You appreciate thoughtful recommendations', color: 'bg-info/10 text-info' },
    advisory: { label: 'Advisory', description: 'You prefer expert curation', color: 'bg-warning/10 text-warning' }
  };

  const confidenceInfo = fashionIdentity?.confidenceLevel
    ? confidenceLevels[fashionIdentity.confidenceLevel]
    : null;

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
              Personal Style
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Style DNA
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {!fashionIdentity ? (
          <div className="bg-white p-12 text-center">
            <Sparkles size={40} className="text-gold-soft mx-auto mb-4" />
            <h2 className="font-display text-2xl text-charcoal-deep mb-3">Discover Your Style DNA</h2>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Take our style quiz to unlock personalized recommendations tailored to your unique preferences.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
            >
              <Sparkles size={18} />
              <span className="text-sm tracking-wider uppercase">Take Style Quiz</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Occasion Preferences */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                  <Target size={18} className="text-charcoal-deep" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-charcoal-deep">Occasion Preferences</h2>
                  <p className="text-sm text-stone">Your lifestyle occasions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {fashionIdentity.occasions.map(occasion => (
                  <span
                    key={occasion}
                    className="px-4 py-2 bg-parchment text-charcoal-deep text-sm tracking-[0.05em] capitalize"
                  >
                    {occasion}
                  </span>
                ))}
              </div>
            </div>

            {/* Aesthetics */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                  <Palette size={18} className="text-charcoal-deep" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-charcoal-deep">Style Aesthetics</h2>
                  <p className="text-sm text-stone">Your design language</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {fashionIdentity.aesthetics.map(aesthetic => (
                  <span
                    key={aesthetic}
                    className="px-4 py-2 bg-gold-soft/10 text-gold-deep text-sm tracking-[0.05em] capitalize"
                  >
                    {aesthetic}
                  </span>
                ))}
              </div>
            </div>

            {/* Confidence Level */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                  <Compass size={18} className="text-charcoal-deep" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-charcoal-deep">Shopping Confidence</h2>
                  <p className="text-sm text-stone">How you like to shop</p>
                </div>
              </div>
              {confidenceInfo && (
                <div className={`inline-flex items-center gap-3 px-5 py-3 ${confidenceInfo.color}`}>
                  <span className="text-sm font-medium">{confidenceInfo.label}</span>
                  <span className="text-xs opacity-80">— {confidenceInfo.description}</span>
                </div>
              )}
            </div>

            {/* Budget Range */}
            {fashionIdentity.budgetRange && (
              <div className="bg-white p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                    <Sparkles size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Budget Range</h2>
                    <p className="text-sm text-stone">Your comfort zone</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Minimum</p>
                    <p className="font-display text-2xl text-charcoal-deep">
                      &euro;{fashionIdentity.budgetRange.min.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-sand" />
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Maximum</p>
                    <p className="font-display text-2xl text-charcoal-deep">
                      &euro;{fashionIdentity.budgetRange.max.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                  <MapPin size={18} className="text-charcoal-deep" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-charcoal-deep">Lifestyle Locations</h2>
                  <p className="text-sm text-stone">Where you wear your style</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-sand">
                  <span className="text-sm text-stone">Primary Location</span>
                  <span className="text-sm font-medium text-charcoal-deep">{fashionIdentity.primaryLocation}</span>
                </div>
                {fashionIdentity.travelDestinations.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-3">Travel Destinations</p>
                    <div className="flex flex-wrap gap-2">
                      {fashionIdentity.travelDestinations.map(dest => (
                        <span key={dest} className="px-3 py-1.5 bg-parchment text-sm text-charcoal-deep">
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Retake Quiz */}
            <div className="text-center pt-4">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-3 px-6 py-3 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-colors"
              >
                <Sparkles size={16} />
                <span className="text-sm tracking-wider uppercase">Retake Style Quiz</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
