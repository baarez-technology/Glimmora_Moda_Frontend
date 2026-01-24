'use client';

import Link from 'next/link';
import { X, Sparkles, User, ArrowRight } from 'lucide-react';
import type { Product, Brand, DigitalBodyTwin, FitConfidence } from '@/types';

interface PersonalizationMatch {
  score: number;
  reasons: string[];
  wardrobeItems: number;
}

interface ProductConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  brand?: Brand | null;
  bodyTwin?: DigitalBodyTwin;
  fitConfidence: FitConfidence;
  personalizationMatch: PersonalizationMatch | null;
  relatedProducts: Product[];
  sizeVariants: Product['variants'];
}

export default function ProductConcierge({
  isOpen,
  onClose,
  product,
  brand,
  bodyTwin,
  fitConfidence,
  personalizationMatch,
  relatedProducts,
  sizeVariants
}: ProductConciergeProps) {
  if (!isOpen) return null;

  const questions = [
    {
      q: 'Will this fit me?',
      a: `Based on ${brand?.name}'s sizing, this piece ${sizeVariants.length > 0 ? `runs ${fitConfidence.sizeNotes[0]?.toLowerCase() || 'true to size'}` : 'follows standard luxury sizing'}. ${bodyTwin ? 'With your Body Twin data, I can provide a more precise recommendation.' : 'Set up your Body Twin for personalized fit predictions.'}`
    },
    {
      q: 'How does this compare to similar pieces?',
      a: `The ${product.name} distinguishes itself through ${product.craftsmanship[0]?.title || 'exceptional craftsmanship'}. ${product.materials[0]?.name ? `The ${product.materials[0].name} from ${product.materials[0].origin} ensures longevity.` : ''}`
    },
    {
      q: 'What occasions is this best for?',
      a: `This piece excels for ${product.tags.slice(0, 2).join(' and ').toLowerCase() || 'versatile'} occasions. ${personalizationMatch && personalizationMatch.score >= 50 ? `Based on your style profile, it's a ${personalizationMatch.score}% match for your lifestyle.` : ''}`
    },
    {
      q: 'What should I pair this with?',
      a: `For a cohesive look, consider pieces with similar ${product.tags[0]?.toLowerCase() || 'refined'} aesthetic. ${relatedProducts.length > 0 ? `The ${relatedProducts[0].name} from the same maison would complement beautifully.` : ''}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-ivory-cream max-h-[80vh] overflow-hidden animate-slide-up sm:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-deep rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-gold-soft" />
            </div>
            <div>
              <p className="font-display text-lg text-charcoal-deep">Concierge</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Product Specialist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-parchment transition-colors"
            aria-label="Close concierge"
          >
            <X size={20} className="text-stone" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-stone text-sm leading-relaxed">
            I&apos;m here to help you with the <span className="font-medium text-charcoal-deep">{product.name}</span> from {brand?.name}.
          </p>

          {/* Quick Questions */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Common Questions</p>
            <div className="space-y-2">
              {questions.map((item, i) => (
                <details key={i} className="group border border-sand/50 hover:border-charcoal-deep/30 transition-colors">
                  <summary className="p-4 cursor-pointer flex items-center justify-between text-sm text-charcoal-deep">
                    <span>{item.q}</span>
                    <ArrowRight size={14} className="text-taupe group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-stone leading-relaxed border-t border-sand/30 pt-3">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Body Twin Prompt */}
          {!bodyTwin && (
            <Link
              href="/profile/body-twin"
              className="block p-4 bg-parchment hover:bg-champagne/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={18} className="text-taupe" />
                <div className="flex-1">
                  <p className="text-sm text-charcoal-deep">Set up Body Twin</p>
                  <p className="text-xs text-stone">Get personalized fit recommendations</p>
                </div>
                <ArrowRight size={14} className="text-taupe" />
              </div>
            </Link>
          )}

          {/* Request Appointment */}
          <div className="pt-4 border-t border-sand/50">
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Need more help?</p>
            <button className="w-full py-3 px-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] hover:bg-charcoal-warm transition-colors">
              Schedule Virtual Appointment
            </button>
            <p className="text-[10px] text-center text-stone mt-2">
              Speak with a {brand?.name} specialist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
