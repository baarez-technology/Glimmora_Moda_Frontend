'use client';

import Link from 'next/link';
import { ArrowLeft, Mic, Waves } from 'lucide-react';

export default function ZeroUIPage() {
  return (
    <div className="min-h-screen bg-charcoal-deep flex flex-col items-center justify-center px-8 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-full bg-gold-soft/10 flex items-center justify-center mx-auto mb-8">
          <Mic size={28} className="text-gold-soft" />
        </div>

        <p className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/60 mb-4">Zero-UI Commerce</p>
        <h1 className="font-display text-3xl text-ivory-cream mb-4 leading-tight">
          Voice-Driven Shopping
        </h1>
        <p className="text-sm text-stone/70 leading-relaxed mb-8">
          Zero-UI enables hands-free, voice-first commerce. Speak naturally to browse, curate, and purchase — no screens required.
        </p>

        <div className="flex items-center justify-center gap-2 mb-10">
          <Waves size={14} className="text-gold-soft/40" />
          <p className="text-xs text-stone/50 italic">Coming soon — voice interface under development</p>
          <Waves size={14} className="text-gold-soft/40" />
        </div>

        <Link
          href="/uhni"
          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-stone/60 hover:text-ivory-cream transition-colors"
        >
          <ArrowLeft size={14} />
          Back to UHNI
        </Link>
      </div>
    </div>
  );
}
