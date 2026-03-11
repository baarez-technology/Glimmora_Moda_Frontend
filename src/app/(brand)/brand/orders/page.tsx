'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, Search, Package, Truck, CheckCircle,
  XCircle, AlertCircle, Clock, Loader2, Download, ChevronDown,
  FileJson, FileText, FileSpreadsheet
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
    case 'pending':    return <AlertCircle className={cls} />;
    case 'processing': return <Package className={cls} />;
    case 'shipped':    return <Truck className={cls} />;
    case 'delivered':  return <CheckCircle className={cls} />;
    case 'cancelled':  return <XCircle className={cls} />;
    default:           return <Clock className={cls} />;
  }
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_TAB_VALUES: ('all' | DeliveryStatus)[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_TAB_LABELS: Record<string, string> = { all: 'All', pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiBrandOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(20);

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

  useEffect(() => { loadOrders(1); }, []);

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

  const headerActions = (
    <div className="relative" ref={exportMenuRef}>
      <button
        onClick={() => !exportingFormat && setShowExportMenu(v => !v)}
        disabled={!!exportingFormat}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {exportingFormat ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        {exportingFormat ? 'Exporting…' : 'Export'}
        {!exportingFormat && <ChevronDown size={13} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
      </button>
      {showExportMenu && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-30">
          <div className="px-4 py-2 border-b border-sand/40">
            <p className="text-[10px] tracking-[0.1em] uppercase text-taupe">Via backend · S3</p>
          </div>
          <button onClick={() => handleExport('json')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
            <FileJson size={14} className="text-gold-muted" /> Export as JSON
          </button>
          <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
            <FileText size={14} className="text-info" /> Export as CSV
          </button>
          <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
            <FileSpreadsheet size={14} className="text-success" /> Export as Excel
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

      <div className="p-8 space-y-6">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
          {STATUS_TAB_VALUES.map(value => {
            const count = value === 'all' ? orders.length : (statusCounts[value] || 0);
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                  statusFilter === value
                    ? 'bg-white text-charcoal-deep'
                    : 'text-stone hover:text-charcoal-deep'
                }`}
              >
                {STATUS_TAB_LABELS[value]}
                <span className={`text-[10px] font-medium ${statusFilter === value ? 'text-charcoal-deep' : 'text-taupe'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-error/10 text-error text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => loadOrders(page)} className="underline text-xs">Retry</button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-taupe" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone">No orders found</p>
          </div>
        ) : (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30">
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Order</th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Customer</th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Items</th>
                    <th className="text-right px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Total</th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Payment</th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {displayed.map(order => {
                    const deliveryStatus = order.products[0]?.delivery_status || 'pending';
                    return (
                      <tr key={order.order_id} className="hover:bg-parchment/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-charcoal-deep font-mono">
                            {order.order_id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-taupe">{formatDate(order.order_date)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center text-xs text-stone flex-shrink-0">
                              {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="text-sm text-charcoal-deep">{order.customer_name || '—'}</p>
                              {order.customer_type && (
                                <span className="text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 bg-gold-soft/20 text-gold-deep">
                                  {order.customer_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-charcoal-deep">
                            {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-taupe truncate max-w-[200px]">
                            {order.products.map(p => p.product_name).join(', ')}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-charcoal-deep">
                            {order.payment_currency} {order.payment_amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-taupe">{order.payment_method}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getPaymentStatusBadge(order.payment_status)}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(deliveryStatus)}`}>
                              <StatusIcon status={deliveryStatus} />
                              {deliveryStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/brand/orders/${order.order_id}`}
                            className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal-deep transition-colors"
                          >
                            View <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(
              <div className="px-6 py-4 border-t border-sand/30 flex items-center justify-between">
                <p className="text-xs text-taupe">
                  Page {page} of {totalPages} · {totalOrders} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : page - 3 + i);
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 text-xs transition-colors ${
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export success toast */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-success/10 border border-success/30 text-success shadow-lg">
          <span>{exportToast}</span>
          <button onClick={() => setExportToast(null)} className="text-success/60 hover:text-success transition-colors text-lg leading-none">×</button>
        </div>
      )}
    </div>
  );
}
