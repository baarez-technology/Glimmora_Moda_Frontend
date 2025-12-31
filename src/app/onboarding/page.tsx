'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, Briefcase, Users, Sun, Star, Plane, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type Step = 'welcome' | 'occasions' | 'aesthetics' | 'confidence' | 'budget' | 'complete';

export default function OnboardingPage() {
  const { showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selections, setSelections] = useState({
    occasions: [] as string[],
    aesthetics: [] as string[],
    confidence: '',
    budget: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Load existing fashion identity from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('moda-fashion-identity');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelections(parsed);
      } catch (e) {
        console.error('Failed to parse stored fashion identity');
      }
    }
  }, []);

  const occasionOptions = [
    { id: 'professional', label: 'Professional', desc: 'Business meetings & work', icon: Briefcase },
    { id: 'social', label: 'Social Events', desc: 'Dinners & gatherings', icon: Users },
    { id: 'casual', label: 'Casual Daily', desc: 'Everyday elegance', icon: Sun },
    { id: 'formal', label: 'Formal', desc: 'Galas & black tie', icon: Star },
    { id: 'travel', label: 'Travel', desc: 'Refined journeys', icon: Plane },
    { id: 'art', label: 'Art & Culture', desc: 'Galleries & theater', icon: Palette }
  ];

  const aestheticOptions = [
    { id: 'minimal', label: 'Minimal & Structured', desc: 'Clean lines, refined simplicity' },
    { id: 'classic', label: 'Classic & Timeless', desc: 'Enduring elegance, heritage pieces' },
    { id: 'artistic', label: 'Artistic & Expressive', desc: 'Bold statements, creative vision' },
    { id: 'contemporary', label: 'Bold & Contemporary', desc: 'Modern edge, fashion-forward' }
  ];

  const confidenceOptions = [
    { id: 'decisive', label: 'I know exactly what I want', desc: 'Show me options, I\'ll decide' },
    { id: 'guided', label: 'I appreciate thoughtful guidance', desc: 'Suggest with explanations' },
    { id: 'advisory', label: 'I prefer curated recommendations', desc: 'Tell me what works for me' }
  ];

  const budgetOptions = [
    { id: 'no-limit', label: 'No preference', desc: 'Show me everything' },
    { id: 'under-1000', label: 'Up to €1,000', desc: 'Per piece' },
    { id: '1000-5000', label: '€1,000 — €5,000', desc: 'Per piece' },
    { id: '5000-plus', label: '€5,000+', desc: 'Investment pieces' }
  ];

  const toggleSelection = (type: 'occasions' | 'aesthetics', id: string) => {
    setSelections(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const nextStep = () => {
    const steps: Step[] = ['welcome', 'occasions', 'aesthetics', 'confidence', 'budget', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      if (nextStepValue === 'complete') {
        localStorage.setItem('moda-fashion-identity', JSON.stringify(selections));
        showToast('Style profile saved successfully', 'success');
      }
      setCurrentStep(nextStepValue);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['welcome', 'occasions', 'aesthetics', 'confidence', 'budget', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getStepNumber = () => {
    const stepMap: Record<Step, number> = {
      welcome: 0,
      occasions: 1,
      aesthetics: 2,
      confidence: 3,
      budget: 4,
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
              className="h-full bg-gold-muted transition-all duration-700 ease-out"
              style={{ width: `${getStepNumber() * 25}%` }}
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
            <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-6">
                Personal Styling
              </span>

              <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-8">
                Create Your<br />Style Profile
              </h1>

              <p className="text-lg text-stone max-w-lg mx-auto mb-12 leading-relaxed">
                Let us understand your preferences, occasions, and aspirations.
                This takes just a moment.
              </p>

              <button
                onClick={nextStep}
                className="group inline-flex items-center gap-5"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                  Begin
                </span>
                <span className="w-14 h-14 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                  <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                </span>
              </button>

              <p className="text-xs text-taupe mt-10 tracking-wide">
                You can update these preferences anytime
              </p>
            </div>
          )}

          {/* ============================================
              OCCASIONS
              ============================================ */}
          {currentStep === 'occasions' && (
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 01 of 04
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
                      onClick={() => toggleSelection('occasions', option.id)}
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
                <button
                  onClick={prevStep}
                  className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={selections.occasions.length === 0}
                  className="group inline-flex items-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                    Continue
                  </span>
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
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 02 of 04
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
                      onClick={() => toggleSelection('aesthetics', option.id)}
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
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                    Continue
                  </span>
                  <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep group-disabled:hover:bg-transparent transition-all duration-300">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream group-disabled:hover:text-charcoal-deep transition-colors" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              CONFIDENCE
              ============================================ */}
          {currentStep === 'confidence' && (
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 03 of 04
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  How do you prefer to discover?
                </h2>
                <p className="text-stone">This helps us tailor your experience</p>
              </div>

              <div className="space-y-4">
                {confidenceOptions.map((option, index) => {
                  const isSelected = selections.confidence === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelections({ ...selections, confidence: option.id })}
                      className={`w-full p-8 text-left transition-all duration-300 border flex items-start gap-6 ${
                        isSelected
                          ? 'border-charcoal-deep bg-charcoal-deep'
                          : 'border-sand hover:border-charcoal-deep bg-transparent'
                      }`}
                    >
                      <span className={`font-display text-2xl ${isSelected ? 'text-gold-soft' : 'text-taupe'}`}>
                        0{index + 1}
                      </span>
                      <div>
                        <span className={`font-display text-lg block mb-1 ${isSelected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                          {option.label}
                        </span>
                        <span className={`text-sm ${isSelected ? 'text-taupe' : 'text-stone'}`}>
                          {option.desc}
                        </span>
                      </div>
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
                  disabled={!selections.confidence}
                  className="group inline-flex items-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                    Continue
                  </span>
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
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-muted block mb-4">
                  Step 04 of 04
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-4">
                  Investment comfort range?
                </h2>
                <p className="text-stone">Optional — helps personalize suggestions</p>
              </div>

              <div className="space-y-4">
                {budgetOptions.map((option) => {
                  const isSelected = selections.budget === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelections({ ...selections, budget: option.id })}
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
                  className="group inline-flex items-center gap-4"
                >
                  <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                    Complete
                  </span>
                  <span className="w-12 h-12 bg-charcoal-deep flex items-center justify-center group-hover:bg-noir transition-all duration-300">
                    <Check size={16} className="text-ivory-cream" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================
              COMPLETE
              ============================================ */}
          {currentStep === 'complete' && (
            <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="w-20 h-20 bg-charcoal-deep flex items-center justify-center mx-auto mb-10">
                <Check size={32} className="text-gold-soft" />
              </div>

              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-6">
                Profile Complete
              </span>

              <h2 className="font-display text-[clamp(2rem,5vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-8">
                Your Style Profile<br />is Ready
              </h2>

              <p className="text-lg text-stone max-w-lg mx-auto mb-12 leading-relaxed">
                We'll curate recommendations that resonate with your preferences and evolve as you explore the collection.
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
                  <span className="text-sm tracking-[0.15em] uppercase">View Profile</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
