'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, ShoppingBag, Settings, ArrowRight, Calendar, Clock, MapPin, Package, Crown, Zap, Search, Gem, Phone, Mail, MessageCircle, Layers } from 'lucide-react';
import { mockUser } from '@/data/mock-data';
import { useApp } from '@/context/AppContext';

export default function ProfilePage() {
  const { considerations, wardrobe, calendarEvents, orders, isUHNI, concierge, sourcingRequests, bespokeOrders, autonomousSettings } = useApp();
  const user = mockUser;
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Standard nav items for all users
  const baseNavItems = [
    {
      href: '/wardrobe',
      icon: ShoppingBag,
      title: 'Digital Wardrobe',
      subtitle: `${wardrobe.length} pieces`,
    },
    {
      href: '/consideration',
      icon: Heart,
      title: 'Considerations',
      subtitle: `${considerations.length} items`,
    },
    {
      href: '/profile/silent-cart',
      icon: Layers,
      title: 'Silent Cart',
      subtitle: 'Curated for you',
    },
    {
      href: '/profile/orders',
      icon: Package,
      title: 'Orders',
      subtitle: orders.length > 0 ? `${orders.length} orders` : 'View history',
    },
    {
      href: '/calendar',
      icon: Calendar,
      title: 'Style Calendar',
      subtitle: `${calendarEvents.length} events`,
    },
  ];

  // UHNI-exclusive nav items
  const uhniNavItems = isUHNI ? [
    {
      href: '/profile/concierge',
      icon: Crown,
      title: 'Personal Concierge',
      subtitle: concierge?.name || 'Your dedicated advisor',
      isUHNI: true,
    },
    {
      href: '/profile/autonomous',
      icon: Zap,
      title: 'Autonomous Shopping',
      subtitle: autonomousSettings?.enabled ? 'Active' : 'Configure',
      isUHNI: true,
    },
    {
      href: '/profile/sourcing',
      icon: Search,
      title: 'Private Sourcing',
      subtitle: sourcingRequests.length > 0 ? `${sourcingRequests.length} active` : 'Request items',
      isUHNI: true,
    },
    {
      href: '/profile/bespoke',
      icon: Gem,
      title: 'Bespoke Orders',
      subtitle: bespokeOrders.length > 0 ? `${bespokeOrders.length} in progress` : 'Commission pieces',
      isUHNI: true,
    },
  ] : [];

  // Settings at the end
  const settingsItem = {
    href: '/profile/settings',
    icon: Settings,
    title: 'Settings',
    subtitle: 'Account & preferences',
  };

  const navItems: Array<{
    href: string;
    icon: typeof ShoppingBag;
    title: string;
    subtitle: string;
    isUHNI?: boolean;
  }> = [...baseNavItems, ...uhniNavItems, settingsItem];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Profile Header
          ============================================ */}
      <section className="relative bg-charcoal-deep py-20 lg:py-28 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold-soft/5 to-transparent" />

        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 relative">
          <div className={`flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Avatar */}
            <div className="w-28 h-28 bg-charcoal-warm flex items-center justify-center border border-gold-soft/20">
              <User size={48} className="text-gold-soft/60" />
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">
                  Member Since 2024
                </span>
                {isUHNI && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gold-soft/20 text-gold-soft text-[10px] tracking-[0.3em] uppercase">
                    <Crown size={10} />
                    UHNI
                  </span>
                )}
              </div>
              <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-3">
                {user.name}
              </h1>
              <p className="text-taupe">{user.email}</p>
            </div>

            {/* Edit Profile */}
            <Link
              href="/profile/settings"
              className="group flex items-center gap-4"
            >
              <span className="text-sm tracking-[0.15em] uppercase text-ivory-cream/60 group-hover:text-ivory-cream transition-colors">
                Edit Profile
              </span>
              <span className="w-12 h-12 border border-ivory-cream/30 flex items-center justify-center group-hover:border-ivory-cream group-hover:bg-ivory-cream transition-all duration-300">
                <ArrowRight size={16} className="text-ivory-cream group-hover:text-charcoal-deep transition-colors" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left Column - Navigation */}
            <div className="lg:col-span-1">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                Quick Access
              </span>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isUHNIItem = item.isUHNI === true;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between p-5 border-b transition-colors ${
                        isUHNIItem
                          ? 'border-gold-soft/30 hover:bg-gold-soft/5 bg-gold-soft/[0.02]'
                          : 'border-sand/50 hover:bg-parchment'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 flex items-center justify-center transition-colors ${
                          isUHNIItem
                            ? 'bg-gold-soft/10 group-hover:bg-gold-soft/20'
                            : 'bg-parchment group-hover:bg-ivory-cream'
                        }`}>
                          <item.icon size={18} className={isUHNIItem ? 'text-gold-muted' : 'text-stone'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-charcoal-deep">{item.title}</p>
                            {isUHNIItem && (
                              <span className="text-[8px] tracking-[0.2em] uppercase text-gold-muted px-1.5 py-0.5 bg-gold-soft/10">
                                UHNI
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-taupe">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className={`group-hover:translate-x-1 transition-all ${
                        isUHNIItem ? 'text-gold-muted/50 group-hover:text-gold-muted' : 'text-taupe group-hover:text-charcoal-deep'
                      }`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Upcoming Event */}
              {calendarEvents.length > 0 && (
                <div className="mt-10 p-6 bg-charcoal-deep">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-4">
                    Next Event
                  </span>
                  <h3 className="font-display text-xl text-ivory-cream mb-4">
                    {calendarEvents[0].title}
                  </h3>
                  <div className="space-y-2 text-sm text-taupe mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-gold-soft/60" />
                      <span>{new Date(calendarEvents[0].date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-gold-soft/60" />
                      <span>{calendarEvents[0].time}</span>
                    </div>
                    {calendarEvents[0].venue && (
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-gold-soft/60" />
                        <span className="truncate">{calendarEvents[0].venue}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/calendar"
                    className="group inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase text-gold-soft hover:text-ivory-cream transition-colors"
                  >
                    <span>Plan Outfit</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Style Profile */}
              <div>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                      Your Preferences
                    </span>
                    <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                      Style Profile
                    </h2>
                  </div>
                  <Link
                    href="/onboarding"
                    className="text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                  >
                    Update
                  </Link>
                </div>

                {user.fashionIdentity ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Occasions</p>
                      <div className="flex flex-wrap gap-2">
                        {user.fashionIdentity.occasions.map((occ) => (
                          <span key={occ} className="px-4 py-2 border border-sand text-sm text-charcoal-deep">
                            {occ.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Aesthetics</p>
                      <div className="flex flex-wrap gap-2">
                        {user.fashionIdentity.aesthetics.map((aes) => (
                          <span key={aes} className="px-4 py-2 border border-sand text-sm text-charcoal-deep">
                            {aes.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Confidence</p>
                      <p className="font-display text-xl text-charcoal-deep capitalize">{user.fashionIdentity.confidenceLevel}</p>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Location</p>
                      <p className="font-display text-xl text-charcoal-deep">{user.fashionIdentity.primaryLocation}</p>
                    </div>

                    {user.fashionIdentity.budgetRange && (
                      <div className="md:col-span-2 pt-6 border-t border-sand/50">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Investment Range</p>
                        <p className="font-display text-2xl text-charcoal-deep">
                          €{user.fashionIdentity.budgetRange.min.toLocaleString()} — €{user.fashionIdentity.budgetRange.max.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-parchment">
                    <p className="text-stone mb-8">Complete your style profile for personalized recommendations</p>
                    <Link
                      href="/onboarding"
                      className="group inline-flex items-center gap-4"
                    >
                      <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                        Get Started
                      </span>
                      <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                        <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Wardrobe Preview */}
              <div>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                      Your Collection
                    </span>
                    <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                      Wardrobe
                    </h2>
                  </div>
                  <Link
                    href="/wardrobe"
                    className="group inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {wardrobe.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {wardrobe.slice(0, 3).map((item, index) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.product.slug}`}
                        className="group relative aspect-[3/4] overflow-hidden"
                        onMouseEnter={() => setActiveHover(index)}
                        onMouseLeave={() => setActiveHover(null)}
                      >
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/40 transition-all duration-500 flex items-end p-4">
                          <div className={`transition-all duration-500 ${activeHover === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-ivory-cream/70 mb-1">
                              {item.product.brandName}
                            </p>
                            <p className="font-display text-lg text-ivory-cream">
                              {item.product.name}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-parchment">
                    <p className="text-stone mb-8">Your wardrobe is empty. Start adding pieces you own.</p>
                    <Link
                      href="/discover"
                      className="group inline-flex items-center gap-4"
                    >
                      <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
                        Explore Pieces
                      </span>
                      <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                        <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* UHNI: Personal Concierge Card / Standard: Style Note */}
              {isUHNI && concierge ? (
                <div className="bg-charcoal-deep p-8 relative overflow-hidden">
                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-soft/10 to-transparent" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-6">
                      <Crown size={14} className="text-gold-soft" />
                      <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/70">Your Personal Concierge</span>
                    </div>

                    <div className="flex items-start gap-5 mb-6">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold-soft/30">
                        <Image
                          src={concierge.avatar}
                          alt={concierge.name}
                          fill
                          className="object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-charcoal-deep rounded-full ${
                          concierge.availability === 'available' ? 'bg-success' :
                          concierge.availability === 'busy' ? 'bg-gold-muted' : 'bg-stone'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-ivory-cream">{concierge.name}</h3>
                        <p className="text-sm text-taupe">{concierge.title}</p>
                        <p className="text-xs text-gold-soft/70 mt-1 capitalize">
                          {concierge.availability === 'available' ? 'Available now' :
                           concierge.availability === 'busy' ? 'In a session' : 'Currently offline'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-sand/80 mb-8 leading-relaxed">
                      {concierge.bio.substring(0, 150)}...
                    </p>

                    <div className="flex gap-3">
                      <Link
                        href="/profile/concierge"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-soft/10 text-gold-soft hover:bg-gold-soft/20 transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span className="text-xs tracking-[0.15em] uppercase">Message</span>
                      </Link>
                      <button className="flex items-center justify-center gap-2 px-5 py-3 border border-ivory-cream/20 text-ivory-cream/60 hover:border-ivory-cream/40 hover:text-ivory-cream transition-colors">
                        <Phone size={16} />
                      </button>
                      <button className="flex items-center justify-center gap-2 px-5 py-3 border border-ivory-cream/20 text-ivory-cream/60 hover:border-ivory-cream/40 hover:text-ivory-cream transition-colors">
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-parchment border-l-2 border-gold-muted">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-4">Style Note</p>
                  <p className="text-stone leading-relaxed">
                    Based on your wardrobe and preferences, you have a strong foundation in structured tailoring.
                    Consider exploring softer silhouettes for variety, particularly from Bottega Veneta's current collection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA - Discover
          ============================================ */}
      <section className="py-20 lg:py-28 bg-charcoal-deep">
        <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
            Continue Your Journey
          </span>
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-8">
            Discover New Pieces
          </h2>
          <p className="text-taupe mb-12 max-w-lg mx-auto">
            Explore our curated selection of exceptional pieces from distinguished maisons.
          </p>
          <Link
            href="/discover"
            className="group inline-flex items-center gap-5"
          >
            <span className="text-sm tracking-[0.2em] uppercase text-ivory-cream">
              Explore Collection
            </span>
            <span className="w-14 h-14 rounded-full border border-gold-soft/30 flex items-center justify-center group-hover:bg-gold-soft group-hover:border-gold-soft transition-all duration-500">
              <ArrowRight size={18} className="text-gold-soft group-hover:text-noir transition-colors duration-500" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
