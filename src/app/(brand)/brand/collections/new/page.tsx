'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';

export default function NewCollectionPage() {
  const router = useRouter();
  const { createCollection } = useBrand();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season: 'Spring/Summer',
    year: new Date().getFullYear().toString(),
    heroImage: '',
    status: 'draft' as 'draft' | 'published',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    createCollection({
      name: formData.name.trim(),
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description,
      season: formData.season,
      year: parseInt(formData.year),
      heroImage: formData.heroImage || '/images/collections/placeholder.jpg',
      status: formData.status,
      productIds: [],
      productCount: 0,
      totalRevenue: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setTimeout(() => {
      router.push('/brand/collections');
    }, 500);
  };

  return (
    <div>
      <BrandPageHeader
        title="Create Collection"
        breadcrumbs={[
          { label: 'Collections', href: '/brand/collections' },
          { label: 'New Collection' },
        ]}
        actions={
          <SecondaryButton href="/brand/collections" icon={ArrowLeft}>
            Cancel
          </SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Basic Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Spring/Summer 2025"
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
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
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
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
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
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
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Description</h2>
          </div>
          <div className="p-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
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
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Hero Image</h2>
          </div>
          <div className="p-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
              Image URL
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                value={formData.heroImage}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              {formData.heroImage && (
                <div className="w-20 h-12 bg-parchment flex-shrink-0">
                  <img
                    src={formData.heroImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-taupe mt-1">
              Paste a URL for the collection hero image
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/brand/collections"
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
