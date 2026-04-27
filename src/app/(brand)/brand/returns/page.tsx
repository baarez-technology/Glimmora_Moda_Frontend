'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { getBrandReturnOrders, updateBrandReturnOrderStatus, type BrandApiReturnOrder } from '@/services/brand-return-order.service';
import { fetchBrandProducts } from '@/services/private-collection.service';
import Link from 'next/link';

type ProductMap = Record<string, { name: string; imageUrl: string }>;

type FilterTab = 'all' | 'pending' | 'accepted' | 'declined';

const REASON_LABELS: Record<string, string> = {
  wrong_size: 'Wrong size',
  defective: 'Defective / damaged',
  not_as_described: 'Not as described',
  changed_mind: 'Changed my mind',
  other: 'Other',
};

export default function BrandReturnsPage() {
  const [returns, setReturns] = useState<BrandApiReturnOrder[]>([]);
  const [productMap, setProductMap] = useState<ProductMap>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const [data, productsRes] = await Promise.all([
        getBrandReturnOrders(),
        fetchBrandProducts({ page_number: 1 }),
      ]);
      setReturns(data);
      const map: ProductMap = {};
      for (const p of productsRes.items) map[p.id] = { name: p.name, imageUrl: p.imageUrl };
      setProductMap(map);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReturns(); }, [loadReturns]);

  const filteredReturns = filter === 'all' ? returns : returns.filter(r => r.status === filter);

  const handleStatus = async (returnOrderId: string, status: 'accepted' | 'declined') => {
    setUpdatingId(returnOrderId);
    try {
      const updated = await updateBrandReturnOrderStatus(returnOrderId, status);
      setReturns(prev => prev.map(r => r.return_order_id === returnOrderId ? updated : r));
    } catch { /* silent */ }
    finally { setUpdatingId(null); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':  return 'bg-gold-soft/10 text-gold-deep';
      case 'accepted': return 'bg-success/10 text-success';
      case 'declined': return 'bg-error/10 text-error';
      default:         return 'bg-taupe/10 text-stone';
    }
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;

  // Reason breakdown for analytics
  const reasonCounts = returns.reduce<Record<string, number>>((acc, r) => {
    const key = r.reason_for_return || 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <BrandPageHeader
        title="Return Requests"
        subtitle={`${returns.length} total${pendingCount > 0 ? ` · ${pendingCount} pending approval` : ''}`}
      />

      <div className="p-8 space-y-6">

        {/* Return reason breakdown */}
        {!loading && returns.length > 0 && (
          <div className="bg-white border border-sand/50 p-6">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone mb-4">Return Reasons Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reasonCounts).sort(([, a], [, b]) => b - a).map(([reason, count]) => (
                <div key={reason} className="bg-parchment p-4">
                  <p className="font-display text-2xl text-charcoal-deep mb-1">{count}</p>
                  <p className="text-xs text-stone">{REASON_LABELS[reason] || reason}</p>
                  <div className="mt-2 h-1 bg-sand/40">
                    <div className="h-full bg-charcoal-deep" style={{ width: `${Math.round((count / returns.length) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {reasonCounts['wrong_size'] > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 mt-4">
                <strong>{reasonCounts['wrong_size']} wrong size returns</strong> — consider reviewing your size guide accuracy. Fit confidence data may be miscalibrated for affected products.
              </p>
            )}
          </div>
        )}
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
            {filteredReturns.map(ret => {
              const prod = productMap[ret.product_id];
              return (
              <div key={ret.return_order_id} className="bg-white border border-sand/50 p-6">
                {/* Product row */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-sand/30">
                  <div className="w-12 h-12 bg-parchment flex-shrink-0 overflow-hidden">
                    {prod?.imageUrl
                      ? <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-taupe text-xs">?</div>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep">{prod?.name ?? `Product #${ret.product_id.slice(-6).toUpperCase()}`}</p>
                    <Link href={`/brand/orders/${ret.order_id}`} className="text-xs text-taupe hover:text-charcoal-deep underline underline-offset-2 transition-colors">
                      Order #{ret.order_id.slice(-6).toUpperCase()}
                    </Link>
                  </div>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(ret.status)}`}>
                        {ret.status}
                      </span>
                      <p className="text-xs text-stone">
                        {ret.customer_name} · {ret.customer_email}
                      </p>
                    </div>
                    <p className="text-xs text-taupe mt-1">
                      Requested {new Date(ret.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Reason</p>
                    <p className="text-sm text-charcoal-deep">{REASON_LABELS[ret.reason_for_return] || ret.reason_for_return}</p>
                  </div>
                  {ret.details && (
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Details</p>
                      <p className="text-sm text-stone">{ret.details}</p>
                    </div>
                  )}
                </div>

                {ret.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-sand/30">
                    <button
                      onClick={() => handleStatus(ret.return_order_id, 'accepted')}
                      disabled={updatingId === ret.return_order_id}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                    >
                      {updatingId === ret.return_order_id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatus(ret.return_order_id, 'declined')}
                      disabled={updatingId === ret.return_order_id}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-error/30 text-error text-xs tracking-[0.1em] uppercase hover:bg-error/10 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
