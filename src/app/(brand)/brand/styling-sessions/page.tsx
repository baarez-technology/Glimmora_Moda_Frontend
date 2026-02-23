'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Video, Store, Home, CheckCircle, XCircle, RotateCcw, MapPin, Mail, AlertTriangle } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import type { StylingSession, StylingSessionType, StylingSessionStatus } from '@/types/brand-portal';

type FilterTab = 'all' | 'upcoming' | 'past';
type ViewMode = 'list' | 'calendar';

export default function StylingSessionsPage() {
  const { stylingSessions, updateStylingSessionStatus } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('upcoming');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const now = new Date();

  const getSessionTiming = (session: StylingSession): 'upcoming' | 'past' => {
    const scheduledAt = new Date(session.scheduledAt);
    return scheduledAt > now ? 'upcoming' : 'past';
  };

  const filteredSessions = stylingSessions.filter(session => {
    if (filter === 'all') return true;
    return getSessionTiming(session) === filter;
  });

  // Sort by date - upcoming first (ascending), past sessions descending
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dateA = new Date(a.scheduledAt).getTime();
    const dateB = new Date(b.scheduledAt).getTime();
    if (filter === 'past') return dateB - dateA;
    return dateA - dateB;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTypeIcon = (type: StylingSessionType) => {
    switch (type) {
      case 'virtual':
        return Video;
      case 'in_store':
        return Store;
      case 'home':
        return Home;
      default:
        return Calendar;
    }
  };

  const getTypeBadge = (type: StylingSessionType) => {
    switch (type) {
      case 'virtual':
        return 'bg-info/10 text-info';
      case 'in_store':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'home':
        return 'bg-champagne/30 text-gold-muted';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusBadge = (status: StylingSessionStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-info/10 text-info';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-error/10 text-error';
      case 'rescheduled':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusIcon = (status: StylingSessionStatus) => {
    switch (status) {
      case 'scheduled':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'rescheduled':
        return RotateCcw;
      default:
        return Clock;
    }
  };

  const getTierBadge = (tier: StylingSession['customerTier']) => {
    switch (tier) {
      case 'uhni':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'preferred':
        return 'bg-champagne/30 text-gold-muted';
      case 'standard':
        return 'bg-parchment text-charcoal-deep';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const [confirmAction, setConfirmAction] = useState<{ sessionId: string; status: StylingSessionStatus; customerName: string } | null>(null);

  const confirmModalRef = useModalAccessibility(
    !!confirmAction,
    () => setConfirmAction(null)
  );

  const requestStatusUpdate = (sessionId: string, newStatus: StylingSessionStatus, customerName: string) => {
    setConfirmAction({ sessionId, status: newStatus, customerName });
  };

  const handleConfirmedUpdate = () => {
    if (confirmAction) {
      updateStylingSessionStatus(confirmAction.sessionId, confirmAction.status);
      setConfirmAction(null);
    }
  };

  const handleStatusUpdate = (sessionId: string, newStatus: StylingSessionStatus) => {
    updateStylingSessionStatus(sessionId, newStatus);
  };

  const filterCounts = {
    all: stylingSessions.length,
    upcoming: stylingSessions.filter(s => getSessionTiming(s) === 'upcoming').length,
    past: stylingSessions.filter(s => getSessionTiming(s) === 'past').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    { value: 'all', label: 'All' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Styling Sessions"
        subtitle={`${sortedSessions.length} session${sortedSessions.length !== 1 ? 's' : ''}`}
      />

      <div className="p-8 space-y-6">
        {/* Header with Filter and View Toggle */}
        <div className="flex items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-parchment p-1 overflow-x-auto">
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
                  {filterCounts[tab.value]}
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-parchment p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {sortedSessions.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Calendar size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No styling sessions found</p>
            <p className="text-sm text-taupe mt-2">
              Sessions booked by UHNI clients will appear here
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/50 bg-parchment/30">
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">
                      Location
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSessions.map(session => {
                    const TypeIcon = getTypeIcon(session.type);
                    const StatusIcon = getStatusIcon(session.status);
                    const isUpcoming = getSessionTiming(session) === 'upcoming';
                    const canManage = isUpcoming && session.status === 'scheduled';

                    return (
                      <tr key={session.id} className="border-b border-sand/30 hover:bg-parchment/20">
                        {/* Date & Time */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                              <Calendar size={16} className="text-stone" />
                            </div>
                            <div>
                              <p className="text-sm text-charcoal-deep">{formatDate(session.scheduledAt)}</p>
                              <p className="text-xs text-taupe">{formatTime(session.scheduledAt)} ({session.duration} min)</p>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center">
                              <User size={14} className="text-stone" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-charcoal-deep">{session.customerName}</p>
                                <span className={`px-1.5 py-0.5 text-[8px] tracking-[0.1em] uppercase ${getTierBadge(session.customerTier)}`}>
                                  {session.customerTier}
                                </span>
                              </div>
                              <p className="text-xs text-taupe flex items-center gap-1">
                                <Mail size={10} />
                                {session.customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getTypeBadge(session.type)}`}>
                            <TypeIcon size={10} />
                            {session.type.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(session.status)}`}>
                            <StatusIcon size={10} />
                            {session.status}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          {session.location ? (
                            <div className="flex items-center gap-1 text-sm text-stone">
                              <MapPin size={12} className="text-taupe" />
                              <span className="truncate max-w-[150px]">{session.location}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-taupe">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canManage ? (
                              <>
                                <button
                                  onClick={() => requestStatusUpdate(session.id, 'completed', session.customerName)}
                                  className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success hover:bg-success/20 transition-colors"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => requestStatusUpdate(session.id, 'cancelled', session.customerName)}
                                  className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error hover:bg-error/20 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-taupe">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-white border border-sand/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedSessions.map(session => {
                const TypeIcon = getTypeIcon(session.type);
                const StatusIcon = getStatusIcon(session.status);
                const isUpcoming = getSessionTiming(session) === 'upcoming';
                const canManage = isUpcoming && session.status === 'scheduled';

                return (
                  <div
                    key={session.id}
                    className={`border p-4 ${
                      isUpcoming ? 'border-gold-soft/50 bg-gold-soft/5' : 'border-sand/50'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase ${getStatusBadge(session.status)}`}>
                        <StatusIcon size={10} className="inline mr-1" />
                        {session.status}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase ${getTypeBadge(session.type)}`}>
                        <TypeIcon size={10} className="inline mr-1" />
                        {session.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div className="mb-3">
                      <p className="font-medium text-charcoal-deep">{formatDate(session.scheduledAt)}</p>
                      <p className="text-sm text-taupe">{formatTime(session.scheduledAt)} - {session.duration} minutes</p>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-sand/30">
                      <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center">
                        <User size={14} className="text-stone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-charcoal-deep truncate">{session.customerName}</p>
                          <span className={`px-1.5 py-0.5 text-[8px] tracking-[0.1em] uppercase flex-shrink-0 ${getTierBadge(session.customerTier)}`}>
                            {session.customerTier}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {session.location && (
                      <div className="flex items-center gap-1 text-xs text-stone mb-3">
                        <MapPin size={12} className="text-taupe flex-shrink-0" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {session.notes && (
                      <p className="text-xs text-taupe italic mb-3 line-clamp-2">{session.notes}</p>
                    )}

                    {/* Actions */}
                    {canManage && (
                      <div className="flex items-center gap-2 pt-3 border-t border-sand/30">
                        <button
                          onClick={() => requestStatusUpdate(session.id, 'completed', session.customerName)}
                          className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success hover:bg-success/20 transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => requestStatusUpdate(session.id, 'cancelled', session.customerName)}
                          className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error hover:bg-error/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-noir/40 z-50 flex items-center justify-center p-4">
          <div
            ref={confirmModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-session-title"
            className="bg-white border border-sand/50 max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 flex items-center justify-center ${
                confirmAction.status === 'cancelled' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
              }`}>
                <AlertTriangle size={18} />
              </div>
              <h3 id="confirm-session-title" className="font-medium text-charcoal-deep">
                {confirmAction.status === 'cancelled' ? 'Cancel Session' : 'Complete Session'}
              </h3>
            </div>
            <p className="text-sm text-stone mb-6">
              Are you sure you want to mark {confirmAction.customerName}&apos;s session as{' '}
              <span className={confirmAction.status === 'cancelled' ? 'text-error font-medium' : 'text-success font-medium'}>
                {confirmAction.status}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-stone border border-sand hover:border-charcoal-deep transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmedUpdate}
                className={`px-4 py-2 text-sm text-ivory-cream transition-colors ${
                  confirmAction.status === 'cancelled'
                    ? 'bg-error hover:bg-error/80'
                    : 'bg-success hover:bg-success/80'
                }`}
              >
                {confirmAction.status === 'cancelled' ? 'Cancel Session' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
