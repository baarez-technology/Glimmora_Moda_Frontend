'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetImage = (file: File) => {
    setImageError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please upload a PNG, JPG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError(`File too large. Maximum size is 10MB (yours: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setHeroImage(file);
    const url = URL.createObjectURL(file);
    setHeroPreview(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetImage(file);
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetImage(file);
  };

  const removeImage = () => {
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroImage(null);
    setHeroPreview(null);
    setImageError(null);
  };

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
      productIds: [],
      productCount: 0,
      totalRevenue: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    // In a real app, this would save to the backend
    console.log('Creating collection:', formData);
    router.push('/brand/collections');
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

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {heroPreview ? (
              <div className="relative group">
                <Image
                  src={heroPreview}
                  alt="Hero preview"
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover border border-sand"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm bg-white text-charcoal-deep hover:bg-parchment transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-xs text-taupe">
                  {heroImage?.name} ({(heroImage!.size / (1024 * 1024)).toFixed(1)}MB)
                </p>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sand hover:border-taupe transition-colors p-8 cursor-pointer"
              >
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-taupe mb-3" />
                  <p className="text-sm text-stone mb-1">Drop image here or click to upload</p>
                  <p className="text-xs text-taupe">PNG, JPG, WebP up to 10MB</p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 text-sm text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {imageError && (
              <p className="mt-3 text-sm text-red-600">{imageError}</p>
            )}
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
