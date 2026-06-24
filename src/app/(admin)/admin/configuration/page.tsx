'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AlertTriangle, Settings, Save, Check } from 'lucide-react';
import {
  fetchPlatformConfig,
  updatePlatformConfig,
} from '@/services/admin.service';
import { savePlatformConfig } from '@/lib/platform-config';
import type { PlatformConfig } from '@/services/admin.service';

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ConfigurationPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const configRes = await fetchPlatformConfig();
      if (configRes) setConfig(configRes);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSaveConfig() {
    if (!config) return;
    setSaving(true);
    setSaveMessage('');
    const updated = await updatePlatformConfig(config);
    if (updated) {
      setConfig(updated);
      // Persist to localStorage so other portals (consumer, brand) can read it
      savePlatformConfig(updated);
      setSaveMessage('saved');
    } else {
      setSaveMessage('error');
    }
    setSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  }

  function updateConfig<K extends keyof PlatformConfig>(key: K, value: PlatformConfig[K]) {
    setConfig(prev => (prev ? { ...prev, [key]: value } : prev));
  }

  if (loading) {
    return (
      <>
        <AdminPageHeader
          title="Platform Configuration"
          subtitle="System settings, security, and maintenance"
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
        subtitle="System settings, security, and maintenance"
        breadcrumbs={[{ label: 'Configuration' }]}
      />

      <div className="max-w-[900px] mx-auto px-8 py-8 space-y-6">

        {/* Maintenance Mode */}
        <div className="bg-white border border-sand/50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Maintenance Mode</h3>

          {config?.maintenanceMode && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Maintenance mode is <strong>active</strong>. The platform is currently inaccessible to regular users.
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-charcoal-deep">Enable consumer registration</span>
                <p className="text-xs text-stone/50 mt-0.5">Allow new consumers and UHNI users to create accounts</p>
              </div>
              <Toggle
                enabled={config?.enableRegistration ?? true}
                onToggle={() => updateConfig('enableRegistration', !config?.enableRegistration)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-charcoal-deep">Enable brand onboarding</span>
                <p className="text-xs text-stone/50 mt-0.5">Allow new brands to register as partners</p>
              </div>
              <Toggle
                enabled={config?.enableBrandOnboarding ?? true}
                onToggle={() => updateConfig('enableBrandOnboarding', !config?.enableBrandOnboarding)}
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-sand/50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Security Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-stone/50 mb-1">Minimum Password Length</label>
              <input
                type="number"
                min={6}
                max={32}
                value={config?.minimumPasswordLength ?? 8}
                onChange={e => updateConfig('minimumPasswordLength', parseInt(e.target.value) || 8)}
                className="w-full border border-sand/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
              />
              <p className="text-[10px] text-stone/40 mt-1">Recommended: 8 or higher</p>
            </div>
            <div>
              <label className="block text-xs text-stone/50 mb-1">Session Timeout (seconds)</label>
              <input
                type="number"
                min={300}
                max={86400}
                value={config?.sessionTimeout ?? 3600}
                onChange={e => updateConfig('sessionTimeout', parseInt(e.target.value) || 3600)}
                className="w-full border border-sand/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
              />
              <p className="text-[10px] text-stone/40 mt-1">3600 = 1 hour. Max 86400 (24 hours)</p>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="bg-white border border-sand/50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Rate Limiting</h3>
          <div>
            <label className="block text-xs text-stone/50 mb-1">Maximum API requests per minute (per user)</label>
            <input
              type="number"
              min={10}
              max={10000}
              value={config?.rateLimitPerMinute ?? 120}
              onChange={e => updateConfig('rateLimitPerMinute', parseInt(e.target.value) || 120)}
              className="w-full sm:w-64 border border-sand/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
            />
            <p className="text-[10px] text-stone/40 mt-1">Prevents API abuse. 120 is a good default for luxury platform traffic.</p>
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
              max={500}
              value={config?.maxUploadSize ?? 100}
              onChange={e => updateConfig('maxUploadSize', parseInt(e.target.value) || 100)}
              className="w-full sm:w-64 border border-sand/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
            />
            <p className="text-[10px] text-stone/40 mt-1">Applies to product images, brand logos, and import files</p>
          </div>
        </div>

        {/* Currency */}
        <div className="bg-white border border-sand/50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-charcoal-deep mb-4">Currency</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-stone/50 mb-1">Default Currency</label>
              <select
                value={config?.defaultCurrency ?? 'USD'}
                onChange={e => updateConfig('defaultCurrency', e.target.value)}
                className="w-full border border-sand/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
              >
                {['USD', 'EUR', 'GBP', 'INR', 'AED', 'CHF', 'JPY', 'CNY', 'AUD', 'CAD'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-[10px] text-stone/40 mt-1">Fallback currency for users who haven&apos;t set a preference</p>
            </div>
            <div>
              <label className="block text-xs text-stone/50 mb-1">Supported Currencies</label>
              <input
                type="text"
                value={(config?.supportedCurrencies ?? []).join(', ')}
                onChange={e =>
                  updateConfig(
                    'supportedCurrencies',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                className="w-full border border-sand/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft/50"
                placeholder="USD, EUR, GBP, INR"
              />
              <p className="text-[10px] text-stone/40 mt-1">Comma-separated list of currencies available in user settings</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {saveMessage === 'saved' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <Check size={16} /> Configuration saved successfully
              </span>
            )}
            {saveMessage === 'error' && (
              <span className="text-sm text-red-600">Failed to save configuration</span>
            )}
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-widest uppercase hover:bg-noir transition-colors disabled:opacity-50 rounded-lg"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </>
  );
}
