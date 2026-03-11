'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { uploadImage } from '@/services/brand-product.service';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface CoverImageUploadProps {
  image: string | null;
  onChange: (url: string | null) => void;
}

export function CoverImageUpload({ image, onChange }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Use JPG, PNG, or WebP format.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB.');
        return;
      }

      setError(null);
      setIsUploading(true);
      try {
        const url = await uploadImage(file);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      {image ? (
        <div className="relative w-full aspect-square bg-parchment border border-sand/50 overflow-hidden group">
          <Image
            src={image}
            alt="Cover image"
            fill
            className="object-cover"
          />
          <span className="absolute bottom-0 left-0 right-0 bg-charcoal-deep/70 text-ivory-cream text-[9px] tracking-[0.15em] uppercase text-center py-1">
            Cover Image
          </span>
          <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-2 bg-white/90 text-charcoal-deep text-xs tracking-wider uppercase hover:bg-white transition-colors"
            >
              <Upload size={14} className="inline mr-1.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-2 bg-red-600/90 text-white text-xs tracking-wider uppercase hover:bg-red-600 transition-colors"
            >
              <Trash2 size={14} className="inline mr-1.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="w-full aspect-square border-2 border-dashed border-sand hover:border-stone flex flex-col items-center justify-center cursor-pointer transition-colors bg-parchment/30"
        >
          {isUploading ? (
            <>
              <Loader2 size={24} className="text-taupe animate-spin" />
              <span className="text-xs text-stone mt-2">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon size={28} className="text-taupe/50" />
              <span className="text-xs text-stone mt-2">Upload Cover Image</span>
              <span className="text-[10px] text-taupe mt-1">JPG, PNG, WebP &middot; Max 5MB</span>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
