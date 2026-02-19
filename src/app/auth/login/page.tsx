'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Crown, ShoppingBag, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { brandLogin } from '@/services/auth.service';

type DemoTier = 'consumer' | 'uhni' | 'brand';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode');
  const { showToast, setUserRole: setAppUserRole } = useApp();
  const { setUserRole: setAuthUserRole } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTier, setSelectedTier] = useState<DemoTier>(
    initialMode === 'brand' ? 'brand' : 'consumer'
  );
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    if (selectedTier === 'brand') {
      // Real brand partner login via API
      try {
        const data = await brandLogin({
          email: formData.email,
          password: formData.password,
        });

        // Store tokens and brand data for persistent login
        localStorage.setItem('moda-brand-token', data.access_token);
        localStorage.setItem('moda-brand-refresh-token', data.refresh_token);
        localStorage.setItem('moda-brand-data', JSON.stringify(data.brand));

        showToast('Welcome to the Brand Portal.', 'success');
        router.push('/brand');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setLoginError(message);
        showToast(message, 'error');
        setIsSubmitting(false);
      }
    } else {
      // Consumer/UHNI login (demo mode)
      await new Promise(resolve => setTimeout(resolve, 500));

      const tier = selectedTier === 'uhni' ? 'uhni' : 'preferred';
      setAuthUserRole(tier);
      setAppUserRole(tier);

      if (selectedTier === 'uhni') {
        showToast('Welcome back. Your personal concierge is available.', 'success');
      } else {
        showToast('Welcome back to ModaGlimmora!', 'success');
      }

      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-cream flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal-deep relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/90 to-charcoal-deep/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md px-12 text-center">
            <Link href="/" className="inline-block mb-8">
              <h2 className="font-display text-3xl tracking-[0.15em] uppercase text-ivory-cream hover:text-gold-soft transition-colors">
                ModaGlimmora
              </h2>
            </Link>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gold-soft mb-6">
              {selectedTier === 'brand' ? 'Brand Partner Portal' : 'Experience-First Luxury Commerce'}
            </p>
            <p className="text-sand leading-relaxed mb-10">
              {selectedTier === 'brand'
                ? 'Manage your products, track performance, and access demand intelligence through our B2B platform.'
                : 'The world\'s first AGI-native fashion universe. Where intelligence meets elegance, and every interaction is crafted for distinction.'}
            </p>
            <div className="flex items-center justify-center gap-8 text-taupe text-sm">
              {selectedTier === 'brand' ? (
                <>
                  <span>Real-time Analytics</span>
                  <span className="w-1 h-1 bg-gold-soft/50 rounded-full" />
                  <span>Global Inventory</span>
                  <span className="w-1 h-1 bg-gold-soft/50 rounded-full" />
                  <span>Demand Signals</span>
                </>
              ) : (
                <>
                  <span>Curated Excellence</span>
                  <span className="w-1 h-1 bg-gold-soft/50 rounded-full" />
                  <span>Zero Dark Patterns</span>
                  <span className="w-1 h-1 bg-gold-soft/50 rounded-full" />
                  <span>Privacy First</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16">
        <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <h1 className="font-display text-2xl tracking-[0.15em] uppercase text-charcoal-deep">
                ModaGlimmora
              </h1>
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-4">
              {selectedTier === 'brand' ? 'Brand Portal' : 'Welcome Back'}
            </h1>
            <p className="text-stone">
              {selectedTier === 'brand'
                ? 'Sign in to manage your brand on ModaGlimmora'
                : 'Sign in to your personalized fashion experience'}
            </p>
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
                placeholder={selectedTier === 'brand' ? 'partner@brand.com' : 'your@email.com'}
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

            {/* Login Error */}
            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                {loginError}
              </div>
            )}

            {/* Demo Mode Tier Selector */}
            <div className="p-4 bg-parchment/50 border border-sand/50">
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-4">
                Demo Mode — Select Experience
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTier('consumer')}
                  className={`p-4 border transition-all duration-300 ${
                    selectedTier === 'consumer'
                      ? 'border-charcoal-deep bg-white'
                      : 'border-sand/50 hover:border-sand'
                  }`}
                >
                  <ShoppingBag size={20} className={`mx-auto mb-2 ${selectedTier === 'consumer' ? 'text-charcoal-deep' : 'text-stone'}`} />
                  <p className={`text-sm font-medium ${selectedTier === 'consumer' ? 'text-charcoal-deep' : 'text-stone'}`}>
                    Consumer
                  </p>
                  <p className="text-[10px] text-taupe mt-1">Standard</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier('uhni')}
                  className={`p-4 border transition-all duration-300 ${
                    selectedTier === 'uhni'
                      ? 'border-gold-deep bg-gold-soft/10'
                      : 'border-sand/50 hover:border-gold-muted/50'
                  }`}
                >
                  <Crown size={20} className={`mx-auto mb-2 ${selectedTier === 'uhni' ? 'text-gold-deep' : 'text-stone'}`} />
                  <p className={`text-sm font-medium ${selectedTier === 'uhni' ? 'text-gold-deep' : 'text-stone'}`}>
                    UHNI
                  </p>
                  <p className="text-[10px] text-taupe mt-1">Exclusive</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier('brand')}
                  className={`p-4 border transition-all duration-300 ${
                    selectedTier === 'brand'
                      ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                      : 'border-sand/50 hover:border-sand'
                  }`}
                >
                  <Building2 size={20} className={`mx-auto mb-2 ${selectedTier === 'brand' ? 'text-ivory-cream' : 'text-stone'}`} />
                  <p className={`text-sm font-medium ${selectedTier === 'brand' ? 'text-ivory-cream' : 'text-stone'}`}>
                    Brand
                  </p>
                  <p className={`text-[10px] mt-1 ${selectedTier === 'brand' ? 'text-sand' : 'text-taupe'}`}>Partner</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
                selectedTier === 'uhni'
                  ? 'bg-gold-deep text-white hover:bg-gold-deep/90'
                  : selectedTier === 'brand'
                  ? 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
                  : 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    selectedTier === 'uhni' ? 'border-white' : 'border-ivory-cream'
                  }`} />
                  <span className="text-sm tracking-[0.15em] uppercase">
                    {selectedTier === 'brand' ? 'Accessing Portal...' : 'Signing In...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase">
                    {selectedTier === 'brand' ? 'Access Portal' : 'Sign In'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Demo hint */}
            <p className="text-center text-taupe text-xs">
              {selectedTier === 'brand'
                ? 'Demo mode: Access the Dior brand partner dashboard'
                : 'Demo mode: Use any email and password to explore'}
            </p>
          </form>

          <p className="text-center text-stone mt-10">
            {selectedTier === 'brand' ? (
              <>
                Not a brand partner?{' '}
                <button
                  onClick={() => setSelectedTier('consumer')}
                  className="text-charcoal-deep hover:text-gold-muted font-medium transition-colors"
                >
                  Shop as customer
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-charcoal-deep hover:text-gold-muted font-medium transition-colors">
                  Create account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
