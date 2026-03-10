'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Sparkles, Users } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { PrivateCollectionAccess } from '@/types/uhni';
import { fetchBrandProducts, type mapApiProduct } from '@/services/private-collection.service';

type ApiProductItem = ReturnType<typeof mapApiProduct>;

export default function EditPrivateCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;
  const { getPrivateCollectionById, updatePrivateCollection, partner } = useBrand();

  const collection = getPrivateCollectionById(collectionId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    heroImage: '',
    accessLevel: 'uhni_only' as PrivateCollectionAccess,
    previewDate: '',
    releaseDate: '',
    selectedProducts: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Products fetched from real API
  const [apiProducts, setApiProducts] = useState<ApiProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const totalPages = Math.ceil(totalProducts / pageSize);

  // Pre-fill form with existing collection data
  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        description: collection.description,
        heroImage: collection.heroImage,
        accessLevel: collection.accessLevel,
        previewDate: collection.previewDate ? new Date(collection.previewDate).toISOString().split('T')[0] : '',
        releaseDate: collection.releaseDate ? new Date(collection.releaseDate).toISOString().split('T')[0] : '',
        // product IDs already stored on the collection
        selectedProducts: collection.products.map(p => p.id)
      });
    }
  }, [collection]);

  // Fetch products from real API, re-fetch when filters/page change
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

  if (!collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Private collection not found</p>
        <Link
          href="/brand/private-collections"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Private Collections
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;

    setIsSubmitting(true);

    // Store only product IDs as stubs — backend receives product_ids, detail page resolves names/images
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedProductStubs = formData.selectedProducts.map(pid => ({ id: pid })) as any[];

    updatePrivateCollection(collectionId, {
      name: formData.name,
      description: formData.description,
      heroImage: formData.heroImage,
      accessLevel: formData.accessLevel,
      products: selectedProductStubs,
      previewDate: new Date(formData.previewDate).toISOString(),
      releaseDate: new Date(formData.releaseDate).toISOString(),
      invitationRequired: formData.accessLevel === 'invitation'
    });

    setTimeout(() => {
      router.push(`/brand/private-collections/${collectionId}`);
    }, 500);
  };

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  const accessLevels: { value: PrivateCollectionAccess; label: string; description: string; icon: React.ElementType }[] = [
    { value: 'uhni_only', label: 'UHNI Only', description: 'Exclusively for UHNI tier members', icon: Sparkles },
    { value: 'invitation', label: 'Invitation', description: 'Requires personal invitation', icon: Lock },
    { value: 'request', label: 'Request Access', description: 'Members can request access', icon: Users }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Edit Private Collection"
        breadcrumbs={[
          { label: 'Private Collections', href: '/brand/private-collections' },
          { label: collection.name, href: `/brand/private-collections/${collectionId}` },
          { label: 'Edit' }
        ]}
        actions={
          <SecondaryButton href={`/brand/private-collections/${collectionId}`} icon={ArrowLeft}>
            Cancel
          </SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Collection Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Hero Image URL
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={formData.heroImage}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
                {formData.heroImage && (
                  <div className="w-20 h-12 bg-parchment flex-shrink-0">
                    <img
                      src={formData.heroImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
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
                    onClick={() => setFormData({ ...formData, accessLevel: level.value })}
                    className={`p-4 border text-left transition-colors ${
                      isSelected
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-charcoal-deep/50'
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

        {/* Dates */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Schedule</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Preview Date *
              </label>
              <input
                type="date"
                value={formData.previewDate}
                onChange={(e) => setFormData({ ...formData, previewDate: e.target.value })}
                required
                className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Release Date *
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                required
                className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              />
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
            {/* Filters */}
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
                        isSelected
                          ? 'border-charcoal-deep bg-parchment'
                          : 'border-sand hover:border-charcoal-deep/50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-parchment flex-shrink-0">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                          {product.name}
                        </p>
                        {product.price !== undefined && (
                          <p className="text-xs text-taupe">&euro;{product.price.toLocaleString()}</p>
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-sand/50">
                <p className="text-xs text-taupe">
                  Page {pageNumber} of {totalPages} &middot; {totalProducts} products
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                    className="px-3 py-1 text-xs border border-sand text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                    className="px-3 py-1 text-xs border border-sand text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/brand/private-collections/${collectionId}`}
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.description || !formData.previewDate || !formData.releaseDate}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Update Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
