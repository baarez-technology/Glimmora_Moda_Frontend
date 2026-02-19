'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Mail, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
  imageUrl?: string;
}

const socialPlatforms = [
  { id: 'twitter', name: 'Twitter', icon: <Twitter className="w-5 h-5" />, color: 'bg-[#1DA1F2]' },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: 'bg-[#4267B2]' },
  { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-[#25D366]' },
  { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, color: 'bg-stone/70' }
];

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  description,
  imageUrl
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareCloseRef = useRef<HTMLButtonElement>(null);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Auto-focus close button when modal opens
  useEffect(() => {
    if (isOpen) shareCloseRef.current?.focus();
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareVia = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || '');

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-charcoal-deep/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone/10 flex items-center justify-between">
            <h2 id="share-modal-title" className="text-lg font-display text-charcoal-deep">Share</h2>
            <button
              ref={shareCloseRef}
              onClick={onClose}
              className="p-2 hover:bg-stone/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone/60" />
            </button>
          </div>

          {/* Preview */}
          <div className="px-6 py-4 bg-stone/5">
            <div className="flex items-center gap-4">
              {imageUrl && (
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 relative">
                  <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-charcoal-deep truncate">{title}</h3>
                {description && (
                  <p className="text-sm text-stone/60 truncate">{description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="p-6 space-y-6">
            {/* Social Platforms */}
            <div>
              <p className="text-xs tracking-wider uppercase text-stone/50 mb-3">Share via</p>
              <div className="flex gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => shareVia(platform.id)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl ${platform.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    {platform.icon}
                    <span className="text-xs">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Link */}
            <div>
              <p className="text-xs tracking-wider uppercase text-stone/50 mb-3">Or copy link</p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-stone/5 rounded-lg">
                  <Link2 className="w-4 h-4 text-stone/40 flex-shrink-0" />
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-charcoal-deep truncate focus:outline-none"
                  />
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-charcoal-deep text-ivory-cream hover:bg-charcoal-deep/90'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Native Share (Mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 border border-stone/20 rounded-lg text-charcoal-deep hover:bg-stone/5 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-sm">More sharing options</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
