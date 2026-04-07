/** @type {import('next').NextConfig} */

// Do NOT put DATABASE_URL, NEXTAUTH_*, ADMIN_PASSWORD, or CLOUDINARY_* in env here.
// They must be read at runtime from the deployment environment (Vercel Environment Variables)
// so the app uses the correct database and auth URL.
const nextConfig = {
  reactStrictMode: true,
  env: {},
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig

