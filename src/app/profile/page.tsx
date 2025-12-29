'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, ShoppingBag, Settings, ChevronRight, Sparkles, Edit2, Calendar, Clock, MapPin } from 'lucide-react';
import { mockUser, mockConsiderations, mockCalendarEvents } from '@/data/mock-data';

export default function ProfilePage() {
  const user = mockUser;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep text-ivory-cream py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gold-muted/20 flex items-center justify-center">
              <User size={40} className="text-gold-soft" />
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="font-display text-3xl mb-2">{user.name}</h1>
              <p className="text-taupe">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                <Sparkles size={16} className="text-gold-soft" />
                <span className="text-sm text-sand">Fashion Identity Active</span>
              </div>
            </div>

            {/* Edit */}
            <Link
              href="/profile/edit"
              className="md:ml-auto p-3 border border-taupe rounded-full hover:border-ivory-cream transition-colors"
            >
              <Edit2 size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Link
                href="/wardrobe"
                className="flex items-center justify-between p-4 border-b border-sand hover:bg-parchment transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-parchment rounded-lg flex items-center justify-center">
                    <ShoppingBag size={20} className="text-stone" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-deep">Digital Wardrobe</p>
                    <p className="text-sm text-greige">{user.wardrobe.length} pieces</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-greige" />
              </Link>

              <Link
                href="/consideration"
                className="flex items-center justify-between p-4 border-b border-sand hover:bg-parchment transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-parchment rounded-lg flex items-center justify-center">
                    <Heart size={20} className="text-stone" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-deep">Considerations</p>
                    <p className="text-sm text-greige">{mockConsiderations.length} items</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-greige" />
              </Link>

              <Link
                href="/profile/orders"
                className="flex items-center justify-between p-4 border-b border-sand hover:bg-parchment transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-parchment rounded-lg flex items-center justify-center">
                    <ShoppingBag size={20} className="text-stone" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-deep">Orders</p>
                    <p className="text-sm text-greige">View order history</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-greige" />
              </Link>

              <Link
                href="/profile/settings"
                className="flex items-center justify-between p-4 border-b border-sand hover:bg-parchment transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-parchment rounded-lg flex items-center justify-center">
                    <Settings size={20} className="text-stone" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-deep">Settings</p>
                    <p className="text-sm text-greige">Account & preferences</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-greige" />
              </Link>

              <Link
                href="/calendar"
                className="flex items-center justify-between p-4 hover:bg-parchment transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-muted/20 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-gold-deep" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-deep">Style Calendar</p>
                    <p className="text-sm text-greige">{mockCalendarEvents.length} upcoming events</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-greige" />
              </Link>
            </nav>

            {/* Upcoming Event Widget */}
            {mockCalendarEvents.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-gold-muted/10 to-champagne/20 rounded-xl p-5 border border-gold-muted/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-gold-deep" />
                  <p className="text-sm font-medium text-charcoal-deep">Next Event</p>
                </div>

                <h3 className="font-display text-lg text-charcoal-deep mb-2">
                  {mockCalendarEvents[0].title}
                </h3>

                <div className="space-y-1 text-sm text-stone mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-greige" />
                    <span>{new Date(mockCalendarEvents[0].date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-greige" />
                    <span>{mockCalendarEvents[0].time}</span>
                  </div>
                  {mockCalendarEvents[0].venue && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-greige" />
                      <span className="truncate">{mockCalendarEvents[0].venue}</span>
                    </div>
                  )}
                </div>

                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-1 text-sm text-gold-deep hover:text-gold-muted transition-colors"
                >
                  View outfit suggestions
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Fashion Identity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fashion Identity Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-gold-muted" size={20} />
                  <h2 className="font-display text-xl text-charcoal-deep">Your Fashion Identity</h2>
                </div>
                <Link href="/onboarding" className="text-sm text-gold-muted hover:text-gold-deep">
                  Update
                </Link>
              </div>

              {user.fashionIdentity ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-greige mb-2">Occasions</p>
                    <div className="flex flex-wrap gap-2">
                      {user.fashionIdentity.occasions.map((occ) => (
                        <span key={occ} className="px-3 py-1 bg-parchment text-sm text-charcoal-deep rounded-full">
                          {occ.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-greige mb-2">Aesthetics</p>
                    <div className="flex flex-wrap gap-2">
                      {user.fashionIdentity.aesthetics.map((aes) => (
                        <span key={aes} className="px-3 py-1 bg-parchment text-sm text-charcoal-deep rounded-full">
                          {aes.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-greige mb-1">Confidence Level</p>
                      <p className="text-charcoal-deep capitalize">{user.fashionIdentity.confidenceLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-greige mb-1">Primary Location</p>
                      <p className="text-charcoal-deep">{user.fashionIdentity.primaryLocation}</p>
                    </div>
                  </div>

                  {user.fashionIdentity.budgetRange && (
                    <div>
                      <p className="text-sm text-greige mb-1">Budget Range</p>
                      <p className="text-charcoal-deep">
                        €{user.fashionIdentity.budgetRange.min.toLocaleString()} - €{user.fashionIdentity.budgetRange.max.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-stone mb-4">Complete your Fashion Identity for personalized recommendations</p>
                  <Link href="/onboarding" className="btn-primary inline-flex">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Wardrobe Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-charcoal-deep">From Your Wardrobe</h2>
                <Link href="/wardrobe" className="text-sm text-gold-muted hover:text-gold-deep">
                  View All
                </Link>
              </div>

              {user.wardrobe.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {user.wardrobe.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.product.slug}`}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-stone py-8">
                  Your wardrobe is empty. Start adding pieces you own!
                </p>
              )}
            </div>

            {/* AGI Insight */}
            <div className="bg-sapphire-deep/5 rounded-xl p-6 border border-sapphire-subtle/20">
              <div className="flex items-start gap-4">
                <Sparkles className="text-sapphire-subtle flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-display text-lg text-charcoal-deep mb-2">Fashion Intelligence Insight</h3>
                  <p className="text-stone">
                    Based on your wardrobe and preferences, you have a strong foundation in structured tailoring.
                    Consider exploring softer silhouettes for variety, particularly from Bottega Veneta's current collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
