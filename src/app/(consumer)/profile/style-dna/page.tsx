'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Briefcase, Users, Sun, Star, Plane, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { setUserContext, getStoredUserToken } from '@/services/auth.service';
import { invalidateRecommendationsCache } from '@/services/recommendation.service';
import { getCurrencySymbol } from '@/lib/currency';

type Step = 'occasions' | 'aesthetics' | 'budget' | 'complete';

const STEPS: Step[] = ['occasions', 'aesthetics', 'budget', 'complete'];

const occasionOptions = [
  { id: 'professional', label: 'Professional', desc: 'Business meetings & work', icon: Briefcase },
  { id: 'social', label: 'Social Events', desc: 'Dinners & gatherings', icon: Users },
  { id: 'casual', label: 'Casual Daily', desc: 'Everyday elegance', icon: Sun },
  { id: 'formal', label: 'Formal', desc: 'Galas & black tie', icon: Star },
  { id: 'travel', label: 'Travel', desc: 'Refined journeys', icon: Plane },
  { id: 'art', label: 'Art & Culture', desc: 'Galleries & theater', icon: Palette },
];

const aestheticOptions = [
  { id: 'minimal', label: 'Minimal & Structured', desc: 'Clean lines, refined simplicity' },
  { id: 'classic', label: 'Classic & Timeless', desc: 'Enduring elegance, heritage pieces' },
  { id: 'artistic', label: 'Artistic & Expressive', desc: 'Bold statements, creative vision' },
  { id: 'contemporary', label: 'Bold & Contemporary', desc: 'Modern edge, fashion-forward' },
];

