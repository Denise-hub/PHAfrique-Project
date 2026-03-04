/**
 * Normalize image URL for use in <img> or Next.js <Image>.
 * - Absolute URLs (http/https, e.g. Cloudinary) are returned as-is.
 * - Relative paths get a leading slash if missing.
 */
export function imageSrc(url: string): string {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? url : `/${url}`
}
