'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  UserPlus,
} from 'lucide-react';
import { fetchPlatformUsers, updateUserStatus } from '@/services/admin.service';
import type { PlatformUser, UserRole, UserStatus } from '@/types/admin';

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  uhni: 'bg-amber-100 text-amber-700',
  brand: 'bg-blue-100 text-blue-700',
  consumer: 'bg-gray-100 text-gray-600',
};

const STATUS_BADGE: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  banned: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-500',
};

const STATUS_ICON: Record<UserStatus, React.ReactNode> = {
  active: <CheckCircle size={12} />,
  suspended: <Clock size={12} />,
  banned: <Ban size={12} />,
  pending: <Clock size={12} />,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number): string {
  if (n >= 100_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // ── Load users ──────────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoading(true);
    const res = await fetchPlatformUsers({
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });
    if (res.data) setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  // ── Filtered list (search applied client-side) ──────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      suspended: users.filter((u) => u.status === 'suspended').length,
      uhni: users.filter((u) => u.role === 'uhni').length,
    };
  }, [users]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setOpenMenu(null);
    await updateUserStatus(userId, newStatus);
    await loadUsers();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setOpenMenu(null);
    if (openMenu) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [openMenu]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-parchment/30">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage platform users, roles, and access"
        breadcrumbs={[{ label: 'Users' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/10"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="pl-8 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-deep/10"
            >
              <option value="">All Roles</option>
              <option value="consumer">Consumer</option>
              <option value="uhni">UHNI</option>
              <option value="brand">Brand</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
            className="px-4 py-2 text-sm border border-sand/50 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-deep/10"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="pending">Pending</option>
          </select>

          {/* Add User (placeholder) */}
          <button className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-ivory-cream bg-charcoal-deep rounded-lg hover:bg-charcoal-deep/90 transition-colors">
            <UserPlus size={16} />
            Add User
          </button>
        </div>

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: <Shield size={18} className="text-charcoal-deep" /> },
            { label: 'Active', value: stats.active, icon: <CheckCircle size={18} className="text-emerald-600" /> },
            { label: 'Suspended', value: stats.suspended, icon: <Clock size={18} className="text-amber-600" /> },
            { label: 'UHNI', value: stats.uhni, icon: <Shield size={18} className="text-amber-600" /> },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 bg-white border border-sand/50 rounded-lg px-4 py-3"
            >
              <div className="p-2 bg-parchment/60 rounded-lg">{s.icon}</div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-semibold text-charcoal-deep">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-sand/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone/40 text-sm">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-stone/40 text-sm">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand/30 text-left text-xs uppercase tracking-wider text-stone/50">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Orders</th>
                    <th className="px-4 py-3 font-medium text-right">Total Spend</th>
                    <th className="px-4 py-3 font-medium">Last Login</th>
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-sand/20 hover:bg-parchment/20 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-charcoal-deep/10 flex items-center justify-center text-xs font-semibold text-charcoal-deep shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-charcoal-deep truncate">{user.name}</p>
                            <p className="text-xs text-stone/50 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[user.status]}`}
                        >
                          {STATUS_ICON[user.status]}
                          {user.status}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3 text-right text-charcoal-deep">
                        {user.totalOrders}
                      </td>

                      {/* Total Spend */}
                      <td className="px-4 py-3 text-right text-charcoal-deep">
                        {formatCurrency(user.totalSpend)}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3 text-stone/60">{formatDate(user.lastLogin)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === user.id ? null : user.id);
                            }}
                            className="p-1 rounded hover:bg-sand/30 transition-colors"
                          >
                            <MoreVertical size={16} className="text-stone/50" />
                          </button>

                          {openMenu === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-sand/50 rounded-lg shadow-lg z-20 py-1">
                              <button
                                onClick={() => setOpenMenu(null)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-parchment/40 transition-colors text-charcoal-deep"
                              >
                                View Details
                              </button>
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'suspended')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-parchment/40 transition-colors text-amber-600"
                                >
                                  Suspend
                                </button>
                              ) : user.status === 'suspended' ? (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-parchment/40 transition-colors text-emerald-600"
                                >
                                  Activate
                                </button>
                              ) : null}
                              {user.status !== 'banned' && (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'banned')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-parchment/40 transition-colors text-red-600"
                                >
                                  Ban
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
