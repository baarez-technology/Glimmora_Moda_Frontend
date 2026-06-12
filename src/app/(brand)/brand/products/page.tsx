'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Grid, List, Filter, Loader2, Download, Upload, ChevronDown, ChevronLeft, ChevronRight, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { BrandHero } from '@/components/brand/BrandHero';
import { BrandKpiCard } from '@/components/brand/BrandKpiCard';
import { ApiProductCard, ApiProductGridCard } from '@/components/brand/ProductCard';
import { fetchProducts, exportProductsFromBackend, computeTotalUnits } from '@/services/brand-product.service';
import type { BackendProduct } from '@/services/brand-product.service';
import ProductBulkUploadModal from '@/components/brand/ProductBulkUploadModal';

type FilterTab = 'all' | 'published' | 'draft' | 'low-stock' | 'out-of-stock' | 'archived' | 'deleted';
type ViewMode = 'list' | 'grid';
type SortField = 'name' | 'price' | 'totalStock' | 'demandScore';
type SortDir = 'asc' | 'desc';

const getTotalStock = (p: BackendProduct): number => computeTotalUnits(p);

const getDemandScore = (p: BackendProduct): number =>
  p.performance_metrics?.demand_score ?? 0;

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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'json' | 'csv' | 'excel' | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setShowExportMenu(false);
    setExportingFormat(format);
    try {
      const result = await exportProductsFromBackend(format);
      setExportToast(`Exported${result.record_count !== undefined ? ` ${result.record_count}` : ''} product${result.record_count !== 1 ? 's' : ''} as ${format.toUpperCase()}`);
      setTimeout(() => setExportToast(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingFormat(null);
    }
  };

  // Close export menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const headerActions = (
    <div className="flex items-center gap-3">
      {/* Export dropdown */}
      <div className="relative" ref={exportMenuRef}>
        <button
          onClick={() => !exportingFormat && setShowExportMenu(v => !v)}
          disabled={!!exportingFormat}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exportingFormat ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {exportingFormat ? 'Exporting…' : 'Export'}
          {!exportingFormat && <ChevronDown size={13} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
        </button>
        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-30">
            <div className="px-4 py-2 border-b border-sand/40">
              <p className="text-[10px] tracking-[0.1em] uppercase text-taupe">Via backend · S3</p>
            </div>
            <button onClick={() => handleExport('json')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
              <FileJson size={14} className="text-gold-muted" /> Export as JSON
            </button>
            <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
              <FileText size={14} className="text-info" /> Export as CSV
            </button>
            <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
              <FileSpreadsheet size={14} className="text-success" /> Export as Excel
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowUploadModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors tracking-wide"
      >
        <Download size={15} />
        Import Products
      </button>

      <PrimaryButton href="/brand/products/new" icon={Plus}>
        Add Product
      </PrimaryButton>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Products"
          subtitle="Loading..."
          actions={headerActions}
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
          actions={headerActions}
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
        actions={headerActions}
      />

      <div className="p-6 md:p-8 lg:p-10 space-y-10">
        {/* Luxury Hero */}
        <BrandHero
          title="Pieces"
          emphasis="in your atelier"
          description="Every piece you have crafted — those published, those in draft, those requiring restock. Refined details, ready for review."
        />

        {/* KPI Strip */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-xl text-charcoal-deep tracking-[-0.01em]">Catalogue</h2>
            <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Live counts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BrandKpiCard
              label="Active Pieces"
              value={activeProducts.length}
              hint="in your catalogue"
              accent="gold"
            />
            <BrandKpiCard
              label="Published"
              value={activeProducts.filter(p => p.status === 'published').length}
              hint="live for customers"
              accent="success"
            />
            <BrandKpiCard
              label="Drafts"
              value={activeProducts.filter(p => p.status === 'draft').length}
              hint="awaiting publish"
              accent="warning"
            />
            <BrandKpiCard
              label="Low Stock"
              value={activeProducts.filter(p => p.is_low_stock).length}
              hint="restock recommended"
              accent="error"
            />
          </div>
        </section>

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
            {paginatedProducts.map(product => (
              <ApiProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedProducts.map(product => (
              <ApiProductGridCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-stone">
              Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-2 border border-sand text-stone hover:text-charcoal-deep hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-2 text-xs text-taupe">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-9 h-9 text-xs transition-colors ${
                        item === safeCurrentPage
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : 'border border-sand text-stone hover:text-charcoal-deep hover:border-charcoal-deep'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-2 border border-sand text-stone hover:text-charcoal-deep hover:border-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export success toast */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-success/10 border border-success/30 text-success shadow-lg">
          <span>{exportToast}</span>
          <button onClick={() => setExportToast(null)} className="text-success/60 hover:text-success transition-colors text-lg leading-none">×</button>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <ProductBulkUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { setShowUploadModal(false); loadProducts(); }}
        />
      )}
    </div>
  );
}
