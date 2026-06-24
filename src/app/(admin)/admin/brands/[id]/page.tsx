'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  ArrowLeft,
  Building2,
  Mail,
  Calendar,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Ban,
  ShieldCheck,
  AlertTriangle,
  Layers,
  BarChart3,
  FileWarning,
} from 'lucide-react';
import { fetchManagedBrands, updateBrandStatus } from '@/services/admin.service';
import type { ManagedBrandItem } from '@/services/admin.service';
import { getBrandWarningLevel, getReportsByBrand } from '@/services/reports.service';
import type { ProductReport } from '@/services/reports.service';
import { formatPrice } from '@/lib/currency';
import type { BrandStatus } from '@/types/admin';

type ManagedBrand = ManagedBrandItem;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BrandStatus, { bg: string; text: string; label: string }> = {
  active:    { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Active' },
  verified:  { bg: 'bg-sky-100',     text: 'text-sky-800',     label: 'Verified' },
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-800',   label: 'Pending' },
  suspended: { bg: 'bg-red-100',     text: 'text-red-800',     label: 'Suspended' },
  rejected:  { bg: 'bg-rose-100',    text: 'text-rose-800',    label: 'Rejected' },
};

const WARNING_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  none:   { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'No Issues' },
  low:    { bg: 'bg-yellow-100',  text: 'text-yellow-800',  label: 'Low Risk' },
  medium: { bg: 'bg-orange-100',  text: 'text-orange-800',  label: 'Medium Risk' },
  high:   { bg: 'bg-red-100',     text: 'text-red-800',     label: 'High Risk' },
};

const REPORT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending:          { bg: 'bg-amber-100',   text: 'text-amber-800' },
  investigating:    { bg: 'bg-blue-100',    text: 'text-blue-800' },
  warning_sent:     { bg: 'bg-orange-100',  text: 'text-orange-800' },
  product_removed:  { bg: 'bg-red-100',     text: 'text-red-800' },
  brand_suspended:  { bg: 'bg-red-100',     text: 'text-red-800' },
  dismissed:        { bg: 'bg-gray-100',    text: 'text-gray-600' },
};

