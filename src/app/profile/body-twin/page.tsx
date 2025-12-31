'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Check, ChevronRight, Sparkles, Save } from 'lucide-react';
import { mockBodyTwin } from '@/data/mock-data';
import type { DigitalBodyTwin } from '@/types';

const silhouetteOptions = [
  { value: 'petite', label: 'Petite', description: 'Under 5\'4" / 163cm' },
  { value: 'average', label: 'Average', description: '5\'4" - 5\'7" / 163-170cm' },
  { value: 'tall', label: 'Tall', description: 'Over 5\'7" / 170cm' },
  { value: 'athletic', label: 'Athletic', description: 'Toned, active build' },
  { value: 'curvy', label: 'Curvy', description: 'Fuller figure' },
] as const;

const proportionOptions = {
  shoulder: ['narrow', 'medium', 'broad'],
  torso: ['short', 'medium', 'long'],
  legs: ['short', 'medium', 'long'],
};

const fitOptions = ['fitted', 'regular', 'relaxed', 'oversized'];

export default function BodyTwinPage() {
  const [bodyTwin, setBodyTwin] = useState<DigitalBodyTwin>(mockBodyTwin);
  const [activeStep, setActiveStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const steps = [
    { title: 'Silhouette', description: 'Your overall body type' },
    { title: 'Proportions', description: 'Your body proportions' },
    { title: 'Fit Preferences', description: 'How you like clothes to fit' },
    { title: 'Measurements', description: 'Optional precise measurements' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand">
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sapphire-deep/10 rounded-full flex items-center justify-center">
              <User size={24} className="text-sapphire-subtle" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-charcoal-deep">
                Digital Body Twin
              </h1>
              <p className="text-stone">Abstract fit representation for accurate recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`flex-1 relative ${index !== steps.length - 1 ? 'pr-4' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= activeStep
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'bg-sand text-stone'
                }`}>
                  {index < activeStep ? <Check size={16} /> : index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ml-2 ${
                    index < activeStep ? 'bg-charcoal-deep' : 'bg-sand'
                  }`} />
                )}
              </div>
              <p className={`text-xs mt-2 ${index === activeStep ? 'text-charcoal-deep font-medium' : 'text-stone'}`}>
                {step.title}
              </p>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm mb-6">
          {/* Step 0: Silhouette */}
          {activeStep === 0 && (
            <div>
              <h2 className="font-display text-xl text-charcoal-deep mb-2">Select Your Silhouette</h2>
              <p className="text-stone mb-6">Choose the option that best describes your overall body type</p>

              <div className="grid gap-3">
                {silhouetteOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBodyTwin({ ...bodyTwin, silhouette: option.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      bodyTwin.silhouette === option.value
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-gold-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal-deep">{option.label}</p>
                        <p className="text-sm text-stone">{option.description}</p>
                      </div>
                      {bodyTwin.silhouette === option.value && (
                        <Check size={20} className="text-success" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Proportions */}
          {activeStep === 1 && (
            <div>
              <h2 className="font-display text-xl text-charcoal-deep mb-2">Your Proportions</h2>
              <p className="text-stone mb-6">Help us understand your body proportions for better fit recommendations</p>

              <div className="space-y-6">
                <div>
                  <p className="font-medium text-charcoal-deep mb-3">Shoulder Width</p>
                  <div className="flex gap-3">
                    {proportionOptions.shoulder.map((option) => (
                      <button
                        key={option}
                        onClick={() => setBodyTwin({
                          ...bodyTwin,
                          proportions: { ...bodyTwin.proportions, shoulder: option as 'narrow' | 'medium' | 'broad' }
                        })}
                        className={`flex-1 py-3 rounded-lg border-2 capitalize transition-all ${
                          bodyTwin.proportions.shoulder === option
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-gold-muted'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-charcoal-deep mb-3">Torso Length</p>
                  <div className="flex gap-3">
                    {proportionOptions.torso.map((option) => (
                      <button
                        key={option}
                        onClick={() => setBodyTwin({
                          ...bodyTwin,
                          proportions: { ...bodyTwin.proportions, torso: option as 'short' | 'medium' | 'long' }
                        })}
                        className={`flex-1 py-3 rounded-lg border-2 capitalize transition-all ${
                          bodyTwin.proportions.torso === option
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-gold-muted'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-charcoal-deep mb-3">Leg Length</p>
                  <div className="flex gap-3">
                    {proportionOptions.legs.map((option) => (
                      <button
                        key={option}
                        onClick={() => setBodyTwin({
                          ...bodyTwin,
                          proportions: { ...bodyTwin.proportions, legs: option as 'short' | 'medium' | 'long' }
                        })}
                        className={`flex-1 py-3 rounded-lg border-2 capitalize transition-all ${
                          bodyTwin.proportions.legs === option
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-gold-muted'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Fit Preferences */}
          {activeStep === 2 && (
            <div>
              <h2 className="font-display text-xl text-charcoal-deep mb-2">Fit Preferences</h2>
              <p className="text-stone mb-6">How do you prefer your clothes to fit?</p>

              <div>
                <p className="font-medium text-charcoal-deep mb-3">General Preference</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {fitOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setBodyTwin({
                        ...bodyTwin,
                        preferredFit: option as 'fitted' | 'regular' | 'relaxed' | 'oversized'
                      })}
                      className={`py-4 rounded-lg border-2 capitalize transition-all ${
                        bodyTwin.preferredFit === option
                          ? 'border-charcoal-deep bg-parchment'
                          : 'border-sand hover:border-gold-muted'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="font-medium text-charcoal-deep mb-3">By Category</p>
                <div className="space-y-4">
                  {Object.entries(bodyTwin.fitPreferences).map(([category, preference]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-parchment rounded-lg">
                      <span className="capitalize text-charcoal-deep">{category}</span>
                      <select
                        value={preference}
                        onChange={(e) => setBodyTwin({
                          ...bodyTwin,
                          fitPreferences: { ...bodyTwin.fitPreferences, [category]: e.target.value }
                        })}
                        className="px-4 py-2 bg-white border border-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-muted"
                      >
                        {fitOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Measurements */}
          {activeStep === 3 && (
            <div>
              <h2 className="font-display text-xl text-charcoal-deep mb-2">Measurements (Optional)</h2>
              <p className="text-stone mb-6">Add precise measurements for even more accurate fit predictions</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-stone mb-2 block">Height (cm)</label>
                  <input
                    type="number"
                    value={bodyTwin.measurements?.height || ''}
                    onChange={(e) => setBodyTwin({
                      ...bodyTwin,
                      measurements: { ...bodyTwin.measurements, height: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="165"
                    className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                  />
                </div>
                <div>
                  <label className="text-sm text-stone mb-2 block">Bust (cm)</label>
                  <input
                    type="number"
                    value={bodyTwin.measurements?.bust || ''}
                    onChange={(e) => setBodyTwin({
                      ...bodyTwin,
                      measurements: { ...bodyTwin.measurements, bust: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="88"
                    className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                  />
                </div>
                <div>
                  <label className="text-sm text-stone mb-2 block">Waist (cm)</label>
                  <input
                    type="number"
                    value={bodyTwin.measurements?.waist || ''}
                    onChange={(e) => setBodyTwin({
                      ...bodyTwin,
                      measurements: { ...bodyTwin.measurements, waist: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="68"
                    className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                  />
                </div>
                <div>
                  <label className="text-sm text-stone mb-2 block">Hips (cm)</label>
                  <input
                    type="number"
                    value={bodyTwin.measurements?.hips || ''}
                    onChange={(e) => setBodyTwin({
                      ...bodyTwin,
                      measurements: { ...bodyTwin.measurements, hips: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="94"
                    className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                  />
                </div>
                <div>
                  <label className="text-sm text-stone mb-2 block">Inseam (cm)</label>
                  <input
                    type="number"
                    value={bodyTwin.measurements?.inseam || ''}
                    onChange={(e) => setBodyTwin({
                      ...bodyTwin,
                      measurements: { ...bodyTwin.measurements, inseam: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="76"
                    className="w-full px-4 py-3 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-muted"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-sapphire-deep/5 rounded-xl border border-sapphire-subtle/20">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-sapphire-subtle mt-0.5" />
                  <p className="text-sm text-stone">
                    Your measurements are stored securely and only used to improve fit predictions.
                    They are never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-6 py-3 border border-sand rounded-lg text-charcoal-deep hover:border-charcoal-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="btn-primary"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                {saved ? (
                  <>
                    <Check size={18} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Body Twin
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
