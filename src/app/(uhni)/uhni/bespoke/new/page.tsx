'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Ruler, Palette,
  Scissors, Crown, AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BespokeDetailedSpec } from '@/types';

type OrderType = 'made_to_measure' | 'custom_design' | 'modification';

interface FormData {
  title: string;
  type: OrderType | '';
  description: string;
  estimatedBudget: number;
  requestedDeadline: string;
  spec: BespokeDetailedSpec;
}

const initialForm: FormData = {
  title: '',
  type: '',
  description: '',
  estimatedBudget: 0,
  requestedDeadline: '',
  spec: {
    measurements: {},
    fabricPreferences: '',
    colorPreferences: '',
    specialInstructions: '',
    occasionContext: '',
  },
};

export default function NewBespokeOrderPage() {
  const router = useRouter();
  const { createBespokeOrder, isUHNI } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center p-8">
        <div className="text-center">
          <Crown size={48} className="mx-auto text-taupe mb-4" />
          <p className="text-stone">This feature is available to UHNI members only.</p>
          <Link href="/uhni" className="mt-4 inline-block text-sm text-gold-muted hover:text-gold-deep transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const validateStep1 = () => {
    const errs: string[] = [];
    if (!formData.title.trim()) errs.push('Title is required');
    if (!formData.type) errs.push('Please select an order type');
    if (formData.estimatedBudget <= 0) errs.push('Please enter an estimated budget');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    setErrors([]);
    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setErrors([]);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    if (!formData.type) return;
    createBespokeOrder({
      title: formData.title,
      type: formData.type as OrderType,
      description: formData.description,
      detailedSpec: formData.spec,
      estimatedBudget: formData.estimatedBudget,
      requestedDeadline: formData.requestedDeadline || undefined,
    });
    setSubmitted(true);
  };

  const updateMeasurement = (key: string, value: string) => {
    const num = value === '' ? undefined : Number(value);
    setFormData(prev => ({
      ...prev,
      spec: {
        ...prev.spec,
        measurements: {
          ...prev.spec.measurements,
          [key]: num,
        },
      },
    }));
  };

  const typeOptions: { value: OrderType; label: string; desc: string; icon: typeof Ruler }[] = [
    { value: 'made_to_measure', label: 'Made to Measure', desc: 'Your exact measurements applied to an existing design', icon: Ruler },
    { value: 'custom_design', label: 'Custom Design', desc: 'Original piece designed from scratch for you', icon: Palette },
    { value: 'modification', label: 'Modification', desc: 'Alterations or customisation to an existing piece', icon: Scissors },
  ];

  const measurementFields = [
    { key: 'chest', label: 'Chest (cm)' },
    { key: 'waist', label: 'Waist (cm)' },
    { key: 'hips', label: 'Hips (cm)' },
    { key: 'shoulders', label: 'Shoulders (cm)' },
    { key: 'inseam', label: 'Inseam (cm)' },
    { key: 'sleeveLength', label: 'Sleeve Length (cm)' },
    { key: 'height', label: 'Height (cm)' },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gold-soft/20 flex items-center justify-center mx-auto mb-6">
            <Crown size={40} className="text-gold-soft" />
          </div>
          <h2 className="font-display text-2xl text-charcoal-deep mb-3">
            Your Bespoke Request Has Been Submitted
          </h2>
          <p className="text-stone text-sm mb-8">
            Our atelier team will review your request and contact you within 48 hours to arrange your initial consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/uhni/bespoke"
              className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/uhni"
              className="px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 py-12">
          <Link
            href="/uhni/bespoke"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Bespoke Orders
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
              <Crown size={28} className="text-gold-soft" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-ivory-cream">New Bespoke Commission</h1>
              <p className="text-sm text-stone mt-1">Step {currentStep} of 3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-8 md:px-16 py-12">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-error/10 border border-error/20 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-error" />
              <span className="text-sm font-medium text-error">Please fix the following:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-error space-y-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* STEP 1 — Order Details */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Order Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Evening Gown for Met Gala"
                className="w-full border border-sand px-4 py-3 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">
                Order Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {typeOptions.map(opt => {
                  const Icon = opt.icon;
                  const selected = formData.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFormData(prev => ({ ...prev, type: opt.value }))}
                      className={`p-6 border text-left transition-colors ${
                        selected
                          ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                          : 'border-sand bg-white hover:border-charcoal-deep'
                      }`}
                    >
                      <Icon size={24} className={`mb-3 ${selected ? 'text-gold-soft' : 'text-stone'}`} />
                      <p className={`text-sm font-medium mb-1 ${selected ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-xs ${selected ? 'text-sand' : 'text-taupe'}`}>
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Describe your vision, inspiration, references..."
                className="w-full border border-sand px-4 py-3 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Estimated Budget (€) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-taupe">€</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedBudget || ''}
                    onChange={e => setFormData(prev => ({ ...prev, estimatedBudget: Number(e.target.value) }))}
                    placeholder="5000"
                    className="w-full border border-sand pl-8 pr-4 py-3 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Requested Deadline (optional)
                </label>
                <input
                  type="date"
                  value={formData.requestedDeadline}
                  onChange={e => setFormData(prev => ({ ...prev, requestedDeadline: e.target.value }))}
                  className="w-full border border-sand px-4 py-3 text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Measurements & Specifications */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-parchment border border-sand/50 p-4">
              <p className="text-sm text-stone">
                Measurements are optional at this stage. Your concierge will arrange a fitting consultation after your request is reviewed.
              </p>
            </div>

            <div>
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">
                Body Measurements (optional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {measurementFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs text-stone mb-1">{field.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.spec.measurements?.[field.key as keyof typeof formData.spec.measurements] ?? ''}
                      onChange={e => updateMeasurement(field.key, e.target.value)}
                      placeholder="—"
                      className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-xs text-stone mb-1">Measurement Notes</label>
                <textarea
                  value={formData.spec.measurements?.notes || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    spec: {
                      ...prev.spec,
                      measurements: { ...prev.spec.measurements, notes: e.target.value },
                    },
                  }))}
                  rows={2}
                  placeholder="Any additional measurement notes..."
                  className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">
                Design Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-stone mb-1">Fabric Preferences</label>
                  <textarea
                    value={formData.spec.fabricPreferences || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      spec: { ...prev.spec, fabricPreferences: e.target.value },
                    }))}
                    rows={2}
                    placeholder="Silk, cashmere, avoid synthetics..."
                    className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone mb-1">Color Preferences</label>
                  <textarea
                    value={formData.spec.colorPreferences || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      spec: { ...prev.spec, colorPreferences: e.target.value },
                    }))}
                    rows={2}
                    placeholder="Deep navy, champagne, avoid black..."
                    className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone mb-1">Occasion Context</label>
                  <input
                    type="text"
                    value={formData.spec.occasionContext || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      spec: { ...prev.spec, occasionContext: e.target.value },
                    }))}
                    placeholder="Black tie gala, wedding, business..."
                    className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone mb-1">Special Instructions</label>
                  <textarea
                    value={formData.spec.specialInstructions || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      spec: { ...prev.spec, specialInstructions: e.target.value },
                    }))}
                    rows={3}
                    placeholder="Any special requirements or instructions..."
                    className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white border border-sand/50 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-parchment text-[10px] tracking-[0.15em] uppercase text-stone">
                  {formData.type && typeOptions.find(t => t.value === formData.type)?.label}
                </span>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Title</p>
                <p className="text-charcoal-deep font-medium">{formData.title}</p>
              </div>
              {formData.description && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Description</p>
                  <p className="text-sm text-stone">{formData.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sand/30">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Budget</p>
                  <p className="text-lg font-display text-charcoal-deep">€{formData.estimatedBudget.toLocaleString()}</p>
                </div>
                {formData.requestedDeadline && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Deadline</p>
                    <p className="text-sm text-charcoal-deep">
                      {new Date(formData.requestedDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Measurements Summary */}
              <div className="pt-2 border-t border-sand/30">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Measurements</p>
                {(() => {
                  const m = formData.spec.measurements || {};
                  const filled = Object.entries(m).filter(([k, v]) => k !== 'notes' && v !== undefined && v !== '');
                  if (filled.length === 0) {
                    return <p className="text-xs text-stone italic">To be confirmed at fitting</p>;
                  }
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      {filled.map(([key, val]) => (
                        <div key={key} className="text-center p-2 bg-parchment/30">
                          <p className="text-sm font-medium text-charcoal-deep">{String(val)}</p>
                          <p className="text-[10px] text-taupe capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Preferences Summary */}
              {(formData.spec.fabricPreferences || formData.spec.colorPreferences || formData.spec.occasionContext) && (
                <div className="pt-2 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Design Preferences</p>
                  <div className="space-y-1 text-sm text-stone">
                    {formData.spec.fabricPreferences && <p>Fabric: {formData.spec.fabricPreferences}</p>}
                    {formData.spec.colorPreferences && <p>Color: {formData.spec.colorPreferences}</p>}
                    {formData.spec.occasionContext && <p>Occasion: {formData.spec.occasionContext}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Deposit Info */}
            <div className="bg-parchment border border-sand/50 p-4">
              <p className="text-sm text-stone">
                A 50% deposit of approximately <span className="font-medium text-charcoal-deep">€{Math.round(formData.estimatedBudget / 2).toLocaleString()}</span> will
                be required upon design approval. Final payment on delivery.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-sand/50">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
            >
              <Check size={16} />
              Submit Bespoke Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
