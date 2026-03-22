'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Check, X, Clock, Loader2 } from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { getBrandReturns, approveReturn, rejectReturn, RETURN_REASONS, type ReturnRequest } from '@/services/returns.service';
import { formatPrice } from '@/lib/currency';

type FilterTab = 'all' | ReturnRequest['status'];

export default function BrandReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    setReturns(getBrandReturns());
    setLoading(false);
  }, []);

  const filteredReturns = filter === 'all' ? returns : returns.filter(r => r.status === filter);

  const handleApprove = (returnId: string) => {
    setActionId(returnId);
    const result = approveReturn(returnId, 'Return approved. Refund will be processed.');
    if (result) {
      setReturns(prev => prev.map(r => r.id === returnId ? result : r));
    }
    setActionId(null);
  };

  const handleReject = (returnId: string) => {
    setActionId(returnId);
    const result = rejectReturn(returnId, rejectNotes || 'Return request declined.');
    if (result) {
      setReturns(prev => prev.map(r => r.id === returnId ? result : r));
    }
    setShowRejectModal(null);
    setRejectNotes('');
    setActionId(null);
  };

  const getReasonLabel = (reason: string) => RETURN_REASONS.find(r => r.value === reason)?.label || reason;

  const getStatusBadge = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-gold-soft/10 text-gold-deep';
      case 'approved': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-error/10 text-error';
      case 'completed': return 'bg-charcoal-deep/10 text-charcoal-deep';
    }
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;

  return (
    <div>
      <BrandPageHeader
        title="Return Requests"
        subtitle={`${returns.length} total${pendingCount > 0 ? ` · ${pendingCount} pending approval` : ''}`}
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit">
          {([
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ] as { value: FilterTab; label: string }[]).map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors ${
                filter === tab.value ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label} ({tab.value === 'all' ? returns.length : returns.filter(r => r.status === tab.value).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Loader2 size={32} className="mx-auto text-stone animate-spin mb-3" />
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <RotateCcw size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No return requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map(ret => (
              <div key={ret.id} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-charcoal-deep">{ret.product_name}</h3>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(ret.status)}`}>
                        {ret.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone">
                      Order #{ret.order_id.slice(0, 8).toUpperCase()} · {ret.customer_name} ({ret.customer_email})
                    </p>
                    <p className="text-xs text-taupe mt-1">
                      Requested {new Date(ret.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {ret.refund_amount != null && (
                    <p className="font-display text-lg text-charcoal-deep">
                      {formatPrice(ret.refund_amount, ret.currency)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Reason</p>
                    <p className="text-sm text-charcoal-deep">{getReasonLabel(ret.reason)}</p>
                  </div>
                  {ret.reason_details && (
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Details</p>
                      <p className="text-sm text-stone">{ret.reason_details}</p>
                    </div>
                  )}
                </div>

                {ret.brand_notes && (
                  <div className="mb-4 p-3 bg-parchment/50">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Your Response</p>
                    <p className="text-sm text-charcoal-deep">{ret.brand_notes}</p>
                  </div>
                )}

                {ret.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-sand/30">
                    <button
                      onClick={() => handleApprove(ret.id)}
                      disabled={actionId === ret.id}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                      Approve Return
                    </button>
                    <button
                      onClick={() => setShowRejectModal(ret.id)}
                      disabled={actionId === ret.id}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-error/30 text-error text-xs tracking-[0.1em] uppercase hover:bg-error/10 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(null)}>
          <div className="bg-white max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-xl text-charcoal-deep mb-4">Reject Return Request</h3>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Reason for rejection</label>
              <textarea
                value={rejectNotes}
                onChange={e => setRejectNotes(e.target.value)}
                rows={3}
                placeholder="Explain why the return is being rejected..."
                className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase">
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-6 py-3 bg-error text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-error/90 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
