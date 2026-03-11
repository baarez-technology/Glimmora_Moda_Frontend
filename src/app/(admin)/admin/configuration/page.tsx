'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ToggleLeft, Save, AlertTriangle, Settings } from 'lucide-react';
import {
  fetchFeatureFlags,
  toggleFeatureFlag,
  fetchPlatformConfig,
  updatePlatformConfig,
} from '@/services/admin.service';
import type { FeatureFlag, PlatformConfig } from '@/types/admin';

// ─── Toggle Switch Component ────────────────────────────────────────────────

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
        enabled ? 'bg-emerald-500' : 'bg-stone/30'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  );
}

// ─── Environment Badge ──────────────────────────────────────────────────────

function EnvironmentBadge({ env }: { env: FeatureFlag['environment'] }) {
  const styles: Record<string, string> = {
    all: 'bg-purple-100 text-purple-700',
    production: 'bg-emerald-100 text-emerald-700',
    staging: 'bg-amber-100 text-amber-700',
    development: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[env]}`}>
      {env}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ConfigurationPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [flagsRes, configRes] = await Promise.all([
        fetchFeatureFlags(),
        fetchPlatformConfig(),
      ]);
      if (flagsRes.data) setFlags(flagsRes.data);
      if (configRes.data) setConfig(configRes.data);
      setLoading(false);
    }
    load();
  }, []);

  // ── Toggle a feature flag ──────────────────────────────────────────────

  async function handleToggleFlag(id: string, currentEnabled: boolean) {
    const res = await toggleFeatureFlag(id, !currentEnabled);
    if (res.data) {
      setFlags(prev =>
        prev.map(f => (f.id === id ? { ...f, enabled: !currentEnabled, updatedAt: new Date().toISOString() } : f))
      );
    }
  }

  // ── Save platform config ──────────────────────────────────────────────

  async function handleSaveConfig() {
    if (!config) return;
    setSaving(true);
    setSaveMessage('');
    const res = await updatePlatformConfig(config);
    if (res.data) {
      setConfig(res.data);
      setSaveMessage('Configuration saved successfully.');
    } else {
      setSaveMessage('Failed to save configuration.');
    }
    setSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  }

  // ── Helpers for config updates ────────────────────────────────────────

  function updateConfig<K extends keyof PlatformConfig>(key: K, value: PlatformConfig[K]) {
    setConfig(prev => (prev ? { ...prev, [key]: value } : prev));
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <AdminPageHeader
          title="Platform Configuration"
          subtitle="Feature flags, system settings, and maintenance"
          breadcrumbs={[{ label: 'Configuration' }]}
        />
        <div className="max-w-[1400px] mx-auto px-8 py-12 text-center text-stone/50">
          <Settings size={32} className="mx-auto mb-3 animate-spin" />
          <p>Loading configuration...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Platform Configuration"
        subtitle="Feature flags, system settings, and maintenance"
        breadcrumbs={[{ label: 'Configuration' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left Column: Feature Flags ─────────────────────────────── */}
          <div>
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ToggleLeft size={20} className="text-charcoal-deep" />
                  <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                    Feature Flags
                  </h2>
                </div>
                <span className="text-xs text-stone/50 bg-parchment px-2.5 py-1 rounded-full">
                  {flags.length} flags
                </span>
              </div>

              <div className="space-y-1">
                {flags.map(flag => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between gap-4 py-4 border-b border-sand/30 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-charcoal-deep truncate">
                          {flag.name}
                        </span>
                        <EnvironmentBadge env={flag.environment} />
                      </div>
                      <p className="text-xs text-stone/50 leading-relaxed">
                        {flag.description}
                      </p>
                      <p className="text-[10px] text-stone/40 mt-1">
                        Updated {new Date(flag.updatedAt).toLocaleDateString()} by {flag.updatedBy}
                      </p>
                    </div>
                    <Toggle
                      enabled={flag.enabled}
                      onToggle={() => handleToggleFlag(flag.id, flag.enabled)}
                    />
                  </div>
                ))}

                {flags.length === 0 && (
                  <p className="text-sm text-stone/40 text-center py-8">
                    No feature flags configured.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column: Platform Settings ────────────────────────── */}
          <div className="space-y-6">
            {/* Maintenance Mode */}
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Maintenance Mode</h3>

              {config?.maintenanceMode && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Maintenance mode is <strong>active</strong>. The platform is currently
                    inaccessible to regular users.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-stone/70">Enable maintenance mode</span>
                <Toggle
                  enabled={config?.maintenanceMode ?? false}
                  onToggle={() => updateConfig('maintenanceMode', !config?.maintenanceMode)}
                />
              </div>

              {config?.maintenanceMode && (
                <div>
                  <label className="block text-xs text-stone/50 mb-1">Maintenance Message</label>
                  <textarea
                    value={config.maintenanceMessage}
                    onChange={e => updateConfig('maintenanceMessage', e.target.value)}
                    rows={3}
                    className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50 resize-none"
                    placeholder="We are performing scheduled maintenance..."
                  />
                </div>
              )}
            </div>

            {/* Registration & Onboarding */}
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-charcoal-deep mb-4">
                Registration &amp; Onboarding
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone/70">Enable registration</span>
                  <Toggle
                    enabled={config?.enableRegistration ?? true}
                    onToggle={() => updateConfig('enableRegistration', !config?.enableRegistration)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone/70">Enable brand onboarding</span>
                  <Toggle
                    enabled={config?.enableBrandOnboarding ?? true}
                    onToggle={() =>
                      updateConfig('enableBrandOnboarding', !config?.enableBrandOnboarding)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Security Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone/50 mb-1">
                    Min Password Length
                  </label>
                  <input
                    type="number"
                    min={6}
                    max={32}
                    value={config?.minimumPasswordLength ?? 8}
                    onChange={e =>
                      updateConfig('minimumPasswordLength', parseInt(e.target.value) || 8)
                    }
                    className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone/50 mb-1">
                    Session Timeout (min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={config?.sessionTimeout ?? 30}
                    onChange={e =>
                      updateConfig('sessionTimeout', parseInt(e.target.value) || 30)
                    }
                    className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                  />
                </div>
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Rate Limiting</h3>
              <div>
                <label className="block text-xs text-stone/50 mb-1">Requests per minute</label>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={config?.rateLimitPerMinute ?? 100}
                  onChange={e =>
                    updateConfig('rateLimitPerMinute', parseInt(e.target.value) || 100)
                  }
                  className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                />
              </div>
            </div>

            {/* Upload Settings */}
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Upload Settings</h3>
              <div>
                <label className="block text-xs text-stone/50 mb-1">Max upload size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config?.maxUploadSize ?? 10}
                  onChange={e =>
                    updateConfig('maxUploadSize', parseInt(e.target.value) || 10)
                  }
                  className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="bg-white border border-sand/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Currency</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-stone/50 mb-1">Default Currency</label>
                  <select
                    value={config?.defaultCurrency ?? 'INR'}
                    onChange={e => updateConfig('defaultCurrency', e.target.value)}
                    className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep bg-white focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone/50 mb-1">
                    Supported Currencies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config?.supportedCurrencies?.join(', ') ?? ''}
                    onChange={e =>
                      updateConfig(
                        'supportedCurrencies',
                        e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="INR, USD, EUR, GBP"
                    className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3">
              {saveMessage && (
                <span
                  className={`text-sm ${
                    saveMessage.includes('success') ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {saveMessage}
                </span>
              )}
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-charcoal-deep text-ivory-cream text-sm font-medium rounded-lg hover:bg-noir transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
