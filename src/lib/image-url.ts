/**
 * Normalize image URL for use in <img> or Next.js <Image>.
 * - Absolute URLs (http/https, e.g. Cloudinary) are returned as-is.
 * - Relative paths get a leading slash if missing.
 */
export function imageSrc(url: string): string {
  if (!url || typeof url !== 'string') return ''
  const value = url.trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('//')) return `https:${value}`
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`
  if (value.startsWith('res.cloudinary.com/')) return `https://${value}`
  return value.startsWith('/') ? value : `/${value}`
}
