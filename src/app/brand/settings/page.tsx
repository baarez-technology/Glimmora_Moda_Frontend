'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Key,
  Code2,
  Users,
  Shield,
  Globe,
  Bell,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandSettingsPage() {
  const router = useRouter();
  const { isBrand, brandPartner, setUserRole, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  if (!isBrand || !brandPartner) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignOut = () => {
    setUserRole('standard');
    showToast('Signed out successfully', 'success');
    router.push('/auth/login');
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('ml_live_sk_a1b2c3d4e5f6g7h8i9j0...');
    setCopiedKey(true);
    showToast('API key copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const teamMembers = [
    { id: '1', name: 'Sophie Laurent', email: 'sophie@maisonlumiere.com', role: 'Account Director', status: 'active' },
    { id: '2', name: 'Marc Dubois', email: 'marc@maisonlumiere.com', role: 'Product Manager', status: 'active' },
    { id: '3', name: 'Elena Rossi', email: 'elena@maisonlumiere.com', role: 'Analytics Lead', status: 'active' },
    { id: '4', name: 'James Chen', email: 'james@maisonlumiere.com', role: 'Integration Specialist', status: 'pending' },
  ];

  const integrations = [
    { name: 'E-Commerce Platform', status: 'connected', lastSync: '2 hours ago' },
    { name: 'Inventory System', status: 'connected', lastSync: '15 minutes ago' },
    { name: 'CRM', status: 'connected', lastSync: '1 hour ago' },
    { name: 'Analytics Suite', status: 'pending', lastSync: null },
  ];

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Header */}
      <header className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="w-10 h-10 bg-noir border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
            >
              <ArrowLeft size={18} className="text-ivory-cream" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-ivory-cream">Brand Settings</h1>
              <p className="text-sm text-taupe">Account, integrations & team</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & API */}
          <div className="lg:col-span-2 space-y-8">
            {/* Brand Profile */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Building2 size={18} className="text-ivory-cream" />
                </div>
                <div>
                  <h2 className="text-ivory-cream font-medium">Brand Profile</h2>
                  <p className="text-xs text-taupe">Your brand information</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-sand/10">
                <img
                  src={brandPartner.brandLogo}
                  alt={brandPartner.brandName}
                  className="w-20 h-20 object-contain bg-charcoal-deep p-2"
                />
                <div>
                  <h3 className="font-display text-xl text-ivory-cream mb-1">{brandPartner.brandName}</h3>
                  <p className="text-sm text-taupe capitalize">{brandPartner.role} Partner</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Partner Name</label>
                  <div className="p-3 bg-charcoal-deep border border-sand/10 text-ivory-cream">
                    {brandPartner.name}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Email</label>
                  <div className="p-3 bg-charcoal-deep border border-sand/10 text-ivory-cream">
                    {brandPartner.email}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Role</label>
                  <div className="p-3 bg-charcoal-deep border border-sand/10 text-ivory-cream capitalize">
                    {brandPartner.role}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Permissions</label>
                  <div className="p-3 bg-charcoal-deep border border-sand/10">
                    <span className="text-green-400 text-sm">{brandPartner.permissions.length} active</span>
                  </div>
                </div>
              </div>

              <button className="mt-6 px-6 py-2.5 border border-sand/20 text-sand text-sm tracking-wider uppercase hover:border-sand/40 hover:text-ivory-cream transition-colors">
                Edit Profile
              </button>
            </section>

            {/* API Integration */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Key size={18} className="text-ivory-cream" />
                </div>
                <div>
                  <h2 className="text-ivory-cream font-medium">API Access</h2>
                  <p className="text-xs text-taupe">Headless integration credentials</p>
                </div>
              </div>

              {/* API Key */}
              <div className="mb-6">
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Live API Key</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-charcoal-deep border border-sand/10 font-mono text-sm">
                    {showApiKey ? (
                      <span className="text-ivory-cream">ml_live_sk_a1b2c3d4e5f6g7h8i9j0...</span>
                    ) : (
                      <span className="text-sand">••••••••••••••••••••••••••••</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="w-11 h-11 bg-charcoal-deep border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} className="text-sand" /> : <Eye size={16} className="text-sand" />}
                  </button>
                  <button
                    onClick={handleCopyApiKey}
                    className="w-11 h-11 bg-charcoal-deep border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
                  >
                    {copiedKey ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-sand" />}
                  </button>
                </div>
              </div>

              {/* Webhook URL */}
              <div className="mb-6">
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Webhook Endpoint</label>
                <div className="p-3 bg-charcoal-deep border border-sand/10 font-mono text-sm text-sand">
                  https://api.glimmora.com/webhooks/ml-12345
                </div>
              </div>

              {/* Integration Status */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-3">Connected Systems</label>
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${integration.status === 'connected' ? 'bg-green-400' : 'bg-gold-soft'}`} />
                        <span className="text-ivory-cream text-sm">{integration.name}</span>
                      </div>
                      <span className="text-xs text-taupe">
                        {integration.lastSync ? `Synced ${integration.lastSync}` : 'Setup required'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="px-6 py-2.5 bg-ivory-cream text-charcoal-deep text-sm tracking-wider uppercase hover:bg-ivory-cream/90 transition-colors">
                  View Documentation
                </button>
                <button className="px-6 py-2.5 border border-sand/20 text-sand text-sm tracking-wider uppercase hover:border-sand/40 hover:text-ivory-cream transition-colors">
                  Regenerate Key
                </button>
              </div>
            </section>

            {/* Widget Deployment */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Code2 size={18} className="text-ivory-cream" />
                </div>
                <div>
                  <h2 className="text-ivory-cream font-medium">Widget Deployment</h2>
                  <p className="text-xs text-taupe">Embed Glimmora on your site</p>
                </div>
              </div>

              <div className="p-4 bg-charcoal-deep border border-sand/10 mb-4">
                <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Embed Code</label>
                <pre className="font-mono text-xs text-sand overflow-x-auto">
{`<script src="https://widget.glimmora.com/v2.js"></script>
<script>
  Glimmora.init({
    brandId: '${brandPartner.brandId}',
    theme: 'dark',
    position: 'bottom-right'
  });
</script>`}
                </pre>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm text-sand">Widget Active</span>
                </div>
                <span className="text-xs text-taupe">Last deployed: 3 days ago</span>
              </div>
            </section>

            {/* Team Members */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                    <Users size={18} className="text-ivory-cream" />
                  </div>
                  <div>
                    <h2 className="text-ivory-cream font-medium">Team Members</h2>
                    <p className="text-xs text-taupe">{teamMembers.length} members</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-sand/20 text-sand text-sm hover:border-sand/40 hover:text-ivory-cream transition-colors">
                  Invite Member
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-charcoal-deep/50 border border-sand/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gold-soft/10 flex items-center justify-center">
                        <span className="text-gold-soft font-medium">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-ivory-cream">{member.name}</p>
                        <p className="text-xs text-taupe">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-0.5 bg-charcoal-deep text-xs text-sand">{member.role}</span>
                      <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-gold-soft'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Security */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Shield size={18} className="text-ivory-cream" />
                </div>
                <div>
                  <h2 className="text-ivory-cream font-medium">Security</h2>
                  <p className="text-xs text-taupe">Account protection</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5">
                  <span className="text-sm text-sand">Two-Factor Auth</span>
                  <span className="px-2 py-0.5 bg-green-400/10 text-green-400 text-xs">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5">
                  <span className="text-sm text-sand">SSO</span>
                  <span className="px-2 py-0.5 bg-green-400/10 text-green-400 text-xs">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5">
                  <span className="text-sm text-sand">IP Whitelist</span>
                  <span className="px-2 py-0.5 bg-sand/10 text-sand text-xs">3 IPs</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2.5 border border-sand/20 text-sand text-sm hover:border-sand/40 hover:text-ivory-cream transition-colors">
                Security Settings
              </button>
            </section>

            {/* Notifications */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Bell size={18} className="text-ivory-cream" />
                </div>
                <div>
                  <h2 className="text-ivory-cream font-medium">Notifications</h2>
                  <p className="text-xs text-taupe">Alert preferences</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5 cursor-pointer">
                  <span className="text-sm text-sand">Bespoke Requests</span>
                  <div className="w-10 h-5 bg-green-400/20 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-green-400 rounded-full" />
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5 cursor-pointer">
                  <span className="text-sm text-sand">Demand Alerts</span>
                  <div className="w-10 h-5 bg-green-400/20 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-green-400 rounded-full" />
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5 cursor-pointer">
                  <span className="text-sm text-sand">Weekly Reports</span>
                  <div className="w-10 h-5 bg-sand/20 rounded-full relative">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-sand rounded-full" />
                  </div>
                </label>
              </div>
            </section>

            {/* Resources */}
            <section className="bg-noir border border-sand/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Globe size={18} className="text-ivory-cream" />
                </div>
                <div>
                  <h2 className="text-ivory-cream font-medium">Resources</h2>
                  <p className="text-xs text-taupe">Help & documentation</p>
                </div>
              </div>

              <div className="space-y-2">
                <a href="#" className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5 hover:border-sand/20 transition-colors group">
                  <span className="text-sm text-sand group-hover:text-ivory-cream transition-colors">API Documentation</span>
                  <ExternalLink size={14} className="text-taupe" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5 hover:border-sand/20 transition-colors group">
                  <span className="text-sm text-sand group-hover:text-ivory-cream transition-colors">Brand Guidelines</span>
                  <ExternalLink size={14} className="text-taupe" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-charcoal-deep/50 border border-sand/5 hover:border-sand/20 transition-colors group">
                  <span className="text-sm text-sand group-hover:text-ivory-cream transition-colors">Support Portal</span>
                  <ExternalLink size={14} className="text-taupe" />
                </a>
              </div>
            </section>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full p-4 bg-red-400/10 border border-red-400/20 text-red-400 flex items-center justify-center gap-2 hover:bg-red-400/20 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm tracking-wider uppercase">Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
