'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  AlertTriangle,
  Sliders,
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandAGIPage() {
  const router = useRouter();
  const { isBrand, brandPartner, brandAGIConfig, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  if (!isBrand || !brandPartner || !brandAGIConfig) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toneLabels = {
    formal: 'Formal & Traditional',
    warm: 'Warm & Approachable',
    playful: 'Playful & Creative',
    authoritative: 'Authoritative & Expert'
  };

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Header */}
      <header className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="w-10 h-10 bg-noir border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
            >
              <ArrowLeft size={18} className="text-ivory-cream" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-ivory-cream">AGI Configuration</h1>
              <p className="text-sm text-taupe">Brand Concierge settings</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Status Banner */}
        <div className={`p-4 mb-8 flex items-center gap-3 ${brandAGIConfig.enabled ? 'bg-green-400/10 border border-green-400/20' : 'bg-red-400/10 border border-red-400/20'}`}>
          <div className={`w-3 h-3 rounded-full ${brandAGIConfig.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className={brandAGIConfig.enabled ? 'text-green-400' : 'text-red-400'}>
            Brand AGI Concierge is {brandAGIConfig.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personality Settings */}
          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                <Bot size={18} className="text-ivory-cream" />
              </div>
              <div>
                <h2 className="text-ivory-cream font-medium">Concierge Personality</h2>
                <p className="text-xs text-taupe">How your AI presents your brand</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tone */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Communication Tone</label>
                <div className="p-4 bg-charcoal-deep border border-sand/10">
                  <span className="text-ivory-cream">{toneLabels[brandAGIConfig.conciergePersonality.tone]}</span>
                </div>
              </div>

              {/* Formality Level */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">
                  Formality Level: {brandAGIConfig.conciergePersonality.formality}/10
                </label>
                <div className="h-2 bg-charcoal-deep rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ivory-cream transition-all"
                    style={{ width: `${brandAGIConfig.conciergePersonality.formality * 10}%` }}
                  />
                </div>
              </div>

              {/* Expertise Areas */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Expertise Areas</label>
                <div className="flex flex-wrap gap-2">
                  {brandAGIConfig.conciergePersonality.expertise.map((area) => (
                    <span key={area} className="px-3 py-1 bg-charcoal-deep text-sm text-sand">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Guidelines */}
          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                <MessageSquare size={18} className="text-ivory-cream" />
              </div>
              <div>
                <h2 className="text-ivory-cream font-medium">Brand Voice</h2>
                <p className="text-xs text-taupe">Guidelines for consistent messaging</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Guidelines */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Voice Guidelines</label>
                <p className="text-sm text-sand leading-relaxed">{brandAGIConfig.brandVoiceGuidelines}</p>
              </div>

              {/* Preferred Phrases */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Preferred Phrases</label>
                <div className="flex flex-wrap gap-2">
                  {brandAGIConfig.preferredPhrases.map((phrase) => (
                    <span key={phrase} className="px-3 py-1 bg-green-400/10 text-sm text-green-400 flex items-center gap-1">
                      <Check size={12} />
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prohibited Topics */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Prohibited Topics</label>
                <div className="flex flex-wrap gap-2">
                  {brandAGIConfig.prohibitedTopics.map((topic) => (
                    <span key={topic} className="px-3 py-1 bg-red-400/10 text-sm text-red-400">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Response Templates */}
          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                <Sliders size={18} className="text-ivory-cream" />
              </div>
              <div>
                <h2 className="text-ivory-cream font-medium">Response Templates</h2>
                <p className="text-xs text-taupe">Pre-configured responses</p>
              </div>
            </div>

            <div className="space-y-3">
              {brandAGIConfig.responseTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border ${template.isActive ? 'bg-charcoal-deep/50 border-sand/10' : 'bg-charcoal-deep/20 border-sand/5 opacity-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-taupe uppercase tracking-wider">{template.category}</span>
                    <span className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-400' : 'bg-sand'}`} />
                  </div>
                  <p className="text-ivory-cream text-sm mb-1">Trigger: "{template.trigger}"</p>
                  <p className="text-sand text-sm">{template.response}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation Rules */}
          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-ivory-cream" />
              </div>
              <div>
                <h2 className="text-ivory-cream font-medium">Escalation Rules</h2>
                <p className="text-xs text-taupe">When to involve human team</p>
              </div>
            </div>

            <div className="space-y-3">
              {brandAGIConfig.escalationRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 bg-charcoal-deep/50 border border-sand/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${
                      rule.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                      rule.priority === 'medium' ? 'bg-gold-soft/10 text-gold-soft' :
                      'bg-sand/10 text-sand'
                    }`}>
                      {rule.priority} priority
                    </span>
                    <span className="text-xs text-taupe capitalize">{rule.action.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-ivory-cream text-sm mb-2">{rule.condition}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-taupe">Notify:</span>
                    {rule.notifyRoles.map((role) => (
                      <span key={role} className="text-xs text-sand capitalize">{role}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => showToast('Configuration saved', 'success')}
            className="px-8 py-3 bg-ivory-cream text-charcoal-deep text-sm tracking-wider uppercase hover:bg-ivory-cream/90 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </main>
    </div>
  );
}
