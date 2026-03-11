'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Edit2,
  Save,
} from 'lucide-react';
import {
  fetchRevenueBreakdown,
  fetchCommissionRules,
  fetchPayouts,
  processPayouts,
  updateCommissionRule,
} from '@/services/admin.service';
import type {
  RevenueBreakdown,
  CommissionRule,
  Payout,
  PayoutStatus,
} from '@/types/admin';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TIER_BADGE_COLORS: Record<string, string> = {
  heritage: 'bg-amber-100 text-amber-800 border border-amber-300',
  elite: 'bg-purple-100 text-purple-800 border border-purple-300',
  premium: 'bg-blue-100 text-blue-800 border border-blue-300',
  standard: 'bg-gray-100 text-gray-700 border border-gray-300',
};

const STATUS_BADGE_COLORS: Record<PayoutStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
};

const PAYOUT_TABS: { label: string; value: PayoutStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [revenue, setRevenue] = useState<RevenueBreakdown | null>(null);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Commission editing state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<string>('');
  const [savingRule, setSavingRule] = useState(false);

  // Payout state
  const [payoutTab, setPayoutTab] = useState<PayoutStatus | 'all'>('all');
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<Set<string>>(new Set());
  const [processingPayouts, setProcessingPayouts] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [revRes, crRes, poRes] = await Promise.all([
        fetchRevenueBreakdown(),
        fetchCommissionRules(),
        fetchPayouts(),
      ]);
      if (revRes.data) setRevenue(revRes.data);
      if (crRes.data) setCommissionRules(crRes.data);
      if (poRes.data) setPayouts(poRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  // ── Commission editing handlers ──

  function handleEditRule(rule: CommissionRule) {
    setEditingRuleId(rule.id);
    setEditingRate(rule.rate.toString());
  }

  async function handleSaveRule(ruleId: string) {
    const rate = parseFloat(editingRate);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    setSavingRule(true);
    const res = await updateCommissionRule(ruleId, rate);
    if (res.data) {
      setCommissionRules((prev) =>
        prev.map((r) => (r.id === ruleId ? res.data! : r))
      );
    }
    setEditingRuleId(null);
    setEditingRate('');
    setSavingRule(false);
  }

  // ── Payout handlers ──

  function togglePayoutSelection(id: string) {
    setSelectedPayoutIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleProcessPayouts() {
    if (selectedPayoutIds.size === 0) return;
    setProcessingPayouts(true);
    const res = await processPayouts(Array.from(selectedPayoutIds));
    if (res.data) {
      const processedMap = new Map(res.data.map((p) => [p.id, p]));
      setPayouts((prev) =>
        prev.map((p) => processedMap.get(p.id) ?? p)
      );
      setSelectedPayoutIds(new Set());
    }
    setProcessingPayouts(false);
  }

  // Filtered payouts
  const filteredPayouts =
    payoutTab === 'all' ? payouts : payouts.filter((p) => p.status === payoutTab);

  // Selectable (pending) payouts in current view
  const selectablePayouts = filteredPayouts.filter((p) => p.status === 'pending');

  return (
    <div className="min-h-screen bg-parchment/30">
      {/* Header */}
      <AdminPageHeader
        title="Financial Management"
        subtitle="Revenue tracking, commissions, and payouts"
        breadcrumbs={[{ label: 'Finance' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 text-stone/60">Loading financial data...</div>
        ) : (
          <>
            {/* ── Revenue Breakdown ─────────────────────────────────── */}
            {revenue && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total GMV */}
                <div className="bg-white border border-sand/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-charcoal-deep/10">
                      <DollarSign size={20} className="text-charcoal-deep" />
                    </div>
                    <p className="text-xs text-stone/60 uppercase tracking-wider">Total GMV</p>
                  </div>
                  <p className="text-2xl font-semibold text-charcoal-deep">
                    {formatCurrency(revenue.totalGMV)}
                  </p>
                </div>

                {/* Total Commission */}
                <div className="bg-white border border-sand/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gold-soft/20">
                      <TrendingUp size={20} className="text-gold-soft" />
                    </div>
                    <p className="text-xs text-stone/60 uppercase tracking-wider">Total Commission</p>
                  </div>
                  <p className="text-2xl font-semibold text-charcoal-deep">
                    {formatCurrency(revenue.totalCommission)}
                  </p>
                </div>

                {/* Total Payouts */}
                <div className="bg-white border border-sand/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <CheckCircle size={20} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-stone/60 uppercase tracking-wider">Total Payouts</p>
                  </div>
                  <p className="text-2xl font-semibold text-charcoal-deep">
                    {formatCurrency(revenue.totalPayouts)}
                  </p>
                </div>

                {/* Pending Payouts */}
                <div className="bg-white border border-sand/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Clock size={20} className="text-amber-600" />
                    </div>
                    <p className="text-xs text-stone/60 uppercase tracking-wider">Pending Payouts</p>
                  </div>
                  <p className="text-2xl font-semibold text-charcoal-deep">
                    {formatCurrency(revenue.pendingPayouts)}
                  </p>
                </div>
              </div>
            )}

            {/* ── Commission Rules ──────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  Commission Rates by Brand Tier
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 text-left">
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Brand Tier
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Category
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Rate (%)
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Effective From
                      </th>
                      <th className="pb-3 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionRules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="border-b border-sand/20 last:border-0 hover:bg-parchment/20 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full ${
                              TIER_BADGE_COLORS[rule.brandTier] || TIER_BADGE_COLORS.standard
                            }`}
                          >
                            {rule.brandTier}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-charcoal-deep">{rule.category}</td>
                        <td className="py-3 pr-4 text-right">
                          {editingRuleId === rule.id ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              value={editingRate}
                              onChange={(e) => setEditingRate(e.target.value)}
                              className="w-20 px-2 py-1 text-sm text-right border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-gold-soft"
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium text-charcoal-deep">
                              {rule.rate.toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-stone/60">{formatDate(rule.effectiveFrom)}</td>
                        <td className="py-3 text-right">
                          {editingRuleId === rule.id ? (
                            <button
                              onClick={() => handleSaveRule(rule.id)}
                              disabled={savingRule}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Save size={14} />
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-charcoal-deep bg-parchment/50 hover:bg-parchment rounded-md transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {commissionRules.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone/60">
                          No commission rules configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Payouts ───────────────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ArrowRight size={20} className="text-gold-soft" />
                  <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                    Payouts
                  </h2>
                </div>
                <button
                  onClick={handleProcessPayouts}
                  disabled={selectedPayoutIds.size === 0 || processingPayouts}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ivory-cream bg-charcoal-deep hover:bg-charcoal-deep/90 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={14} />
                  {processingPayouts ? 'Processing...' : `Process Selected (${selectedPayoutIds.size})`}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-6 border-b border-sand/30">
                {PAYOUT_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setPayoutTab(tab.value);
                      setSelectedPayoutIds(new Set());
                    }}
                    className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                      payoutTab === tab.value
                        ? 'border-charcoal-deep text-charcoal-deep'
                        : 'border-transparent text-stone/60 hover:text-charcoal-deep'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 text-left">
                      <th className="pb-3 pr-4 w-10">
                        {selectablePayouts.length > 0 && (
                          <input
                            type="checkbox"
                            checked={
                              selectablePayouts.length > 0 &&
                              selectablePayouts.every((p) => selectedPayoutIds.has(p.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPayoutIds(
                                  new Set(selectablePayouts.map((p) => p.id))
                                );
                              } else {
                                setSelectedPayoutIds(new Set());
                              }
                            }}
                            className="w-4 h-4 rounded border-sand accent-charcoal-deep"
                          />
                        )}
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Brand Name
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Period
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Gross Amount
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Commission
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Net Amount
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Status
                      </th>
                      <th className="pb-3 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="border-b border-sand/20 last:border-0 hover:bg-parchment/20 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          {payout.status === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedPayoutIds.has(payout.id)}
                              onChange={() => togglePayoutSelection(payout.id)}
                              className="w-4 h-4 rounded border-sand accent-charcoal-deep"
                            />
                          )}
                        </td>
                        <td className="py-3 pr-4 font-medium text-charcoal-deep">
                          {payout.brandName}
                        </td>
                        <td className="py-3 pr-4 text-stone/60">{payout.period}</td>
                        <td className="py-3 pr-4 text-right text-charcoal-deep">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-red-600">
                          -{formatCurrency(payout.commissionAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-charcoal-deep">
                          {formatCurrency(payout.netAmount)}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full ${
                              STATUS_BADGE_COLORS[payout.status]
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {payout.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedPayoutIds(new Set([payout.id]));
                                handleProcessPayouts();
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-charcoal-deep bg-parchment/50 hover:bg-parchment rounded-md transition-colors"
                            >
                              <ArrowRight size={14} />
                              Process
                            </button>
                          )}
                          {payout.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle size={14} />
                              Failed
                            </span>
                          )}
                          {payout.status === 'completed' && payout.processedAt && (
                            <span className="text-xs text-stone/60">
                              {formatDate(payout.processedAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredPayouts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-stone/60">
                          No payouts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
