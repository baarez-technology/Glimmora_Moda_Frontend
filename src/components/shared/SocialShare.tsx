'use client';

import { useState } from 'react';
import { Share2, X, Check, Facebook, Twitter, MessageCircle, Instagram, Link as LinkIcon } from 'lucide-react';

interface SocialShareProps {
  title: string;
  text: string;
  url: string;
  image?: string;
  onClose?: () => void;
}

export default function SocialShare({ title, text, url, image, onClose }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowModal(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToPinterest = () => {
    if (image) {
      const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-3 px-6 py-4 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300"
      >
        <Share2 size={16} />
        <span className="text-sm tracking-[0.15em] uppercase">Share</span>
      </button>

      {/* Modal for non-native share */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand/30">
              <h3 className="font-display text-xl text-charcoal-deep">Share</h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-sand/20 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Social Media Buttons */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-taupe mb-4">Share Via</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareToFacebook}
                    className="flex items-center gap-3 px-4 py-3 border border-sand hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all duration-300 group"
                  >
                    <Facebook size={18} className="text-[#1877F2]" />
                    <span className="text-sm text-charcoal-deep group-hover:text-[#1877F2]">Facebook</span>
                  </button>

                  <button
                    onClick={shareToTwitter}
                    className="flex items-center gap-3 px-4 py-3 border border-sand hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/5 transition-all duration-300 group"
                  >
                    <Twitter size={18} className="text-[#1DA1F2]" />
                    <span className="text-sm text-charcoal-deep group-hover:text-[#1DA1F2]">Twitter</span>
                  </button>

                  <button
                    onClick={shareToWhatsApp}
                    className="flex items-center gap-3 px-4 py-3 border border-sand hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-300 group"
                  >
                    <MessageCircle size={18} className="text-[#25D366]" />
                    <span className="text-sm text-charcoal-deep group-hover:text-[#25D366]">WhatsApp</span>
                  </button>

                  {image && (
                    <button
                      onClick={shareToPinterest}
                      className="flex items-center gap-3 px-4 py-3 border border-sand hover:border-[#E60023] hover:bg-[#E60023]/5 transition-all duration-300 group"
                    >
                      <svg className="w-[18px] h-[18px] text-[#E60023]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.898.82 1.609.82 2.118 0 3.555-1.934 3.555-4.52 0-1.955-1.656-3.784-4.176-3.784-3.134 0-4.715 2.246-4.715 4.119 0 1.134.429 2.14 1.35 2.517.142.058.218.032.251-.088.025-.094.161-.655.223-.908.02-.082.01-.154-.056-.235-.365-.445-.599-1.008-.599-1.814 0-1.75 1.309-3.316 3.408-3.316 1.858 0 2.879 1.134 2.879 2.65 0 1.99-.88 3.666-2.187 3.666-.722 0-1.263-.597-1.09-1.328.209-.872.614-1.814.614-2.443 0-.564-.303-.935-.93-.935-.738 0-1.33.763-1.33 1.786 0 .65.22 1.09.22 1.09l-.885 3.752c-.262 1.112-.039 2.474-.02 2.611.01.08.114.099.16.039.067-.087.936-1.16 1.234-2.233.084-.303.481-1.879.481-1.879.238.453 1.131 1.012 2.027 1.012 2.665 0 4.472-2.428 4.472-5.686C18.371 5.479 15.89 3 12.343 3 8.005 3 5.629 6.192 5.629 9.485c0 1.613.612 3.047 1.926 3.578.215.086.329.048.379-.13.039-.133.233-.951.322-1.316.028-.115.014-.215-.078-.329-.509-.625-.835-1.416-.835-2.548 0-2.462 1.843-4.665 4.799-4.665 2.617 0 4.056 1.598 4.056 3.732 0 2.806-1.244 5.172-3.095 5.172-.994 0-1.739-.821-1.5-1.832.285-1.204.838-2.503.838-3.37 0-.777-.417-1.425-1.281-1.425-1.016 0-1.832 1.052-1.832 2.462 0 .898.304 1.505.304 1.505l-1.222 5.176c-.363 1.538-.054 3.422-.028 3.613.014.112.158.138.223.054.094-.122 1.3-1.611 1.713-3.096.117-.421.672-2.62.672-2.62.332.634 1.301 1.193 2.332 1.193 3.067 0 5.147-2.794 5.147-6.532C19.723 4.916 16.654 2 12 2z"/>
                      </svg>
                      <span className="text-sm text-charcoal-deep group-hover:text-[#E60023]">Pinterest</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Copy Link */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-taupe mb-3">Or Copy Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 px-4 py-3 border border-sand bg-ivory-cream text-sm text-stone focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-6 py-3 transition-all duration-300 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-charcoal-deep text-ivory-cream hover:bg-charcoal-warm'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <LinkIcon size={18} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-emerald-600 mt-2">Link copied to clipboard!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
