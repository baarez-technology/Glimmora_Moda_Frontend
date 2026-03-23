'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { ArrowLeft, Palette, Sparkles, Target, MapPin, Compass, Pencil, Save, X, Briefcase, Users, Sun, Star, Plane } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { setUserContext, getStoredUserToken } from '@/services/auth.service';
import { invalidateRecommendationsCache } from '@/services/recommendation.service';
import type { FashionIdentity } from '@/types';

// Must match the onboarding IDs and backend API expectations
const ALL_OCCASIONS = [
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'social', label: 'Social Events', icon: Users },
  { id: 'casual', label: 'Casual Daily', icon: Sun },
  { id: 'formal', label: 'Formal', icon: Star },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'art', label: 'Art & Culture', icon: Palette },
];

const ALL_AESTHETICS = [
  { id: 'minimal', label: 'Minimal & Structured' },
  { id: 'classic', label: 'Classic & Timeless' },
  { id: 'artistic', label: 'Artistic & Expressive' },
  { id: 'contemporary', label: 'Bold & Contemporary' },
];

const CONFIDENCE_OPTIONS: { value: FashionIdentity['confidenceLevel']; label: string; description: string }[] = [
  { value: 'decisive', label: 'Decisive', description: 'You know exactly what you want' },
  { value: 'guided', label: 'Guided', description: 'You appreciate thoughtful recommendations' },
  { value: 'advisory', label: 'Advisory', description: 'You prefer expert curation' }
];

type EditingSection = 'occasions' | 'aesthetics' | 'confidence' | 'budget' | 'locations' | null;

