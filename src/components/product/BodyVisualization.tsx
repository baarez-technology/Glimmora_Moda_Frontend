'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Eye, Sparkles, Upload, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Product, BodyVisualizationConfig } from '@/types';

interface BodyVisualizationProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: Partial<BodyVisualizationConfig>;
}

export default function BodyVisualization({
  product,
  isOpen,
  onClose,
}: BodyVisualizationProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const productImage = product.images?.[0]?.url;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-charcoal-deep/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl mx-4 bg-ivory-cream rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-soft/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-gold-soft" />
              </div>
              <div>
                <h2 className="text-lg font-display text-charcoal-deep">View on Me</h2>
                <p className="text-xs text-stone/70">IV™ Immersive Visualization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-deep" />
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* AI Preview Area (Left) — fixed placeholder, will show backend result */}
            <div className="lg:col-span-2 relative bg-gradient-to-b from-ivory-cream to-stone/10 p-8 flex items-center justify-center min-h-[400px]">
              <div className="w-full max-w-sm mx-auto aspect-[3/4] border-2 border-dashed border-stone/30 rounded-xl flex flex-col items-center justify-center gap-4 bg-white/50">
                <div className="w-16 h-16 bg-stone/10 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-stone/40" />
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-medium text-charcoal-deep mb-1">Virtual Try-On Preview</p>
                  <p className="text-xs text-stone/60">Your AI-generated preview will appear here</p>
                </div>
              </div>
            </div>

            {/* Controls Panel (Right) */}
            <div className="bg-white p-6 space-y-5 border-l border-stone/20 overflow-y-auto max-h-[70vh]">
              {/* Product Info */}
              <div>
                <h3 className="font-medium text-charcoal-deep">{product.name}</h3>
                <p className="text-sm text-stone/70">{product.brandName}</p>
                <p className="text-lg font-display text-gold-soft mt-1">
                  ${product.price.toLocaleString()}
                </p>
              </div>

              {/* Product Image */}
              {productImage && (
                <div className="border border-stone/20 rounded-lg overflow-hidden">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={productImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Uploaded Image Preview */}
              {uploadedImage && (
                <div>
                  <label className="text-xs tracking-wider uppercase text-stone/70 mb-2 block">
                    Your Photo
                  </label>
                  <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone/20">
                    <Image
                      src={uploadedImage}
                      alt="Your uploaded photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-stone/50 mt-1.5 truncate">{uploadedFileName}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-stone/20 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal-deep text-ivory-cream rounded-lg hover:bg-charcoal-deep/90 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm tracking-wider">Add to Outfit</span>
                </button>

                {/* Upload Your Image */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold-soft/10 text-charcoal-deep border border-gold-soft/30 rounded-lg hover:bg-gold-soft/20 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gold-soft" />
                  <span className="text-sm tracking-wider">
                    {uploadedImage ? 'Change Photo' : 'Upload Your Image'}
                  </span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-stone/30 text-charcoal-deep rounded-lg hover:bg-stone/5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm tracking-wider">Reset View</span>
                </button>
              </div>

              {/* Fit Note */}
              <div className="bg-gold-soft/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gold-soft/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-gold-soft" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-charcoal-deep mb-1">Personalized Fit</p>
                    <p className="text-xs text-stone/70 leading-relaxed">
                      Upload your photo and our AI will show you how this piece looks on you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
