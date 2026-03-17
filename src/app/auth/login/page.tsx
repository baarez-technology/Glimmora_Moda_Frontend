'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Crown, ShoppingBag, Building2, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { brandLogin, userLogin, storeUserAuth, socialSignIn, verify2FALogin } from '@/services/auth.service';
import type { UserTokenResponse } from '@/services/auth.service';
import { signInWithGoogle, signInWithApple } from '@/lib/firebase';
import { getAdminUser } from '@/data/admin';

type LoginTier = 'consumer' | 'uhni' | 'brand' | 'admin';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_RULES = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[a-z]/, label: 'A lowercase letter' },
  { regex: /[A-Z]/, label: 'An uppercase letter' },
  { regex: /[0-9]/, label: 'A number' },
  { regex: /[^a-zA-Z0-9]/, label: 'A special character (!@#$...)' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode');
  const { showToast, setUserRole: setAppUserRole } = useApp();
  const { setUserData } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoginTier>(
    initialMode === 'admin' ? 'admin' : initialMode === 'brand' ? 'brand' : initialMode === 'uhni' ? 'uhni' : 'consumer'
  );
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Complete login after successful auth (shared by normal + 2FA flows)
  const completeLogin = (data: UserTokenResponse) => {
    if (!data.user || !data.access_token || !data.refresh_token) return;
    storeUserAuth({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
    setUserData(data.user);

    const tier = data.user.role === 'uhni' ? 'uhni' : 'preferred';
    setAppUserRole(tier as 'uhni' | 'preferred');

    if (data.user.role === 'uhni') {
      showToast('Welcome back. Your personal concierge is available.', 'success');
    } else {
      showToast('Welcome back to ModaGlimmora!', 'success');
    }

    if (data.context_required) {
      if (redirectUrl && redirectUrl !== '/') {
        localStorage.setItem('moda-post-onboarding-redirect', redirectUrl);
      }
      router.replace('/onboarding');
    } else {
      router.replace(redirectUrl);
    }
  };

  // Handle 2FA verification
  const handle2FAVerify = async () => {
    if (totpCode.length < 6) return;
    setIs2FAVerifying(true);
    setLoginError(null);
    try {
      const data = await verify2FALogin(preAuthToken, totpCode);
      completeLogin(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid code';
      setLoginError(message);
      showToast(message, 'error');
    } finally {
      setIs2FAVerifying(false);
    }
  };

  // Validation
  const emailError = touched.email && formData.email.length > 0 && !EMAIL_REGEX.test(formData.email)
    ? 'Please enter a valid email address'
    : null;

  const failedPasswordRules = PASSWORD_RULES.filter(rule => !rule.regex.test(formData.password));
  const passwordErrors = touched.password && formData.password.length > 0 ? failedPasswordRules : [];

  const isFormValid = EMAIL_REGEX.test(formData.email) && failedPasswordRules.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setIsSubmitting(true);
    setLoginError(null);

    if (selectedTier === 'admin') {
      try {
        const adminUser = getAdminUser();
        adminUser.email = formData.email;
        adminUser.lastActive = new Date().toISOString();
        localStorage.setItem('moda-admin-auth', 'true');
        localStorage.setItem('moda-admin-data', JSON.stringify(adminUser));
        showToast('Welcome to the Admin Console.', 'success');
        router.push('/admin');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setLoginError(message);
        showToast(message, 'error');
        setIsSubmitting(false);
      }
      return;
    }

    if (selectedTier === 'brand') {
      try {
        const data = await brandLogin({
          email: formData.email,
          password: formData.password,
        });

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
      // Consumer or UHNI login — send role to backend
      try {
        const data = await userLogin({
          email: formData.email,
          password: formData.password,
          role: selectedTier,
        });

        // Check if 2FA is required
        if (data.requires_2fa && data.pre_auth_token) {
          setPreAuthToken(data.pre_auth_token);
          setRequires2FA(true);
          setIsSubmitting(false);
          return;
        }

        completeLogin(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setLoginError(message);
        showToast(message, 'error');
        setIsSubmitting(false);
      }
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    setLoginError(null);

    try {
      const firebaseUser = provider === 'google'
        ? await signInWithGoogle()
        : await signInWithApple();

      const role = selectedTier === 'uhni' ? 'uhni' : 'consumer';
      const idToken = await firebaseUser.getIdToken();
      const data = await socialSignIn(provider, idToken, role);

      // Check if 2FA is required
      if (data.requires_2fa && data.pre_auth_token) {
        setPreAuthToken(data.pre_auth_token);
        setRequires2FA(true);
        return;
      }

      completeLogin(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Social sign-in failed';
      if (!message.includes('popup-closed-by-user')) {
        setLoginError(message);
        showToast(message, 'error');
      }
    } finally {
      setIsSocialLoading(null);
    }
  };

  // 2FA verification screen
  if (requires2FA) {
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
                Two-Factor Verification
              </p>
              <p className="text-sand leading-relaxed">
                Enter the 6-digit code from your authenticator app to complete sign in.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - 2FA Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <Link href="/">
                <h1 className="font-display text-2xl tracking-[0.15em] uppercase text-charcoal-deep">
                  ModaGlimmora
                </h1>
              </Link>
            </div>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-charcoal-deep/5 flex items-center justify-center mx-auto mb-6">
                <Eye size={28} className="text-charcoal-deep" />
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-4">
                Verification Required
              </h1>
              <p className="text-stone">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
                {loginError}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Authentication Code
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-5 py-5 bg-transparent border border-sand text-charcoal-deep text-center text-3xl tracking-[0.8em] font-mono focus:outline-none focus:border-charcoal-deep transition-colors"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handle2FAVerify(); }}
                />
              </div>

              <button
                onClick={handle2FAVerify}
                disabled={totpCode.length < 6 || is2FAVerifying}
                className="w-full py-4 px-6 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {is2FAVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm tracking-[0.15em] uppercase">Verifying...</span>
                  </>
                ) : (
                  <span className="text-sm tracking-[0.15em] uppercase">Verify & Sign In</span>
                )}
              </button>

              <button
                onClick={() => { setRequires2FA(false); setTotpCode(''); setPreAuthToken(''); setLoginError(null); }}
                className="w-full text-center text-stone hover:text-charcoal-deep transition-colors text-sm"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {selectedTier === 'admin' ? 'Admin Console' : selectedTier === 'brand' ? 'Brand Partner Portal' : 'Experience-First Luxury Commerce'}
            </p>
            <p className="text-sand leading-relaxed mb-10">
              {selectedTier === 'admin'
                ? 'Manage users, brands, content moderation, platform configuration, and system health.'
                : selectedTier === 'brand'
                ? 'Manage your products, track performance, and access demand intelligence through our B2B platform.'
                : 'The world\'s first AGI-native fashion universe. Where intelligence meets elegance, and every interaction is crafted for distinction.'}
            </p>
            <div className="flex items-center justify-center gap-8 text-taupe text-sm">
              {selectedTier === 'admin' ? (
                <>
                  <span>User Management</span>
                  <span className="w-1 h-1 bg-gold-soft/50 rounded-full" />
                  <span>Platform Control</span>
                  <span className="w-1 h-1 bg-gold-soft/50 rounded-full" />
                  <span>System Health</span>
                </>
              ) : selectedTier === 'brand' ? (
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
              {selectedTier === 'admin' ? 'Admin Console' : selectedTier === 'brand' ? 'Brand Portal' : 'Welcome Back'}
            </h1>
            <p className="text-stone">
              {selectedTier === 'admin'
                ? 'Sign in to the platform administration console'
                : selectedTier === 'brand'
                ? 'Sign in to manage your brand on ModaGlimmora'
                : 'Sign in to your personalized fashion experience'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                className={`w-full px-5 py-4 bg-transparent border text-charcoal-deep placeholder:text-taupe focus:outline-none transition-colors ${
                  emailError ? 'border-error focus:border-error' : 'border-sand focus:border-charcoal-deep'
                }`}
                placeholder={selectedTier === 'admin' ? 'admin@glimmora.com' : selectedTier === 'brand' ? 'partner@brand.com' : 'your@email.com'}
                required
              />
              {emailError && (
                <p className="text-xs text-error mt-2">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  className={`w-full px-5 py-4 pr-14 bg-transparent border text-charcoal-deep placeholder:text-taupe focus:outline-none transition-colors ${
                    passwordErrors.length > 0 ? 'border-error focus:border-error' : 'border-sand focus:border-charcoal-deep'
                  }`}
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
              {passwordErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordErrors.map((rule) => (
                    <p key={rule.label} className="text-xs text-error">
                      Missing: {rule.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Login Error */}
            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                {loginError}
              </div>
            )}

            {/* Account Type Selector */}
            <div className="p-4 bg-parchment/50 border border-sand/50">
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-4">
                Select Account Type
              </p>
              <div className="grid grid-cols-4 gap-3">
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
                <button
                  type="button"
                  onClick={() => setSelectedTier('admin')}
                  className={`p-4 border transition-all duration-300 ${
                    selectedTier === 'admin'
                      ? 'border-charcoal-deep bg-noir text-ivory-cream'
                      : 'border-sand/50 hover:border-sand'
                  }`}
                >
                  <Shield size={20} className={`mx-auto mb-2 ${selectedTier === 'admin' ? 'text-gold-soft' : 'text-stone'}`} />
                  <p className={`text-sm font-medium ${selectedTier === 'admin' ? 'text-ivory-cream' : 'text-stone'}`}>
                    Admin
                  </p>
                  <p className={`text-[10px] mt-1 ${selectedTier === 'admin' ? 'text-gold-soft/70' : 'text-taupe'}`}>Console</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
                selectedTier === 'uhni'
                  ? 'bg-gold-deep text-white hover:bg-gold-deep/90'
                  : selectedTier === 'admin'
                  ? 'bg-noir text-gold-soft hover:bg-charcoal-deep'
                  : 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    selectedTier === 'uhni' ? 'border-white' : 'border-ivory-cream'
                  }`} />
                  <span className="text-sm tracking-[0.15em] uppercase">
                    {selectedTier === 'admin' ? 'Accessing Console...' : selectedTier === 'brand' ? 'Accessing Portal...' : 'Signing In...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase">
                    {selectedTier === 'admin' ? 'Access Console' : selectedTier === 'brand' ? 'Access Portal' : 'Sign In'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Social Login — only for consumer & uhni */}
          {selectedTier !== 'brand' && selectedTier !== 'admin' && (
            <>
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sand"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-ivory-cream text-[10px] tracking-[0.2em] uppercase text-taupe">
                    or sign in with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={isSocialLoading !== null}
                  className="py-4 px-6 border border-sand text-charcoal-deep flex items-center justify-center gap-3 hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSocialLoading === 'google' ? (
                    <div className="w-4 h-4 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  <span className="text-sm tracking-[0.1em] uppercase">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('apple')}
                  disabled={isSocialLoading !== null}
                  className="py-4 px-6 border border-sand text-charcoal-deep flex items-center justify-center gap-3 hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSocialLoading === 'apple' ? (
                    <div className="w-4 h-4 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  )}
                  <span className="text-sm tracking-[0.1em] uppercase">Apple</span>
                </button>
              </div>
            </>
          )}

          <p className="text-center text-stone mt-10">
            {selectedTier === 'admin' ? (
              <>
                Not an admin?{' '}
                <button
                  onClick={() => setSelectedTier('consumer')}
                  className="text-charcoal-deep hover:text-gold-muted font-medium transition-colors"
                >
                  Sign in as customer
                </button>
              </>
            ) : selectedTier === 'brand' ? (
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
                Don&apos;t have an account?{' '}
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
