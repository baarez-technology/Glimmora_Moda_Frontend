'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import { fetchCollectionDetail, fetchCollectionBasicInfo, updateCollection } from '@/services/brand-collection.service';
import { uploadImage } from '@/services/brand-product.service';
import type { CollectionDetailResponse } from '@/services/brand-collection.service';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function EditCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<CollectionDetailResponse | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season: 'Spring/Summer',
    year: new Date().getFullYear().toString(),
    status: 'draft',
  });
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    setIsLoading(true);
    try {
      const [data, basicInfo] = await Promise.all([
        fetchCollectionDetail(collectionId),
        fetchCollectionBasicInfo(collectionId),
      ]);
      setCollection(data);
      setIsActive(basicInfo?.is_active ?? false);
      setFormData({
        name: data.collection_name,
        description: data.collection_description,
        season: data.season,
        year: data.year,
        status: data.collection_status,
      });
      if (data.collection_image) {
        setHeroPreview(data.collection_image);
        setExistingImageUrl(data.collection_image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setIsLoading(false);
    }
  };

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

    setHeroFile(file);
    const url = URL.createObjectURL(file);
    setHeroPreview(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetImage(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetImage(file);
  };

  const removeImage = () => {
    if (heroPreview && heroFile) URL.revokeObjectURL(heroPreview);
    setHeroFile(null);
    setHeroPreview(null);
    setExistingImageUrl('');
    setImageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      let imageUrl = existingImageUrl;
      if (heroFile) {
        imageUrl = await uploadImage(heroFile);
      }

      await updateCollection(collectionId, {
        collection_name: formData.name,
        season: formData.season,
        year: formData.year,
        status: formData.status,
        collection_description: formData.description,
        collection_image: imageUrl,
      });

      router.push(`/brand/collections/${collectionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-taupe" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">{error || 'Collection not found'}</p>
        <Link
          href="/brand/collections"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-sand px-8 py-6">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/brand/collections" className="text-taupe hover:text-charcoal-deep transition-colors">
            Collections
          </Link>
          <span className="text-taupe">/</span>
          <Link href={`/brand/collections/${collectionId}`} className="text-taupe hover:text-charcoal-deep transition-colors">
            {collection.collection_name}
          </Link>
          <span className="text-taupe">/</span>
          <span className="text-charcoal-deep">Edit</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-charcoal-deep">Edit Collection</h1>
          <Link
            href={`/brand/collections/${collectionId}`}
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
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
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
                  unoptimized
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
                {heroFile && (
                  <p className="mt-2 text-xs text-taupe">
                    {heroFile.name} ({(heroFile.size / (1024 * 1024)).toFixed(1)}MB)
                  </p>
                )}
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
              href={`/brand/collections/${collectionId}`}
              className="px-6 py-3 text-sm text-stone hover:text-charcoal-deep transition-colors"
            >
              Cancel
            </Link>
            {isActive && (
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
