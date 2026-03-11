'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, subtitle, breadcrumbs, actions }: AdminPageHeaderProps) {
  return (
    <div className="bg-charcoal-deep text-ivory-cream">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-stone/60 mb-4">
            <Link href="/admin" className="hover:text-ivory-cream transition-colors">
              Admin
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight size={12} />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-ivory-cream transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ivory-cream/70">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-display tracking-wide">{title}</h1>
            {subtitle && (
              <p className="text-sm text-stone/60 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
