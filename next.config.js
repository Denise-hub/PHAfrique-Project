/** @type {import('next').NextConfig} */
const path = require('path')

// Resolve SQLite DB to an absolute path so Prisma finds it after folder rename.
const projectRoot = process.cwd()
const prismaDbPath = path.resolve(projectRoot, 'prisma', 'dev.db')
const databaseUrl = 'file:' + prismaDbPath.replace(/\\/g, '/')

const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: databaseUrl,
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

