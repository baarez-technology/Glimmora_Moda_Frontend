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
  X,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Percent,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';

type SettingsTab = 'profile' | 'team' | 'notifications' | 'commerce';

export default function SettingsPage() {
  const { partner, commerceSettings, updateTaxRule, updateShippingMethod, addShippingMethod, removeShippingMethod, updateCommerceConfig } = useBrand();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'analyst' | 'viewer'>('viewer');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<('read' | 'write' | 'delete')[]>(['read']);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Display settings - controlled state
  const [displayCurrency, setDisplayCurrency] = useState(partner?.settings.display.currency || 'EUR');
  const [displayTimezone, setDisplayTimezone] = useState(partner?.settings.display.timezone || 'Europe/Paris');
  const [displayLanguage, setDisplayLanguage] = useState(partner?.settings.display.language || 'en');

  // Notification settings - controlled state
  const [notifSettings, setNotifSettings] = useState({
    lowStockAlerts: partner?.settings.notifications.lowStockAlerts ?? true,
    orderUpdates: partner?.settings.notifications.orderUpdates ?? true,
    demandSignals: partner?.settings.notifications.demandSignals ?? true,
    weeklyReports: partner?.settings.notifications.weeklyReports ?? false,
  });

  // Integration settings - controlled state
  const [webhookUrl, setWebhookUrl] = useState(partner?.settings.integration.webhookUrl || '');
  const [syncFrequency, setSyncFrequency] = useState(partner?.settings.integration.syncFrequency || 'realtime');

  // Commerce - new shipping form
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [newShipping, setNewShipping] = useState({
    name: '',
    carrier: '',
    estimatedDays: '',
    baseRate: 0,
    freeAbove: 0,
    isEnabled: true,
    regions: [] as string[]
  });

  // Team member delete confirmation
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);

  const inviteModalRef = useModalAccessibility(showInviteModal, () => setShowInviteModal(false));
  const apiKeyModalRef = useModalAccessibility(showCreateKeyModal, () => setShowCreateKeyModal(false));
  const deleteMemberModalRef = useModalAccessibility(showDeleteMemberModal, () => setShowDeleteMemberModal(false));

  if (!partner) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    // { id: 'api', label: 'API Keys', icon: Key }, // Hidden
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'commerce', label: 'Commerce', icon: ShoppingCart }
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
    console.log('Inviting member:', { email: inviteEmail, role: inviteRole });
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('viewer');
    setSavedMessage('Invitation sent successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleCreateKey = () => {
    console.log('Creating API key:', { name: newKeyName, permissions: newKeyPermissions });
    setShowCreateKeyModal(false);
    setNewKeyName('');
    setNewKeyPermissions(['read']);
    setSavedMessage('API key created successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const togglePermission = (permission: 'read' | 'write' | 'delete') => {
    setNewKeyPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleDeleteMember = (memberId: string) => {
    setDeleteMemberId(memberId);
    setShowDeleteMemberModal(true);
  };

  const confirmDeleteMember = () => {
    console.log('Removing team member:', deleteMemberId);
    setShowDeleteMemberModal(false);
    setDeleteMemberId(null);
    setSavedMessage('Team member removed successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', {
      display: { currency: displayCurrency, timezone: displayTimezone, language: displayLanguage },
      notifications: notifSettings,
      integration: { webhookUrl, syncFrequency },
    });
    setSavedMessage('Settings saved successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const memberToDelete = partner.teamMembers.find(m => m.id === deleteMemberId);

  return (
    <div>
      <BrandPageHeader
        title="Settings"
        subtitle="Manage your brand portal settings"
      />

      <div className="p-8">
        {/* Success Message */}
        {savedMessage && (
          <div className="mb-6 px-4 py-3 bg-success/10 text-success text-sm flex items-center gap-2">
            <Check size={16} />
            {savedMessage}
          </div>
        )}

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
                      {partner.brandLogo ? (
                        <img
                          src={partner.brandLogo}
                          alt={partner.brandName}
                          className="w-20 h-20 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-charcoal-deep text-ivory-cream flex items-center justify-center text-2xl font-display">
                          {partner.brandName.charAt(0)}
                        </div>
                      )}
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
                      <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                      >
                        <option value="EUR">EUR (&euro;)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (&pound;)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Timezone
                      </label>
                      <select
                        value={displayTimezone}
                        onChange={(e) => setDisplayTimezone(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                      >
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New York</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Language
                      </label>
                      <select
                        value={displayLanguage}
                        onChange={(e) => setDisplayLanguage(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                      >
                        <option value="en">English</option>
                        <option value="fr">Fran&ccedil;ais</option>
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
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-stone hover:text-error transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab — commented out for now */}
            {/* API Keys and Integration Settings section removed — will be enabled when API key management backend is ready */}
            {/*
                        <button
                          onClick={() => {
                            if (webhookUrl) {
                              navigator.clipboard.writeText(webhookUrl);
                              setSavedMessage('Webhook URL copied');
                              setTimeout(() => setSavedMessage(null), 2000);
                            }
                          }}
                          className="px-4 py-3 border border-sand text-stone hover:text-charcoal-deep hover:bg-parchment transition-colors"
                        >
                          <Link2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Sync Frequency
                      </label>
                      <select
                        value={syncFrequency}
                        onChange={(e) => setSyncFrequency(e.target.value as 'realtime' | 'hourly' | 'daily')}
                        className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                      >
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>
                </div>
            */}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      { key: 'lowStockAlerts' as const, label: 'Low Stock Alerts', description: 'Get notified when products fall below threshold' },
                      { key: 'orderUpdates' as const, label: 'Order Updates', description: 'Receive updates on new orders and changes' },
                      { key: 'demandSignals' as const, label: 'Demand Signals', description: 'Be notified of significant demand changes' },
                      { key: 'weeklyReports' as const, label: 'Weekly Reports', description: 'Receive weekly performance summaries' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-4 border-b border-sand/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                          <p className="text-xs text-taupe">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifSettings[item.key]}
                            onChange={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
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

            {/* Commerce Tab */}
            {activeTab === 'commerce' && (
              <div className="space-y-6">
                {/* Section A — Tax Configuration */}
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="text-sm font-medium text-charcoal-deep tracking-[0.05em] uppercase mb-1">
                    Tax Rules
                  </h2>
                  <p className="text-xs text-taupe mb-6">
                    Configure tax rates per region. Rates apply at checkout based on delivery destination.
                  </p>

                  <div className="space-y-4">
                    {commerceSettings.taxRules.map(rule => (
                      <div key={rule.id} className="flex items-center gap-4 py-3 border-b border-sand/30 last:border-0">
                        <button
                          onClick={() => updateTaxRule(rule.id, { isEnabled: !rule.isEnabled })}
                          className="cursor-pointer transition-colors"
                        >
                          {rule.isEnabled ? (
                            <ToggleRight size={24} className="text-gold-soft" />
                          ) : (
                            <ToggleLeft size={24} className="text-taupe" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal-deep">{rule.regionName}</p>
                          <p className="text-xs text-stone">{rule.countryCode}</p>
                        </div>
                        <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-parchment text-stone">
                          {rule.taxLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={rule.taxRate}
                            onChange={(e) => updateTaxRule(rule.id, { taxRate: Number(e.target.value) })}
                            className="w-20 border border-sand focus:border-charcoal-deep focus:outline-none px-2 py-1 text-sm text-right"
                          />
                          <span className="text-sm text-stone">%</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.includeInPrice}
                            onChange={() => updateTaxRule(rule.id, { includeInPrice: !rule.includeInPrice })}
                          />
                          <span className="text-xs text-stone whitespace-nowrap">Price includes tax</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-parchment border border-sand p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-taupe mt-0.5 shrink-0" />
                    <p className="text-xs text-stone">
                      Tax calculations apply to all orders from this brand. Ensure rates comply with local regulations in each region.
                    </p>
                  </div>
                </div>

                {/* Section B — Shipping Methods */}
                <div className="bg-white border border-sand/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-medium text-charcoal-deep tracking-[0.05em] uppercase mb-1">
                        Shipping Methods
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowNewShippingForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wide hover:bg-noir transition-colors"
                    >
                      <Plus size={14} />
                      Add Method
                    </button>
                  </div>

                  <div className="space-y-4">
                    {commerceSettings.shippingMethods.map(method => (
                      <div key={method.id} className="bg-white border border-sand/50 p-5 space-y-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateShippingMethod(method.id, { isEnabled: !method.isEnabled })}
                            className="cursor-pointer transition-colors"
                          >
                            {method.isEnabled ? (
                              <ToggleRight size={24} className="text-gold-soft" />
                            ) : (
                              <ToggleLeft size={24} className="text-taupe" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal-deep">{method.name}</p>
                          </div>
                          <span className="text-sm text-stone">{method.carrier}</span>
                          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-parchment text-stone">
                            {method.estimatedDays}
                          </span>
                          {method.id !== 'ship-complimentary' && (
                            <button
                              onClick={() => removeShippingMethod(method.id)}
                              className="text-error hover:text-error/80 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 pl-10">
                          <div>
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">
                              Base Rate
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-stone">&euro;</span>
                              <input
                                type="number"
                                value={method.baseRate}
                                onChange={(e) => updateShippingMethod(method.id, { baseRate: Number(e.target.value) })}
                                className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">
                              Free Above
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-stone">&euro;</span>
                              <input
                                type="number"
                                value={method.freeAbove}
                                onChange={(e) => updateShippingMethod(method.id, { freeAbove: Number(e.target.value) })}
                                className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm"
                              />
                            </div>
                            <p className="text-[10px] text-taupe mt-1">0 = never free</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Global Free Shipping Threshold */}
                  <div className="mt-6 pt-6 border-t border-sand/30">
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                      Global Free Shipping Threshold
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-stone">&euro;</span>
                      <input
                        type="number"
                        value={commerceSettings.freeShippingThreshold}
                        onChange={(e) => updateCommerceConfig({ freeShippingThreshold: Number(e.target.value) })}
                        className="w-40 border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-taupe mt-1">
                      Orders above this amount get free shipping regardless of method. Set 0 to disable.
                    </p>
                  </div>

                  {/* New Shipping Form */}
                  {showNewShippingForm && (
                    <div className="mt-6 bg-parchment border border-sand p-6 space-y-4">
                      <h3 className="text-sm font-medium text-charcoal-deep">New Shipping Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Method Name</label>
                          <input
                            type="text"
                            value={newShipping.name}
                            onChange={(e) => setNewShipping(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Priority Delivery"
                            className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm placeholder:text-taupe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Carrier</label>
                          <input
                            type="text"
                            value={newShipping.carrier}
                            onChange={(e) => setNewShipping(prev => ({ ...prev, carrier: e.target.value }))}
                            placeholder="e.g. FedEx"
                            className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm placeholder:text-taupe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Estimated Days</label>
                          <input
                            type="text"
                            value={newShipping.estimatedDays}
                            onChange={(e) => setNewShipping(prev => ({ ...prev, estimatedDays: e.target.value }))}
                            placeholder="e.g. 3-5 business days"
                            className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm placeholder:text-taupe"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Base Rate</label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-stone">&euro;</span>
                              <input
                                type="number"
                                value={newShipping.baseRate}
                                onChange={(e) => setNewShipping(prev => ({ ...prev, baseRate: Number(e.target.value) }))}
                                className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Free Above</label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-stone">&euro;</span>
                              <input
                                type="number"
                                value={newShipping.freeAbove}
                                onChange={(e) => setNewShipping(prev => ({ ...prev, freeAbove: Number(e.target.value) }))}
                                className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => {
                            setShowNewShippingForm(false);
                            setNewShipping({ name: '', carrier: '', estimatedDays: '', baseRate: 0, freeAbove: 0, isEnabled: true, regions: [] });
                          }}
                          className="px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            addShippingMethod(newShipping);
                            setNewShipping({ name: '', carrier: '', estimatedDays: '', baseRate: 0, freeAbove: 0, isEnabled: true, regions: [] });
                            setShowNewShippingForm(false);
                            setSavedMessage('Shipping method added');
                            setTimeout(() => setSavedMessage(null), 3000);
                          }}
                          disabled={!newShipping.name || !newShipping.carrier}
                          className="px-6 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Method
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section C — Returns & Policy */}
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="text-sm font-medium text-charcoal-deep tracking-[0.05em] uppercase mb-6">
                    Returns & Policy
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Return Window
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={commerceSettings.returnWindowDays}
                          onChange={(e) => updateCommerceConfig({ returnWindowDays: Number(e.target.value) })}
                          className="w-24 border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm"
                        />
                        <span className="text-sm text-stone">days</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Return Policy
                      </label>
                      <textarea
                        value={commerceSettings.returnPolicy}
                        onChange={(e) => updateCommerceConfig({ returnPolicy: e.target.value })}
                        rows={4}
                        className="w-full border border-sand focus:border-charcoal-deep focus:outline-none px-3 py-2 text-sm resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSavedMessage('Commerce settings saved');
                          setTimeout(() => setSavedMessage(null), 3000);
                        }}
                        className="px-6 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors"
                      >
                        Save Commerce Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button */}
            <div className="mt-8 flex justify-end">
              <PrimaryButton onClick={handleSaveSettings}>
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-noir/50 flex items-center justify-center z-50">
          <div
            ref={inviteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            className="bg-white w-full max-w-md mx-4"
          >
            <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
              <h2 id="invite-modal-title" className="font-display text-lg text-charcoal-deep">Invite Team Member</h2>
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
          <div
            ref={apiKeyModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-modal-title"
            className="bg-white w-full max-w-md mx-4"
          >
            <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
              <h2 id="api-key-modal-title" className="font-display text-lg text-charcoal-deep">Create API Key</h2>
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

      {/* Delete Team Member Confirmation Modal */}
      {showDeleteMemberModal && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-deep/40 backdrop-blur-sm"
            onClick={() => setShowDeleteMemberModal(false)}
          />
          <div
            ref={deleteMemberModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-member-modal-title"
            className="relative bg-white w-full max-w-md shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-error" />
              </div>
              <h3 id="delete-member-modal-title" className="font-display text-xl text-charcoal-deep mb-2">Remove Team Member</h3>
              <p className="text-sm text-stone">
                Are you sure you want to remove <span className="font-medium text-charcoal-deep">{memberToDelete.name}</span> from the team?
              </p>
              {memberToDelete.role === 'admin' && (
                <div className="mt-4 flex items-start gap-2 bg-warning/10 border border-warning/20 p-3 text-left">
                  <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning">
                    This member has <strong>admin</strong> privileges. Removing them will revoke all their access immediately.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteMemberModal(false)}
                className="flex-1 px-5 py-3 border border-sand text-xs tracking-wider uppercase text-charcoal-deep hover:bg-parchment transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMember}
                className="flex-1 px-5 py-3 bg-error text-white text-xs tracking-wider uppercase hover:bg-error/90 transition-colors"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
