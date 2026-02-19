'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Grid, List, Filter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { ProductCard, ProductGridCard } from '@/components/brand/ProductCard';
import type { BrandProduct } from '@/types/brand-portal';

type FilterTab = 'all' | 'published' | 'draft' | 'low-stock' | 'out-of-stock';
type ViewMode = 'list' | 'grid';
type SortField = 'name' | 'price' | 'totalStock' | 'demandScore';
type SortDir = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get('filter') as FilterTab) || 'all';

  const { products } = useBrand();
  const [filter, setFilter] = useState<FilterTab>(initialFilter);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Toggle sort: click same header flips direction, click new header sets ascending
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply status/stock filter
    switch (filter) {
      case 'published':
        result = result.filter(p => p.status === 'published');
        break;
      case 'draft':
        result = result.filter(p => p.status === 'draft');
        break;
      case 'low-stock':
        result = result.filter(p => p.totalStock <= 10);
        break;
      case 'out-of-stock':
        result = result.filter(p => p.totalStock === 0);
        break;
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'totalStock':
          cmp = a.totalStock - b.totalStock;
          break;
        case 'demandScore':
          cmp = a.demandScore - b.demandScore;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [products, filter, categoryFilter, search, sortField, sortDir]);

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

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: products.length },
    { value: 'published', label: 'Published', count: products.filter(p => p.status === 'published').length },
    { value: 'draft', label: 'Draft', count: products.filter(p => p.status === 'draft').length },
    { value: 'low-stock', label: 'Low Stock', count: products.filter(p => p.totalStock <= 10).length },
    { value: 'out-of-stock', label: 'Out of Stock', count: products.filter(p => p.totalStock === 0).length }
  ];

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="inline ml-1" />
      : <ArrowDown size={12} className="inline ml-1" />;
  };

  return (
    <div>
      <BrandPageHeader
        title="Products"
        subtitle={`${filteredAndSortedProducts.length} product${filteredAndSortedProducts.length !== 1 ? 's' : ''}`}
        actions={
          <PrimaryButton href="/brand/products/new" icon={Plus}>
            Add Product
          </PrimaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-sand text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-sand">
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`p-3 transition-colors ${
                viewMode === 'list' ? 'bg-parchment text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-3 transition-colors ${
                viewMode === 'grid' ? 'bg-parchment text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Column Sort Headers (list view only) */}
        {viewMode === 'list' && filteredAndSortedProducts.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 bg-parchment/50 border border-sand/30">
            <div className="w-24 md:w-32 shrink-0" />
            <button
              onClick={() => handleSort('name')}
              className="flex-1 text-left text-[10px] tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
            >
              Name <SortIcon field="name" />
            </button>
            <button
              onClick={() => handleSort('price')}
              className="w-24 text-left text-[10px] tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
            >
              Price <SortIcon field="price" />
            </button>
            <button
              onClick={() => handleSort('totalStock')}
              className="w-24 text-left text-[10px] tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
            >
              Stock <SortIcon field="totalStock" />
            </button>
            <button
              onClick={() => handleSort('demandScore')}
              className="w-24 text-left text-[10px] tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors"
            >
              Demand <SortIcon field="demandScore" />
            </button>
            <div className="w-4" />
          </div>
        )}

        {/* Products */}
        {paginatedProducts.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone">No products found</p>
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="mt-2 text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedProducts.map(product => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-stone">
              Showing {((safeCurrentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-sand text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="px-3 py-2 text-xs text-stone">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-sand text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:bg-parchment transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
