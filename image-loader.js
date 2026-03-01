/**
 * Custom Next.js image loader so that basePath is applied to image src on GitHub Pages.
 * next/image does not auto-prefix basePath (see vercel/next.js#31008).
 */
const basePath = process.env.GITHUB_PAGES === '1' ? '/PHAfrique-Project' : ''

export default function imageLoader({ src, width, quality }) {
  if (!basePath) {
    return src
  }
  const path = src.startsWith('/') ? src : `/${src}`
  return `${basePath}${path}`
}
