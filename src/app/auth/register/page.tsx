'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/onboarding';
  };

  const benefits = [
    'Personalized recommendations curated for your style',
    'Digital Wardrobe to organize your collection',
    'Exclusive access to brand stories and heritage',
    'Style calendar with outfit suggestions'
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
          <div className="max-w-md px-12">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
              Join Us
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
              Begin Your Style Journey
            </h2>
            <p className="text-taupe mb-10 leading-relaxed">
              Experience fashion through thoughtful curation and exceptional craftsmanship.
            </p>
            <ul className="space-y-5">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gold-soft/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-gold-soft" />
                  </div>
                  <span className="text-sand text-sm leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16">
        <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Create Account
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-4">
              Join Glimmora
            </h1>
            <p className="text-stone">Begin your personalized style experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 pr-14 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal-deep transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-taupe mt-2">At least 8 characters</p>
            </div>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                agreeTerms
                  ? 'border-charcoal-deep bg-charcoal-deep'
                  : 'border-sand group-hover:border-charcoal-deep'
              }`}>
                {agreeTerms && (
                  <svg className="w-3 h-3 text-ivory-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="sr-only"
                required
              />
              <span className="text-sm text-stone leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-charcoal-deep hover:text-gold-muted transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-charcoal-deep hover:text-gold-muted transition-colors">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Create Account</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-ivory-cream text-[10px] tracking-[0.2em] uppercase text-taupe">
                or sign up with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="py-4 px-6 border border-sand text-charcoal-deep flex items-center justify-center hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300">
              <span className="text-sm tracking-[0.1em] uppercase">Google</span>
            </button>
            <button className="py-4 px-6 border border-sand text-charcoal-deep flex items-center justify-center hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300">
              <span className="text-sm tracking-[0.1em] uppercase">Apple</span>
            </button>
          </div>

          <p className="text-center text-stone mt-10">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-charcoal-deep hover:text-gold-muted font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
