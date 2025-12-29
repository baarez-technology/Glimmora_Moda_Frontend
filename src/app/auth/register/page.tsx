'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Sparkles, Check } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/onboarding';
  };

  const benefits = [
    'Personalized recommendations powered by Fashion Intelligence',
    'Digital Wardrobe to track your collection',
    'Exclusive access to brand stories and heritage',
    'Never-out-of-stock availability insights'
  ];

  return (
    <div className="min-h-screen bg-ivory-cream flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal-deep relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md px-8">
            <Sparkles className="w-12 h-12 mb-6 text-gold-soft" />
            <h2 className="font-display text-3xl text-ivory-cream mb-4">
              Join the World's First AGI-Native Fashion Universe
            </h2>
            <p className="text-taupe mb-8">
              Experience luxury through intelligence, not transaction.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold-muted/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-gold-soft" />
                  </div>
                  <span className="text-sand text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl text-charcoal-deep mb-3">Create Your Account</h1>
            <p className="text-stone">Begin your fashion intelligence journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-deep mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-luxury"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-deep mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-luxury"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-deep mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-luxury"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-deep mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-luxury pr-12"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-greige hover:text-charcoal-deep"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-greige mt-2">At least 8 characters</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-gold-muted mt-1" required />
              <span className="text-sm text-stone">
                I agree to the{' '}
                <Link href="/terms" className="text-gold-muted hover:text-gold-deep">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-gold-muted hover:text-gold-deep">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="btn-primary w-full justify-center">
              Create Account
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-ivory-cream text-greige">or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="btn-secondary justify-center">
              Google
            </button>
            <button className="btn-secondary justify-center">
              Apple
            </button>
          </div>

          <p className="text-center text-stone mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold-muted hover:text-gold-deep font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
