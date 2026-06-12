'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Check, X, Loader2, AlertCircle, TrendingUp, Package } from 'lucide-react';
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

// ─── Luxury KPI tile (matches Orders + Dashboard) ──────────────────────────────
function ReturnKpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'gold' | 'warning' | 'success' | 'error';
}) {
  const accentRing =
    accent === 'gold' ? 'before:bg-gold-soft'
    : accent === 'warning' ? 'before:bg-warning'
    : accent === 'success' ? 'before:bg-success'
    : accent === 'error' ? 'before:bg-error'
    : 'before:bg-charcoal-deep/40';
  return (
    <div className={`relative bg-white border border-sand/40 p-6 group hover:border-sand/80 transition-colors duration-500 overflow-hidden before:absolute before:top-0 before:left-0 before:h-px before:w-0 group-hover:before:w-full before:transition-all before:duration-700 ${accentRing}`}>
      <span className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">{label}</span>
      <p className="font-display text-3xl text-charcoal-deep leading-none tracking-[-0.02em] mb-2">{value}</p>
      {hint && <p className="text-[10px] tracking-[0.1em] uppercase text-stone/70 italic">{hint}</p>}
    </div>
  );
}

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

  // KPIs
  const kpis = useMemo(() => {
    const pending = returns.filter(r => r.status === 'pending').length;
    const accepted = returns.filter(r => r.status === 'accepted').length;
    const declined = returns.filter(r => r.status === 'declined').length;
    const total = returns.length;
    const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { pending, accepted, declined, total, acceptRate };
  }, [returns]);

  // Reason breakdown
  const reasonCounts = useMemo(() => {
    return returns.reduce<Record<string, number>>((acc, r) => {
      const key = r.reason_for_return || 'other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [returns]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <BrandPageHeader
        title="Return Requests"
        subtitle={`${returns.length} total${kpis.pending > 0 ? ` · ${kpis.pending} pending approval` : ''}`}
      />

      <div className="p-6 md:p-8 lg:p-10 space-y-10">
        {/* ═══════════════════════════════════════════════════════════════
            LUXURY HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-dawn-luxury opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-0 w-24 h-px bg-gold-soft" aria-hidden="true" />

          <div className="relative px-8 md:px-12 py-8 md:py-10 bg-white border border-sand/40">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-deep block mb-4">
              {today}
            </span>
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-2">
              Returns &amp; <span className="italic text-stone">Reflections</span>
            </h1>
            <p className="text-sm text-stone max-w-xl leading-relaxed">
              Every return is a conversation — a chance to listen, adjust, and refine the fit, the cut, the experience. Approve with care.
            </p>
          </div>
        </section>

        {/* KPI Strip */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-xl text-charcoal-deep tracking-[-0.01em]">Snapshot</h2>
            <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">All time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReturnKpi
              label="Total Requests"
              value={kpis.total}
              hint="returns received"
              accent="gold"
            />
            <ReturnKpi
              label="Pending"
              value={kpis.pending}
              hint="awaiting decision"
              accent="warning"
            />
            <ReturnKpi
              label="Accepted"
              value={kpis.accepted}
              hint={`${kpis.acceptRate}% accept rate`}
              accent="success"
            />
            <ReturnKpi
              label="Declined"
              value={kpis.declined}
              hint="returns refused"
              accent="error"
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            REASON BREAKDOWN
        ═══════════════════════════════════════════════════════════════ */}
        {!loading && returns.length > 0 && (
          <section className="bg-white border border-sand/40">
            <div className="px-6 md:px-8 py-5 border-b border-sand/40 flex items-end justify-between">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-1">Intelligence</span>
                <h2 className="font-display text-xl text-charcoal-deep tracking-[-0.01em]">Why pieces come back</h2>
              </div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-taupe italic">Last {returns.length} returns</span>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reasonCounts).sort(([, a], [, b]) => b - a).map(([reason, count]) => {
                  const pct = Math.round((count / returns.length) * 100);
                  return (
                    <div key={reason} className="bg-parchment/40 border border-sand/30 p-5">
                      <p className="font-display text-3xl text-charcoal-deep mb-1 tracking-[-0.02em]">{count}</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-3">{REASON_LABELS[reason] || reason}</p>
                      <div className="h-1 bg-sand/40 overflow-hidden">
                        <div className="h-full bg-gold-soft transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-taupe italic mt-2">{pct}% of total</p>
                    </div>
                  );
                })}
              </div>

              {reasonCounts['wrong_size'] > 0 && (
                <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50/60 border border-amber-200/60">
                  <AlertCircle size={14} strokeWidth={1.5} className="text-amber-700 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong className="font-medium">{reasonCounts['wrong_size']} wrong-size returns</strong> — consider reviewing your size guide accuracy. Fit confidence data may be miscalibrated for affected pieces.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            FILTER TABS
        ═══════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-1 bg-parchment p-1 w-fit">
            {([
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
            ] as { value: FilterTab; label: string }[]).map(tab => {
              const count = tab.value === 'all' ? returns.length : returns.filter(r => r.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-5 py-2 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2.5 ${
                    filter === tab.value ? 'bg-white text-charcoal-deep shadow-sm' : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 ${filter === tab.value ? 'bg-charcoal-deep text-ivory-cream' : 'bg-sand/60 text-taupe'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            RETURN CARDS / EMPTY STATE
        ═══════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={26} strokeWidth={1.5} className="animate-spin text-gold-soft mb-4" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-stone">Reviewing return requests</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="bg-white border border-sand/40 px-8 py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-5 border border-success/40 rounded-full flex items-center justify-center">
              <Package size={22} strokeWidth={1.5} className="text-success" />
            </div>
            <p className="font-display text-2xl text-charcoal-deep mb-2 tracking-[-0.01em]">
              {returns.length === 0 ? 'No returns yet' : 'No requests in this view'}
            </p>
            <p className="text-sm text-stone max-w-md mx-auto leading-relaxed">
              {returns.length === 0
                ? 'Every piece you ship stays with its new home. When a return request comes in, you will see it here — ready for your review.'
                : 'Switch the filter above to see other request categories.'}
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {filteredReturns.map(ret => {
              const prod = productMap[ret.product_id];
              const isPending = ret.status === 'pending';
              return (
                <div
                  key={ret.return_order_id}
                  className={`relative bg-white border ${isPending ? 'border-gold-soft/40' : 'border-sand/40'} overflow-hidden group hover:border-sand/80 transition-colors duration-500`}
                >
                  {/* Pending accent stripe */}
                  {isPending && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gold-soft" aria-hidden="true" />
                  )}

                  <div className="p-6 md:p-8">
                    {/* Product header */}
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-sand/30">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-parchment flex-shrink-0 overflow-hidden border border-sand/40">
                        {prod?.imageUrl
                          ? <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-taupe">
                              <Package size={18} strokeWidth={1.5} />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg md:text-xl text-charcoal-deep tracking-[-0.01em]">
                          {prod?.name ?? `Piece · ${ret.product_id.slice(-6).toUpperCase()}`}
                        </p>
                        <Link
                          href={`/brand/orders/${ret.order_id}`}
                          className="inline-flex items-center gap-1 mt-1 text-[10px] tracking-[0.3em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                        >
                          Order · {ret.order_id.slice(-6).toUpperCase()}
                        </Link>
                      </div>
                      <span className={`px-3 py-1 text-[10px] tracking-[0.2em] uppercase ${getStatusBadge(ret.status)}`}>
                        {ret.status}
                      </span>
                    </div>

                    {/* Customer + date */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-parchment border border-gold-soft/30 rounded-full flex items-center justify-center text-xs text-charcoal-warm font-display flex-shrink-0">
                          {ret.customer_name ? ret.customer_name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-sm text-charcoal-deep">{ret.customer_name}</p>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-taupe mt-0.5">{ret.customer_email}</p>
                        </div>
                      </div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-taupe italic">
                        {new Date(ret.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Reason + details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">The Reason</p>
                        <p className="font-display text-base text-charcoal-deep tracking-[-0.01em]">
                          {REASON_LABELS[ret.reason_for_return] || ret.reason_for_return}
                        </p>
                      </div>
                      {ret.details && (
                        <div>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">The Detail</p>
                          <p className="text-sm text-stone italic leading-relaxed">&ldquo;{ret.details}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isPending && (
                      <div className="flex items-center gap-3 pt-6 border-t border-sand/30">
                        <button
                          onClick={() => handleStatus(ret.return_order_id, 'accepted')}
                          disabled={updatingId === ret.return_order_id}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.3em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                        >
                          {updatingId === ret.return_order_id
                            ? <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
                            : <Check size={13} strokeWidth={1.5} />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatus(ret.return_order_id, 'declined')}
                          disabled={updatingId === ret.return_order_id}
                          className="inline-flex items-center gap-2 px-6 py-3 border border-error/30 text-error text-[10px] tracking-[0.3em] uppercase hover:bg-error/5 hover:border-error/60 transition-colors disabled:opacity-50"
                        >
                          <X size={13} strokeWidth={1.5} />
                          Decline
                        </button>

                        <p className="ml-auto text-[10px] tracking-[0.2em] uppercase text-taupe italic">
                          Decision pending your review
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Closing editorial flourish */}
        {!loading && filteredReturns.length > 0 && (
          <p className="text-center text-[10px] tracking-[0.4em] uppercase text-stone/50 pt-4 flex items-center justify-center gap-3">
            <RotateCcw size={11} strokeWidth={1.5} />
            ModaGlimmora · Return Intelligence
          </p>
        )}

        {/* Tiny hidden import use to satisfy TS in case some flags are off */}
        <span className="hidden"><TrendingUp size={0} /></span>
      </div>
    </div>
  );
}
