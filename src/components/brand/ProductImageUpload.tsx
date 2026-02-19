'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, AlertTriangle, ImagePlus } from 'lucide-react';
import { uploadImage } from '@/services/brand-product.service';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_MAX_IMAGES = 10;
const DEFAULT_MAX_SIZE_MB = 5;

interface ProductImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ProductImageUpload({
  images,
  onChange,
  maxImages = DEFAULT_MAX_IMAGES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const canAddMore = images.length < maxImages;

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const errors: string[] = [];
      const valid: File[] = [];
      const remaining = maxImages - images.length;

      if (files.length > remaining) {
        errors.push(`Can only add ${remaining} more image${remaining !== 1 ? 's' : ''} (max ${maxImages}).`);
      }

      const filesToProcess = files.slice(0, remaining);

      for (const file of filesToProcess) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          errors.push(`"${file.name}" is not a supported format. Use JPG, PNG, WebP, or GIF.`);
          continue;
        }
        if (file.size > maxSizeBytes) {
          errors.push(`"${file.name}" exceeds ${maxSizeMB}MB limit.`);
          continue;
        }
        valid.push(file);
      }

      return { valid, errors };
    },
    [images.length, maxImages, maxSizeBytes, maxSizeMB]
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setError(null);
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setError(errors.join(' '));
      }

      if (valid.length === 0) return;

      setIsUploading(true);
      try {
        const urls = await Promise.all(valid.map((f) => uploadImage(f)));
        onChange([...images, ...urls]);
      } catch {
        setError('Failed to upload images. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [images, onChange, validateFiles]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const url = images[index];
      // Revoke object URL to free memory if it's a blob URL
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [handleFiles]
  );

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative aspect-square bg-parchment border border-sand/50 overflow-hidden group"
            >
              <Image
                src={url}
                alt={`Product image ${idx + 1}`}
                fill
                className="object-cover"
              />
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-charcoal-deep/70 text-ivory-cream text-[9px] tracking-[0.15em] uppercase text-center py-1">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-charcoal-deep/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Add more tile */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square border-2 border-dashed border-sand hover:border-charcoal-deep flex flex-col items-center justify-center text-taupe hover:text-charcoal-deep transition-colors disabled:opacity-50"
            >
              <ImagePlus size={20} />
              <span className="text-[9px] tracking-[0.1em] uppercase mt-1.5">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Drop Zone (shown when no images or as primary area) */}
      {images.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => canAddMore && fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-charcoal-deep bg-parchment/50'
              : 'border-sand hover:border-stone'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="w-12 h-12 bg-parchment mx-auto mb-4 flex items-center justify-center">
            <Upload size={20} className="text-stone" />
          </div>
          <p className="text-sm text-stone mb-1">
            {isDragging ? 'Drop images here' : 'Drop images here or click to upload'}
          </p>
          <p className="text-xs text-taupe">
            JPG, PNG, WebP, GIF up to {maxSizeMB}MB each &middot; Max {maxImages} images
          </p>
          {isUploading && (
            <p className="text-xs text-charcoal-deep mt-3">Uploading...</p>
          )}
        </div>
      )}

      {/* Drop zone overlay when images exist */}
      {images.length > 0 && canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-charcoal-deep bg-parchment/50'
              : 'border-sand hover:border-stone'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <p className="text-xs text-stone">
            {isDragging ? 'Drop images here' : `Drop or click to add more images (${images.length}/${maxImages})`}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-warning">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
