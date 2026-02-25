'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { ProductImageUpload } from '@/components/brand/ProductImageUpload';
import { useBrand } from '@/context/BrandContext';
import { createProduct, fetchCollectionNames, type CollectionNameItem } from '@/services/brand-product.service';
import type { BrandProductStatus, BrandProduct } from '@/types/brand-portal';
import type {
  ProductCategory,
  ProductImage,
  ProductVisibility,
  ExperienceMode,
  PricingVisibility,
  CommerceAction
} from '@/types/product';

// ============================================
// VALIDATION
// ============================================

interface FormErrors {
  product_name?: string;
  sku?: string;
  price?: string;
  imageUrl?: string;
}

function validateName(name: string): string | undefined {
  if (!name.trim()) return 'Product name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return undefined;
}

function validateSku(sku: string): string | undefined {
  if (!sku.trim()) return 'SKU is required';
  if (!/^[A-Z0-9]([A-Z0-9-]*[A-Z0-9])?$/.test(sku)) {
    return 'SKU must be alphanumeric with dashes (e.g., DLD-001)';
  }
  return undefined;
}

function validatePrice(price: string, status: BrandProductStatus): string | undefined {
  if (!price) return 'Price is required';
  const num = parseFloat(price);
  if (isNaN(num) || num < 0) return 'Price must be a valid number';
  if (status === 'published' && num <= 0) return 'Published products must have a price greater than 0';
  return undefined;
}

function validateImageUrl(url: string): string | undefined {
  if (!url.trim()) return 'URL cannot be empty';
  try {
    new URL(url);
  } catch {
    return 'Please enter a valid URL';
  }
  return undefined;
}

// ============================================
// COMPONENT
// ============================================

export default function NewProductPage() {
  const router = useRouter();
  const { partner } = useBrand();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [collectionNames, setCollectionNames] = useState<CollectionNameItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<{ slug: string }[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);

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
    product_description: '',
    tagline: '',
    status: 'draft' as BrandProductStatus,
  });

  // Track unsaved changes
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

  // Validate on blur
  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
    validateField(field);
  };

  const validateField = (field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      switch (field) {
        case 'product_name':
          next.product_name = validateName(formData.product_name);
          break;
        case 'sku':
          next.sku = validateSku(formData.sku);
          break;
        case 'price':
          next.price = validatePrice(formData.price, formData.status);
          break;
      }
      return next;
    });
  };

  // Validate all fields before submit
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {
      product_name: validateName(formData.product_name),
      sku: validateSku(formData.sku),
      price: validatePrice(formData.price, formData.status),
    };
    setErrors(newErrors);
    setTouched(new Set(['product_name', 'sku', 'price']));
    return !newErrors.product_name && !newErrors.sku && !newErrors.price;
  };

  // Generate unique slug
  const generateSlug = (name: string): string => {
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existingSlugs = new Set(products.map(p => p.slug));
    if (existingSlugs.has(slug)) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${suffix}`;
    }
    return slug;
  };

  // Add image
  const handleAddImage = () => {
    const urlError = validateImageUrl(imageUrl);
    if (urlError) {
      setErrors(prev => ({ ...prev, imageUrl: urlError }));
      return;
    }
    setErrors(prev => ({ ...prev, imageUrl: undefined }));
    const imageType = images.length === 0 ? 'hero' : 'detail';
    const newImage: ProductImage = {
      id: `img-${Date.now()}`,
      url: imageUrl.trim(),
      alt: formData.product_name || 'Product image',
      type: imageType as ProductImage['type'],
    };
    setImages(prev => [...prev, newImage]);
    setImageUrl('');
    setIsDirty(true);
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newProduct: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'> = {
        brandId: partner?.brandId || 'dior',
        brandName: partner?.brandName || 'Dior',
        name: formData.product_name.trim(),
        slug: generateSlug(formData.product_name),
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        currency: 'GBP',
        status: formData.status,
        tagline: formData.tagline,
        description: formData.product_description,
        narrative: formData.product_description,
        images,
        variants: [],
        materials: [],
        craftsmanship: [],
        ivEnabled: false,
        availability: {
          status: 'unavailable',
          quantity: 0,
          regions: []
        },
        collection: formData.collection_name,
        category: 'ready-to-wear' as ProductCategory,
        tags: [],
        visibility: 'public',
        experienceMode: 'standard' as ExperienceMode,
        pricingVisibility: 'visible',
        commerceAction: 'add_to_considerations' as CommerceAction,
        commerceEligible: true,
        craftTags: [],
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

      router.push('/brand/products');
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
                <select
                  required
                  value={formData.collection_name}
                  onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
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
