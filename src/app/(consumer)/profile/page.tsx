'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User as UserIcon, ShoppingBag, Settings, ArrowRight, Calendar, Package, Crown, Phone, Mail, MessageCircle, Layers } from 'lucide-react';
import * as userService from '@/services/user.service';
import * as authService from '@/services/auth.service';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { TierBadge } from '@/components/shared/TierBadge';
import type { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoggingOut, userData: authUserData, setUserData } = useAuth();
  const { wardrobe, calendarEvents, orders, isUHNI, concierge, fashionIdentity, pricingTier } = useApp();
  const [mockUserData, setMockUserData] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Build a unified user object: real backend data takes priority, fallback to mock
  const user = (() => {
    if (authUserData) {
      return {
        id: authUserData.user_id,
        email: authUserData.email,
        name: `${authUserData.first_name} ${authUserData.last_name}`,
        firstName: authUserData.first_name,
        lastName: authUserData.last_name,
        role: authUserData.role,
        profile_picture: authUserData.profile_picture,
        memberSince: authUserData.created_at,
        fashionIdentity: authUserData.context_set ? {
          occasions: authUserData.occasions,
          aesthetics: authUserData.aesthetics,
          confidenceLevel: fashionIdentity?.confidenceLevel || ('guided' as const),
          budgetRange: authUserData.minimum_budget && authUserData.maximum_budget
            ? { min: authUserData.minimum_budget, max: authUserData.maximum_budget }
            : fashionIdentity?.budgetRange,
          primaryLocation: fashionIdentity?.primaryLocation || 'Paris',
          travelDestinations: fashionIdentity?.travelDestinations || [],
        } : fashionIdentity,
        wardrobe: [],
        considerations: [],
        orders: [],
      };
    }
    if (mockUserData) {
      return { ...mockUserData, fashionIdentity, role: 'consumer', memberSince: '', firstName: '', lastName: '', profile_picture: null };
    }
    return null;
  })();

  // UHNI users get their own dashboard — redirect away from consumer profile
  useEffect(() => {
    if (isHydrated && isAuthenticated && isUHNI) {
      router.replace('/uhni');
    }
  }, [isUHNI, isHydrated, isAuthenticated, router]);

  // Redirect to login if not authenticated (but not during logout - let Header handle navigation)
  useEffect(() => {
    if (isHydrated && !isAuthenticated && !isLoggingOut) {
      router.push('/auth/login/consumer?redirect=/profile');
    }
  }, [isAuthenticated, isHydrated, isLoggingOut, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated && !authUserData) {
      // Only load mock data if no real user data is available
      const loadUser = async () => {
        const response = await userService.getCurrentUser();
        setMockUserData(response.data);
        setIsLoaded(true);
      };
      loadUser();
    } else if (isHydrated && isAuthenticated && authUserData) {
      // Fetch fresh user data from backend using GET /api/v1/user/auth/me
      const refreshUser = async () => {
        try {
          const freshUserData = await authService.getUserById();
          setUserData(freshUserData);
          if (freshUserData.profile_picture) {
            setProfilePicture(freshUserData.profile_picture);
          }
        } catch {
          // Non-blocking: fall back to cached authUserData
          if (authUserData.profile_picture) {
            setProfilePicture(authUserData.profile_picture);
          }
        } finally {
          setIsLoaded(true);
        }
      };
      refreshUser();
    }
  }, [isHydrated, isAuthenticated, authUserData, setUserData]);

  // UHNI users are being redirected — prevent flash of consumer content
  if (isUHNI) return null;

  // Show loading while checking auth or loading user data
  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Standard nav items for all users
  // Note: Considerations removed - accessible via heart icon in header
  const baseNavItems = [
    {
      href: '/wardrobe',
      icon: ShoppingBag,
      title: 'Digital Wardrobe',
      subtitle: `${wardrobe.length} pieces`,
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
    {
      href: '/profile/body-twin',
      icon: UserIcon,
      title: 'Digital Body Twin',
      subtitle: 'Fit profile & measurements',
    },
  ];

  // // Membership tier link
  // const membershipItem = {
  //   href: '/pricing-tiers',
  //   icon: Sparkles,
  //   title: 'Membership',
  //   subtitle: 'View tier benefits',
  // };


  // Settings at the end
  const settingsItem = {
    href: '/profile/settings',
    icon: Settings,
    title: 'Settings',
    subtitle: 'Account & preferences',
  };

  const navItems = [...baseNavItems, settingsItem];

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
            <div className="w-28 h-28 bg-charcoal-warm flex items-center justify-center border border-gold-soft/20 overflow-hidden">
              {profilePicture ? (
                <Image
                  src={profilePicture}
                  alt={user.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              ) : (
                <UserIcon size={48} className="text-gold-soft/60" />
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">
                  {user.memberSince
                    ? `Member Since ${new Date(user.memberSince).getFullYear()}`
                    : 'Member Since 2024'}
                </span>
                <TierBadge tier={pricingTier} size="md" />
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
              <div className="lg:sticky lg:top-[108px] lg:max-h-[calc(100vh-124px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                Quick Access
              </span>

              {/* UHNI access banner */}
              {isUHNI && (
                <div className="mb-6 p-5 bg-charcoal-deep flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Crown size={14} className="text-gold-soft flex-shrink-0" />
                    <p className="text-xs tracking-wider text-ivory-cream">You have UHNI access</p>
                  </div>
                  <Link
                    href="/uhni"
                    className="text-xs tracking-[0.15em] uppercase text-gold-soft hover:text-ivory-cream transition-colors flex-shrink-0"
                  >
                    Go to UHNI Dashboard →
                  </Link>
                </div>
              )}

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between p-5 border-b border-sand/50 hover:bg-parchment transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-parchment group-hover:bg-ivory-cream transition-colors">
                        <item.icon size={18} className="text-stone" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-deep">{item.title}</p>
                        <p className="text-sm text-taupe">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </nav>

              </div>
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
                          {(() => {
                            const { min, max } = user.fashionIdentity.budgetRange;
                            if (min === 0 && max >= 1000000) return 'No Preference';
                            if (min === 0 && max <= 1000) return `Up to €${max.toLocaleString()}`;
                            if (min >= 5000 && max >= 1000000) return `€${min.toLocaleString()}+`;
                            return `€${min.toLocaleString()} — €${max.toLocaleString()}`;
                          })()}
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
                        href={`/product/${item.product.slug}?productId=${item.productId}`}
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
                        href="/uhni/concierge"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-soft/10 text-gold-soft hover:bg-gold-soft/20 transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span className="text-xs tracking-[0.15em] uppercase">Message</span>
                      </Link>
                      <a
                        href={`tel:${concierge.phone}`}
                        className="flex items-center justify-center gap-2 px-5 py-3 border border-ivory-cream/20 text-ivory-cream/60 hover:border-ivory-cream/40 hover:text-ivory-cream transition-colors"
                        aria-label={`Call ${concierge.name}`}
                      >
                        <Phone size={16} />
                      </a>
                      <a
                        href={`mailto:${concierge.email}`}
                        className="flex items-center justify-center gap-2 px-5 py-3 border border-ivory-cream/20 text-ivory-cream/60 hover:border-ivory-cream/40 hover:text-ivory-cream transition-colors"
                        aria-label={`Email ${concierge.name}`}
                      >
                        <Mail size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Style Note - commented out for consumer
                <div className="p-8 bg-parchment border-l-2 border-gold-muted">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-4">Style Note</p>
                  <p className="text-stone leading-relaxed">
                    Based on your wardrobe and preferences, you have a strong foundation in structured tailoring.
                    Consider exploring softer silhouettes for variety, particularly from Bottega Veneta's current collection.
                  </p>
                </div>
                */
                null
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
