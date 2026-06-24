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
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { fetchPlatformUsers, updateUserStatus } from '@/services/admin.service';
import type { PlatformUserItem } from '@/services/admin.service';

type UserRole = 'consumer' | 'uhni' | 'brand' | 'admin';
type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  uhni: 'bg-amber-100 text-amber-700',
  brand: 'bg-blue-100 text-blue-700',
  consumer: 'bg-gray-100 text-gray-600',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  banned: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-500',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  active: <CheckCircle size={12} />,
  suspended: <Clock size={12} />,
  banned: <Ban size={12} />,
  pending: <Clock size={12} />,
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number): string {
  if (n >= 100_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PlatformUserItem | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'moderator'>('admin');
  const [inviteSent, setInviteSent] = useState(false);

  // ── Load users ──────────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoading(true);
    setError(false);
    const data = await fetchPlatformUsers({
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      page_size: 100,
    });
    if (data) {
      setUsers(data.users);
      setTotal(data.total);
    } else {
      setError(true);
    }
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
      total,
      active: users.filter((u) => u.status === 'active').length,
      suspended: users.filter((u) => u.status === 'suspended').length,
      uhni: users.filter((u) => u.role === 'uhni').length,
    };
  }, [users, total]);

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

          {/* Invite Admin */}
          <button
            onClick={() => { setShowInviteModal(true); setInviteSent(false); setInviteEmail(''); setInviteRole('admin'); }}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-ivory-cream bg-charcoal-deep rounded-lg hover:bg-charcoal-deep/90 transition-colors"
          >
            <UserPlus size={16} />
            Invite Admin
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
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-stone/40 text-sm">
              Failed to load users. Please try again.
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
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[user.role] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[user.status] || 'bg-gray-100 text-gray-500'}`}
                        >
                          {STATUS_ICON[user.status] || <Clock size={12} />}
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
                                onClick={() => { setSelectedUser(user); setOpenMenu(null); }}
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

      {/* ── User Detail Modal ───────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand/30">
              <h2 className="text-lg font-semibold text-charcoal-deep">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-lg hover:bg-sand/30 transition-colors text-stone/50 hover:text-charcoal-deep">
                <X size={18} />
              </button>
            </div>

            {/* Profile Section */}
            <div className="px-6 py-5 border-b border-sand/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-charcoal-deep/10 flex items-center justify-center text-xl font-semibold text-charcoal-deep shrink-0">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-charcoal-deep">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[selectedUser.role] || 'bg-gray-100 text-gray-600'}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[selectedUser.status] || 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_ICON[selectedUser.status] || <Clock size={12} />}
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-6 py-4 border-b border-sand/30 space-y-3">
              <h4 className="text-xs text-stone/50 uppercase tracking-wider font-medium">Contact Information</h4>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={14} className="text-stone/40 shrink-0" />
                <span className="text-charcoal-deep">{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={14} className="text-stone/40 shrink-0" />
                  <span className="text-charcoal-deep">{selectedUser.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-stone/40 shrink-0" />
                <span className="text-stone/60">Joined {formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            {/* Account Details */}
            <div className="px-6 py-4 border-b border-sand/30 space-y-3">
              <h4 className="text-xs text-stone/50 uppercase tracking-wider font-medium">Account Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-parchment/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                    <Clock size={12} />
                    Last Login
                  </div>
                  <p className="text-sm font-medium text-charcoal-deep">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                    <ShieldCheck size={12} />
                    Two-Factor Auth
                  </div>
                  <p className="text-sm font-medium text-charcoal-deep">{selectedUser.isTwoFAEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                    <ShoppingBag size={12} />
                    Total Orders
                  </div>
                  <p className="text-sm font-medium text-charcoal-deep">{selectedUser.totalOrders}</p>
                </div>
                <div className="bg-parchment/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-stone/50 mb-1">
                    <DollarSign size={12} />
                    Total Spend
                  </div>
                  <p className="text-sm font-medium text-charcoal-deep">{formatCurrency(selectedUser.totalSpend)}</p>
                </div>
              </div>
            </div>

            {/* Status Change Actions */}
            <div className="px-6 py-4 space-y-3">
              <h4 className="text-xs text-stone/50 uppercase tracking-wider font-medium">Change Status</h4>
              <div className="flex items-center gap-2">
                {selectedUser.status !== 'active' && (
                  <button
                    onClick={async () => {
                      await handleStatusChange(selectedUser.id, 'active');
                      setSelectedUser((prev) => prev ? { ...prev, status: 'active' } : null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle size={12} />
                    Activate
                  </button>
                )}
                {selectedUser.status !== 'suspended' && (
                  <button
                    onClick={async () => {
                      await handleStatusChange(selectedUser.id, 'suspended');
                      setSelectedUser((prev) => prev ? { ...prev, status: 'suspended' } : null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <Clock size={12} />
                    Suspend
                  </button>
                )}
                {selectedUser.status !== 'banned' && (
                  <button
                    onClick={async () => {
                      await handleStatusChange(selectedUser.id, 'banned');
                      setSelectedUser((prev) => prev ? { ...prev, status: 'banned' } : null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <Ban size={12} />
                    Ban
                  </button>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="px-6 py-4 border-t border-sand/30">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2 text-sm font-medium text-stone/60 hover:text-charcoal-deep bg-parchment/40 hover:bg-parchment/60 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Admin Modal ──────────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand/30">
              <h2 className="text-lg font-semibold text-charcoal-deep">Invite Admin</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg hover:bg-sand/30 transition-colors text-stone/50 hover:text-charcoal-deep">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {inviteSent ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <Send size={20} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-charcoal-deep">Invitation Sent</p>
                  <p className="text-xs text-stone/50">
                    An invite has been sent to <span className="font-medium text-charcoal-deep">{inviteEmail}</span> with the <span className="capitalize font-medium text-charcoal-deep">{inviteRole}</span> role.
                  </p>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="mt-2 px-4 py-2 text-sm font-medium text-ivory-cream bg-charcoal-deep rounded-lg hover:bg-charcoal-deep/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-stone/50">
                    Consumers and brands register through their own portals. Use this form to invite admin team members only.
                  </p>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-charcoal-deep">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/10"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-charcoal-deep">Admin Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin' | 'moderator')}
                      className="w-full px-3 py-2 text-sm border border-sand/50 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-deep/10"
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-2 text-sm font-medium text-stone/60 hover:text-charcoal-deep bg-parchment/40 hover:bg-parchment/60 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (inviteEmail.trim()) {
                          setInviteSent(true);
                        }
                      }}
                      disabled={!inviteEmail.trim()}
                      className="flex-1 py-2 text-sm font-medium text-ivory-cream bg-charcoal-deep rounded-lg hover:bg-charcoal-deep/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Send Invitation
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
