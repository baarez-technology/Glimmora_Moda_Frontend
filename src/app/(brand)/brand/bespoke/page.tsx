'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Scissors, Clock, CheckCircle, Palette, Ruler, Loader2, RefreshCw } from 'lucide-react';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import { fetchBrandBespokeOrders } from '@/services/bespoke.service';
import type { BespokeOrder } from '@/types/uhni';
import type { BespokeOrderStatus, BespokeOrderType } from '@/types/uhni';

type FilterTab = 'all' | BespokeOrderStatus;

export default function BespokeOrdersPage() {
  const [bespokeOrders, setBespokeOrders] = useState<BespokeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orders = await fetchBrandBespokeOrders();
      setBespokeOrders(orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bespoke orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filteredOrders = bespokeOrders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusBadge = (status: BespokeOrderStatus) => {
    switch (status) {
      case 'consultation': return 'bg-info/10 text-info';
      case 'design_approval': return 'bg-warning/10 text-warning';
      case 'production': return 'bg-gold-soft/20 text-gold-deep';
      case 'fitting': return 'bg-champagne/30 text-gold-muted';
      case 'final_adjustments': return 'bg-info/10 text-info';
      case 'complete': return 'bg-success/10 text-success';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: BespokeOrderStatus) =>
    status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const getTypeIcon = (type: BespokeOrderType) => {
    switch (type) {
      case 'made_to_measure': return Ruler;
      case 'custom_design': return Palette;
      case 'modification': return Scissors;
      default: return Scissors;
    }
  };

  const getTypeLabel = (type: BespokeOrderType) =>
    type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const statusCounts = {
    all: bespokeOrders.length,
    consultation: bespokeOrders.filter(o => o.status === 'consultation').length,
    design_approval: bespokeOrders.filter(o => o.status === 'design_approval').length,
    production: bespokeOrders.filter(o => o.status === 'production').length,
    fitting: bespokeOrders.filter(o => o.status === 'fitting').length,
    final_adjustments: bespokeOrders.filter(o => o.status === 'final_adjustments').length,
    complete: bespokeOrders.filter(o => o.status === 'complete').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'design_approval', label: 'Design' },
    { value: 'production', label: 'Production' },
    { value: 'fitting', label: 'Fitting' },
    { value: 'final_adjustments', label: 'Adjustments' },
    { value: 'complete', label: 'Complete' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Bespoke Orders"
        subtitle={`${bespokeOrders.length} custom commission${bespokeOrders.length !== 1 ? 's' : ''}`}
      >
        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.1em] uppercase border border-sand text-stone hover:border-charcoal-deep transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </BrandPageHeader>

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
            placeholder="Search by title or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Loader2 size={32} className="mx-auto text-stone animate-spin mb-3" />
            <p className="text-stone text-sm">Loading bespoke orders...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-error/5 border border-error/20 p-6 flex items-center justify-between">
            <p className="text-sm text-error">{error}</p>
            <button onClick={loadOrders} className="px-4 py-2 text-xs tracking-[0.1em] uppercase border border-error/30 text-error hover:bg-error/10 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-sand/50 p-12 text-center">
                <Scissors size={48} className="mx-auto text-taupe/40 mb-4" />
                <p className="text-stone">No bespoke orders found</p>
                <p className="text-xs text-taupe mt-1">Orders created by UHNI clients will appear here</p>
              </div>
            ) : (
              <div className="bg-white border border-sand/50">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sand/30">
                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Order</th>
                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Type</th>
                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Title</th>
                        <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Status</th>
                        <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Est. Completion</th>
                        <th className="text-right px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Price</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/30">
                      {filteredOrders.map(order => {
                        const TypeIcon = getTypeIcon(order.type);
                        return (
                          <tr key={order.id} className="hover:bg-parchment/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-charcoal-deep font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-taupe">{formatDate(order.createdAt)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-parchment rounded flex items-center justify-center">
                                  <TypeIcon size={16} className="text-stone" />
                                </div>
                                <span className="text-sm text-charcoal-deep">{getTypeLabel(order.type)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-charcoal-deep">{order.title}</p>
                              <p className="text-xs text-taupe truncate max-w-[200px]">{order.description}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(order.status)}`}>
                                  {order.status === 'complete' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-charcoal-deep">{formatDate(order.estimatedCompletion)}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {order.price > 0 ? (
                                <>
                                  <p className="text-sm font-medium text-charcoal-deep">{formatCurrency(order.price)}</p>
                                  <p className="text-xs text-taupe">{order.depositPercentage}% deposit</p>
                                </>
                              ) : (
                                <p className="text-xs text-taupe italic">Price pending</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/brand/bespoke/${order.id}`}
                                className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal-deep transition-colors"
                              >
                                Manage <ChevronRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
