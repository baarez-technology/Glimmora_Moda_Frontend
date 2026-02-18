'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Grid, List, Filter } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { ProductCard, ProductGridCard } from '@/components/brand/ProductCard';
import type { BrandProduct, BrandProductStatus } from '@/types/brand-portal';

type FilterTab = 'all' | 'published' | 'draft' | 'low-stock' | 'deleted';
type ViewMode = 'list' | 'grid';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get('filter') as FilterTab) || 'all';

  const { products } = useBrand();
  const [filter, setFilter] = useState<FilterTab>(initialFilter);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const activeProducts = useMemo(() => products.filter(p => !p.isDeleted), [products]);
  const deletedProducts = useMemo(() => products.filter(p => p.isDeleted), [products]);

  const categories = useMemo(() => {
    const cats = new Set(activeProducts.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
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
        result = result.filter(p => p.totalStock > 0 && p.totalStock <= 10);
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

    return result;
  }, [activeProducts, deletedProducts, filter, categoryFilter, search]);

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: activeProducts.length },
    { value: 'published', label: 'Published', count: activeProducts.filter(p => p.status === 'published').length },
    { value: 'draft', label: 'Draft', count: activeProducts.filter(p => p.status === 'draft').length },
    { value: 'low-stock', label: 'Low Stock', count: activeProducts.filter(p => p.totalStock > 0 && p.totalStock <= 10).length },
    { value: 'deleted', label: 'Deleted', count: deletedProducts.length }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Products"
        subtitle={`${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
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

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
