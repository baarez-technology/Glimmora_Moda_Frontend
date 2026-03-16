'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, User, Video, Store, Home, CheckCircle, XCircle,
  RotateCcw, MapPin, AlertTriangle, Sparkles, Plus, X, Package, Loader2,
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import {
  fetchBrandAppointments,
  rescheduleBrandAppointment,
  cancelBrandAppointment,
  type ApiBrandAppointment,
} from '@/services/brand-appointment.service';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import type { StylingRecommendation } from '@/types/brand-portal';

type FilterTab = 'all' | 'upcoming' | 'past';
type ViewMode = 'list' | 'calendar';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTypeLabel(type: string) {
  const map: Record<string, string> = {
    styling_session: 'Styling Session',
    private_viewing: 'Private Viewing',
    consultation: 'Consultation',
    fitting: 'Fitting',
    video_call: 'Video Call',
    phone_call: 'Phone Call',
  };
  return map[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getLocationIcon(location: string | null) {
  if (location === 'virtual' || location === 'video_call') return Video;
  if (location === 'in_store') return Store;
  if (location === 'home') return Home;
  return MapPin;
}

function getLocationLabel(location: string | null) {
  if (!location) return null;
  const map: Record<string, string> = {
    in_store: 'In Store', virtual: 'Virtual', home: 'Home Visit',
    video_call: 'Virtual', phone_call: 'Phone Call',
  };
  return map[location] ?? location.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'styling_session': return 'bg-purple-100 text-purple-700';
    case 'private_viewing': return 'bg-gold-soft/20 text-gold-deep';
    case 'consultation': return 'bg-info/10 text-info';
    case 'fitting': return 'bg-champagne/30 text-gold-muted';
    case 'video_call': return 'bg-info/10 text-info';
    default: return 'bg-taupe/20 text-stone';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'scheduled': return 'bg-info/10 text-info';
    case 'rescheduled': return 'bg-warning/10 text-warning';
    case 'completed': return 'bg-success/10 text-success';
    case 'cancelled': return 'bg-error/10 text-error';
    default: return 'bg-taupe/20 text-stone';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'scheduled': return Clock;
    case 'rescheduled': return RotateCcw;
    case 'completed': return CheckCircle;
    case 'cancelled': return XCircle;
    default: return Clock;
  }
}

function isUpcoming(appt: ApiBrandAppointment) {
  return appt.status === 'scheduled' || appt.status === 'rescheduled';
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StylingSessionsPage() {
  const { products } = useBrand();

  const [appointments, setAppointments] = useState<ApiBrandAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('upcoming');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [saving, setSaving] = useState(false);

  // Reschedule modal
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Confirm cancel
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const confirmModalRef = useModalAccessibility(!!confirmCancel, () => setConfirmCancel(null));

  // Recommendations modal (local — lets brand add post-session product notes)
  const [recsApptId, setRecsApptId] = useState<string | null>(null);
  const [pendingRecs, setPendingRecs] = useState<StylingRecommendation[]>([]);
  const [recForm, setRecForm] = useState({ productId: '', stylistNote: '' });
  // Store recommendations per appointment in local state
  const [apptRecs, setApptRecs] = useState<Record<string, StylingRecommendation[]>>({});

  const recsModalRef = useModalAccessibility(
    !!recsApptId,
    () => { setRecsApptId(null); setPendingRecs([]); setRecForm({ productId: '', stylistNote: '' }); }
  );

  const load = useCallback(async () => {
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

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: string) => {
    setSaving(true);
    try {
      const updated = await cancelBrandAppointment(id);
      setAppointments(prev => prev.map(a => a.appointment_id === id ? updated : a));
      setConfirmCancel(null);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !rescheduleDate || !rescheduleTime) return;
    setSaving(true);
    try {
      const updated = await rescheduleBrandAppointment(rescheduleId, rescheduleDate, rescheduleTime);
      setAppointments(prev => prev.map(a => a.appointment_id === rescheduleId ? updated : a));
      setRescheduleId(null);
      setRescheduleDate('');
      setRescheduleTime('');
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleOpenRecommendations = (apptId: string) => {
    setRecsApptId(apptId);
    setPendingRecs(apptRecs[apptId] || []);
  };

  const handleAddRecommendation = () => {
    if (!recForm.productId) return;
    const product = products.find(p => p.id === recForm.productId);
    if (!product) return;
    const newRec: StylingRecommendation = {
      id: `rec-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0]?.url || '',
      brandName: product.brandName || '',
      price: product.price,
      stylistNote: recForm.stylistNote || undefined,
    };
    setPendingRecs(prev => [...prev, newRec]);
    setRecForm({ productId: '', stylistNote: '' });
  };

  const handleSaveRecommendations = () => {
    if (!recsApptId) return;
    setApptRecs(prev => ({ ...prev, [recsApptId]: pendingRecs }));
    setRecsApptId(null);
    setPendingRecs([]);
  };

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    return filter === 'upcoming' ? isUpcoming(a) : !isUpcoming(a);
  });

  const counts = {
    all: appointments.length,
    upcoming: appointments.filter(isUpcoming).length,
    past: appointments.filter(a => !isUpcoming(a)).length,
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div>
      <BrandPageHeader
        title="Styling Sessions"
        subtitle={`${counts[filter]} session${counts[filter] !== 1 ? 's' : ''}`}
      />

      <div className="p-8 space-y-6">
        {/* Filter + View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-parchment p-1 overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
                  filter === tab.value ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                  {counts[tab.value]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-parchment p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${viewMode === 'list' ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${viewMode === 'calendar' ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'}`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-16 justify-center text-stone text-sm">
            <Loader2 size={20} className="animate-spin" />
            Loading appointments…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone mb-4">{error}</p>
            <button onClick={load} className="px-6 py-2.5 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em] uppercase hover:bg-charcoal-deep hover:text-ivory-cream transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Calendar size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No {filter !== 'all' ? filter : ''} appointments found</p>
            <p className="text-sm text-taupe mt-2">Sessions booked by clients will appear here</p>
          </div>
        )}

        {/* List View */}
        {!loading && !error && filtered.length > 0 && viewMode === 'list' && (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/50 bg-parchment/30">
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Date & Time</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Customer</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Location</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Notes</th>
                    <th className="px-6 py-4 text-right text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(appt => {
                    const StatusIcon = getStatusIcon(appt.status);
                    const LocationIcon = getLocationIcon(appt.location);
                    const locationLabel = getLocationLabel(appt.location);
                    const canManage = isUpcoming(appt);
                    const isCompleted = appt.status === 'completed';
                    const recs = apptRecs[appt.appointment_id] || [];

                    return (
                      <tr key={appt.appointment_id} className="border-b border-sand/30 hover:bg-parchment/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                              <Calendar size={16} className="text-stone" />
                            </div>
                            <div>
                              <p className="text-sm text-charcoal-deep">{formatDate(appt.date)}</p>
                              <p className="text-xs text-taupe">{appt.time}{appt.duration ? ` · ${appt.duration} min` : ''}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center">
                              <User size={14} className="text-stone" />
                            </div>
                            <p className="text-xs text-taupe truncate max-w-[140px]">{appt.customer_id}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getTypeBadge(appt.appointment_type)}`}>
                            {formatTypeLabel(appt.appointment_type)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {locationLabel ? (
                            <span className="flex items-center gap-1.5 text-xs text-stone">
                              <LocationIcon size={12} className="text-taupe" />
                              {locationLabel}
                            </span>
                          ) : <span className="text-xs text-taupe">—</span>}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(appt.status)}`}>
                            <StatusIcon size={10} />
                            {appt.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {appt.notes ? (
                            <p className="text-xs text-stone max-w-[150px] truncate" title={appt.notes}>{appt.notes}</p>
                          ) : <span className="text-xs text-taupe">—</span>}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canManage && (
                              <>
                                <button
                                  onClick={() => { setRescheduleId(appt.appointment_id); setRescheduleDate(appt.date); setRescheduleTime(appt.time); }}
                                  className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-parchment text-charcoal-deep hover:bg-sand/40 transition-colors"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => setConfirmCancel(appt.appointment_id)}
                                  className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error hover:bg-error/20 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {isCompleted && (
                              <button
                                onClick={() => handleOpenRecommendations(appt.appointment_id)}
                                className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep hover:bg-gold-soft/30 transition-colors flex items-center gap-1"
                              >
                                <Sparkles size={10} />
                                Recommendations
                                {recs.length > 0 && <span className="ml-1 text-[9px]">({recs.length})</span>}
                              </button>
                            )}
                            {!canManage && !isCompleted && <span className="text-xs text-taupe">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar / Card View */}
        {!loading && !error && filtered.length > 0 && viewMode === 'calendar' && (
          <div className="bg-white border border-sand/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(appt => {
                const StatusIcon = getStatusIcon(appt.status);
                const LocationIcon = getLocationIcon(appt.location);
                const locationLabel = getLocationLabel(appt.location);
                const canManage = isUpcoming(appt);
                const isCompleted = appt.status === 'completed';
                const recs = apptRecs[appt.appointment_id] || [];

                return (
                  <div
                    key={appt.appointment_id}
                    className={`border p-4 ${canManage ? 'border-gold-soft/50 bg-gold-soft/5' : 'border-sand/50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase inline-flex items-center gap-1 ${getStatusBadge(appt.status)}`}>
                        <StatusIcon size={10} />
                        {appt.status}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase ${getTypeBadge(appt.appointment_type)}`}>
                        {formatTypeLabel(appt.appointment_type)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium text-charcoal-deep">{formatDate(appt.date)}</p>
                      <p className="text-sm text-taupe">{appt.time}{appt.duration ? ` · ${appt.duration} min` : ''}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-sand/30">
                      <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center">
                        <User size={14} className="text-stone" />
                      </div>
                      <p className="text-xs text-taupe truncate">{appt.customer_id}</p>
                    </div>

                    {locationLabel && (
                      <p className="flex items-center gap-1.5 text-xs text-stone mb-3">
                        <LocationIcon size={12} className="text-taupe" />
                        {locationLabel}
                      </p>
                    )}

                    {appt.notes && (
                      <p className="text-xs text-taupe italic mb-3 line-clamp-2">{appt.notes}</p>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-sand/30">
                      {canManage && (
                        <>
                          <button
                            onClick={() => { setRescheduleId(appt.appointment_id); setRescheduleDate(appt.date); setRescheduleTime(appt.time); }}
                            className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-parchment text-charcoal-deep hover:bg-sand/40 transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => setConfirmCancel(appt.appointment_id)}
                            className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-error/10 text-error hover:bg-error/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {isCompleted && (
                        <button
                          onClick={() => handleOpenRecommendations(appt.appointment_id)}
                          className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep hover:bg-gold-soft/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Sparkles size={10} />
                          Recommendations {recs.length > 0 && `(${recs.length})`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-noir/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 relative">
            <button onClick={() => setRescheduleId(null)} className="absolute top-4 right-4 text-stone hover:text-charcoal-deep transition-colors">
              <X size={20} />
            </button>
            <h3 className="font-display text-2xl text-charcoal-deep mb-6">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-parchment border-0 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setRescheduleId(null)} className="flex-1 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors">Cancel</button>
                <button
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || saving}
                  className="flex-1 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Dialog */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-noir/40 z-50 flex items-center justify-center p-4">
          <div
            ref={confirmModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-cancel-title"
            className="bg-white border border-sand/50 max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center bg-error/10 text-error">
                <AlertTriangle size={18} />
              </div>
              <h3 id="confirm-cancel-title" className="font-medium text-charcoal-deep">Cancel Appointment</h3>
            </div>
            <p className="text-sm text-stone mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmCancel(null)} className="px-4 py-2 text-sm text-stone border border-sand hover:border-charcoal-deep transition-colors">
                Go Back
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={saving}
                className="px-4 py-2 text-sm text-ivory-cream bg-error hover:bg-error/80 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {recsApptId && (
        <div className="fixed inset-0 bg-noir/40 z-50 flex items-center justify-center p-4">
          <div
            ref={recsModalRef}
            role="dialog"
            aria-modal="true"
            className="bg-white border border-sand/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-sand/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-medium text-charcoal-deep">Post-Session Recommendations</h3>
                <p className="text-xs text-taupe mt-1">
                  {formatDate(appointments.find(a => a.appointment_id === recsApptId)?.date || '')}
                </p>
              </div>
              <button
                onClick={() => { setRecsApptId(null); setPendingRecs([]); setRecForm({ productId: '', stylistNote: '' }); }}
                className="p-2 hover:bg-sand/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current recommendations */}
              {pendingRecs.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                    Recommended Items ({pendingRecs.length})
                  </p>
                  <div className="space-y-3">
                    {pendingRecs.map(rec => (
                      <div key={rec.id} className="flex items-center gap-4 p-3 border border-sand/50">
                        <div className="w-12 h-12 bg-parchment flex items-center justify-center flex-shrink-0">
                          {rec.productImage ? (
                            <img src={rec.productImage} alt={rec.productName} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-stone" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep truncate">{rec.productName}</p>
                          <p className="text-xs text-taupe">€{rec.price.toLocaleString()}</p>
                          {rec.stylistNote && <p className="text-xs text-stone italic mt-1">{rec.stylistNote}</p>}
                        </div>
                        <button
                          onClick={() => setPendingRecs(prev => prev.filter(r => r.id !== rec.id))}
                          className="p-1 text-error/60 hover:text-error transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add recommendation */}
              <div className="border-t border-sand/30 pt-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Add Recommendation</p>
                <div className="space-y-3">
                  <select
                    value={recForm.productId}
                    onChange={e => setRecForm(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors text-sm"
                  >
                    <option value="">Select a product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — €{p.price.toLocaleString()}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={recForm.stylistNote}
                    onChange={e => setRecForm(prev => ({ ...prev, stylistNote: e.target.value }))}
                    placeholder="Stylist note (optional)"
                    className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors text-sm placeholder:text-taupe"
                  />
                  <button
                    onClick={handleAddRecommendation}
                    disabled={!recForm.productId}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.1em] uppercase bg-parchment text-charcoal-deep hover:bg-sand/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={12} />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-4 border-t border-sand/30">
                <button
                  onClick={() => { setRecsApptId(null); setPendingRecs([]); setRecForm({ productId: '', stylistNote: '' }); }}
                  className="flex-1 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRecommendations}
                  className="flex-1 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
                >
                  Save Recommendations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
