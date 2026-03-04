'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Video, Store, Home, CheckCircle, XCircle, RotateCcw, MapPin, Mail, AlertTriangle, Sparkles, Plus, X, Package } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import type { StylingSession, StylingSessionType, StylingSessionStatus, StylingRecommendation } from '@/types/brand-portal';

type FilterTab = 'all' | 'upcoming' | 'past';
type ViewMode = 'list' | 'calendar';

export default function StylingSessionsPage() {
  const { stylingSessions, updateStylingSessionStatus, products } = useBrand();
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
      case 'virtual': return Video;
      case 'in_store': return Store;
      case 'home': return Home;
      default: return Calendar;
    }
  };

  const getTypeBadge = (type: StylingSessionType) => {
    switch (type) {
      case 'virtual': return 'bg-info/10 text-info';
      case 'in_store': return 'bg-gold-soft/20 text-gold-deep';
      case 'home': return 'bg-champagne/30 text-gold-muted';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusBadge = (status: StylingSessionStatus) => {
    switch (status) {
      case 'pending': return 'bg-gold-soft/20 text-gold-deep';
      case 'confirmed': return 'bg-info/10 text-info';
      case 'scheduled': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
      case 'rescheduled': return 'bg-warning/10 text-warning';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusIcon = (status: StylingSessionStatus) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'scheduled': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'rescheduled': return RotateCcw;
      default: return Clock;
    }
  };

  const getTierBadge = (tier: StylingSession['customerTier']) => {
    switch (tier) {
      case 'uhni': return 'bg-gold-soft/20 text-gold-deep';
      case 'preferred': return 'bg-champagne/30 text-gold-muted';
      case 'standard': return 'bg-parchment text-charcoal-deep';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  // Confirm status update dialog
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

  // Recommendations modal
  const [recsSession, setRecsSession] = useState<StylingSession | null>(null);
  const [recForm, setRecForm] = useState({ productId: '', stylistNote: '' });
  const [pendingRecs, setPendingRecs] = useState<StylingRecommendation[]>([]);

  const recsModalRef = useModalAccessibility(
    !!recsSession,
    () => { setRecsSession(null); setPendingRecs([]); setRecForm({ productId: '', stylistNote: '' }); }
  );

  const handleOpenRecommendations = (session: StylingSession) => {
    setRecsSession(session);
    setPendingRecs(session.outfitRecommendations || []);
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

  const handleRemoveRecommendation = (recId: string) => {
    setPendingRecs(prev => prev.filter(r => r.id !== recId));
  };

  const handleSaveRecommendations = () => {
    if (recsSession) {
      updateStylingSessionStatus(recsSession.id, recsSession.status, {
        outfitRecommendations: pendingRecs,
      });
      setRecsSession(null);
      setPendingRecs([]);
    }
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
                viewMode === 'list' ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Sessions */}
        {sortedSessions.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Calendar size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No styling sessions found</p>
            <p className="text-sm text-taupe mt-2">Sessions booked by clients will appear here</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/50 bg-parchment/30">
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Date & Time</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Customer</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Context</th>
                    <th className="px-6 py-4 text-right text-[10px] tracking-[0.2em] uppercase text-taupe font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSessions.map(session => {
                    const TypeIcon = getTypeIcon(session.type);
                    const StatusIcon = getStatusIcon(session.status);
                    const isUpcoming = getSessionTiming(session) === 'upcoming';
                    const canManage = isUpcoming && (session.status === 'scheduled' || session.status === 'pending' || session.status === 'confirmed');
                    const isPending = session.status === 'pending';
                    const isCompleted = session.status === 'completed';

                    return (
                      <tr key={session.id} className="border-b border-sand/30 hover:bg-parchment/20">
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

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getTypeBadge(session.type)}`}>
                            <TypeIcon size={10} />
                            {session.type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(session.status)}`}>
                            <StatusIcon size={10} />
                            {session.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {session.contextInfo ? (
                            <p className="text-xs text-stone max-w-[150px] truncate" title={session.contextInfo}>
                              {session.contextInfo}
                            </p>
                          ) : session.notes ? (
                            <p className="text-xs text-taupe italic max-w-[150px] truncate" title={session.notes}>
                              {session.notes}
                            </p>
                          ) : (
                            <span className="text-xs text-taupe">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <button
                                onClick={() => updateStylingSessionStatus(session.id, 'confirmed')}
                                className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-info/10 text-info hover:bg-info/20 transition-colors"
                              >
                                Confirm
                              </button>
                            )}
                            {canManage && (
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
                            )}
                            {isCompleted && (
                              <button
                                onClick={() => handleOpenRecommendations(session)}
                                className="px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep hover:bg-gold-soft/30 transition-colors flex items-center gap-1"
                              >
                                <Sparkles size={10} />
                                Recommendations
                                {session.outfitRecommendations && session.outfitRecommendations.length > 0 && (
                                  <span className="ml-1 text-[9px]">({session.outfitRecommendations.length})</span>
                                )}
                              </button>
                            )}
                            {!canManage && !isPending && !isCompleted && (
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
                const canManage = isUpcoming && (session.status === 'scheduled' || session.status === 'pending' || session.status === 'confirmed');
                const isPending = session.status === 'pending';
                const isCompleted = session.status === 'completed';

                return (
                  <div
                    key={session.id}
                    className={`border p-4 ${
                      isUpcoming ? 'border-gold-soft/50 bg-gold-soft/5' : 'border-sand/50'
                    }`}
                  >
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

                    <div className="mb-3">
                      <p className="font-medium text-charcoal-deep">{formatDate(session.scheduledAt)}</p>
                      <p className="text-sm text-taupe">{formatTime(session.scheduledAt)} - {session.duration} minutes</p>
                    </div>

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

                    {session.contextInfo && (
                      <p className="text-xs text-stone mb-3 line-clamp-2">{session.contextInfo}</p>
                    )}

                    {session.notes && (
                      <p className="text-xs text-taupe italic mb-3 line-clamp-2">{session.notes}</p>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-sand/30">
                      {isPending && (
                        <button
                          onClick={() => updateStylingSessionStatus(session.id, 'confirmed')}
                          className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-info/10 text-info hover:bg-info/20 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {canManage && (
                        <>
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
                        </>
                      )}
                      {isCompleted && (
                        <button
                          onClick={() => handleOpenRecommendations(session)}
                          className="flex-1 px-3 py-2 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep hover:bg-gold-soft/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Sparkles size={10} />
                          Recommendations
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

      {/* Recommendations Modal */}
      {recsSession && (
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
                  {recsSession.customerName} — {formatDate(recsSession.scheduledAt)}
                </p>
              </div>
              <button
                onClick={() => { setRecsSession(null); setPendingRecs([]); setRecForm({ productId: '', stylistNote: '' }); }}
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
                          {rec.stylistNote && (
                            <p className="text-xs text-stone italic mt-1">{rec.stylistNote}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveRecommendation(rec.id)}
                          className="p-1 text-error/60 hover:text-error transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new recommendation */}
              <div className="border-t border-sand/30 pt-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Add Recommendation</p>
                <div className="space-y-3">
                  <select
                    value={recForm.productId}
                    onChange={(e) => setRecForm(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors text-sm"
                  >
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — €{p.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={recForm.stylistNote}
                    onChange={(e) => setRecForm(prev => ({ ...prev, stylistNote: e.target.value }))}
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
                  onClick={() => { setRecsSession(null); setPendingRecs([]); setRecForm({ productId: '', stylistNote: '' }); }}
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
