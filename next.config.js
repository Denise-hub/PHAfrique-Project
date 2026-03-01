/** @type {import('next').NextConfig} */
const path = require('path')

// Resolve SQLite DB to an absolute path so Prisma finds it after folder rename.
const projectRoot = process.cwd()
const prismaDbPath = path.resolve(projectRoot, 'prisma', 'dev.db')
const databaseUrl = 'file:' + prismaDbPath.replace(/\\/g, '/')

// GitHub Pages: use static export and basePath when building for Pages.
const isGitHubPages = process.env.GITHUB_PAGES === '1'
const basePath = isGitHubPages ? '/PHAfrique-Project' : undefined
const assetPrefix = isGitHubPages ? '/PHAfrique-Project/' : undefined

const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: databaseUrl,
  },
  ...(isGitHubPages && { basePath, assetPrefix, output: 'export' }),
  ...(!isGitHubPages && { output: 'standalone' }),
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
}

module.exports = nextConfig

