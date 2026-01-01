'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Building2, BarChart3, Package, Gem, Bot } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandLoginPage() {
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

    setUserRole('brand');
    showToast('Welcome to Maison Lumière Partner Portal', 'success');
    router.push('/brand');
  };

  const brandFeatures = [
    { icon: BarChart3, label: 'Demand Intelligence', description: 'Real-time market signals' },
    { icon: Package, label: 'Product Management', description: 'Inventory & availability' },
    { icon: Gem, label: 'Bespoke Requests', description: 'UHNI client commissions' },
    { icon: Bot, label: 'AGI Configuration', description: 'Brand Concierge settings' },
  ];

  return (
    <div className="min-h-screen bg-charcoal-deep flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/90 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-lg px-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-ivory-cream/10 flex items-center justify-center">
                <Building2 size={24} className="text-ivory-cream" />
              </div>
              <span className="text-[10px] tracking-[0.5em] uppercase text-sand">
                Brand Partner Portal
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
              Intelligence-Driven Commerce
            </h2>
            <p className="text-sand leading-relaxed mb-10">
              Access your brand's intelligence dashboard. Monitor demand signals, manage product availability,
              respond to bespoke requests, and configure your AGI Concierge.
            </p>

            <div className="space-y-4">
              {brandFeatures.map((feature) => (
                <div key={feature.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ivory-cream/5 border border-ivory-cream/10 flex items-center justify-center">
                    <feature.icon size={18} className="text-sand" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ivory-cream/5 border border-ivory-cream/10 mb-6">
              <Building2 size={16} className="text-ivory-cream" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-ivory-cream">Brand Partner</span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-4">
              Partner Portal
            </h1>
            <p className="text-taupe">Sign in to your brand intelligence dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-sand/70 mb-3">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-charcoal-deep border border-sand/30 text-ivory-cream placeholder:text-taupe focus:outline-none focus:border-ivory-cream transition-colors"
                placeholder="partner@maison.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-sand/70 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 pr-14 bg-charcoal-deep border border-sand/30 text-ivory-cream placeholder:text-taupe focus:outline-none focus:border-ivory-cream transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-taupe hover:text-ivory-cream transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-ivory-cream text-charcoal-deep flex items-center justify-center gap-3 hover:bg-ivory-cream/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">Accessing Portal...</span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">Access Partner Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-sand/20">
            <p className="text-center text-taupe mb-6">Not a brand partner?</p>
            <div className="space-y-3">
              <Link
                href="/auth/login/uhni"
                className="block w-full py-3 px-6 border border-gold-soft/30 text-gold-soft text-center hover:border-gold-soft hover:bg-gold-soft/5 transition-all duration-300"
              >
                <span className="text-sm tracking-[0.15em] uppercase">Sign In as UHNI</span>
              </Link>
              <Link
                href="/auth/login/consumer"
                className="block w-full py-3 px-6 border border-sand/30 text-sand text-center hover:border-sand hover:text-ivory-cream transition-all duration-300"
              >
                <span className="text-sm tracking-[0.15em] uppercase">Sign In as Consumer</span>
              </Link>
            </div>
          </div>

          <p className="text-center text-taupe mt-10 text-sm">
            Brand partnerships are by application only.{' '}
            <Link href="/brand/apply" className="text-ivory-cream hover:text-sand transition-colors">
              Apply to join
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
