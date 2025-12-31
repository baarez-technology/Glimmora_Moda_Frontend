'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Crown, Gem } from 'lucide-react';

export default function LoginPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-ivory-cream flex">
      {/* Left Side - Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16">
        <div className={`w-full max-w-lg transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Welcome to Glimmora
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-4">
              Sign In
            </h1>
            <p className="text-stone">Select your account type to continue</p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-6">
            {/* Consumer Option */}
            <Link
              href="/auth/login/consumer"
              className="group block w-full p-8 bg-white border border-sand hover:border-charcoal-deep transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-parchment flex items-center justify-center group-hover:bg-charcoal-deep transition-colors">
                  <ShoppingBag size={24} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-display text-xl text-charcoal-deep">Consumer</h2>
                    <ArrowRight size={18} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-stone text-sm leading-relaxed">
                    Explore curated collections, build your digital wardrobe, and receive personalized style recommendations.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-parchment text-[10px] tracking-[0.1em] uppercase text-stone">
                      Style Profile
                    </span>
                    <span className="px-3 py-1 bg-parchment text-[10px] tracking-[0.1em] uppercase text-stone">
                      Wardrobe
                    </span>
                    <span className="px-3 py-1 bg-parchment text-[10px] tracking-[0.1em] uppercase text-stone">
                      AI Styling
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* UHNI Option */}
            <Link
              href="/auth/login/uhni"
              className="group block w-full p-8 bg-charcoal-deep border border-charcoal-deep hover:bg-noir transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                  <Crown size={24} className="text-gold-soft" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl text-ivory-cream">UHNI</h2>
                      <span className="px-2 py-0.5 bg-gold-soft/20 text-[8px] tracking-[0.2em] uppercase text-gold-soft">
                        Exclusive
                      </span>
                    </div>
                    <ArrowRight size={18} className="text-sand group-hover:text-gold-soft group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sand text-sm leading-relaxed">
                    Personal concierge service, autonomous shopping, private sourcing, and bespoke commissions.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gold-soft/10 text-[10px] tracking-[0.1em] uppercase text-gold-soft/80 flex items-center gap-1.5">
                      <Gem size={10} />
                      Concierge
                    </span>
                    <span className="px-3 py-1 bg-gold-soft/10 text-[10px] tracking-[0.1em] uppercase text-gold-soft/80">
                      Zero-UI
                    </span>
                    <span className="px-3 py-1 bg-gold-soft/10 text-[10px] tracking-[0.1em] uppercase text-gold-soft/80">
                      Bespoke
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-ivory-cream text-[10px] tracking-[0.2em] uppercase text-taupe">
                New to Glimmora?
              </span>
            </div>
          </div>

          <Link
            href="/auth/register"
            className="block w-full py-4 px-6 border border-sand text-charcoal-deep text-center hover:border-charcoal-deep transition-all duration-300"
          >
            <span className="text-sm tracking-[0.15em] uppercase">Create Account</span>
          </Link>

          <p className="text-center text-taupe mt-10 text-sm">
            UHNI membership is by invitation only.{' '}
            <Link href="/profile/concierge" className="text-charcoal-deep hover:text-gold-muted transition-colors">
              Learn more
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal-deep relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-ivory-cream max-w-md px-12">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
              Curated Excellence
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] mb-6">
              Your Style Journey Awaits
            </h2>
            <p className="text-taupe leading-relaxed">
              Discover exceptional pieces from distinguished maisons, curated with intelligence and refined with care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
