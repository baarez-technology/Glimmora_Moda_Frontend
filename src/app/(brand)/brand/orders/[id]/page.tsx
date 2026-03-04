'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  User,
  CreditCard,
  Calendar,
  ChevronDown,
  FileText,
  Printer,
  X
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { OrderStatus } from '@/types/brand-portal';
import InvoiceDocument, { generateInvoiceNumber, printInvoice } from '@/components/shared/InvoiceDocument';

export default function OrderDetailPage() {
  const params = useParams();
  const { getOrderById, getProductById, updateOrderStatus, partner, commerceSettings } = useBrand();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const orderId = params.id as string;
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Order not found</p>
        <Link
          href="/brand/orders"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const StatusIcon = getStatusIcon(order.status);

  const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setIsUpdating(true);
    updateOrderStatus(order.id, newStatus);
    setShowStatusDropdown(false);
    setTimeout(() => setIsUpdating(false), 500);
  };

  return (
    <div>
      <BrandPageHeader
        title={`Order #${order.orderNumber}`}
        breadcrumbs={[
          { label: 'Orders', href: '/brand/orders' },
          { label: `#${order.orderNumber}` }
        ]}
        actions={
          <SecondaryButton href="/brand/orders" icon={ArrowLeft}>
            Back to Orders
          </SecondaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 flex items-center justify-between ${getStatusBadge(order.status)}`}>
          <div className="flex items-center gap-3">
            <StatusIcon size={20} />
            <div>
              <p className="text-sm font-medium capitalize">{order.status}</p>
              <p className="text-xs opacity-80">Last updated: {formatDate(order.updatedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInvoice(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-sand/50 text-stone text-xs tracking-wide hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
            >
              <FileText size={14} />
              Invoice
            </button>
            <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getPaymentStatusBadge(order.paymentStatus)}`}>
              Payment: {order.paymentStatus}
            </span>
            {/* Status Update Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
              >
                Update Status <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-10">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-parchment transition-colors ${
                        order.status === status ? 'bg-parchment text-charcoal-deep font-medium' : 'text-stone'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Order Items</h2>
              </div>
              <div className="divide-y divide-sand/30">
                {order.items.map((item, index) => {
                  const product = getProductById(item.productId);
                  return (
                    <div key={index} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-parchment flex items-center justify-center">
                        {product?.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={24} className="text-taupe" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/brand/products/${item.productId}`}
                          className="text-sm font-medium text-charcoal-deep hover:text-gold-muted transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-taupe">SKU: {item.sku}</p>
                        {item.variant && (
                          <p className="text-xs text-stone">{item.variant}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-charcoal-deep">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-charcoal-deep">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-sand/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="text-charcoal-deep">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Shipping</span>
                  <span className="text-charcoal-deep">
                    {order.shipping === 0 ? 'Complimentary' : formatCurrency(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Tax</span>
                  <span className="text-charcoal-deep">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2 border-t border-sand/30">
                  <span className="text-charcoal-deep">Total</span>
                  <span className="text-charcoal-deep">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <Truck size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Shipping Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-taupe mt-0.5" />
                  <div>
                    <p className="text-sm text-charcoal-deep">{order.shippingInfo.address}</p>
                    <p className="text-sm text-charcoal-deep">
                      {order.shippingInfo.city}, {order.shippingInfo.postalCode}
                    </p>
                    <p className="text-sm text-charcoal-deep">{order.shippingInfo.country}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-sand/30 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-taupe uppercase tracking-wider mb-1">Method</p>
                    <p className="text-sm text-charcoal-deep">{order.shippingInfo.method}</p>
                  </div>
                  {order.shippingInfo.trackingNumber && (
                    <div>
                      <p className="text-xs text-taupe uppercase tracking-wider mb-1">Tracking</p>
                      <p className="text-sm text-charcoal-deep font-mono">{order.shippingInfo.trackingNumber}</p>
                    </div>
                  )}
                  {order.shippingInfo.estimatedDelivery && (
                    <div>
                      <p className="text-xs text-taupe uppercase tracking-wider mb-1">Est. Delivery</p>
                      <p className="text-sm text-charcoal-deep">
                        {new Date(order.shippingInfo.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Notes</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-stone">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <User size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Customer</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center text-lg text-stone">
                    {order.customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep">{order.customer.name}</p>
                    {order.customer.tier && (
                      <span className={`text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 ${getTierBadge(order.customer.tier)}`}>
                        {order.customer.tier}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-sand/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-taupe" />
                    <a href={`mailto:${order.customer.email}`} className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors">
                      {order.customer.email}
                    </a>
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-taupe" />
                      <a href={`tel:${order.customer.phone}`} className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors">
                        {order.customer.phone}
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Order ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{order.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Boutique</span>
                  <span className="text-sm text-charcoal-deep">{order.boutique}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Region</span>
                  <span className="text-sm text-charcoal-deep">{order.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowInvoice(false)}>
          <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Invoice</h3>
              <button onClick={() => setShowInvoice(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>
            {(() => {
              const activeTaxRule = commerceSettings.taxRules.find(r => r.isEnabled);
              const taxRate = activeTaxRule ? activeTaxRule.taxRate / 100 : 0.20;
              const taxAmount = Math.round(order.total * taxRate / (1 + taxRate));
              const activeShipping = commerceSettings.shippingMethods
                .filter(m => m.isEnabled)
                .sort((a, b) => a.baseRate - b.baseRate)[0];
              const shippingAmount = order.total >= commerceSettings.freeShippingThreshold
                ? 0
                : (activeShipping?.baseRate || 0);
              return (
                <InvoiceDocument
                  invoiceNumber={generateInvoiceNumber(order.id, order.createdAt)}
                  invoiceDate={order.createdAt}
                  orderType="standard"
                  brandName={partner?.brandName || 'ModaGlimmora'}
                  buyerName={order.customer.name}
                  buyerEmail={order.customer.email}
                  buyerAddress={`${order.shippingInfo.address}\n${order.shippingInfo.city}, ${order.shippingInfo.postalCode}\n${order.shippingInfo.country}`}
                  items={order.items.map(item => ({
                    description: item.productName,
                    detail: item.variant || '',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    currency: 'EUR',
                  }))}
                  subtotal={order.subtotal}
                  shippingAmount={shippingAmount}
                  taxRate={taxRate}
                  taxAmount={taxAmount}
                  total={order.total}
                  currency="EUR"
                  paymentStatus={order.paymentStatus === 'paid' ? 'paid' : 'pending'}
                />
              );
            })()}
            <div className="flex gap-3 mt-6">
              <button
                onClick={printInvoice}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
              >
                <Printer size={16} />
                Print Invoice
              </button>
              <button
                onClick={printInvoice}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
              >
                <FileText size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
