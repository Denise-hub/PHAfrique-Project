/** @type {import('next').NextConfig} */
const path = require('path')

// Resolve SQLite DB to an absolute path so Prisma finds it after folder rename.
// Prisma's generated client can resolve relative paths from the wrong base (e.g. node_modules/.prisma/client),
// causing "file:./dev.db" to point to the wrong file and 500 errors. Using an absolute path fixes this.
const projectRoot = process.cwd()
const prismaDbPath = path.resolve(projectRoot, 'prisma', 'dev.db')
const databaseUrl = 'file:' + prismaDbPath.replace(/\\/g, '/')

const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: databaseUrl,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Disable optimization to avoid errors with local images
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Ensure compatibility with domains.co.za hosting
  output: 'standalone',
}

module.exports = nextConfig

