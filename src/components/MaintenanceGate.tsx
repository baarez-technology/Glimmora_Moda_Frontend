'use client';

import { useState, useEffect } from 'react';
import { getPlatformConfig } from '@/lib/platform-config';
import { Settings } from 'lucide-react';

/**
 * Wraps children and shows a maintenance screen if maintenance mode is enabled.
 * Listens for config changes (from admin portal) and re-checks.
 */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    function check() {
      const cfg = getPlatformConfig();
      setMaintenance(cfg.maintenanceMode);
      setMessage(cfg.maintenanceMessage || 'We are performing scheduled maintenance. Please check back shortly.');
    }

    check();

    // Re-check if admin saves new config in another tab or same window
    window.addEventListener('storage', check);
    window.addEventListener('platform-config-change', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('platform-config-change', check);
    };
  }, []);

  if (maintenance) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-charcoal-deep/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Settings size={28} className="text-charcoal-deep animate-spin-slow" />
          </div>
          <h1 className="font-display text-3xl tracking-[-0.02em] text-charcoal-deep mb-4">
            Under Maintenance
          </h1>
          <p className="text-stone leading-relaxed mb-8">
            {message}
          </p>
          <p className="text-xs text-taupe tracking-[0.15em] uppercase">
            ModaGlimmora
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
