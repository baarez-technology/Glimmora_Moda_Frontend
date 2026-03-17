'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Loader2,
  CalendarClock,
  X,
} from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import {
  fetchBrandAppointments,
  rescheduleBrandAppointment,
  cancelBrandAppointment,
  type ApiBrandAppointment,
} from '@/services/brand-appointment.service';

type FilterTab = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export default function BrandAppointmentsPage() {
  const [appointments, setAppointments] = useState<ApiBrandAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState<ApiBrandAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel confirm state
  const [cancelTarget, setCancelTarget] = useState<ApiBrandAppointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBrandAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const filteredAppointments = appointments.filter(appt => {
    const matchesFilter = filter === 'all' || appt.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      appt.appointment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.appointment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.location ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.notes ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const formatTime = (time: string) => {
    // Handle HH:MM or HH:MM:SS formats
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${suffix}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-info/10 text-info';
      case 'confirmed':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return Clock;
      case 'confirmed':
        return CalendarClock;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Calendar;
    }
  };

  const getStatusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const getTypeLabel = (type: string) =>
    type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const canModify = (status: string) =>
    status !== 'completed' && status !== 'cancelled';

  const statusCounts: Record<string, number> = {
    all: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // ── Reschedule handler ──────────────────────────────────────────────
  const openReschedule = (appt: ApiBrandAppointment) => {
    setRescheduleTarget(appt);
    setRescheduleDate(appt.date);
    setRescheduleTime(appt.time.slice(0, 5)); // HH:MM
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    try {
      setRescheduling(true);
      const updated = await rescheduleBrandAppointment(
        rescheduleTarget.appointment_id,
        rescheduleDate,
        rescheduleTime,
      );
      setAppointments(prev =>
        prev.map(a => (a.appointment_id === updated.appointment_id ? updated : a)),
      );
      setRescheduleTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reschedule');
    } finally {
      setRescheduling(false);
    }
  };

  // ── Cancel handler ──────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      const updated = await cancelBrandAppointment(cancelTarget.appointment_id);
      setAppointments(prev =>
        prev.map(a => (a.appointment_id === updated.appointment_id ? updated : a)),
      );
      setCancelTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const scheduledCount = appointments.filter(
    a => a.status === 'scheduled' || a.status === 'confirmed',
  ).length;

  return (
    <div>
      <BrandPageHeader
        title="Appointments"
        subtitle={`${filteredAppointments.length} appointment${filteredAppointments.length !== 1 ? 's' : ''}`}
        actions={
          scheduledCount > 0 ? (
            <span className="px-2.5 py-1 bg-gold-soft/20 text-gold-deep text-xs tracking-[0.1em]">
              {scheduledCount} upcoming
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
            placeholder="Search by type, location, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Loader2 size={32} className="mx-auto text-taupe/40 mb-4 animate-spin" />
            <p className="text-stone text-sm">Loading appointments...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-white border border-error/30 p-6">
            <p className="text-sm text-error">{error}</p>
            <button
              onClick={loadAppointments}
              className="mt-3 text-xs text-charcoal-deep underline hover:text-gold-muted"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Calendar size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No appointments found</p>
          </div>
        )}

        {/* Appointments List — card-based layout */}
        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="space-y-4">
            {filteredAppointments.map(appt => {
              const StatusIcon = getStatusIcon(appt.status);
              return (
                <div
                  key={appt.appointment_id}
                  className="bg-white border border-sand/50 p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: main info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Top row: type badge + status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-block px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep">
                          {getTypeLabel(appt.appointment_type)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(appt.status)}`}
                        >
                          <StatusIcon size={12} />
                          {getStatusLabel(appt.status)}
                        </span>
                      </div>

                      {/* Date, time, duration row */}
                      <div className="flex items-center gap-4 text-sm text-charcoal-deep flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-stone" />
                          {formatDate(appt.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-stone" />
                          {formatTime(appt.time)}
                        </span>
                        {appt.duration && (
                          <span className="text-xs text-taupe">
                            {appt.duration}
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      {appt.location && (
                        <div className="flex items-center gap-1.5 text-sm text-stone">
                          <MapPin size={14} className="text-taupe flex-shrink-0" />
                          <span className="truncate">{appt.location}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {appt.notes && (
                        <p className="text-xs text-taupe leading-relaxed">
                          {appt.notes}
                        </p>
                      )}

                      {/* ID */}
                      <p className="text-[10px] text-taupe/60 font-mono tracking-wide">
                        {appt.appointment_id.toUpperCase()}
                      </p>
                    </div>

                    {/* Right: action buttons */}
                    {canModify(appt.status) && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openReschedule(appt)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-sand text-xs tracking-[0.05em] text-charcoal-deep hover:bg-parchment transition-colors"
                        >
                          <CalendarClock size={14} />
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancelTarget(appt)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-error/30 text-xs tracking-[0.05em] text-error hover:bg-error/5 transition-colors"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reschedule Modal ───────────────────────────────────────────── */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40">
          <div className="bg-white border border-sand w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-charcoal-deep">
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-taupe hover:text-charcoal-deep transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-stone">
              {getTypeLabel(rescheduleTarget.appointment_type)} &mdash;{' '}
              {formatDate(rescheduleTarget.date)} at {formatTime(rescheduleTarget.time)}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.1em] uppercase text-stone mb-1.5">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.1em] uppercase text-stone mb-1.5">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-5 py-2.5 text-xs tracking-[0.05em] text-stone hover:text-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.05em] hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rescheduling && <Loader2 size={14} className="animate-spin" />}
                {rescheduling ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation Modal ──────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40">
          <div className="bg-white border border-sand w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-charcoal-deep">
                Cancel Appointment
              </h3>
              <button
                onClick={() => setCancelTarget(null)}
                className="text-taupe hover:text-charcoal-deep transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-stone">
              Are you sure you want to cancel this appointment?
            </p>
            <div className="bg-parchment p-4 text-sm text-charcoal-deep space-y-1">
              <p className="font-medium">{getTypeLabel(cancelTarget.appointment_type)}</p>
              <p className="text-xs text-stone">
                {formatDate(cancelTarget.date)} at {formatTime(cancelTarget.time)}
              </p>
              {cancelTarget.location && (
                <p className="text-xs text-taupe">{cancelTarget.location}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-5 py-2.5 text-xs tracking-[0.05em] text-stone hover:text-charcoal-deep transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-error text-white text-xs tracking-[0.05em] hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling && <Loader2 size={14} className="animate-spin" />}
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
