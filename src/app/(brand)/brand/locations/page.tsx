'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Plus,
  X,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Clock,
  Globe,
} from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import {
  getAllShopLocations,
  addShopLocation,
  updateShopLocation,
  deleteShopLocation,
  type BrandShopLocation,
} from '@/services/brand-locations.service';

const SHOP_TYPES = ['flagship', 'boutique', 'outlet', 'popup', 'department_store'] as const;

const SHOP_TYPE_LABELS: Record<string, string> = {
  flagship: 'Flagship',
  boutique: 'Boutique',
  outlet: 'Outlet',
  popup: 'Pop-Up',
  department_store: 'Department Store',
};

const SHOP_TYPE_BADGES: Record<string, string> = {
  flagship: 'bg-purple-100 text-purple-700',
  boutique: 'bg-blue-100 text-blue-700',
  outlet: 'bg-amber-100 text-amber-700',
  popup: 'bg-green-100 text-green-700',
  department_store: 'bg-stone/10 text-stone',
};

const emptyForm = {
  shop_name: '',
  shop_type: 'boutique' as BrandShopLocation['shop_type'],
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  phone: '',
  email: '',
  opening_hours: '',
  latitude: '',
  longitude: '',
  image_url: '',
  is_active: true,
};

export default function BrandLocationsPage() {
  const [locations, setLocations] = useState<BrandShopLocation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadLocations = useCallback(() => {
    setLocations(getAllShopLocations());
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (loc: BrandShopLocation) => {
    setForm({
      shop_name: loc.shop_name,
      shop_type: loc.shop_type,
      address_line1: loc.address_line1,
      address_line2: loc.address_line2 || '',
      city: loc.city,
      state: loc.state,
      country: loc.country,
      postal_code: loc.postal_code,
      phone: loc.phone || '',
      email: loc.email || '',
      opening_hours: loc.opening_hours || '',
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
      image_url: loc.image_url || '',
      is_active: loc.is_active,
    });
    setEditingId(loc.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.shop_name || !form.address_line1 || !form.city || !form.country) return;
    setSubmitting(true);

    const payload = {
      brand_id: 'current-brand',
      shop_name: form.shop_name,
      shop_type: form.shop_type,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || undefined,
      city: form.city,
      state: form.state,
      country: form.country,
      postal_code: form.postal_code,
      phone: form.phone || undefined,
      email: form.email || undefined,
      opening_hours: form.opening_hours || undefined,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      image_url: form.image_url || undefined,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        updateShopLocation(editingId, payload);
      } else {
        addShopLocation(payload);
      }
      loadLocations();
    } catch (err) {
      console.error('Failed to save location:', err);
    }

    resetForm();
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    try {
      deleteShopLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete location:', err);
    }
    setDeleteConfirm(null);
  };

  const handleToggleActive = (loc: BrandShopLocation) => {
    try {
      updateShopLocation(loc.id, { is_active: !loc.is_active });
      loadLocations();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const totalLocations = locations.length;
  const activeLocations = locations.filter(l => l.is_active).length;
  const flagshipCount = locations.filter(l => l.shop_type === 'flagship').length;
  const countriesCount = new Set(locations.map(l => l.country)).size;

  const formatAddress = (loc: BrandShopLocation) => {
    const parts = [loc.address_line1];
    if (loc.address_line2) parts.push(loc.address_line2);
    parts.push(`${loc.city}${loc.state ? ', ' + loc.state : ''} ${loc.postal_code}`);
    parts.push(loc.country);
    return parts;
  };

  return (
    <>
      <BrandPageHeader
        title="Shop Locations"
        subtitle="Manage your brand's boutiques, flagships, and retail locations"
        actions={
          <PrimaryButton
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            icon={showForm ? X : Plus}
          >
            {showForm ? 'Close' : 'Add Location'}
          </PrimaryButton>
        }
      />

      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Locations</p>
            <p className="font-display text-2xl text-charcoal-deep">{totalLocations}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Active</p>
            <p className="font-display text-2xl text-charcoal-deep">{activeLocations}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Flagships</p>
            <p className="font-display text-2xl text-charcoal-deep">{flagshipCount}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Countries</p>
            <p className="font-display text-2xl text-charcoal-deep">{countriesCount}</p>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/30 flex items-center gap-2">
              <Plus size={16} className="text-charcoal-deep" />
              <span className="text-sm font-medium text-charcoal-deep">
                {editingId ? 'Edit Shop Location' : 'Add New Shop Location'}
              </span>
            </div>
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Shop Name *</label>
                  <input
                    type="text"
                    value={form.shop_name}
                    onChange={e => setForm(prev => ({ ...prev, shop_name: e.target.value }))}
                    placeholder="e.g., Maison Dior Avenue Montaigne"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Shop Type *</label>
                  <select
                    value={form.shop_type}
                    onChange={e => setForm(prev => ({ ...prev, shop_type: e.target.value as BrandShopLocation['shop_type'] }))}
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep"
                  >
                    {SHOP_TYPES.map(t => (
                      <option key={t} value={t}>{SHOP_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    value={form.address_line1}
                    onChange={e => setForm(prev => ({ ...prev, address_line1: e.target.value }))}
                    placeholder="30 Avenue Montaigne"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={form.address_line2}
                    onChange={e => setForm(prev => ({ ...prev, address_line2: e.target.value }))}
                    placeholder="Suite 200 (optional)"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Paris"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">State / Province</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Ile-de-France"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Country *</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="France"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={e => setForm(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="75008"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+33 1 40 73 73 73"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="paris@brand.com"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={form.opening_hours}
                    onChange={e => setForm(prev => ({ ...prev, opening_hours: e.target.value }))}
                    placeholder="Mon-Sat 10:00-19:00, Sun Closed"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Image URL</label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="48.8656"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="2.3040"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
              </div>

              {/* Is Active Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-charcoal-deep"
                />
                <label htmlFor="is_active" className="text-sm text-charcoal-deep">
                  Location is active and visible to customers
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.shop_name || !form.address_line1 || !form.city || !form.country}
                  className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-sand text-stone text-xs tracking-[0.15em] uppercase hover:border-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Cards */}
        {locations.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No shop locations added yet</p>
            <p className="text-xs text-taupe mt-1">Add your first boutique or flagship location above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map(loc => (
              <div key={loc.id} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin size={18} className="text-stone" />
                      <h3 className="font-display text-lg text-charcoal-deep">{loc.shop_name}</h3>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${SHOP_TYPE_BADGES[loc.shop_type]}`}>
                        {SHOP_TYPE_LABELS[loc.shop_type]}
                      </span>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${
                        loc.is_active ? 'bg-green-100 text-green-700' : 'bg-stone/10 text-stone'
                      }`}>
                        {loc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Active/Inactive Toggle */}
                    <button
                      onClick={() => handleToggleActive(loc)}
                      className={`px-3 py-1 text-xs tracking-[0.1em] uppercase border transition-colors ${
                        loc.is_active
                          ? 'border-stone text-stone hover:border-error hover:text-error'
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {loc.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(loc)}
                      className="p-2 text-stone hover:text-charcoal-deep hover:bg-parchment transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    {deleteConfirm === loc.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(loc.id)}
                          className="px-3 py-1 bg-error text-ivory-cream text-xs hover:bg-error/80 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 border border-sand text-stone text-xs hover:border-charcoal-deep transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(loc.id)}
                        className="p-2 text-stone hover:text-error hover:bg-error/5 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3">
                  {formatAddress(loc).map((line, i) => (
                    <p key={i} className="text-sm text-stone">{line}</p>
                  ))}
                </div>

                {/* Contact & Details */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone">
                  {loc.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-taupe" />
                      {loc.phone}
                    </span>
                  )}
                  {loc.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-taupe" />
                      {loc.email}
                    </span>
                  )}
                  {loc.opening_hours && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-taupe" />
                      {loc.opening_hours}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} className="text-taupe" />
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
