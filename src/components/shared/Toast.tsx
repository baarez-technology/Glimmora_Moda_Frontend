'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Check, AlertCircle, Info } from 'lucide-react';

function ToastItem({ toast, onDismiss }: { toast: { id: string; message: string; type: 'success' | 'error' | 'info' }; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg backdrop-blur-sm min-w-[280px] ${
        toast.type === 'success'
          ? 'bg-charcoal-deep text-ivory-cream'
          : toast.type === 'error'
          ? 'bg-error text-white'
          : 'bg-charcoal-deep text-ivory-cream'
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
      }}
    >
      {toast.type === 'success' && <Check size={16} className="flex-shrink-0" />}
      {toast.type === 'error' && <AlertCircle size={16} className="flex-shrink-0" />}
      {toast.type === 'info' && <Info size={16} className="flex-shrink-0" />}

      <span className="text-sm font-medium">{toast.message}</span>

      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] space-y-3 flex flex-col items-end" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
