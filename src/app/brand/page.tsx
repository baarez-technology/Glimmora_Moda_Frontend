'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  BarChart3,
  Package,
  Gem,
  MapPin,
  Bot,
  Settings,
  LogOut,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandDashboardPage() {
  const router = useRouter();
  const {
    isBrand,
    brandPartner,
    brandDashboardStats,
    brandBespokeRequests,
    setUserRole,
    showToast
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  const handleSignOut = () => {
    setUserRole('standard');
    showToast('Signed out successfully', 'info');
    router.push('/');
  };

  if (!isBrand || !brandPartner || !brandDashboardStats) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingRequests = brandBespokeRequests.filter(r => r.status === 'pending' || r.status === 'reviewing').length;

  const navItems = [
    {
      href: '/brand/analytics',
      icon: BarChart3,
      title: 'Intelligence Dashboard',
      subtitle: 'Demand signals & regional insights',
      stat: `${brandDashboardStats.averageDemandScore}% avg demand`
    },
    {
      href: '/brand/products',
      icon: Package,
      title: 'Product Management',
      subtitle: 'Inventory & availability',
      stat: `${brandDashboardStats.activeProducts} active products`
    },
    {
      href: '/brand/collections',
      icon: Layers,
      title: 'Collections',
      subtitle: 'Seasonal & core collections',
      stat: `${brandDashboardStats.activeCollections} active`
    },
    {
      href: '/brand/bespoke',
      icon: Gem,
      title: 'Bespoke Requests',
      subtitle: 'UHNI client commissions',
      stat: `${pendingRequests} pending`,
      highlight: pendingRequests > 0
    },
    {
      href: '/brand/boutiques',
      icon: MapPin,
      title: 'Boutique Intelligence',
      subtitle: 'Performance heatmap',
      stat: `${brandDashboardStats.boutiqueCount} boutiques`
    },
    {
      href: '/brand/agi',
      icon: Bot,
      title: 'AGI Configuration',
      subtitle: 'Brand Concierge settings',
      stat: 'Active'
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Header */}
      <header className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {brandPartner.brandLogo ? (
                <img
                  src={brandPartner.brandLogo}
                  alt={brandPartner.brandName}
                  className="h-12 w-12 object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                  <Building2 size={24} className="text-ivory-cream" />
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl text-ivory-cream">{brandPartner.brandName}</h1>
                <p className="text-sm text-taupe">Partner Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-ivory-cream font-medium">{brandPartner.name}</p>
                <p className="text-xs text-taupe capitalize">{brandPartner.role}</p>
              </div>
              {brandPartner.avatar && (
                <img
                  src={brandPartner.avatar}
                  alt={brandPartner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Welcome Section */}
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.5em] uppercase text-sand block mb-3">
            Welcome back
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-4">
            {brandPartner.brandName} Intelligence Hub
          </h2>
          <p className="text-taupe max-w-2xl">
            Monitor demand signals, manage your product portfolio, respond to bespoke requests,
            and configure your brand's AGI presence.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">Revenue</span>
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <p className="font-display text-2xl text-ivory-cream">
              €{(brandDashboardStats.totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-green-400">+{brandDashboardStats.revenueChange}% vs last month</p>
          </div>

          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">Demand Score</span>
              <BarChart3 size={16} className="text-sand" />
            </div>
            <p className="font-display text-2xl text-ivory-cream">{brandDashboardStats.averageDemandScore}</p>
            <p className="text-xs text-taupe">Average across products</p>
          </div>

          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">Top Boutique</span>
              <MapPin size={16} className="text-sand" />
            </div>
            <p className="font-display text-lg text-ivory-cream truncate">{brandDashboardStats.topPerformingBoutique}</p>
            <p className="text-xs text-taupe">Highest performance</p>
          </div>

          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-taupe">Pending</span>
              <Clock size={16} className={pendingRequests > 0 ? "text-gold-soft" : "text-sand"} />
            </div>
            <p className="font-display text-2xl text-ivory-cream">{pendingRequests}</p>
            <p className="text-xs text-taupe">Bespoke requests</p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group block p-6 border transition-all duration-300 ${
                item.highlight
                  ? 'bg-gold-soft/5 border-gold-soft/30 hover:border-gold-soft'
                  : 'bg-noir border-sand/10 hover:border-sand/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 flex items-center justify-center ${
                  item.highlight ? 'bg-gold-soft/10' : 'bg-ivory-cream/5 border border-ivory-cream/10'
                }`}>
                  <item.icon size={20} className={item.highlight ? "text-gold-soft" : "text-ivory-cream"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display text-lg text-ivory-cream">{item.title}</h3>
                    <ArrowRight size={16} className="text-taupe group-hover:text-ivory-cream group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-taupe mb-2">{item.subtitle}</p>
                  <span className={`text-xs ${item.highlight ? 'text-gold-soft' : 'text-sand'}`}>
                    {item.stat}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Bespoke Requests */}
          <div className="bg-noir border border-sand/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg text-ivory-cream">Recent Bespoke Requests</h3>
              <Link href="/brand/bespoke" className="text-xs text-sand hover:text-ivory-cream transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {brandBespokeRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-start gap-4 p-4 bg-charcoal-deep/50 border border-sand/5">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    request.status === 'pending' ? 'bg-gold-soft' :
                    request.status === 'reviewing' ? 'bg-blue-400' :
                    request.status === 'in_production' ? 'bg-green-400' :
                    'bg-sand'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory-cream font-medium truncate">{request.title}</p>
                    <p className="text-xs text-taupe capitalize mt-1">{request.type.replace(/_/g, ' ')} • {request.status.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs text-sand">
                    €{request.budget.min.toLocaleString()} - €{request.budget.max.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-noir border border-sand/10 p-6">
            <h3 className="font-display text-lg text-ivory-cream mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/brand/settings"
                className="flex items-center gap-4 p-4 bg-charcoal-deep/50 border border-sand/5 hover:border-sand/20 transition-colors"
              >
                <Settings size={18} className="text-sand" />
                <div className="flex-1">
                  <p className="text-ivory-cream">Brand Settings</p>
                  <p className="text-xs text-taupe">Profile, integrations, team</p>
                </div>
                <ArrowRight size={16} className="text-taupe" />
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 p-4 bg-charcoal-deep/50 border border-sand/5 hover:border-red-500/30 transition-colors text-left"
              >
                <LogOut size={18} className="text-red-400" />
                <div className="flex-1">
                  <p className="text-ivory-cream">Sign Out</p>
                  <p className="text-xs text-taupe">End your session</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
