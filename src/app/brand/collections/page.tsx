'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Layers,
  Calendar,
  Package,
  TrendingUp,
  Star,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandCollectionsPage() {
  const router = useRouter();
  const { isBrand, brandPartner, brandCollections } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  if (!isBrand || !brandPartner || !brandCollections) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-400/10 text-green-400';
      case 'preview':
        return 'bg-blue-400/10 text-blue-400';
      case 'archived':
        return 'bg-sand/10 text-sand';
      default:
        return 'bg-sand/10 text-sand';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={12} />;
      case 'preview':
        return <Eye size={12} />;
      case 'archived':
        return <Clock size={12} />;
      default:
        return <Layers size={12} />;
    }
  };

  // Sort collections: active first, then preview, then archived
  const sortedCollections = [...brandCollections].sort((a, b) => {
    const order = { active: 0, preview: 1, archived: 2 };
    return (order[a.status as keyof typeof order] || 3) - (order[b.status as keyof typeof order] || 3);
  });

  const activeCollections = sortedCollections.filter(c => c.status === 'active');
  const previewCollections = sortedCollections.filter(c => c.status === 'preview');
  const archivedCollections = sortedCollections.filter(c => c.status === 'archived');

  const selectedCollectionData = brandCollections.find(c => c.id === selectedCollection);

  const totalProducts = brandCollections.reduce((sum, c) => sum + c.productCount, 0);
  const totalSales = brandCollections.reduce((sum, c) => sum + (c.performance?.totalSales || 0), 0);

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Header */}
      <header className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="w-10 h-10 bg-noir border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
            >
              <ArrowLeft size={18} className="text-ivory-cream" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-ivory-cream">Collections</h1>
              <p className="text-sm text-taupe">Seasonal & core collections</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Total Collections</span>
            <span className="font-display text-2xl text-ivory-cream">{brandCollections.length}</span>
          </div>
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Active</span>
            <span className="font-display text-2xl text-green-400">{activeCollections.length}</span>
          </div>
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Total Products</span>
            <span className="font-display text-2xl text-ivory-cream">{totalProducts}</span>
          </div>
          <div className="bg-noir border border-sand/10 p-5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Total Revenue</span>
            <span className="font-display text-2xl text-ivory-cream">€{(totalSales / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Collections List */}
          <div className="lg:col-span-2">
            {/* Active Collections */}
            {activeCollections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Active Collections ({activeCollections.length})
                </h2>
                <div className="space-y-4">
                  {activeCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      className={`w-full text-left overflow-hidden border transition-all ${
                        selectedCollection === collection.id
                          ? 'border-gold-soft/50 bg-gold-soft/5'
                          : 'border-sand/10 bg-noir hover:border-sand/30'
                      }`}
                    >
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={collection.heroImage}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-ivory-cream font-medium">{collection.name}</h3>
                              <p className="text-xs text-taupe">{collection.season} {collection.year}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase flex items-center gap-1 ${getStatusColor(collection.status)}`}>
                              {getStatusIcon(collection.status)}
                              {collection.status}
                            </span>
                          </div>
                          <p className="text-sm text-sand line-clamp-2 mb-3">{collection.description}</p>
                          <div className="flex items-center gap-6 text-xs">
                            <span className="flex items-center gap-1 text-taupe">
                              <Package size={12} />
                              {collection.productCount} products
                            </span>
                            {collection.performance && (
                              <>
                                <span className="flex items-center gap-1 text-green-400">
                                  <TrendingUp size={12} />
                                  €{(collection.performance.totalSales / 1000).toFixed(0)}k
                                </span>
                                <span className="flex items-center gap-1 text-gold-soft">
                                  <Star size={12} />
                                  {collection.performance.averageRating}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Collections */}
            {previewCollections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm text-blue-400 mb-4 flex items-center gap-2">
                  <Eye size={14} />
                  Coming Soon ({previewCollections.length})
                </h2>
                <div className="space-y-4">
                  {previewCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      className={`w-full text-left overflow-hidden border transition-all ${
                        selectedCollection === collection.id
                          ? 'border-gold-soft/50 bg-gold-soft/5'
                          : 'border-sand/10 bg-noir hover:border-sand/30'
                      }`}
                    >
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0 relative">
                          <img
                            src={collection.heroImage}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-charcoal-deep/30 flex items-center justify-center">
                            <Eye size={24} className="text-ivory-cream/50" />
                          </div>
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-ivory-cream font-medium">{collection.name}</h3>
                              <p className="text-xs text-taupe">{collection.season} {collection.year}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase flex items-center gap-1 ${getStatusColor(collection.status)}`}>
                              {getStatusIcon(collection.status)}
                              {collection.status}
                            </span>
                          </div>
                          <p className="text-sm text-sand line-clamp-2 mb-3">{collection.description}</p>
                          <div className="flex items-center gap-6 text-xs">
                            <span className="flex items-center gap-1 text-taupe">
                              <Package size={12} />
                              {collection.productCount} products
                            </span>
                            <span className="flex items-center gap-1 text-blue-400">
                              <Calendar size={12} />
                              Launches {new Date(collection.launchDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Archived Collections */}
            {archivedCollections.length > 0 && (
              <div>
                <h2 className="text-sm text-sand mb-4 flex items-center gap-2">
                  <Clock size={14} />
                  Archived ({archivedCollections.length})
                </h2>
                <div className="space-y-4">
                  {archivedCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      className={`w-full text-left overflow-hidden border transition-all opacity-70 hover:opacity-100 ${
                        selectedCollection === collection.id
                          ? 'border-gold-soft/50 bg-gold-soft/5'
                          : 'border-sand/10 bg-noir hover:border-sand/30'
                      }`}
                    >
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0 grayscale">
                          <img
                            src={collection.heroImage}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-ivory-cream font-medium">{collection.name}</h3>
                              <p className="text-xs text-taupe">{collection.season} {collection.year}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase flex items-center gap-1 ${getStatusColor(collection.status)}`}>
                              {getStatusIcon(collection.status)}
                              {collection.status}
                            </span>
                          </div>
                          <p className="text-sm text-sand line-clamp-2 mb-3">{collection.description}</p>
                          <div className="flex items-center gap-6 text-xs">
                            <span className="flex items-center gap-1 text-taupe">
                              <Package size={12} />
                              {collection.productCount} products
                            </span>
                            {collection.performance && (
                              <span className="flex items-center gap-1 text-taupe">
                                <TrendingUp size={12} />
                                €{(collection.performance.totalSales / 1000).toFixed(0)}k total
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Collection Detail */}
          <div className="lg:col-span-1">
            {selectedCollectionData ? (
              <div className="bg-noir border border-sand/10 overflow-hidden sticky top-6">
                <div className="aspect-video relative">
                  <img
                    src={selectedCollectionData.heroImage}
                    alt={selectedCollectionData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase items-center gap-1 ${getStatusColor(selectedCollectionData.status)}`}>
                      {getStatusIcon(selectedCollectionData.status)}
                      {selectedCollectionData.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="font-display text-xl text-ivory-cream mb-1">{selectedCollectionData.name}</h2>
                  <p className="text-sm text-taupe mb-4">{selectedCollectionData.season} {selectedCollectionData.year}</p>
                  <p className="text-sm text-sand leading-relaxed mb-6">{selectedCollectionData.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-charcoal-deep/50 border border-sand/5">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Products</span>
                      <span className="text-ivory-cream font-display text-lg">{selectedCollectionData.productCount}</span>
                    </div>
                    <div className="p-3 bg-charcoal-deep/50 border border-sand/5">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Launch Date</span>
                      <span className="text-ivory-cream text-sm">
                        {new Date(selectedCollectionData.launchDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {selectedCollectionData.performance && (
                    <div className="mb-6">
                      <h3 className="text-xs text-taupe uppercase tracking-wider mb-3">Performance</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sand">Total Sales</span>
                          <span className="text-ivory-cream font-display">
                            €{(selectedCollectionData.performance.totalSales / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sand">Average Rating</span>
                          <span className="text-gold-soft font-display flex items-center gap-1">
                            <Star size={14} />
                            {selectedCollectionData.performance.averageRating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sand">Top Product</span>
                          <span className="text-ivory-cream text-sm truncate max-w-[120px]">
                            {selectedCollectionData.performance.topProduct}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-ivory-cream text-charcoal-deep text-sm tracking-wider uppercase hover:bg-ivory-cream/90 transition-colors">
                      View Products
                    </button>
                    <button className="flex-1 py-2.5 border border-sand/20 text-sand text-sm tracking-wider uppercase hover:border-sand/40 hover:text-ivory-cream transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-noir border border-sand/10 p-12 text-center sticky top-6">
                <Layers size={48} className="text-sand/30 mx-auto mb-4" />
                <p className="text-taupe">Select a collection to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
