'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
        <div className="bg-white p-8 space-y-8">
          <section>
            <p className="text-stone leading-relaxed italic">
              ModaGlimmora is a fashion intelligence operating system. Your data powers your style — never anyone else&rsquo;s commercial agenda.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">1. What We Collect</h2>
            <p className="text-stone leading-relaxed">
              We collect the information you knowingly provide (account details, style preferences, body measurements, wardrobe entries, occasion calendar) and the events your activity generates (product views, searches, recommendations you accepted or dismissed). We do not infer sensitive attributes from your behaviour. We do not purchase data about you from third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">2. How We Use Your Data</h2>
            <p className="text-stone leading-relaxed">
              Your data is used to personalise your fashion intelligence — recommending pieces that match your taste, body, occasions, and budget. All recommendations are explainable: you can ask why a piece was suggested and the system will tell you. All preferences are reversible: you can edit, correct, or delete them at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">3. What We Never Do</h2>
            <ul className="text-stone leading-relaxed space-y-2 list-none">
              <li>— We never sell, license, or rent your personal data to third parties.</li>
              <li>— We never infer sensitive attributes (ethnicity, religion, political views, health) from your style.</li>
              <li>— We never create immutable profiles. Every preference can be revised or removed.</li>
              <li>— We never employ dark patterns, artificial urgency, or manipulative scarcity to drive purchases.</li>
              <li>— We never share your wardrobe or body measurements with brand partners in identifiable form.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">4. Sharing with Brand Partners</h2>
            <p className="text-stone leading-relaxed">
              Brand partners on ModaGlimmora receive aggregated, anonymised demand signals — never your individual profile. When you order from a brand, the brand receives only the information required to fulfil the order (name, shipping address, items, payment confirmation). Nothing more.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">5. AI &amp; Intelligence Decisions</h2>
            <p className="text-stone leading-relaxed">
              All AI-driven decisions that affect you (fit confidence scores, sustainability indicators, recommendations) are advisory only and are logged. You retain final judgement on every decision. AI systems operate under a human-in-the-loop mandate — no irreversible action against your account or data is taken without human review.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">6. Your Rights</h2>
            <p className="text-stone leading-relaxed">
              You may at any time: download your data, correct any field, delete your account and all associated data, and withdraw consent to specific processing. Requests are processed within a reasonable timeframe consistent with GDPR and equivalent data-protection frameworks. Submit a request from your profile settings or by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">7. Cookies &amp; Tracking</h2>
            <p className="text-stone leading-relaxed">
              We use essential cookies to keep you signed in and to remember your bag and preferences within a session. We use limited performance cookies to understand which features are valuable to you in aggregate. We do not place advertising or cross-site tracking cookies. You control non-essential cookies from your Privacy Settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">8. Data Retention</h2>
            <p className="text-stone leading-relaxed">
              We retain your data while your account is active and for a limited period after deletion to satisfy legal, accounting, and security obligations. Anonymised aggregate intelligence may be retained longer to improve the platform without ever being linkable back to you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">9. Security</h2>
            <p className="text-stone leading-relaxed">
              All data is encrypted in transit and at rest. Access to user data is strictly tenant-isolated and continuously audited. Authentication is protected by industry-standard hashing (Argon2id) and two-factor verification options.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal-deep mb-4">10. Contact</h2>
            <p className="text-stone leading-relaxed">
              For questions about this policy, or to exercise any of your rights, please contact our support team. ModaGlimmora is committed to transparency and the ethical handling of your data.
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
