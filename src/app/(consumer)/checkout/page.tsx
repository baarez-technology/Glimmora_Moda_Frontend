'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Truck, Check, MapPin, Plus, CreditCard, Shield, Download, Mail, FileText, Printer, ChevronDown, Loader2 } from 'lucide-react';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import InvoiceDocument, { generateInvoiceNumber, printInvoice } from '@/components/shared/InvoiceDocument';
import { useCountries, useStates, useCities } from '@/hooks/useGeoData';
import * as addressService from '@/services/address.service';
import * as orderManagementService from '@/services/order-management.service';
import type { CustomerAddress } from '@/services/address.service';
import type { CustomerOrder } from '@/services/order-management.service';
import type { ConsiderationItem } from '@/types';

type Step = 'details' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { considerations, clearConsiderations, addOrder, cartItems, clearAllCart, showToast } = useApp();
  const { isAuthenticated, isHydrated, userData: authUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [placedOrder, setPlacedOrder] = useState<CustomerOrder | null>(null);
  const [orderItems, setOrderItems] = useState<ConsiderationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // New address form (geo-cascading)
  const [newAddress, setNewAddress] = useState({ address: '', country: '', state: '', city: '', postalCode: '', tag: 'Home' });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Phone (auto-filled or user can edit)
  const [phone, setPhone] = useState('');

  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState('standard');

  useEffect(() => { setIsLoaded(true); }, []);

  // Auto-fill from profile
  useEffect(() => {
    if (authUserData) {
      setPhone(authUserData.email ? '' : ''); // phone isn't in UserData, user enters once
    }
  }, [authUserData]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login/consumer?redirect=/checkout');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Fetch saved addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setAddressesLoading(true);
      const addrs = await addressService.getAddresses();
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        setSelectedAddressId(addrs[0].address_id);
      } else {
        setUseNewAddress(true);
      }
    } catch {
      setUseNewAddress(true);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchAddresses();
    }
  }, [isHydrated, isAuthenticated, fetchAddresses]);

  // Checkout items: cart items or considerations
  const hasCartItems = cartItems.length > 0;

  useEffect(() => {
    if (!hasCartItems && considerations.length === 0 && currentStep !== 'confirmation' && !placedOrder) {
      router.push('/consideration');
    }
  }, [hasCartItems, considerations, currentStep, placedOrder, router]);

  // Geo hooks — cascading Country → State → City from API
  const { countries: countryList, isLoading: countriesLoading } = useCountries();
  const { states: stateList, isLoading: statesLoading } = useStates(newAddress.country);
  const { cities: cityList, isLoading: citiesLoading } = useCities(newAddress.country, newAddress.state);

  // ESC handler for invoice modal
  useEffect(() => {
    if (!showInvoice) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowInvoice(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showInvoice]);

  // Loading
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  const total = (currentStep === 'confirmation' ? orderItems : considerations)
    .reduce((sum, item) => sum + item.product.price * (item.quantity || 1), 0);

  const displayItems = currentStep === 'confirmation' ? orderItems : considerations;

  // User info from profile
  const userName = authUserData ? `${authUserData.first_name} ${authUserData.last_name}` : '';
  const userEmail = authUserData?.email || '';

  const validateNewAddress = (): boolean => {
    const errs: Record<string, string> = {};
    if (!newAddress.address.trim()) errs.address = 'Address is required';
    if (!newAddress.country) errs.country = 'Country is required';
    if (!newAddress.state) errs.state = 'State is required';
    if (!newAddress.city) errs.city = 'City is required';
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCompletePurchase = async () => {
    // Validate address
    if (useNewAddress) {
      if (!validateNewAddress()) {
        showToast('Please complete the delivery address', 'error');
        return;
      }
    } else if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Build products
      const orderProducts = hasCartItems
        ? cartItems.map(ci => ({
            product_id: ci.product_id,
            color: ci.color,
            size: ci.size,
            quantity: ci.quantity,
          }))
        : considerations.map(ci => ({
            product_id: ci.productId,
            color: ci.selectedVariants?.color || '',
            size: ci.selectedVariants?.size || '',
            quantity: ci.quantity || 1,
          }));

      // Resolve address_id
      let addressId = selectedAddressId;
      if (useNewAddress) {
        const created = await addressService.createAddress({
          address: newAddress.address.trim(),
          city: newAddress.city,
          postal_code: newAddress.postalCode.trim(),
          country: newAddress.country,
          tag: newAddress.tag,
        });
        addressId = created.address_id;
      }

      const payload: orderManagementService.CreateOrderPayload = {
        products: orderProducts,
        address_id: addressId,
        customer_phone_number: phone,
        delivery_method: deliveryMethod,
        payment_method: 'Demo Card •••• 4242',
        payment_transaction_id: `demo_txn_${Date.now()}`,
        payment_status: 'paid',
        payment_date: new Date().toISOString(),
        payment_tax: 0,
        payment_shipping: 0,
        payment_amount: total,
        payment_currency: 'USD',
      };

      const createdOrder = await orderManagementService.createOrder(payload);
      setPlacedOrder(createdOrder);
      setOrderItems([...considerations]);

      // Clear cart/considerations
      if (hasCartItems) {
        try { await clearAllCart(); } catch { /* non-blocking */ }
      }
      clearConsiderations();
      addOrder(considerations, total);

      showToast('Order placed successfully!', 'success');
      setCurrentStep('confirmation');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const selectClasses = (hasError: boolean) =>
    `w-full px-4 py-4 bg-transparent border text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors appearance-none cursor-pointer ${hasError ? 'border-error' : 'border-sand'}`;

  const steps = [
    { id: 'details', label: 'Review & Order', number: '01' },
    { id: 'confirmation', label: 'Complete', number: '02' }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <section className="border-b border-sand/50 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-taupe" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Secure Checkout</span>
              </div>
              <Link href="/consideration" className="text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors">
                Return to Cart
              </Link>
            </div>

            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const stepIndex = steps.findIndex(s => s.id === currentStep);
                const isActive = currentStep === step.id;
                const isComplete = stepIndex > index;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center border transition-all ${
                        isActive || isComplete ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream' : 'border-sand text-taupe'
                      }`}>
                        {isComplete ? <Check size={16} /> : <span className="text-xs">{step.number}</span>}
                      </div>
                      <span className={`hidden sm:block text-sm ${isActive ? 'text-charcoal-deep' : 'text-taupe'}`}>{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 md:w-24 h-px mx-4 md:mx-8 ${isComplete ? 'bg-charcoal-deep' : 'bg-sand'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {currentStep === 'confirmation' && placedOrder ? (
            /* ============================================
               CONFIRMATION PAGE
               ============================================ */
            <div className="max-w-3xl mx-auto">
              <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-20 h-20 bg-charcoal-deep flex items-center justify-center mx-auto mb-8">
                  <Check size={32} className="text-ivory-cream" />
                </div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-4">Order Confirmed</span>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] mb-4">Thank You</h1>
                <p className="text-stone">
                  Order <span className="font-medium text-charcoal-deep">#{placedOrder.order_id}</span> has been confirmed.
                  A confirmation email has been sent to <span className="font-medium text-charcoal-deep">{placedOrder.customer_email}</span>.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Order Summary Card */}
                <div className="bg-white p-6 border border-sand/50">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block mb-4">Order Summary</span>
                  <div className="space-y-3 mb-4">
                    {placedOrder.products.map((product, idx) => (
                      <div key={`${product.product_id}-${idx}`} className="flex items-center gap-3">
                        <div className="relative w-12 h-14 overflow-hidden flex-shrink-0 bg-parchment">
                          {product.product_image ? (
                            <Image src={product.product_image} alt={product.product_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><CreditCard size={16} className="text-stone/40" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep truncate">{product.product_name}</p>
                          <p className="text-xs text-stone">
                            {product.size && `Size: ${product.size}`}
                            {product.size && product.color && ' · '}
                            {product.color && `${product.color}`}
                            {' · '}Qty: {product.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-charcoal-deep flex-shrink-0">${product.product_price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-sand/50 flex justify-between">
                    <span className="text-sm text-stone">Total</span>
                    <span className="font-display text-xl text-charcoal-deep">${placedOrder.payment_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-white p-6 border border-sand/50 space-y-6">
                  {/* Payment */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={14} className="text-stone" />
                      <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Payment Method</span>
                    </div>
                    <p className="text-sm text-charcoal-deep">{placedOrder.payment_method}</p>
                    <p className="text-xs text-success mt-1">Payment successful</p>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-stone" />
                      <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Delivery Address</span>
                    </div>
                    {placedOrder.delivery_tag && (
                      <p className="text-xs text-taupe mb-1">{placedOrder.delivery_tag}</p>
                    )}
                    <p className="text-sm text-charcoal-deep">{placedOrder.delivery_address}</p>
                    <p className="text-sm text-stone">{placedOrder.delivery_city}{placedOrder.delivery_postal_code ? `, ${placedOrder.delivery_postal_code}` : ''}</p>
                    <p className="text-sm text-stone">{placedOrder.delivery_country}</p>
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={14} className="text-stone" />
                      <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Delivery</span>
                    </div>
                    <p className="text-sm text-charcoal-deep capitalize">{placedOrder.delivery_method} delivery</p>
                    <p className="text-xs text-stone mt-1">Estimated 3-5 business days</p>
                  </div>
                </div>
              </div>

              {/* Invoice Section */}
              <div className="bg-parchment border border-sand/50 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-1">Invoice</p>
                    <p className="text-sm text-charcoal-deep">{generateInvoiceNumber(placedOrder.order_id, placedOrder.order_date)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.1em] uppercase"
                  >
                    <FileText size={16} />
                    View Invoice
                  </button>
                  <button
                    onClick={() => {
                      printInvoice();
                      showToast("Use 'Save as PDF' in the print dialog", 'info');
                    }}
                    className="flex items-center gap-2 px-5 py-3 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-colors text-sm tracking-[0.1em] uppercase"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => showToast(`Invoice sent to ${placedOrder.customer_email}`, 'success')}
                    className="flex items-center gap-2 px-5 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.1em] uppercase"
                  >
                    <Mail size={16} />
                    Email Copy
                  </button>
                </div>
              </div>

              {/* Authenticity Note */}
              <div className="p-6 bg-parchment border-l-2 border-gold-muted mb-10">
                <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-3">Authenticity Guaranteed</p>
                <p className="text-sm text-stone">
                  Your pieces come with digital certificates of authenticity and provenance. Access them anytime in your profile.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/profile/orders/${placedOrder.order_id}`}
                  className="py-4 px-8 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase text-center hover:bg-charcoal-warm transition-colors"
                >
                  View Order Details
                </Link>
                <Link
                  href="/discover"
                  className="py-4 px-8 border border-charcoal-deep text-charcoal-deep text-sm tracking-[0.15em] uppercase text-center hover:bg-charcoal-deep hover:text-ivory-cream transition-colors"
                >
                  Continue Exploring
                </Link>
              </div>
            </div>
          ) : (
            /* ============================================
               REVIEW & ORDER PAGE (single step)
               ============================================ */
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              <div className="lg:col-span-2 space-y-10">
                {/* Customer Info (auto-filled from profile) */}
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">Customer</span>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-6">Your Details</h2>

                  <div className="bg-white p-6 border border-sand/50">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Name</p>
                        <p className="text-charcoal-deep">{userName || 'Guest'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Email</p>
                        <p className="text-charcoal-deep">{userEmail || '—'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 bg-ivory-cream border border-sand focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">Delivery</span>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-6">Shipping Address</h2>

                  {/* Saved Addresses */}
                  {addressesLoading && (
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="p-4 border border-sand animate-pulse">
                          <div className="h-4 bg-sand/30 rounded w-20 mb-2" />
                          <div className="h-3 bg-sand/20 rounded w-48" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!addressesLoading && !useNewAddress && savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      {savedAddresses.map(addr => (
                        <button
                          key={addr.address_id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.address_id)}
                          className={`w-full text-left p-5 border transition-colors flex items-start gap-4 ${
                            selectedAddressId === addr.address_id
                              ? 'border-charcoal-deep bg-parchment'
                              : 'border-sand hover:border-charcoal-deep/50'
                          }`}
                        >
                          <MapPin size={18} className="text-stone mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-charcoal-deep">{addr.tag}</p>
                            <p className="text-sm text-stone">{addr.address}</p>
                            <p className="text-sm text-stone">{addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}, {addr.country}</p>
                          </div>
                          {selectedAddressId === addr.address_id && (
                            <div className="w-6 h-6 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
                              <Check size={14} className="text-ivory-cream" />
                            </div>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(true)}
                        className="w-full text-left p-4 border-2 border-dashed border-sand hover:border-charcoal-deep transition-colors flex items-center gap-3 text-stone hover:text-charcoal-deep"
                      >
                        <Plus size={16} />
                        <span className="text-sm">Add a new address</span>
                      </button>
                    </div>
                  )}

                  {/* New Address Form with Geo-cascading */}
                  {!addressesLoading && useNewAddress && (
                    <div className="bg-white p-6 border border-sand/50 space-y-5">
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setUseNewAddress(false); setSelectedAddressId(savedAddresses[0].address_id); }}
                          className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors tracking-[0.1em] uppercase"
                        >
                          ← Use saved address
                        </button>
                      )}

                      {/* Tag */}
                      <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Label</label>
                        <div className="flex flex-wrap gap-2">
                          {['Home', 'Office', 'Work', 'Other'].map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setNewAddress(prev => ({ ...prev, tag }))}
                              className={`px-4 py-2 border text-sm transition-colors ${
                                newAddress.tag === tag
                                  ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                                  : 'border-sand text-stone hover:border-charcoal-deep'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Street Address */}
                      <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Street Address *</label>
                        <input
                          type="text"
                          value={newAddress.address}
                          onChange={e => { setNewAddress(prev => ({ ...prev, address: e.target.value })); setAddressErrors(prev => ({ ...prev, address: '' })); }}
                          placeholder="Apartment, suite, street"
                          className={`w-full px-4 py-3 border bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors ${addressErrors.address ? 'border-error' : 'border-sand'}`}
                        />
                        {addressErrors.address && <p className="text-error text-xs mt-1">{addressErrors.address}</p>}
                      </div>

                      {/* Country Dropdown */}
                      <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Country *</label>
                        <div className="relative">
                          <select
                            value={newAddress.country}
                            onChange={e => setNewAddress(prev => ({ ...prev, country: e.target.value, state: '', city: '' }))}
                            className={selectClasses(!!addressErrors.country)}
                            disabled={countriesLoading}
                          >
                            <option value="">{countriesLoading ? 'Loading countries...' : 'Select country'}</option>
                            {countryList.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                          {countriesLoading
                            ? <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone animate-spin pointer-events-none" />
                            : <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone pointer-events-none" />
                          }
                        </div>
                        {addressErrors.country && <p className="text-error text-xs mt-1">{addressErrors.country}</p>}
                      </div>

                      {/* State Dropdown (appears after country) */}
                      {newAddress.country && (
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">State / Region *</label>
                          <div className="relative">
                            <select
                              value={newAddress.state}
                              onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value, city: '' }))}
                              className={selectClasses(!!addressErrors.state)}
                              disabled={statesLoading}
                            >
                              <option value="">{statesLoading ? 'Loading states...' : 'Select state'}</option>
                              {stateList.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                            {statesLoading
                              ? <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone animate-spin pointer-events-none" />
                              : <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone pointer-events-none" />
                            }
                          </div>
                          {addressErrors.state && <p className="text-error text-xs mt-1">{addressErrors.state}</p>}
                        </div>
                      )}

                      {/* City Dropdown (appears after state) */}
                      {newAddress.state && (
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">City *</label>
                          <div className="relative">
                            <select
                              value={newAddress.city}
                              onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              className={selectClasses(!!addressErrors.city)}
                              disabled={citiesLoading}
                            >
                              <option value="">{citiesLoading ? 'Loading cities...' : 'Select city'}</option>
                              {cityList.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            {citiesLoading
                              ? <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone animate-spin pointer-events-none" />
                              : <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone pointer-events-none" />
                            }
                          </div>
                          {addressErrors.city && <p className="text-error text-xs mt-1">{addressErrors.city}</p>}
                        </div>
                      )}

                      {/* Postal Code */}
                      <div>
                        <label className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={newAddress.postalCode}
                          onChange={e => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="e.g. 10001"
                          className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Method */}
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">Shipping</span>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-6">Delivery Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'standard', label: 'Standard Delivery', desc: '3-5 business days', price: 'Free' },
                      { id: 'express', label: 'Express Delivery', desc: '1-2 business days', price: formatPrice(15) },
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setDeliveryMethod(method.id)}
                        className={`w-full text-left p-5 border transition-colors flex items-center justify-between ${
                          deliveryMethod === method.id
                            ? 'border-charcoal-deep bg-parchment'
                            : 'border-sand hover:border-charcoal-deep/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Truck size={18} className="text-stone" />
                          <div>
                            <p className="text-sm font-medium text-charcoal-deep">{method.label}</p>
                            <p className="text-xs text-stone">{method.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${method.price === 'Free' ? 'text-success' : 'text-charcoal-deep'}`}>{method.price}</span>
                          {deliveryMethod === method.id && (
                            <div className="w-5 h-5 bg-charcoal-deep flex items-center justify-center">
                              <Check size={12} className="text-ivory-cream" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment (Demo) */}
                <div>
                  <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">Payment</span>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-6">Payment Method</h2>
                  <div className="bg-white p-6 border border-sand/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-charcoal-deep to-charcoal-warm rounded flex items-center justify-center">
                        <CreditCard size={16} className="text-ivory-cream" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-deep">Demo Card •••• 4242</p>
                        <p className="text-xs text-stone">Exp: 12/28</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-taupe">
                      <Shield size={14} />
                      <span>Demo mode — no real payment will be processed</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleCompletePurchase}
                  disabled={isPlacingOrder}
                  className="w-full py-5 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-noir disabled:opacity-50"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm tracking-[0.15em] uppercase">Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm tracking-[0.15em] uppercase">Complete Purchase — {formatPrice(total)}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 bg-charcoal-deep p-8">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-6">Order Summary</span>

                  <div className="space-y-4 border-b border-ivory-cream/10 pb-6 mb-6">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-20 overflow-hidden flex-shrink-0">
                          <Image src={item.product.images[0]?.url || ''} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] tracking-[0.2em] uppercase text-taupe mb-1">{item.product.brandName}</p>
                          <p className="text-sm text-ivory-cream mb-1">{item.product.name}</p>
                          <p className="text-sm text-ivory-cream">{formatPrice(item.product.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-b border-ivory-cream/10 pb-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Subtotal</span>
                      <span className="text-ivory-cream">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Shipping</span>
                      <span className="text-gold-soft">{deliveryMethod === 'express' ? formatPrice(15) : 'Complimentary'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-8">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Total</span>
                    <span className="font-display text-3xl text-ivory-cream">{formatPrice(total + (deliveryMethod === 'express' ? 15 : 0))}</span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-ivory-cream/10">
                    <div className="flex items-center gap-3 text-xs text-taupe">
                      <Truck size={14} className="text-gold-soft/60" />
                      <span>{deliveryMethod === 'express' ? '1-2 business days' : '3-5 business days'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-taupe">
                      <Check size={14} className="text-gold-soft/60" />
                      <span>Authenticity guaranteed</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-taupe">
                      <Check size={14} className="text-gold-soft/60" />
                      <span>Free returns within 30 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Invoice Modal */}
      {showInvoice && placedOrder && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowInvoice(false)}>
          <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Invoice</h3>
              <button onClick={() => setShowInvoice(false)} className="p-2 hover:bg-sand/20 transition-colors text-stone">
                ✕
              </button>
            </div>

            <InvoiceDocument
              invoiceNumber={generateInvoiceNumber(placedOrder.order_id, placedOrder.order_date)}
              invoiceDate={placedOrder.order_date}
              orderType="standard"
              brandName="ModaGlimmora"
              buyerName={placedOrder.customer_name}
              buyerEmail={placedOrder.customer_email}
              buyerAddress={`${placedOrder.delivery_address}, ${placedOrder.delivery_city}, ${placedOrder.delivery_country}`}
              items={placedOrder.products.map(p => ({
                description: p.product_name,
                detail: [p.size ? `Size: ${p.size}` : '', p.color ? `Color: ${p.color}` : ''].filter(Boolean).join(' · '),
                quantity: p.quantity,
                unitPrice: p.product_price,
                currency: placedOrder.payment_currency || 'USD',
              }))}
              subtotal={placedOrder.payment_amount - placedOrder.payment_tax - placedOrder.payment_shipping}
              shippingAmount={placedOrder.payment_shipping}
              taxRate={placedOrder.payment_tax > 0 ? 0.20 : 0}
              taxAmount={placedOrder.payment_tax}
              total={placedOrder.payment_amount}
              currency={placedOrder.payment_currency || 'USD'}
              paymentStatus="paid"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={printInvoice}
                className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={() => {
                  printInvoice();
                  showToast("Use 'Save as PDF' in the print dialog", 'info');
                }}
                className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
