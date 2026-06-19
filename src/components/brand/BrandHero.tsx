'use client';

import React from 'react';

interface BrandHeroProps {
  eyebrow?: string;
  title: string;
  emphasis?: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'light' | 'noir';
}

export function BrandHero({
  eyebrow,
  title,
  emphasis,
  description,
  actions,
  variant = 'light',
}: BrandHeroProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isNoir = variant === 'noir';

  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div
        className={`absolute inset-0 ${isNoir ? 'bg-mesh-noir' : 'bg-mesh-luxe'}`}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-hairline-gold opacity-80"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.4) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div
        className={`relative px-8 md:px-12 py-10 md:py-14 ${
          isNoir ? 'border border-white/10' : 'border border-sand/40'
        } rounded-2xl backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`inline-flex h-1.5 w-1.5 rounded-full ${
              isNoir ? 'bg-gold-soft' : 'bg-gold-deep'
            } animate-pulse-gold`}
          />
          <span
            className={`text-[10px] font-semibold tracking-[0.4em] uppercase ${
              isNoir ? 'text-gold-soft' : 'text-gold-deep'
            }`}
          >
            {eyebrow || today}
          </span>
        </div>

        <h1
          className={`font-display font-light text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.02] mb-4 ${
            isNoir ? 'text-ivory-cream' : 'text-charcoal-deep'
          }`}
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {title}
          {emphasis && (
            <span
              className={`italic font-normal block md:inline ${
                isNoir ? 'text-gold-soft/90' : 'text-gold-deep'
              }`}
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {' '}
              {emphasis}
            </span>
          )}
        </h1>

        {description && (
          <p
            className={`text-base md:text-[15px] max-w-2xl leading-relaxed ${
              isNoir ? 'text-ivory-warm/80' : 'text-stone'
            }`}
          >
            {description}
          </p>
        )}

        {actions && (
          <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </section>
  );
}
