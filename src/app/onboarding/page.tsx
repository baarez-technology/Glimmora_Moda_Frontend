'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Briefcase, Users, Sun, Star, Plane, Palette, Camera, Calendar as CalendarIcon, Shirt } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { setUserContext, getStoredUserToken } from '@/services/auth.service';
import { invalidateRecommendationsCache } from '@/services/recommendation.service';

type Step = 'welcome' | 'style' | 'body-twin' | 'calendar' | 'wardrobe' | 'complete';
const STEPS: Step[] = ['welcome', 'style', 'body-twin', 'calendar', 'wardrobe', 'complete'];

function isStep(value: string | null): value is Step {
  return value !== null && (STEPS as string[]).includes(value);
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, fashionIdentity, updateFashionIdentity } = useApp();
  const { setUserData } = useAuth();

  const stepParam = searchParams.get('step');
  const currentStep: Step = isStep(stepParam) ? stepParam : 'welcome';

  const goToStep = useCallback((step: Step) => {
    if (step === 'welcome') {
      router.push('/onboarding');
    } else {
      router.push(`/onboarding?step=${step}`);
    }
  }, [router]);

  const [isSavingContext, setIsSavingContext] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [selections, setSelections] = useState({
    occasions: [] as string[],
    aesthetics: [] as string[],
    measurementsCaptured: false,
    calendarConnected: false,
    wardrobeItemsAdded: 0
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const occasionOptions = [
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'casual', label: 'Casual', icon: Sun },
    { id: 'formal', label: 'Formal', icon: Star },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'art', label: 'Art', icon: Palette }
  ];

  const aestheticOptions = [
    { id: 'minimal', label: 'Minimal & Structured' },
    { id: 'classic', label: 'Classic & Timeless' },
    { id: 'artistic', label: 'Artistic & Expressive' },
    { id: 'contemporary', label: 'Bold & Contemporary' }
  ];

  const toggleSelection = (type: 'occasions' | 'aesthetics', id: string) => {
    setSelections(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const nextStep = async () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStepValue = STEPS[currentIndex + 1];
      if (nextStepValue === 'complete') {
        const newFashionIdentity = {
          ...fashionIdentity,
          occasions: selections.occasions,
          aesthetics: selections.aesthetics,
          confidenceLevel: fashionIdentity?.confidenceLevel || 'guided',
          budgetRange: fashionIdentity?.budgetRange,
          primaryLocation: fashionIdentity?.primaryLocation || 'Paris',
          travelDestinations: fashionIdentity?.travelDestinations || []
        };
        updateFashionIdentity(newFashionIdentity as any); // Cast as any or just pass the required fields if it still complains, but explicit defaults are better.

        const token = getStoredUserToken();
        if (token) {
          setIsSavingContext(true);
          try {
            const updatedUser = await setUserContext({
              occasions: selections.occasions,
              aesthetics: selections.aesthetics,
              minimum_budget: fashionIdentity?.budgetRange?.min ?? 0,
              maximum_budget: fashionIdentity?.budgetRange?.max ?? 0,
            });
            setUserData(updatedUser);
            invalidateRecommendationsCache();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save preferences';
            showToast(message, 'error');
          } finally {
            setIsSavingContext(false);
          }
        }
      }
      goToStep(nextStepValue);
    }
  };

  const prevStep = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      goToStep(STEPS[currentIndex - 1]);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const getStepNumber = () => {
    const stepMap: Record<Step, number> = {
      welcome: 0,
      style: 1,
      'body-twin': 2,
      calendar: 3,
      wardrobe: 4,
      complete: 5
    };
    return stepMap[currentStep];
  };

  return (
    <div className="min-h-screen bg-ivory-cream flex flex-col">
      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-sand">
            <div
              className="h-full bg-gold-muted transition-all duration-500 ease-out"
              style={{ width: `${(getStepNumber() / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:py-24">
        <div className="max-w-2xl w-full">
          {/* ============================================
              WELCOME
              ============================================ */}
          {currentStep === 'welcome' && (
            <div className={`text-center transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-6">
                Welcome
              </span>

              <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-8">
                You're joining ModaGlimmora
              </h1>

              <p className="text-lg text-stone max-w-lg mx-auto mb-12 leading-relaxed">
                Fashion that learns you. Let's set up your intelligence profile in 4 quick steps.
              </p>

              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={nextStep}
                  className="group inline-flex items-center gap-5"
                >
                  <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                    Begin Setup
                  </span>
                  <span className="w-14 h-14 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                    <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              STYLE DNA
              ============================================ */}
          {currentStep === 'style' && (
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 1 of 4 • Style DNA
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  What defines your style?
                </h2>
                <p className="text-stone">Pick your top occasions and aesthetics</p>
              </div>

              <div className="mb-8">
                <h3 className="text-sm tracking-[0.15em] uppercase text-charcoal-deep mb-4">Occasions</h3>
                <div className="grid grid-cols-3 gap-3">
                  {occasionOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selections.occasions.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleSelection('occasions', option.id)}
                        className={`p-4 text-center transition-all duration-300 border ${
                          isSelected ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream' : 'border-sand hover:border-charcoal-deep bg-transparent text-charcoal-deep'
                        }`}
                      >
                        <Icon size={18} className={`mx-auto mb-2 ${isSelected ? 'text-gold-soft' : 'text-taupe'}`} />
                        <span className="text-xs">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm tracking-[0.15em] uppercase text-charcoal-deep mb-4">Aesthetics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {aestheticOptions.map((option) => {
                    const isSelected = selections.aesthetics.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleSelection('aesthetics', option.id)}
                        className={`p-4 text-left transition-all duration-300 border ${
                          isSelected ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream' : 'border-sand hover:border-charcoal-deep bg-transparent text-charcoal-deep'
                        }`}
                      >
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between mt-12 items-center">
                <button onClick={prevStep} className="text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep">Back</button>
                <div className="flex items-center gap-6">
                  <button onClick={skipStep} className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep underline">Skip</button>
                  <button onClick={nextStep} className="group inline-flex items-center gap-4">
                    <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">Continue</span>
                    <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                      <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================
              BODY TWIN
              ============================================ */}
          {currentStep === 'body-twin' && (
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 2 of 4 • Body Twin
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  Unlock Fit Confidence
                </h2>
                <p className="text-stone">Capture 11 measurements to know exactly how every piece will fit</p>
              </div>

              <div className="flex justify-center mb-12">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-sand flex items-center justify-center text-taupe">
                  <Camera size={40} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setSelections({...selections, measurementsCaptured: true});
                    nextStep();
                  }}
                  className="w-full max-w-sm py-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                >
                  Capture Measurements
                </button>
                <button onClick={skipStep} className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep underline mt-2">
                  I'll do this later
                </button>
              </div>
              
              <div className="flex justify-between mt-12 items-center">
                <button onClick={prevStep} className="text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep">Back</button>
                <button onClick={nextStep} className="group inline-flex items-center gap-4">
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">Continue</span>
                  <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              CALENDAR SYNC
              ============================================ */}
          {currentStep === 'calendar' && (
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 3 of 4 • Calendar
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  Sync Your Schedule
                </h2>
                <p className="text-stone">Get proactive outfit recommendations for your real events</p>
              </div>

              <div className="flex justify-center mb-12">
                <div className="w-32 h-32 rounded-full border border-sand bg-parchment/30 flex items-center justify-center text-charcoal-deep">
                  <CalendarIcon size={40} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setSelections({...selections, calendarConnected: true});
                    nextStep();
                  }}
                  className="w-full max-w-sm py-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                >
                  Connect Calendar
                </button>
                <button onClick={skipStep} className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep underline mt-2">
                  I'll do this later
                </button>
              </div>

              <div className="flex justify-between mt-12 items-center">
                <button onClick={prevStep} className="text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep">Back</button>
                <button onClick={nextStep} className="group inline-flex items-center gap-4">
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">Continue</span>
                  <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              WARDROBE SETUP
              ============================================ */}
          {currentStep === 'wardrobe' && (
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 4 of 4 • Wardrobe
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  Start Your Style Graph
                </h2>
                <p className="text-stone">Add 3 pieces you already own to help us understand your wardrobe gaps</p>
              </div>

              <div className="flex justify-center mb-12">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-24 h-32 border-2 border-dashed border-sand flex flex-col items-center justify-center text-taupe gap-2 cursor-pointer hover:border-charcoal-deep transition-colors">
                      <Shirt size={24} />
                      <span className="text-[10px] uppercase tracking-wider">Add</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button onClick={skipStep} className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep underline mt-2">
                  I'll do this later
                </button>
              </div>

              <div className="flex justify-between mt-12 items-center">
                <button onClick={prevStep} className="text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep">Back</button>
                <button onClick={nextStep} disabled={isSavingContext} className="group inline-flex items-center gap-4 disabled:opacity-70">
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">{isSavingContext ? 'Saving...' : 'Complete'}</span>
                  <span className="w-12 h-12 bg-charcoal-deep flex items-center justify-center group-hover:bg-noir transition-all duration-300">
                    {isSavingContext ? (
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
            <div className={`relative text-center py-12 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative w-24 h-24 mx-auto mb-12">
                <div className="absolute inset-0 rounded-full border border-gold-soft/50" />
                <div className="absolute inset-2 rounded-full bg-charcoal-deep flex items-center justify-center">
                  <Check size={28} className="text-gold-soft" strokeWidth={1.5} />
                </div>
              </div>

              <div className="w-12 h-px bg-gold-soft mx-auto mb-6" aria-hidden="true" />

              <span className="text-[11px] font-semibold tracking-[0.5em] uppercase text-gold-deep block mb-6">
                Profile Complete
              </span>

              <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] text-charcoal-deep leading-[1.05] tracking-[-0.02em] mb-6">
                Your Intelligence<br />
                <span className="italic text-stone">is Ready</span>
              </h2>

              <p className="text-base md:text-lg text-stone max-w-lg mx-auto mb-12 leading-relaxed">
                Welcome to ModaGlimmora. We've set up your Concierge dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/for-you"
                  className="group inline-flex items-center justify-center gap-4 py-4 px-10 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Go to For You</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory-cream" />}>
      <OnboardingContent />
    </Suspense>
  );
}