export default function StyleDNAPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { fashionIdentity, updateFashionIdentity, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<Step>('occasions');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selections, setSelections] = useState({
    occasions: [] as string[],
    aesthetics: [] as string[],
    budgetRange: undefined as { min: number; max: number } | undefined,
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/style-dna');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Pre-fill from existing identity
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    const validOccasionIds = occasionOptions.map(o => o.id);
    const validAestheticIds = aestheticOptions.map(a => a.id);
    setSelections({
      occasions: (fashionIdentity?.occasions || []).filter(id => validOccasionIds.includes(id)),
      aesthetics: (fashionIdentity?.aesthetics || []).filter(id => validAestheticIds.includes(id)),
      budgetRange: fashionIdentity?.budgetRange,
    });
    setIsLoaded(true);
  }, [isHydrated, isAuthenticated, fashionIdentity]);

  const budgetOptions = [
    { id: 'no-limit', label: 'No preference', desc: 'Show me everything', range: { min: 0, max: 1000000 } },
    { id: 'under-1000', label: `Up to ${getCurrencySymbol()}1,000`, desc: 'Per piece', range: { min: 0, max: 1000 } },
    { id: '1000-5000', label: `${getCurrencySymbol()}1,000 — ${getCurrencySymbol()}5,000`, desc: 'Per piece', range: { min: 1000, max: 5000 } },
    { id: '5000-plus', label: `${getCurrencySymbol()}5,000+`, desc: 'Investment pieces', range: { min: 5000, max: 1000000 } },
  ] as const;

  const stepIndex = STEPS.indexOf(currentStep);

  const prevStep = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
  };

  const nextStep = async () => {
    if (currentStep === 'budget') {
      // Save and advance to complete
      const updated = {
        occasions: selections.occasions,
        aesthetics: selections.aesthetics,
        budgetRange: selections.budgetRange,
        confidenceLevel: fashionIdentity?.confidenceLevel ?? 'guided' as const,
        primaryLocation: fashionIdentity?.primaryLocation ?? '',
        travelDestinations: fashionIdentity?.travelDestinations ?? [],
      };
      updateFashionIdentity(updated);

      const token = getStoredUserToken();
      if (token) {
        setIsSaving(true);
        try {
          await setUserContext({
            occasions: updated.occasions,
            aesthetics: updated.aesthetics,
            minimum_budget: updated.budgetRange?.min ?? 0,
            maximum_budget: updated.budgetRange?.max ?? 0,
          });
          invalidateRecommendationsCache();
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Failed to save preferences', 'error');
        } finally {
          setIsSaving(false);
        }
      }
      setCurrentStep('complete');
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1]);
    }
  };

  const toggleOccasion = (id: string) =>
    setSelections(prev => ({
      ...prev,
      occasions: prev.occasions.includes(id) ? prev.occasions.filter(o => o !== id) : [...prev.occasions, id],
    }));

  const toggleAesthetic = (id: string) =>
    setSelections(prev => ({
      ...prev,
      aesthetics: prev.aesthetics.includes(id) ? prev.aesthetics.filter(a => a !== id) : [...prev.aesthetics, id],
    }));

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream flex flex-col">
      {/* Progress bar */}
      {currentStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-sand">
            <div
              className="h-full bg-gold-muted transition-all duration-700 ease-out"
              style={{ width: `${((stepIndex) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:py-24">
        <div className="max-w-2xl w-full">

          {/* ============================================
              OCCASIONS
              ============================================ */}
          {currentStep === 'occasions' && (
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 01 of 03
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  What occasions do you dress for?
                </h2>
                <p className="text-stone">Select all that apply</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {occasionOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selections.occasions.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOccasion(option.id)}
                      className={`p-6 text-left transition-all duration-300 border ${
                        isSelected
                          ? 'border-charcoal-deep bg-charcoal-deep'
                          : 'border-sand hover:border-charcoal-deep bg-transparent'
                      }`}
                    >
                      <Icon size={20} className={`mb-4 ${isSelected ? 'text-gold-soft' : 'text-taupe'}`} />
                      <span className={`font-display text-lg block mb-1 ${isSelected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                        {option.label}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                        {option.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-12">
                <Link
                  href="/profile"
                  className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Profile</span>
                </Link>
                <button
                  onClick={nextStep}
                  disabled={selections.occasions.length === 0}
                  className="group inline-flex items-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">Continue</span>
                  <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep group-disabled:hover:bg-transparent transition-all duration-300">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream group-disabled:hover:text-charcoal-deep transition-colors" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              AESTHETICS
              ============================================ */}
          {currentStep === 'aesthetics' && (
            <div className="transition-all duration-700 opacity-100 translate-y-0">
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 02 of 03
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  Which aesthetic resonates with you?
                </h2>
                <p className="text-stone">Select all that appeal to you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aestheticOptions.map((option) => {
                  const isSelected = selections.aesthetics.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleAesthetic(option.id)}
                      className={`p-8 text-left transition-all duration-300 border ${
                        isSelected
                          ? 'border-charcoal-deep bg-charcoal-deep'
                          : 'border-sand hover:border-charcoal-deep bg-transparent'
                      }`}
                    >
                      <span className={`font-display text-xl block mb-2 ${isSelected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                        {option.label}
                      </span>
                      <span className={`text-sm ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                        {option.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-12">
                <button
                  onClick={prevStep}
                  className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={selections.aesthetics.length === 0}
                  className="group inline-flex items-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">Continue</span>
                  <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep group-disabled:hover:bg-transparent transition-all duration-300">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream group-disabled:hover:text-charcoal-deep transition-colors" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              BUDGET
              ============================================ */}
          {currentStep === 'budget' && (
            <div className="transition-all duration-700 opacity-100 translate-y-0">
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 03 of 03
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  Investment comfort range?
                </h2>
                <p className="text-stone">Optional — helps personalize suggestions</p>
              </div>

              <div className="space-y-4">
                {budgetOptions.map((option) => {
                  const isSelected = JSON.stringify(selections.budgetRange) === JSON.stringify(option.range);
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelections(prev => ({ ...prev, budgetRange: option.range }))}
                      className={`w-full p-6 text-left transition-all duration-300 border flex items-center justify-between ${
                        isSelected
                          ? 'border-charcoal-deep bg-charcoal-deep'
                          : 'border-sand hover:border-charcoal-deep bg-transparent'
                      }`}
                    >
                      <span className={`font-display text-xl ${isSelected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                        {option.label}
                      </span>
                      <span className={`text-sm ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                        {option.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-12">
                <button
                  onClick={prevStep}
                  className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={isSaving}
                  className="group inline-flex items-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                    {isSaving ? 'Saving...' : 'Save'}
                  </span>
                  <span className="w-12 h-12 bg-charcoal-deep flex items-center justify-center group-hover:bg-noir transition-all duration-300">
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check size={16} className="text-ivory-cream" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              COMPLETE
              ============================================ */}
          {currentStep === 'complete' && (
            <div className="text-center transition-all duration-1000 opacity-100 translate-y-0">
              <div className="w-20 h-20 bg-charcoal-deep flex items-center justify-center mx-auto mb-10">
                <Check size={32} className="text-gold-soft" />
              </div>

              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-6">
                Preferences Saved
              </span>

              <h2 className="font-display text-[clamp(2rem,5vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-8">
                Your Style Profile<br />is Updated
              </h2>

              <p className="text-lg text-stone max-w-lg mx-auto mb-12 leading-relaxed">
                We'll curate recommendations that resonate with your updated preferences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/discover"
                  className="group inline-flex items-center justify-center gap-4 py-4 px-8 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Start Exploring</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/profile"
                  className="group inline-flex items-center justify-center gap-4 py-4 px-8 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Back to Profile</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
