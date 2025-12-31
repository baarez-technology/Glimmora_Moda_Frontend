'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ConsumerLoginPage() {
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

    setUserRole('standard');
    showToast('Welcome to Glimmora!', 'success');
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-ivory-cream flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal-deep relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md px-12 text-center">
            <div className="w-16 h-16 mx-auto mb-8 bg-ivory-cream/10 flex items-center justify-center">
              <ShoppingBag size={32} className="text-ivory-cream" />
            </div>
            <span className="text-[10px] tracking-[0.5em] uppercase text-sand block mb-6">
              Consumer Experience
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
              Discover Exceptional Fashion
            </h2>
            <p className="text-taupe leading-relaxed">
              Explore curated collections from distinguished maisons. Build your digital wardrobe,
              get personalized recommendations, and experience fashion thoughtfully.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16">
        <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-parchment mb-6">
              <ShoppingBag size={16} className="text-charcoal-deep" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep">Consumer</span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-4">
              Welcome Back
            </h1>
            <p className="text-stone">Sign in to your consumer account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 hover:bg-noir transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm tracking-[0.15em] uppercase">Signing In...</span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase">Sign In as Consumer</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-sand">
            <p className="text-center text-stone mb-6">Not a consumer?</p>
            <Link
              href="/auth/login/uhni"
              className="block w-full py-4 px-6 border border-gold-muted text-gold-muted text-center hover:bg-gold-muted hover:text-charcoal-deep transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Sign In as UHNI</span>
            </Link>
          </div>

          <p className="text-center text-stone mt-10">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-charcoal-deep hover:text-gold-muted font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
