'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Clock,
  MapPin,
  AlertTriangle,
  Settings2
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { MetricCard } from '@/components/brand/MetricCard';
import { StockManagementModal } from '@/components/brand/StockManagementModal';
import type { BrandProductStatus, RegionalStock } from '@/types/brand-portal';
import type { ProductCategory } from '@/types/product';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, updateProduct, deleteProduct } = useBrand();

  const productId = params.id as string;
  const product = getProductById(productId);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: 'bags' as ProductCategory,
    description: '',
    tagline: '',
    status: 'draft' as BrandProductStatus
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        tagline: product.tagline,
        status: product.status
      });
    }
  }, [product]);

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
        status: formData.status
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleStockSave = (updatedStock: RegionalStock[]) => {
    const newTotal = updatedStock.reduce((sum, s) => sum + s.units, 0);
    updateProduct(productId, {
      regionalStock: updatedStock,
      totalStock: newTotal,
    });
  };

  const handleDelete = () => {
    deleteProduct(productId);
    router.push('/brand/products');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  const isLowStock = product.totalStock > 0 && product.totalStock <= 10;
  const categories: ProductCategory[] = ['bags', 'clothing', 'shoes', 'accessories', 'jewelry', 'watches'];

  return (
    <div>
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Price (EUR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Description */}
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
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                </div>
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
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    fill
                    className="object-cover"
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
                    <ShoppingCart size={14} /> Add to Cart
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
          <div className="relative bg-white border border-sand p-8 max-w-md w-full mx-4">
            <h3 className="font-display text-xl text-charcoal-deep mb-3">Delete Product</h3>
            <p className="text-stone text-sm leading-relaxed mb-2">
              Are you sure you want to delete <span className="font-medium text-charcoal-deep">{product.name}</span>?
            </p>
            <p className="text-taupe text-xs mb-6">
              This product will be removed from your dashboard. This action can be restored by an administrator.
            </p>
            <div className="flex items-center justify-end gap-3">
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
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
