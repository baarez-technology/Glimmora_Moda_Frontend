'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Target, Clock, CheckCircle, Package, AlertCircle, Loader2 } from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { BrandHero } from '@/components/brand/BrandHero';
import { BrandKpiCard } from '@/components/brand/BrandKpiCard';
import {
  fetchBrandSourcingRequests,
  type ApiBrandSourcingRequest,
} from '@/services/brand-sourcing.service';

type FilterTab = 'all' | string;

export default function SourcingRequestsPage() {
  const [requests, setRequests] = useState<ApiBrandSourcingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBrandSourcingRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sourcing requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      request.looking_for.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.sourcing_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  const isDeadlineSoon = (deadline?: string | null) => {
    if (!deadline) return false;
    const daysUntil = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 7 && daysUntil > 0;
  };

  const isDeadlinePassed = (deadline?: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'sourcing': return Search;
      case 'options_found': return Package;
      case 'awaiting_approval': return AlertCircle;
      case 'acquired':
      case 'delivered': return CheckCircle;
      default: return Target;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'sourcing': return 'bg-info/10 text-info';
      case 'options_found': return 'bg-gold-soft/20 text-gold-deep';
      case 'awaiting_approval': return 'bg-champagne/30 text-gold-muted';
      case 'acquired':
      case 'delivered': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: string) =>
    status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const statusCounts: Record<string, number> = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    sourcing: requests.filter(r => r.status === 'sourcing').length,
    options_found: requests.filter(r => r.status === 'options_found').length,
    awaiting_approval: requests.filter(r => r.status === 'awaiting_approval').length,
    acquired: requests.filter(r => r.status === 'acquired').length,
    delivered: requests.filter(r => r.status === 'delivered').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'sourcing', label: 'Sourcing' },
    { value: 'options_found', label: 'Options Found' },
    { value: 'acquired', label: 'Acquired' },
  ];

  const awaitingCount = requests.filter(r => r.status === 'awaiting_approval').length;

  return (
    <div>
      <BrandPageHeader
        title="Sourcing Requests"
        subtitle={`${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''} to participate in`}
        actions={
          awaitingCount > 0 ? (
            <span className="px-2.5 py-1 bg-gold-soft/20 text-gold-deep text-xs tracking-[0.1em]">
              {awaitingCount} awaiting approval
            </span>
          ) : undefined
        }
      />

      <div className="p-6 md:p-8 lg:p-10 space-y-10">
        {/* Luxury Hero */}
        <BrandHero
          title="Sourcing"
          emphasis="rare requests, refined response"
          description="When a UHNI client seeks something specific — vintage, hard-to-find, made just for them — their request lands here for your atelier to answer."
        />

        {/* KPI Strip */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-xl text-charcoal-deep tracking-[-0.01em]">Requests</h2>
            <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Active &amp; recent</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BrandKpiCard
              label="Total Requests"
              value={requests.length}
              hint="all-time"
              accent="gold"
            />
            <BrandKpiCard
              label="Pending"
              value={requests.filter(r => r.status === 'pending').length}
              hint="awaiting first response"
              accent="warning"
            />
            <BrandKpiCard
              label="Awaiting Approval"
              value={requests.filter(r => r.status === 'awaiting_approval').length}
              hint="client review"
              accent="info"
            />
            <BrandKpiCard
              label="Delivered"
              value={requests.filter(r => r.status === 'delivered').length}
              hint="successfully sourced"
              accent="success"
            />
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
                filter === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                {statusCounts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            placeholder="Search by item or request ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Loader2 size={32} className="mx-auto text-taupe/40 mb-4 animate-spin" />
            <p className="text-stone text-sm">Loading sourcing requests...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-white border border-error/30 p-6">
            <p className="text-sm text-error">{error}</p>
            <button
              onClick={loadRequests}
              className="mt-3 text-xs text-charcoal-deep underline hover:text-gold-muted"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Target size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No sourcing requests found</p>
          </div>
        )}

        {/* Requests Table */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30">
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Request
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Category
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Budget
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Deadline
                    </th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Status
                    </th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Options
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {filteredRequests.map(request => {
                    const StatusIcon = getStatusIcon(request.status);
                    const deadlineSoon = isDeadlineSoon(request.deadline);
                    const deadlinePassed = isDeadlinePassed(request.deadline);
                    return (
                      <tr
                        key={request.sourcing_id}
                        className={`hover:bg-parchment/30 transition-colors ${deadlineSoon ? 'bg-warning/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-charcoal-deep">{request.looking_for}</p>
                          <p className="text-xs text-taupe truncate max-w-[250px]">{request.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep">
                            {request.product_category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-charcoal-deep">{request.budget || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {request.deadline ? (
                            <div className="flex items-center gap-1">
                              {deadlineSoon && !deadlinePassed && (
                                <AlertCircle size={14} className="text-warning" />
                              )}
                              <span className={`text-sm ${deadlinePassed ? 'text-error' : deadlineSoon ? 'text-warning' : 'text-charcoal-deep'}`}>
                                {formatDate(request.deadline)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-taupe">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(request.status)}`}>
                              <StatusIcon size={12} />
                              {getStatusLabel(request.status)}
                            </span>
                            {request.status === 'awaiting_approval' && (
                              <span className="px-2 py-0.5 bg-gold-soft/20 text-gold-deep text-[10px] tracking-[0.05em] uppercase">
                                Action Required
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-charcoal-deep">{request.product_options.length}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/brand/sourcing/${request.sourcing_id}`}
                            className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal-deep transition-colors"
                          >
                            {request.status === 'pending' ? 'Submit Option' : 'View'} <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
