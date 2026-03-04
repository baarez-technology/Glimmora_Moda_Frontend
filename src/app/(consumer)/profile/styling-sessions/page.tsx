'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Video,
  Clock,
  User,
  Plus,
  Check,
  X,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Store,
  Home as HomeIcon,
  MapPin,
  ExternalLink,
  Search,
} from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useApp } from '@/context/AppContext';
import type { Brand } from '@/types';
import type { StylingSessionType, StylingSession } from '@/types/brand-portal';
import * as brandService from '@/services/brand.service';

type TabValue = 'sessions' | 'book';
type BookingStep = 1 | 2 | 3;

export default function StylingSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isUHNI, isHydrated, concierge, showToast, stylingSessions, bookStylingSession, cancelStylingSession } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  const tabParam = searchParams.get('tab');
  const brandParam = searchParams.get('brand');
  const [activeTab, setActiveTab] = useState<TabValue>(tabParam === 'book' ? 'book' : 'sessions');
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);

  // Booking state
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [bookingForm, setBookingForm] = useState({
    brandId: brandParam || '',
    brandName: '',
    type: 'virtual' as StylingSessionType,
    date: '',
    time: '',
    duration: 60,
    notes: '',
    contextInfo: '',
  });

  useEffect(() => {
    setIsLoaded(true);
    brandService.getAllBrands().then(r => {
      if (r.success) setBrands(r.data);
    });
  }, []);

  // Handle ?tab=book param
  useEffect(() => {
    if (tabParam === 'book') setActiveTab('book');
  }, [tabParam]);

  // Pre-fill brand if provided
  useEffect(() => {
    if (brandParam && brands.length > 0) {
      const brand = brands.find(b => b.id === brandParam);
      if (brand) {
        setBookingForm(prev => ({ ...prev, brandId: brand.id, brandName: brand.name }));
        setBookingStep(2);
      }
    }
  }, [brandParam, brands]);

  // Redirect non-UHNI users
  useEffect(() => {
    if (isHydrated && !isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, isHydrated, router]);

  if (isHydrated && !isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const upcomingSessions = stylingSessions.filter(s =>
    s.status !== 'cancelled' && s.status !== 'completed' && new Date(s.scheduledAt) > new Date()
  );
  const pastSessions = stylingSessions.filter(s =>
    s.status === 'completed' || s.status === 'cancelled' || new Date(s.scheduledAt) <= new Date()
  );

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const getStatusBadge = (status: StylingSession['status']) => {
    switch (status) {
      case 'pending': return 'bg-gold-soft/20 text-gold-deep';
      case 'confirmed': return 'bg-info/10 text-info';
      case 'scheduled': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
      case 'rescheduled': return 'bg-warning/10 text-warning';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getTypeIcon = (type: StylingSessionType) => {
    switch (type) {
      case 'virtual': return Video;
      case 'in_store': return Store;
      case 'home': return HomeIcon;
      default: return Calendar;
    }
  };

  const getTypeLabel = (type: StylingSessionType) => {
    switch (type) {
      case 'virtual': return 'Virtual';
      case 'in_store': return 'In-Store';
      case 'home': return 'At Home';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSelectBrand = (brand: Brand) => {
    setBookingForm(prev => ({ ...prev, brandId: brand.id, brandName: brand.name }));
    setBookingStep(2);
  };

  const handleBookSession = () => {
    if (!bookingForm.date || !bookingForm.time || !bookingForm.brandId) return;

    const scheduledAt = new Date(`${bookingForm.date}T${bookingForm.time}`).toISOString();
    bookStylingSession({
      brandId: bookingForm.brandId,
      brandName: bookingForm.brandName,
      type: bookingForm.type,
      scheduledAt,
      duration: bookingForm.duration,
      notes: bookingForm.notes,
      contextInfo: bookingForm.contextInfo,
      customerTier: 'uhni',
    });

    // Reset form
    setBookingForm({
      brandId: '',
      brandName: '',
      type: 'virtual',
      date: '',
      time: '',
      duration: 60,
      notes: '',
      contextInfo: '',
    });
    setBookingStep(1);
    setActiveTab('sessions');
  };

  const handleCancelSession = (sessionId: string) => {
    cancelStylingSession(sessionId);
  };

  const handleJoinSession = (session: StylingSession) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else if (session.type === 'virtual') {
      showToast('Virtual session link will be available before your appointment', 'info');
    } else {
      showToast('Check your email for venue details', 'info');
    }
  };

  const sessionTypes: { type: StylingSessionType; title: string; icon: typeof Video; description: string }[] = [
    { type: 'virtual', title: 'Virtual Session', icon: Video, description: 'Video consultation from anywhere' },
    { type: 'in_store', title: 'In-Store', icon: Store, description: 'Personalized boutique experience' },
    { type: 'home', title: 'At Home', icon: HomeIcon, description: 'Private styling at your residence' },
  ];

  const durations = [
    { minutes: 30, label: '30 min', focus: 'Quick consultation' },
    { minutes: 60, label: '1 hour', focus: 'Comprehensive styling' },
    { minutes: 90, label: '90 min', focus: 'Deep wardrobe analysis' },
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Sparkles size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    Personal Styling
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Styling Sessions
                </h1>
                <p className="text-sand mt-2">Expert styling consultations tailored to you</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-8">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-5 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-gold-soft/20 text-gold-soft'
                  : 'text-sand/60 hover:text-sand'
              }`}
            >
              My Sessions
              <span className="ml-2 text-[10px]">{stylingSessions.length}</span>
            </button>
            <button
              onClick={() => { setActiveTab('book'); setBookingStep(1); }}
              className={`px-5 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'book'
                  ? 'bg-gold-soft/20 text-gold-soft'
                  : 'text-sand/60 hover:text-sand'
              }`}
            >
              <Plus size={14} />
              Book a Session
            </button>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══ MY SESSIONS TAB ═══ */}
        {activeTab === 'sessions' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-6">Upcoming Sessions</h2>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-16 bg-white">
                    <Calendar size={48} className="mx-auto text-stone mb-4" />
                    <p className="text-stone mb-6">No upcoming sessions scheduled</p>
                    <button
                      onClick={() => setActiveTab('book')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
                    >
                      <Plus size={16} />
                      <span className="text-sm tracking-[0.15em] uppercase">Book Your First Session</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => {
                      const TypeIcon = getTypeIcon(session.type);
                      return (
                        <div key={session.id} className="bg-white p-6">
                          <div className="flex gap-6">
                            {/* Brand Icon */}
                            <div className="w-16 h-16 bg-parchment flex items-center justify-center flex-shrink-0">
                              <TypeIcon size={24} className="text-stone" />
                            </div>

                            {/* Session Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-display text-xl text-charcoal-deep">
                                    {session.brandName || 'Styling Session'}
                                  </p>
                                  {session.stylistName && (
                                    <p className="text-sm text-taupe">with {session.stylistName}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${getStatusBadge(session.status)}`}>
                                    {session.status}
                                  </span>
                                  <span className="px-2 py-1 text-[9px] tracking-[0.1em] uppercase bg-parchment text-stone">
                                    {getTypeLabel(session.type)}
                                  </span>
                                </div>
                              </div>

                              {session.notes && (
                                <div className="p-4 bg-parchment mb-3">
                                  <p className="text-sm text-charcoal-deep">{session.notes}</p>
                                </div>
                              )}

                              <div className="flex items-center gap-6 text-sm text-stone">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span>{formatDate(session.scheduledAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock size={14} />
                                  <span>{formatTime(session.scheduledAt)} ({session.duration} min)</span>
                                </div>
                              </div>

                              {session.meetingLink && session.type === 'virtual' && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-info">
                                  <ExternalLink size={14} />
                                  <span>Meeting link available</span>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3 mt-4">
                                {session.type === 'virtual' && (
                                  <button
                                    onClick={() => handleJoinSession(session)}
                                    className="flex-1 py-2 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.1em] uppercase"
                                  >
                                    Join Session
                                  </button>
                                )}
                                <button
                                  onClick={() => setCancelSessionId(session.id)}
                                  className="px-4 py-2 border border-error/30 text-error hover:border-error transition-colors text-sm tracking-[0.1em] uppercase"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Past Sessions */}
              {pastSessions.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-charcoal-deep mb-6">Past Sessions</h2>
                  <div className="space-y-4">
                    {pastSessions.map((session) => (
                      <div key={session.id} className="bg-white p-6 opacity-75">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-parchment flex items-center justify-center flex-shrink-0">
                            {session.status === 'completed' ? (
                              <Check size={20} className="text-success" />
                            ) : (
                              <X size={20} className="text-error" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-charcoal-deep">{session.brandName || 'Styling Session'}</p>
                            <p className="text-sm text-taupe">
                              {new Date(session.scheduledAt).toLocaleDateString()} • {getTypeLabel(session.type)} • {session.duration} min
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${getStatusBadge(session.status)}`}>
                            {session.status}
                          </span>
                          {session.outfitRecommendations && session.outfitRecommendations.length > 0 && (
                            <button
                              onClick={() => showToast(`${session.outfitRecommendations!.length} recommendations from this session`, 'info')}
                              className="flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                            >
                              <span className="tracking-[0.1em] uppercase">Recommendations</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Concierge Card */}
              {concierge && (
                <div className="bg-charcoal-deep p-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gold-soft/30">
                    <Image
                      src={concierge.avatar}
                      alt={concierge.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-display text-xl text-ivory-cream text-center mb-1">{concierge.name}</h3>
                  <p className="text-sm text-taupe text-center mb-4">{concierge.title}</p>

                  <div className="p-4 bg-ivory-cream/5 mb-4">
                    <p className="text-xs text-sand mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {concierge.specialties.slice(0, 3).map((specialty) => (
                        <span key={specialty} className="text-xs px-2 py-1 bg-gold-soft/10 text-gold-soft">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/uhni/concierge"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm tracking-[0.1em] uppercase">Message</span>
                  </Link>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-white p-6">
                <h3 className="font-display text-lg text-charcoal-deep mb-4">Session Benefits</h3>
                <ul className="space-y-3 text-sm text-stone">
                  <li className="flex items-start gap-3">
                    <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Personalized wardrobe analysis & optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Expert recommendations for your lifestyle</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Investment piece guidance & sourcing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <span>Event-specific styling solutions</span>
                  </li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="bg-white p-6">
                <h3 className="font-display text-lg text-charcoal-deep mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/wardrobe"
                    className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                  >
                    <span className="text-sm text-charcoal-deep">View Wardrobe</span>
                    <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    href="/uhni/intelligence"
                    className="flex items-center justify-between p-3 border border-sand hover:border-charcoal-deep transition-colors group"
                  >
                    <span className="text-sm text-charcoal-deep">Style Insights</span>
                    <ChevronRight size={14} className="text-stone group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BOOK A SESSION TAB ═══ */}
        {activeTab === 'book' && (
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {[
                { step: 1 as BookingStep, label: 'Select Brand' },
                { step: 2 as BookingStep, label: 'Date & Details' },
                { step: 3 as BookingStep, label: 'Review & Confirm' },
              ].map(({ step, label }) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center text-sm ${
                    bookingStep >= step
                      ? 'bg-charcoal-deep text-ivory-cream'
                      : 'bg-parchment text-stone'
                  }`}>
                    {bookingStep > step ? <Check size={16} /> : step}
                  </div>
                  <span className={`text-xs tracking-[0.1em] uppercase hidden sm:inline ${
                    bookingStep >= step ? 'text-charcoal-deep' : 'text-taupe'
                  }`}>
                    {label}
                  </span>
                  {step < 3 && <div className={`w-12 h-px ${bookingStep > step ? 'bg-charcoal-deep' : 'bg-sand'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Brand Selection */}
            {bookingStep === 1 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-2">Select a Brand</h2>
                <p className="text-sm text-stone mb-6">Choose which maison you&apos;d like to book a styling session with</p>

                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brands..."
                    className="w-full pl-10 pr-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors placeholder:text-taupe"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredBrands.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => handleSelectBrand(brand)}
                      className="p-5 bg-white border border-sand hover:border-charcoal-deep transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        {brand.logoUrl ? (
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-parchment flex items-center justify-center flex-shrink-0">
                            <span className="font-display text-lg text-stone">{brand.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-display text-lg text-charcoal-deep group-hover:text-gold-muted transition-colors">
                            {brand.name}
                          </p>
                          {brand.tagline && (
                            <p className="text-xs text-taupe line-clamp-1">{brand.tagline}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredBrands.length === 0 && (
                  <div className="text-center py-12 bg-white">
                    <Search size={32} className="mx-auto text-taupe/40 mb-4" />
                    <p className="text-stone">No brands found</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date, Time & Context */}
            {bookingStep === 2 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-2">Session Details</h2>
                <p className="text-sm text-stone mb-8">
                  Booking with <span className="text-charcoal-deep font-medium">{bookingForm.brandName}</span>
                  <button
                    onClick={() => { setBookingStep(1); setBookingForm(prev => ({ ...prev, brandId: '', brandName: '' })); }}
                    className="ml-2 text-gold-muted hover:text-gold-deep"
                  >
                    Change
                  </button>
                </p>

                <div className="space-y-8">
                  {/* Session Type */}
                  <div>
                    <label className="block text-sm tracking-wider uppercase text-taupe mb-4">Session Type</label>
                    <div className="grid grid-cols-3 gap-4">
                      {sessionTypes.map(st => (
                        <button
                          key={st.type}
                          onClick={() => setBookingForm(prev => ({ ...prev, type: st.type }))}
                          className={`p-5 border text-left transition-all ${
                            bookingForm.type === st.type
                              ? 'border-charcoal-deep bg-parchment'
                              : 'border-sand hover:border-charcoal-deep bg-white'
                          }`}
                        >
                          <st.icon size={24} className="mb-3 text-stone" />
                          <p className="font-display text-base text-charcoal-deep mb-1">{st.title}</p>
                          <p className="text-xs text-stone">{st.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm tracking-wider uppercase text-taupe mb-4">Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                      {durations.map(dur => (
                        <button
                          key={dur.minutes}
                          onClick={() => setBookingForm(prev => ({ ...prev, duration: dur.minutes }))}
                          className={`p-4 border text-center transition-all ${
                            bookingForm.duration === dur.minutes
                              ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                              : 'border-sand hover:border-charcoal-deep text-charcoal-deep bg-white'
                          }`}
                        >
                          <p className="font-display text-lg mb-1">{dur.label}</p>
                          <p className="text-xs opacity-70">{dur.focus}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm tracking-wider uppercase text-taupe mb-3">Date</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm tracking-wider uppercase text-taupe mb-3">Time</label>
                      <input
                        type="time"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                  </div>

                  {/* Context */}
                  <div>
                    <label className="block text-sm tracking-wider uppercase text-taupe mb-3">
                      What are you looking for? (Optional)
                    </label>
                    <input
                      type="text"
                      value={bookingForm.contextInfo}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, contextInfo: e.target.value }))}
                      placeholder="e.g., Spring wardrobe refresh, Event styling, Investment pieces"
                      className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors placeholder:text-taupe"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm tracking-wider uppercase text-taupe mb-3">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder="Any specific topics or preferences..."
                      className="w-full px-4 py-3 border border-sand bg-white focus:outline-none focus:border-charcoal-deep transition-colors resize-none placeholder:text-taupe"
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setBookingStep(3)}
                      disabled={!bookingForm.date || !bookingForm.time}
                      className="flex-1 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-[0.15em] uppercase"
                    >
                      Review Booking
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {bookingStep === 3 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep mb-6">Review & Confirm</h2>

                <div className="bg-white p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Brand</p>
                      <p className="font-display text-lg text-charcoal-deep">{bookingForm.brandName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Session Type</p>
                      <p className="text-charcoal-deep">{getTypeLabel(bookingForm.type)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Date</p>
                      <p className="text-charcoal-deep">
                        {bookingForm.date && new Date(bookingForm.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Time & Duration</p>
                      <p className="text-charcoal-deep">{bookingForm.time} • {bookingForm.duration} minutes</p>
                    </div>
                  </div>

                  {bookingForm.contextInfo && (
                    <div className="pt-4 border-t border-sand/30">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Context</p>
                      <p className="text-sm text-charcoal-deep">{bookingForm.contextInfo}</p>
                    </div>
                  )}

                  {bookingForm.notes && (
                    <div className="pt-4 border-t border-sand/30">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Notes</p>
                      <p className="text-sm text-stone">{bookingForm.notes}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gold-soft/10 text-sm text-gold-deep">
                    <p>Complimentary for UHNI clients. The brand will confirm your session shortly.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="flex-1 py-4 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBookSession}
                    className="flex-1 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Session Confirmation */}
      <ConfirmModal
        isOpen={!!cancelSessionId}
        onClose={() => setCancelSessionId(null)}
        onConfirm={() => {
          if (cancelSessionId) handleCancelSession(cancelSessionId);
        }}
        title="Cancel Session"
        message="Are you sure you want to cancel this styling session? You can always book a new one later."
        confirmLabel="Cancel Session"
        confirmVariant="danger"
      />
    </div>
  );
}
