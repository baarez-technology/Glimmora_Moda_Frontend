'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Search,
  Filter,
  Building2,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MoreVertical,
} from 'lucide-react';
import { fetchManagedBrands, updateBrandStatus, updateBrandTier } from '@/services/admin.service';
import type { ManagedBrand, BrandTier, BrandStatus } from '@/types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<BrandTier, { bg: string; text: string; label: string }> = {
  heritage: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Heritage' },
  elite: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Elite' },
  premium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Premium' },
  standard: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Standard' },
};

const STATUS_STYLES: Record<BrandStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Active' },
  verified: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Verified' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
  suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' },
  rejected: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Rejected' },
};

const TIERS: BrandTier[] = ['standard', 'premium', 'elite', 'heritage'];
const STATUSES: BrandStatus[] = ['pending', 'verified', 'active', 'suspended', 'rejected'];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function scoreColor(score: number): string {
  if (score > 80) return 'bg-emerald-500';
  if (score > 60) return 'bg-amber-500';
  return 'bg-red-500';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandPartnersPage() {
  const [brands, setBrands] = useState<ManagedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<BrandTier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BrandStatus | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openTierMenu, setOpenTierMenu] = useState<string | null>(null);

  // Fetch brands
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchManagedBrands({
        tier: tierFilter === 'all' ? undefined : tierFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (!cancelled && res.data) {
        setBrands(res.data);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tierFilter, statusFilter]);

  // Search filter (client-side on top of API filters)
  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter(
      (b) =>
        b.brandName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.contactEmail.toLowerCase().includes(q)
    );
  }, [brands, search]);

  // Stats
  const stats = useMemo(() => {
    const total = brands.length;
    const verified = brands.filter((b) => b.status === 'verified' || b.status === 'active').length;
    const pending = brands.filter((b) => b.status === 'pending').length;
    const avgScore =
      total > 0 ? Math.round(brands.reduce((s, b) => s + b.performanceScore, 0) / total) : 0;
    return { total, verified, pending, avgScore };
  }, [brands]);

  // Actions
  async function handleStatusChange(id: string, status: BrandStatus) {
    const res = await updateBrandStatus(id, status);
    if (res.data) {
      setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
    setOpenMenu(null);
  }

  async function handleTierChange(id: string, tier: BrandTier) {
    const res = await updateBrandTier(id, tier);
    if (res.data) {
      setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, tier } : b)));
    }
    setOpenTierMenu(null);
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
        {/* ── Stats Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={<Building2 size={20} className="text-charcoal-deep/60" />}
            label="Total Brands"
            value={stats.total}
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-emerald-600" />}
            label="Verified"
            value={stats.verified}
          />
          <StatCard
            icon={<Clock size={20} className="text-amber-600" />}
            label="Pending Verification"
            value={stats.pending}
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-blue-600" />}
            label="Avg Performance Score"
            value={stats.avgScore}
            suffix="/100"
          />
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/20"
            />
          </div>

          {/* Tier filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-stone/50" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as BrandTier | 'all')}
              className="text-sm border border-sand/50 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/20"
            >
              <option value="all">All Tiers</option>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {TIER_STYLES[t].label}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BrandStatus | 'all')}
            className="text-sm border border-sand/50 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/20"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_STYLES[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Brand Cards Grid ───────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-20 text-stone/50 text-sm">Loading brands...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone/50 text-sm">
            No brands match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                openTierMenu={openTierMenu}
                setOpenTierMenu={setOpenTierMenu}
                onStatusChange={handleStatusChange}
                onTierChange={handleTierChange}
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
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="bg-white border border-sand/50 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-parchment/60 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone/60 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-charcoal-deep">
          {value}
          {suffix && <span className="text-sm font-normal text-stone/50">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

function BrandCard({
  brand,
  openMenu,
  setOpenMenu,
  openTierMenu,
  setOpenTierMenu,
  onStatusChange,
  onTierChange,
}: {
  brand: ManagedBrand;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  openTierMenu: string | null;
  setOpenTierMenu: (id: string | null) => void;
  onStatusChange: (id: string, status: BrandStatus) => void;
  onTierChange: (id: string, tier: BrandTier) => void;
}) {
  const tier = TIER_STYLES[brand.tier];
  const status = STATUS_STYLES[brand.status];
  const initial = brand.brandName.charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-sand/50 rounded-xl p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-11 h-11 rounded-lg bg-charcoal-deep/10 flex items-center justify-center text-lg font-display text-charcoal-deep/70">
            {initial}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-charcoal-deep">{brand.brandName}</h3>
            <p className="text-xs text-stone/50">{brand.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tier badge */}
          <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>
            {tier.label}
          </span>
          {/* Status badge */}
          <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-xs text-stone/60">
        <span>
          <span className="font-medium text-charcoal-deep">{brand.totalProducts}</span> products
        </span>
        <span>
          <span className="font-medium text-charcoal-deep">{formatCurrency(brand.totalRevenue)}</span> revenue
        </span>
        <span>
          <span className="font-medium text-charcoal-deep">{brand.commissionRate}%</span> commission
        </span>
      </div>

      {/* Performance score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone/50">Performance</span>
          <span className="font-medium text-charcoal-deep">{brand.performanceScore}/100</span>
        </div>
        <div className="w-full h-1.5 bg-sand/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${scoreColor(brand.performanceScore)}`}
            style={{ width: `${brand.performanceScore}%` }}
          />
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-1 border-t border-sand/30">
        <button className="text-xs font-medium text-charcoal-deep hover:text-charcoal-deep/70 px-3 py-1.5 rounded-lg hover:bg-parchment/60 transition-colors">
          View Details
        </button>

        {/* Change Tier dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenTierMenu(openTierMenu === brand.id ? null : brand.id)}
            className="text-xs font-medium text-stone/60 hover:text-charcoal-deep px-3 py-1.5 rounded-lg hover:bg-parchment/60 transition-colors flex items-center gap-1"
          >
            <Star size={12} />
            Change Tier
          </button>
          {openTierMenu === brand.id && (
            <div className="absolute left-0 top-full mt-1 z-20 w-36 bg-white border border-sand/50 rounded-lg shadow-lg py-1">
              {TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => onTierChange(brand.id, t)}
                  disabled={t === brand.tier}
                  className={`w-full text-left text-xs px-3 py-1.5 hover:bg-parchment/60 transition-colors ${
                    t === brand.tier ? 'text-stone/30 cursor-default' : 'text-charcoal-deep'
                  }`}
                >
                  {TIER_STYLES[t].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status actions */}
        <div className="relative ml-auto">
          <button
            onClick={() => setOpenMenu(openMenu === brand.id ? null : brand.id)}
            className="p-1.5 rounded-lg hover:bg-parchment/60 transition-colors text-stone/50 hover:text-charcoal-deep"
          >
            <MoreVertical size={16} />
          </button>
          {openMenu === brand.id && (
            <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-sand/50 rounded-lg shadow-lg py-1">
              {brand.status === 'pending' && (
                <button
                  onClick={() => onStatusChange(brand.id, 'verified')}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-parchment/60 transition-colors text-emerald-700 flex items-center gap-2"
                >
                  <CheckCircle size={12} /> Verify
                </button>
              )}
              {(brand.status === 'verified' || brand.status === 'active') && (
                <button
                  onClick={() => onStatusChange(brand.id, 'suspended')}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-parchment/60 transition-colors text-red-700 flex items-center gap-2"
                >
                  <XCircle size={12} /> Suspend
                </button>
              )}
              {brand.status === 'suspended' && (
                <button
                  onClick={() => onStatusChange(brand.id, 'active')}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-parchment/60 transition-colors text-emerald-700 flex items-center gap-2"
                >
                  <CheckCircle size={12} /> Activate
                </button>
              )}
              {brand.status === 'pending' && (
                <button
                  onClick={() => onStatusChange(brand.id, 'rejected')}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-parchment/60 transition-colors text-red-700 flex items-center gap-2"
                >
                  <XCircle size={12} /> Reject
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
