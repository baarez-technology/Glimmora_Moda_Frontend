'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Grid, List, Sparkles, Calendar, Tag } from 'lucide-react';
import { mockUser, products, mockWardrobeAnalysis } from '@/data/mock-data';
import WardrobeGapAnalysis from '@/components/wardrobe/WardrobeGapAnalysis';

export default function WardrobePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const wardrobe = mockUser.wardrobe;

  const suggestedOutfits = [
    {
      name: 'Power Meeting',
      pieces: ['Bar Jacket', 'Navy Trousers', 'Silk Blouse'],
      occasion: 'Professional'
    },
    {
      name: 'Gallery Evening',
      pieces: ['Bar Jacket', 'Wide-leg Pants', 'Statement Earrings'],
      occasion: 'Art & Culture'
    }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-charcoal-deep">
              Your Digital Wardrobe
            </h1>
            <p className="text-stone mt-2">
              {wardrobe.length} piece{wardrobe.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-parchment' : ''}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-parchment' : ''}`}
              >
                <List size={18} />
              </button>
            </div>

            <button className="btn-primary">
              <Plus size={18} />
              Add Piece
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Wardrobe Items */}
          <div className="lg:col-span-3">
            {wardrobe.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
                {wardrobe.map((item) => (
                  viewMode === 'grid' ? (
                    <Link
                      key={item.id}
                      href={`/product/${item.product.slug}`}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white mb-3">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-xs tracking-[0.15em] uppercase text-greige">
                        {item.product.brandName}
                      </p>
                      <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-stone">
                        <Calendar size={14} />
                        <span>Worn {item.wearCount} times</span>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      key={item.id}
                      href={`/product/${item.product.slug}`}
                      className="flex gap-6 p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs tracking-[0.15em] uppercase text-greige">
                          {item.product.brandName}
                        </p>
                        <h3 className="font-display text-lg text-charcoal-deep">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-3 text-sm text-stone">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Worn {item.wearCount} times
                          </span>
                          {item.lastWorn && (
                            <span>Last worn: {item.lastWorn}</span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          {item.product.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-parchment text-xs text-stone rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl">
                <Tag size={48} className="mx-auto text-greige mb-4" />
                <h3 className="font-display text-xl text-charcoal-deep mb-2">
                  Your wardrobe is empty
                </h3>
                <p className="text-stone mb-6 max-w-md mx-auto">
                  Add pieces you already own to get personalized outfit suggestions
                  and track your style journey.
                </p>
                <button className="btn-primary">
                  <Plus size={18} />
                  Add Your First Piece
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Outfit Suggestions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-gold-muted" />
                <h3 className="font-display text-lg text-charcoal-deep">Outfit Ideas</h3>
              </div>

              <div className="space-y-4">
                {suggestedOutfits.map((outfit, index) => (
                  <div key={index} className="p-4 bg-parchment rounded-lg">
                    <h4 className="font-medium text-charcoal-deep mb-2">{outfit.name}</h4>
                    <p className="text-sm text-stone mb-2">
                      {outfit.pieces.join(' + ')}
                    </p>
                    <span className="text-xs text-greige">{outfit.occasion}</span>
                  </div>
                ))}
              </div>

              <button className="w-full text-sm text-gold-muted hover:text-gold-deep mt-4">
                See More Ideas
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Wardrobe Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-stone">Total Pieces</span>
                  <span className="font-medium text-charcoal-deep">{wardrobe.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-stone">Total Wears</span>
                  <span className="font-medium text-charcoal-deep">
                    {wardrobe.reduce((sum, item) => sum + item.wearCount, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-stone">Brands</span>
                  <span className="font-medium text-charcoal-deep">
                    {new Set(wardrobe.map(item => item.product.brandId)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wardrobe Gap Analysis - Full Width Section */}
        <div className="mt-12">
          <WardrobeGapAnalysis analysis={mockWardrobeAnalysis} />
        </div>
      </div>
    </div>
  );
}
