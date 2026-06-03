'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Palette, Globe, Gem, History, ArrowRight, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import * as intelligenceService from '@/services/intelligence.service';
import type { CulturalJourney } from '@/types/heritage';

const journeyTypeConfig: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  bgImage: string;
  description: string;
}> = {
  art: {
    icon: <Palette className="w-8 h-8" />,
    gradient: 'from-rose-500 to-pink-500',
    bgImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    description: 'Explore the intersection of fashion and fine art'
  },
  travel: {
    icon: <Globe className="w-8 h-8" />,
    gradient: 'from-sky-500 to-blue-500',
    bgImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    description: 'Discover fashion through the lens of global destinations'
  },
  craft: {
    icon: <Gem className="w-8 h-8" />,
    gradient: 'from-amber-500 to-yellow-500',
    bgImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    description: 'Appreciate the artisans and techniques behind luxury'
  },
  eras: {
    icon: <History className="w-8 h-8" />,
    gradient: 'from-purple-500 to-violet-500',
    bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    description: 'Travel through time and fashion history'
  },
  icons: {
    icon: <Compass className="w-8 h-8" />,
    gradient: 'from-emerald-500 to-teal-500',
    bgImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    description: 'Learn about legendary style icons and their influence'
  },
  sustainability: {
    icon: <Globe className="w-8 h-8" />,
    gradient: 'from-green-500 to-emerald-500',
    bgImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    description: 'Discover the future of conscious fashion'
  }
};

// Default config for any missing journey types
const defaultJourneyConfig = {
  icon: <Compass className="w-8 h-8" />,
  gradient: 'from-stone-500 to-gray-500',
  bgImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
  description: 'Explore this journey'
};

export default function JourneysPage() {
  const [culturalJourneys, setCulturalJourneys] = useState<CulturalJourney[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const journeysRes = await intelligenceService.getCulturalJourneys();
        setCulturalJourneys(journeysRes.data ?? []);
      } catch (error) {
        console.error('Failed to load cultural journeys:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Group journeys by type
  const journeysByType = culturalJourneys.reduce((acc, journey) => {
    if (!acc[journey.type]) {
      acc[journey.type] = [];
    }
    acc[journey.type].push(journey);
    return acc;
  }, {} as Record<string, CulturalJourney[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep to-charcoal-deep/90" />
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-gold-soft blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ top: '20%', left: '30%' }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-gold-soft mb-4"
          >
            <Compass className="w-6 h-6" />
            <span className="text-sm tracking-[0.2em] uppercase">Cultural Journeys</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-display text-ivory-cream mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Discover Fashion Through Story
          </motion.h1>

          <motion.p
            className="text-lg text-ivory-cream/70 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Curated journeys that connect you to the art, craft, travel, and history behind luxury fashion
          </motion.p>
        </div>
      </section>

      {/* Journey Types Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(journeyTypeConfig).map(([type, config], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/discover/journeys/${type}`}>
                <div className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${config.bgImage})` }}
                  />

                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} opacity-80`} />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="mb-4 transform transition-transform group-hover:-translate-y-2">
                      {config.icon}
                    </div>
                    <h3 className="text-2xl font-display capitalize mb-2">{type}</h3>
                    <p className="text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      {config.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Journeys */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-display text-charcoal-deep mb-2">All Journeys</h2>
          <p className="text-stone/70 mb-8">Choose your path of discovery</p>

          <div className="space-y-12">
            {Object.entries(journeysByType).map(([type, journeys]) => {
              const config = journeyTypeConfig[type] || defaultJourneyConfig;

              return (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center text-white`}>
                      {config.icon}
                    </div>
                    <h3 className="text-xl font-display text-charcoal-deep capitalize">{type} Journeys</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {journeys.map((journey, index) => (
                      <motion.div
                        key={journey.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={`/discover/journeys/${journey.type}?journey=${journey.id}`}>
                          <div className="group bg-white rounded-xl border border-stone/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Card header with gradient */}
                            <div className={`h-32 bg-gradient-to-r ${config.gradient} relative overflow-hidden`}>
                              <div className="absolute inset-0 opacity-30">
                                <motion.div
                                  className="absolute w-32 h-32 rounded-full bg-white blur-2xl"
                                  animate={{ x: [0, 30, 0] }}
                                  transition={{ duration: 5, repeat: Infinity }}
                                  style={{ top: '-20%', right: '-10%' }}
                                />
                              </div>
                              <div className="absolute bottom-4 left-4 text-white">
                                {config.icon}
                              </div>
                            </div>

                            {/* Card content */}
                            <div className="p-5">
                              <h4 className="font-display text-lg text-charcoal-deep mb-2 group-hover:text-gold-soft transition-colors">
                                {journey.title}
                              </h4>
                              <p className="text-sm text-stone/70 line-clamp-2 mb-4">
                                {journey.description}
                              </p>

                              <div className="flex items-center justify-between text-xs text-stone/50">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {journey.stops.length} stops
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {journey.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
