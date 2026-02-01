'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, FolderOpen, Building, Percent, DollarSign, Plus, X } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { UHNIPriceOffer } from '@/types/brand-portal';

type OfferType = UHNIPriceOffer['type'];
type DiscountType = UHNIPriceOffer['discountType'];

export default function NewOfferPage() {
  const router = useRouter();
  const { createUHNIOffer, products, collections, partner } = useBrand();

  const [formData, setFormData] = useState({
    type: 'product' as OfferType,
    targetId: '',
    discountType: 'percentage' as DiscountType,
    discountValue: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    conditions: [] as string[],
    newCondition: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner || !formData.targetId) return;

    setIsSubmitting(true);

    let targetName = '';
    let targetImage = '';

    if (formData.type === 'product') {
      const product = products.find(p => p.id === formData.targetId);
      if (product) {
        targetName = product.name;
        targetImage = product.images[0]?.url || '';
      }
    } else if (formData.type === 'collection') {
      const collection = collections.find(c => c.id === formData.targetId);
      if (collection) {
        targetName = collection.name;
        targetImage = collection.heroImage || '';
      }
    } else {
      targetName = partner.brandName;
      targetImage = '';
    }

    createUHNIOffer({
      type: formData.type,
      targetId: formData.type === 'brand' ? partner.brandId : formData.targetId,
      targetName,
      targetImage,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      claimed: false,
      conditions: formData.conditions.length > 0 ? formData.conditions : undefined
    });

    setTimeout(() => {
      router.push('/brand/offers');
    }, 500);
  };

  const addCondition = () => {
    if (formData.newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, prev.newCondition.trim()],
        newCondition: ''
      }));
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const offerTypes: { value: OfferType; label: string; description: string; icon: React.ElementType }[] = [
    { value: 'product', label: 'Product', description: 'Discount on a specific product', icon: Package },
    { value: 'collection', label: 'Collection', description: 'Discount on entire collection', icon: FolderOpen },
    { value: 'brand', label: 'Brand-wide', description: 'Discount on all brand products', icon: Building }
  ];

  const discountTypes: { value: DiscountType; label: string; icon: React.ElementType }[] = [
    { value: 'percentage', label: 'Percentage Off', icon: Percent },
    { value: 'fixed', label: 'Fixed Amount Off', icon: DollarSign }
  ];

  const publishedProducts = products.filter(p => p.status === 'published');

  return (
    <div>
      <BrandPageHeader
        title="Create UHNI Offer"
        breadcrumbs={[
          { label: 'UHNI Offers', href: '/brand/offers' },
          { label: 'New Offer' }
        ]}
        actions={
          <SecondaryButton href="/brand/offers" icon={ArrowLeft}>
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
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value, targetId: type.value === 'brand' ? 'brand' : '' })}
                    className={`p-4 border text-left transition-colors ${
                      isSelected
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-charcoal-deep/50'
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

        {/* Target Selection (only for product and collection) */}
        {formData.type !== 'brand' && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">
                Select {formData.type === 'product' ? 'Product' : 'Collection'}
              </h2>
            </div>
            <div className="p-6">
              {formData.type === 'product' ? (
                publishedProducts.length === 0 ? (
                  <p className="text-sm text-taupe text-center py-4">No published products available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                    {publishedProducts.map(product => {
                      const isSelected = formData.targetId === product.id;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, targetId: product.id })}
                          className={`flex items-center gap-3 p-3 border text-left transition-colors ${
                            isSelected
                              ? 'border-charcoal-deep bg-parchment'
                              : 'border-sand hover:border-charcoal-deep/50'
                          }`}
                        >
                          <div className="w-10 h-10 bg-parchment flex-shrink-0">
                            {product.images[0] && (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                              {product.name}
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
                      const isSelected = formData.targetId === collection.id;
                      return (
                        <button
                          key={collection.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, targetId: collection.id })}
                          className={`flex items-center gap-3 p-3 border text-left transition-colors ${
                            isSelected
                              ? 'border-charcoal-deep bg-parchment'
                              : 'border-sand hover:border-charcoal-deep/50'
                          }`}
                        >
                          <div className="w-12 h-12 bg-parchment flex-shrink-0">
                            {collection.heroImage && (
                              <img
                                src={collection.heroImage}
                                alt={collection.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                              {collection.name}
                            </p>
                            <p className="text-[10px] text-taupe">{collection.productIds.length} products</p>
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
            {/* Discount Type */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Discount Type
              </label>
              <div className="flex gap-4">
                {discountTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = formData.discountType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: type.value })}
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

            {/* Discount Value */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Discount Value *
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
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

            {/* Validity Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Valid From *
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
            <span className="text-sm text-taupe">{formData.conditions.length} condition{formData.conditions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-taupe">Add any special conditions or requirements for this offer</p>

            {/* Existing Conditions */}
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

            {/* Add Condition */}
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.newCondition}
                onChange={(e) => setFormData({ ...formData, newCondition: e.target.value })}
                placeholder="e.g., Minimum purchase of $1,000"
                className="flex-1 px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCondition();
                  }
                }}
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
            href="/brand/offers"
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || (formData.type !== 'brand' && !formData.targetId) || !formData.discountValue}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
}
