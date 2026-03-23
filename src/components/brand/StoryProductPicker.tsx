'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Check, Package } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { fetchBrandProducts, type mapApiProduct } from '@/services/private-collection.service';

type ApiProductItem = ReturnType<typeof mapApiProduct>;

const PAGE_SIZE = 10;

interface StoryProductPickerProps {
  selectedIds: string[];
  onToggle: (productId: string) => void;
}

interface ProductRowProps {
  product: ApiProductItem;
  isSelected: boolean;
  onToggle: () => void;
}

function ProductRow({ product, isSelected, onToggle }: ProductRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-4 p-4 border text-left transition-colors w-full ${
        isSelected ? 'border-charcoal-deep bg-parchment' : 'border-sand hover:border-charcoal-deep/50'
      }`}
    >
      <div className="w-12 h-12 bg-parchment flex-shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={16} className="text-taupe/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
          {product.name}
        </p>
        {product.price !== undefined && (
          <p className="text-xs text-taupe mt-0.5">{formatPrice(product.price)}</p>
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
}

export default function StoryProductPicker({ selectedIds, onToggle }: StoryProductPickerProps) {
  const [products, setProducts] = useState<ApiProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const load = useCallback(() => {
    setLoading(true);
    fetchBrandProducts({
      search: search || undefined,
      page_number: pageNumber,
      page_size: PAGE_SIZE,
    })
      .then(res => { setProducts(res.items); setTotalProducts(res.total); })
      .catch(() => { setProducts([]); setTotalProducts(0); })
      .finally(() => setLoading(false));
  }, [search, pageNumber]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPageNumber(1); }}
          placeholder="Search products..."
          className="w-full pl-8 pr-4 py-2 border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
        />
      </div>

      {/* Product list */}
      {loading ? (
        <p className="text-sm text-taupe text-center py-8">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-taupe text-center py-8">No products available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map(product => (
            <ProductRow
              key={product.id}
              product={product}
              isSelected={selectedIds.includes(product.id)}
              onToggle={() => onToggle(product.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-sand/50">
          <p className="text-xs text-taupe">
            Page {pageNumber} of {totalPages} · {totalProducts} products
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

      {selectedIds.length > 0 && (
        <p className="text-[11px] text-charcoal-deep font-medium">
          {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
