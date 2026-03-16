/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*/',
          destination: `${apiBase}/api/v1/:path*/`,
        },
        {
          source: '/api/v1/:path*',
          destination: `${apiBase}/api/v1/:path*`,
        },
      ],
    };
  },
}

module.exports = nextConfig
