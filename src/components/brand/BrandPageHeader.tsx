'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BrandPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export function BrandPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children
}: BrandPageHeaderProps) {
  return (
    <header className="bg-white border-b border-sand px-8 py-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-stone mb-3">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={12} className="text-taupe" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-charcoal-deep transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-charcoal-deep">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-deep tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-stone mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Optional additional content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </header>
  );
}

// Common button components for actions
export function PrimaryButton({
  children,
  onClick,
  href,
  icon: Icon,
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  const className = `inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {Icon && <Icon size={16} />}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  href,
  icon: Icon,
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  const className = `inline-flex items-center gap-2 px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {Icon && <Icon size={16} />}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
