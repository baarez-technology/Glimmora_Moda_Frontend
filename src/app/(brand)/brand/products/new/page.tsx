'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { ProductImageUpload } from '@/components/brand/ProductImageUpload';
import { createProduct } from '@/services/brand-product.service';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: '',
    collection_name: '',
    product_description: '',
    tagline: '',
    status: 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createProduct({
        product_name: formData.product_name,
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        collection_name: formData.collection_name,
        status: formData.status,
        tagline: formData.tagline,
        product_description: formData.product_description,
        product_images: productImages,
      });

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
        <div className="max-w-3xl space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

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
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
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
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.collection_name}
                  onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="e.g., Spring 2025"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
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
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  placeholder="Describe the product, its heritage, and unique qualities..."
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Images
            </h2>

            <ProductImageUpload
              images={productImages}
              onChange={setProductImages}
            />
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
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
