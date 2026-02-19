'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Plus, Trash2, X, Check, Shield, Pencil } from 'lucide-react';
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
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'visa' as PaymentMethod['type'],
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    holderName: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const paymentCardInputRef = useRef<HTMLSelectElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);

  // ESC key handler for form and delete confirmation
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmId) setDeleteConfirmId(null);
        else if (showForm) { setShowForm(false); setEditingCardId(null); }
      }
    };
    if (showForm || deleteConfirmId) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showForm, deleteConfirmId]);

  // Auto-focus when form/modal opens
  useEffect(() => {
    if (showForm) paymentCardInputRef.current?.focus();
  }, [showForm]);
  useEffect(() => {
    if (deleteConfirmId) deleteCancelRef.current?.focus();
  }, [deleteConfirmId]);

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

  const luhnCheck = (num: string): boolean => {
    const digits = num.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const formatCardInput = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const validateCardForm = (isEditMode: boolean): boolean => {
    const errs: Record<string, string> = {};
    const digits = formData.cardNumber.replace(/\s/g, '');

    if (!isEditMode) {
      // Adding new card: card number is required
      if (!digits) errs.cardNumber = 'Card number is required';
      else if (digits.length !== 16) errs.cardNumber = 'Card number must be 16 digits';
      else if (!luhnCheck(digits)) errs.cardNumber = 'Invalid card number';
    } else if (digits) {
      // Editing: only validate if user entered a new card number
      if (digits.length !== 16) errs.cardNumber = 'Card number must be 16 digits';
      else if (!luhnCheck(digits)) errs.cardNumber = 'Invalid card number';
    }

    if (!formData.holderName.trim()) errs.holderName = 'Cardholder name is required';
    if (!formData.expiryMonth) errs.expiryMonth = 'Required';
    if (!formData.expiryYear) errs.expiryYear = 'Required';

    if (formData.expiryMonth && formData.expiryYear) {
      const now = new Date();
      const expiry = new Date(parseInt(formData.expiryYear), parseInt(formData.expiryMonth));
      if (expiry <= now) errs.expiryMonth = 'Card has expired';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCardId(null);
    setFormData({ type: 'visa', cardNumber: '', expiryMonth: '', expiryYear: '', holderName: '' });
    setFormErrors({});
  };

  const openAddForm = () => {
    setEditingCardId(null);
    setFormData({ type: 'visa', cardNumber: '', expiryMonth: '', expiryYear: '', holderName: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (method: PaymentMethod) => {
    setEditingCardId(method.id);
    setFormData({
      type: method.type,
      cardNumber: '', // Don't pre-fill full card number for security
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      holderName: method.holderName
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleAdd = useCallback(() => {
    if (!validateCardForm(false)) {
      showToast('Please fix the errors below', 'error');
      return;
    }
    // Only store last 4 digits — never store full card number
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
    closeForm();
    showToast('Payment method added', 'success');
  }, [formData, methods.length, showToast]);

  const handleSaveEdit = useCallback(() => {
    if (!editingCardId) return;
    if (!validateCardForm(true)) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    setMethods(prev => prev.map(m => {
      if (m.id !== editingCardId) return m;

      const updatedCard: PaymentMethod = {
        ...m,
        type: formData.type,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        holderName: formData.holderName
      };

      // If user provided a new card number, update lastFour
      const digits = formData.cardNumber.replace(/\s/g, '');
      if (digits.length === 16) {
        updatedCard.lastFour = digits.slice(-4);
      }

      return updatedCard;
    }));

    closeForm();
    showToast('Payment method updated', 'success');
  }, [editingCardId, formData, showToast]);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const method = methods.find(m => m.id === deleteConfirmId);
    setMethods(prev => {
      const filtered = prev.filter(m => m.id !== deleteConfirmId);
      if (method?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    setDeleteConfirmId(null);
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
            onClick={openAddForm}
            className="w-full py-4 border-2 border-dashed border-sand hover:border-charcoal-deep text-stone hover:text-charcoal-deep transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm tracking-wider uppercase">Add Payment Method</span>
          </button>
        )}

        {/* Add Card Form - placeholder for inline position; actual form rendered as overlay below */}

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
                  <button
                    onClick={() => openEditForm(method)}
                    className="p-2 hover:bg-sand/20 transition-colors"
                    title="Edit card"
                  >
                    <Pencil size={16} className="text-stone" />
                  </button>
                  <button onClick={() => handleDelete(method.id)} className="p-2 hover:bg-red-50 transition-colors" title="Remove">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Card Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="payment-form-title" onClick={closeForm}>
          <div className="bg-white max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 id="payment-form-title" className="font-display text-xl text-charcoal-deep">
                {editingCardId ? 'Edit Card' : 'Add Card'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Card Type</label>
                <select
                  ref={paymentCardInputRef}
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
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">
                  Card Number
                  {editingCardId && (
                    <span className="text-stone/60 normal-case tracking-normal ml-2">
                      — leave blank to keep existing
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={e => { setFormData({ ...formData, cardNumber: formatCardInput(e.target.value) }); setFormErrors(prev => ({ ...prev, cardNumber: '' })); }}
                  placeholder={editingCardId
                    ? `•••• •••• •••• ${methods.find(m => m.id === editingCardId)?.lastFour ?? '****'}`
                    : '1234 5678 9012 3456'
                  }
                  maxLength={19}
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.cardNumber ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{formErrors.cardNumber}</p>}
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={formData.holderName}
                  onChange={e => { setFormData({ ...formData, holderName: e.target.value }); setFormErrors(prev => ({ ...prev, holderName: '' })); }}
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.holderName ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.holderName && <p className="text-xs text-red-500 mt-1">{formErrors.holderName}</p>}
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
                  onClick={closeForm}
                  className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCardId ? handleSaveEdit : handleAdd}
                  className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase"
                >
                  {editingCardId ? 'Save Changes' : 'Add Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-payment-title">
          <div className="bg-white max-w-md w-full p-8">
            <h3 id="delete-payment-title" className="font-display text-xl text-charcoal-deep mb-3">Remove Payment Method</h3>
            <p className="text-stone text-sm mb-6">
              Are you sure you want to remove this card? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                ref={deleteCancelRef}
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-wider uppercase"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm tracking-wider uppercase"
              >
                Remove Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
