/** @type {import('next').NextConfig} */

// Use DATABASE_URL from environment (e.g. Vercel/Neon) so production connects to Postgres.
// Locally, set DATABASE_URL in .env to your Neon or other Postgres URL.
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig

