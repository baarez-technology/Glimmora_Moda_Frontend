/**
 * InvoiceDocument — shared printable invoice component
 *
 * NOTE: Add the following to globals.css for print support:
 *
 * @media print {
 *   body > *:not(.invoice-print-area) { display: none !important; }
 *   .invoice-print-area { display: block !important; position: static !important; }
 *   @page { margin: 20mm; }
 * }
 */

export interface InvoiceProps {
  invoiceNumber: string;
  invoiceDate: string;
  orderType: 'standard' | 'bespoke';

  // Seller
  brandName: string;
  brandAddress?: string;
  brandVAT?: string;

  // Buyer
  buyerName: string;
  buyerEmail: string;
  buyerAddress?: string;

  // Line items
  items: {
    description: string;
    detail?: string;
    quantity: number;
    unitPrice: number;
    currency: string;
  }[];

  // Financials
  subtotal: number;
  shippingAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;

  // Bespoke only
  depositPaid?: number;
  balanceDue?: number;

  paymentStatus: 'paid' | 'deposit_paid' | 'pending';
  notes?: string;
}

export function generateInvoiceNumber(orderId: string, date: string): string {
  const year = new Date(date).getFullYear();
  const sequence = orderId.replace(/[^0-9]/g, '').padStart(5, '0').slice(-5);
  return `INV-MG-${year}-${sequence}`;
}

export function printInvoice() {
  window.print();
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function InvoiceDocument(props: InvoiceProps) {
  const {
    invoiceNumber,
    invoiceDate,
    orderType,
    brandName,
    brandAddress,
    brandVAT,
    buyerName,
    buyerEmail,
    buyerAddress,
    items,
    subtotal,
    shippingAmount,
    taxRate,
    taxAmount,
    total,
    currency,
    depositPaid,
    balanceDue,
    paymentStatus,
    notes,
  } = props;

  const statusConfig = {
    paid: { label: 'PAID', className: 'bg-green-100 text-green-800 border border-green-300' },
    deposit_paid: { label: 'DEPOSIT PAID', className: 'bg-amber-50 text-amber-800 border border-amber-300' },
    pending: { label: 'PENDING', className: 'bg-gray-100 text-gray-600 border border-gray-300' },
  };

  const badge = statusConfig[paymentStatus];

  return (
    <div className="invoice-print-area bg-white text-charcoal-deep font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-display text-2xl text-charcoal-deep tracking-[-0.02em]">MODAGLIMMORA</p>
          <p className="text-xs text-stone mt-1 tracking-[0.15em] uppercase">
            {orderType === 'bespoke' ? 'Bespoke Commission Invoice' : 'Order Invoice'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-charcoal-deep">{invoiceNumber}</p>
          <p className="text-xs text-stone mt-1">{formatDate(invoiceDate)}</p>
          <span className={`inline-block mt-2 px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gold-soft/30 mb-8" />

      {/* Seller / Buyer columns */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-3">From</p>
          <p className="font-medium text-charcoal-deep">{brandName}</p>
          {brandAddress && (
            <p className="text-sm text-taupe mt-1 leading-relaxed whitespace-pre-line">{brandAddress}</p>
          )}
          {brandVAT && (
            <p className="text-xs text-stone mt-2">VAT: {brandVAT}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-3">Bill To</p>
          <p className="font-medium text-charcoal-deep">{buyerName}</p>
          {buyerEmail && (
            <p className="text-sm text-taupe mt-1">{buyerEmail}</p>
          )}
          {buyerAddress && (
            <p className="text-sm text-taupe mt-1 leading-relaxed whitespace-pre-line">{buyerAddress}</p>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sand">
              <th className="text-left pb-3 text-[10px] tracking-[0.3em] uppercase text-stone font-normal">Description</th>
              <th className="text-center pb-3 text-[10px] tracking-[0.3em] uppercase text-stone font-normal w-16">Qty</th>
              <th className="text-right pb-3 text-[10px] tracking-[0.3em] uppercase text-stone font-normal w-32">Unit Price</th>
              <th className="text-right pb-3 text-[10px] tracking-[0.3em] uppercase text-stone font-normal w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-sand/40">
                <td className="py-4 pr-4">
                  <p className="font-medium text-charcoal-deep text-sm">{item.description}</p>
                  {item.detail && (
                    <p className="text-xs text-stone mt-0.5">{item.detail}</p>
                  )}
                </td>
                <td className="py-4 text-center text-sm text-charcoal-deep">{item.quantity}</td>
                <td className="py-4 text-right text-sm text-charcoal-deep">
                  {formatCurrency(item.unitPrice, item.currency)}
                </td>
                <td className="py-4 text-right text-sm font-medium text-charcoal-deep">
                  {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial summary — right aligned */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone">Subtotal</span>
            <span className="text-charcoal-deep">{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone">Shipping</span>
            <span className="text-charcoal-deep">
              {shippingAmount === 0 ? 'Complimentary' : formatCurrency(shippingAmount, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone">VAT {Math.round(taxRate * 100)}%</span>
            <span className="text-charcoal-deep">{formatCurrency(taxAmount, currency)}</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gold-soft/30 my-2" />

          <div className="flex justify-between items-end">
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone">Total</span>
            <span className="font-display text-2xl text-charcoal-deep">{formatCurrency(total, currency)}</span>
          </div>

          {/* Bespoke deposit breakdown */}
          {orderType === 'bespoke' && depositPaid !== undefined && balanceDue !== undefined && (
            <>
              <div className="h-px bg-sand/50 my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-stone">Deposit Paid</span>
                <span className="text-green-700 font-medium">− {formatCurrency(depositPaid, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-charcoal-deep">Balance Due</span>
                <span className="text-charcoal-deep">{formatCurrency(balanceDue, currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="bg-parchment border border-sand/50 p-4 mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-2">Notes</p>
          <p className="text-sm text-taupe leading-relaxed">{notes}</p>
        </div>
      )}

      {/* Gold divider */}
      <div className="h-px bg-gold-soft/30 mb-6" />

      {/* Footer */}
      <p className="text-xs text-stone text-center leading-relaxed">
        Thank you for your order. For support, contact your personal concierge or visit modaglimmora.com
      </p>
    </div>
  );
}
