import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const isVercel = typeof process.env.VERCEL === 'string'
const isProduction = process.env.NODE_ENV === 'production'

// Centralised image upload utilities.
// In production the site always uploads to Cloudinary and stores only the
// resulting URL in the database. In local development it falls back to
// writing under public/uploads/images when Cloudinary is not configured.
// This keeps file‑system behaviour predictable across the whole app.

/**
 * Upload an image to Cloudinary using a signed request.
 * Returns the final public URL (secure_url when available).
 * Throws if Cloudinary is not configured or responds with an error.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel Environment Variables.')
  }

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'phafrique'
  const timestamp = Math.floor(Date.now() / 1000)
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mime = file.type || 'image/jpeg'
  const dataUri = `data:${mime};base64,${base64}`

  const form = new FormData()
  form.append('file', dataUri)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof data?.error?.message === 'string' ? data.error.message : 'Cloudinary upload failed'
    throw new Error(msg)
  }
  const url = (data.secure_url as string) || (data.url as string) || null
  if (!url) throw new Error('Cloudinary did not return a URL.')
  return url
}

async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    return await uploadImageToCloudinary(file)
  } catch {
    return null
  }
}

/**
 * Save an uploaded image file and return its public URL.
 * On Vercel/production: Cloudinary only; no local fallback (read-only filesystem).
 * Locally: Cloudinary if configured, else public/uploads/images.
 */
export async function saveImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null

  if (typeof (file as Blob).arrayBuffer !== 'function') {
    console.error('[upload] File has no arrayBuffer method')
    throw new Error('Invalid file. Please choose an image from your device and try again.')
  }

  try {
    const uploaded = await uploadToCloudinary(file)
    if (uploaded) return uploaded
  } catch (e) {
    if (isVercel || isProduction) {
      throw e
    }
    console.error('[upload] Cloudinary upload failed, falling back to local file:', (e as Error).message)
  }

  if (isVercel || isProduction) {
    throw new Error(
      'Image upload failed. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in Vercel Environment Variables for Production.'
    )
  }

  try {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(dir, { recursive: true })
    const ext = path.extname(file.name) || '.jpg'
    const base = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(dir, base), buffer)
    return `/uploads/images/${base}`
  } catch (e) {
    console.error('[upload] Local write failed:', (e as Error).message)
    throw new Error('Upload failed: could not save file. On production, configure Cloudinary.')
  }
}
