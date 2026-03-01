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
  EyeOff,
  ClipboardList,
  Radio,
  Layers
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function UHNIDashboardPage() {
  const {
    concierge,
    sourcingRequests,
    bespokeOrders,
    autonomousSettings,
    autonomousActivity,
    wardrobe,
    showToast
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Compute metrics
  const wardrobeValue = wardrobe.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  const activeSourcing = sourcingRequests.filter(r => r.status !== 'delivered' && r.status !== 'acquired').length;
  const activeBespoke = bespokeOrders.filter(o => o.status !== 'complete').length;

  const quickActions = [
    { href: '/uhni/concierge', icon: MessageCircle, label: 'Concierge', description: 'Personal luxury advisor' },
    { href: '/uhni/sourcing', icon: Search, label: 'Sourcing', description: 'Global item search' },
    { href: '/uhni/bespoke', icon: Scissors, label: 'Bespoke', description: 'Custom orders' },
    { href: '/uhni/autonomous', icon: Bot, label: 'Autonomous', description: 'AI-powered shopping' },
    { href: '/uhni/private-collections', icon: Lock, label: 'Private Collections', description: 'Exclusive access' },
    { href: '/uhni/pricing', icon: DollarSign, label: 'Pricing', description: 'Negotiations & offers' },
    { href: '/uhni/global-sourcing', icon: Globe, label: 'Global Network', description: 'Worldwide availability' },
    { href: '/uhni/private-shopping', icon: ShoppingBag, label: 'Private Shopping', description: 'VIP events' },
    { href: '/uhni/events', icon: Calendar, label: 'Events', description: 'Exclusive experiences' },
    { href: '/uhni/heritage-archive', icon: Crown, label: 'Heritage', description: 'Brand archives' },
    { href: '/uhni/intelligence', icon: Sparkles, label: 'Intelligence', description: 'AI insights' },
    { href: '/uhni/zero-ui', icon: Layers, label: 'Zero-UI Commerce', description: 'Invisible shopping' },
    { href: '/uhni/invisible-commerce', icon: EyeOff, label: 'Invisible Commerce', description: 'Discreet transactions' },
    { href: '/uhni/concierge-tasks', icon: ClipboardList, label: 'Concierge Tasks', description: 'Task management' },
    { href: '/uhni/silent-commerce', icon: Radio, label: 'Silent Commerce', description: 'Ambient awareness' },
    { href: '/uhni/body-twin', icon: User, label: 'Body Twin', description: 'Fit profile & measurements' },
    { href: '/uhni/wardrobe', icon: ShoppingBag, label: 'Wardrobe', description: 'Your private collection' },
    { href: '/uhni/calendar', icon: Calendar, label: 'Style Calendar', description: 'Event outfit planning' },
    { href: '/uhni/discover', icon: Search, label: 'Discover', description: 'Browse & recommendations' },
    { href: '/uhni/collections', icon: Layers, label: 'Collections', description: 'Curated selections' },
    { href: '/uhni/stories', icon: Crown, label: 'Stories', description: 'Heritage & craft narratives' }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-16">
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={20} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Command Center
              </span>
            </div>
            <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
              Welcome Back
            </h1>
            <p className="text-sand text-lg max-w-xl">
              Your personal luxury management dashboard. Every service at your fingertips.
            </p>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <div className="bg-white p-5 text-center">
            <p className="font-display text-2xl text-charcoal-deep">&euro;{wardrobeValue.toLocaleString()}</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Wardrobe Value</p>
          </div>
          <div className="bg-white p-5 text-center">
            <p className="font-display text-2xl text-charcoal-deep">{activeSourcing}</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Active Sourcing</p>
          </div>
          <div className="bg-white p-5 text-center">
            <p className="font-display text-2xl text-charcoal-deep">{activeBespoke}</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Bespoke Orders</p>
          </div>
          <div className="bg-white p-5 text-center">
            <p className="font-display text-lg text-charcoal-deep truncate">{concierge ? concierge.name.split(' ')[0] : '—'}</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Concierge</p>
          </div>
          <div className="bg-white p-5 text-center">
            <p className="font-display text-2xl text-charcoal-deep">
              &euro;{(autonomousSettings?.monthlyBudget ? (autonomousSettings.monthlyBudget / 1000).toFixed(0) : '0')}K
            </p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Auto Budget</p>
          </div>
          <div className="bg-white p-5 text-center">
            <p className="font-display text-2xl text-charcoal-deep">{wardrobe.length}</p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mt-1">Wardrobe Items</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickActions.map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white p-6 border border-sand/30 hover:border-charcoal-deep transition-all duration-300"
              >
                <action.icon size={24} className="text-charcoal-deep mb-3 group-hover:text-gold-soft transition-colors" />
                <h3 className="font-display text-lg text-charcoal-deep mb-1">{action.label}</h3>
                <p className="text-xs text-stone">{action.description}</p>
                <ArrowRight size={14} className="text-stone mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-sand/30">
          <div className="px-8 py-6 border-b border-sand/30">
            <h2 className="font-display text-xl text-charcoal-deep">Recent Activity</h2>
          </div>
          <div className="divide-y divide-sand/30">
            {sourcingRequests.slice(0, 2).map(request => (
              <div key={request.id} className="px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                    <Search size={18} className="text-stone" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep">{request.title}</p>
                    <p className="text-xs text-stone capitalize">{request.status.replace('_', ' ')}</p>
                  </div>
                </div>
                <Link
                  href="/uhni/sourcing"
                  className="text-xs text-stone hover:text-charcoal-deep transition-colors tracking-wider uppercase"
                >
                  View All
                </Link>
              </div>
            ))}
            {bespokeOrders.slice(0, 2).map(order => (
              <div key={order.id} className="px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                    <Scissors size={18} className="text-stone" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep">{order.title}</p>
                    <p className="text-xs text-stone capitalize">{order.status.replace('_', ' ')}</p>
                  </div>
                </div>
                <Link
                  href="/uhni/bespoke"
                  className="text-xs text-stone hover:text-charcoal-deep transition-colors tracking-wider uppercase"
                >
                  View All
                </Link>
              </div>
            ))}
            {autonomousActivity.slice(0, 2).map(activity => (
              <div key={activity.id} className="px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                    <Bot size={18} className="text-stone" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep">{activity.product.name}</p>
                    <p className="text-xs text-stone capitalize">{activity.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <Link
                  href="/uhni/autonomous"
                  className="text-xs text-stone hover:text-charcoal-deep transition-colors tracking-wider uppercase"
                >
                  View All
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Concierge Banner */}
        {concierge && (
          <div className="mt-8 bg-charcoal-deep p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gold-soft/20 rounded-full flex items-center justify-center">
                <MessageCircle size={24} className="text-gold-soft" />
              </div>
              <div>
                <p className="text-ivory-cream font-display text-lg">{concierge.name}</p>
                <p className="text-sand text-sm">{concierge.title} — {concierge.specialties.join(', ')}</p>
              </div>
            </div>
            <Link
              href="/uhni/concierge"
              className="px-6 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors text-sm tracking-wider uppercase"
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
