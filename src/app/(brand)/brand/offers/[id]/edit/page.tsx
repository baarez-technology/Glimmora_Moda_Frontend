'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, FolderOpen, Building, Percent, DollarSign, Plus, X } from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { fetchUhniOffer, updateUhniOffer } from '@/services/uhni-offers.service';
import { fetchProducts, type BackendProduct } from '@/services/brand-product.service';
import { fetchCollections, type CollectionResponse } from '@/services/brand-collection.service';
import { useApp } from '@/context/AppContext';

type OfferType = 'products' | 'collections' | 'brand';
type DiscountType = 'percentage' | 'fixed';

const offerTypes: { value: OfferType; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'products', label: 'Products', description: 'Discount on specific products', icon: Package },
  { value: 'collections', label: 'Collection', description: 'Discount on entire collection', icon: FolderOpen },
  { value: 'brand', label: 'Brand-wide', description: 'Discount on all brand products', icon: Building },
];

const discountTypes: { value: DiscountType; label: string; icon: React.ElementType }[] = [
  { value: 'percentage', label: 'Percentage Off', icon: Percent },
  { value: 'fixed', label: 'Fixed Amount Off', icon: DollarSign },
];

function toDateInput(iso: string) {
  return iso ? iso.split('T')[0] : '';
}

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useApp();

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    offerType: 'products' as OfferType,
    selectedProducts: [] as string[],
    selectedCollections: [] as string[],
    discountType: 'percentage' as DiscountType,
    discountValue: 10,
    validFrom: '',
    validUntil: '',
    conditions: [] as string[],
    newCondition: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchUhniOffer(id),
      fetchProducts().catch(() => []),
      fetchCollections().catch(() => []),
    ]).then(([offer, prods, cols]) => {
      setProducts(prods);
      setCollections(cols);
      setFormData({
        offerType: (offer.offer_type as OfferType) || 'products',
        selectedProducts: offer.offer_products ?? [],
        selectedCollections: offer.offer_collections ?? [],
        discountType: offer.discount_type,
        discountValue: offer.discount_value,
        validFrom: toDateInput(offer.valid_from),
        validUntil: toDateInput(offer.valid_until),
        conditions: offer.conditions ?? [],
        newCondition: '',
      });
    }).catch(() => showToast('Failed to load offer', 'error'))
      .finally(() => setIsLoadingData(false));
  }, [id]);

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(i => i !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  const toggleCollection = (collectionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCollections: prev.selectedCollections.includes(collectionId)
        ? prev.selectedCollections.filter(i => i !== collectionId)
        : [...prev.selectedCollections, collectionId],
    }));
  };

  const addCondition = () => {
    if (formData.newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, prev.newCondition.trim()],
        newCondition: '',
      }));
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const isTargetValid = () => {
    if (formData.offerType === 'brand') return true;
    if (formData.offerType === 'products') return formData.selectedProducts.length > 0;
    if (formData.offerType === 'collections') return formData.selectedCollections.length > 0;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTargetValid() || !formData.discountValue) return;

    setIsSubmitting(true);
    try {
      await updateUhniOffer(id, {
        offer_type: formData.offerType,
        ...(formData.offerType === 'products' && { offer_products: formData.selectedProducts }),
        ...(formData.offerType === 'collections' && { offer_collections: formData.selectedCollections }),
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        valid_from: new Date(formData.validFrom).toISOString(),
        valid_until: new Date(formData.validUntil).toISOString(),
        conditions: formData.conditions,
      });
      showToast('Offer updated', 'success');
      router.push(`/brand/offers/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update offer';
      showToast(msg, 'error');
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div>
        <BrandPageHeader title="Edit Offer" breadcrumbs={[{ label: 'UHNI Offers', href: '/brand/offers' }, { label: 'Edit' }]} />
        <div className="p-8 text-center text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <BrandPageHeader
        title="Edit Offer"
        breadcrumbs={[
          { label: 'UHNI Offers', href: '/brand/offers' },
          { label: id.slice(-8), href: `/brand/offers/${id}` },
          { label: 'Edit' },
        ]}
        actions={
          <SecondaryButton href={`/brand/offers/${id}`} icon={ArrowLeft}>
            Cancel
          </SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">
        {/* Offer Type */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Offer Type</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offerTypes.map(type => {
                const Icon = type.icon;
                const isSelected = formData.offerType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      offerType: type.value,
                      selectedProducts: [],
                      selectedCollections: [],
                    }))}
                    className={`p-4 border text-left transition-colors ${
                      isSelected ? 'border-charcoal-deep bg-parchment' : 'border-sand hover:border-charcoal-deep/50'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-charcoal-deep' : 'text-taupe'} />
                    <p className={`text-sm font-medium mt-2 ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-taupe mt-0.5">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Target Selection */}
        {formData.offerType !== 'brand' && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">
                Select {formData.offerType === 'products' ? 'Products' : 'Collections'}
              </h2>
              {formData.offerType === 'products' && formData.selectedProducts.length > 0 && (
                <span className="text-xs text-taupe">{formData.selectedProducts.length} selected</span>
              )}
              {formData.offerType === 'collections' && formData.selectedCollections.length > 0 && (
                <span className="text-xs text-taupe">{formData.selectedCollections.length} selected</span>
              )}
            </div>
            <div className="p-6">
              {formData.offerType === 'products' ? (
                products.length === 0 ? (
                  <p className="text-sm text-taupe text-center py-4">No products available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                    {products.map(product => {
                      const isSelected = formData.selectedProducts.includes(product.product_id);
                      return (
                        <button
                          key={product.product_id}
                          type="button"
                          onClick={() => toggleProduct(product.product_id)}
                          className={`flex items-center gap-3 p-3 border text-left transition-colors ${
                            isSelected ? 'border-charcoal-deep bg-parchment' : 'border-sand hover:border-charcoal-deep/50'
                          }`}
                        >
                          <div className="w-10 h-10 bg-parchment flex-shrink-0 overflow-hidden">
                            {product.product_image && (
                              <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                              {product.product_name}
                            </p>
                            <p className="text-[10px] text-taupe">${product.price.toLocaleString()}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                collections.length === 0 ? (
                  <p className="text-sm text-taupe text-center py-4">No collections available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {collections.map(collection => {
                      const isSelected = formData.selectedCollections.includes(collection.collection_id);
                      return (
                        <button
                          key={collection.collection_id}
                          type="button"
                          onClick={() => toggleCollection(collection.collection_id)}
                          className={`flex items-center gap-3 p-3 border text-left transition-colors ${
                            isSelected ? 'border-charcoal-deep bg-parchment' : 'border-sand hover:border-charcoal-deep/50'
                          }`}
                        >
                          <div className="w-12 h-12 bg-parchment flex-shrink-0 overflow-hidden">
                            {collection.collection_image && (
                              <img src={collection.collection_image} alt={collection.collection_name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                              {collection.collection_name}
                            </p>
                            <p className="text-[10px] text-taupe capitalize">{collection.season} {collection.year}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Discount Details */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Discount Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Discount Type</label>
              <div className="flex gap-4">
                {discountTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = formData.discountType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, discountType: type.value }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border transition-colors ${
                        isSelected
                          ? 'border-charcoal-deep bg-parchment text-charcoal-deep'
                          : 'border-sand text-stone hover:border-charcoal-deep/50'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Discount Value *</label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  required
                  min={1}
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe">
                  {formData.discountType === 'percentage' ? '%' : '$'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Valid From *</label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Valid Until *</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  required
                  min={formData.validFrom}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-medium text-charcoal-deep">Conditions</h2>
            <span className="text-sm text-taupe">
              {formData.conditions.length} condition{formData.conditions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-taupe">Add any special conditions or requirements for this offer</p>

            {formData.conditions.length > 0 && (
              <div className="space-y-2">
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-parchment/50">
                    <span className="flex-1 text-sm text-charcoal-deep">{condition}</span>
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="text-error hover:text-error/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={formData.newCondition}
                onChange={(e) => setFormData(prev => ({ ...prev, newCondition: e.target.value }))}
                placeholder="e.g., Minimum purchase of $1,000"
                className="flex-1 px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCondition(); } }}
              />
              <button
                type="button"
                onClick={addCondition}
                disabled={!formData.newCondition.trim()}
                className="px-4 py-3 border border-sand text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/brand/offers/${id}`}
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !isTargetValid() || !formData.discountValue}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
