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
    ImageIcon,
    TrendingUp
} from 'lucide-react';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { fetchProduct, fetchCollectionNames, updateProduct, softDeleteProduct, setRegionalStocks, type BackendProduct, type CollectionNameItem, type RegionalStockItem, type RegionalStockAddPayload } from '@/services/brand-product.service';
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
    product_description: '',
    tagline: '',
    narrative: '',
    status: 'draft',
    ivEnabled: false,
    visibility: 'public' as ProductVisibility,
    experienceMode: 'standard' as ExperienceMode,
    pricingVisibility: 'visible' as PricingVisibility,
    commerceAction: 'add_to_considerations' as CommerceAction,
  });

  const [productImages, setProductImages] = useState<string[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [craftsmanship, setCraftsmanship] = useState<CraftsmanshipItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const markDirty = () => setHasChanges(true);
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
        product_description: data.product_description,
        tagline: data.tagline,
        narrative: '',
        status: data.status,
        ivEnabled: false,
        visibility: 'public' as ProductVisibility,
        experienceMode: 'standard' as ExperienceMode,
        pricingVisibility: 'visible' as PricingVisibility,
        commerceAction: 'add_to_considerations' as CommerceAction,
      });
      setProductImages(data.product_images ? [...data.product_images] : []);
      setImages([]);
      setVariants([]);
      setMaterials([]);
      setCraftsmanship([]);
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
      const updated = await updateProduct(productId, {
        product_name: formData.product_name,
        sku: formData.sku,
        price: parseFloat(formData.price) || product.price,
        collection_name: formData.collection_name,
        product_description: formData.product_description,
        tagline: formData.tagline,
        status: formData.status,
        product_images: productImages,
      });
      setProduct(updated);
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

  const handleImagesChange = (images: string[]) => {
    setProductImages(images);
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

  // ============================================
  // DELETE
  // ============================================

  const computedTotalStock = product.regional_stocks.reduce((sum, s) => sum + s.units, 0);
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
  // HELPERS
  // ============================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalUnits = product.performance_metrics.total_units;
  const isLowStock = product.is_low_stock;

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

            {/* Regional Stock */}
            <section className="bg-white border border-sand/50 p-6">
              <div className="flex items-center justify-between border-b border-sand/50 pb-4 mb-6">
                <h2 className="font-medium text-charcoal-deep">Regional Stock</h2>
                <button
                  onClick={() => setIsStockModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-sand text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:bg-parchment transition-colors"
                >
                  <Plus size={14} /> Manage Stock
                </button>
              </div>

              {product.regional_stocks.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin size={28} className="text-taupe mx-auto mb-3" />
                  <p className="text-sm text-stone">No stock locations configured</p>
                  <button
                    onClick={() => setIsStockModalOpen(true)}
                    className="mt-3 text-xs tracking-wider uppercase text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    + Add stock locations
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {product.regional_stocks.map((stock) => (
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
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Images */}
            <div className="bg-white border border-sand/50 p-6">
              <h3 className="text-sm font-medium text-charcoal-deep mb-4">Images</h3>
              <ProductImageUpload
                images={productImages}
                onChange={handleImagesChange}
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
                    {product.performance_metrics.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <ShoppingCart size={14} /> Add to Cart
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performance_metrics.add_to_cart.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <DollarSign size={14} /> Purchases
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performance_metrics.purchases.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <TrendingUp size={14} /> Conversion
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performance_metrics.conversion_rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <Clock size={14} /> Avg Decision Time
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performance_metrics.avg_decision_time}h
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-sand/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone">Demand Score</span>
                  <span className={`text-sm font-medium ${
                    product.performance_metrics.demand_score >= 80 ? 'text-success' :
                    product.performance_metrics.demand_score >= 50 ? 'text-charcoal-deep' :
                    'text-warning'
                  }`}>
                    {product.performance_metrics.demand_score}/100
                  </span>
                </div>
                <div className="h-2 bg-parchment overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      product.performance_metrics.demand_score >= 80 ? 'bg-success' :
                      product.performance_metrics.demand_score >= 50 ? 'bg-gold-muted' :
                      'bg-warning'
                    }`}
                    style={{ width: `${product.performance_metrics.demand_score}%` }}
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
                  ${product.performance_metrics.total_revenue.toLocaleString()}
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
          existingStocks={product.regional_stocks}
          onClose={() => setIsStockModalOpen(false)}
          onSave={handleStockSave}
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
}: {
  productName: string;
  existingStocks: RegionalStockItem[];
  onClose: () => void;
  onSave: (stocks: RegionalStockAddPayload[]) => Promise<void>;
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
            <h2 className="font-display text-xl text-charcoal-deep">Manage Stock</h2>
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
