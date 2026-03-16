'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  Plus,
  Clock,
  CheckCircle,
  Package,
  MessageCircle,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getSourcingRequests,
  enrichSourcingRequestWithLocal,
  type EnrichedSourcingRequest,
} from '@/services/sourcing.service';

// ── Status helpers ────────────────────────────────────────────────────

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':      return <Clock size={14} className="text-taupe" />;
    case 'sourcing':     return <Search size={14} className="text-gold-muted" />;
    case 'options_found': return <CheckCircle size={14} className="text-success" />;
    case 'awaiting_approval': return <AlertCircle size={14} className="text-gold-muted" />;
    case 'acquired':     return <Package size={14} className="text-success" />;
    case 'delivered':    return <CheckCircle size={14} className="text-success" />;
    default:             return <Clock size={14} className="text-taupe" />;
  }
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pending', sourcing: 'Sourcing', options_found: 'Options Found',
    awaiting_approval: 'Awaiting Approval', acquired: 'Acquired', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  return map[status] || status;
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-parchment text-stone', sourcing: 'bg-gold-muted/10 text-gold-muted',
    options_found: 'bg-success/10 text-success', awaiting_approval: 'bg-gold-muted/10 text-gold-muted',
    acquired: 'bg-success/10 text-success', delivered: 'bg-success/10 text-success', cancelled: 'bg-stone/10 text-stone',
  };
  return map[status] || 'bg-parchment text-stone';
}

function getPriorityBadge(priority?: string) {
  switch (priority) {
    case 'urgent': return 'bg-error/10 text-error';
    case 'when_available': return 'bg-parchment text-stone';
    default: return 'bg-info/10 text-info';
  }
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Mini Progress Bar ─────────────────────────────────────────────────

function MiniProgress({ status }: { status: string }) {
  const steps = ['pending', 'sourcing', 'options_found', 'awaiting_approval', 'acquired', 'delivered'];
  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center gap-0.5">
      {steps.map((step, i) => (
        <div
          key={step}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i <= currentIdx ? 'bg-gold-soft' : 'bg-sand/40'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function SourcingPage() {
  const { concierge } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [requests, setRequests] = useState<EnrichedSourcingRequest[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    getSourcingRequests()
      .then((raw) => setRequests(raw.map(enrichSourcingRequestWithLocal)))
      .catch(() => setRequests([]));
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'sourcing', 'options_found', 'awaiting_approval'].includes(r.status);
    if (filter === 'completed') return ['acquired', 'delivered', 'cancelled'].includes(r.status);
    return true;
  });

  const counts = {
    all: requests.length,
    active: requests.filter((r) => ['pending', 'sourcing', 'options_found', 'awaiting_approval'].includes(r.status)).length,
    completed: requests.filter((r) => ['acquired', 'delivered', 'cancelled'].includes(r.status)).length,
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link href="/uhni" className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Search size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">Global Network</span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Private Sourcing
                </h1>
                <p className="text-sand mt-2">
                  {requests.length} request{requests.length !== 1 ? 's' : ''} &middot; {counts.active} active
                </p>
              </div>
            </div>
            <Link
              href="/uhni/sourcing/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep border border-gold-soft/30 text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.1em] uppercase"
            >
              <Plus size={15} /> New Request
            </Link>
          </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Concierge Note */}
        {concierge && (
          <div className="bg-charcoal-deep p-6 mb-8 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gold-soft/30">
              <Image src={concierge.avatar} alt={concierge.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-ivory-cream">
                Your concierge <span className="text-gold-soft">{concierge.name}</span> is handling your sourcing requests.
              </p>
            </div>
            <Link href="/uhni/concierge" className="flex items-center gap-2 text-gold-soft hover:text-gold-soft/80 transition-colors">
              <MessageCircle size={18} />
              <span className="text-sm hidden sm:inline">Message</span>
            </Link>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-8 bg-parchment p-1">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-3 text-sm tracking-[0.1em] uppercase transition-colors ${
                filter === tab ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[10px] text-taupe">({counts[tab]})</span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-parchment flex items-center justify-center">
              <Search size={32} className="text-stone" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">No Sourcing Requests</h3>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Looking for something specific? Our concierge team can source rare and exclusive items for you.
            </p>
            <Link
              href="/uhni/sourcing/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <Plus size={18} />
              <span className="text-sm tracking-[0.15em] uppercase">Create Request</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const hasOptions = request.options.length > 0;
              const needsAction = request.status === 'options_found' && !request.options.some((o) => o.selected);

              return (
                <Link
                  key={request.sourcing_id}
                  href={`/uhni/sourcing/${request.sourcing_id}`}
                  className="block bg-white border border-sand/30 hover:border-sand hover:shadow-sm transition-all group"
                >
                  <div className="p-6">
                    {/* Top Row: Status + Priority + Budget */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span>{getStatusLabel(request.status)}</span>
                          </span>
                          {request.product_category && (
                            <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">{request.product_category}</span>
                          )}
                          {request.priority && request.priority !== 'standard' && (
                            <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getPriorityBadge(request.priority)}`}>
                              {request.priority === 'when_available' ? 'When Available' : request.priority}
                            </span>
                          )}
                          {needsAction && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-soft/15 text-gold-muted text-[10px] tracking-[0.1em] uppercase animate-pulse">
                              <AlertCircle size={10} /> Action Required
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg text-charcoal-deep group-hover:text-noir transition-colors">
                          {request.looking_for}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {request.budget && (
                          <div className="text-right">
                            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Budget</p>
                            <p className="font-display text-lg text-charcoal-deep">
                              &euro;{Number(request.budget).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <ChevronRight size={18} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <p className="text-stone text-sm mb-3 line-clamp-1">{request.description}</p>

                    {/* Target Brands */}
                    {request.brand_names && request.brand_names.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-[10px] tracking-[0.1em] uppercase text-taupe">Sent to:</span>
                        {request.brand_names.map((name) => (
                          <span key={name} className="text-[10px] tracking-[0.05em] px-2 py-0.5 bg-charcoal-deep/5 text-charcoal-deep">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Mini Progress Bar */}
                    <div className="mb-4">
                      <MiniProgress status={request.status} />
                    </div>

                    {/* Footer Meta */}
                    <div className="flex items-center gap-4 text-xs text-taupe flex-wrap">
                      <span>Created {formatDate(request.created_at)}</span>
                      {request.deadline && (
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(request.deadline)}</span>
                      )}
                      {hasOptions && (
                        <span className="flex items-center gap-1 text-success">
                          <Package size={11} /> {request.options.length} option{request.options.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {request.messages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle size={11} /> {request.messages.length}
                        </span>
                      )}
                      {request.conciergeAssigned && (
                        <span className="hidden sm:inline text-taupe/70">{request.conciergeAssigned}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
