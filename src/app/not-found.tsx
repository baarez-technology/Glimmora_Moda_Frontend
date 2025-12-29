import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory-cream flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center mx-auto mb-8">
          <Sparkles size={32} className="text-gold-muted" />
        </div>

        <h1 className="font-display text-4xl text-charcoal-deep mb-4">
          Page Not Found
        </h1>

        <p className="text-stone mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let our Fashion Intelligence guide you back to exceptional experiences.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <ArrowLeft size={18} />
            Return Home
          </Link>
          <Link href="/discover" className="btn-secondary">
            Start Discovering
          </Link>
        </div>
      </div>
    </div>
  );
}
