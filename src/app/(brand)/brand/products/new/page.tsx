'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { ProductImageUpload } from '@/components/brand/ProductImageUpload';
import { createProduct, fetchCollectionNames, type CollectionNameItem, type ColorOption, type ColorImages } from '@/services/brand-product.service';
import { useBrand } from '@/context/BrandContext';

type FormErrors = Record<string, string>;
type ProductImage = { id: string; url: string; alt: string; type: string };
type BrandProductStatus = 'draft' | 'active' | 'archived';

export default function NewProductPage() {
  const router = useRouter();
  const { partner } = useBrand();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [collectionNames, setCollectionNames] = useState<CollectionNameItem[]>([]);

  // Sizes state
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');

  // Colors state
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#000000');

  // Per-color images state
  const [colorImages, setColorImages] = useState<ColorImages>({});
  const [activeColorTab, setActiveColorTab] = useState<string | null>(null);
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

  const handleImagesChange = (images: string[]) => {
    setProductImages(images);
    setIsDirty(true);
  };

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

  // ── Colors ─────────────────────────────────────────────
  const handleAddColor = () => {
    const name = colorNameInput.trim();
    if (!name || colors.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const newColor: ColorOption = { name, hex: colorHexInput };
    setColors(prev => [...prev, newColor]);
    setColorImages(prev => ({ ...prev, [name]: [] }));
    if (!activeColorTab) setActiveColorTab(name);
    setColorNameInput('');
    setColorHexInput('#000000');
    setIsDirty(true);
  };

  const handleRemoveColor = (name: string) => {
    setColors(prev => prev.filter(c => c.name !== name));
    setColorImages(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (activeColorTab === name) {
      const remaining = colors.filter(c => c.name !== name);
      setActiveColorTab(remaining.length > 0 ? remaining[0].name : null);
    }
    setIsDirty(true);
  };

  const handleColorImagesChange = (colorName: string, images: string[]) => {
    setColorImages(prev => ({ ...prev, [colorName]: images }));
    setIsDirty(true);
  };

  const handleColorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddColor();
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
        status: formData.status,
        tagline: formData.tagline,
        product_description: formData.product_description,
        product_image: productImages[0] || undefined,
        product_images: productImages,
        ...(sizes.length > 0 ? { sizes } : {}),
        ...(colors.length > 0 ? { colors } : {}),
        ...(Object.keys(colorImages).length > 0 ? { color_images: colorImages } : {}),
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
          <section className="bg-white border border-sand/50 p-6 space-y-6">
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

          {/* Colors & Variant Images */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Colors & Variant Images
            </h2>

            {/* Add Color */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={colorNameInput}
                onChange={(e) => setColorNameInput(e.target.value)}
                onKeyDown={handleColorKeyDown}
                className="flex-1 px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                placeholder="Color name (e.g., Noir, Ivory, Rouge)"
              />
              <div className="flex items-center gap-2 border border-sand px-3 py-2">
                <input
                  type="color"
                  value={colorHexInput}
                  onChange={(e) => setColorHexInput(e.target.value)}
                  className="w-8 h-8 border-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-stone uppercase">{colorHexInput}</span>
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                disabled={!colorNameInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Add Color
              </button>
            </div>

            {/* Color Chips */}
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <span
                    key={color.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-parchment border border-sand/50 text-sm text-charcoal-deep"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-sand/50"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color.name)}
                      className="text-taupe hover:text-error transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Per-Color Image Upload */}
            {colors.length > 0 && (
              <div className="space-y-4">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone">
                  Images for color
                </label>

                {/* Color Tabs */}
                <div className="flex gap-1 border-b border-sand/50">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setActiveColorTab(color.name)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-[1px] ${
                        activeColorTab === color.name
                          ? 'border-charcoal-deep text-charcoal-deep'
                          : 'border-transparent text-stone hover:text-charcoal-deep'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-sand/50"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                      {(colorImages[color.name]?.length || 0) > 0 && (
                        <span className="text-[9px] text-taupe">
                          ({colorImages[color.name].length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Image Upload for Active Color */}
                {activeColorTab && (
                  <ProductImageUpload
                    images={colorImages[activeColorTab] || []}
                    onChange={(imgs) => handleColorImagesChange(activeColorTab, imgs)}
                  />
                )}
              </div>
            )}
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

          {/* Images */}
          <section className="bg-white border border-sand/50 p-6 space-y-6">
            <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
              Images
            </h2>

            <ProductImageUpload
              images={productImages}
              onChange={handleImagesChange}
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
