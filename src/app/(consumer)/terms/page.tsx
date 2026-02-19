'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
            Legal
          </span>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
            Terms of Service
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
        <div className="bg-white p-8 space-y-8">
          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">1. Acceptance of Terms</h2>
            <p className="text-stone leading-relaxed">
              By accessing and using ModaGlimmora, you agree to be bound by these Terms of Service. ModaGlimmora is a global fashion intelligence platform owned and operated by Baarez Technology Solutions Pvt. Ltd. These terms govern your use of our services, including AI-powered styling recommendations, digital wardrobe management, and fashion discovery features.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">2. Platform Description</h2>
            <p className="text-stone leading-relaxed">
              ModaGlimmora is a fashion intelligence operating system. It is not a marketplace or reseller platform. All products available on the platform are presented directly by authorized brand partners. ModaGlimmora provides intelligence-led fashion recommendations, not transactional commerce in the traditional sense.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">3. User Accounts</h2>
            <p className="text-stone leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. All fashion preferences, wardrobe data, and style profiles are stored securely and remain under your control. You may modify or delete your data at any time through your profile settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">4. AI Intelligence & Recommendations</h2>
            <p className="text-stone leading-relaxed">
              ModaGlimmora uses artificial general intelligence (AGI) systems to provide fashion recommendations. All recommendations are explainable, reversible, and logged. The platform does not employ dark patterns, artificial urgency, emotional manipulation, or exploitative scarcity tactics. All AI decisions are governed by human-in-the-loop mandates.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">5. Privacy & Data</h2>
            <p className="text-stone leading-relaxed">
              Your personal data is never sold to third parties. ModaGlimmora does not infer sensitive attributes, create immutable profiles, or sell identity data. You retain full control over your fashion identity, preferences, and browsing history. For full details, please review our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">6. Intellectual Property</h2>
            <p className="text-stone leading-relaxed">
              The ModaGlimmora platform, including its AGI systems, design, and technology, is the exclusive intellectual property of Baarez Technology Solutions Pvt. Ltd. Brand designs and product imagery remain the property of their respective brand partners. User-generated content (style profiles, wardrobe data) remains the property of the user.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">7. Limitation of Liability</h2>
            <p className="text-stone leading-relaxed">
              ModaGlimmora provides fashion intelligence advisory services and does not guarantee commercial outcomes. Style recommendations are provided as guidance and should not be considered as professional fashion consulting. Product availability is probabilistic and may vary.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">8. Contact</h2>
            <p className="text-stone leading-relaxed">
              For questions about these terms, please contact our support team. ModaGlimmora is committed to transparency, trust, and the ethical use of AI in fashion.
            </p>
          </section>

          <div className="pt-4 border-t border-sand">
            <p className="text-xs text-stone/50">
              Last updated: January 2026 | Baarez Technology Solutions Pvt. Ltd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
