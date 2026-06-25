'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Check, ChevronRight, ChevronLeft, Shield, Save, Pencil, Plus, Ruler, Shirt, Move, Loader2, AlertCircle } from 'lucide-react';
import { getDigitalBodyTwin, createDigitalBodyTwin, updateDigitalBodyTwin } from '@/services/digital-body-twin.service';
import { useApp } from '@/context/AppContext';
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

const defaultBodyTwin: DigitalBodyTwin = {
  id: 'body-twin-default',
  userId: 'user-default',
  silhouette: 'average',
  proportions: { shoulder: 'medium', torso: 'medium', legs: 'medium' },
  preferredFit: 'regular',
  fitPreferences: { tops: 'relaxed', bottoms: 'relaxed', dresses: 'relaxed' },
  measurements: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── View Mode Component ─────────────────────────────────────────────────────

function BodyTwinView({ bodyTwin, onEdit }: { bodyTwin: DigitalBodyTwin; onEdit: () => void }) {
  const silhouetteLabel = silhouetteOptions.find(s => s.value === bodyTwin.silhouette);
  const m = bodyTwin.measurements;
  const hasMeasurements = m && Object.values(m).some(v => v !== undefined && v !== null);

  const daysSinceUpdate = bodyTwin.updatedAt
    ? Math.floor((Date.now() - new Date(bodyTwin.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isStale = daysSinceUpdate !== null && daysSinceUpdate > 90;

  return (
    <div className="space-y-8">
      {/* Staleness warning */}
      {isStale && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800">Measurements may be outdated</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Last updated {daysSinceUpdate} days ago. Update your measurements for accurate fit recommendations.
            </p>
            <button onClick={onEdit} className="text-xs text-amber-800 underline mt-1">Update now</button>
          </div>
        </div>
      )}
      {/* Silhouette & General Fit */}
      <div className="bg-white p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-6">
          <User size={18} className="text-stone" />
          <h2 className="text-[11px] tracking-[0.3em] uppercase text-taupe">Silhouette & Fit</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Body Type</p>
            <p className="font-display text-xl text-charcoal-deep capitalize">{silhouetteLabel?.label || bodyTwin.silhouette}</p>
            <p className="text-sm text-stone mt-1">{silhouetteLabel?.description}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">General Fit</p>
            <p className="font-display text-xl text-charcoal-deep capitalize">{bodyTwin.preferredFit}</p>
          </div>
        </div>
      </div>

      {/* Proportions */}
      <div className="bg-white p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-6">
          <Move size={18} className="text-stone" />
          <h2 className="text-[11px] tracking-[0.3em] uppercase text-taupe">Proportions</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Shoulders', value: bodyTwin.proportions.shoulder },
            { label: 'Torso', value: bodyTwin.proportions.torso },
            { label: 'Legs', value: bodyTwin.proportions.legs },
          ].map((item) => (
            <div key={item.label} className="text-center p-5 bg-parchment">
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">{item.label}</p>
              <p className="font-display text-lg text-charcoal-deep capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fit Preferences by Category */}
      <div className="bg-white p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-6">
          <Shirt size={18} className="text-stone" />
          <h2 className="text-[11px] tracking-[0.3em] uppercase text-taupe">Fit Preferences by Category</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(bodyTwin.fitPreferences).map(([category, pref]) => (
            <div key={category} className="p-5 border border-sand">
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">{category}</p>
              <p className="font-medium text-charcoal-deep capitalize">{pref}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Measurements */}
      {hasMeasurements && (
        <div className="bg-white p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Ruler size={18} className="text-stone" />
            <h2 className="text-[11px] tracking-[0.3em] uppercase text-taupe">Measurements</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Height', value: m.height },
              { label: 'Chest', value: m.bust },
              { label: 'Waist', value: m.waist },
              { label: 'Hips', value: m.hips },
              { label: 'Inseam', value: m.inseam },
            ].filter(item => item.value != null).map((item) => (
              <div key={item.label} className="p-5 bg-parchment">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">{item.label}</p>
                <p className="font-display text-xl text-charcoal-deep">{item.value} <span className="text-sm text-stone font-normal">cm</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated + Edit Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-taupe">
          Last updated {new Date(bodyTwin.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <button
          onClick={onEdit}
          className="flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
        >
          <Pencil size={16} />
          Edit Body Twin
        </button>
      </div>
    </div>
  );
}

// ─── Empty State Component ───────────────────────────────────────────────────

function BodyTwinEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-8 bg-parchment flex items-center justify-center">
        <User size={36} className="text-stone" />
      </div>
      <h2 className="font-display text-2xl text-charcoal-deep mb-3">No Body Twin Yet</h2>
      <p className="text-stone max-w-md mx-auto mb-10">
        Create your Digital Body Twin for personalized fit recommendations,
        size suggestions, and virtual try-on experiences.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-3 px-10 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
      >
        <Plus size={16} />
        Create Body Twin
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BodyTwinPage() {
  const { showToast, isUHNI } = useApp();
  const router = useRouter();
  const [bodyTwin, setBodyTwin] = useState<DigitalBodyTwin>(defaultBodyTwin);
  const [savedBodyTwin, setSavedBodyTwin] = useState<DigitalBodyTwin | null>(null);
  const [mode, setMode] = useState<'loading' | 'view' | 'edit' | 'add'>('loading');
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [measurementErrors, setMeasurementErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isUHNI) router.replace('/uhni/body-twin');
  }, [isUHNI, router]);

  // Load existing Body Twin data on mount
  useEffect(() => {
    const loadBodyTwin = async () => {
      try {
        const data = await getDigitalBodyTwin();
        if (data) {
          setBodyTwin(data);
          setSavedBodyTwin(data);
          setMode('view');
          // Also sync to localStorage for product page
          localStorage.setItem('moda-body-twin', JSON.stringify(data));
        } else {
          setMode('add');
        }
      } catch {
        // API unavailable — fall back to localStorage
        try {
          const stored = localStorage.getItem('moda-body-twin');
          if (stored) {
            const parsed = JSON.parse(stored);
            setBodyTwin(parsed);
            setSavedBodyTwin(parsed);
            setMode('view');
          } else {
            setMode('add');
          }
        } catch {
          setMode('add');
        }
      }
      setIsLoaded(true);
    };
    loadBodyTwin();
  }, []);

  const steps = [
    { title: 'Silhouette', description: 'Your overall body type' },
    { title: 'Proportions', description: 'Your body proportions' },
    { title: 'Fit Preferences', description: 'How you like clothes to fit' },
    { title: 'Measurements', description: 'Your precise measurements' },
  ];

  const measurementRanges: Record<string, { min: number; max: number; label: string }> = {
    height: { min: 100, max: 250, label: 'Height' },
    bust: { min: 50, max: 180, label: 'Chest' },
    waist: { min: 40, max: 160, label: 'Waist' },
    hips: { min: 50, max: 180, label: 'Hips' },
    inseam: { min: 50, max: 100, label: 'Inseam' },
  };

  const validateMeasurements = (): boolean => {
    const errors: Record<string, string> = {};
    const m = bodyTwin.measurements;
    Object.entries(measurementRanges).forEach(([key, range]) => {
      const value = m?.[key as keyof typeof m];
      if (value === undefined || value === null) {
        errors[key] = `${range.label} is required`;
      } else if (value < range.min || value > range.max) {
        errors[key] = `${range.label} must be ${range.min}-${range.max} cm`;
      }
    });
    setMeasurementErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMeasurementChange = (key: string, value: string) => {
    const parsed = parseInt(value) || undefined;
    setBodyTwin({
      ...bodyTwin,
      measurements: { ...bodyTwin.measurements, [key]: parsed }
    });
    if (measurementErrors[key]) {
      setMeasurementErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const handleSave = async () => {
    if (!validateMeasurements()) {
      showToast('Please fill in all required measurements', 'error');
      return;
    }

    setSaving(true);
    try {
      let result: DigitalBodyTwin;

      if (savedBodyTwin) {
        // Update existing
        result = await updateDigitalBodyTwin(bodyTwin);
      } else {
        // Create new
        result = await createDigitalBodyTwin(bodyTwin);
      }

      setBodyTwin(result);
      setSavedBodyTwin(result);
      localStorage.setItem('moda-body-twin', JSON.stringify(result));
      setMode('view');
      setActiveStep(0);
      showToast('Body Twin saved successfully', 'success');
    } catch {
      // API failed — save to localStorage as fallback
      try {
        localStorage.setItem('moda-body-twin', JSON.stringify(bodyTwin));
        setSavedBodyTwin(bodyTwin);
        setMode('view');
        setActiveStep(0);
        showToast('Saved locally. Will sync when connected.', 'success');
      } catch (localErr) {
        console.error('Failed to save body twin:', localErr);
        showToast('Failed to save Body Twin. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = () => {
    setActiveStep(0);
    setMode('edit');
  };

  const handleStartAdd = () => {
    setBodyTwin(defaultBodyTwin);
    setActiveStep(0);
    setMode('edit');
  };

  const handleCancel = () => {
    if (savedBodyTwin) {
      setBodyTwin(savedBodyTwin);
      setMode('view');
    } else {
      setMode('add');
    }
    setActiveStep(0);
    setMeasurementErrors({});
  };

  if (isUHNI) return null;

  const isEditMode = mode === 'edit';

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      {/* Luxury Header */}
      <div className="relative bg-gradient-to-b from-charcoal-deep to-noir overflow-hidden border-b border-sand/20">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-gold-soft/5 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-gold-soft/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-16 lg:py-20 relative z-10">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-3 text-xs tracking-[0.15em] uppercase text-sand hover:text-gold-soft transition-colors mb-12"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return to Profile
          </Link>

          <div className={`flex items-start md:items-center gap-6 md:gap-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-gradient-to-br from-sand/10 to-transparent border border-gold-soft/20 flex items-center justify-center rounded-sm backdrop-blur-sm shadow-xl">
              <User size={28} className="text-gold-soft/80" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-[1px] bg-gold-soft/40" />
                <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft block">
                  Intelligence Profile
                </span>
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                Digital Body Twin
              </h1>
              <p className="text-taupe mt-3 text-sm md:text-base font-light max-w-md leading-relaxed">
                {mode === 'view' ? 'Your precise physical architecture, saved for perfect fit predictions and bespoke curation.' : 'Abstract physical representation for immaculate, personalized recommendations.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Loading State */}
        {mode === 'loading' && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-stone">Loading your Body Twin...</p>
          </div>
        )}

        {/* Empty / Add State */}
        {mode === 'add' && <BodyTwinEmpty onAdd={handleStartAdd} />}

        {/* View Mode */}
        {mode === 'view' && (
          <BodyTwinView bodyTwin={bodyTwin} onEdit={handleStartEdit} />
        )}

        {/* Edit Mode (multi-step form) */}
        {isEditMode && (
          <>
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`flex-1 relative ${index !== steps.length - 1 ? 'pr-4' : ''}`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors ${
                      index <= activeStep
                        ? 'bg-charcoal-deep text-ivory-cream'
                        : 'bg-sand text-stone'
                    }`}>
                      {index < activeStep ? <Check size={16} /> : `0${index + 1}`}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ml-2 ${
                        index < activeStep ? 'bg-charcoal-deep' : 'bg-sand'
                      }`} />
                    )}
                  </div>
                  <p className={`text-xs mt-3 ${index === activeStep ? 'text-charcoal-deep font-medium' : 'text-stone'}`}>
                    {step.title}
                  </p>
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="bg-white p-8 lg:p-10 mb-8">
              {/* Step 0: Silhouette */}
              {activeStep === 0 && (
                <div>
                  <h2 className="font-display text-xl text-charcoal-deep mb-3">Select Your Silhouette</h2>
                  <p className="text-stone mb-8">Choose the option that best describes your overall body type</p>

                  <div className="grid gap-3">
                    {silhouetteOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBodyTwin({ ...bodyTwin, silhouette: option.value })}
                        className={`p-5 border-2 text-left transition-all ${
                          bodyTwin.silhouette === option.value
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-charcoal-deep'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-charcoal-deep">{option.label}</p>
                            <p className="text-sm text-stone">{option.description}</p>
                          </div>
                          {bodyTwin.silhouette === option.value && (
                            <div className="w-6 h-6 bg-charcoal-deep flex items-center justify-center">
                              <Check size={14} className="text-ivory-cream" />
                            </div>
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
                  <h2 className="font-display text-xl text-charcoal-deep mb-3">Your Proportions</h2>
                  <p className="text-stone mb-8">Help us understand your body proportions for better fit recommendations</p>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Shoulder Width</p>
                      <div className="flex gap-3">
                        {proportionOptions.shoulder.map((option) => (
                          <button
                            key={option}
                            onClick={() => setBodyTwin({
                              ...bodyTwin,
                              proportions: { ...bodyTwin.proportions, shoulder: option as 'narrow' | 'medium' | 'broad' }
                            })}
                            className={`flex-1 py-4 border-2 capitalize transition-all ${
                              bodyTwin.proportions.shoulder === option
                                ? 'border-charcoal-deep bg-parchment'
                                : 'border-sand hover:border-charcoal-deep'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Torso Length</p>
                      <div className="flex gap-3">
                        {proportionOptions.torso.map((option) => (
                          <button
                            key={option}
                            onClick={() => setBodyTwin({
                              ...bodyTwin,
                              proportions: { ...bodyTwin.proportions, torso: option as 'short' | 'medium' | 'long' }
                            })}
                            className={`flex-1 py-4 border-2 capitalize transition-all ${
                              bodyTwin.proportions.torso === option
                                ? 'border-charcoal-deep bg-parchment'
                                : 'border-sand hover:border-charcoal-deep'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Leg Length</p>
                      <div className="flex gap-3">
                        {proportionOptions.legs.map((option) => (
                          <button
                            key={option}
                            onClick={() => setBodyTwin({
                              ...bodyTwin,
                              proportions: { ...bodyTwin.proportions, legs: option as 'short' | 'medium' | 'long' }
                            })}
                            className={`flex-1 py-4 border-2 capitalize transition-all ${
                              bodyTwin.proportions.legs === option
                                ? 'border-charcoal-deep bg-parchment'
                                : 'border-sand hover:border-charcoal-deep'
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
                  <h2 className="font-display text-xl text-charcoal-deep mb-3">Fit Preferences</h2>
                  <p className="text-stone mb-8">How do you prefer your clothes to fit?</p>

                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">General Preference</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fitOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => setBodyTwin({
                            ...bodyTwin,
                            preferredFit: option as 'fitted' | 'regular' | 'relaxed' | 'oversized'
                          })}
                          className={`py-5 border-2 capitalize transition-all ${
                            bodyTwin.preferredFit === option
                              ? 'border-charcoal-deep bg-parchment'
                              : 'border-sand hover:border-charcoal-deep'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">By Category</p>
                    <div className="space-y-3">
                      {Object.entries(bodyTwin.fitPreferences).map(([category, preference]) => (
                        <div key={category} className="flex items-center justify-between p-5 bg-parchment">
                          <span className="capitalize text-charcoal-deep">{category}</span>
                          <select
                            value={preference}
                            onChange={(e) => setBodyTwin({
                              ...bodyTwin,
                              fitPreferences: { ...bodyTwin.fitPreferences, [category]: e.target.value }
                            })}
                            className="px-4 py-2 bg-white border border-sand text-sm focus:outline-none focus:border-charcoal-deep"
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
                  <h2 className="font-display text-xl text-charcoal-deep mb-3">Measurements</h2>
                  <p className="text-stone mb-8">Enter your measurements for accurate fit predictions</p>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(measurementRanges).map(([key, range]) => (
                      <div key={key}>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3 block">
                          {range.label} (cm)
                          <span className="text-taupe ml-2 normal-case tracking-normal">{range.min}-{range.max}</span>
                        </label>
                        <input
                          type="number"
                          min={range.min}
                          max={range.max}
                          value={bodyTwin.measurements?.[key as keyof typeof bodyTwin.measurements] || ''}
                          onChange={(e) => handleMeasurementChange(key, e.target.value)}
                          placeholder={String(Math.round((range.min + range.max) / 2))}
                          className={`w-full px-5 py-4 border focus:outline-none focus:border-charcoal-deep transition-colors ${
                            measurementErrors[key] ? 'border-red-400' : 'border-sand'
                          }`}
                        />
                        {measurementErrors[key] && (
                          <p className="text-xs text-red-500 mt-1">{measurementErrors[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-5 bg-parchment border border-sand">
                    <div className="flex items-start gap-3">
                      <Shield size={18} className="text-stone mt-0.5" />
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
              {activeStep === 0 ? (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-8 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  <ChevronLeft size={16} />
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="flex items-center gap-2 px-8 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}

              <div className="flex gap-3">
                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Body Twin
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
