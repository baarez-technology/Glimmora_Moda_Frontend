'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { fetchManagedBrands, updateBrandStatus } from '@/services/admin.service';
import { getBrandWarningLevel } from '@/services/reports.service';
import { formatPrice } from '@/lib/currency';
import type { ManagedBrand, BrandStatus } from '@/types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BrandStatus, { bg: string; text: string; label: string }> = {
  active:    { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Active' },
  verified:  { bg: 'bg-sky-100',     text: 'text-sky-800',     label: 'Verified' },
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-800',   label: 'Pending' },
  suspended: { bg: 'bg-red-100',     text: 'text-red-800',     label: 'Suspended' },
  rejected:  { bg: 'bg-rose-100',    text: 'text-rose-800',    label: 'Rejected' },
};

const WARNING_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  low:    { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Low Risk' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Medium Risk' },
  high:   { bg: 'bg-red-100',   text: 'text-red-800',    label: 'High Risk' },
};

type Tab = 'all' | 'pending' | 'suspended';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandPartnersPage() {
  const [brands, setBrands] = useState<ManagedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [warningMap, setWarningMap] = useState<Record<string, { total: number; level: string }>>({});

  // Fetch brands
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchManagedBrands();
      if (!cancelled && res.data) {
        setBrands(res.data);
        // Build warning map
        const wMap: Record<string, { total: number; level: string }> = {};
        res.data.forEach((b) => {
          wMap[b.id] = getBrandWarningLevel(b.id);
        });
        setWarningMap(wMap);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Filtered brands based on tab + search
  const filtered = useMemo(() => {
    let list = brands;

    // Tab filter
    if (activeTab === 'pending') {
      list = list.filter((b) => b.status === 'pending');
    } else if (activeTab === 'suspended') {
      list = list.filter((b) => b.status === 'suspended');
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.brandName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.contactEmail.toLowerCase().includes(q)
      );
    }

    return list;
  }, [brands, activeTab, search]);

  // Stats
  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.status === 'active' || b.status === 'verified').length;
    const pending = brands.filter((b) => b.status === 'pending').length;
    const suspended = brands.filter((b) => b.status === 'suspended').length;
    return { total, active, pending, suspended };
  }, [brands]);

  // Actions
  async function handleStatusChange(id: string, status: BrandStatus) {
    const res = await updateBrandStatus(id, status);
    if (res.data) {
      setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-parchment/30">
      <AdminPageHeader
        title="Brand Partners"
        subtitle="Onboarding, verification, and partner management"
        breadcrumbs={[{ label: 'Brands' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {/* ── Stats Bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={<Building2 size={20} className="text-charcoal-deep/60" />}
            label="Total Brands"
            value={stats.total}
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-emerald-600" />}
            label="Active"
            value={stats.active}
          />
          <StatCard
            icon={<Clock size={20} className="text-amber-600" />}
            label="Pending Approval"
            value={stats.pending}
          />
          <StatCard
            icon={<Ban size={20} className="text-red-600" />}
            label="Suspended"
            value={stats.suspended}
          />
        </div>

        {/* ── Tab Bar + Search ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-sand/50 rounded-xl p-1">
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
              All Brands
            </TabButton>
            <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} badge={stats.pending}>
              New Registrations
            </TabButton>
            <TabButton active={activeTab === 'suspended'} onClick={() => setActiveTab('suspended')}>
              Suspended
            </TabButton>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/20"
            />
          </div>
        </div>

        {/* ── Brand List ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-20 text-stone/50 text-sm">Loading brands...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone/50 text-sm">
            No brands match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                warning={warningMap[brand.id]}
                isPendingTab={activeTab === 'pending'}
                onApprove={(id) => handleStatusChange(id, 'active')}
                onReject={(id) => handleStatusChange(id, 'rejected')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-sand/50 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-parchment/60 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone/60 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-charcoal-deep">{value}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-charcoal-deep text-ivory-cream'
          : 'text-stone/60 hover:text-charcoal-deep hover:bg-parchment/60'
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className={`ml-2 inline-flex items-center justify-center text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full ${
          active
            ? 'bg-amber-400 text-charcoal-deep'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function BrandCard({
  brand,
  warning,
  isPendingTab,
  onApprove,
  onReject,
}: {
  brand: ManagedBrand;
  warning?: { total: number; level: string };
  isPendingTab: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const status = STATUS_STYLES[brand.status];
  const initial = brand.brandName.charAt(0).toUpperCase();
  const warningStyle = warning && warning.level !== 'none' ? WARNING_STYLES[warning.level] : null;
  const joinedDate = new Date(brand.partnerSince).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-sand/50 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-5">
        {/* Logo / Initial */}
        <div className="w-12 h-12 rounded-xl bg-charcoal-deep/10 flex items-center justify-center text-xl font-display text-charcoal-deep/70 shrink-0 overflow-hidden">
          {brand.brandLogo ? (
            <img src={brand.brandLogo} alt={brand.brandName} className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm font-semibold text-charcoal-deep">{brand.brandName}</h3>
            <span className="text-xs text-stone/50">{brand.category}</span>
            <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            {warningStyle && (
              <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${warningStyle.bg} ${warningStyle.text}`}>
                <AlertTriangle size={10} />
                {warning!.total} complaint{warning!.total !== 1 ? 's' : ''} &middot; {warningStyle.label}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-5 mt-2 text-xs text-stone/60 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Package size={12} className="text-stone/40" />
              <span className="font-medium text-charcoal-deep">{brand.totalProducts}</span> products
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-stone/40" />
              <span className="font-medium text-charcoal-deep">{formatPrice(brand.totalRevenue, undefined, true)}</span> revenue
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-stone/40" />
              Joined {joinedDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick approve/reject for pending brands */}
          {(brand.status === 'pending') && (
            <>
              <button
                onClick={() => onApprove(brand.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isPendingTab
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle size={14} />
                Approve
              </button>
              <button
                onClick={() => onReject(brand.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isPendingTab
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <XCircle size={14} />
                Reject
              </button>
            </>
          )}

          {/* View Details link */}
          <Link
            href={`/admin/brands/${brand.id}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-charcoal-deep hover:text-charcoal-deep/70 rounded-lg hover:bg-parchment/60 transition-colors border border-sand/50"
          >
            View Details
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
