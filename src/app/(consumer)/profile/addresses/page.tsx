'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, X, Check, Home } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const STORAGE_KEY = 'moda-addresses';

function loadAddresses(): SavedAddress[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAddresses(addresses: SavedAddress[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

const emptyForm: Omit<SavedAddress, 'id' | 'isDefault'> = {
  label: '',
  fullName: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: ''
};

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isHydratedLocal, setIsHydratedLocal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const addressLabelRef = useRef<HTMLInputElement>(null);

  // ESC key handler for address form
  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowForm(false); setEditingId(null); }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  // Auto-focus label input when form opens
  useEffect(() => {
    if (showForm) addressLabelRef.current?.focus();
  }, [showForm]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/addresses');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setIsLoaded(true);
    }
  }, [isHydrated, isAuthenticated]);

  useEffect(() => {
    setAddresses(loadAddresses());
    setIsHydratedLocal(true);
  }, []);

  useEffect(() => {
    if (isHydratedLocal) {
      saveAddresses(addresses);
    }
  }, [addresses, isHydratedLocal]);

  const validateAddressForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    if (formData.postalCode && (formData.postalCode.trim().length < 3 || formData.postalCode.trim().length > 12)) {
      newErrors.postalCode = 'Postal code must be 3-12 characters';
    }

    if (formData.phone) {
      if (!/^[+\d][\d\s\-()]{6,20}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Enter a valid phone number (e.g. +1 234 567-8900)';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(() => {
    if (!validateAddressForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    if (editingId) {
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
      showToast('Address updated', 'success');
    } else {
      const newAddress: SavedAddress = {
        ...formData,
        id: `addr-${Date.now()}`,
        isDefault: addresses.length === 0
      };
      setAddresses(prev => [...prev, newAddress]);
      showToast('Address added', 'success');
    }

    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }, [formData, editingId, addresses.length, showToast]);

  const handleEdit = (address: SavedAddress) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const addr = addresses.find(a => a.id === id);
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (addr?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    showToast('Address deleted', 'success');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    showToast('Default address updated', 'success');
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading addresses...</p>
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
              Shipping
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Addresses
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 space-y-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => { setFormData(emptyForm); setEditingId(null); setFormErrors({}); setShowForm(true); }}
            className="w-full py-4 border-2 border-dashed border-sand hover:border-charcoal-deep text-stone hover:text-charcoal-deep transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm tracking-wider uppercase">Add New Address</span>
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white p-8" role="form" aria-labelledby="address-form-title">
            <div className="flex items-center justify-between mb-8">
              <h2 id="address-form-title" className="font-display text-xl text-charcoal-deep">
                {editingId ? 'Edit Address' : 'New Address'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Label</label>
                <input
                  ref={addressLabelRef}
                  type="text" value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Home, Office"
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Full Name *</label>
                <input
                  type="text" value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Street Address *</label>
                <input
                  type="text" value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">City *</label>
                <input
                  type="text" value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">State / Region</label>
                <input
                  type="text" value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Postal Code</label>
                <input
                  type="text" value={formData.postalCode}
                  onChange={e => { setFormData({ ...formData, postalCode: e.target.value }); setFormErrors(prev => ({ ...prev, postalCode: '' })); }}
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.postalCode ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.postalCode && <p className="text-xs text-red-500 mt-1">{formErrors.postalCode}</p>}
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Country *</label>
                <input
                  type="text" value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Phone</label>
                <input
                  type="tel" value={formData.phone}
                  onChange={e => { setFormData({ ...formData, phone: e.target.value }); setFormErrors(prev => ({ ...prev, phone: '' })); }}
                  placeholder="+1 234 567 8900"
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.phone ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-wider uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase"
              >
                {editingId ? 'Update' : 'Save'} Address
              </button>
            </div>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <div className="bg-white p-12 text-center">
            <MapPin size={40} className="text-stone/40 mx-auto mb-4" />
            <h2 className="font-display text-xl text-charcoal-deep mb-2">No saved addresses</h2>
            <p className="text-sm text-stone">Add an address to speed up checkout</p>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className={`bg-white p-6 border ${address.isDefault ? 'border-charcoal-deep' : 'border-sand/30'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center ${address.isDefault ? 'bg-charcoal-deep' : 'bg-charcoal-deep/5'}`}>
                    <Home size={18} className={address.isDefault ? 'text-ivory-cream' : 'text-charcoal-deep'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-charcoal-deep">{address.label || 'Address'}</p>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-charcoal-deep/10 text-[10px] tracking-wider uppercase text-charcoal-deep">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-stone">{address.fullName}</p>
                    <p className="text-sm text-stone">{address.street}</p>
                    <p className="text-sm text-stone">{address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}</p>
                    <p className="text-sm text-stone">{address.country}</p>
                    {address.phone && <p className="text-sm text-stone mt-1">{address.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="p-2 hover:bg-sand/20 transition-colors" title="Set as default"
                    >
                      <Check size={16} className="text-stone" />
                    </button>
                  )}
                  <button onClick={() => handleEdit(address)} className="p-2 hover:bg-sand/20 transition-colors" title="Edit">
                    <Edit2 size={16} className="text-stone" />
                  </button>
                  <button onClick={() => setDeleteAddressId(address.id)} className="p-2 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Address Confirmation */}
      <ConfirmModal
        isOpen={!!deleteAddressId}
        onClose={() => setDeleteAddressId(null)}
        onConfirm={() => {
          if (deleteAddressId) handleDelete(deleteAddressId);
        }}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
