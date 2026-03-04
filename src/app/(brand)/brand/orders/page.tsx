'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Search, Package, Clock, Truck, CheckCircle, XCircle, AlertCircle, ArrowUpDown } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import type { OrderStatus } from '@/types/brand-portal';
import ExportButton from '@/components/brand/ExportButton';
import { convertToCSV, downloadCSV, buildFilename } from '@/lib/export-utils';

const ORDERS_PER_PAGE = 20;

export default function OrdersPage() {
  const { orders } = useBrand();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDateAsc, setSortDateAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const matchesSearch = searchQuery === '' ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDateAsc ? dateA - dateB : dateB - dateA;
    });
  }, [orders, filter, searchQuery, sortDateAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Reset to page 1 when filter/search changes
  const handleFilterChange = (value: 'all' | OrderStatus) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return AlertCircle;
      case 'confirmed': return Clock;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'confirmed':
        return 'bg-info/10 text-info';
      case 'processing':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'shipped':
        return 'bg-info/10 text-info';
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'refunded':
        return 'bg-info/10 text-info';
      case 'failed':
        return 'bg-error/10 text-error';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'uhni':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'preferred':
        return 'bg-champagne/30 text-gold-muted';
      default:
        return 'bg-parchment text-stone';
    }
  };

  const exportOrdersCSV = () => {
    const rows = filteredAndSortedOrders.map(order => ({
      'Order #': order.orderNumber,
      Customer: order.customer.name,
      Email: order.customer.email,
      Items: order.items.length,
      Boutique: order.boutique,
      Region: order.region,
      Total: order.total,
      Currency: order.currency,
      Payment: order.paymentStatus,
      Status: order.status,
      'Shipping Address': order.shippingInfo.address,
      'Created At': order.createdAt,
    }));
    const csv = convertToCSV(rows);
    downloadCSV(buildFilename('orders', filter === 'all' ? 'all' : filter), csv);
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <div>
      <BrandPageHeader
        title="Orders"
        subtitle={`${filteredAndSortedOrders.length} order${filteredAndSortedOrders.length !== 1 ? 's' : ''}`}
        actions={
          <ExportButton options={[
            { label: 'Export Orders (CSV)', onClick: exportOrdersCSV },
          ]} />
        }
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
          {[
            { value: 'all' as const, label: 'All' },
            { value: 'pending' as const, label: 'Pending' },
            { value: 'confirmed' as const, label: 'Confirmed' },
            { value: 'processing' as const, label: 'Processing' },
            { value: 'shipped' as const, label: 'Shipped' },
            { value: 'delivered' as const, label: 'Delivered' },
            { value: 'cancelled' as const, label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
                filter === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                {statusCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Orders List */}
        {filteredAndSortedOrders.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone">No orders found</p>
          </div>
        ) : (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30">
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      <button
                        onClick={() => setSortDateAsc(prev => !prev)}
                        className="inline-flex items-center gap-1.5 hover:text-charcoal-deep transition-colors"
                      >
                        Order
                        <ArrowUpDown size={12} className={sortDateAsc ? 'text-charcoal-deep' : 'text-taupe'} />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Customer
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Items
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Boutique
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Total
                    </th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Payment
                    </th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Status
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {paginatedOrders.map(order => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-parchment/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">#{order.orderNumber}</p>
                            <p className="text-xs text-taupe">{formatDate(order.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center text-xs text-stone">
                              {order.customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm text-charcoal-deep">{order.customer.name}</p>
                              {order.customer.tier && (
                                <span className={`text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 ${getTierBadge(order.customer.tier)}`}>
                                  {order.customer.tier}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-charcoal-deep">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-taupe truncate max-w-[200px]">
                            {order.items.map(i => i.productName).join(', ')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-charcoal-deep">{order.boutique}</p>
                          <p className="text-xs text-taupe">{order.region}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-charcoal-deep">
                            {formatCurrency(order.total)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getPaymentStatusBadge(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(order.status)}`}>
                              <StatusIcon size={12} />
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/brand/orders/${order.id}`}
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
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-sand/30 flex items-center justify-between">
                <p className="text-xs text-taupe">
                  Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(currentPage * ORDERS_PER_PAGE, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs transition-colors ${
                        currentPage === page
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : 'text-stone hover:text-charcoal-deep border border-sand hover:border-charcoal-deep'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
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
    </div>
  );
}
