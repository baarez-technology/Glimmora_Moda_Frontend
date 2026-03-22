'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, Truck, CheckCircle, XCircle,
  AlertCircle, Clock, MapPin, Mail, Phone, User,
  ChevronDown, Loader2
} from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import {
  fetchBrandOrderDetail, updateBrandOrderStatus,
  type ApiBrandOrderDetail
} from '@/services/brand-order.service';
import { formatPrice } from '@/lib/currency';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type DeliveryStatus = typeof VALID_STATUSES[number];

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

function StatusIcon({ status, size = 18 }: { status: string; size?: number }) {
  switch (status) {
    case 'pending':    return <AlertCircle size={size} />;
    case 'processing': return <Package size={size} />;
    case 'shipped':    return <Truck size={size} />;
    case 'delivered':  return <CheckCircle size={size} />;
    case 'cancelled':  return <XCircle size={size} />;
    default:           return <Clock size={size} />;
  }
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<ApiBrandOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBrandOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrder(); }, [orderId]);

  const handleStatusUpdate = async (newStatus: DeliveryStatus) => {
    if (!order) return;
    setShowStatusDropdown(false);
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateBrandOrderStatus(orderId, newStatus);
      setOrder(prev => prev ? { ...prev, order_status: newStatus, delivery_status: newStatus } : prev);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Order Detail"
          breadcrumbs={[{ label: 'Orders', href: '/brand/orders' }, { label: 'Loading…' }]}
          actions={<SecondaryButton href="/brand/orders" icon={ArrowLeft}>Back to Orders</SecondaryButton>}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <BrandPageHeader
          title="Order Detail"
          breadcrumbs={[{ label: 'Orders', href: '/brand/orders' }, { label: 'Error' }]}
          actions={<SecondaryButton href="/brand/orders" icon={ArrowLeft}>Back to Orders</SecondaryButton>}
        />
        <div className="p-8 text-center">
          <p className="text-error mb-4">{error || 'Order not found'}</p>
          <button
            onClick={loadOrder}
            className="px-6 py-3 bg-charcoal-deep text-white text-sm tracking-wider uppercase hover:bg-noir transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = order.order_status || order.delivery_status || 'pending';
  const shortId = order.order_id.slice(-8).toUpperCase();

  return (
    <div>
      <BrandPageHeader
        title={`Order #${shortId}`}
        breadcrumbs={[
          { label: 'Orders', href: '/brand/orders' },
          { label: `#${shortId}` }
        ]}
        actions={
          <SecondaryButton href="/brand/orders" icon={ArrowLeft}>
            Back to Orders
          </SecondaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 flex items-center justify-between ${getStatusBadge(currentStatus)}`}>
          <div className="flex items-center gap-3">
            <StatusIcon status={currentStatus} />
            <div>
              <p className="text-sm font-medium capitalize">{currentStatus}</p>
              <p className="text-xs opacity-80">
                {order.order_last_updated_at
                  ? `Last updated: ${formatDate(order.order_last_updated_at)}`
                  : `Ordered: ${formatDate(order.order_date)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getPaymentStatusBadge(order.payment_status)}`}>
              Payment: {order.payment_status}
            </span>
            {/* Status Update Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : null}
                Update Status <ChevronDown size={13} />
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-10">
                  {VALID_STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-parchment transition-colors ${
                        currentStatus === status ? 'bg-parchment text-charcoal-deep font-medium' : 'text-stone'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Update error */}
        {updateError && (
          <div className="p-3 bg-error/10 text-error text-sm">{updateError}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Order Items</h2>
              </div>
              <div className="divide-y divide-sand/30">
                {order.products.map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-parchment flex items-center justify-center flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={24} className="text-taupe" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-deep">{item.product_name}</p>
                      {item.sku && <p className="text-xs text-taupe">SKU: {item.sku}</p>}
                      {(item.color || item.size) && (
                        <p className="text-xs text-stone">
                          {[item.color, item.size].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {item.delivery_tracking_number && (
                        <p className="text-xs text-taupe font-mono mt-1">
                          Tracking: {item.delivery_tracking_number}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-taupe">
                        {formatPrice(item.product_price ?? 0, order.payment_currency)} × {item.quantity ?? 1}
                      </p>
                      <p className="text-sm font-medium text-charcoal-deep">
                        {formatPrice((item.product_price ?? 0) * (item.quantity ?? 1), order.payment_currency)}
                      </p>
                      <span className={`text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 ${getStatusBadge(item.delivery_status)}`}>
                        {item.delivery_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {(() => {
                const subtotal = order.products.reduce(
                  (sum, p) => sum + (p.product_price ?? 0) * (p.quantity ?? 1), 0
                );
                const shipping = order.payment_shipping ?? 0;
                const tax = order.payment_tax ?? 0;
                const total = (order.payment_amount && order.payment_amount > 0)
                  ? order.payment_amount
                  : subtotal + shipping + tax;
                const cur = order.payment_currency || '';
                return (
                  <div className="px-6 py-4 border-t border-sand/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Subtotal</span>
                      <span className="text-charcoal-deep">{formatPrice(subtotal, cur)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Shipping</span>
                      <span className="text-charcoal-deep">
                        {shipping === 0 ? 'Complimentary' : formatPrice(shipping, cur)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Tax</span>
                      <span className="text-charcoal-deep">{formatPrice(tax, cur)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium pt-2 border-t border-sand/30">
                      <span className="text-charcoal-deep">Total</span>
                      <span className="text-charcoal-deep">{formatPrice(total, cur)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Shipping Information */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <Truck size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Shipping Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-taupe mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-charcoal-deep">{order.delivery_address}</p>
                    {(order.delivery_city || order.delivery_postal_code) && (
                      <p className="text-sm text-charcoal-deep">
                        {[order.delivery_city, order.delivery_postal_code].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {order.delivery_country && (
                      <p className="text-sm text-charcoal-deep">{order.delivery_country}</p>
                    )}
                    {order.delivery_tag && (
                      <p className="text-xs text-taupe mt-1">{order.delivery_tag}</p>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-sand/30 grid grid-cols-2 gap-4">
                  {order.delivery_method && (
                    <div>
                      <p className="text-xs text-taupe uppercase tracking-wider mb-1">Method</p>
                      <p className="text-sm text-charcoal-deep capitalize">{order.delivery_method}</p>
                    </div>
                  )}
                  {order.delivery_date && (
                    <div>
                      <p className="text-xs text-taupe uppercase tracking-wider mb-1">Delivery Date</p>
                      <p className="text-sm text-charcoal-deep">{order.delivery_date}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <User size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Customer</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center text-lg text-stone flex-shrink-0 overflow-hidden">
                    {order.customer_profile_picture ? (
                      <img src={order.customer_profile_picture} alt={order.customer_name} className="w-full h-full object-cover" />
                    ) : (
                      order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep">{order.customer_name || '—'}</p>
                    {order.customer_type && (
                      <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 bg-gold-soft/20 text-gold-deep">
                        {order.customer_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-sand/30 space-y-3">
                  {order.customer_email && (
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-taupe flex-shrink-0" />
                      <a href={`mailto:${order.customer_email}`} className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors truncate">
                        {order.customer_email}
                      </a>
                    </div>
                  )}
                  {order.customer_phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-taupe flex-shrink-0" />
                      <a href={`tel:${order.customer_phone}`} className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors">
                        {order.customer_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Order Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-taupe uppercase tracking-wider flex-shrink-0">Order ID</span>
                  <span className="text-xs text-charcoal-deep font-mono text-right break-all">{order.order_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Date</span>
                  <span className="text-sm text-charcoal-deep">{new Date(order.order_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Payment</span>
                  <span className="text-sm text-charcoal-deep capitalize">{order.payment_method}</span>
                </div>
                {order.payment_transaction_id && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-taupe uppercase tracking-wider flex-shrink-0">Transaction</span>
                    <span className="text-xs text-charcoal-deep font-mono text-right break-all">{order.payment_transaction_id}</span>
                  </div>
                )}
                {order.payment_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">Paid On</span>
                    <span className="text-sm text-charcoal-deep">{new Date(order.payment_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
