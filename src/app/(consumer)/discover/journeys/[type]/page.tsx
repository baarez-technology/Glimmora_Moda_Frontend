'use client';

import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Globe, Gem, History } from 'lucide-react';
import Link from 'next/link';
import * as intelligenceService from '@/services/intelligence.service';
import JourneyPath from '@/components/discover/JourneyPath';
import type { CulturalJourney } from '@/types/heritage';

const journeyTypeConfig = {
  art: {
    icon: <Palette className="w-6 h-6" />,
    gradient: 'from-rose-500 to-pink-500',
    title: 'Art Journeys',
    subtitle: 'Explore fashion through the lens of fine art'
  },
  travel: {
    icon: <Globe className="w-6 h-6" />,
    gradient: 'from-sky-500 to-blue-500',
    title: 'Travel Journeys',
    subtitle: 'Discover fashion inspired by global destinations'
  },
  craft: {
    icon: <Gem className="w-6 h-6" />,
    gradient: 'from-amber-500 to-yellow-500',
    title: 'Craft Journeys',
    subtitle: 'Appreciate the artisans behind luxury'
  },
  era: {
    icon: <History className="w-6 h-6" />,
    gradient: 'from-purple-500 to-violet-500',
    title: 'Era Journeys',
    subtitle: 'Travel through fashion history'
  }
};

interface JourneyTypePageProps {
  params: Promise<{ type: string }>;
}

export default function JourneyTypePage({ params }: JourneyTypePageProps) {
  const { type } = use(params);
  const searchParams = useSearchParams();
  const selectedJourneyId = searchParams.get('journey');

  const [typeJourneys, setTypeJourneys] = useState<CulturalJourney[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJourneys = async () => {
      setLoading(true);
      const response = await intelligenceService.getCulturalJourneysByType(type);
      setTypeJourneys(response.data);
      setLoading(false);
    };
    loadJourneys();
  }, [type]);

  const config = journeyTypeConfig[type as keyof typeof journeyTypeConfig] || journeyTypeConfig.art;

  // Find selected journey or default to first
  const selectedJourney = selectedJourneyId
    ? typeJourneys.find(j => j.id === selectedJourneyId) || typeJourneys[0]
    : typeJourneys[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (typeJourneys.length === 0) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone/60 mb-4">No journeys available for this type</p>
          <Link href="/discover/journeys" className="text-gold-soft hover:underline">
            Back to all journeys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <motion.header
        className={`sticky top-0 z-40 bg-gradient-to-r ${config.gradient} text-white`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/discover/journeys"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">All Journeys</span>
            </Link>

            <div className="flex items-center gap-3">
              {config.icon}
              <span className="font-display text-lg">{config.title}</span>
            </div>

            <div className="w-24" /> {/* Spacer for alignment */}
          </div>
        </div>
      </motion.header>

      {/* Journey Selector (if multiple journeys) */}
      {typeJourneys.length > 1 && (
        <div className="max-w-7xl mx-auto px-6 py-6 border-b border-stone/10">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {typeJourneys.map((journey) => (
              <Link
                key={journey.id}
                href={`/discover/journeys/${type}?journey=${journey.id}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                  selectedJourney?.id === journey.id
                    ? `bg-gradient-to-r ${config.gradient} text-white`
                    : 'bg-white text-charcoal-deep hover:bg-stone/10'
                }`}
              >
                {journey.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Journey Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedJourney && (
            <JourneyPath journey={selectedJourney} />
          )}
        </motion.div>

        {/* Related Journeys */}
        {typeJourneys.length > 1 && (
          <motion.section
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-display text-charcoal-deep mb-6">More {config.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typeJourneys
                .filter(j => j.id !== selectedJourney?.id)
                .map((journey) => (
                  <Link
                    key={journey.id}
                    href={`/discover/journeys/${type}?journey=${journey.id}`}
                    className="group bg-white rounded-xl p-5 border border-stone/20 hover:shadow-lg transition-all"
                  >
                    <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-soft transition-colors mb-2">
                      {journey.title}
                    </h3>
                    <p className="text-sm text-stone/70 line-clamp-2 mb-3">
                      {journey.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-stone/50">
                      <span>{journey.stops.length} stops</span>
                      <span>{journey.duration}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
