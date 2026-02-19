'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Grid, Lock, Globe, Share2, Trash2, Plus, X, Heart, ExternalLink, Search, Check } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Image from 'next/image';
import Link from 'next/link';
import { InspirationBoard, BoardItem, Product } from '@/types';
import * as productService from '@/services/product.service';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [board, setBoard] = useState<InspirationBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Load products from service and board from localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const productsRes = await productService.getAllProducts();
        setProducts(productsRes.data ?? []);

        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('modaglimmora_boards');
          if (saved) {
            const boards = JSON.parse(saved) as InspirationBoard[];
            const foundBoard = boards.find(b => b.id === boardId);
            if (foundBoard) {
              setBoard(foundBoard);
              setEditName(foundBoard.name);
              setEditDescription(foundBoard.description || '');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [boardId]);

  const saveBoard = (updatedBoard: InspirationBoard) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('modaglimmora_boards');
      const boards = saved ? JSON.parse(saved) : [];
      const index = boards.findIndex((b: InspirationBoard) => b.id === boardId);
      if (index !== -1) {
        boards[index] = updatedBoard;
        localStorage.setItem('modaglimmora_boards', JSON.stringify(boards));
      }
      setBoard(updatedBoard);
    }
  };

  const updateBoardInfo = () => {
    if (!board) return;
    const updated = {
      ...board,
      name: editName,
      description: editDescription,
      updatedAt: new Date().toISOString()
    };
    saveBoard(updated);
    setIsEditing(false);
  };

  const toggleVisibility = () => {
    if (!board) return;
    const updated = { ...board, isPrivate: !board.isPrivate };
    saveBoard(updated);
  };

  const removeItem = (itemId: string) => {
    if (!board) return;
    const updated = {
      ...board,
      items: board.items.filter(i => i.id !== itemId),
      updatedAt: new Date().toISOString()
    };
    saveBoard(updated);
  };

  const deleteBoard = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('modaglimmora_boards');
      const boards = saved ? JSON.parse(saved) : [];
      const filtered = boards.filter((b: InspirationBoard) => b.id !== boardId);
      localStorage.setItem('modaglimmora_boards', JSON.stringify(filtered));
      router.push('/boards');
    }
  };

  const addProductToBoard = (product: Product) => {
    if (!board) return;
    // Prevent duplicates
    const alreadyAdded = board.items.some(
      (item) => item.type === 'product' && item.referenceId === product.id
    );
    if (alreadyAdded) return;

    const newItem: BoardItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'product',
      referenceId: product.id,
      imageUrl: product.images[0]?.url || '',
      title: product.name,
      addedAt: new Date().toISOString(),
      source: 'product-picker',
    };

    const updated: InspirationBoard = {
      ...board,
      items: [...board.items, newItem],
      updatedAt: new Date().toISOString(),
    };
    saveBoard(updated);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = board?.name || 'Inspiration Board';
    try {
      await navigator.share({ title, url });
    } catch {
      // share() failed or was dismissed -- fall back to clipboard
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard');
      } catch {
        showToast('Unable to copy link');
      }
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // Products available for the picker (exclude already-added ones)
  const pickerProducts = useMemo(() => {
    if (!board) return [];
    const addedIds = new Set(
      board.items.filter((i) => i.type === 'product').map((i) => i.referenceId)
    );
    let available = products.filter((p) => !addedIds.has(p.id));
    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      available = available.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q)
      );
    }
    return available;
  }, [products, board, pickerSearch]);

  if (loading || !board) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Get product details for board items
  const boardProducts = board.items
    .filter(item => item.type === 'product' && item.referenceId)
    .map(item => ({
      ...item,
      product: products.find(p => p.id === item.referenceId)
    }))
    .filter(item => item.product);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/boards"
              className="flex items-center gap-2 text-stone/70 hover:text-charcoal-deep transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">All Boards</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleVisibility}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                  !board.isPrivate
                    ? 'bg-green-100 text-green-700'
                    : 'bg-stone/10 text-stone/70'
                }`}
              >
                {!board.isPrivate ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {!board.isPrivate ? 'Public' : 'Private'}
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-stone/10 rounded-full transition-colors"
              >
                <Share2 className="w-5 h-5 text-stone/60" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-50 rounded-full transition-colors text-stone/60 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Board Info */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isEditing ? (
            <div className="bg-white rounded-xl p-6 border border-stone/20">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl font-display text-charcoal-deep w-full border-b border-stone/20 pb-2 mb-4 focus:outline-none focus:border-gold-soft"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full text-stone/70 resize-none focus:outline-none"
                rows={2}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={updateBoardInfo}
                  className="px-4 py-2 bg-charcoal-deep text-ivory-cream rounded-lg text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone/20 text-charcoal-deep rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="text-3xl font-display text-charcoal-deep mb-2 cursor-pointer hover:text-gold-soft transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {board.name}
                </h1>
                {board.description && (
                  <p className="text-stone/70">{board.description}</p>
                )}
                <p className="text-sm text-stone/50 mt-2">
                  {board.items.length} item{board.items.length !== 1 ? 's' : ''} •
                  Updated {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProductPicker(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream rounded-lg text-sm hover:bg-charcoal-deep/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gold-soft hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Board Items Grid */}
        {boardProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone/20">
            <Grid className="w-16 h-16 text-stone/20 mx-auto mb-4" />
            <h3 className="text-xl font-display text-charcoal-deep mb-2">Your board is empty</h3>
            <p className="text-stone/60 mb-6">Start adding products to your inspiration board</p>
            <button
              onClick={() => setShowProductPicker(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream rounded-lg hover:bg-charcoal-deep/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boardProducts.map((item, index) => (
              <motion.div
                key={item.id}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white rounded-xl border border-stone/20 overflow-hidden hover:shadow-lg transition-all">
                  {/* Product Image */}
                  <Link href={`/product/${item.product!.slug}`}>
                    <div className="aspect-square bg-stone/5 relative overflow-hidden">
                      <Image
                        src={item.product!.images[0]?.url || ''}
                        alt={item.product!.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <X className="w-4 h-4 text-charcoal-deep" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-xs text-stone/60 mb-1">{item.product!.brandName}</p>
                    <h3 className="text-sm font-medium text-charcoal-deep line-clamp-2 mb-2">
                      {item.product!.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-charcoal-deep">
                        ${item.product!.price.toLocaleString()}
                      </p>
                      <Link
                        href={`/product/${item.product!.slug}`}
                        className="text-gold-soft hover:underline text-xs flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {item.note && (
                  <div className="mt-2 p-3 bg-gold-soft/10 rounded-lg">
                    <p className="text-xs text-stone/70">{item.note}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Add More Card */}
            <button onClick={() => setShowProductPicker(true)} className="text-left">
              <div className="aspect-square border-2 border-dashed border-stone/30 rounded-xl flex flex-col items-center justify-center hover:border-gold-soft hover:bg-gold-soft/5 transition-all cursor-pointer">
                <Plus className="w-8 h-8 text-stone/40" />
                <span className="text-sm text-stone/60 mt-2">Add Product</span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Delete Board Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteBoard}
        title="Delete Board"
        message="Are you sure you want to delete this board? All saved items will be lost."
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      {/* Product Picker Modal */}
      <AnimatePresence>
        {showProductPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-charcoal-deep/60 backdrop-blur-sm"
              onClick={() => { setShowProductPicker(false); setPickerSearch(''); }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-3xl max-h-[80vh] bg-ivory-cream rounded-2xl border border-sand/40 shadow-2xl overflow-hidden flex flex-col mx-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-sand/40">
                <h2 className="font-display text-xl text-charcoal-deep">Add Product to Board</h2>
                <button
                  onClick={() => { setShowProductPicker(false); setPickerSearch(''); }}
                  className="p-2 hover:bg-stone/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-stone/60" />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-3 border-b border-sand/20">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50" />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search products by name or brand..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand/60 text-charcoal-deep placeholder:text-stone/40 text-sm rounded-lg focus:outline-none focus:border-charcoal-deep/40 transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {pickerProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-stone/60 text-sm">
                      {pickerSearch ? 'No products match your search.' : 'All products have been added to this board.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pickerProducts.map((product) => {
                      const isAdded = board.items.some(
                        (i) => i.type === 'product' && i.referenceId === product.id
                      );
                      return (
                        <button
                          key={product.id}
                          onClick={() => {
                            addProductToBoard(product);
                            showToast(`${product.name} added to board`);
                          }}
                          disabled={isAdded}
                          className={`group text-left bg-white rounded-xl border overflow-hidden transition-all ${
                            isAdded
                              ? 'border-green-300 opacity-60 cursor-default'
                              : 'border-stone/20 hover:border-charcoal-deep/30 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          {/* Product Image */}
                          <div className="aspect-square bg-stone/5 relative overflow-hidden">
                            {product.images[0]?.url ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone/30">
                                <Grid className="w-8 h-8" />
                              </div>
                            )}
                            {isAdded && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-600" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-3">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-stone/60">{product.brandName}</p>
                            <p className="text-sm font-medium text-charcoal-deep line-clamp-1 mt-1">{product.name}</p>
                            <p className="text-sm text-stone mt-1">${product.price.toLocaleString()}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-sand/40 flex justify-end">
                <button
                  onClick={() => { setShowProductPicker(false); setPickerSearch(''); }}
                  className="px-5 py-2 bg-charcoal-deep text-ivory-cream rounded-lg text-sm hover:bg-charcoal-deep/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="px-5 py-3 bg-charcoal-deep text-ivory-cream text-sm rounded-lg shadow-lg">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
