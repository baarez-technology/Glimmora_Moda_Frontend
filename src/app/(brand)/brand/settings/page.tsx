'use client';

import { useState } from 'react';
import {
  User,
  Building2,
  Key,
  Bell,
  Globe,
  Link2,
  Copy,
  Eye,
  EyeOff,
  Check,
  Plus,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';

type SettingsTab = 'profile' | 'team' | 'api' | 'notifications';

export default function SettingsPage() {
  const { partner } = useBrand();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'analyst' | 'viewer'>('viewer');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<('read' | 'write' | 'delete')[]>(['read']);

  if (!partner) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'manager':
        return 'bg-info/10 text-info';
      case 'analyst':
        return 'bg-success/10 text-success';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const handleInviteMember = () => {
    // In a real app, this would send the invitation
    console.log('Inviting member:', { email: inviteEmail, role: inviteRole });
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('viewer');
  };

  const handleCreateKey = () => {
    // In a real app, this would create a new API key
    console.log('Creating API key:', { name: newKeyName, permissions: newKeyPermissions });
    setShowCreateKeyModal(false);
    setNewKeyName('');
    setNewKeyPermissions(['read']);
  };

  const togglePermission = (permission: 'read' | 'write' | 'delete') => {
    setNewKeyPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div>
      <BrandPageHeader
        title="Settings"
        subtitle="Manage your brand portal settings"
      />

      <div className="p-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-parchment text-charcoal-deep'
                        : 'text-stone hover:text-charcoal-deep hover:bg-parchment/50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-3xl">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Brand Information
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-charcoal-deep text-ivory-cream flex items-center justify-center text-2xl font-display">
                        {partner.brandName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-charcoal-deep">{partner.brandName}</p>
                        <p className="text-sm text-taupe">Partner since {formatDate(partner.partnerSince)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase bg-gold-soft/20 text-gold-deep">
                            {partner.tier}
                          </span>
                          <span className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success">
                            {partner.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                          Partner ID
                        </label>
                        <p className="text-sm text-charcoal-deep font-mono">{partner.id}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                          Brand ID
                        </label>
                        <p className="text-sm text-charcoal-deep font-mono">{partner.brandId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Display Settings
                  </h2>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Currency
                      </label>
                      <select className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Timezone
                      </label>
                      <select className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer">
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New York</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Language
                      </label>
                      <select className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer">
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50">
                  <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                    <h2 className="font-medium text-charcoal-deep">Team Members</h2>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                    >
                      <Plus size={16} />
                      Invite Member
                    </button>
                  </div>

                  <div className="divide-y divide-sand/30">
                    {partner.teamMembers.map(member => (
                      <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-parchment rounded-full flex items-center justify-center text-stone">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{member.name}</p>
                            <p className="text-xs text-taupe">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getRoleBadge(member.role)}`}>
                            {member.role}
                          </span>
                          <button className="text-stone hover:text-error transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50">
                  <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                    <h2 className="font-medium text-charcoal-deep">API Keys</h2>
                    <button
                      onClick={() => setShowCreateKeyModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                    >
                      <Plus size={16} />
                      Create Key
                    </button>
                  </div>

                  <div className="divide-y divide-sand/30">
                    {partner.apiKeys.map(key => (
                      <div key={key.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{key.name}</p>
                            <p className="text-xs text-taupe">Created {formatDate(key.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {key.permissions.map(perm => (
                              <span key={perm} className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-parchment text-stone">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-parchment/50">
                          <code className="flex-1 text-sm text-charcoal-deep font-mono">
                            {showKey === key.id ? 'sk_live_dior_a1b2c3d4e5f6g7h8i9j0...' : key.keyPrefix}
                          </code>
                          <button
                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                            className="text-stone hover:text-charcoal-deep transition-colors"
                            title={showKey === key.id ? 'Hide' : 'Show'}
                          >
                            {showKey === key.id ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(key.keyPrefix, key.id)}
                            className="text-stone hover:text-charcoal-deep transition-colors"
                            title="Copy"
                          >
                            {copiedKey === key.id ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                          </button>
                        </div>
                        {key.lastUsed && (
                          <p className="text-xs text-taupe mt-2">
                            Last used: {formatDate(key.lastUsed)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Integration Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Webhook URL
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="url"
                          value={partner.settings.integration.webhookUrl || ''}
                          readOnly
                          className="flex-1 px-4 py-3 bg-transparent border border-sand text-charcoal-deep font-mono text-sm"
                        />
                        <button className="px-4 py-3 border border-sand text-stone hover:text-charcoal-deep hover:bg-parchment transition-colors">
                          <Link2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Sync Frequency
                      </label>
                      <select className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer">
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Get notified when products fall below threshold' },
                      { key: 'orderUpdates', label: 'Order Updates', description: 'Receive updates on new orders and changes' },
                      { key: 'demandSignals', label: 'Demand Signals', description: 'Be notified of significant demand changes' },
                      { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly performance summaries' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-4 border-b border-sand/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                          <p className="text-xs text-taupe">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={partner.settings.notifications[item.key as keyof typeof partner.settings.notifications]}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-sand peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-charcoal-deep" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <PrimaryButton>
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-noir/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
              <h2 className="font-display text-lg text-charcoal-deep">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-stone hover:text-charcoal-deep transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="colleague@brand.com"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white"
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="manager">Manager - Edit products & collections</option>
                  <option value="analyst">Analyst - View analytics & reports</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={!inviteEmail}
                  className="px-6 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-noir/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
              <h2 className="font-display text-lg text-charcoal-deep">Create API Key</h2>
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="text-stone hover:text-charcoal-deep transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Key Name *
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="e.g., Production API"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Permissions *
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'read' as const, label: 'Read', description: 'View products, orders, and analytics' },
                    { value: 'write' as const, label: 'Write', description: 'Create and update products' },
                    { value: 'delete' as const, label: 'Delete', description: 'Remove products and collections' }
                  ].map(perm => (
                    <label key={perm.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(perm.value)}
                        onChange={() => togglePermission(perm.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm text-charcoal-deep">{perm.label}</p>
                        <p className="text-xs text-taupe">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowCreateKeyModal(false)}
                  className="px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName || newKeyPermissions.length === 0}
                  className="px-6 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
