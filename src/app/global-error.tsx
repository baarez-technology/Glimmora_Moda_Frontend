'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#FAF8F5' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#2C2C2C', marginBottom: '1rem' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#8B8680', marginBottom: '2rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2C2C2C',
                color: '#FAF8F5',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
