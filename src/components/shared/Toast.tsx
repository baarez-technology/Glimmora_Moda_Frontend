'use client';

import { useApp } from '@/context/AppContext';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-slide-up ${
            toast.type === 'success'
              ? 'bg-success/95 text-white'
              : toast.type === 'error'
              ? 'bg-error/95 text-white'
              : 'bg-charcoal-deep/95 text-ivory-cream'
          }`}
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {toast.type === 'success' && <Check size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}

          <span className="text-sm font-medium">{toast.message}</span>

          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
