'use client';

import { ReactNode } from 'react';
import { Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';

type Phase = 1 | 2 | 3;
type Status = 'live' | 'mock' | 'coming_soon';

interface IntelligencePageWrapperProps {
  title: string;
  subtitle: string;
  acronym?: string;
  phase: Phase;
  status: Status;
  backendNote?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export default function IntelligencePageWrapper({
  title,
  subtitle,
  acronym,
  phase,
  status,
  backendNote,
  children,
  isLoading,
  error,
}: IntelligencePageWrapperProps) {
  const phaseConfig = {
    1: { label: 'Phase 1 — Core', color: 'bg-success/10 text-success' },
    2: { label: 'Phase 2 — Advanced', color: 'bg-info/10 text-info' },
    3: { label: 'Phase 3 — Specialist', color: 'bg-gold-soft/20 text-gold-deep' },
  };

  const statusConfig = {
    live: { icon: CheckCircle, label: 'Live Data', color: 'text-success' },
    mock: { icon: Clock, label: 'Mock Data — API Pending', color: 'text-gold-muted' },
    coming_soon: { icon: AlertCircle, label: 'Coming Soon', color: 'text-taupe' },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div>
      {/* Intelligence Header */}
      <div className="px-8 py-6 border-b border-sand/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {acronym && (
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold-muted font-medium">
                  {acronym}
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 tracking-[0.05em] uppercase ${phaseConfig[phase].color}`}>
                {phaseConfig[phase].label}
              </span>
            </div>
            <h1 className="font-display text-2xl text-charcoal-deep">{title}</h1>
            <p className="text-stone text-sm mt-1">{subtitle}</p>
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${statusConfig[status].color} flex-shrink-0`}>
            <StatusIcon size={14} />
            <span>{statusConfig[status].label}</span>
          </div>
        </div>

        {backendNote && status !== 'live' && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-parchment border border-sand/50 text-xs text-stone">
            <Info size={14} className="text-taupe flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-charcoal-deep">Backend dependency: </span>
              {backendNote}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-sand/30" />
                ))}
              </div>
              <div className="h-48 bg-sand/30" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-sand/30" />
                <div className="h-32 bg-sand/30" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertCircle size={40} className="mx-auto text-error/40 mb-4" />
                <p className="text-stone text-sm mb-1">Failed to load intelligence data</p>
                <p className="text-taupe text-xs">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
