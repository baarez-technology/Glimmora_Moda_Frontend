'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useAdmin } from '@/context/AdminContext';
import { changePassword } from '@/services/admin.service';
import { User, Mail, Shield, Bell, Save, Key, CheckCircle, AlertTriangle } from 'lucide-react';

// ─── Toggle Component ────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-charcoal-deep' : 'bg-stone/30'
      }`}
    >
      <div
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { admin } = useAdmin();

  // Notification preferences
  const [notifications, setNotifications] = useState({
    securityAlerts: true,
    systemHealth: true,
    brandApplications: true,
    gdprRequests: true,
    weeklySummary: true,
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwords.current.trim()) {
      setPasswordError('Current password is required.');
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const result = await changePassword(passwords.current, passwords.newPassword);
    if (result.ok) {
      setPasswordSuccess(true);
      setPasswords({ current: '', newPassword: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } else {
      setPasswordError(result.message);
    }
  };

  const handleSave = () => {
    showToast('Settings saved successfully.');
  };

  const initial = admin?.name?.charAt(0)?.toUpperCase() || 'A';

  const roleBadgeColor: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700',
    admin: 'bg-amber-100 text-amber-700',
    moderator: 'bg-blue-100 text-blue-700',
    analyst: 'bg-emerald-100 text-emerald-700',
  };

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator',
    analyst: 'Analyst',
  };

  return (
    <div className="min-h-screen bg-parchment">
      <AdminPageHeader
        title="Settings"
        subtitle="Admin account settings"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {/* ── Profile Section ─────────────────────────────────────────────── */}
        <section className="bg-white border border-sand/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-charcoal-deep flex items-center gap-2 mb-6">
            <User size={18} />
            Profile
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-charcoal-deep text-ivory-cream flex items-center justify-center text-2xl font-display shrink-0">
              {initial}
            </div>

            <div className="space-y-2">
              {/* Name */}
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-stone/50" />
                <span className="text-stone/60 w-16">Name</span>
                <span className="font-medium text-charcoal-deep">{admin?.name || 'Admin User'}</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-stone/50" />
                <span className="text-stone/60 w-16">Email</span>
                <span className="font-medium text-charcoal-deep">{admin?.email || 'admin@glimmora.com'}</span>
              </div>

              {/* Role */}
              <div className="flex items-center gap-2 text-sm">
                <Shield size={14} className="text-stone/50" />
                <span className="text-stone/60 w-16">Role</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    roleBadgeColor[admin?.role || 'admin'] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {roleLabel[admin?.role || 'admin'] || admin?.role}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notification Preferences ────────────────────────────────────── */}
        <section className="bg-white border border-sand/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-charcoal-deep flex items-center gap-2 mb-6">
            <Bell size={18} />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {([
              { key: 'securityAlerts' as const, label: 'Security alerts', desc: 'Suspicious login attempts and policy violations' },
              { key: 'systemHealth' as const, label: 'System health alerts', desc: 'Server uptime, performance degradation, and error spikes' },
              { key: 'brandApplications' as const, label: 'New brand applications', desc: 'Notify when a new brand submits an application' },
              { key: 'gdprRequests' as const, label: 'GDPR requests', desc: 'Data deletion and export requests from users' },
              { key: 'weeklySummary' as const, label: 'Weekly summary report', desc: 'Platform performance digest delivered every Monday' },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-sand/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                  <p className="text-xs text-stone/50 mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  enabled={notifications[item.key]}
                  onToggle={() => toggleNotification(item.key)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Security ────────────────────────────────────────────────────── */}
        <section className="bg-white border border-sand/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-charcoal-deep flex items-center gap-2 mb-6">
            <Key size={18} />
            Security
          </h2>

          {/* Change Password */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <div>
                <label className="block text-xs text-stone/60 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  className="w-full border border-sand/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-charcoal-deep/30"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs text-stone/60 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full border border-sand/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-charcoal-deep/30"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-xs text-stone/60 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  className="w-full border border-sand/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-charcoal-deep/30"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {/* Password validation feedback */}
            {passwordError && (
              <div className="flex items-center gap-2 mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 max-w-3xl">
                <AlertTriangle size={14} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 max-w-3xl">
                <CheckCircle size={14} />
                <span>Password changed successfully.</span>
              </div>
            )}

            <button
              onClick={handlePasswordSubmit}
              className="mt-4 text-xs font-medium text-charcoal-deep border border-charcoal-deep/20 rounded-md px-4 py-2 hover:bg-charcoal-deep hover:text-ivory-cream transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* 2FA Status — Coming soon (no backend support) */}
          <div>
            <h3 className="text-sm font-semibold text-charcoal-deep mb-2">Two-Factor Authentication</h3>
            <div className="flex items-center gap-3 opacity-60">
              <div className="h-8 w-8 rounded-full bg-stone/10 flex items-center justify-center">
                <Shield size={16} className="text-stone/50" />
              </div>
              <div>
                <p className="text-sm text-charcoal-deep">2FA is <span className="font-medium text-stone/60">not available</span></p>
                <p className="text-xs text-stone/50">Coming soon -- Two-factor authentication will be available in a future update.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Save Button ─────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-charcoal-deep text-ivory-cream px-6 py-2.5 rounded-md text-sm font-medium hover:bg-noir transition-colors"
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
