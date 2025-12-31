'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Search, Upload, Calendar, DollarSign, Tag, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { SourcingRequestType } from '@/types';

export default function NewSourcingRequestPage() {
  const router = useRouter();
  const { isUHNI, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '' as SourcingRequestType | '',
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    budgetFlexible: false,
    deadline: '',
    occasion: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (!isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, router]);

  if (!isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const requestTypes: { value: SourcingRequestType; label: string; description: string }[] = [
    {
      value: 'specific_item',
      label: 'Specific Item',
      description: 'You know exactly what you want - a particular product, model, or vintage piece'
    },
    {
      value: 'category',
      label: 'Category Search',
      description: 'Looking for options within a category (e.g., a classic black handbag)'
    },
    {
      value: 'occasion',
      label: 'For an Occasion',
      description: 'Need something special for an event or occasion'
    },
    {
      value: 'bespoke',
      label: 'Bespoke Commission',
      description: 'Custom-made or made-to-measure piece'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Sourcing request submitted! Your concierge will review it shortly.', 'success');
    router.push('/profile/sourcing');
  };

  const canProceed = () => {
    if (step === 1) return formData.type !== '';
    if (step === 2) return formData.title.trim() !== '' && formData.description.trim() !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile/sourcing"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Sourcing
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Sourcing Request
            </h1>
            <p className="text-sand mt-3">Tell us what you're looking for</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 flex items-center justify-center text-sm transition-colors ${
                s === step ? 'bg-charcoal-deep text-ivory-cream' :
                s < step ? 'bg-success text-ivory-cream' : 'bg-sand text-stone'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 ${s < step ? 'bg-success' : 'bg-sand'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Request Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-2">What type of request?</h2>
                <p className="text-stone">Select the category that best describes your search</p>
              </div>

              <div className="grid gap-4">
                {requestTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-6 text-left border transition-all ${
                      formData.type === type.value
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-charcoal-deep bg-white'
                    }`}
                  >
                    <p className="font-display text-lg text-charcoal-deep mb-1">{type.label}</p>
                    <p className="text-sm text-stone">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-2">Describe what you're looking for</h2>
                <p className="text-stone">Provide as much detail as possible to help us find the perfect piece</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Hermès Birkin 25 in Gold Togo"
                    className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the item in detail - specific features, colors, materials, condition preferences, etc."
                    rows={5}
                    className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                    required
                  />
                </div>

                {/* Reference Images */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                    Reference Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-sand p-8 text-center bg-white">
                    <Upload size={32} className="mx-auto text-stone mb-4" />
                    <p className="text-sm text-stone mb-2">Drag and drop images here, or click to browse</p>
                    <p className="text-xs text-taupe">PNG, JPG up to 10MB each</p>
                    <button type="button" className="mt-4 px-6 py-2 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm">
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-2">Additional preferences</h2>
                <p className="text-stone">Help us narrow down the search with your preferences</p>
              </div>

              <div className="space-y-6">
                {/* Budget */}
                <div className="bg-white p-6 border border-sand">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign size={18} className="text-stone" />
                    <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep">
                      Budget Range (Optional)
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        placeholder="Min €"
                        className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep placeholder:text-taupe focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        placeholder="Max €"
                        className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep placeholder:text-taupe focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.budgetFlexible}
                      onChange={(e) => setFormData({ ...formData, budgetFlexible: e.target.checked })}
                      className="w-5 h-5 accent-charcoal-deep"
                    />
                    <span className="text-sm text-stone">Budget is flexible for the right piece</span>
                  </label>
                </div>

                {/* Deadline */}
                <div className="bg-white p-6 border border-sand">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar size={18} className="text-stone" />
                    <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep">
                      Deadline (Optional)
                    </label>
                  </div>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                  />
                  <p className="text-xs text-taupe mt-2">When do you need this item by?</p>
                </div>

                {/* Occasion */}
                {formData.type === 'occasion' && (
                  <div className="bg-white p-6 border border-sand">
                    <div className="flex items-center gap-3 mb-4">
                      <Tag size={18} className="text-stone" />
                      <label className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep">
                        Occasion
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      placeholder="e.g., Wedding, Gala, Business Meeting"
                      className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep placeholder:text-taupe focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                    />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-parchment p-6 border border-sand">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-stone" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">Request Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-taupe">Type:</span> <span className="text-charcoal-deep">{requestTypes.find(t => t.value === formData.type)?.label}</span></p>
                  <p><span className="text-taupe">Title:</span> <span className="text-charcoal-deep">{formData.title || '-'}</span></p>
                  {formData.budgetMin && formData.budgetMax && (
                    <p><span className="text-taupe">Budget:</span> <span className="text-charcoal-deep">€{formData.budgetMin} - €{formData.budgetMax}</span></p>
                  )}
                  {formData.deadline && (
                    <p><span className="text-taupe">Deadline:</span> <span className="text-charcoal-deep">{new Date(formData.deadline).toLocaleDateString()}</span></p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-8 border-t border-sand">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-sm tracking-[0.15em] uppercase">Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm tracking-[0.15em] uppercase">Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
              >
                <span className="text-sm tracking-[0.15em] uppercase">Submit Request</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
