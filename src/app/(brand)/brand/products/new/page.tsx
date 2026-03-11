'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { CoverImageUpload } from '@/components/brand/CoverImageUpload';
import { createProduct, fetchCollectionNames, type CollectionNameItem } from '@/services/brand-product.service';

type BrandProductStatus = 'draft' | 'active' | 'archived';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [collectionNames, setCollectionNames] = useState<CollectionNameItem[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Sizes state
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');

  useEffect(() => {
    fetchCollectionNames()
      .then(setCollectionNames)
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: '',
    collection_name: '',
    product_category: '',
    product_description: '',
    tagline: '',
    status: 'draft' as BrandProductStatus,
  });

  const updateField = useCallback(<K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Sizes ──────────────────────────────────────────────
  const handleAddSize = () => {
    const val = sizeInput.trim().toUpperCase();
    if (!val || sizes.includes(val)) return;
    setSizes(prev => [...prev, val]);
    setSizeInput('');
    setIsDirty(true);
  };

  const handleRemoveSize = (size: string) => {
    setSizes(prev => prev.filter(s => s !== size));
    setIsDirty(true);
  };

  const handleSizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createProduct({
        product_name: formData.product_name.trim(),
        sku: formData.sku.trim(),
        price: parseFloat(formData.price) || 0,
        collection_name: formData.collection_name,
        product_category: formData.product_category || undefined,
        tagline: formData.tagline,
        product_description: formData.product_description,
        ...(sizes.length > 0 ? { sizes } : {}),
        ...(coverImage ? { product_image: coverImage } : {}),
      });

      setIsDirty(false);
      router.push(`/brand/products/${created.product_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <BrandPageHeader
        title="Create Product"
        breadcrumbs={[
          { label: 'Products', href: '/brand/products' },
          { label: 'New Product' },
        ]}
        actions={
          <Link
            href="/brand/products"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
          >
            <ArrowLeft size={16} />
            Cancel
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="p-8">
        <div className="max-w-4xl">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600 mb-8">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content — left 2 cols */}
          <div className="lg:col-span-2 space-y-8">

          {/* Basic Information */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => updateField('product_name', e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="e.g., Lady Dior Small"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors uppercase"
                  placeholder="e.g., DLD-001"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Collection Name *
                </label>
                <select
                  required
                  value={formData.collection_name}
                  onChange={(e) => updateField('collection_name', e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                >
                  <option value="">Select collection</option>
                  {collectionNames.map((col) => (
                    <option key={col.collection_id} value={col.collection_name}>{col.collection_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Product Category
                </label>
                <input
                  type="text"
                  value={formData.product_category}
                  onChange={(e) => updateField('product_category', e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="e.g., Handbags, Clothing, Shoes"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BrandProductStatus })}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sizes */}
          <section className="bg-white border border-sand/50 p-6 space-y-6 mt-8">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Sizes
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={handleSizeKeyDown}
                className="flex-1 px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                placeholder="e.g., XS, S, M, L, XL, 38, 40..."
              />
              <button
                type="button"
                onClick={handleAddSize}
                disabled={!sizeInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-parchment border border-sand/50 text-sm text-charcoal-deep"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="text-taupe hover:text-error transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Description */}
          <section className="bg-white border border-sand/50 p-6 space-y-6 mt-8">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Description
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="A short, evocative tagline"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Description
                </label>
                <textarea
                  value={formData.product_description}
                  onChange={(e) => updateField('product_description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  placeholder="Describe the product, its heritage, and unique qualities..."
                />
              </div>
            </div>
          </section>

          </div>{/* end lg:col-span-2 */}

          {/* Sidebar — right col */}
          <div className="space-y-6">
            <div className="bg-white border border-sand/50 p-6">
              <h3 className="text-sm font-medium text-charcoal-deep mb-4">Cover Image</h3>
              <CoverImageUpload
                image={coverImage}
                onChange={(url) => { setCoverImage(url); setIsDirty(true); }}
              />
            </div>
          </div>
          </div>{/* end grid */}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-8">
            <SecondaryButton href="/brand/products">
              Cancel
            </SecondaryButton>
            <PrimaryButton disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}
