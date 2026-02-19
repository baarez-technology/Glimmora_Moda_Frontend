'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  TrendingUp,
  Eye,
  Heart,
  DollarSign,
  Clock,
  MapPin,
  AlertTriangle,
  Settings2,
  Plus,
  X,
  ImageIcon,
  Check
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { StockManagementModal } from '@/components/brand/StockManagementModal';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import type { BrandProductStatus, RegionalStock } from '@/types/brand-portal';
import type {
  ProductCategory,
  ProductImage,
  ProductVariant,
  Material,
  CraftsmanshipDetail,
  ProductVisibility,
  ExperienceMode,
  PricingVisibility,
  CommerceAction
} from '@/types/product';

// ============================================
// TOAST COMPONENT
// ============================================

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3 bg-success text-white px-5 py-3 shadow-lg">
        <Check size={16} />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onDismiss} className="ml-2 hover:opacity-70 transition-opacity">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, updateProduct, deleteProduct } = useBrand();

  const productId = params.id as string;
  const product = getProductById(productId);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: 'bags' as ProductCategory,
    description: '',
    tagline: '',
    narrative: '',
    status: 'draft' as BrandProductStatus,
    ivEnabled: false,
    visibility: 'public' as ProductVisibility,
    experienceMode: 'standard' as ExperienceMode,
    pricingVisibility: 'visible' as PricingVisibility,
    commerceAction: 'add_to_considerations' as CommerceAction,
  });

  // Editable arrays
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [craftsmanship, setCraftsmanship] = useState<CraftsmanshipDetail[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
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
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        tagline: product.tagline,
        narrative: product.narrative || '',
        status: product.status,
        ivEnabled: product.ivEnabled,
        visibility: product.visibility,
        experienceMode: product.experienceMode,
        pricingVisibility: product.pricingVisibility,
        commerceAction: product.commerceAction,
      });
      setImages(product.images ? [...product.images] : []);
      setVariants(product.variants ? [...product.variants] : []);
      setMaterials(product.materials ? [...product.materials] : []);
      setCraftsmanship(product.craftsmanship ? [...product.craftsmanship] : []);
    }
  }, [product]);

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

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Product not found</p>
        <Link
          href="/brand/products"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const markDirty = () => setHasChanges(true);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markDirty();
  };

  // ============================================
  // SAVE
  // ============================================

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProduct(productId, {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price) || product.price,
        category: formData.category,
        description: formData.description,
        tagline: formData.tagline,
        narrative: formData.narrative || formData.description,
        status: formData.status,
        ivEnabled: formData.ivEnabled,
        visibility: formData.visibility,
        experienceMode: formData.experienceMode,
        pricingVisibility: formData.pricingVisibility,
        commerceAction: formData.commerceAction,
        images,
        variants,
        materials,
        craftsmanship,
      });
      setHasChanges(false);
      setToastMessage('Product saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // STOCK
  // ============================================

  const handleStockSave = (updatedStock: RegionalStock[]) => {
    const newTotal = updatedStock.reduce((sum, s) => sum + s.units, 0);
    updateProduct(productId, {
      regionalStock: updatedStock,
      totalStock: newTotal,
    });
    setToastMessage('Stock updated successfully');
  };

  // ============================================
  // DELETE
  // ============================================

  const isDeleteDangerous = product.status === 'published' && product.totalStock > 0;

  const handleDelete = () => {
    deleteProduct(productId);
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
      alt: formData.name || 'Product image',
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
      currency: product.currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  const isLowStock = product.totalStock > 0 && product.totalStock <= 10;
  const categories: ProductCategory[] = ['bags', 'clothing', 'shoes', 'accessories', 'jewelry', 'watches'];

  const inputBase = 'w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors';
  const inputErrorCls = 'w-full px-4 py-3 bg-transparent border border-error text-charcoal-deep focus:outline-none focus:border-error transition-colors';
  const inputSmall = 'w-full px-3 py-2 bg-transparent border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors';

  return (
    <div>
      {/* Success Toast */}
      {toastMessage && (
        <SuccessToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      <BrandPageHeader
        title={product.name}
        breadcrumbs={[
          { label: 'Products', href: '/brand/products' },
          { label: product.name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/products" icon={ArrowLeft}>
              Back
            </SecondaryButton>
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
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    className={`${inputBase} uppercase`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Price (EUR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`${inputBase} cursor-pointer`}
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
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={`${inputBase} cursor-pointer`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
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
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Narrative
                  </label>
                  <textarea
                    value={formData.narrative}
                    onChange={(e) => handleChange('narrative', e.target.value)}
                    rows={4}
                    className={`${inputBase} resize-none`}
                    placeholder="The story behind this product — its origins, craftsmanship journey, and cultural significance..."
                  />
                  <p className="mt-1.5 text-xs text-taupe">
                    Rich storytelling content for the product detail page. Falls back to description if empty.
                  </p>
                </div>
              </div>
            </section>

            {/* Commerce & Visibility */}
            <section className="bg-white border border-sand/50 p-6 space-y-6">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
                Commerce & Visibility
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* IV Toggle */}
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
                      onClick={() => handleChange('ivEnabled', !formData.ivEnabled)}
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
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className={`${inputBase} cursor-pointer`}
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
                    onChange={(e) => handleChange('experienceMode', e.target.value)}
                    className={`${inputBase} cursor-pointer`}
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
                    onChange={(e) => handleChange('pricingVisibility', e.target.value)}
                    className={`${inputBase} cursor-pointer`}
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
                    onChange={(e) => handleChange('commerceAction', e.target.value)}
                    className={`${inputBase} cursor-pointer`}
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

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
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
                      <div className="px-2 py-1.5 flex items-center justify-between">
                        <span className="text-[9px] tracking-[0.15em] uppercase text-stone">{img.type}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="text-stone hover:text-error transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Add Image URL
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => { setImageUrl(e.target.value); if (imageUrlError) setImageUrlError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                      className={imageUrlError ? inputErrorCls : inputBase}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    {imageUrlError && <p className="mt-1.5 text-xs text-error">{imageUrlError}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-3 border border-sand text-sm text-stone hover:text-charcoal-deep hover:bg-parchment/30 transition-colors flex items-center gap-2 shrink-0"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-taupe">First image becomes the hero. Press Enter or click Add.</p>
              </div>

              {images.length === 0 && (
                <div className="border-2 border-dashed border-sand p-6 text-center">
                  <ImageIcon size={20} className="text-stone mx-auto mb-2" />
                  <p className="text-sm text-stone">No images yet</p>
                </div>
              )}
            </section>

            {/* Variants */}
            <section className="bg-white border border-sand/50 p-6 space-y-6">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
                Variants
              </h2>

              {variants.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sand/50">
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Type</th>
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Name</th>
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Value</th>
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Available</th>
                        <th className="pb-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => (
                        <tr key={v.id} className="border-b border-sand/20 last:border-0">
                          <td className="py-2.5 pr-4">
                            <span className="px-2 py-0.5 bg-parchment text-[10px] tracking-[0.1em] uppercase text-stone">{v.type}</span>
                          </td>
                          <td className="py-2.5 pr-4 text-charcoal-deep">{v.name}</td>
                          <td className="py-2.5 pr-4 text-charcoal-deep">
                            {v.type === 'color' ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border border-sand/50" style={{ backgroundColor: v.value }} />
                                {v.value}
                              </span>
                            ) : v.value}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`text-[10px] tracking-[0.1em] uppercase ${v.available ? 'text-success' : 'text-stone'}`}>
                              {v.available ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <button onClick={() => handleRemoveVariant(v.id)} className="text-stone hover:text-error transition-colors">
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add variant row */}
              <div className="flex items-end gap-3">
                <div className="w-28">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Type</label>
                  <select
                    value={newVariant.type}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, type: e.target.value as ProductVariant['type'] }))}
                    className={`${inputSmall} cursor-pointer`}
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                    <option value="material">Material</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Name</label>
                  <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariant(); } }}
                    className={inputSmall}
                    placeholder="e.g., Small"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Value</label>
                  <input
                    type="text"
                    value={newVariant.value}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, value: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariant(); } }}
                    className={inputSmall}
                    placeholder="e.g., small"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-2 border border-sand text-sm text-stone hover:text-charcoal-deep hover:bg-parchment/30 transition-colors shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>

            {/* Materials */}
            <section className="bg-white border border-sand/50 p-6 space-y-6">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
                Materials
              </h2>

              {materials.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-sand/50">
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Name</th>
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Composition</th>
                        <th className="text-left text-[10px] tracking-[0.15em] uppercase text-stone pb-3 pr-4">Origin</th>
                        <th className="pb-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, idx) => (
                        <tr key={idx} className="border-b border-sand/20 last:border-0">
                          <td className="py-2.5 pr-4 text-charcoal-deep font-medium">{m.name}</td>
                          <td className="py-2.5 pr-4 text-charcoal-deep">{m.composition}</td>
                          <td className="py-2.5 pr-4 text-stone">{m.origin}</td>
                          <td className="py-2.5">
                            <button onClick={() => handleRemoveMaterial(idx)} className="text-stone hover:text-error transition-colors">
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Name</label>
                  <input
                    type="text"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMaterial(); } }}
                    className={inputSmall}
                    placeholder="e.g., Lambskin"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Composition</label>
                  <input
                    type="text"
                    value={newMaterial.composition}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, composition: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMaterial(); } }}
                    className={inputSmall}
                    placeholder="e.g., 100% Lambskin leather"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Origin</label>
                  <input
                    type="text"
                    value={newMaterial.origin}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, origin: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMaterial(); } }}
                    className={inputSmall}
                    placeholder="e.g., Italy"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="px-3 py-2 border border-sand text-sm text-stone hover:text-charcoal-deep hover:bg-parchment/30 transition-colors shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>

            {/* Craftsmanship */}
            <section className="bg-white border border-sand/50 p-6 space-y-6">
              <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4">
                Craftsmanship
              </h2>

              {craftsmanship.length > 0 && (
                <div className="space-y-3">
                  {craftsmanship.map((c, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 py-3 border-b border-sand/20 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal-deep font-medium">{c.title}</p>
                        <p className="text-xs text-stone mt-1">{c.description}</p>
                        {c.duration && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-parchment text-[10px] tracking-[0.1em] uppercase text-stone">
                            {c.duration}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleRemoveCraft(idx)} className="text-stone hover:text-error transition-colors mt-1 shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Title</label>
                  <input
                    type="text"
                    value={newCraft.title}
                    onChange={(e) => setNewCraft(prev => ({ ...prev, title: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCraft(); } }}
                    className={inputSmall}
                    placeholder="e.g., Cannage Quilting"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Description</label>
                  <input
                    type="text"
                    value={newCraft.description}
                    onChange={(e) => setNewCraft(prev => ({ ...prev, description: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCraft(); } }}
                    className={inputSmall}
                    placeholder="e.g., Signature quilted pattern"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[9px] tracking-[0.15em] uppercase text-stone mb-1">Duration</label>
                  <input
                    type="text"
                    value={newCraft.duration}
                    onChange={(e) => setNewCraft(prev => ({ ...prev, duration: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCraft(); } }}
                    className={inputSmall}
                    placeholder="e.g., 3 hours"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCraft}
                  className="px-3 py-2 border border-sand text-sm text-stone hover:text-charcoal-deep hover:bg-parchment/30 transition-colors shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>

            {/* Regional Stock */}
            <section className="bg-white border border-sand/50 p-6">
              <div className="flex items-center justify-between border-b border-sand/50 pb-4 mb-6">
                <h2 className="font-medium text-charcoal-deep">
                  Regional Stock
                </h2>
                <button
                  onClick={() => setIsStockModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-sand text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:bg-parchment transition-colors"
                >
                  <Settings2 size={14} /> Manage Stock
                </button>
              </div>

              {product.regionalStock.length === 0 ? (
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
                  {product.regionalStock.map((stock, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 border-b border-sand/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-taupe" />
                        <div>
                          <p className="text-sm text-charcoal-deep">{stock.city}</p>
                          <p className="text-xs text-taupe">{stock.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          stock.units <= stock.lowStockThreshold ? 'text-warning' : 'text-charcoal-deep'
                        }`}>
                          {stock.units} units
                        </p>
                        {stock.units <= stock.lowStockThreshold && (
                          <p className="text-xs text-warning flex items-center gap-1">
                            <AlertTriangle size={10} /> Below threshold
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Stock Management Modal */}
            <StockManagementModal
              isOpen={isStockModalOpen}
              onClose={() => setIsStockModalOpen(false)}
              productName={product.name}
              regionalStock={product.regionalStock}
              onSave={handleStockSave}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white border border-sand/50 p-4">
              <div className="aspect-square bg-parchment relative overflow-hidden">
                {images[0] ? (
                  <Image
                    src={images[0].url}
                    alt={images[0].alt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-taupe text-sm">
                    No image
                  </div>
                )}
              </div>
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
                    {product.performanceMetrics.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <Heart size={14} /> Add to Considerations
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performanceMetrics.addToCart.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <DollarSign size={14} /> Purchases
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performanceMetrics.purchases.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <TrendingUp size={14} /> Conversion
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performanceMetrics.conversionRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone flex items-center gap-2">
                    <Clock size={14} /> Avg Decision Time
                  </span>
                  <span className="text-sm text-charcoal-deep">
                    {product.performanceMetrics.avgTimeToDecision}h
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-sand/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-stone">Demand Score</span>
                  <span className={`text-sm font-medium ${
                    product.demandScore >= 80 ? 'text-success' :
                    product.demandScore >= 50 ? 'text-charcoal-deep' :
                    'text-warning'
                  }`}>
                    {product.demandScore}/100
                  </span>
                </div>
                <div className="h-2 bg-parchment overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      product.demandScore >= 80 ? 'bg-success' :
                      product.demandScore >= 50 ? 'bg-gold-muted' :
                      'bg-warning'
                    }`}
                    style={{ width: `${product.demandScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="bg-white border border-sand/50 p-6">
              <h3 className="text-sm font-medium text-charcoal-deep mb-4">Stock Summary</h3>
              <div className="text-center py-4">
                <p className={`text-3xl font-display ${isLowStock ? 'text-warning' : 'text-charcoal-deep'}`}>
                  {product.totalStock}
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
                  {formatCurrency(product.performanceMetrics.revenue)}
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
                Are you sure you want to delete <span className="font-medium text-charcoal-deep">{product.name}</span>? This action cannot be undone.
              </p>
              {isDeleteDangerous && (
                <div className="mt-4 flex items-start gap-2 bg-warning/10 border border-warning/20 p-3 text-left">
                  <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning">
                    This product is currently <strong>published</strong> with <strong>{product.totalStock} units</strong> in stock. Deleting it will remove it from all storefronts immediately.
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
                {isDeleteDangerous ? 'Delete Anyway' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
