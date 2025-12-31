'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Shield, Truck, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ConsiderationItem } from '@/types';

type Step = 'details' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { considerations, clearConsiderations, addOrder, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [orderId, setOrderId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<ConsiderationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (considerations.length === 0 && currentStep !== 'confirmation' && !orderId) {
      router.push('/consideration');
    }
  }, [considerations, currentStep, orderId, router]);

  const total = (currentStep === 'confirmation' ? orderItems : considerations)
    .reduce((sum, item) => sum + item.product.price, 0);

  const displayItems = currentStep === 'confirmation' ? orderItems : considerations;

  const steps = [
    { id: 'details', label: 'Details', number: '01' },
    { id: 'payment', label: 'Payment', number: '02' },
    { id: 'confirmation', label: 'Complete', number: '03' }
  ];

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'firstName':
        if (!value) return 'First name is required';
        return '';
      case 'lastName':
        if (!value) return 'Last name is required';
        return '';
      case 'address':
        if (!value) return 'Address is required';
        return '';
      case 'city':
        if (!value) return 'City is required';
        return '';
      case 'postalCode':
        if (!value) return 'Postal code is required';
        return '';
      case 'country':
        if (!value) return 'Country is required';
        return '';
      case 'phone':
        if (!value) return 'Phone is required';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 'details') {
      if (!validateForm()) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setOrderItems([...considerations]);
      const newOrderId = addOrder(considerations, total);
      setOrderId(newOrderId);
      clearConsiderations();
      showToast('Order placed successfully', 'success');
      setCurrentStep('confirmation');
    }
  };

  const inputClasses = (fieldName: string) => `
    w-full px-4 py-4 bg-transparent border text-charcoal-deep placeholder:text-taupe
    focus:outline-none focus:border-charcoal-deep transition-colors
    ${errors[fieldName] && touched[fieldName] ? 'border-error' : 'border-sand'}
  `;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HEADER - Progress Steps
          ============================================ */}
      <section className="border-b border-sand/50 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-8">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {/* Title */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-taupe" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Secure Checkout</span>
              </div>
              <Link
                href="/consideration"
                className="text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
              >
                Return to Cart
              </Link>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const stepIndex = steps.findIndex(s => s.id === currentStep);
                const isActive = currentStep === step.id;
                const isComplete = stepIndex > index;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center border transition-all ${
                        isActive ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream' :
                        isComplete ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream' :
                        'border-sand text-taupe'
                      }`}>
                        {isComplete ? <Check size={16} /> : <span className="text-xs">{step.number}</span>}
                      </div>
                      <span className={`hidden sm:block text-sm ${isActive ? 'text-charcoal-deep' : 'text-taupe'}`}>
                        {step.label}
                      </span>
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

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {currentStep === 'confirmation' ? (
            /* Confirmation */
            <div className="max-w-2xl mx-auto">
              <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-20 h-20 bg-charcoal-deep flex items-center justify-center mx-auto mb-8">
                  <Check size={32} className="text-ivory-cream" />
                </div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-4">
                  Order Confirmed
                </span>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] mb-4">
                  Thank You
                </h1>
                <p className="text-stone">
                  Order #{orderId} has been confirmed. You will receive an email confirmation shortly.
                </p>
              </div>

              {/* Order Summary */}
              <div className="border border-sand/50 p-8 mb-8">
                <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block mb-6">
                  Order Summary
                </span>
                <div className="space-y-6">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 pb-6 border-b border-sand/50 last:border-0 last:pb-0">
                      <div className="relative w-20 h-24 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">{item.product.brandName}</p>
                        <p className="font-display text-lg text-charcoal-deep">{item.product.name}</p>
                      </div>
                      <p className="font-display text-lg text-charcoal-deep">€{item.product.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-6 mt-6 border-t border-sand/50">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Total</span>
                  <span className="font-display text-2xl text-charcoal-deep">€{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Authenticity Note */}
              <div className="p-6 bg-parchment border-l-2 border-gold-muted mb-12">
                <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-3">Authenticity Guaranteed</p>
                <p className="text-sm text-stone">
                  Your pieces come with digital certificates of authenticity and provenance.
                  Access them anytime in your profile.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/profile/orders"
                  className="py-4 px-8 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase text-center hover:bg-charcoal-warm transition-colors"
                >
                  View Order Status
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
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  {currentStep === 'details' && (
                    <div>
                      <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-4">
                        Step 1 of 2
                      </span>
                      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-10">
                        Delivery Details
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={inputClasses('email')}
                            required
                          />
                          {errors.email && touched.email && (
                            <p className="text-error text-xs mt-2">{errors.email}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">First Name</label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={inputClasses('firstName')}
                              required
                            />
                            {errors.firstName && touched.firstName && (
                              <p className="text-error text-xs mt-2">{errors.firstName}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Last Name</label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={inputClasses('lastName')}
                              required
                            />
                            {errors.lastName && touched.lastName && (
                              <p className="text-error text-xs mt-2">{errors.lastName}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={inputClasses('address')}
                            required
                          />
                          {errors.address && touched.address && (
                            <p className="text-error text-xs mt-2">{errors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">City</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={inputClasses('city')}
                              required
                            />
                            {errors.city && touched.city && (
                              <p className="text-error text-xs mt-2">{errors.city}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Postal Code</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={inputClasses('postalCode')}
                              required
                            />
                            {errors.postalCode && touched.postalCode && (
                              <p className="text-error text-xs mt-2">{errors.postalCode}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={inputClasses('country')}
                            required
                          />
                          {errors.country && touched.country && (
                            <p className="text-error text-xs mt-2">{errors.country}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={inputClasses('phone')}
                            required
                          />
                          {errors.phone && touched.phone && (
                            <p className="text-error text-xs mt-2">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-10 py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-warm"
                      >
                        <span className="text-sm tracking-[0.15em] uppercase">Continue to Payment</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {currentStep === 'payment' && (
                    <div>
                      <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-4">
                        Step 2 of 2
                      </span>
                      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-10">
                        Payment
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-4 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full px-4 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] tracking-[0.3em] uppercase text-taupe block mb-3">Name on Card</label>
                          <input
                            type="text"
                            className="w-full px-4 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-8 text-sm text-taupe">
                        <Shield size={16} />
                        <span>Your payment information is encrypted and secure</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-10 py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-warm"
                      >
                        <span className="text-sm tracking-[0.15em] uppercase">Complete Purchase</span>
                        <Lock size={16} />
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 bg-charcoal-deep p-8">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-6">
                    Order Summary
                  </span>

                  <div className="space-y-4 border-b border-ivory-cream/10 pb-6 mb-6">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-20 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0]?.url || ''}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] tracking-[0.2em] uppercase text-taupe mb-1">{item.product.brandName}</p>
                          <p className="text-sm text-ivory-cream mb-1">{item.product.name}</p>
                          <p className="text-sm text-ivory-cream">€{item.product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-b border-ivory-cream/10 pb-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Subtotal</span>
                      <span className="text-ivory-cream">€{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-taupe">Shipping</span>
                      <span className="text-gold-soft">Complimentary</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-8">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Total</span>
                    <span className="font-display text-3xl text-ivory-cream">€{total.toLocaleString()}</span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-ivory-cream/10">
                    <div className="flex items-center gap-3 text-xs text-taupe">
                      <Truck size={14} className="text-gold-soft/60" />
                      <span>Estimated delivery: 3-5 business days</span>
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
    </div>
  );
}
