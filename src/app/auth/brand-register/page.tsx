'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Check, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { brandRegister } from '@/services/auth.service';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_RULES = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[a-z]/, label: 'A lowercase letter' },
  { regex: /[A-Z]/, label: 'An uppercase letter' },
  { regex: /[0-9]/, label: 'A number' },
  { regex: /[^a-zA-Z0-9]/, label: 'A special character (!@#$...)' },
];

function BrandRegisterForm() {
  const router = useRouter();
  const { showToast } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    brandName: '',
    brandCategory: '',
    phoneNumber: '',
    jobTitle: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const emailError = touched.email && formData.email.length > 0 && !EMAIL_REGEX.test(formData.email)
    ? 'Please enter a valid email address'
    : null;

  const failedPasswordRules = PASSWORD_RULES.filter(rule => !rule.regex.test(formData.password));
  const passwordErrors = touched.password && formData.password.length > 0 ? failedPasswordRules : [];

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.brandName.trim().length > 0 &&
    formData.brandCategory.trim().length > 0 &&
    formData.phoneNumber.trim().length > 0 &&
    formData.jobTitle.trim().length > 0 &&
    EMAIL_REGEX.test(formData.email) &&
    failedPasswordRules.length === 0 &&
    agreeTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true, lastName: true, email: true, password: true,
      brandName: true, brandCategory: true, phoneNumber: true, jobTitle: true
    });

    if (!isFormValid) return;

    setIsSubmitting(true);
    setRegisterError(null);

    try {
      const data = await brandRegister({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        brand_name: formData.brandName,
        brand_category: formData.brandCategory,
        phone_number: formData.phoneNumber,
        job_title: formData.jobTitle
      });

      // Automatically log the brand in after successful registration
      localStorage.setItem('moda-brand-token', data.access_token);
      localStorage.setItem('moda-brand-refresh-token', data.refresh_token);
      localStorage.setItem('moda-brand-data', JSON.stringify(data.brand));

      showToast('Brand account created successfully!', 'success');
      router.push('/brand');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setRegisterError(message);
      showToast(message, 'error');
      setIsSubmitting(false);
    }
  };

  const benefits = [
    'Access exclusive demand intelligence and analytics',
    'Connect directly with UHNI and preferred clients',
    'Manage your digital boutique and private collections',
    'Join our curated network of distinguished maisons'
  ];

  return (
    <div className="min-h-screen bg-ivory-cream flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal-deep relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80)'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md px-12">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6">
              Partner With Us
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
              Join The ModaGlimmora Network
            </h2>
            <p className="text-taupe mb-10 leading-relaxed">
              Elevate your brand's presence and connect with a curated audience of high-net-worth individuals and fashion connoisseurs.
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
      <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16 overflow-y-auto">
        <div className={`w-full max-w-md transition-all duration-1000 py-10 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-charcoal-deep/5 flex items-center justify-center mx-auto mb-6">
              <Building2 size={28} className="text-charcoal-deep" />
            </div>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
              Brand Partner
            </span>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-4">
              Brand Registration
            </h1>
            <p className="text-stone">Register your brand to access the partner portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Brand Information */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3 border-b border-sand pb-2">
                Brand Details
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  onBlur={() => handleBlur('brandName')}
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.brandCategory}
                  onChange={(e) => setFormData({ ...formData, brandCategory: e.target.value })}
                  onBlur={() => handleBlur('brandCategory')}
                  placeholder="e.g. Luxury Menswear"
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
            </div>

            {/* Representative Information */}
            <div className="pt-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3 border-b border-sand pb-2">
                Primary Contact
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onBlur={() => handleBlur('firstName')}
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
                  onBlur={() => handleBlur('lastName')}
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  onBlur={() => handleBlur('jobTitle')}
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  onBlur={() => handleBlur('phoneNumber')}
                  className="w-full px-5 py-4 bg-transparent border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
                Business Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur('email')}
                className={`w-full px-5 py-4 bg-transparent border text-charcoal-deep placeholder:text-taupe focus:outline-none transition-colors ${
                  emailError ? 'border-error focus:border-error' : 'border-sand focus:border-charcoal-deep'
                }`}
                placeholder="partner@brand.com"
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
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-5 py-4 pr-14 bg-transparent border text-charcoal-deep placeholder:text-taupe focus:outline-none transition-colors ${
                    passwordErrors.length > 0 ? 'border-error focus:border-error' : 'border-sand focus:border-charcoal-deep'
                  }`}
                  placeholder="Create a strong password"
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

            {/* Register Error */}
            {registerError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                {registerError}
              </div>
            )}

            {/* Terms & Conditions */}
            <label className="flex items-start gap-4 cursor-pointer group mt-6">
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
                <Link href="/terms" className="text-charcoal-deep hover:text-gold-muted transition-colors">Brand Partner Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-charcoal-deep hover:text-gold-muted transition-colors">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-charcoal-deep text-ivory-cream hover:bg-noir mt-8"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm tracking-[0.15em] uppercase">Submitting Application...</span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-[0.15em] uppercase">Submit Application</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-stone mt-10">
            Already a brand partner?{' '}
            <Link href="/auth/login?mode=brand" className="text-charcoal-deep hover:text-gold-muted font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BrandRegisterPage() {
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
      <BrandRegisterForm />
    </Suspense>
  );
}
