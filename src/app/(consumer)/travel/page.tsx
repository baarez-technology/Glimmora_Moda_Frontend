'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, Plus, MapPin, Calendar, Sun, Sparkles, ChevronRight, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Trip } from '@/types';

const sampleTrips: Trip[] = [
  {
    id: 'trip-1',
    name: 'Paris Fashion Week',
    destination: 'Paris, France',
    departureDate: '2024-03-01',
    returnDate: '2024-03-08',
    activities: ['business', 'formal', 'cultural', 'nightlife'],
    packingList: [],
    events: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'trip-2',
    name: 'Maldives Getaway',
    destination: 'Maldives',
    departureDate: '2024-04-15',
    returnDate: '2024-04-22',
    activities: ['beach', 'casual', 'wellness', 'formal'],
    packingList: [],
    events: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function TravelPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load trips from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('modaglimmora_trips');
      if (saved) {
        setTrips(JSON.parse(saved));
      } else {
        setTrips(sampleTrips);
      }
    }
  }, []);

  // Save trips to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && trips.length > 0) {
      localStorage.setItem('modaglimmora_trips', JSON.stringify(trips));
    }
  }, [trips]);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const tripDate = new Date(dateStr);
    const diff = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getTripDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-blue-800" />
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-white blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ top: '10%', left: '60%' }}
          />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-white/80 mb-4"
          >
            <Plane className="w-5 h-5" />
            <span className="text-sm tracking-[0.2em] uppercase">Travel Wardrobe</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-display text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Pack with Intelligence
          </motion.h1>

          <motion.p
            className="text-lg text-white/80 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            AI-curated packing lists based on your destination, weather, and planned occasions
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        {/* Create Trip Card */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-white rounded-2xl border-2 border-dashed border-stone/30 p-8 mb-8 hover:border-gold-soft hover:bg-gold-soft/5 transition-all group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 bg-gold-soft/10 rounded-full flex items-center justify-center group-hover:bg-gold-soft/20 transition-colors">
              <Plus className="w-7 h-7 text-gold-soft" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-display text-charcoal-deep">Plan a New Trip</h3>
              <p className="text-sm text-stone/60">Create an AI-optimized packing list for your journey</p>
            </div>
          </div>
        </motion.button>

        {/* Trips Grid */}
        {trips.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display text-charcoal-deep">Your Trips</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip, index) => {
                const daysUntil = getDaysUntil(trip.departureDate);
                const duration = getTripDuration(trip.departureDate, trip.returnDate);
                const isPast = daysUntil < 0;

                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/travel/${trip.id}`}>
                      <div className={`group bg-white rounded-2xl border border-stone/20 overflow-hidden hover:shadow-xl transition-all ${isPast ? 'opacity-60' : ''}`}>
                        {/* Header with gradient */}
                        <div className="relative h-32 bg-gradient-to-br from-sky-500 to-blue-600 p-6">
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 right-4">
                              {trip.activities.includes('beach') && <Sun className="w-20 h-20 text-white" />}
                              {trip.activities.includes('business') && !trip.activities.includes('beach') && <Sparkles className="w-20 h-20 text-white" />}
                              {trip.activities.includes('outdoor') && !trip.activities.includes('beach') && <span className="text-6xl">🏔️</span>}
                            </div>
                          </div>
                          <div className="relative">
                            <h3 className="text-xl font-display text-white mb-2">{trip.name}</h3>
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>{trip.destination}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-stone/70">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(trip.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <span className="text-xs text-stone/50">{duration} days</span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <div>
                              {isPast ? (
                                <span className="text-xs px-2 py-1 bg-stone/10 text-stone/60 rounded-full">Completed</span>
                              ) : daysUntil === 0 ? (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Today!</span>
                              ) : daysUntil <= 7 ? (
                                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">{daysUntil} days away</span>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full">In {daysUntil} days</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-gold-soft text-sm group-hover:gap-2 transition-all">
                              <Briefcase className="w-4 h-4" />
                              <span>View Packing List</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Activities */}
                          {trip.activities && trip.activities.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-stone/10">
                              <p className="text-xs text-stone/50 mb-2">Planned Activities</p>
                              <div className="flex flex-wrap gap-1">
                                {trip.activities.slice(0, 3).map((activity, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-stone/5 text-stone/60 rounded text-xs capitalize">
                                    {activity}
                                  </span>
                                ))}
                                {trip.activities.length > 3 && (
                                  <span className="px-2 py-0.5 text-stone/40 text-xs">
                                    +{trip.activities.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="text-center py-16">
            <Plane className="w-16 h-16 text-stone/30 mx-auto mb-4" />
            <h3 className="text-xl font-display text-charcoal-deep mb-2">No trips planned yet</h3>
            <p className="text-stone/60 mb-6">Create your first trip to get personalized packing recommendations</p>
          </div>
        )}

        {/* Features Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-display text-charcoal-deep mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'Add Destination',
                description: 'Tell us where you\'re going and when'
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Select Occasions',
                description: 'Choose your planned activities and events'
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Get Recommendations',
                description: 'AI suggests pieces from your wardrobe perfectly suited for your trip'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-xl p-6 border border-stone/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="w-12 h-12 bg-gold-soft/10 rounded-full flex items-center justify-center text-gold-soft mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-charcoal-deep mb-2">{feature.title}</h3>
                <p className="text-sm text-stone/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
