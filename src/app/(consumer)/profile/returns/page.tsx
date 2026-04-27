'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, RotateCcw, X, Ruler } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { getMyReturnOrders, deleteReturnOrder, type ApiReturnOrder } from '@/services/return-order.service';

const RETURN_REASONS: Record<string, string> = {
  wrong_size: 'Wrong size',
  defective: 'Defective / damaged',
  not_as_described: 'Not as described',
  changed_mind: 'Changed my mind',
  other: 'Other',
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'accepted' ? 'bg-success/10 text-success' :
    status === 'declined' ? 'bg-error/10 text-error' :
    'bg-gold-soft/10 text-gold-deep';
  return (
    <span className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${cls}`}>
      {status}
    </span>
  );
}

export default function ConsumerReturnsPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();

  const [returns, setReturns] = useState<ApiReturnOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getMyReturnOrders();
      setReturns(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) loadData();
  }, [isHydrated, isAuthenticated, loadData]);

  const handleCancel = async (returnOrderId: string) => {
    setCancellingId(returnOrderId);
    try {
      await deleteReturnOrder(returnOrderId);
      setReturns(prev => prev.filter(r => r.return_order_id !== returnOrderId));
      showToast('Return request cancelled', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel return', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const pending = returns.filter(r => r.status === 'pending');
  const resolved = returns.filter(r => r.status !== 'pending');
  const hasWrongSizeReturn = returns.some(r => r.reason_for_return === 'wrong_size');

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-white border-b border-sand/30">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Your Returns
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em]">
              My Returns
            </h1>
          </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-6 animate-pulse">
                <div className="h-4 bg-sand/30 rounded w-32 mb-3" />
                <div className="h-3 bg-sand/20 rounded w-48" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && hasWrongSizeReturn && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-5 flex items-start gap-4">
            <Ruler size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 mb-1">You returned an item due to wrong size</p>
              <p className="text-sm text-amber-700 mb-3">
                Updating your body measurements helps our fit recommendations improve for future orders.
              </p>
              <Link
                href="/profile/body-twin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white text-xs tracking-[0.1em] uppercase hover:bg-amber-800 transition-colors"
              >
                Update Measurements
              </Link>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Pending Returns */}
            {pending.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs tracking-[0.2em] uppercase text-taupe mb-4">
                  Pending ({pending.length})
                </h2>
                <div className="space-y-4">
                  {pending.map(ret => (
                    <ReturnCard
                      key={ret.return_order_id}
                      ret={ret}
                      onCancel={handleCancel}
                      cancellingId={cancellingId}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Resolved Returns */}
            <section>
              <h2 className="text-xs tracking-[0.2em] uppercase text-taupe mb-4">
                {resolved.length > 0 ? `Resolved (${resolved.length})` : `All Returns (${returns.length})`}
              </h2>

              {returns.length === 0 ? (
                <div className="text-center py-16 bg-white border border-sand/50">
                  <div className="w-14 h-14 mx-auto mb-5 bg-parchment flex items-center justify-center">
                    <RotateCcw size={24} className="text-stone" />
                  </div>
                  <h3 className="font-display text-lg text-charcoal-deep mb-2">No return requests</h3>
                  <p className="text-stone text-sm max-w-sm mx-auto">
                    When you request a return on a delivered item, it will appear here.
                  </p>
                  <Link
                    href="/profile/orders"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                  >
                    View Orders
                  </Link>
                </div>
              ) : resolved.length > 0 ? (
                <div className="space-y-4">
                  {resolved.map(ret => (
                    <ReturnCard
                      key={ret.return_order_id}
                      ret={ret}
                      onCancel={handleCancel}
                      cancellingId={cancellingId}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ReturnCard({
  ret,
  onCancel,
  cancellingId,
  formatDate,
}: {
  ret: ApiReturnOrder;
  onCancel: (id: string) => void;
  cancellingId: string | null;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="bg-white border border-sand/50 p-6">
      <div className="flex items-start gap-4">
        {/* Icon placeholder — no product image in return response */}
        <div className="w-16 h-20 flex-shrink-0 bg-parchment overflow-hidden flex items-center justify-center">
          <Package size={20} className="text-stone/40" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-[10px] text-taupe font-mono">
                Order #{ret.order_id.slice(-6).toUpperCase()} · Product #{ret.product_id.slice(-6).toUpperCase()}
              </p>
              <Link
                href={`/profile/orders/${ret.order_id}`}
                className="text-xs text-stone hover:text-charcoal-deep underline underline-offset-2 transition-colors"
              >
                View order
              </Link>
            </div>
            <StatusBadge status={ret.status} />
          </div>

          <div className="space-y-1 mb-3">
            <p className="text-sm text-charcoal-deep">
              <span className="text-taupe text-xs uppercase tracking-wider mr-2">Reason</span>
              {RETURN_REASONS[ret.reason_for_return] ?? ret.reason_for_return}
            </p>
            {ret.details && (
              <p className="text-sm text-stone leading-relaxed">{ret.details}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-taupe">Requested {formatDate(ret.created_at)}</p>
            {ret.status === 'pending' && (
              <button
                onClick={() => onCancel(ret.return_order_id)}
                disabled={cancellingId === ret.return_order_id}
                className="inline-flex items-center gap-1.5 text-xs text-error hover:text-error/80 transition-colors tracking-[0.1em] uppercase disabled:opacity-50"
              >
                <X size={13} />
                {cancellingId === ret.return_order_id ? 'Cancelling...' : 'Cancel Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
