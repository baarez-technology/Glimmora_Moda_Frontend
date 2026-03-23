'use client';

import { useState, useEffect, useRef } from 'react';
import { Truck, Shield, Leaf, Globe, TrendingUp, MapPin, Plus, Edit2, Trash2, X, ChevronDown } from 'lucide-react';
import type { Product, Brand } from '@/types';

/* ── Shared address shape (matches profile/addresses page) ── */
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
  label: '', fullName: '', street: '', city: '', state: '', postalCode: '', country: '', phone: ''
};

/* ── Delivery estimate types ── */
interface DeliveryEstimate {
  standard: { date: string; label: string };
  express: { date: string; label: string; price: number };
  whiteGlove: { label: string; description: string; price: number };
}

interface ProductDeliveryProps {
  product: Product;
  brand?: Brand | null;
  deliveryEstimate: DeliveryEstimate;
}

/* ── Inline address form ── */
function AddressForm({
  formData,
  setFormData,
  formErrors,
  isEditing,
  onSave,
  onCancel
}: {
  formData: Omit<SavedAddress, 'id' | 'isDefault'>;
  setFormData: (d: Omit<SavedAddress, 'id' | 'isDefault'>) => void;
  formErrors: Record<string, string>;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const labelRef = useRef<HTMLInputElement>(null);
  useEffect(() => { labelRef.current?.focus(); }, []);

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-xs border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${formErrors[field] ? 'border-red-400' : 'border-sand'}`;

  return (
    <div className="bg-parchment p-5 border border-sand/50 mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] tracking-[0.3em] uppercase text-charcoal-deep font-medium">
          {isEditing ? 'Edit Address' : 'New Address'}
        </p>
        <button onClick={onCancel} className="p-1 hover:bg-sand/30 transition-colors">
          <X size={14} className="text-stone" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Label</label>
          <input ref={labelRef} type="text" value={formData.label} placeholder="e.g. Home, Office"
            onChange={e => setFormData({ ...formData, label: e.target.value })}
            className={inputCls('label')} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Full Name *</label>
          <input type="text" value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            className={inputCls('fullName')} />
          {formErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.fullName}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Street Address *</label>
          <input type="text" value={formData.street}
            onChange={e => setFormData({ ...formData, street: e.target.value })}
            className={inputCls('street')} />
          {formErrors.street && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.street}</p>}
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">City *</label>
          <input type="text" value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            className={inputCls('city')} />
          {formErrors.city && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.city}</p>}
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">State / Region</label>
          <input type="text" value={formData.state}
            onChange={e => setFormData({ ...formData, state: e.target.value })}
            className={inputCls('state')} />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Postal Code</label>
          <input type="text" value={formData.postalCode}
            onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
            className={inputCls('postalCode')} />
          {formErrors.postalCode && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.postalCode}</p>}
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Country *</label>
          <input type="text" value={formData.country}
            onChange={e => setFormData({ ...formData, country: e.target.value })}
            className={inputCls('country')} />
          {formErrors.country && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.country}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-stone mb-1">Phone</label>
          <input type="tel" value={formData.phone} placeholder="+1 234 567 8900"
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className={inputCls('phone')} />
          {formErrors.phone && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.phone}</p>}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onCancel}
          className="flex-1 px-4 py-2 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-[11px] tracking-[0.2em] uppercase">
          Cancel
        </button>
        <button onClick={onSave}
          className="flex-1 px-4 py-2 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-[11px] tracking-[0.2em] uppercase">
          {isEditing ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}

/* ── Delivery address selector ── */
function DeliveryAddressSection() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const loaded = loadAddresses();
    setAddresses(loaded);
    const defaultAddr = loaded.find(a => a.isDefault);
    setSelectedId(defaultAddr?.id ?? loaded[0]?.id ?? null);
    setHydrated(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (hydrated) saveAddresses(addresses);
  }, [addresses, hydrated]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Close form on Escape
  useEffect(() => {
    if (!showForm) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowForm(false); setEditingId(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showForm]);

  const selectedAddress = addresses.find(a => a.id === selectedId) ?? null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Required';
    if (!formData.street.trim()) errs.street = 'Required';
    if (!formData.city.trim()) errs.city = 'Required';
    if (!formData.country.trim()) errs.country = 'Required';
    if (formData.postalCode && (formData.postalCode.trim().length < 3 || formData.postalCode.trim().length > 12))
      errs.postalCode = '3-12 characters';
    if (formData.phone && !/^[+\d][\d\s\-()]{6,20}$/.test(formData.phone.trim()))
      errs.phone = 'Invalid phone';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
    } else {
      const newAddr: SavedAddress = { ...formData, id: `addr-${Date.now()}`, isDefault: addresses.length === 0 };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedId(newAddr.id);
    }
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFormErrors({});
  };

  const handleEdit = (addr: SavedAddress) => {
    setFormData({ label: addr.label, fullName: addr.fullName, street: addr.street, city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country, phone: addr.phone });
    setEditingId(addr.id);
    setShowForm(true);
    setDropdownOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (prev.find(a => a.id === id)?.isDefault && filtered.length > 0) filtered[0].isDefault = true;
      return filtered;
    });
    if (selectedId === id) {
      const remaining = addresses.filter(a => a.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
    }
  };

  const openNewForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormErrors({});
    setShowForm(true);
    setDropdownOpen(false);
  };

  if (!hydrated) return null;

  return (
    <div className="mt-6 pt-6 border-t border-sand/30">
      <p className="text-[11px] tracking-[0.3em] uppercase text-taupe mb-4">Delivery Address</p>

      {addresses.length > 0 ? (
        <>
          {/* Address selector dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-sand bg-white text-left hover:border-charcoal-deep/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MapPin size={14} className="text-stone shrink-0" />
                <span className="text-xs text-charcoal-deep truncate">
                  {selectedAddress ? `${selectedAddress.label || 'Address'} — ${selectedAddress.street}, ${selectedAddress.city}` : 'Select address'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-stone shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-sand shadow-lg max-h-60 overflow-y-auto">
                {addresses.map(addr => (
                  <button key={addr.id}
                    onClick={() => { setSelectedId(addr.id); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-parchment transition-colors flex items-center justify-between ${addr.id === selectedId ? 'bg-parchment' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-charcoal-deep truncate">
                        {addr.label || 'Address'}
                        {addr.isDefault && <span className="ml-2 text-[9px] tracking-wider uppercase text-taupe">Default</span>}
                      </p>
                      <p className="text-[11px] text-stone truncate">{addr.street}, {addr.city}</p>
                    </div>
                  </button>
                ))}
                <button onClick={openNewForm}
                  className="w-full text-left px-4 py-3 hover:bg-parchment transition-colors border-t border-sand/30 flex items-center gap-2">
                  <Plus size={12} className="text-stone" />
                  <span className="text-[11px] tracking-[0.2em] uppercase text-stone">Add New Address</span>
                </button>
              </div>
            )}
          </div>

          {/* Selected address details */}
          {selectedAddress && !showForm && (
            <div className="mt-3 p-4 bg-parchment border border-sand/30">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-charcoal-deep mb-1">{selectedAddress.fullName}</p>
                  <p className="text-[11px] text-stone">{selectedAddress.street}</p>
                  <p className="text-[11px] text-stone">
                    {selectedAddress.city}{selectedAddress.state ? `, ${selectedAddress.state}` : ''} {selectedAddress.postalCode}
                  </p>
                  <p className="text-[11px] text-stone">{selectedAddress.country}</p>
                  {selectedAddress.phone && <p className="text-[11px] text-stone mt-1">{selectedAddress.phone}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button onClick={() => handleEdit(selectedAddress)}
                    className="p-1.5 hover:bg-sand/30 transition-colors" title="Edit">
                    <Edit2 size={13} className="text-stone" />
                  </button>
                  <button onClick={() => handleDelete(selectedAddress.id)}
                    className="p-1.5 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : !showForm ? (
        <button onClick={openNewForm}
          className="w-full py-3 border border-dashed border-sand hover:border-charcoal-deep text-stone hover:text-charcoal-deep transition-colors flex items-center justify-center gap-2">
          <Plus size={14} />
          <span className="text-[11px] tracking-[0.2em] uppercase">Add Delivery Address</span>
        </button>
      ) : null}

      {/* Inline form */}
      {showForm && (
        <AddressForm
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          isEditing={!!editingId}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); setFormErrors({}); }}
        />
      )}
    </div>
  );
}

/* ── Main component ── */
export default function ProductDelivery({
  product,
  brand,
  deliveryEstimate
}: ProductDeliveryProps) {
  return (
    <>
      {/* Delivery & Services */}
      <div className="mt-10 pt-10 border-t border-sand/50">
        <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-6">Delivery & Services</p>

        <div className="space-y-4">
          {/* Standard Delivery */}
          <div className="flex items-start gap-4">
            <Truck size={18} className="text-stone mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="text-sm text-charcoal-deep">{deliveryEstimate.standard.label}</p>
                <span className="text-xs text-gold-deep">Free</span>
              </div>
              <p className="text-xs text-stone">Arrives by {deliveryEstimate.standard.date}</p>
            </div>
          </div>

          {/* Express Delivery */}
          <div className="flex items-start gap-4">
            <Truck size={18} className="text-stone mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="text-sm text-charcoal-deep">{deliveryEstimate.express.label}</p>
                <span className="text-xs text-stone">+${deliveryEstimate.express.price}</span>
              </div>
              <p className="text-xs text-stone">Arrives by {deliveryEstimate.express.date}</p>
            </div>
          </div>

          {/* White Glove */}
          <div className="flex items-start gap-4 p-3 bg-parchment -mx-3">
            <Shield size={18} className="text-gold-muted mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="text-sm text-charcoal-deep">{deliveryEstimate.whiteGlove.label}</p>
                <span className="text-xs text-stone">+${deliveryEstimate.whiteGlove.price}</span>
              </div>
              <p className="text-xs text-stone">{deliveryEstimate.whiteGlove.description}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address Section — removed from product page, managed in /profile/addresses */}
      </div>

      {/* Care & Longevity */}
      <div className="mt-8 pt-8 border-t border-sand/50">
        <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-6">Care & Longevity</p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Leaf size={18} className="text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm text-charcoal-deep">Designed to Last</p>
              <p className="text-xs text-stone">With proper care, this piece will maintain its beauty for decades</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Shield size={18} className="text-stone mt-0.5" />
            <div>
              <p className="text-sm text-charcoal-deep">Restoration Services</p>
              <p className="text-xs text-stone">{brand?.name} offers lifetime repair and restoration</p>
            </div>
          </div>

          <div className="p-4 bg-parchment">
            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Care Instructions</p>
            <ul className="text-xs text-stone space-y-1">
              {product.category === 'bags' ? (
                <>
                  <li>• Store in provided dust bag when not in use</li>
                  <li>• Avoid prolonged exposure to direct sunlight</li>
                  <li>• Clean with soft, dry cloth</li>
                </>
              ) : product.category === 'clothing' ? (
                <>
                  <li>• Dry clean only recommended</li>
                  <li>• Store on padded hanger</li>
                  <li>• Steam to remove wrinkles, avoid direct iron</li>
                </>
              ) : (
                <>
                  <li>• Store in original packaging</li>
                  <li>• Clean with appropriate materials</li>
                  <li>• Handle with care to preserve finish</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-8 pt-8 border-t border-sand/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Shield size={20} className="mx-auto text-taupe mb-2" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Authenticated</p>
          </div>
          <div>
            <TrendingUp size={20} className="mx-auto text-taupe mb-2" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Free Returns</p>
          </div>
          <div>
            <Globe size={20} className="mx-auto text-taupe mb-2" />
            <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Global Delivery</p>
          </div>
        </div>
      </div>
    </>
  );
}
