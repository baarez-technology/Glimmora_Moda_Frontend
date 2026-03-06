'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Check, Crown, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { userRegister, storeUserAuth, socialSignIn } from '@/services/auth.service';
import { signInWithGoogle, signInWithApple } from '@/lib/firebase';

type RegisterRole = 'consumer' | 'uhni';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_RULES = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[a-z]/, label: 'A lowercase letter' },
  { regex: /[A-Z]/, label: 'An uppercase letter' },
  { regex: /[0-9]/, label: 'A number' },
  { regex: /[^a-zA-Z0-9]/, label: 'A special character (!@#$...)' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { setUserData } = useAuth();
  const { showToast, setUserRole: setAppUserRole } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RegisterRole>('consumer');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Validation
  const emailError = touched.email && formData.email.length > 0 && !EMAIL_REGEX.test(formData.email)
    ? 'Please enter a valid email address'
    : null;

  const failedPasswordRules = PASSWORD_RULES.filter(rule => !rule.regex.test(formData.password));
  const passwordErrors = touched.password && formData.password.length > 0 ? failedPasswordRules : [];

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    EMAIL_REGEX.test(formData.email) &&
    failedPasswordRules.length === 0 &&
    agreeTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setIsSubmitting(true);
    setRegisterError(null);

    try {
      const data = await userRegister({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });

      storeUserAuth({ access_token: data.access_token!, refresh_token: data.refresh_token!, user: data.user! });
      setUserData(data.user!);

      const tier = data.user!.role === 'uhni' ? 'uhni' : 'preferred';
      setAppUserRole(tier as 'uhni' | 'preferred');

      showToast('Account created successfully!', 'success');

      if (redirectUrl) {
        localStorage.setItem('moda-post-onboarding-redirect', redirectUrl);
      }

      router.push('/onboarding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setRegisterError(message);
      showToast(message, 'error');
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    setRegisterError(null);

    try {
      const firebaseUser = provider === 'google'
        ? await signInWithGoogle()
        : await signInWithApple();

      const idToken = await firebaseUser.getIdToken();
      const data = await socialSignIn(provider, idToken, selectedRole);

      storeUserAuth({ access_token: data.access_token!, refresh_token: data.refresh_token!, user: data.user! });
      setUserData(data.user!);

      const tier = data.user!.role === 'uhni' ? 'uhni' : 'preferred';
      setAppUserRole(tier as 'uhni' | 'preferred');

      showToast('Account created successfully!', 'success');

      if (redirectUrl) {
        localStorage.setItem('moda-post-onboarding-redirect', redirectUrl);
      }

      router.push('/onboarding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Social sign-up failed';
      if (!message.includes('popup-closed-by-user')) {
        setRegisterError(message);
        showToast(message, 'error');
      }
    } finally {
      setIsSocialLoading(null);
    }
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
            {/* Name Fields */}
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
                placeholder="your@email.com"
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
              {passwordErrors.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {passwordErrors.map((rule) => (
                    <p key={rule.label} className="text-xs text-error">
                      Missing: {rule.label}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-taupe mt-2">
                  Must include uppercase, lowercase, number, and special character
                </p>
              )}
            </div>

            {/* Account Type — below password, above terms */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Account Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('consumer')}
                  className={`p-4 border transition-all duration-300 flex flex-col items-center gap-2 ${
                    selectedRole === 'consumer'
                      ? 'border-charcoal-deep bg-charcoal-deep'
                      : 'border-sand hover:border-charcoal-deep bg-transparent'
                  }`}
                >
                  <ShoppingBag size={20} className={selectedRole === 'consumer' ? 'text-gold-soft' : 'text-stone'} />
                  <span className={`text-sm font-medium ${selectedRole === 'consumer' ? 'text-ivory-cream' : 'text-charcoal-deep'}`}>
                    Consumer
                  </span>
                  <span className={`text-[10px] ${selectedRole === 'consumer' ? 'text-taupe' : 'text-stone'}`}>
                    Standard shopping experience
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('uhni')}
                  className={`p-4 border transition-all duration-300 flex flex-col items-center gap-2 ${
                    selectedRole === 'uhni'
                      ? 'border-gold-deep bg-gold-soft/10'
                      : 'border-sand hover:border-gold-muted/50 bg-transparent'
                  }`}
                >
                  <Crown size={20} className={selectedRole === 'uhni' ? 'text-gold-deep' : 'text-stone'} />
                  <span className={`text-sm font-medium ${selectedRole === 'uhni' ? 'text-gold-deep' : 'text-charcoal-deep'}`}>
                    UHNI
                  </span>
                  <span className={`text-[10px] ${selectedRole === 'uhni' ? 'text-gold-muted' : 'text-stone'}`}>
                    Exclusive concierge access
                  </span>
                </button>
              </div>
            </div>

            {/* Register Error */}
            {registerError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                {registerError}
              </div>
            )}

            {/* Terms & Conditions */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
                selectedRole === 'uhni'
                  ? 'bg-gold-deep text-white hover:bg-gold-deep/90'
                  : 'bg-charcoal-deep text-ivory-cream hover:bg-noir'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    selectedRole === 'uhni' ? 'border-white' : 'border-ivory-cream'
                  }`} />
                  <span className="text-sm tracking-[0.15em] uppercase">Creating Account...</span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase">Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
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
            <button
              type="button"
              onClick={() => handleSocialSignUp('google')}
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
              onClick={() => handleSocialSignUp('apple')}
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

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