function scoreColor(score: number): string {
  if (score > 80) return 'bg-emerald-500';
  if (score > 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatReportStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<ManagedBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [warning, setWarning] = useState<{ total: number; level: string }>({ total: 0, level: 'none' });
  const [reports, setReports] = useState<ProductReport[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchManagedBrands();
      if (cancelled) return;

      const found = res?.brands?.find((b) => b.id === brandId);
      if (found) {
        setBrand(found);
        setWarning(getBrandWarningLevel(found.id));
        setReports(getReportsByBrand(found.id));
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [brandId]);

  // Actions
  async function handleStatusChange(status: BrandStatus) {
    if (!brand) return;
    const ok = await updateBrandStatus(brand.id, status);
    if (ok) {
      setBrand((prev) => (prev ? { ...prev, status } : null));
    }
  }

  // ─── Loading / Not Found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment/30">
        <AdminPageHeader
          title="Brand Details"
          breadcrumbs={[{ label: 'Brands', href: '/admin/brands' }, { label: 'Loading...' }]}
        />
        <div className="text-center py-20 text-stone/50 text-sm">Loading brand details...</div>
      </div>
    );
  }

  if (notFound || !brand) {
    return (
      <div className="min-h-screen bg-parchment/30">
        <AdminPageHeader
          title="Brand Not Found"
          breadcrumbs={[{ label: 'Brands', href: '/admin/brands' }, { label: 'Not Found' }]}
        />
        <div className="max-w-[1000px] mx-auto px-8 py-12 text-center">
          <p className="text-stone/50 mb-4">The brand you are looking for does not exist.</p>
          <Link href="/admin/brands" className="text-sm font-medium text-charcoal-deep hover:underline">
            Back to Brand Partners
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLES[brand.status as BrandStatus] ?? STATUS_STYLES.pending;
  const warningStyle = WARNING_STYLES[warning.level] || WARNING_STYLES.none;
  const joinedDate = new Date(brand.partnerSince).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-parchment/30">
      <AdminPageHeader
        title={brand.brandName}
        subtitle={brand.category}
        breadcrumbs={[
          { label: 'Brands', href: '/admin/brands' },
          { label: brand.brandName },
        ]}
        actions={
          <Link
            href="/admin/brands"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ivory-cream/70 hover:text-ivory-cream rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Brands
          </Link>
        }
      />

      <div className="max-w-[1000px] mx-auto px-8 py-8 space-y-8">

        {/* ══════ A. Brand Overview Card ══════════════════════════════════════ */}
        <section className="bg-white border border-sand/50 rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-charcoal-deep/10 flex items-center justify-center text-2xl font-display text-charcoal-deep/70 shrink-0 overflow-hidden">
                {brand.brandLogo ? (
                  <img src={brand.brandLogo} alt={brand.brandName} className="w-full h-full object-cover" />
                ) : (
                  brand.brandName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-charcoal-deep">{brand.brandName}</h2>
                  <span className="text-sm text-stone/50">{brand.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${warningStyle.bg} ${warningStyle.text}`}>
                    <AlertTriangle size={10} />
                    {warning.total} complaint{warning.total !== 1 ? 's' : ''} &middot; {warningStyle.label}
                  </span>
                </div>

                {/* Contact info */}
                <div className="flex items-center gap-6 mt-4 text-sm text-stone/60 flex-wrap">
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-stone/40" />
                    {brand.contactEmail}
                  </span>
                  {brand.contactName && (
                    <span className="flex items-center gap-2">
                      <Building2 size={14} className="text-stone/40" />
                      {brand.contactName}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-stone/40" />
                    Joined {joinedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 py-4 bg-parchment/30 border-t border-sand/30 flex items-center gap-3 flex-wrap">
            {brand.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('active')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle size={14} />
                  Approve Brand
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <XCircle size={14} />
                  Reject Brand
                </button>
              </>
            )}
            {(brand.status === 'active' || brand.status === 'verified') && (
              <button
                onClick={() => handleStatusChange('suspended')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
              >
                <Ban size={14} />
                Suspend Brand
              </button>
            )}
            {brand.status === 'suspended' && (
              <button
                onClick={() => handleStatusChange('active')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <ShieldCheck size={14} />
                Activate Brand
              </button>
            )}
            {brand.status === 'rejected' && (
              <button
                onClick={() => handleStatusChange('active')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle size={14} />
                Approve Brand
              </button>
            )}
          </div>
        </section>

        {/* ══════ B. Products ═══════════════════════════════════════════════ */}
        <section className="bg-white border border-sand/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-parchment/60 flex items-center justify-center">
              <Package size={18} className="text-charcoal-deep/60" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-deep">Products</h3>
              <p className="text-xs text-stone/50">Product catalog managed by the brand</p>
            </div>
          </div>

          <div className="bg-parchment/30 rounded-lg p-5 flex items-center gap-6">
            <div>
              <p className="text-3xl font-semibold text-charcoal-deep">{brand.totalProducts}</p>
              <p className="text-xs text-stone/50 mt-1">Total Products</p>
            </div>
            <div className="h-10 w-px bg-sand/50" />
            <p className="text-sm text-stone/60">
              Products are managed directly by the brand through their Brand Portal.
              Admin can review products in the Content Moderation section.
            </p>
          </div>
        </section>

        {/* ══════ C. Collections ═══════════════════════════════════════════ */}
        <section className="bg-white border border-sand/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-parchment/60 flex items-center justify-center">
              <Layers size={18} className="text-charcoal-deep/60" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-deep">Collections</h3>
              <p className="text-xs text-stone/50">Brand curated collections</p>
            </div>
          </div>

          <div className="bg-parchment/30 rounded-lg p-5">
            <p className="text-sm text-stone/60">
              Collections are managed by the brand and go through content moderation before being published.
              Review pending collections in the{' '}
              <Link href="/admin/moderation" className="text-charcoal-deep font-medium hover:underline">
                Moderation Queue
              </Link>.
            </p>
          </div>
        </section>

        {/* ══════ D. Complaint History ════════════════════════════════════ */}
        <section className="bg-white border border-sand/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-parchment/60 flex items-center justify-center">
              <FileWarning size={18} className="text-charcoal-deep/60" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-deep">Complaint History</h3>
              <p className="text-xs text-stone/50">Customer reports filed against this brand</p>
            </div>
          </div>

          {/* Warning level summary */}
          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 ${warningStyle.bg} ${warningStyle.text}`}>
              <AlertTriangle size={12} />
              {warningStyle.label}
            </span>
            <span className="text-sm text-stone/60">
              {warning.total} total complaint{warning.total !== 1 ? 's' : ''}
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="bg-parchment/30 rounded-lg p-5 text-center text-sm text-stone/50">
              No complaints have been filed against this brand.
            </div>
          ) : (
            <div className="border border-sand/30 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-parchment/40 text-xs text-stone/60 uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-left px-4 py-3 font-medium">Reason</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {reports.map((report) => {
                    const rStatus = REPORT_STATUS_STYLES[report.status] || REPORT_STATUS_STYLES.pending;
                    return (
                      <tr key={report.id} className="hover:bg-parchment/20 transition-colors">
                        <td className="px-4 py-3 text-charcoal-deep font-medium">{report.product_name}</td>
                        <td className="px-4 py-3 text-stone/60 capitalize">{report.reason.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${rStatus.bg} ${rStatus.text}`}>
                            {formatReportStatus(report.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone/50">
                          {new Date(report.reported_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ══════ E. Brand Activity ══════════════════════════════════════ */}
        <section className="bg-white border border-sand/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-parchment/60 flex items-center justify-center">
              <BarChart3 size={18} className="text-charcoal-deep/60" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-deep">Brand Activity</h3>
              <p className="text-xs text-stone/50">Revenue, orders, and performance overview</p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-parchment/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                <DollarSign size={12} />
                Total Revenue
              </div>
              <p className="text-xl font-semibold text-charcoal-deep">{formatPrice(brand.totalRevenue, undefined, true)}</p>
            </div>
            <div className="bg-parchment/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                <Package size={12} />
                Total Products
              </div>
              <p className="text-xl font-semibold text-charcoal-deep">{brand.totalProducts}</p>
            </div>
            <div className="bg-parchment/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                <BarChart3 size={12} />
                Commission Rate
              </div>
              <p className="text-xl font-semibold text-charcoal-deep">{brand.commissionRate}%</p>
            </div>
          </div>

          {/* Performance score bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone/60 font-medium">Performance Score</span>
              <span className="font-semibold text-charcoal-deep">{brand.performanceScore}/100</span>
            </div>
            <div className="w-full h-3 bg-sand/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreColor(brand.performanceScore)}`}
                style={{ width: `${brand.performanceScore}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-stone/40">
              <span>0</span>
              <span>
                {brand.performanceScore > 80
                  ? 'Excellent'
                  : brand.performanceScore > 60
                  ? 'Good'
                  : 'Needs Improvement'}
              </span>
              <span>100</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
