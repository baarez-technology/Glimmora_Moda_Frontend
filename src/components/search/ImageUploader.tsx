'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import NextImage from 'next/image';

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export default function ImageUploader({
  onImageSelected,
  isProcessing = false,
  className = ''
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a JPG, PNG, or WEBP image');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File size must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreview(imageData);
      onImageSelected(imageData);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearPreview = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {preview ? (
          // Preview Mode
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-stone/20"
          >
            <div className="relative w-full h-64 bg-stone/5">
              <NextImage
                src={preview}
                alt="Uploaded"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-charcoal-deep/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                  <p className="text-sm">Analyzing image...</p>
                  <p className="text-xs text-white/60 mt-1">Finding similar pieces</p>
                </div>
              </div>
            )}

            {/* Clear button */}
            {!isProcessing && (
              <button
                onClick={clearPreview}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-charcoal-deep" />
              </button>
            )}
          </motion.div>
        ) : (
          // Upload Mode
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? 'border-gold-soft bg-gold-soft/10'
                : 'border-stone/30 bg-white hover:border-stone/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="p-12 text-center">
              {/* Icon */}
              <motion.div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  isDragging ? 'bg-gold-soft' : 'bg-stone/10'
                }`}
                animate={{ scale: isDragging ? 1.1 : 1 }}
              >
                {isDragging ? (
                  <Upload className="w-10 h-10 text-white" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-stone/50" />
                )}
              </motion.div>

              {/* Text */}
              <h3 className="text-lg font-display text-charcoal-deep mb-2">
                {isDragging ? 'Drop your image here' : 'Upload an inspiration image'}
              </h3>
              <p className="text-sm text-stone/60 mb-6 max-w-xs mx-auto">
                Drag and drop an image, or click to browse. We'll find similar pieces from our collection.
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-charcoal-deep text-ivory-cream rounded-lg text-sm hover:bg-charcoal-deep/90 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
                <button
                  onClick={() => {
                    // This would trigger camera on mobile
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                      fileInputRef.current.removeAttribute('capture');
                    }
                  }}
                  className="px-6 py-3 border border-stone/30 text-charcoal-deep rounded-lg text-sm hover:bg-stone/5 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-error mt-4">{error}</p>
              )}

              {/* Supported formats */}
              <p className="text-xs text-stone/40 mt-6">
                Supports JPG, PNG, WEBP up to 10MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
