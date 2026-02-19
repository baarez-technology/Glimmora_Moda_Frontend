'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ImageUploader from '@/components/search/ImageUploader';
import VisualSearchResults from '@/components/search/VisualSearchResults';
import { VisualSearchResult } from '@/types';
import * as productService from '@/services/product.service';
import { useApp } from '@/context/AppContext';

export default function VisualSearchPage() {
  const { showToast } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<VisualSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleImageSelected = useCallback(async (imageData: string) => {
    setIsProcessing(true);
    setHasSearched(false);

    try {
      // imageData is a base64 data URL from file upload; pass no arguments
      // since performVisualSearch expects (detectedCategory?, detectedStyle?)
      const response = await productService.performVisualSearch();
      setResults(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error('Visual search failed:', error);
      showToast('Visual search failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [showToast]);

  const handleExampleSearch = useCallback(async (category: string) => {
    setIsProcessing(true);
    setHasSearched(false);

    try {
      const response = await productService.performVisualSearch(category);
      setResults(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error('Visual search failed:', error);
      showToast('Visual search failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/search"
              className="flex items-center gap-2 text-stone/70 hover:text-charcoal-deep transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Search</span>
            </Link>

            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-gold-soft" />
              <span className="font-display text-lg text-charcoal-deep">Visual Search</span>
            </div>

            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-soft/10 rounded-full text-gold-soft text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Visual Search</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-charcoal-deep mb-4">
            Find Fashion from Any Image
          </h1>
          <p className="text-stone/70 max-w-xl mx-auto">
            Upload a photo of any fashion piece, and our AI will find similar items from our curated luxury collection.
          </p>
        </motion.div>

        {/* Image Uploader */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ImageUploader
            onImageSelected={handleImageSelected}
            isProcessing={isProcessing}
            className="mb-8"
          />
        </motion.div>

        {/* Info Card */}
        {!hasSearched && !isProcessing && (
          <motion.div
            className="bg-white rounded-xl border border-stone/20 p-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-charcoal-deep mb-2">Tips for best results</h3>
                <ul className="text-sm text-stone/70 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-soft">•</span>
                    Use clear, well-lit photos with the item as the main focus
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-soft">•</span>
                    Full product shots work better than close-ups of details
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-soft">•</span>
                    Screenshots from magazines, social media, or websites are welcome
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-soft">•</span>
                    Our AI recognizes clothing, bags, shoes, jewelry, and accessories
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {(hasSearched || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <VisualSearchResults
              results={results}
              isLoading={isProcessing}
            />
          </motion.div>
        )}

        {/* Example Searches */}
        {!hasSearched && !isProcessing && (
          <motion.section
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-display text-charcoal-deep mb-6">Try these example searches</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Black Handbag', category: 'bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200' },
                { label: 'Silk Dress', category: 'clothing', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200' },
                { label: 'Gold Watch', category: 'watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200' },
                { label: 'Pearl Necklace', category: 'jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200' }
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleSearch(example.category)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-stone/10"
                >
                  <Image
                    src={example.image}
                    alt={example.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 to-transparent flex items-end p-3">
                    <span className="text-white text-sm">{example.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
