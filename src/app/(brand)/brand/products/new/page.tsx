'use client';

import { useState, useEffect, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
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
  name?: string;
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
  const { partner, createProduct, products } = useBrand();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  // Image URL input
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [collectionNames, setCollectionNames] = useState<CollectionNameItem[]>([]);

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
    narrative: '',
    status: 'draft' as BrandProductStatus,
    ivEnabled: false,
    visibility: 'public' as ProductVisibility,
    experienceMode: 'standard' as ExperienceMode,
    pricingVisibility: 'visible' as PricingVisibility,
    commerceAction: 'add_to_considerations' as CommerceAction,
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
        case 'name':
          next.name = validateName(formData.name);
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
      name: validateName(formData.name),
      sku: validateSku(formData.sku),
      price: validatePrice(formData.price, formData.status),
    };
    setErrors(newErrors);
    setTouched(new Set(['name', 'sku', 'price']));
    return !newErrors.name && !newErrors.sku && !newErrors.price;
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
      alt: formData.name || 'Product image',
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
    if (!validateAll()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newProduct: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'> = {
        brandId: partner?.brandId || 'dior',
        brandName: partner?.brandName || 'Dior',
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        collection_name: formData.collection_name,
        status: formData.status,
        tagline: formData.tagline,
        narrative: formData.narrative || formData.description,
        status: formData.status,
        images,
        variants: [],
        materials: [],
        craftsmanship: [],
        ivEnabled: formData.ivEnabled,
        availability: {
          status: 'unavailable',
          quantity: 0,
          regions: []
        },
        collection: '',
        tags: [],
        visibility: formData.visibility,
        experienceMode: formData.experienceMode,
        pricingVisibility: formData.pricingVisibility,
        commerceAction: formData.commerceAction,
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

      setIsDirty(false);
      const created = createProduct(newProduct);
      router.push(`/brand/products/${created.id}`);
    } catch (error) {
      console.error('Failed to create product:', error);
      setIsSubmitting(false);
    }
  };

  const categories: ProductCategory[] = ['bags', 'clothing', 'shoes', 'accessories', 'jewelry', 'watches'];

  const inputBase = 'w-full px-4 py-3 bg-transparent border text-charcoal-deep placeholder:text-taupe focus:outline-none transition-colors';
  const inputNormal = `${inputBase} border-sand focus:border-charcoal-deep`;
  const inputError = `${inputBase} border-error focus:border-error`;

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

      <form onSubmit={handleSubmit} className="p-8" noValidate>
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
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={touched.has('name') && errors.name ? inputError : inputNormal}
                  placeholder="e.g., Lady Dior Small"
                />
                {touched.has('name') && errors.name && (
                  <p className="mt-1.5 text-xs text-error">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
                  onBlur={() => handleBlur('sku')}
                  className={`${touched.has('sku') && errors.sku ? inputError : inputNormal} uppercase`}
                  placeholder="e.g., DLD-001"
                />
                {touched.has('sku') && errors.sku && (
                  <p className="mt-1.5 text-xs text-error">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  onBlur={() => handleBlur('price')}
                  className={touched.has('price') && errors.price ? inputError : inputNormal}
                  placeholder="0.00"
                />
                {touched.has('price') && errors.price && (
                  <p className="mt-1.5 text-xs text-error">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Collection Name *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value as ProductCategory)}
                  className={`${inputNormal} cursor-pointer`}
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
                  onChange={(e) => {
                    updateField('status', e.target.value as BrandProductStatus);
                    // Re-validate price when status changes (published requires price > 0)
                    if (touched.has('price')) {
                      setTimeout(() => validateField('price'), 0);
                    }
                  }}
                  className={`${inputNormal} cursor-pointer`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </section>

          {/* Description & Narrative */}
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
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className={inputNormal}
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
                  rows={3}
                  className={`${inputNormal} resize-none`}
                  placeholder="Describe the product, its heritage, and unique qualities..."
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Narrative
                </label>
                <textarea
                  value={formData.narrative}
                  onChange={(e) => updateField('narrative', e.target.value)}
                  rows={4}
                  className={`${inputNormal} resize-none`}
                  placeholder="The story behind this product — its origins, craftsmanship journey, and cultural significance..."
                />
                <p className="mt-1.5 text-xs text-taupe">
                  Rich storytelling content for the product detail page. Falls back to description if empty.
                </p>
              </div>
            </div>
          </section>

          {/* Commerce & Visibility Settings */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Commerce & Visibility
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* IV Enabled Toggle */}
              <div className="col-span-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep">
                      Intelligent Visualization (IV)
                    </label>
                    <p className="text-xs text-taupe mt-1">Enable immersive 3D visualization for this product</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.ivEnabled}
                    onClick={() => updateField('ivEnabled', !formData.ivEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${formData.ivEnabled ? 'bg-gold-deep' : 'bg-sand'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.ivEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => updateField('visibility', e.target.value as ProductVisibility)}
                  className={`${inputNormal} cursor-pointer`}
                >
                  <option value="public">Public</option>
                  <option value="invite_only">Invite Only</option>
                  <option value="private">Private</option>
                </select>
                <p className="mt-1.5 text-xs text-taupe">Controls who can discover this product</p>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Experience Mode
                </label>
                <select
                  value={formData.experienceMode}
                  onChange={(e) => updateField('experienceMode', e.target.value as ExperienceMode)}
                  className={`${inputNormal} cursor-pointer`}
                >
                  <option value="standard">Standard</option>
                  <option value="iv_immersive">IV Immersive</option>
                  <option value="bespoke_only">Bespoke Only</option>
                </select>
                <p className="mt-1.5 text-xs text-taupe">How clients experience this product</p>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Pricing Visibility
                </label>
                <select
                  value={formData.pricingVisibility}
                  onChange={(e) => updateField('pricingVisibility', e.target.value as PricingVisibility)}
                  className={`${inputNormal} cursor-pointer`}
                >
                  <option value="visible">Visible</option>
                  <option value="on_request">On Request</option>
                  <option value="private">Private</option>
                </select>
                <p className="mt-1.5 text-xs text-taupe">Whether the price is shown to clients</p>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Commerce Action
                </label>
                <select
                  value={formData.commerceAction}
                  onChange={(e) => updateField('commerceAction', e.target.value as CommerceAction)}
                  className={`${inputNormal} cursor-pointer`}
                >
                  <option value="add_to_considerations">Add to Considerations</option>
                  <option value="request_access">Request Access</option>
                  <option value="direct_purchase">Direct Purchase</option>
                </select>
                <p className="mt-1.5 text-xs text-taupe">Primary call-to-action for this product</p>
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Images
            </h2>

            {/* Existing images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group border border-sand/50 bg-parchment">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-stone">{img.type}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="text-stone hover:text-error transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add image URL */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                Add Image URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: undefined }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    className={errors.imageUrl ? inputError : inputNormal}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  {errors.imageUrl && (
                    <p className="mt-1.5 text-xs text-error">{errors.imageUrl}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-3 border border-sand text-sm text-stone hover:text-charcoal-deep hover:bg-parchment/30 transition-colors flex items-center gap-2 shrink-0"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <p className="mt-1.5 text-xs text-taupe">
                First image becomes the hero image. Paste a URL and press Enter or click Add.
              </p>
            </div>

            {images.length === 0 && (
              <div className="border-2 border-dashed border-sand p-8 text-center">
                <div className="w-12 h-12 bg-parchment mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon size={20} className="text-stone" />
                </div>
                <p className="text-sm text-stone">No images added yet</p>
                <p className="text-xs text-taupe mt-1">Add image URLs above to preview them here</p>
              </div>
            )}
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
