'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Crown, Gem, Zap, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function UHNILoginPage() {
  const router = useRouter();
  const { setUserRole, showToast } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate brief loading for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    setUserRole('uhni');
    showToast('Welcome back. Isabella is available.', 'success');
    router.push('/profile');
  };

  const uhniFeatures = [
    { icon: Crown, label: 'Personal Concierge', description: 'Dedicated fashion advisor' },
    { icon: Zap, label: 'Autonomous Shopping', description: 'Zero-UI commerce' },
    { icon: Search, label: 'Private Sourcing', description: 'Rare & exclusive items' },
    { icon: Gem, label: 'Bespoke Commissions', description: 'Custom creations' },
  ];

  return (
    <div className="min-h-screen bg-charcoal-deep flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/80 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-lg px-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gold-soft/20 flex items-center justify-center">
                <Crown size={24} className="text-gold-soft" />
              </div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft">
                UHNI Exclusive
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
              The Ultimate Fashion Experience
            </h2>
            <p className="text-sand leading-relaxed mb-10">
              Reserved for our most distinguished clients. Enjoy personalized concierge service,
              autonomous shopping, private sourcing, and bespoke commissions.
            </p>

            <div className="space-y-4">
              {uhniFeatures.map((feature) => (
                <div key={feature.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold-soft/10 flex items-center justify-center">
                    <feature.icon size={18} className="text-gold-soft" />
                  </div>
                  <div>
                    <p className="text-ivory-cream font-medium">{feature.label}</p>
                    <p className="text-xs text-taupe">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16 bg-noir">
        <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-soft/10 mb-6">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold-soft">UHNI</span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
              Private Access
            </h1>
            <p className="text-taupe">Sign in to your exclusive account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-gold-soft/70 mb-3">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-charcoal-deep border border-gold-soft/30 text-ivory-cream placeholder:text-taupe focus:outline-none focus:border-gold-soft transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-gold-soft/70 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 pr-14 bg-charcoal-deep border border-gold-soft/30 text-ivory-cream placeholder:text-taupe focus:outline-none focus:border-gold-soft transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-taupe hover:text-gold-soft transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gold-soft text-charcoal-deep flex items-center justify-center gap-3 hover:bg-gold-soft/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">Accessing...</span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">Access UHNI Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-gold-soft/20">
            <p className="text-center text-taupe mb-6">Not a UHNI member?</p>
            <Link
              href="/auth/login/consumer"
              className="block w-full py-4 px-6 border border-sand/30 text-sand text-center hover:border-sand hover:text-ivory-cream transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Sign In as Consumer</span>
            </Link>
          </div>

          <p className="text-center text-taupe mt-10 text-sm">
            UHNI membership is by invitation only.{' '}
            <Link href="/profile/concierge" className="text-gold-soft hover:text-gold-soft/80 transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
