'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  ShoppingCart,
  DollarSign,
  Clock,
  MapPin,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  Check,
  Minus,
    TrendingUp
} from 'lucide-react';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { fetchProduct, fetchCollectionNames, updateProduct, softDeleteProduct, setRegionalStocks, addColorImages, restockProduct, fetchRestockHistory, parseColorMapping, parseRegionalStocks, computeTotalUnits, type BackendProduct, type CollectionNameItem, type RegionalStockItem, type RegionalStockAddPayload, type RestockPayload, type RestockRegionEntry, type RestockHistoryItem, type ColorOption, type ColorImages } from '@/services/brand-product.service';
import { getProductAIInsights } from '@/services/recommendation.service';
import { CoverImageUpload } from '@/components/brand/CoverImageUpload';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import type { BrandProductStatus, RegionalStock } from '@/types/brand-portal';
import type { ProductImage, ProductVariant, Material, ProductVisibility, ExperienceMode, PricingVisibility, CommerceAction } from '@/types';
import { ProductImageUpload } from '@/components/brand/ProductImageUpload';

interface CraftsmanshipItem {
  title: string;
  description: string;
  duration?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: '',
    collection_name: '',
    product_category: '',
    product_description: '',
    tagline: '',
    narrative: '',
    status: 'draft',
    ivEnabled: false,
    visibility: 'public' as ProductVisibility,
    experienceMode: 'standard' as ExperienceMode,
    pricingVisibility: 'visible' as PricingVisibility,
    commerceAction: 'add_to_considerations' as CommerceAction,
    // SOW 41P.3
    iv_eligible: true,
    commerce_eligible: true,
    heritage_tags: [] as string[],
    craft_tags: [] as string[],
    editorial_narrative: '',
    // SOW 41P.4 — backend accepts both legacy and Section-1 spec vocab.
    visibility_scope: 'public' as
      | 'public' | 'logged_in' | 'uhni_only' | 'geo_restricted'
      | 'private' | 'invite_only',
    experience_mode: 'commerce' as
      | 'commerce' | 'story_only' | 'experience_iv' | 'concierge' | 'standard'
      | 'iv_immersive' | 'bespoke_only',
    pricing_visibility: 'visible' as
      | 'visible' | 'hidden' | 'redacted'
      | 'on_request' | 'private',
    commerce_action_type: 'purchase' as
      | 'purchase' | 'add_to_cart' | 'request_to_buy' | 'concierge' | 'redirect'
      | 'add_to_considerations' | 'request_access' | 'direct_purchase',
  });

  const [heritageTagInput, setHeritageTagInput] = useState('');
  const [craftTagInput, setCraftTagInput] = useState('');

  const [productImages, setProductImages] = useState<string[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [craftsmanship, setCraftsmanship] = useState<CraftsmanshipItem[]>([]);
  // Sizes & Colors state
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#000000');
  const [colorImages, setColorImages] = useState<ColorImages>({});
  const [activeColorTab, setActiveColorTab] = useState<string | null>(null);

  // Parsed regional stocks (from JSON string[])
  const [parsedStocks, setParsedStocks] = useState<RegionalStockItem[]>([]);
  // Restock
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockHistory, setRestockHistory] = useState<RestockHistoryItem[]>([]);
  // Cover image
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const markDirty = () => setHasChanges(true);

  const handleAddTag = (type: 'heritage_tags' | 'craft_tags', input: string, setInput: (v: string) => void) => {
    const val = input.trim().toLowerCase();
    if (!val || formData[type].includes(val)) return;
    setFormData(prev => ({ ...prev, [type]: [...prev[type], val] }));
    setInput('');
    markDirty();
  };

  const handleRemoveTag = (type: 'heritage_tags' | 'craft_tags', tag: string) => {
    setFormData(prev => ({ ...prev, [type]: prev[type].filter(t => t !== tag) }));
    markDirty();
  };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const deleteModalRef = useModalAccessibility(showDeleteConfirm, () => setShowDeleteConfirm(false));

  // Image URL input
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');

  // Inline add forms
  const [newVariant, setNewVariant] = useState({ type: 'size' as ProductVariant['type'], name: '', value: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', composition: '', origin: '' });
  const [newCraft, setNewCraft] = useState({ title: '', description: '', duration: '' });

  // Initialize form from product
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [collectionNames, setCollectionNames] = useState<CollectionNameItem[]>([]);

  useEffect(() => {
    loadProduct();
    fetchCollectionNames()
      .then(setCollectionNames)
      .catch(() => {});
  }, [productId]);

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProduct(productId);
      setProduct(data);
      setFormData({
        product_name: data.product_name,
        sku: data.sku,
        price: data.price.toString(),
        collection_name: data.collection_name,
        product_category: data.product_category || '',
        product_description: data.product_description,
        tagline: data.tagline,
        narrative: data.editorial_narrative || '',
        status: data.status,
        ivEnabled: data.iv_eligible ?? true,
        visibility: (data.visibility_scope as ProductVisibility) || 'public',
        experienceMode: (data.experience_mode as ExperienceMode) || 'standard',
        pricingVisibility: (data.pricing_visibility as PricingVisibility) || 'visible',
        commerceAction: (data.commerce_action_type as CommerceAction) || 'add_to_considerations',
        // SOW 41P.3
        iv_eligible: data.iv_eligible ?? true,
        commerce_eligible: data.commerce_eligible ?? true,
        heritage_tags: data.heritage_tags || [],
        craft_tags: data.craft_tags || [],
        editorial_narrative: data.editorial_narrative || '',
        // SOW 41P.4
        visibility_scope: data.visibility_scope || 'public',
        experience_mode: data.experience_mode || 'commerce',
        pricing_visibility: data.pricing_visibility || 'visible',
        commerce_action_type: data.commerce_action_type || 'purchase',
      });
      setProductImages(data.product_images ? [...data.product_images] : []);
      setImages([]);
      setVariants([]);
      // Load AI insights for materials & craftsmanship
      getProductAIInsights(productId).then(insights => {
        if (insights?.materials && insights.materials.length > 0) {
          setMaterials(insights.materials.map(m => ({
            name: m.name,
            composition: m.composition || '',
            origin: m.origin || '',
            sustainability: m.sustainability,
          })));
        }
        if (insights?.craftsmanship && insights.craftsmanship.length > 0) {
          setCraftsmanship(insights.craftsmanship.map(c => ({
            title: c.title,
            description: c.description,
            duration: c.duration,
          })));
        }
      }).catch(() => {});
      // Load sizes from backend
      setSizes(data.sizes || []);
      // Parse color_based_images_mapping JSON strings into ColorOption[] and ColorImages
      const { colors: parsedColors, colorImages: parsedColorImages } = parseColorMapping(data.color_based_images_mapping || []);
      setColors(parsedColors);
      setColorImages(parsedColorImages);
      setActiveColorTab(parsedColors.length > 0 ? parsedColors[0].name : null);
      // Parse regional_stocks JSON strings into RegionalStockItem[]
      setParsedStocks(parseRegionalStocks(data.regional_stocks));
      // Set cover image
      setCoverImage(data.product_image || null);
      // Load restock history
      fetchRestockHistory(productId)
        .then(setRestockHistory)
        .catch(() => {});
    } catch (err) {
      console.error('Failed to load product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-taupe" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">{error || 'Product not found'}</p>
        <Link
          href="/brand/products"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert colors + colorImages back to color_based_images_mapping JSON strings
      const colorMapping = colors.map(c =>
        JSON.stringify({ color: c.name, hex: c.hex, images: colorImages[c.name] || [] })
      );

      const updated = await updateProduct(productId, {
        product_name: formData.product_name,
        sku: formData.sku,
        price: parseFloat(formData.price) || product.price,
        collection_name: formData.collection_name,
        product_category: formData.product_category || undefined,
        product_description: formData.product_description,
        tagline: formData.tagline,
        status: formData.status,
        product_image: coverImage || undefined,
        product_images: productImages,
        sizes,
        color_based_images_mapping: colorMapping,
        // SOW 41P.3
        iv_eligible: formData.iv_eligible,
        commerce_eligible: formData.commerce_eligible,
        heritage_tags: formData.heritage_tags,
        craft_tags: formData.craft_tags,
        editorial_narrative: formData.editorial_narrative,
        // SOW 41P.4
        visibility_scope: formData.visibility_scope,
        experience_mode: formData.experience_mode,
        pricing_visibility: formData.pricing_visibility,
        commerce_action_type: formData.commerce_action_type,
      });
      setProduct(updated);
      // Re-parse after save
      setParsedStocks(parseRegionalStocks(updated.regional_stocks));
      const { colors: newColors, colorImages: newColorImages } = parseColorMapping(updated.color_based_images_mapping || []);
      setColors(newColors);
      setColorImages(newColorImages);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleStockSave = async (stocks: RegionalStockAddPayload[]) => {
    try {
      await setRegionalStocks(productId, stocks);
      await loadProduct();
    } catch (err) {
      console.error('Failed to save stocks:', err);
    }
    setToastMessage('Stock updated successfully');
  };

  const handleRestock = async (payload: RestockPayload) => {
    try {
      await restockProduct(payload);
      await loadProduct();
      setToastMessage('Restock successful');
    } catch (err) {
      console.error('Failed to restock:', err);
    }
  };

  // ============================================
  // DELETE
  // ============================================

  const computedTotalStock = parsedStocks.reduce((sum, s) => sum + s.units, 0);
  const isDeleteDangerous = product.status === 'published' && computedTotalStock > 0;

  const handleDelete = () => {
    softDeleteProduct(productId);
    router.push('/brand/products');
  };

  // ============================================
  // IMAGES
  // ============================================

  const handleAddImage = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) { setImageUrlError('URL cannot be empty'); return; }
    try { new URL(trimmed); } catch { setImageUrlError('Please enter a valid URL'); return; }
    setImageUrlError('');
    const imageType = images.length === 0 ? 'hero' : 'detail';
    setImages(prev => [...prev, {
      id: `img-${Date.now()}`,
      url: trimmed,
      alt: formData.product_name || 'Product image',
      type: imageType as ProductImage['type'],
    }]);
    setImageUrl('');
    markDirty();
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    markDirty();
  };

  // ============================================
  // VARIANTS
  // ============================================

  const handleAddVariant = () => {
    if (!newVariant.name.trim() || !newVariant.value.trim()) return;
    setVariants(prev => [...prev, {
      id: `var-${Date.now()}`,
      type: newVariant.type,
      name: newVariant.name.trim(),
      value: newVariant.value.trim(),
      available: true,
    }]);
    setNewVariant({ type: 'size', name: '', value: '' });
    markDirty();
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
    markDirty();
  };

  // ============================================
  // MATERIALS
  // ============================================

  const handleAddMaterial = () => {
    if (!newMaterial.name.trim() || !newMaterial.composition.trim()) return;
    setMaterials(prev => [...prev, {
      name: newMaterial.name.trim(),
      composition: newMaterial.composition.trim(),
      origin: newMaterial.origin.trim(),
    }]);
    setNewMaterial({ name: '', composition: '', origin: '' });
    markDirty();
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ============================================
  // CRAFTSMANSHIP
  // ============================================

  const handleAddCraft = () => {
    if (!newCraft.title.trim() || !newCraft.description.trim()) return;
    setCraftsmanship(prev => [...prev, {
      title: newCraft.title.trim(),
      description: newCraft.description.trim(),
      duration: newCraft.duration.trim() || undefined,
    }]);
    setNewCraft({ title: '', description: '', duration: '' });
    markDirty();
  };

  const handleRemoveCraft = (index: number) => {
    setCraftsmanship(prev => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ============================================
  // SIZES
  // ============================================

  const handleAddSize = () => {
    const val = sizeInput.trim().toUpperCase();
    if (!val || sizes.includes(val)) return;
    setSizes(prev => [...prev, val]);
    setSizeInput('');
    markDirty();
  };

  const handleRemoveSize = (size: string) => {
    setSizes(prev => prev.filter(s => s !== size));
    markDirty();
  };

  const handleSizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSize();
    }
  };

  // ============================================
  // COLORS
  // ============================================

  const handleAddColor = () => {
    const name = colorNameInput.trim();
    if (!name || colors.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const newColor: ColorOption = { name, hex: colorHexInput };
    setColors(prev => [...prev, newColor]);
    setColorImages(prev => ({ ...prev, [name]: prev[name] || [] }));
    if (!activeColorTab) setActiveColorTab(name);
    setColorNameInput('');
    setColorHexInput('#000000');
    markDirty();
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
    markDirty();
  };

  const handleColorImagesChange = (colorName: string, imgs: string[]) => {
    setColorImages(prev => ({ ...prev, [colorName]: imgs }));
    markDirty();
  };

  const handleColorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddColor();
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const metrics = product.performance_metrics ?? {
    views: 0, add_to_cart: 0, purchases: 0, conversion_rate: 0,
    avg_decision_time: 0, demand_score: 0, total_revenue: 0, total_units: 0,
  };
  const stockFromRegional = parsedStocks.reduce((sum, s) => sum + (s.units ?? 0), 0);
  const totalUnits = stockFromRegional > 0 ? stockFromRegional : metrics.total_units;
  const isLowStock = product.is_low_stock || (totalUnits > 0 && totalUnits <= 10);

  return (
    <div>
      <BrandPageHeader
        title={product.product_name}
        breadcrumbs={[
          { label: 'Products', href: '/brand/products' },
          { label: product.product_name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/products" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            {product.is_active && (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 text-sm tracking-wide hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <PrimaryButton onClick={handleSave} icon={Save} disabled={isSaving || !hasChanges}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </PrimaryButton>
              </>
            )}
          </div>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <section className="bg-white border border-sand/50 p-6 space-y-6">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => handleChange('product_name', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Collection
                  </label>
                  <select
                    value={formData.collection_name}
                    onChange={(e) => handleChange('collection_name', e.target.value)}
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
                    onChange={(e) => handleChange('product_category', e.target.value)}
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
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
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
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.product_description}
                    onChange={(e) => handleChange('product_description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* SOW 41P.3 — Product Classification */}
            <section className="bg-white border border-sand/50 p-6 space-y-6">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">Product Classification</h2>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.iv_eligible} onChange={e => { setFormData(p => ({ ...p, iv_eligible: e.target.checked })); markDirty(); }} className="rounded border-sand" />
                  <span className="text-sm text-charcoal-deep">IV Eligible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.commerce_eligible} onChange={e => { setFormData(p => ({ ...p, commerce_eligible: e.target.checked })); markDirty(); }} className="rounded border-sand" />
                  <span className="text-sm text-charcoal-deep">Commerce Eligible</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Editorial Narrative</label>
                <textarea value={formData.editorial_narrative} onChange={e => { setFormData(p => ({ ...p, editorial_narrative: e.target.value })); markDirty(); }} rows={4} className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none" placeholder="Long-form brand story or editorial context..." />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Heritage Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.heritage_tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-sand text-stone text-xs">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag('heritage_tags', tag)} className="text-stone hover:text-red-500 ml-1"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={heritageTagInput} onChange={e => setHeritageTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('heritage_tags', heritageTagInput, setHeritageTagInput))} placeholder="e.g. hand-embroidered" className="flex-1 px-4 py-2 bg-transparent border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep" />
                  <button type="button" onClick={() => handleAddTag('heritage_tags', heritageTagInput, setHeritageTagInput)} className="px-4 py-2 border border-sand text-sm text-stone hover:bg-sand transition-colors">Add</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Craft Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.craft_tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-sand text-stone text-xs">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag('craft_tags', tag)} className="text-stone hover:text-red-500 ml-1"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={craftTagInput} onChange={e => setCraftTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('craft_tags', craftTagInput, setCraftTagInput))} placeholder="e.g. block-print" className="flex-1 px-4 py-2 bg-transparent border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep" />
                  <button type="button" onClick={() => handleAddTag('craft_tags', craftTagInput, setCraftTagInput)} className="px-4 py-2 border border-sand text-sm text-stone hover:bg-sand transition-colors">Add</button>
                </div>
              </div>
            </section>

            {/* SOW 41P.4 — Visibility Settings */}
            <section className="bg-white border border-sand/50 p-6 space-y-4">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">Visibility Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Visibility Scope</label>
                  <select value={formData.visibility_scope} onChange={e => { setFormData(p => ({ ...p, visibility_scope: e.target.value as typeof formData.visibility_scope })); markDirty(); }} className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep cursor-pointer">
                    <option value="public">Public</option>
                    <option value="logged_in">Logged In Only</option>
                    <option value="invite_only">Invite Only</option>
                    <option value="uhni_only">UHNI Only</option>
                    <option value="private">Private</option>
                    <option value="geo_restricted">Geo Restricted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Experience Mode</label>
                  <select value={formData.experience_mode} onChange={e => { setFormData(p => ({ ...p, experience_mode: e.target.value as typeof formData.experience_mode })); markDirty(); }} className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep cursor-pointer">
                    <option value="standard">Standard</option>
                    <option value="commerce">Commerce</option>
                    <option value="story_only">Story Only</option>
                    <option value="experience_iv">Experience + IV</option>
                    <option value="iv_immersive">IV Immersive</option>
                    <option value="bespoke_only">Bespoke Only</option>
                    <option value="concierge">Concierge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Pricing Visibility</label>
                  <select value={formData.pricing_visibility} onChange={e => { setFormData(p => ({ ...p, pricing_visibility: e.target.value as typeof formData.pricing_visibility })); markDirty(); }} className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep cursor-pointer">
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                    <option value="on_request">On Request</option>
                    <option value="private">Private</option>
                    <option value="redacted">Redacted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Commerce Action</label>
                  <select value={formData.commerce_action_type} onChange={e => { setFormData(p => ({ ...p, commerce_action_type: e.target.value as typeof formData.commerce_action_type })); markDirty(); }} className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep cursor-pointer">
                    <option value="purchase">Purchase</option>
                    <option value="add_to_cart">Add to Cart</option>
                    <option value="add_to_considerations">Add to Considerations</option>
                    <option value="request_to_buy">Request to Buy</option>
                    <option value="request_access">Request Access</option>
                    <option value="direct_purchase">Direct Purchase</option>
                    <option value="concierge">Concierge Handoff</option>
                    <option value="redirect">Redirect</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Regional Stock */}
            <section className="bg-white border border-sand/50 p-6">
              <div className="flex items-center justify-between border-b border-sand/50 pb-4 mb-6">
                <h2 className="font-medium text-charcoal-deep">Regional Stock</h2>
                {parsedStocks.length > 0 ? (
                  <button
                    onClick={() => setIsRestockModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                  >
                    <Plus size={14} /> Restock
                  </button>
                ) : (
                  <button
                    onClick={() => setIsStockModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                  >
                    <Plus size={14} /> Manage Stock
                  </button>
                )}
              </div>

              {parsedStocks.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin size={28} className="text-taupe mx-auto mb-3" />
                  <p className="text-sm text-stone">No stock locations configured</p>
                  <button
                    onClick={() => setIsStockModalOpen(true)}
                    className="mt-3 text-xs tracking-wider uppercase text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    + Manage Stock
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedStocks.map((stock) => (
                    <div
                      key={stock.stock_id}
                      className="flex items-center justify-between py-3 border-b border-sand/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-taupe" />
                        <div>
                          <p className="text-sm text-charcoal-deep">{stock.city}</p>
                          <p className="text-xs text-taupe">{stock.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          stock.is_low_stock ? 'text-warning' : 'text-charcoal-deep'
                        }`}>
                          {stock.units} units
                        </p>
                        {stock.is_low_stock && (
                          <p className="text-xs text-warning flex items-center gap-1">
                            <AlertTriangle size={10} /> Below threshold ({stock.threshold})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Restock History */}
              {restockHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-sand/50">
                  <h3 className="text-xs tracking-[0.15em] uppercase text-stone mb-3">Restock History</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {restockHistory.map((entry) => (
                      <div key={entry.restock_id} className="flex items-center justify-between py-2 text-xs border-b border-sand/20 last:border-0">
                        <div>
                          <span className="text-charcoal-deep">{entry.city}, {entry.country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-success font-medium">+{entry.units} units</span>
                          <span className="text-taupe">{new Date(entry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white border border-sand/50 p-6">
              <h3 className="text-sm font-medium text-charcoal-deep mb-4">Cover Image</h3>
              <CoverImageUpload
                image={coverImage}
                onChange={(url) => { setCoverImage(url); setHasChanges(true); }}
              />
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-sand/50 p-6">
              <h3 className="text-sm font-medium text-charcoal-deep mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <Eye size={14} /> Views
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {metrics.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <ShoppingCart size={14} /> Add to Cart
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {metrics.add_to_cart.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <DollarSign size={14} /> Purchases
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {metrics.purchases.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <TrendingUp size={14} /> Conversion
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {metrics.conversion_rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <Clock size={14} /> Avg Decision Time
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {metrics.avg_decision_time}h
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-sand/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone">Demand Score</span>
                  <span className={`text-sm font-medium ${
                    metrics.demand_score >= 80 ? 'text-success' :
                    metrics.demand_score >= 50 ? 'text-charcoal-deep' :
                    'text-warning'
                  }`}>
                    {metrics.demand_score}/100
                  </span>
                </div>
                <div className="h-2 bg-parchment overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      metrics.demand_score >= 80 ? 'bg-success' :
                      metrics.demand_score >= 50 ? 'bg-gold-muted' :
                      'bg-warning'
                    }`}
                    style={{ width: `${metrics.demand_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="bg-white border border-sand/50 p-6">
              <h3 className="text-sm font-medium text-charcoal-deep mb-4">Stock Summary</h3>
              <div className="text-center py-4">
                <p className={`text-3xl font-display ${isLowStock ? 'text-warning' : 'text-charcoal-deep'}`}>
                  {totalUnits}
                </p>
                <p className="text-xs text-stone mt-1">Total Units</p>
                {isLowStock && (
                  <p className="text-xs text-warning mt-2 flex items-center justify-center gap-1">
                    <AlertTriangle size={12} /> Low stock alert
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-sand/50">
                <p className="text-xs text-stone mb-2">Revenue (All Time)</p>
                <p className="text-xl font-display text-charcoal-deep">
                  ${metrics.total_revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div
            ref={deleteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="relative bg-white w-full max-w-md shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-error" />
              </div>
              <h3 id="delete-modal-title" className="font-display text-xl text-charcoal-deep mb-2">Delete Product</h3>
              <p className="text-sm text-stone">
                Are you sure you want to delete <span className="font-medium text-charcoal-deep">{product.product_name}</span>? This action cannot be undone.
              </p>
              {isDeleteDangerous && (
                <div className="mt-4 flex items-start gap-2 bg-warning/10 border border-warning/20 p-3 text-left">
                  <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning">
                    This product is currently <strong>published</strong> with <strong>{computedTotalStock} units</strong> in stock. Deleting it will remove it from all storefronts immediately.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 text-sm text-stone hover:text-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      {isStockModalOpen && (
        <StockModal
          productName={product.product_name}
          existingStocks={parsedStocks}
          onClose={() => setIsStockModalOpen(false)}
          onSave={handleStockSave}
          isEditing={parsedStocks.length > 0}
        />
      )}

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <RestockModal
          productId={productId}
          productName={product.product_name}
          existingStocks={parsedStocks}
          onClose={() => setIsRestockModalOpen(false)}
          onRestock={handleRestock}
        />
      )}
    </div>
  );
}

// ─── Inline Stock Management Modal ───────────────────────────────────────────

function StockModal({
  productName,
  existingStocks,
  onClose,
  onSave,
  isEditing,
}: {
  productName: string;
  existingStocks: RegionalStockItem[];
  onClose: () => void;
  onSave: (stocks: RegionalStockAddPayload[]) => Promise<void>;
  isEditing: boolean;
}) {
  const [rows, setRows] = useState<RegionalStockAddPayload[]>(() =>
    existingStocks.map(s => ({
      city: s.city,
      country: s.country,
      units: s.units,
      threshold: s.threshold,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({ city: '', country: '', units: 0, threshold: 5 });

  const totalUnits = rows.reduce((sum, s) => sum + s.units, 0);
  const lowStockCount = rows.filter(s => s.units <= s.threshold).length;

  const handleUnitChange = (index: number, value: number) => {
    setRows(prev => prev.map((s, i) =>
      i === index ? { ...s, units: Math.max(0, value) } : s
    ));
  };

  const handleThresholdChange = (index: number, value: number) => {
    setRows(prev => prev.map((s, i) =>
      i === index ? { ...s, threshold: Math.max(0, value) } : s
    ));
  };

  const handleRemoveRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    if (!newRow.city.trim() || !newRow.country.trim()) return;
    setRows(prev => [...prev, {
      city: newRow.city.trim(),
      country: newRow.country.trim(),
      units: Math.max(0, newRow.units),
      threshold: Math.max(0, newRow.threshold),
    }]);
    setNewRow({ city: '', country: '', units: 0, threshold: 5 });
    setShowAddRow(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(rows);
      onClose();
    } catch (err) {
      console.error('Failed to save stocks:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal-deep/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-sand/50">
          <div>
            <h2 className="font-display text-xl text-charcoal-deep">{isEditing ? 'Edit Stock' : 'Manage Stock'}</h2>
            <p className="text-xs text-stone mt-1">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-parchment transition-colors">
            <X size={18} className="text-stone" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-8 py-3 bg-parchment/50 border-b border-sand/30 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Total</span>
            <span className="text-sm font-medium text-charcoal-deep">{totalUnits} units</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Locations</span>
            <span className="text-sm font-medium text-charcoal-deep">{rows.length}</span>
          </div>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle size={14} />
              <span className="text-xs">{lowStockCount} below threshold</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {rows.length === 0 ? (
            <div className="text-center py-8">
              <MapPin size={32} className="text-taupe mx-auto mb-3" />
              <p className="text-sm text-stone">No stock locations configured</p>
            </div>
          ) : (
            <div className="space-y-0">
              <div className="grid grid-cols-[1fr_1fr_100px_100px_40px] gap-3 pb-3 border-b border-sand/50">
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">City</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Country</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Units</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Threshold</span>
                <span />
              </div>

              {rows.map((stock, idx) => (
                <div
                  key={`${stock.city}-${stock.country}-${idx}`}
                  className="grid grid-cols-[1fr_1fr_100px_100px_40px] gap-3 py-3 border-b border-sand/20 items-center group"
                >
                  <span className="text-sm text-charcoal-deep flex items-center gap-2">
                    <MapPin size={14} className="text-taupe flex-shrink-0" />
                    {stock.city}
                  </span>
                  <span className="text-sm text-charcoal-deep">{stock.country}</span>

                  <div className="flex items-center border border-sand">
                    <button
                      onClick={() => handleUnitChange(idx, stock.units - 1)}
                      className="px-2 py-1.5 hover:bg-parchment transition-colors"
                    >
                      <Minus size={12} className="text-stone" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={stock.units}
                      onChange={(e) => handleUnitChange(idx, parseInt(e.target.value, 10) || 0)}
                      className={`w-full text-center text-sm bg-transparent focus:outline-none py-1.5 ${
                        stock.units <= stock.threshold ? 'text-warning font-medium' : 'text-charcoal-deep'
                      }`}
                    />
                    <button
                      onClick={() => handleUnitChange(idx, stock.units + 1)}
                      className="px-2 py-1.5 hover:bg-parchment transition-colors"
                    >
                      <Plus size={12} className="text-stone" />
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={stock.threshold}
                    onChange={(e) => handleThresholdChange(idx, parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-sm bg-transparent border border-sand py-1.5 focus:outline-none focus:border-charcoal-deep text-charcoal-deep"
                  />

                  <button
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1.5 text-taupe hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAddRow ? (
            <div className="mt-4 p-4 border border-sand/50 bg-parchment/30 space-y-4">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone">Add Location</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">City</label>
                  <input
                    type="text"
                    value={newRow.city}
                    onChange={(e) => setNewRow(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Paris"
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">Country</label>
                  <input
                    type="text"
                    value={newRow.country}
                    onChange={(e) => setNewRow(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g. France"
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">Units</label>
                  <input
                    type="number"
                    min="0"
                    value={newRow.units}
                    onChange={(e) => setNewRow(prev => ({ ...prev, units: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={newRow.threshold}
                    onChange={(e) => setNewRow(prev => ({ ...prev, threshold: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddRow}
                  disabled={!newRow.city.trim() || !newRow.country.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check size={14} /> Add
                </button>
                <button
                  onClick={() => setShowAddRow(false)}
                  className="px-5 py-2 text-xs tracking-wider uppercase text-stone hover:text-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddRow(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-sand text-xs tracking-[0.15em] uppercase text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-colors w-full justify-center"
            >
              <Plus size={14} /> Add Location
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-sand/50 flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs tracking-wider uppercase text-stone hover:text-charcoal-deep transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Set Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Restock Modal ────────────────────────────────────────────────────────────

function RestockModal({
  productId,
  productName,
  existingStocks,
  onClose,
  onRestock,
}: {
  productId: string;
  productName: string;
  existingStocks: RegionalStockItem[];
  onClose: () => void;
  onRestock: (payload: RestockPayload) => Promise<void>;
}) {
  const [city, setCity] = useState(existingStocks[0]?.city || '');
  const [country, setCountry] = useState(existingStocks[0]?.country || '');
  const [units, setUnits] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [useExisting, setUseExisting] = useState(existingStocks.length > 0);

  const handleSelectLocation = (stock: RegionalStockItem) => {
    setCity(stock.city);
    setCountry(stock.country);
  };

  const handleSubmit = async () => {
    if (!city.trim() || !country.trim() || units <= 0) return;
    setIsSaving(true);
    try {
      await onRestock({
        product_id: productId,
        region_mapping: [{ city: city.trim(), country: country.trim(), units }],
      });
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-deep/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand/50">
          <div>
            <h2 className="font-display text-xl text-charcoal-deep">Restock</h2>
            <p className="text-xs text-stone mt-1">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-parchment transition-colors">
            <X size={18} className="text-stone" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Existing locations quick-select */}
          {existingStocks.length > 0 && (
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Select Location</label>
              <div className="flex flex-wrap gap-2">
                {existingStocks.map((s) => (
                  <button
                    key={s.stock_id}
                    type="button"
                    onClick={() => handleSelectLocation(s)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      city === s.city && country === s.country
                        ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                        : 'border-sand text-stone hover:border-charcoal-deep'
                    }`}
                  >
                    {s.city}, {s.country} ({s.units} units)
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setUseExisting(false); setCity(''); setCountry(''); }}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    !useExisting
                      ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                      : 'border-sand text-stone hover:border-charcoal-deep'
                  }`}
                >
                  + New Location
                </button>
              </div>
            </div>
          )}

          {/* City / Country (editable if new location) */}
          {(!useExisting || existingStocks.length === 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Paris"
                  className="w-full px-3 py-2 bg-transparent border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. France"
                  className="w-full px-3 py-2 bg-transparent border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                />
              </div>
            </div>
          )}

          {/* Units */}
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1.5">Units to Add</label>
            <input
              type="number"
              min="1"
              value={units || ''}
              onChange={(e) => setUnits(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 bg-transparent border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sand/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs tracking-wider uppercase text-stone hover:text-charcoal-deep transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !city.trim() || !country.trim() || units <= 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            {isSaving ? 'Restocking...' : 'Restock'}
          </button>
        </div>
      </div>
    </div>
  );
}
