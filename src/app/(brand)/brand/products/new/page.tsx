'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { BrandProductStatus, BrandProduct } from '@/types/brand-portal';
import type { ProductCategory, ProductImage, ProductVariant, Material } from '@/types/product';

export default function NewProductPage() {
  const router = useRouter();
  const { partner, createProduct } = useBrand();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: 'bags' as ProductCategory,
    description: '',
    tagline: '',
    status: 'draft' as BrandProductStatus
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the product
      const newProduct: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'> = {
        brandId: partner?.brandId || 'dior',
        brandName: partner?.brandName || 'Dior',
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        currency: 'EUR',
        category: formData.category,
        description: formData.description,
        tagline: formData.tagline,
        narrative: formData.description,
        status: formData.status,
        images: [],
        variants: [],
        materials: [],
        craftsmanship: [],
        ivEnabled: false,
        availability: {
          status: 'unavailable',
          quantity: 0,
          regions: []
        },
        collection: '',
        tags: [],
        totalStock: 0,
        regionalStock: [],
        demandScore: 0,
        performanceMetrics: {
          views: 0,
          addToCart: 0,
          purchases: 0,
          conversionRate: 0,
          revenue: 0,
          avgTimeToDecision: 0
        }
      };

      const created = createProduct(newProduct);
      router.push(`/brand/products/${created.id}`);
    } catch (error) {
      console.error('Failed to create product:', error);
      setIsSubmitting(false);
    }
  };

  const categories: ProductCategory[] = ['bags', 'clothing', 'shoes', 'accessories', 'jewelry', 'watches'];

  return (
    <div>
      <BrandPageHeader
        title="Create Product"
        breadcrumbs={[
          { label: 'Products', href: '/brand/products' },
          { label: 'New Product' }
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Price (EUR) *
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
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  placeholder="Describe the product, its heritage, and unique qualities..."
                />
              </div>
            </div>
          </section>

          {/* Images Placeholder */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Images
            </h2>

            <div className="border-2 border-dashed border-sand p-8 text-center">
              <div className="w-12 h-12 bg-parchment mx-auto mb-4 flex items-center justify-center">
                <Upload size={20} className="text-stone" />
              </div>
              <p className="text-sm text-stone mb-2">Drop images here or click to upload</p>
              <p className="text-xs text-taupe">PNG, JPG up to 10MB</p>
              <button
                type="button"
                className="mt-4 px-4 py-2 border border-sand text-sm text-stone hover:text-charcoal-deep hover:bg-parchment/30 transition-colors"
              >
                Select Files
              </button>
            </div>
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
