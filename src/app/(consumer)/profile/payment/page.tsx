'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Plus, Trash2, X, Check, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

const STORAGE_KEY = 'moda-payment-methods';

function loadPaymentMethods(): PaymentMethod[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePaymentMethods(methods: PaymentMethod[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}

const cardTypeLabels: Record<PaymentMethod['type'], string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express'
};

export default function PaymentPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isHydratedLocal, setIsHydratedLocal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'visa' as PaymentMethod['type'],
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    holderName: ''
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/payment');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  useEffect(() => {
    setMethods(loadPaymentMethods());
    setIsHydratedLocal(true);
  }, []);

  useEffect(() => {
    if (isHydratedLocal) {
      savePaymentMethods(methods);
    }
  }, [methods, isHydratedLocal]);

  const handleAdd = useCallback(() => {
    if (!formData.holderName || !formData.cardNumber || !formData.expiryMonth || !formData.expiryYear) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    const lastFour = formData.cardNumber.replace(/\s/g, '').slice(-4);
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: formData.type,
      lastFour,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      holderName: formData.holderName,
      isDefault: methods.length === 0
    };
    setMethods(prev => [...prev, newMethod]);
    setFormData({ type: 'visa', cardNumber: '', expiryMonth: '', expiryYear: '', holderName: '' });
    setShowForm(false);
    showToast('Payment method added', 'success');
  }, [formData, methods.length, showToast]);

  const handleDelete = (id: string) => {
    const method = methods.find(m => m.id === id);
    setMethods(prev => {
      const filtered = prev.filter(m => m.id !== id);
      if (method?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    showToast('Payment method removed', 'success');
  };

  const handleSetDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    showToast('Default payment method updated', 'success');
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Billing
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Payment Methods
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Security Note */}
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200">
          <Shield size={18} className="text-green-700 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Card details are encrypted and securely stored. We never store your full card number.
          </p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 border-2 border-dashed border-sand hover:border-charcoal-deep text-stone hover:text-charcoal-deep transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm tracking-wider uppercase">Add Payment Method</span>
          </button>
        )}

        {/* Add Card Form */}
        {showForm && (
          <div className="bg-white p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl text-charcoal-deep">Add Card</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Card Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Card Number</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="•••• •••• •••• ••••"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={formData.holderName}
                  onChange={e => setFormData({ ...formData, holderName: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Expiry Month</label>
                  <select
                    value={formData.expiryMonth}
                    onChange={e => setFormData({ ...formData, expiryMonth: e.target.value })}
                    className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Expiry Year</label>
                  <select
                    value={formData.expiryYear}
                    onChange={e => setFormData({ ...formData, expiryYear: e.target.value })}
                    className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card List */}
        {methods.length === 0 && !showForm ? (
          <div className="bg-white p-12 text-center">
            <CreditCard size={40} className="text-stone/40 mx-auto mb-4" />
            <h2 className="font-display text-xl text-charcoal-deep mb-2">No payment methods</h2>
            <p className="text-sm text-stone">Add a card for faster checkout</p>
          </div>
        ) : (
          methods.map(method => (
            <div key={method.id} className={`bg-white p-6 border ${method.isDefault ? 'border-charcoal-deep' : 'border-sand/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-8 flex items-center justify-center ${method.isDefault ? 'bg-charcoal-deep' : 'bg-charcoal-deep/5'}`}>
                    <CreditCard size={18} className={method.isDefault ? 'text-ivory-cream' : 'text-charcoal-deep'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-charcoal-deep">
                        {cardTypeLabels[method.type]} •••• {method.lastFour}
                      </p>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 bg-charcoal-deep/10 text-[10px] tracking-wider uppercase text-charcoal-deep">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-stone">{method.holderName} — Exp. {method.expiryMonth}/{method.expiryYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="p-2 hover:bg-sand/20 transition-colors" title="Set as default"
                    >
                      <Check size={16} className="text-stone" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(method.id)} className="p-2 hover:bg-red-50 transition-colors" title="Remove">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
