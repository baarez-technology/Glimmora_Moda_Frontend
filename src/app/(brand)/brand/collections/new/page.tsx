'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';

export default function NewCollectionPage() {
  const router = useRouter();
  const { products, createCollection } = useBrand();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season: 'Spring/Summer',
    year: new Date().getFullYear().toString(),
    status: 'draft' as 'draft' | 'published'
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCollection({
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description,
      season: formData.season,
      year: parseInt(formData.year),
      heroImage: '/images/collections/placeholder.jpg',
      status: formData.status,
      productIds: selectedProducts,
      productCount: selectedProducts.length,
      totalRevenue: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push('/brand/collections');
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-sand px-8 py-6">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/brand/collections" className="text-taupe hover:text-charcoal-deep transition-colors">
            Collections
          </Link>
          <span className="text-taupe">/</span>
          <span className="text-charcoal-deep">New Collection</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-charcoal-deep">Create Collection</h1>
          <Link
            href="/brand/collections"
            className="flex items-center gap-2 px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
          >
            <ArrowLeft size={16} />
            Cancel
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 max-w-4xl">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white border border-sand/50 p-6">
            <h2 className="font-display text-lg text-charcoal-deep mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="e.g., Spring/Summer 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                    Season *
                  </label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white"
                  >
                    <option value="Spring/Summer">Spring/Summer</option>
                    <option value="Autumn/Winter">Autumn/Winter</option>
                    <option value="Resort">Resort</option>
                    <option value="Pre-Fall">Pre-Fall</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white"
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-sand/50 p-6">
            <h2 className="font-display text-lg text-charcoal-deep mb-6">Description</h2>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                Collection Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                placeholder="Describe the collection, its inspiration, and key themes..."
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-white border border-sand/50 p-6">
            <h2 className="font-display text-lg text-charcoal-deep mb-6">Hero Image</h2>

            <div className="border-2 border-dashed border-sand hover:border-taupe transition-colors p-8">
              <div className="text-center">
                <Upload size={32} className="mx-auto text-taupe mb-3" />
                <p className="text-sm text-stone mb-1">Drop image here or click to upload</p>
                <p className="text-xs text-taupe">PNG, JPG up to 10MB</p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 text-sm text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors"
                >
                  Select File
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border border-sand/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg text-charcoal-deep">Products</h2>
              <span className="text-sm text-taupe">{selectedProducts.length} selected</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
              {products.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`p-3 border text-left transition-all ${
                    selectedProducts.includes(product.id)
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand/50 hover:border-sand'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-charcoal-deep truncate">{product.name}</p>
                    {selectedProducts.includes(product.id) ? (
                      <X size={14} className="text-charcoal-deep flex-shrink-0" />
                    ) : (
                      <Plus size={14} className="text-taupe flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-taupe">{product.sku}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/brand/collections"
              className="px-6 py-3 text-sm text-stone hover:text-charcoal-deep transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors"
            >
              Create Collection
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
