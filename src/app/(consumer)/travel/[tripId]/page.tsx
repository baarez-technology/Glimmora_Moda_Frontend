'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Sun, Cloud, Thermometer, Check, Plus, Sparkles, Briefcase, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Trip, PackingItem, Product } from '@/types';
import * as productService from '@/services/product.service';
import * as intelligenceService from '@/services/intelligence.service';

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

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['essentials', 'outfits']);

  // Load trip data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('modaglimmora_trips');
      const trips = saved ? JSON.parse(saved) : sampleTrips;
      const foundTrip = trips.find((t: Trip) => t.id === tripId);
      if (foundTrip) {
        setTrip(foundTrip);
        // Generate packing list if empty
        if (!foundTrip.packingList || foundTrip.packingList.length === 0) {
          const loadPacking = async () => {
            const response = await intelligenceService.getPackingRecommendations(foundTrip);
            setPackingList(response.data);
          };
          loadPacking();
        } else {
          setPackingList(foundTrip.packingList);
        }
      }
    }
  }, [tripId]);

  // Get recommendations
  useEffect(() => {
    if (trip) {
      const loadProducts = async () => {
        const response = await productService.getAllProducts();
        const allProducts = response.data;
        // Filter products based on trip attributes
        const filtered = allProducts.filter(p => {
          if (trip.activities.includes('beach')) {
            return p.category === 'clothing' || p.category === 'accessories';
          }
          return true;
        }).slice(0, 6);
        setRecommendations(filtered);
      };
      loadProducts();
    }
  }, [trip]);

  const togglePacked = (itemId: string) => {
    setPackingList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <p className="text-stone/60">Loading trip...</p>
      </div>
    );
  }

  // Group packing items by category
  const groupedItems = packingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const packedCount = packingList.filter(i => i.packed).length;
  const totalCount = packingList.length;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/travel"
              className="flex items-center gap-2 text-stone/70 hover:text-charcoal-deep transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">All Trips</span>
            </Link>

            <div className="text-center">
              <h1 className="font-display text-lg text-charcoal-deep">{trip.name}</h1>
              <div className="flex items-center justify-center gap-1 text-xs text-stone/60">
                <MapPin className="w-3 h-3" />
                <span>{trip.destination}</span>
              </div>
            </div>

            <div className="w-24 text-right">
              <span className="text-sm text-stone/60">{packedCount}/{totalCount}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Overview Card */}
            <motion.div
              className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display mb-2">{trip.name}</h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {trip.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(trip.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="text-4xl">
                  {trip.activities.includes('beach') ? '🏖️' : trip.activities.includes('outdoor') ? '🏔️' : '🌸'}
                </div>
              </div>

              {/* Weather Forecast (Mock) */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-white/60 mb-3">Weather Forecast</p>
                <div className="flex justify-between">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                    <div key={day} className="text-center">
                      <p className="text-xs text-white/60 mb-1">{day}</p>
                      {i % 2 === 0 ? <Sun className="w-5 h-5 mx-auto mb-1" /> : <Cloud className="w-5 h-5 mx-auto mb-1" />}
                      <p className="text-sm">{18 + i}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Packing Progress */}
            <motion.div
              className="bg-white rounded-xl border border-stone/20 p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-charcoal-deep flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gold-soft" />
                  Packing Progress
                </h3>
                <span className="text-sm text-stone/60">
                  {Math.round((packedCount / totalCount) * 100)}% complete
                </span>
              </div>
              <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-soft rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(packedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Packing List by Category */}
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, items], index) => (
                <motion.div
                  key={category}
                  className="bg-white rounded-xl border border-stone/20 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-charcoal-deep capitalize">{category}</span>
                      <span className="text-xs text-stone/50">
                        {items.filter(i => i.packed).length}/{items.length}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedCategories.includes(category) ? 180 : 0 }}
                    >
                      <ChevronDown className="w-5 h-5 text-stone/40" />
                    </motion.div>
                  </button>

                  {expandedCategories.includes(category) && (
                    <div className="px-5 pb-4 space-y-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => togglePacked(item.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone/5 transition-colors text-left"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.packed ? 'bg-emerald-500 border-emerald-500' : 'border-stone/30'
                          }`}>
                            {item.packed && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${item.packed ? 'text-stone/50 line-through' : 'text-charcoal-deep'}`}>
                              {item.name}
                            </p>
                            {item.productId && (
                              <p className="text-xs text-gold-soft">From your wardrobe</p>
                            )}
                          </div>
                          {item.quantity > 1 && (
                            <span className="text-xs text-stone/50">×{item.quantity}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <motion.div
              className="bg-white rounded-xl border border-stone/20 p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-gold-soft" />
                <h3 className="font-medium text-charcoal-deep">Recommended for This Trip</h3>
              </div>

              <div className="space-y-3">
                {recommendations.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}?productId=${product.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone/5 transition-colors"
                  >
                    <div className="w-14 h-14 bg-stone/10 rounded-lg overflow-hidden relative">
                      <Image
                        src={product.images[0]?.url || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
                      <p className="text-xs text-stone/60">{product.brandName}</p>
                    </div>
                    <Plus className="w-4 h-4 text-gold-soft" />
                  </Link>
                ))}
              </div>

              <Link
                href="/collections"
                className="block mt-4 text-center text-sm text-gold-soft hover:underline"
              >
                Browse all recommendations
              </Link>
            </motion.div>

            {/* Activities */}
            <motion.div
              className="bg-white rounded-xl border border-stone/20 p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-medium text-charcoal-deep mb-4">Planned Activities</h3>
              <div className="space-y-2">
                {trip.activities?.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-stone/5 rounded-lg"
                  >
                    <span className="text-lg">
                      {activity === 'formal' ? '🍽️' :
                       activity === 'beach' ? '🏖️' :
                       activity === 'business' ? '💼' :
                       activity === 'cultural' ? '🎭' :
                       activity === 'nightlife' ? '✨' :
                       activity === 'wellness' ? '🧘' : '📍'}
                    </span>
                    <span className="text-sm text-charcoal-deep capitalize">
                      {activity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Packing Tips */}
            <motion.div
              className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-5 border border-sky-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-5 h-5 text-sky-600" />
                <h3 className="font-medium text-charcoal-deep">Packing Tips</h3>
              </div>
              <p className="text-sm text-stone/70 leading-relaxed">
                {trip.activities.includes('beach')
                  ? 'Pack light, breathable fabrics. Don\'t forget sunscreen and a hat!'
                  : trip.activities.includes('outdoor')
                  ? 'Layer up! Bring thermal underlayers and a quality coat.'
                  : 'Pack versatile pieces that can be dressed up or down for your various activities.'}
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
