'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Target, Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import type { SourcingRequestStatus, SourcingRequestType } from '@/types/uhni';

type FilterTab = 'all' | SourcingRequestStatus;

export default function SourcingRequestsPage() {
  const { sourcingRequests } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = sourcingRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = searchQuery === '' ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDeadlineSoon = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntil = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 7 && daysUntil > 0;
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getStatusIcon = (status: SourcingRequestStatus) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'sourcing':
        return Search;
      case 'options_found':
        return Package;
      case 'awaiting_approval':
        return AlertCircle;
      case 'acquired':
      case 'delivered':
        return CheckCircle;
      default:
        return Target;
    }
  };

  const getStatusBadge = (status: SourcingRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'sourcing':
        return 'bg-info/10 text-info';
      case 'options_found':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'awaiting_approval':
        return 'bg-champagne/30 text-gold-muted';
      case 'acquired':
        return 'bg-success/10 text-success';
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: SourcingRequestStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeBadge = (type: SourcingRequestType) => {
    switch (type) {
      case 'specific_item':
        return 'bg-info/10 text-info';
      case 'category':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'occasion':
        return 'bg-champagne/30 text-gold-muted';
      case 'bespoke':
        return 'bg-parchment text-charcoal-deep';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getTypeLabel = (type: SourcingRequestType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const statusCounts = {
    all: sourcingRequests.length,
    pending: sourcingRequests.filter(r => r.status === 'pending').length,
    sourcing: sourcingRequests.filter(r => r.status === 'sourcing').length,
    options_found: sourcingRequests.filter(r => r.status === 'options_found').length,
    awaiting_approval: sourcingRequests.filter(r => r.status === 'awaiting_approval').length,
    acquired: sourcingRequests.filter(r => r.status === 'acquired').length,
    delivered: sourcingRequests.filter(r => r.status === 'delivered').length,
    cancelled: sourcingRequests.filter(r => r.status === 'cancelled').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'sourcing', label: 'Sourcing' },
    { value: 'options_found', label: 'Options Found' },
    { value: 'acquired', label: 'Acquired' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Sourcing Requests"
        subtitle={`${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''} to participate in`}
        actions={
          sourcingRequests.filter(r => r.status === 'awaiting_approval').length > 0 ? (
            <span className="px-2.5 py-1 bg-gold-soft/20 text-gold-deep text-xs tracking-[0.1em]">
              {sourcingRequests.filter(r => r.status === 'awaiting_approval').length} awaiting approval
            </span>
          ) : undefined
        }
      />

      <div className="p-8 space-y-6">
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
                {statusCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            placeholder="Search by title or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Target size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No sourcing requests found</p>
          </div>
        ) : (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30">
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Request
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Type
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
                      <tr key={request.id} className={`hover:bg-parchment/30 transition-colors ${deadlineSoon ? 'bg-warning/5' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-charcoal-deep">{request.title}</p>
                          <p className="text-xs text-taupe truncate max-w-[250px]">{request.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getTypeBadge(request.type)}`}>
                            {getTypeLabel(request.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {request.budget ? (
                            <div>
                              <p className="text-sm text-charcoal-deep">
                                {formatCurrency(request.budget.min)} - {formatCurrency(request.budget.max)}
                              </p>
                              {request.budget.flexible && (
                                <p className="text-[10px] text-taupe">Flexible</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-taupe">—</span>
                          )}
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
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(request.status)}`}>
                              <StatusIcon size={12} />
                              {getStatusLabel(request.status)}
                            </span>
                            {request.status === 'awaiting_approval' && (
                              <span className="ml-2 px-2 py-0.5 bg-gold-soft/20 text-gold-deep text-[10px] tracking-[0.05em] uppercase">
                                Action Required
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-charcoal-deep">{request.foundOptions.length}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/brand/sourcing/${request.id}`}
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
