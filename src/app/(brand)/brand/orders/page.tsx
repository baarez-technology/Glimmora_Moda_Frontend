'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, Search, Package, Truck, CheckCircle,
  XCircle, AlertCircle, Clock, Loader2, Download, ChevronDown,
  FileJson, FileText, FileSpreadsheet, ShoppingBag, TrendingUp
} from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import {
  fetchBrandOrders, exportBrandOrders,
  type ApiBrandOrder
} from '@/services/brand-order.service';

type DeliveryStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':    return 'bg-warning/10 text-warning';
    case 'processing': return 'bg-gold-soft/20 text-gold-deep';
    case 'shipped':    return 'bg-info/10 text-info';
    case 'delivered':  return 'bg-success/10 text-success';
    case 'cancelled':  return 'bg-error/10 text-error';
    default:           return 'bg-taupe/20 text-stone';
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case 'paid':     return 'bg-success/10 text-success';
    case 'pending':  return 'bg-warning/10 text-warning';
    case 'refunded': return 'bg-info/10 text-info';
    case 'failed':   return 'bg-error/10 text-error';
    default:         return 'bg-taupe/20 text-stone';
  }
}

function StatusIcon({ status }: { status: string }) {
  const cls = 'w-3 h-3';
  switch (status) {
    case 'pending':    return <AlertCircle className={cls} strokeWidth={1.5} />;
    case 'processing': return <Package className={cls} strokeWidth={1.5} />;
    case 'shipped':    return <Truck className={cls} strokeWidth={1.5} />;
    case 'delivered':  return <CheckCircle className={cls} strokeWidth={1.5} />;
    case 'cancelled':  return <XCircle className={cls} strokeWidth={1.5} />;
    default:           return <Clock className={cls} strokeWidth={1.5} />;
  }
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_TAB_VALUES: ('all' | DeliveryStatus)[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_TAB_LABELS: Record<string, string> = { all: 'All', pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

// ─── Luxury KPI tile ──────────────────────────────────────────────────────────
function OrderKpi({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: 'gold' | 'warning' | 'success' | 'info' }) {
  const accentRing = accent === 'gold' ? 'before:bg-gold-soft'
    : accent === 'warning' ? 'before:bg-warning'
    : accent === 'success' ? 'before:bg-success'
    : accent === 'info' ? 'before:bg-info'
    : 'before:bg-charcoal-deep/40';

  return (
    <div className={`relative bg-white border border-sand/40 p-6 group hover:border-sand/80 transition-colors duration-500 overflow-hidden before:absolute before:top-0 before:left-0 before:h-px before:w-0 group-hover:before:w-full before:transition-all before:duration-700 ${accentRing}`}>
      <span className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">{label}</span>
      <p className="font-display text-3xl text-charcoal-deep leading-none tracking-[-0.02em] mb-2">{value}</p>
      {hint && <p className="text-[10px] tracking-[0.1em] uppercase text-stone/70 italic">{hint}</p>}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiBrandOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  void pageSize;

  // Client-side filters (applied on current page)
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [search, setSearch] = useState('');

  // Export
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'json' | 'csv' | 'excel' | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const loadOrders = async (p = page) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchBrandOrders(p);
      setOrders(res.orders);
      setTotalPages(res.total_pages);
      setTotalOrders(res.total_orders);
      setPageSize(res.page_size);
      setPage(res.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrders(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handlePageChange = (p: number) => loadOrders(p);

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setShowExportMenu(false);
    setExportingFormat(format);
    try {
      await exportBrandOrders(format);
      setExportToast(`Exported orders as ${format.toUpperCase()}`);
      setTimeout(() => setExportToast(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingFormat(null);
    }
  };

  // Count per status from loaded orders
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const s = o.products[0]?.delivery_status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // KPIs
  const kpis = useMemo(() => {
    const pending = statusCounts['pending'] || 0;
    const delivered = statusCounts['delivered'] || 0;
    const revenueOnPage = orders.reduce((sum, o) => sum + (o.payment_amount || 0), 0);
    const fulfillment = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0;
    const currency = orders[0]?.payment_currency || '';
    return {
      pending,
      delivered,
      revenueOnPage,
      fulfillment,
      currency,
    };
  }, [orders, statusCounts]);

  // Client-side filter on the current page's data
  const displayed = orders.filter(o => {
    const productStatus = o.products[0]?.delivery_status || 'pending';
    const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
    const matchesSearch = search === '' ||
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const headerActions = (
    <div className="relative" ref={exportMenuRef}>
      <button
        onClick={() => !exportingFormat && setShowExportMenu(v => !v)}
        disabled={!!exportingFormat}
        className="inline-flex items-center gap-2 px-5 py-2.5 border border-sand text-xs tracking-[0.2em] uppercase text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {exportingFormat ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} strokeWidth={1.5} />}
        {exportingFormat ? 'Exporting…' : 'Export'}
        {!exportingFormat && <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
      </button>
      {showExportMenu && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-sand shadow-lg z-30">
          <div className="px-4 py-2.5 border-b border-sand/40">
            <p className="text-[10px] tracking-[0.3em] uppercase text-taupe">Via Backend · S3</p>
          </div>
          <button onClick={() => handleExport('json')} className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-[0.1em] uppercase text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
            <FileJson size={14} className="text-gold-muted" strokeWidth={1.5} /> Export as JSON
          </button>
          <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-[0.1em] uppercase text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
            <FileText size={14} className="text-info" strokeWidth={1.5} /> Export as CSV
          </button>
          <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-[0.1em] uppercase text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
            <FileSpreadsheet size={14} className="text-success" strokeWidth={1.5} /> Export as Excel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <BrandPageHeader
        title="Orders"
        subtitle={isLoading ? 'Loading…' : `${totalOrders} order${totalOrders !== 1 ? 's' : ''}`}
        actions={headerActions}
      />

      <div className="p-6 md:p-8 lg:p-10 space-y-10">
        {/* ═══════════════════════════════════════════════════════════════
            LUXURY HERO — Today + KPIs
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-dawn-luxury opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-0 w-24 h-px bg-gold-soft" aria-hidden="true" />

          <div className="relative px-8 md:px-12 py-8 md:py-10 bg-white border border-sand/40">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-deep block mb-4">
              {today}
            </span>
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-2">
              Orders <span className="italic text-stone">in motion</span>
            </h1>
            <p className="text-sm text-stone max-w-xl leading-relaxed">
              Every transaction with a customer — from the moment they decide to make a piece theirs through fulfilment and delivery.
            </p>
          </div>
        </section>

        {/* KPI Strip */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-xl text-charcoal-deep tracking-[-0.01em]">Snapshot</h2>
            <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Current view</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OrderKpi
              label="Total Orders"
              value={totalOrders.toLocaleString()}
              hint="all-time on platform"
              accent="gold"
            />
            <OrderKpi
              label="Pending"
              value={kpis.pending}
              hint="awaiting fulfilment"
              accent="warning"
            />
            <OrderKpi
              label="Delivered"
              value={kpis.delivered}
              hint={`${kpis.fulfillment}% fulfilled`}
              accent="success"
            />
            <OrderKpi
              label="Page Revenue"
              value={kpis.revenueOnPage > 0 ? `${kpis.currency} ${kpis.revenueOnPage.toLocaleString()}` : '—'}
              hint="across visible orders"
              accent="info"
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FILTER + SEARCH
        ═══════════════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-4">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
            {STATUS_TAB_VALUES.map(value => {
              const count = value === 'all' ? orders.length : (statusCounts[value] || 0);
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-5 py-2 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-2.5 ${
                    statusFilter === value
                      ? 'bg-white text-charcoal-deep shadow-sm'
                      : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  {STATUS_TAB_LABELS[value]}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 ${statusFilter === value ? 'bg-charcoal-deep text-ivory-cream' : 'bg-sand/60 text-taupe'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe italic focus:outline-none focus:border-gold-soft transition-colors"
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-error/5 border border-error/20 p-5 flex items-center justify-between">
            <span className="text-sm text-error">{error}</span>
            <button onClick={() => loadOrders(page)} className="text-xs tracking-[0.2em] uppercase text-error underline">Retry</button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ORDERS TABLE / EMPTY STATE
        ═══════════════════════════════════════════════════════════════ */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={26} strokeWidth={1.5} className="animate-spin text-gold-soft mb-4" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-stone">Curating your orders</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white border border-sand/40 px-8 py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-5 border border-gold-soft/40 rounded-full flex items-center justify-center">
              <ShoppingBag size={22} strokeWidth={1.5} className="text-gold-soft" />
            </div>
            <p className="font-display text-2xl text-charcoal-deep mb-2 tracking-[-0.01em]">
              {orders.length === 0 ? 'No orders yet' : 'No matches'}
            </p>
            <p className="text-sm text-stone max-w-md mx-auto leading-relaxed">
              {orders.length === 0
                ? 'Once a customer places an order for one of your pieces, it will appear here — ready to be reviewed, prepared, and dispatched.'
                : 'Try adjusting the filter or search term — the order you are looking for may be on another page.'}
            </p>
            {orders.length === 0 && (
              <Link href="/brand/products/new" className="mt-8 inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-charcoal-deep group">
                Add a Piece
                <span className="w-9 h-9 border border-charcoal-deep/30 flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                  <ChevronRight size={14} strokeWidth={1.5} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-sand/40">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30 bg-parchment/30">
                    <th className="text-left px-6 md:px-8 py-5 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Order</th>
                    <th className="text-left px-6 py-5 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Client</th>
                    <th className="text-left px-6 py-5 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Pieces</th>
                    <th className="text-right px-6 py-5 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Total</th>
                    <th className="text-center px-6 py-5 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Payment</th>
                    <th className="text-center px-6 py-5 text-[10px] tracking-[0.3em] uppercase text-taupe font-medium">Status</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {displayed.map(order => {
                    const deliveryStatus = order.products[0]?.delivery_status || 'pending';
                    return (
                      <tr key={order.order_id} className="hover:bg-parchment/20 transition-colors duration-500">
                        <td className="px-6 md:px-8 py-5">
                          <p className="font-mono text-sm font-medium text-charcoal-deep tracking-[0.05em]">
                            {order.order_id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-taupe italic mt-1">{formatDate(order.order_date)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-parchment border border-gold-soft/30 rounded-full flex items-center justify-center text-xs text-charcoal-warm font-display flex-shrink-0">
                              {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="text-sm text-charcoal-deep">{order.customer_name || '—'}</p>
                              {order.customer_type && (
                                <span className="inline-block mt-1 text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 bg-gold-soft/20 text-gold-deep">
                                  {order.customer_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-charcoal-deep">
                            {order.products.length} piece{order.products.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-taupe italic truncate max-w-[220px] mt-1">
                            {order.products.map(p => p.product_name).join(', ')}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="font-display text-base text-charcoal-deep tracking-[-0.01em]">
                            {order.payment_currency} {order.payment_amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] tracking-[0.1em] uppercase text-taupe mt-1">{order.payment_method}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${getPaymentStatusBadge(order.payment_status)}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase ${getStatusBadge(deliveryStatus)}`}>
                              <StatusIcon status={deliveryStatus} />
                              {deliveryStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/brand/orders/${order.order_id}`}
                            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-stone hover:text-charcoal-deep transition-colors group"
                          >
                            View
                            <ChevronRight size={12} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 md:px-8 py-5 border-t border-sand/30 flex items-center justify-between">
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">
                Page <span className="text-charcoal-deep font-medium">{page}</span> of {totalPages} · {totalOrders} orders
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-[0.2em] uppercase text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={12} strokeWidth={1.5} /> Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : page - 3 + i);
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 text-xs transition-colors ${
                        page === p
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : 'text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-[0.2em] uppercase text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Closing editorial flourish */}
        {!isLoading && displayed.length > 0 && (
          <p className="text-center text-[10px] tracking-[0.4em] uppercase text-stone/50 pt-4 flex items-center justify-center gap-3">
            <TrendingUp size={11} strokeWidth={1.5} />
            ModaGlimmora · Order Intelligence
          </p>
        )}
      </div>

      {/* Export success toast */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-success/10 border border-success/30 text-success shadow-lg">
          <CheckCircle size={16} strokeWidth={1.5} />
          <span className="text-sm">{exportToast}</span>
          <button onClick={() => setExportToast(null)} className="text-success/60 hover:text-success transition-colors text-lg leading-none">×</button>
        </div>
      )}
    </div>
  );
}
