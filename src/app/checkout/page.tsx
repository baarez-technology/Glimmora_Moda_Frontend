'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Lock, Shield, Truck, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ConsiderationItem } from '@/types';

type Step = 'details' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { considerations, clearConsiderations, addOrder, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [orderId, setOrderId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<ConsiderationItem[]>([]);
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

  // Redirect if no items in cart (but not on confirmation step)
  useEffect(() => {
    if (considerations.length === 0 && currentStep !== 'confirmation' && !orderId) {
      router.push('/consideration');
    }
  }, [considerations, currentStep, orderId, router]);

  const total = (currentStep === 'confirmation' ? orderItems : considerations)
    .reduce((sum, item) => sum + item.product.price, 0);

  const displayItems = currentStep === 'confirmation' ? orderItems : considerations;

  const steps = [
    { id: 'details', label: 'Delivery Details' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmation', label: 'Confirmation' }
  ];

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'firstName':
        if (!value) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      case 'lastName':
        if (!value) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
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
        if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value)) return 'Please enter a valid phone number';
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
    // Clear error when user starts typing
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
      // Validate form before proceeding
      if (!validateForm()) {
        showToast('Please fill in all required fields correctly', 'error');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Store items before clearing
      setOrderItems([...considerations]);
      // Create order and get order ID
      const newOrderId = addOrder(considerations, total);
      setOrderId(newOrderId);
      // Clear the cart
      clearConsiderations();
      // Show success toast
      showToast('Order placed successfully!', 'success');
      // Move to confirmation
      setCurrentStep('confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="border-b border-sand">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/consideration"
              className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 className="font-display text-2xl text-charcoal-deep">Secure Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-stone">
              <Lock size={14} />
              <span>Secure</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep === step.id ? 'text-charcoal-deep' :
                  steps.findIndex(s => s.id === currentStep) > index ? 'text-success' : 'text-greige'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    currentStep === step.id ? 'bg-charcoal-deep text-ivory-cream' :
                    steps.findIndex(s => s.id === currentStep) > index ? 'bg-success text-ivory-cream' : 'bg-sand/50'
                  }`}>
                    {steps.findIndex(s => s.id === currentStep) > index ? <Check size={16} /> : index + 1}
                  </div>
                  <span className="hidden sm:inline text-sm">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-sand mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {currentStep === 'confirmation' ? (
          /* Confirmation */
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-8">
              <Check size={40} className="text-ivory-cream" />
            </div>
            <h2 className="font-display text-3xl text-charcoal-deep mb-4">
              Thank You for Your Order
            </h2>
            <p className="text-stone mb-8">
              Order #{orderId} has been confirmed. You will receive an email confirmation shortly.
            </p>

            <div className="bg-white rounded-xl p-6 mb-8">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Order Summary</h3>
              <div className="space-y-4">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-charcoal-deep">{item.product.name}</p>
                      <p className="text-sm text-greige">{item.product.brandName}</p>
                    </div>
                    <p className="text-charcoal-deep">€{item.product.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-sand mt-6 pt-6 flex justify-between">
                <span className="font-medium text-charcoal-deep">Total</span>
                <span className="font-display text-xl text-charcoal-deep">€{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-parchment rounded-xl p-6 mb-8">
              <h3 className="font-display text-lg text-charcoal-deep mb-2">Digital Fashion Passport</h3>
              <p className="text-sm text-stone">
                Your pieces come with digital certificates of authenticity and provenance.
                Access them anytime in your profile.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile/orders" className="btn-primary">
                View Order Status
              </Link>
              <Link href="/" className="btn-secondary">
                Continue Exploring
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {currentStep === 'details' && (
                  <div className="bg-white rounded-xl p-8">
                    <h2 className="font-display text-xl text-charcoal-deep mb-6">Delivery Details</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-deep mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`input-luxury ${errors.email && touched.email ? 'border-error' : ''}`}
                          required
                        />
                        {errors.email && touched.email && (
                          <p className="text-error text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal-deep mb-2">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`input-luxury ${errors.firstName && touched.firstName ? 'border-error' : ''}`}
                            required
                          />
                          {errors.firstName && touched.firstName && (
                            <p className="text-error text-sm mt-1">{errors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal-deep mb-2">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`input-luxury ${errors.lastName && touched.lastName ? 'border-error' : ''}`}
                            required
                          />
                          {errors.lastName && touched.lastName && (
                            <p className="text-error text-sm mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-deep mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`input-luxury ${errors.address && touched.address ? 'border-error' : ''}`}
                          required
                        />
                        {errors.address && touched.address && (
                          <p className="text-error text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal-deep mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`input-luxury ${errors.city && touched.city ? 'border-error' : ''}`}
                            required
                          />
                          {errors.city && touched.city && (
                            <p className="text-error text-sm mt-1">{errors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal-deep mb-2">Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`input-luxury ${errors.postalCode && touched.postalCode ? 'border-error' : ''}`}
                            required
                          />
                          {errors.postalCode && touched.postalCode && (
                            <p className="text-error text-sm mt-1">{errors.postalCode}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-deep mb-2">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`input-luxury ${errors.country && touched.country ? 'border-error' : ''}`}
                          required
                        />
                        {errors.country && touched.country && (
                          <p className="text-error text-sm mt-1">{errors.country}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-deep mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`input-luxury ${errors.phone && touched.phone ? 'border-error' : ''}`}
                          required
                        />
                        {errors.phone && touched.phone && (
                          <p className="text-error text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-8 justify-center">
                      Continue to Payment
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {currentStep === 'payment' && (
                  <div className="bg-white rounded-xl p-8">
                    <h2 className="font-display text-xl text-charcoal-deep mb-6">Payment</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-deep mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="input-luxury"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal-deep mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="input-luxury"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal-deep mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="input-luxury"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-deep mb-2">Name on Card</label>
                        <input
                          type="text"
                          className="input-luxury"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 text-sm text-stone">
                      <Shield size={16} />
                      <span>Your payment information is encrypted and secure</span>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-8 justify-center">
                      Complete Purchase
                      <Lock size={18} />
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 sticky top-32">
                <h3 className="font-display text-lg text-charcoal-deep mb-6">Order Summary</h3>

                <div className="space-y-4 border-b border-sand pb-6">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal-deep">{item.product.name}</p>
                        <p className="text-xs text-greige">{item.product.brandName}</p>
                        <p className="text-sm text-charcoal-deep mt-1">€{item.product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="py-4 border-b border-sand space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Subtotal</span>
                    <span className="text-charcoal-deep">€{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Shipping</span>
                    <span className="text-charcoal-deep">Complimentary</span>
                  </div>
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-medium text-charcoal-deep">Total</span>
                  <span className="font-display text-xl text-charcoal-deep">€{total.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-stone">
                  <Truck size={14} />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
