'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, X, Home, Briefcase, Building2, Tag } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import * as addressService from '@/services/address.service';
import type { CustomerAddress, CreateAddressPayload, UpdateAddressPayload } from '@/services/address.service';

const TAG_OPTIONS = ['Home', 'Office', 'Work', 'Other'];

const TAG_ICONS: Record<string, typeof Home> = {
  Home,
  Office: Building2,
  Work: Briefcase,
};

function getTagIcon(tag: string) {
  return TAG_ICONS[tag] || Tag;
}

const emptyForm = {
  address: '',
  city: '',
  postal_code: '',
  country: '',
  tag: 'Home',
};

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // ESC key handler for address form
  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowForm(false); setEditingId(null); }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  // Auto-focus address input when form opens
  useEffect(() => {
    if (showForm) addressInputRef.current?.focus();
  }, [showForm]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/profile/addresses');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Fetch addresses from API
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load addresses', 'error');
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, [showToast]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchAddresses();
    }
  }, [isHydrated, isAuthenticated, fetchAddresses]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (formData.postal_code && (formData.postal_code.trim().length < 3 || formData.postal_code.trim().length > 12)) {
      newErrors.postal_code = 'Postal code must be 3-12 characters';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const payload: UpdateAddressPayload = {
          address: formData.address.trim(),
          city: formData.city.trim(),
          postal_code: formData.postal_code.trim(),
          country: formData.country.trim(),
          tag: formData.tag,
        };
        const updated = await addressService.updateAddress(editingId, payload);
        setAddresses(prev => prev.map(a => a.address_id === editingId ? updated : a));
        showToast('Address updated', 'success');
      } else {
        const payload: CreateAddressPayload = {
          address: formData.address.trim(),
          city: formData.city.trim(),
          postal_code: formData.postal_code.trim(),
          country: formData.country.trim(),
          tag: formData.tag,
        };
        const created = await addressService.createAddress(payload);
        setAddresses(prev => [created, ...prev]);
        showToast('Address added', 'success');
      }

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save address', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [formData, editingId, showToast]);

  const handleEdit = (addr: CustomerAddress) => {
    setFormData({
      address: addr.address,
      city: addr.city,
      postal_code: addr.postal_code,
      country: addr.country,
      tag: addr.tag,
    });
    setEditingId(addr.address_id);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await addressService.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.address_id !== id));
      showToast('Address deleted', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete address', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteAddressId(null);
    }
  }, [showToast]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
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
              Address Book
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Saved Addresses
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
              {/* Tag selector */}
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Label</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData({ ...formData, tag })}
                      className={`px-4 py-2 border text-sm transition-colors flex items-center gap-2 ${
                        formData.tag === tag
                          ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                          : 'border-sand text-stone hover:border-charcoal-deep'
                      }`}
                    >
                      {(() => { const Icon = getTagIcon(tag); return <Icon size={14} />; })()}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Address *</label>
                <input
                  ref={addressInputRef}
                  type="text" value={formData.address}
                  onChange={e => { setFormData({ ...formData, address: e.target.value }); setFormErrors(prev => ({ ...prev, address: '' })); }}
                  placeholder="Street address, apartment, suite"
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.address ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">City *</label>
                <input
                  type="text" value={formData.city}
                  onChange={e => { setFormData({ ...formData, city: e.target.value }); setFormErrors(prev => ({ ...prev, city: '' })); }}
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.city ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Postal Code</label>
                <input
                  type="text" value={formData.postal_code}
                  onChange={e => { setFormData({ ...formData, postal_code: e.target.value }); setFormErrors(prev => ({ ...prev, postal_code: '' })); }}
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.postal_code ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.postal_code && <p className="text-xs text-red-500 mt-1">{formErrors.postal_code}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-2">Country *</label>
                <input
                  type="text" value={formData.country}
                  onChange={e => { setFormData({ ...formData, country: e.target.value }); setFormErrors(prev => ({ ...prev, country: '' })); }}
                  className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors.country ? 'border-red-400' : 'border-sand'}`}
                />
                {formErrors.country && <p className="text-xs text-red-500 mt-1">{formErrors.country}</p>}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                disabled={isSaving}
                className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-wider uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-wider uppercase disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-6 border border-sand/30 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-sand/30 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-sand/30 rounded w-24" />
                    <div className="h-3 bg-sand/20 rounded w-48" />
                    <div className="h-3 bg-sand/20 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Address List */}
        {!isLoading && addresses.length === 0 && !showForm && (
          <div className="bg-white p-12 text-center">
            <MapPin size={40} className="text-stone/40 mx-auto mb-4" />
            <h2 className="font-display text-xl text-charcoal-deep mb-2">No saved addresses</h2>
            <p className="text-sm text-stone">Add an address to speed up checkout</p>
          </div>
        )}

        {!isLoading && addresses.map(addr => {
          const TagIcon = getTagIcon(addr.tag);
          return (
            <div key={addr.address_id} className="bg-white p-6 border border-sand/30">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-charcoal-deep/5">
                    <TagIcon size={18} className="text-charcoal-deep" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-charcoal-deep">{addr.tag || 'Address'}</p>
                    </div>
                    <p className="text-sm text-stone">{addr.address}</p>
                    <p className="text-sm text-stone">{addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}</p>
                    <p className="text-sm text-stone">{addr.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(addr)} className="p-2 hover:bg-sand/20 transition-colors" title="Edit">
                    <Edit2 size={16} className="text-stone" />
                  </button>
                  <button onClick={() => setDeleteAddressId(addr.address_id)} className="p-2 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
      />
    </div>
  );
}
