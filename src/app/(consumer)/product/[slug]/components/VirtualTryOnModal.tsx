'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Upload, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { uploadImageFile, virtualTryOn } from '@/services/upload.service';
import type { Product } from '@/types';

interface VirtualTryOnModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

type Stage =
  | 'upload'      // waiting for user photo
  | 'generating'  // Gemini is working
  | 'result'      // showing the result
  | 'error';      // something went wrong

export default function VirtualTryOnModal({
  product,
  isOpen,
  onClose,
}: VirtualTryOnModalProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const garmentImage = product.images?.[0]?.url || '';
  const productName = product.name || '';

  const reset = useCallback(() => {
    setStage('upload');
    setUserPhotoUrl(null);
    setUserPhotoFile(null);
    setResultUrl(null);
    setErrorMsg('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPEG, PNG, WEBP, etc.).');
      setStage('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Photo must be under 10 MB.');
      setStage('error');
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setUserPhotoUrl(localUrl);
    setUserPhotoFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleGenerate = useCallback(async () => {
    if (!userPhotoFile || !garmentImage) return;
    setStage('generating');
    setErrorMsg('');

    try {
      // 1. Upload the customer's own photo to get a public URL
      const modelUrl = await uploadImageFile(userPhotoFile);

      // 2. Call the virtual try-on API
      const tryOnResult = await virtualTryOn(modelUrl, garmentImage, productName);
      setResultUrl(tryOnResult.image_url);
      setStage('result');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
      setStage('error');
    }
  }, [userPhotoFile, garmentImage, productName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-noir/60 flex items-center justify-center z-50 p-4">
      <div className="bg-ivory-cream max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand/40">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-gold-muted" />
            <div>
              <h2 className="font-display text-lg text-charcoal-deep tracking-tight">
                Virtual Try-On
              </h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">
                Powered by Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-taupe hover:text-charcoal-deep transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product strip */}
          <div className="flex items-center gap-4 p-4 bg-parchment">
            {garmentImage && (
              <div className="relative w-16 h-20 flex-shrink-0">
                <Image
                  src={garmentImage}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-taupe mb-0.5">
                Trying on
              </p>
              <p className="text-sm font-medium text-charcoal-deep leading-snug">
                {productName}
              </p>
            </div>
          </div>

          {/* Upload stage */}
          {stage === 'upload' && (
            <div className="space-y-5">
              {!userPhotoUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-none cursor-pointer
                    flex flex-col items-center justify-center py-14 px-6 text-center
                    transition-all duration-300
                    ${isDragging
                      ? 'border-charcoal-deep bg-sand/20'
                      : 'border-sand hover:border-charcoal-deep hover:bg-parchment'}
                  `}
                >
                  <Upload size={28} className="text-taupe mb-3" />
                  <p className="text-sm text-charcoal-deep font-medium mb-1">
                    Upload your photo
                  </p>
                  <p className="text-xs text-stone">
                    Drag & drop or click — full-body photo works best
                  </p>
                  <p className="text-[10px] text-taupe mt-2">
                    JPEG · PNG · WEBP · max 10 MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">
                    Your photo
                  </p>
                  <div className="relative w-full aspect-[3/4] max-w-xs mx-auto">
                    <Image
                      src={userPhotoUrl}
                      alt="Your photo"
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setUserPhotoUrl(null);
                      setUserPhotoFile(null);
                    }}
                    className="text-xs text-taupe hover:text-charcoal-deep underline underline-offset-4 transition-colors"
                  >
                    Choose a different photo
                  </button>
                </div>
              )}

              {userPhotoUrl && (
                <button
                  onClick={handleGenerate}
                  className="w-full py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-noir"
                >
                  <Sparkles size={16} />
                  <span className="text-sm tracking-[0.15em] uppercase">
                    Generate Try-On
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Generating stage */}
          {stage === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-gold-muted/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-gold-muted animate-spin" />
                <Sparkles
                  size={24}
                  className="absolute inset-0 m-auto text-gold-muted"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-deep mb-1">
                  Generating your try-on…
                </p>
                <p className="text-xs text-stone">
                  Gemini AI is compositing the garment onto your photo.
                  This typically takes 15–25 seconds.
                </p>
              </div>
            </div>
          )}

          {/* Result stage */}
          {stage === 'result' && resultUrl && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Original photo */}
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-2 text-center">
                    Your photo
                  </p>
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={userPhotoUrl!}
                      alt="Original"
                      fill
                      className="object-cover"
                      sizes="250px"
                    />
                  </div>
                </div>
                {/* Try-on result */}
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-2 text-center">
                    Wearing the piece
                  </p>
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={resultUrl}
                      alt="Virtual try-on result"
                      fill
                      className="object-cover"
                      sizes="250px"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-parchment p-4">
                <p className="text-xs text-stone text-center">
                  AI-generated preview. Actual garment colours, textures and fit
                  may vary. For a perfect fit, consult the size guide.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3 px-4 border border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream text-sm tracking-[0.1em] uppercase"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error stage */}
          {stage === 'error' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center py-10 text-center space-y-4">
                <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} className="text-error" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-deep mb-1">
                    Try-on could not be generated
                  </p>
                  <p className="text-xs text-stone max-w-sm">
                    {errorMsg || 'An unexpected error occurred. Please try again.'}
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="w-full py-4 px-6 border border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-2 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream text-sm tracking-[0.15em] uppercase"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
