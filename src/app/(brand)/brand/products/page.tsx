'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Grid, List, Filter, Loader2 } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { ApiProductCard, ApiProductGridCard } from '@/components/brand/ProductCard';
import { fetchProducts } from '@/services/brand-product.service';
import type { BackendProduct } from '@/services/brand-product.service';
import ExportButton from '@/components/brand/ExportButton';
import { convertToCSV, downloadCSV, buildFilename } from '@/lib/export-utils';

type FilterTab = 'all' | 'published' | 'draft' | 'low-stock' | 'out-of-stock' | 'archived' | 'deleted';
type ViewMode = 'list' | 'grid';
type SortField = 'name' | 'price' | 'totalStock' | 'demandScore';
type SortDir = 'asc' | 'desc';

const getTotalStock = (p: BackendProduct): number =>
  (p.regional_stocks ?? []).reduce((sum, s) => sum + s.units, 0);

const getDemandScore = (p: BackendProduct): number =>
  (p.performance_metrics?.conversion_rate ?? 0) * 100;

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get('filter') as FilterTab) || 'all';

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>(initialFilter);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const activeProducts = useMemo(() => products.filter(p => p.is_active), [products]);
  const deletedProducts = useMemo(() => products.filter(p => !p.is_active), [products]);

  const collections = useMemo(() => {
    const cols = new Set(activeProducts.map(p => p.collection_name).filter(Boolean));
    return ['all', ...Array.from(cols)];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    // Deleted tab shows inactive products
    if (filter === 'deleted') return deletedProducts;

    let result = [...activeProducts];

    // Apply status filter
    switch (filter) {
      case 'published':
        result = result.filter(p => p.status === 'published');
        break;
      case 'draft':
        result = result.filter(p => p.status === 'draft');
        break;
      case 'low-stock':
        result = result.filter(p => getTotalStock(p) <= 10);
        break;
      case 'out-of-stock':
        result = result.filter(p => getTotalStock(p) === 0);
        break;
    }

    // Apply collection filter
    if (collectionFilter !== 'all') {
      result = result.filter(p => p.collection_name === collectionFilter);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.product_name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.collection_name.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [activeProducts, deletedProducts, filter, collectionFilter, search]);

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: activeProducts.length },
    { value: 'published', label: 'Published', count: activeProducts.filter(p => p.status === 'published').length },
    { value: 'draft', label: 'Draft', count: activeProducts.filter(p => p.status === 'draft').length },
    { value: 'low-stock', label: 'Low Stock', count: activeProducts.filter(p => p.is_low_stock).length },
    { value: 'archived', label: 'Archived', count: activeProducts.filter(p => p.status === 'archived').length },
    { value: 'deleted', label: 'Deleted', count: deletedProducts.length },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.product_name.localeCompare(b.product_name);
          break;
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'totalStock':
          cmp = getTotalStock(a) - getTotalStock(b);
          break;
        case 'demandScore':
          cmp = getDemandScore(a) - getDemandScore(b);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [filteredProducts, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (newFilter: FilterTab) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCollectionChange = (value: string) => {
    setCollectionFilter(value);
    setPage(1);
  };

  const exportProductsCSV = () => {
    const rows = filteredAndSortedProducts.map(p => ({
      Name: p.product_name,
      SKU: p.sku,
      Price: p.price,
      Collection: p.collection_name,
      Status: p.status,
      'Total Stock': getTotalStock(p),
      'Demand Score': getDemandScore(p).toFixed(1),
      'Created At': p.created_at,
    }));
    const csv = convertToCSV(rows);
    downloadCSV(buildFilename('products', filter === 'all' ? 'all' : filter), csv);
  };

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Products"
          subtitle="Loading..."
          actions={
            <PrimaryButton href="/brand/products/new" icon={Plus}>
              Add Product
            </PrimaryButton>
          }
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BrandPageHeader
          title="Products"
          subtitle="Error"
          actions={
            <PrimaryButton href="/brand/products/new" icon={Plus}>
              Add Product
            </PrimaryButton>
          }
        />
        <div className="p-8 text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="px-6 py-3 bg-charcoal-deep text-white text-sm tracking-wider uppercase hover:bg-noir transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandPageHeader
        title="Products"
        subtitle={`${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-3">
            <ExportButton options={[
              { label: 'Export Products (CSV)', onClick: exportProductsCSV },
            ]} />
            <PrimaryButton href="/brand/products/new" icon={Plus}>
              Add Product
            </PrimaryButton>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 ${
                filter === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
            />
          </div>

          {/* Collection Filter */}
          <div className="relative">
            <select
              value={collectionFilter}
              onChange={(e) => handleCollectionChange(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
            >
              {collections.map(col => (
                <option key={col} value={col}>
                  {col === 'all' ? 'All Collections' : col}
                </option>
              ))}
            </select>
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-sand">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${
                viewMode === 'list' ? 'bg-parchment text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${
                viewMode === 'grid' ? 'bg-parchment text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
              title="Grid view"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone">No products found</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <ApiProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ApiProductGridCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
