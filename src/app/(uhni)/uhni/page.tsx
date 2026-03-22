'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  Search,
  Scissors,
  ShoppingBag,
  Calendar,
  Bot,
  MessageCircle,
  Globe,
  Lock,
  User,
  ArrowRight,
  DollarSign,
  Sparkles,
  Radio,
  Layers,
  Heart,
  BookOpen,
  Star,
  Package,
  Clock,
  MapPin,
  Settings,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TierBadge } from '@/components/shared/TierBadge';
import { getTierDefinition, getBenefitsForTier } from '@/lib/pricing-tiers';

// Nav groups — shown in left column, same pattern as consumer profile Quick Access
const navGroups = [
  {
    label: 'Concierge',
    items: [
      { href: '/uhni/concierge', icon: MessageCircle, title: 'Personal Concierge', subtitle: 'Chat, tasks & appointments' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/uhni/sourcing', icon: Search, title: 'Sourcing', subtitle: 'Global item search' },
      { href: '/uhni/bespoke', icon: Scissors, title: 'Bespoke', subtitle: 'Custom commissions' },
      { href: '/uhni/pricing', icon: DollarSign, title: 'Private Pricing', subtitle: 'Negotiations & offers' },
      { href: '/uhni/private-collections', icon: Lock, title: 'Private Collections', subtitle: 'Invitation-only access' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { href: '/uhni/wardrobe', icon: ShoppingBag, title: 'Wardrobe', subtitle: 'Your private collection' },
      { href: '/uhni/body-twin', icon: User, title: 'Body Twin', subtitle: 'Fit profile & measurements' },
      { href: '/uhni/calendar', icon: Calendar, title: 'Style Calendar', subtitle: 'Event outfit planning' },
      { href: '/uhni/wishlist', icon: Heart, title: 'Wishlist', subtitle: 'Items you are watching' },
      { href: '/uhni/cart', icon: Package, title: 'Cart', subtitle: 'Ready to acquire' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/uhni/autonomous', icon: Bot, title: 'Autonomous Commerce', subtitle: 'AI shopping, budgets & automation' },
      { href: '/uhni/intelligence', icon: Sparkles, title: 'Intelligence', subtitle: 'AI insights on your taste' },
      { href: '/uhni/global-sourcing', icon: Globe, title: 'Global Sourcing', subtitle: 'Worldwide availability' },
      { href: '/uhni/silent-commerce', icon: Radio, title: 'Silent Commerce', subtitle: 'Awareness & discreet transactions' },
    ],
  },
  {
    label: 'Heritage',
    items: [
      { href: '/uhni/heritage-archive', icon: BookOpen, title: 'Heritage & Stories', subtitle: 'Archives, timelines & narratives' },
      { href: '/uhni/events', icon: Star, title: 'Events & Shopping', subtitle: 'Experiences & private shopping' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/profile/orders', icon: Package, title: 'My Orders', subtitle: 'Order history & tracking' },
      { href: '/profile/addresses', icon: MapPin, title: 'Addresses', subtitle: 'Manage delivery addresses' },
      { href: '/profile/reviews', icon: Star, title: 'My Reviews', subtitle: 'Reviews & ratings' },
      { href: '/profile/settings', icon: Settings, title: 'Account Settings', subtitle: 'Profile, password & privacy' },
    ],
  },
];

export default function UHNIDashboardPage() {
  const {
    concierge,
    sourcingRequests,
    bespokeOrders,
    autonomousSettings,
    autonomousActivity,
    wardrobe,
    conciergeAppointments,
    pricingTier,
    tierSince,
    priceAlerts,
    fashionIdentity,
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const wardrobeValue = wardrobe.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  const activeSourcing = sourcingRequests.filter(r => r.status !== 'delivered' && r.status !== 'acquired').length;
  const activeBespoke = bespokeOrders.filter(o => o.status !== 'complete').length;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero — matches consumer profile hero */}
      <section className="relative bg-charcoal-deep py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold-soft/5 to-transparent" />
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 relative">
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={13} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/60">UHNI Command Centre</span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-2">
              Welcome Back
            </h1>
            <p className="text-taupe text-sm">Your private luxury management dashboard.</p>
          </div>
        </div>
      </section>

      {/* Main content — 3-col grid matching consumer profile */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className={`grid lg:grid-cols-3 gap-12 lg:gap-16 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* ── Left column: UHNI navigation ── */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-[108px] lg:max-h-[calc(100vh-124px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                Quick Access
              </span>

              {navGroups.map((group) => (
                <div key={group.label} className="mb-6">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-taupe/60 mb-1 pl-5">{group.label}</p>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between p-4 border-b border-sand/50 hover:bg-parchment transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 flex items-center justify-center bg-parchment group-hover:bg-ivory-cream transition-colors flex-shrink-0">
                          <item.icon size={16} className="text-stone" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.title}</p>
                          <p className="text-xs text-taupe">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              ))}
              </div>
            </div>

            {/* ── Right column: metrics + activity ── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Metric cards */}
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-5">Overview</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-sand/50 p-5">
                    <p className="font-display text-2xl text-charcoal-deep">&euro;{wardrobeValue.toLocaleString()}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Wardrobe Value</p>
                  </div>
                  <div className="bg-white border border-sand/50 p-5">
                    <p className="font-display text-2xl text-charcoal-deep">{activeSourcing}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Active Sourcing</p>
                  </div>
                  <div className="bg-white border border-sand/50 p-5">
                    <p className="font-display text-2xl text-charcoal-deep">{activeBespoke}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Bespoke Orders</p>
                  </div>
                  <div className="bg-white border border-sand/50 p-5">
                    <p className="font-display text-lg text-charcoal-deep truncate">{concierge ? concierge.name.split(' ')[0] : '—'}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Concierge</p>
                  </div>
                  <div className="bg-white border border-sand/50 p-5">
                    <p className="font-display text-2xl text-charcoal-deep">
                      &euro;{autonomousSettings?.monthlyBudget ? (autonomousSettings.monthlyBudget / 1000).toFixed(0) : '0'}K
                    </p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Auto Budget</p>
                  </div>
                  <div className="bg-white border border-sand/50 p-5">
                    <p className="font-display text-2xl text-charcoal-deep">{wardrobe.length}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Wardrobe Items</p>
                  </div>
                </div>
              </div>

              {/* UHNI Tier Banner */}
              <div className="bg-gradient-to-r from-charcoal-deep to-charcoal-warm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-soft/5 to-transparent" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <TierBadge tier={pricingTier} size="lg" />
                    <div>
                      <p className="text-ivory-cream text-sm font-medium">
                        {getTierDefinition(pricingTier).tagline}
                      </p>
                      <p className="text-taupe text-xs">
                        Member since {new Date(tierSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        {priceAlerts.length > 0 && ` · ${priceAlerts.filter(a => a.isActive).length} active price alerts`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Style Profile */}
              {fashionIdentity && (fashionIdentity.occasions.length > 0 || fashionIdentity.aesthetics.length > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">Your Preferences</span>
                      <h3 className="font-display text-xl text-charcoal-deep">Style Profile</h3>
                    </div>
                    <Link
                      href="/profile/preferences"
                      className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                    >
                      Update
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fashionIdentity.occasions.length > 0 && (
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Occasions</p>
                        <div className="flex flex-wrap gap-2">
                          {fashionIdentity.occasions.map(occ => (
                            <span key={occ} className="px-3 py-1.5 border border-sand text-xs text-charcoal-deep">
                              {occ}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {fashionIdentity.aesthetics.length > 0 && (
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Aesthetics</p>
                        <div className="flex flex-wrap gap-2">
                          {fashionIdentity.aesthetics.map(aes => (
                            <span key={aes} className="px-3 py-1.5 border border-sand text-xs text-charcoal-deep">
                              {aes}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent activity */}
              {(sourcingRequests.length > 0 || bespokeOrders.length > 0 || autonomousActivity.length > 0) && (
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-5">Recent Activity</span>
                  <div className="bg-white border border-sand/50 divide-y divide-sand/50">
                    {sourcingRequests.slice(0, 2).map(req => (
                      <div key={req.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-parchment flex items-center justify-center flex-shrink-0">
                            <Search size={14} className="text-stone" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{req.title}</p>
                            <p className="text-xs text-taupe capitalize">{req.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Link href="/uhni/sourcing" className="text-xs text-stone hover:text-charcoal-deep transition-colors tracking-wider uppercase">View</Link>
                      </div>
                    ))}
                    {bespokeOrders.slice(0, 2).map(order => (
                      <div key={order.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-parchment flex items-center justify-center flex-shrink-0">
                            <Scissors size={14} className="text-stone" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{order.title}</p>
                            <p className="text-xs text-taupe capitalize">{order.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Link href="/uhni/bespoke" className="text-xs text-stone hover:text-charcoal-deep transition-colors tracking-wider uppercase">View</Link>
                      </div>
                    ))}
                    {autonomousActivity.slice(0, 2).map(activity => (
                      <div key={activity.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-parchment flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-stone" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{activity.product.name}</p>
                            <p className="text-xs text-taupe capitalize">{activity.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <Link href="/uhni/autonomous" className="text-xs text-stone hover:text-charcoal-deep transition-colors tracking-wider uppercase">View</Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concierge card */}
              {concierge && (
                <div className="bg-charcoal-deep p-8">
                  <div className="flex items-center gap-2 mb-5">
                    <Crown size={12} className="text-gold-soft" />
                    <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/60">Your Personal Concierge</span>
                  </div>

                  {/* Next appointment preview */}
                  {(conciergeAppointments || []).filter(a =>
                    a.status !== 'cancelled' &&
                    new Date(a.scheduledAt || `${a.date}T${a.time}`) > new Date()
                  ).length > 0 && (
                    <div className="mb-4 p-3 bg-gold-soft/10 border border-gold-soft/20 text-xs">
                      <div className="flex items-center gap-2 text-gold-soft">
                        <Clock size={12} />
                        <span className="font-medium">Next appointment — </span>
                        <span className="text-sand">
                          {new Date(
                            (conciergeAppointments || [])
                              .filter(a =>
                                a.status !== 'cancelled' &&
                                new Date(a.scheduledAt || `${a.date}T${a.time}`) > new Date()
                              )
                              .sort((a, b) =>
                                new Date(a.scheduledAt || `${a.date}T${a.time}`).getTime() -
                                new Date(b.scheduledAt || `${b.date}T${b.time}`).getTime()
                              )[0]?.scheduledAt ||
                            `${(conciergeAppointments || [])
                              .filter(a =>
                                a.status !== 'cancelled' &&
                                new Date(a.scheduledAt || `${a.date}T${a.time}`) > new Date()
                              )
                              .sort((a, b) =>
                                new Date(a.scheduledAt || `${a.date}T${a.time}`).getTime() -
                                new Date(b.scheduledAt || `${b.date}T${b.time}`).getTime()
                              )[0]?.date}T${(conciergeAppointments || [])
                              .filter(a =>
                                a.status !== 'cancelled' &&
                                new Date(a.scheduledAt || `${a.date}T${a.time}`) > new Date()
                              )
                              .sort((a, b) =>
                                new Date(a.scheduledAt || `${a.date}T${a.time}`).getTime() -
                                new Date(b.scheduledAt || `${b.date}T${b.time}`).getTime()
                              )[0]?.time}`
                          ).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short',
                            day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gold-soft/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={18} className="text-gold-soft" />
                      </div>
                      <div>
                        <p className="text-ivory-cream font-display text-base">{concierge.name}</p>
                        <p className="text-taupe text-sm">{concierge.title}</p>
                      </div>
                    </div>
                    <Link
                      href="/uhni/concierge"
                      className="flex-shrink-0 px-5 py-2.5 bg-gold-soft/15 text-gold-soft hover:bg-gold-soft/25 transition-colors text-xs tracking-wider uppercase"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
