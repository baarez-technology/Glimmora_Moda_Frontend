'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login
    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen bg-ivory-cream flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl text-charcoal-deep mb-3">Welcome Back</h1>
            <p className="text-stone">Sign in to continue your fashion journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-gold-muted" />
                <span className="text-sm text-stone">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-gold-muted hover:text-gold-deep">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full justify-center">
              Sign In
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-ivory-cream text-greige">or continue with</span>
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
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-gold-muted hover:text-gold-deep font-medium">
              Create one
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
          <div className="text-center text-ivory-cream max-w-md px-8">
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-gold-soft" />
            <h2 className="font-display text-3xl mb-4">Fashion Intelligence Awaits</h2>
            <p className="text-taupe">
              Your User Fashion Agent remembers your preferences and continues learning with every interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
