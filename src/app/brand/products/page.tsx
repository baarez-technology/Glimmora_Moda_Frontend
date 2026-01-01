'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandProductsPage() {
  const router = useRouter();
  const { isBrand, brandPartner, brandProductInventory } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  if (!isBrand || !brandPartner || !brandProductInventory) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'low_stock':
        return <AlertCircle size={14} className="text-gold-soft" />;
      case 'out_of_stock':
        return <AlertCircle size={14} className="text-red-400" />;
      default:
        return <Package size={14} className="text-sand" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-400 bg-green-400/10';
      case 'low_stock':
        return 'text-gold-soft bg-gold-soft/10';
      case 'out_of_stock':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-sand bg-sand/10';
    }
  };

  const filteredProducts = filter === 'all'
    ? brandProductInventory
    : brandProductInventory.filter(p => p.availability.overallStatus === filter);

  const counts = {
    all: brandProductInventory.length,
    in_stock: brandProductInventory.filter(p => p.availability.overallStatus === 'in_stock').length,
    low_stock: brandProductInventory.filter(p => p.availability.overallStatus === 'low_stock').length,
    out_of_stock: brandProductInventory.filter(p => p.availability.overallStatus === 'out_of_stock').length,
  };

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
              <h1 className="font-display text-2xl text-ivory-cream">Product Management</h1>
              <p className="text-sm text-taupe">Inventory & availability</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-ivory-cream text-charcoal-deep'
                  : 'bg-noir border border-sand/10 text-sand hover:text-ivory-cream'
              }`}
            >
              {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({counts[status]})
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-noir border border-sand/10 overflow-hidden hover:border-sand/30 transition-colors"
            >
              {/* Product Image */}
              <div className="aspect-square relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusColor(product.availability.overallStatus)}`}>
                    {product.availability.overallStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-ivory-cream font-medium">{product.name}</h3>
                    <p className="text-xs text-taupe">{product.sku}</p>
                  </div>
                  <span className="text-ivory-cream font-display">€{product.price.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-charcoal-deep text-xs text-sand capitalize">{product.category}</span>
                  <span className="px-2 py-0.5 bg-charcoal-deep text-xs text-sand">{product.collection}</span>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-sand/10">
                  <div>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Total</span>
                    <span className="text-ivory-cream">{product.availability.totalQuantity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Available</span>
                    <span className="text-green-400">{product.availability.availableQuantity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Reserved</span>
                    <span className="text-gold-soft">{product.availability.reservedQuantity}</span>
                  </div>
                </div>

                {/* Demand Score */}
                <div className="mt-4 pt-4 border-t border-sand/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-taupe flex items-center gap-1">
                      <TrendingUp size={12} />
                      Demand Score
                    </span>
                    <span className="text-ivory-cream">{product.demandScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-charcoal-deep rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        product.demandScore >= 90 ? 'bg-green-400' :
                        product.demandScore >= 70 ? 'bg-gold-soft' :
                        'bg-sand'
                      }`}
                      style={{ width: `${product.demandScore}%` }}
                    />
                  </div>
                </div>

                {/* Restock Info */}
                {product.availability.restockDate && (
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <Clock size={12} className="text-taupe" />
                    <span className="text-taupe">Restock:</span>
                    <span className="text-ivory-cream">
                      {new Date(product.availability.restockDate).toLocaleDateString()} ({product.availability.restockQuantity} units)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="text-sand/30 mx-auto mb-4" />
            <p className="text-taupe">No products found with this filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
