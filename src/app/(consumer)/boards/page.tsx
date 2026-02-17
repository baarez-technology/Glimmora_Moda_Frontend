'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, Plus, Lock, Globe, Sparkles, Heart, MoreHorizontal, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { InspirationBoard } from '@/types';
import { products } from '@/data/mock-data';

const sampleBoards: InspirationBoard[] = [
  {
    id: 'board-1',
    name: 'Spring Essentials',
    description: 'Fresh looks for the new season',
    coverImage: products[0]?.images[0]?.url || '',
    items: products.slice(0, 4).map((p, i) => ({
      id: `item-${i}`,
      type: 'product' as const,
      referenceId: p.id,
      imageUrl: p.images[0]?.url || '',
      title: p.name,
      addedAt: new Date().toISOString(),
      note: ''
    })),
    isPrivate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'board-2',
    name: 'Evening Elegance',
    description: 'Sophisticated pieces for special occasions',
    coverImage: products[3]?.images[0]?.url || '',
    items: products.slice(3, 6).map((p, i) => ({
      id: `item-${i}`,
      type: 'product' as const,
      referenceId: p.id,
      imageUrl: p.images[0]?.url || '',
      title: p.name,
      addedAt: new Date().toISOString(),
      note: ''
    })),
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function BoardsPage() {
  const [boards, setBoards] = useState<InspirationBoard[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');

  // Load boards from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('modaglimmora_boards');
      if (saved) {
        setBoards(JSON.parse(saved));
      } else {
        setBoards(sampleBoards);
      }
    }
  }, []);

  // Save boards to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && boards.length > 0) {
      localStorage.setItem('modaglimmora_boards', JSON.stringify(boards));
    }
  }, [boards]);

  const createBoard = () => {
    if (!newBoardName.trim()) return;

    const newBoard: InspirationBoard = {
      id: `board-${Date.now()}`,
      name: newBoardName,
      description: newBoardDescription,
      coverImage: '',
      items: [],
      isPrivate: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBoards(prev => [newBoard, ...prev]);
    setNewBoardName('');
    setNewBoardDescription('');
    setShowCreateModal(false);
  };

  const deleteBoard = (boardId: string) => {
    setBoards(prev => prev.filter(b => b.id !== boardId));
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-soft/10 rounded-full flex items-center justify-center">
                <Grid className="w-5 h-5 text-gold-soft" />
              </div>
              <div>
                <h1 className="font-display text-xl text-charcoal-deep">Inspiration Boards</h1>
                <p className="text-xs text-stone/60">Curate your style vision</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream rounded-lg hover:bg-charcoal-deep/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Board</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {boards.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-stone/40" />
            </div>
            <h2 className="text-2xl font-display text-charcoal-deep mb-3">Create Your First Board</h2>
            <p className="text-stone/60 max-w-md mx-auto mb-6">
              Start collecting pieces that inspire you. Save products, create mood boards, and share your style vision.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-soft text-white rounded-lg hover:bg-gold-soft/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Board
            </button>
          </div>
        ) : (
          // Boards Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="aspect-[4/3] border-2 border-dashed border-stone/30 rounded-2xl flex flex-col items-center justify-center hover:border-gold-soft hover:bg-gold-soft/5 transition-all group"
              whileHover={{ y: -4 }}
            >
              <div className="w-16 h-16 bg-stone/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold-soft/10 transition-colors">
                <Plus className="w-8 h-8 text-stone/40 group-hover:text-gold-soft" />
              </div>
              <span className="text-charcoal-deep font-medium">Create New Board</span>
            </motion.button>

            {/* Board Cards */}
            {boards.map((board, index) => {
              // Get cover images from board items
              const coverImages = board.items
                .filter(item => item.type === 'product' && item.referenceId)
                .slice(0, 4)
                .map(item => {
                  const product = products.find(p => p.id === item.referenceId);
                  return product?.images[0]?.url || item.imageUrl || '';
                })
                .filter(Boolean);

              return (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/boards/${board.id}`}>
                    <div className="group bg-white rounded-2xl border border-stone/20 overflow-hidden hover:shadow-xl transition-all">
                      {/* Cover Image Grid */}
                      <div className="aspect-[4/3] bg-stone/5 relative overflow-hidden">
                        {coverImages.length >= 4 ? (
                          <div className="grid grid-cols-2 h-full">
                            {coverImages.slice(0, 4).map((img, i) => (
                              <div key={i} className="relative">
                                <Image
                                  src={img}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : coverImages.length > 0 ? (
                          <Image
                            src={coverImages[0]}
                            alt={board.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Grid className="w-12 h-12 text-stone/20" />
                          </div>
                        )}

                        {/* Visibility badge */}
                        <div className="absolute top-3 right-3">
                          <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm ${
                            !board.isPrivate ? 'bg-white/80 text-charcoal-deep' : 'bg-charcoal-deep/80 text-white'
                          }`}>
                            {!board.isPrivate ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {!board.isPrivate ? 'Public' : 'Private'}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Toggle favorite
                            }}
                            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <Heart className="w-4 h-4 text-charcoal-deep" />
                          </button>
                        </div>

                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('Delete this board?')) {
                                deleteBoard(board.id);
                              }
                            }}
                            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-charcoal-deep" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-display text-lg text-charcoal-deep mb-1 group-hover:text-gold-soft transition-colors">
                          {board.name}
                        </h3>
                        {board.description && (
                          <p className="text-sm text-stone/60 line-clamp-1 mb-2">{board.description}</p>
                        )}
                        <p className="text-xs text-stone/40">
                          {board.items.length} item{board.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-deep/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div
            className="relative bg-white rounded-2xl w-full max-w-md p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-stone/10 rounded-full"
            >
              <X className="w-5 h-5 text-stone/60" />
            </button>

            <h2 className="text-xl font-display text-charcoal-deep mb-6">Create New Board</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone/70 mb-2">Board Name</label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g., Summer Vacation"
                  className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-soft/50"
                />
              </div>

              <div>
                <label className="block text-sm text-stone/70 mb-2">Description (optional)</label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  placeholder="What's this board about?"
                  rows={3}
                  className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-soft/50 resize-none"
                />
              </div>

              <button
                onClick={createBoard}
                disabled={!newBoardName.trim()}
                className="w-full py-3 bg-charcoal-deep text-ivory-cream rounded-lg hover:bg-charcoal-deep/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Board
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
