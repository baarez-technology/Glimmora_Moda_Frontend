'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';

type Step = 'welcome' | 'occasions' | 'aesthetics' | 'confidence' | 'budget' | 'complete';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selections, setSelections] = useState({
    occasions: [] as string[],
    aesthetics: [] as string[],
    confidence: '',
    budget: ''
  });

  const occasionOptions = [
    { id: 'professional', label: 'Professional / Business', icon: '💼' },
    { id: 'social', label: 'Social Events', icon: '🥂' },
    { id: 'casual', label: 'Casual Daily', icon: '☀️' },
    { id: 'formal', label: 'Formal / Black Tie', icon: '🎭' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'art', label: 'Art & Cultural Events', icon: '🎨' }
  ];

  const aestheticOptions = [
    { id: 'minimal', label: 'Minimal & Structured', desc: 'Clean lines, refined simplicity' },
    { id: 'classic', label: 'Classic & Timeless', desc: 'Enduring elegance, heritage pieces' },
    { id: 'artistic', label: 'Artistic & Expressive', desc: 'Bold statements, creative vision' },
    { id: 'contemporary', label: 'Bold & Contemporary', desc: 'Modern edge, fashion-forward' }
  ];

  const confidenceOptions = [
    { id: 'decisive', label: 'I know exactly what I want', desc: 'Show me options, I\'ll decide' },
    { id: 'guided', label: 'I like guidance but make my own decisions', desc: 'Suggest with explanations' },
    { id: 'advisory', label: 'I prefer strong recommendations', desc: 'Tell me what works for me' }
  ];

  const budgetOptions = [
    { id: 'no-limit', label: 'No preference', desc: 'Show me everything' },
    { id: 'under-1000', label: 'Up to €1,000', desc: 'Per piece' },
    { id: '1000-5000', label: '€1,000 - €5,000', desc: 'Per piece' },
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
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['welcome', 'occasions', 'aesthetics', 'confidence', 'budget', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-cream flex flex-col">
      {/* Progress */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="fixed top-[72px] lg:top-[104px] left-0 right-0 h-1 bg-sand z-10">
          <div
            className="h-full bg-gold-muted transition-all duration-500"
            style={{
              width: `${
                currentStep === 'occasions' ? 25 :
                currentStep === 'aesthetics' ? 50 :
                currentStep === 'confidence' ? 75 :
                currentStep === 'budget' ? 100 : 0
              }%`
            }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Welcome */}
          {currentStep === 'welcome' && (
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-gold-muted/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-gold-muted" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-charcoal-deep mb-6">
                Create Your Fashion Identity
              </h1>
              <p className="text-lg text-stone max-w-lg mx-auto mb-10">
                Let our Fashion Intelligence understand your style, preferences, and aspirations.
                This takes just 2 minutes.
              </p>
              <button onClick={nextStep} className="btn-primary">
                Begin
                <ArrowRight size={18} />
              </button>
              <p className="text-sm text-greige mt-6">
                You can update these preferences anytime
              </p>
            </div>
          )}

          {/* Occasions */}
          {currentStep === 'occasions' && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4 text-center">
                Step 1 of 4
              </p>
              <h2 className="font-display text-3xl text-charcoal-deep mb-4 text-center">
                What occasions do you dress for?
              </h2>
              <p className="text-stone text-center mb-10">Select all that apply</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {occasionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleSelection('occasions', option.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      selections.occasions.includes(option.id)
                        ? 'border-gold-muted bg-gold-muted/10'
                        : 'border-sand hover:border-taupe'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{option.icon}</span>
                    <span className="font-medium text-charcoal-deep">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={selections.occasions.length === 0}
                  className="btn-primary disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Aesthetics */}
          {currentStep === 'aesthetics' && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4 text-center">
                Step 2 of 4
              </p>
              <h2 className="font-display text-3xl text-charcoal-deep mb-4 text-center">
                Which aesthetic resonates with you?
              </h2>
              <p className="text-stone text-center mb-10">Select all that appeal to you</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aestheticOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleSelection('aesthetics', option.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      selections.aesthetics.includes(option.id)
                        ? 'border-gold-muted bg-gold-muted/10'
                        : 'border-sand hover:border-taupe'
                    }`}
                  >
                    <span className="font-display text-xl text-charcoal-deep block mb-1">
                      {option.label}
                    </span>
                    <span className="text-sm text-stone">{option.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={selections.aesthetics.length === 0}
                  className="btn-primary disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Confidence */}
          {currentStep === 'confidence' && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4 text-center">
                Step 3 of 4
              </p>
              <h2 className="font-display text-3xl text-charcoal-deep mb-4 text-center">
                How would you describe your fashion confidence?
              </h2>
              <p className="text-stone text-center mb-10">This helps us tailor recommendations</p>

              <div className="space-y-4">
                {confidenceOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelections({ ...selections, confidence: option.id })}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                      selections.confidence === option.id
                        ? 'border-gold-muted bg-gold-muted/10'
                        : 'border-sand hover:border-taupe'
                    }`}
                  >
                    <span className="font-display text-lg text-charcoal-deep block mb-1">
                      {option.label}
                    </span>
                    <span className="text-sm text-stone">{option.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selections.confidence}
                  className="btn-primary disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Budget */}
          {currentStep === 'budget' && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4 text-center">
                Step 4 of 4
              </p>
              <h2 className="font-display text-3xl text-charcoal-deep mb-4 text-center">
                Would you like to set a comfort range?
              </h2>
              <p className="text-stone text-center mb-10">Optional — helps personalize suggestions</p>

              <div className="space-y-4">
                {budgetOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelections({ ...selections, budget: option.id })}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                      selections.budget === option.id
                        ? 'border-gold-muted bg-gold-muted/10'
                        : 'border-sand hover:border-taupe'
                    }`}
                  >
                    <span className="font-display text-lg text-charcoal-deep block mb-1">
                      {option.label}
                    </span>
                    <span className="text-sm text-stone">{option.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="btn-secondary">
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button onClick={nextStep} className="btn-primary">
                  Complete Setup
                  <Check size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Complete */}
          {currentStep === 'complete' && (
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-10 h-10 text-ivory-cream" />
              </div>
              <h2 className="font-display text-4xl text-charcoal-deep mb-6">
                Your Fashion Identity is Ready
              </h2>
              <p className="text-lg text-stone max-w-lg mx-auto mb-10">
                Your User Fashion Agent is now active. It will learn and adapt as you explore,
                providing personalized recommendations that resonate with your style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/discover" className="btn-primary">
                  Start Exploring
                  <ArrowRight size={18} />
                </Link>
                <Link href="/profile" className="btn-secondary">
                  View My Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
