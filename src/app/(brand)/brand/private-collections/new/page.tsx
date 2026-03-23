'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { ArrowLeft, Lock, Sparkles, Users, Crown, Loader2 } from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { PrivateCollectionAccess, UhniCustomer } from '@/types/uhni';
import {
  fetchBrandProducts,
  createPrivateCollection,
  fetchUhniCustomers,
  type mapApiProduct,
} from '@/services/private-collection.service';

type ApiProductItem = ReturnType<typeof mapApiProduct>;

export default function NewPrivateCollectionPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    heroImage: '',
    accessLevel: 'uhni_only' as PrivateCollectionAccess,
    previewDate: '',
    releaseDate: '',
    notes: '',
    selectedProducts: [] as string[],
    selectedCustomers: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Products
  const [apiProducts, setApiProducts] = useState<ApiProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // UHNI customers
  const [uhniCustomers, setUhniCustomers] = useState<UhniCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    setProductsLoading(true);
    fetchBrandProducts({
      search: productSearch,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      page_number: pageNumber,
      page_size: pageSize,
    })
      .then(res => { setApiProducts(res.items); setTotalProducts(res.total); })
      .catch(() => { setApiProducts([]); setTotalProducts(0); })
      .finally(() => setProductsLoading(false));
  }, [productSearch, minPrice, maxPrice, pageNumber, pageSize]);

  // Load UHNI customers when invitation access level is selected
  useEffect(() => {
    if (formData.accessLevel !== 'invitation') return;
    setCustomersLoading(true);
    fetchUhniCustomers()
      .then(setUhniCustomers)
      .catch(() => setUhniCustomers([]))
      .finally(() => setCustomersLoading(false));
  }, [formData.accessLevel]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createPrivateCollection({
        private_collection_name: formData.name,
        description: formData.description,
        image_url: formData.heroImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
        access_level: formData.accessLevel,
        preview_date: formData.previewDate ? new Date(formData.previewDate).toISOString() : null,
        release_date: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null,
        products: formData.selectedProducts,
        customer_ids: formData.accessLevel === 'invitation' ? formData.selectedCustomers : [],
        notes: formData.notes || undefined,
      });
      router.push('/brand/private-collections');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create collection');
      setIsSubmitting(false);
    }
  };

  const toggleProduct = (productId: string) =>
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId],
    }));

  const toggleCustomer = (customerId: string) =>
    setFormData(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.includes(customerId)
        ? prev.selectedCustomers.filter(id => id !== customerId)
        : [...prev.selectedCustomers, customerId],
    }));

  const accessLevels: { value: PrivateCollectionAccess; label: string; description: string; icon: React.ElementType }[] = [
    { value: 'uhni_only', label: 'UHNI Only', description: 'All UHNI members get automatic access', icon: Sparkles },
    { value: 'invitation', label: 'Invitation Only', description: 'Personally invite selected clients', icon: Lock },
    { value: 'request', label: 'Request Access', description: 'Clients can request access', icon: Users },
  ];

  return (
    <div>
      <BrandPageHeader
        title="Create Private Collection"
        breadcrumbs={[
          { label: 'Private Collections', href: '/brand/private-collections' },
          { label: 'New Collection' },
        ]}
        actions={
          <SecondaryButton href="/brand/private-collections" icon={ArrowLeft}>Cancel</SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{submitError}</div>
        )}

        {/* Basic Info */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Collection Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Collection Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Atelier Exclusives 2024"
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required rows={4}
                placeholder="Describe this exclusive collection..."
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Hero Image URL</label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={formData.heroImage}
                  onChange={e => setFormData({ ...formData, heroImage: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
                {formData.heroImage && (
                  <div className="w-20 h-12 bg-parchment flex-shrink-0">
                    <img src={formData.heroImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this collection..."
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Access Level */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Access Level</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accessLevels.map(level => {
                const Icon = level.icon;
                const isSelected = formData.accessLevel === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, accessLevel: level.value, selectedCustomers: [] })}
                    className={`p-4 border text-left transition-colors ${
                      isSelected ? 'border-charcoal-deep bg-parchment' : 'border-sand hover:border-charcoal-deep/50'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-charcoal-deep' : 'text-taupe'} />
                    <p className={`text-sm font-medium mt-2 ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                      {level.label}
                    </p>
                    <p className="text-xs text-taupe mt-1">{level.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Selection — invitation only */}
        {formData.accessLevel === 'invitation' && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-charcoal-deep">Invite Clients</h2>
                <p className="text-xs text-taupe mt-0.5">Select the clients to invite to this collection</p>
              </div>
              <span className="text-sm text-taupe">{formData.selectedCustomers.length} selected</span>
            </div>
            <div className="p-6">
              {customersLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-taupe text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading clients…
                </div>
              ) : uhniCustomers.length === 0 ? (
                <p className="text-sm text-stone text-center py-8">No UHNI customers found</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {uhniCustomers.map(c => {
                    const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.customer_id;
                    const checked = formData.selectedCustomers.includes(c.customer_id);
                    return (
                      <label
                        key={c.customer_id}
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                          checked ? 'border-charcoal-deep bg-parchment' : 'border-sand/50 hover:border-charcoal-deep/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCustomer(c.customer_id)}
                          className="accent-charcoal-deep"
                        />
                        {c.profile_picture ? (
                          <img src={c.profile_picture} alt={name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center">
                            <Crown size={13} className="text-taupe" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep">{name}</p>
                          <p className="text-xs text-taupe">{c.email}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Schedule</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Preview Date</label>
              <input
                type="date"
                value={formData.previewDate}
                onChange={e => setFormData({ ...formData, previewDate: e.target.value })}
                className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              <p className="text-xs text-taupe mt-1">When eligible members can preview</p>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Release Date</label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              <p className="text-xs text-taupe mt-1">When collection becomes available</p>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-medium text-charcoal-deep">Products</h2>
            <span className="text-sm text-taupe">{formData.selectedProducts.length} selected</span>
          </div>
          <div className="p-6">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setPageNumber(1); }}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              <input
                type="number"
                value={minPrice}
                onChange={e => { setMinPrice(e.target.value); setPageNumber(1); }}
                placeholder="Min price"
                min={0}
                className="w-28 px-3 py-2 border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={e => { setMaxPrice(e.target.value); setPageNumber(1); }}
                placeholder="Max price"
                min={0}
                className="w-28 px-3 py-2 border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
            {productsLoading ? (
              <p className="text-sm text-taupe text-center py-8">Loading products...</p>
            ) : apiProducts.length === 0 ? (
              <p className="text-sm text-taupe text-center py-8">No products available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiProducts.map(product => {
                  const isSelected = formData.selectedProducts.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-4 p-4 border text-left transition-colors ${
                        isSelected ? 'border-charcoal-deep bg-parchment' : 'border-sand hover:border-charcoal-deep/50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-parchment flex-shrink-0">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                          {product.name}
                        </p>
                        {product.price !== undefined && (
                          <p className="text-xs text-taupe">{formatPrice(product.price)}</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-charcoal-deep bg-charcoal-deep' : 'border-taupe'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-ivory-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-sand/50">
                <p className="text-xs text-taupe">Page {pageNumber} of {totalPages} · {totalProducts} products</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}
                    className="px-3 py-1 text-xs border border-sand text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-40">
                    Previous
                  </button>
                  <button type="button" onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages}
                    className="px-3 py-1 text-xs border border-sand text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-40">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/brand/private-collections"
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.description}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
