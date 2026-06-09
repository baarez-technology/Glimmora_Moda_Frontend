'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

/**
 * ImageWithFallback
 *
 * Defensive wrapper around next/image that handles two failure modes:
 *   1. Empty / null / undefined src  — renders CSS placeholder immediately.
 *   2. onError (404, broken URL)     — swaps to CSS placeholder on first error,
 *                                      sets errorFired flag to prevent retry loops.
 *
 * The placeholder is an on-brand gradient tile with the item's label (name /
 * initials) centered — intentional, not a broken-icon.
 *
 * Usage:
 *   <ImageWithFallback src={brand.heroImage} alt={brand.name} fill label={brand.name} />
 *
 * All standard next/image props are forwarded.  Extra props:
 *   label  — text shown in the placeholder (typically the item name / alt)
 *   variant — 'dark' (default, for brand/story heroes on dark bg)
 *             'light' (for product cards on ivory bg)
 */

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  label?: string;
  variant?: 'dark' | 'light';
}

/** Return up to 2 uppercase initials from a label string. */
function getInitials(label?: string): string {
  if (!label) return '';
  const words = label.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function ImageWithFallback({
  src,
  alt,
  label,
  variant = 'dark',
  className,
  ...props
}: ImageWithFallbackProps) {
  const [errorFired, setErrorFired] = useState(false);

  // Treat empty string, null, or undefined as "no image"
  const hasSrc = !!(src && src.trim().length > 0);
  const showFallback = !hasSrc || errorFired;

  if (showFallback) {
    return (
      <Placeholder
        label={label ?? (typeof alt === 'string' ? alt : '')}
        variant={variant}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src as string}
      alt={alt}
      className={className}
      onError={() => setErrorFired(true)}
      {...props}
    />
  );
}

/** On-brand CSS placeholder — gradient background + centered initials. */
function Placeholder({
  label,
  variant,
  className,
}: {
  label: string;
  variant: 'dark' | 'light';
  className?: string;
}) {
  const initials = getInitials(label);

  const containerClass =
    variant === 'dark'
      ? 'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-charcoal-deep via-[#2A2520] to-noir select-none pointer-events-none'
      : 'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-parchment via-[#EDE8E3] to-sand select-none pointer-events-none';

  const initialsClass =
    variant === 'dark'
      ? 'font-display text-2xl text-gold-muted/70 tracking-widest mb-1'
      : 'font-display text-2xl text-stone/50 tracking-widest mb-1';

  const labelClass =
    variant === 'dark'
      ? 'text-[9px] tracking-[0.35em] uppercase text-ivory-cream/30 max-w-[80%] text-center line-clamp-1 px-2'
      : 'text-[9px] tracking-[0.35em] uppercase text-stone/40 max-w-[80%] text-center line-clamp-1 px-2';

  return (
    <div className={`${containerClass}${className ? ` ${className}` : ''}`}>
      {initials && <span className={initialsClass}>{initials}</span>}
      {label && <span className={labelClass}>{label}</span>}
    </div>
  );
}