export default function StyleDNAPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { fashionIdentity, updateFashionIdentity, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);

  // Draft state for editing
  const [draftOccasions, setDraftOccasions] = useState<string[]>([]);
  const [draftAesthetics, setDraftAesthetics] = useState<string[]>([]);
  const [draftConfidence, setDraftConfidence] = useState<FashionIdentity['confidenceLevel']>('guided');
  const [draftBudgetMin, setDraftBudgetMin] = useState(0);
  const [draftBudgetMax, setDraftBudgetMax] = useState(0);
  const [draftPrimaryLocation, setDraftPrimaryLocation] = useState('');
  const [draftTravelDestinations, setDraftTravelDestinations] = useState('');

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

  const startEditing = useCallback((section: EditingSection) => {
    if (!fashionIdentity) return;
    switch (section) {
      case 'occasions':
        // Filter to only valid IDs to prevent ghost entries
        setDraftOccasions(fashionIdentity.occasions.filter(id => ALL_OCCASIONS.some(o => o.id === id)));
        break;
      case 'aesthetics':
        setDraftAesthetics(fashionIdentity.aesthetics.filter(id => ALL_AESTHETICS.some(a => a.id === id)));
        break;
      case 'confidence':
        setDraftConfidence(fashionIdentity.confidenceLevel);
        break;
      case 'budget':
        setDraftBudgetMin(fashionIdentity.budgetRange?.min ?? 0);
        setDraftBudgetMax(fashionIdentity.budgetRange?.max ?? 1000);
        break;
      case 'locations':
        setDraftPrimaryLocation(fashionIdentity.primaryLocation);
        setDraftTravelDestinations(fashionIdentity.travelDestinations.join(', '));
        break;
    }
    setEditingSection(section);
  }, [fashionIdentity]);

  const cancelEditing = () => {
    setEditingSection(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingSection) {
        setEditingSection(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingSection]);

  const saveSection = useCallback(async (section: EditingSection) => {
    if (!fashionIdentity || !section) return;

    let updated: FashionIdentity;

    switch (section) {
      case 'occasions':
        if (draftOccasions.length === 0) {
          showToast('Please select at least one occasion', 'error');
          return;
        }
        updated = { ...fashionIdentity, occasions: draftOccasions };
        break;
      case 'aesthetics':
        if (draftAesthetics.length === 0) {
          showToast('Please select at least one aesthetic', 'error');
          return;
        }
        updated = { ...fashionIdentity, aesthetics: draftAesthetics };
        break;
      case 'confidence':
        updated = { ...fashionIdentity, confidenceLevel: draftConfidence };
        break;
      case 'budget':
        if (draftBudgetMin < 0 || draftBudgetMax < 0) {
          showToast('Budget values must be positive', 'error');
          return;
        }
        if (draftBudgetMin >= draftBudgetMax) {
          showToast('Maximum must be greater than minimum', 'error');
          return;
        }
        updated = { ...fashionIdentity, budgetRange: { min: draftBudgetMin, max: draftBudgetMax } };
        break;
      case 'locations':
        if (!draftPrimaryLocation.trim()) {
          showToast('Primary location is required', 'error');
          return;
        }
        updated = {
          ...fashionIdentity,
          primaryLocation: draftPrimaryLocation.trim(),
          travelDestinations: draftTravelDestinations
            .split(',')
            .map(d => d.trim())
            .filter(Boolean)
        };
        break;
      default:
        return;
    }

    // Update local state + localStorage
    updateFashionIdentity(updated);
    setEditingSection(null);

    // Sync occasions/aesthetics/budget to the backend so recommendations update
    const token = getStoredUserToken();
    if (token) {
      try {
        await setUserContext({
          occasions: updated.occasions,
          aesthetics: updated.aesthetics,
          minimum_budget: updated.budgetRange?.min ?? 0,
          maximum_budget: updated.budgetRange?.max ?? 0,
        });
        // Clear cached recommendations so next page visit gets fresh results
        invalidateRecommendationsCache();
      } catch (err) {
        console.log('[style-dna] Failed to sync preferences to backend:', err);
      }
    }
  }, [fashionIdentity, draftOccasions, draftAesthetics, draftConfidence, draftBudgetMin, draftBudgetMax, draftPrimaryLocation, draftTravelDestinations, updateFashionIdentity, showToast]);

  const toggleOccasion = (occasion: string) => {
    setDraftOccasions(prev =>
      prev.includes(occasion)
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
  };

  const toggleAesthetic = (aesthetic: string) => {
    setDraftAesthetics(prev =>
      prev.includes(aesthetic)
        ? prev.filter(a => a !== aesthetic)
        : [...prev, aesthetic]
    );
  };

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

  const EditButton = ({ section }: { section: EditingSection }) => (
    <button
      onClick={() => startEditing(section)}
      className="p-2 hover:bg-sand/20 transition-colors text-stone hover:text-charcoal-deep"
      title={`Edit ${section}`}
    >
      <Pencil size={16} />
    </button>
  );

  const SaveCancelButtons = ({ section }: { section: EditingSection }) => (
    <div className="flex gap-3 mt-6">
      <button
        onClick={cancelEditing}
        className="flex items-center gap-2 px-5 py-2.5 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-wider uppercase"
      >
        <X size={14} />
        Cancel
      </button>
      <button
        onClick={() => saveSection(section)}
        className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase"
      >
        <Save size={14} />
        Save
      </button>
    </div>
  );

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
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                    <Target size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Occasion Preferences</h2>
                    <p className="text-sm text-stone">Your lifestyle occasions</p>
                  </div>
                </div>
                {editingSection !== 'occasions' && <EditButton section="occasions" />}
              </div>

              {editingSection === 'occasions' ? (
                <div>
                  <div className="flex flex-wrap gap-3">
                    {ALL_OCCASIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => toggleOccasion(option.id)}
                        className={`px-4 py-2 text-sm tracking-[0.05em] transition-colors border ${
                          draftOccasions.includes(option.id)
                            ? 'bg-charcoal-deep text-ivory-cream border-charcoal-deep'
                            : 'bg-parchment text-stone border-sand hover:border-charcoal-deep hover:text-charcoal-deep'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <SaveCancelButtons section="occasions" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {fashionIdentity.occasions.map(occasion => (
                    <span
                      key={occasion}
                      className="px-4 py-2 bg-parchment text-charcoal-deep text-sm tracking-[0.05em] capitalize"
                    >
                      {ALL_OCCASIONS.find(o => o.id === occasion)?.label || occasion}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Aesthetics */}
            <div className="bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                    <Palette size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Style Aesthetics</h2>
                    <p className="text-sm text-stone">Your design language</p>
                  </div>
                </div>
                {editingSection !== 'aesthetics' && <EditButton section="aesthetics" />}
              </div>

              {editingSection === 'aesthetics' ? (
                <div>
                  <div className="flex flex-wrap gap-3">
                    {ALL_AESTHETICS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => toggleAesthetic(option.id)}
                        className={`px-4 py-2 text-sm tracking-[0.05em] transition-colors border ${
                          draftAesthetics.includes(option.id)
                            ? 'bg-charcoal-deep text-ivory-cream border-charcoal-deep'
                            : 'bg-gold-soft/10 text-stone border-gold-soft/30 hover:border-charcoal-deep hover:text-charcoal-deep'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <SaveCancelButtons section="aesthetics" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {fashionIdentity.aesthetics.map(aesthetic => (
                    <span
                      key={aesthetic}
                      className="px-4 py-2 bg-gold-soft/10 text-gold-deep text-sm tracking-[0.05em] capitalize"
                    >
                      {ALL_AESTHETICS.find(a => a.id === aesthetic)?.label || aesthetic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confidence Level */}
            <div className="bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                    <Compass size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Shopping Confidence</h2>
                    <p className="text-sm text-stone">How you like to shop</p>
                  </div>
                </div>
                {editingSection !== 'confidence' && <EditButton section="confidence" />}
              </div>

              {editingSection === 'confidence' ? (
                <div>
                  <div className="space-y-3">
                    {CONFIDENCE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setDraftConfidence(option.value)}
                        className={`w-full flex items-center gap-4 px-5 py-4 border transition-colors text-left ${
                          draftConfidence === option.value
                            ? 'border-charcoal-deep bg-charcoal-deep/5'
                            : 'border-sand hover:border-charcoal-deep/50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          draftConfidence === option.value
                            ? 'border-charcoal-deep'
                            : 'border-stone/40'
                        }`}>
                          {draftConfidence === option.value && (
                            <div className="w-2 h-2 rounded-full bg-charcoal-deep" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-charcoal-deep">{option.label}</span>
                          <span className="text-xs text-stone ml-2">— {option.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <SaveCancelButtons section="confidence" />
                </div>
              ) : (
                confidenceInfo && (
                  <div className={`inline-flex items-center gap-3 px-5 py-3 ${confidenceInfo.color}`}>
                    <span className="text-sm font-medium">{confidenceInfo.label}</span>
                    <span className="text-xs opacity-80">— {confidenceInfo.description}</span>
                  </div>
                )
              )}
            </div>

            {/* Budget Range */}
            <div className="bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                    <Sparkles size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Budget Range</h2>
                    <p className="text-sm text-stone">Your comfort zone</p>
                  </div>
                </div>
                {editingSection !== 'budget' && <EditButton section="budget" />}
              </div>

              {editingSection === 'budget' ? (
                <div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Minimum (&euro;)</label>
                      <input
                        type="number"
                        value={draftBudgetMin}
                        onChange={e => setDraftBudgetMin(Number(e.target.value))}
                        min={0}
                        className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Maximum (&euro;)</label>
                      <input
                        type="number"
                        value={draftBudgetMax}
                        onChange={e => setDraftBudgetMax(Number(e.target.value))}
                        min={0}
                        className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                  </div>
                  <SaveCancelButtons section="budget" />
                </div>
              ) : (
                fashionIdentity.budgetRange ? (
                  <div className="text-center">
                    <p className="font-display text-2xl text-charcoal-deep">
                      {(() => {
                        const { min, max } = fashionIdentity.budgetRange;
                        if (min === 0 && max >= 1000000) return 'No Preference';
                        if (min === 0 && max <= 1000) return `Up to ${formatPrice(max)}`;
                        if (min >= 5000 && max >= 1000000) return `${formatPrice(min)}+`;
                        return `${formatPrice(min)} — ${formatPrice(max)}`;
                      })()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-stone">No budget range set. Click edit to add one.</p>
                )
              )}
            </div>

            {/* Location */}
            <div className="bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-charcoal-deep/5 flex items-center justify-center">
                    <MapPin size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">Lifestyle Locations</h2>
                    <p className="text-sm text-stone">Where you wear your style</p>
                  </div>
                </div>
                {editingSection !== 'locations' && <EditButton section="locations" />}
              </div>

              {editingSection === 'locations' ? (
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Primary Location</label>
                      <input
                        type="text"
                        value={draftPrimaryLocation}
                        onChange={e => setDraftPrimaryLocation(e.target.value)}
                        className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Travel Destinations (comma-separated)</label>
                      <input
                        type="text"
                        value={draftTravelDestinations}
                        onChange={e => setDraftTravelDestinations(e.target.value)}
                        placeholder="Paris, Milan, Tokyo"
                        className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                  </div>
                  <SaveCancelButtons section="locations" />
                </div>
              ) : (
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
              )}
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
