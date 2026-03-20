/**
 * Normalize image URL for use in <img> or Next.js <Image>.
 * - Absolute URLs (http/https, e.g. Cloudinary) are returned as-is.
 * - Relative paths get a leading slash if missing.
 */
export function imageSrc(url: string): string {
  if (!url || typeof url !== 'string') return ''
  let value = url.trim().replace(/^['"]|['"]$/g, '').replace(/\\/g, '/')
  const cloudinaryFull = value.match(/https?:\/\/res\.cloudinary\.com\/[^\s'")]+/i)?.[0]
  if (cloudinaryFull) value = cloudinaryFull
  const cloudinaryBare = value.match(/res\.cloudinary\.com\/[^\s'")]+/i)?.[0]
  if (!cloudinaryFull && cloudinaryBare) value = cloudinaryBare
  value = value.replace(/^url\((.*)\)$/i, '$1').trim().replace(/^['"]|['"]$/g, '')
  value = value.replace(/%5C/gi, '/').replace(/%2520/gi, '%20')
  if (value.startsWith('http://') || value.startsWith('https://')) return encodeURI(value)
  if (value.startsWith('//')) return encodeURI(`https:${value}`)
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return encodeURI(`https://${value}`)
  if (value.startsWith('res.cloudinary.com/')) return encodeURI(`https://${value}`)
  if (/^[a-z]:\//i.test(value) || value.startsWith('blob:') || value.startsWith('file:')) return ''
  return encodeURI(value.startsWith('/') ? value : `/${value}`)
}
