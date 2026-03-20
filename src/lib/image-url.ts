/**
 * Normalize image URL for use in <img> or Next.js <Image>.
 * - Absolute URLs (http/https, e.g. Cloudinary) are returned as-is.
 * - Relative paths get a leading slash if missing.
 */
export function imageSrc(url: string): string {
  if (!url || typeof url !== 'string') return ''
  const value = url.trim().replace(/\\/g, '/')
  if (value.startsWith('http://') || value.startsWith('https://')) return encodeURI(value)
  if (value.startsWith('//')) return encodeURI(`https:${value}`)
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return encodeURI(`https://${value}`)
  if (value.startsWith('res.cloudinary.com/')) return encodeURI(`https://${value}`)
  return encodeURI(value.startsWith('/') ? value : `/${value}`)
}
