import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

/**
 * Save an uploaded image file to public/uploads/images and return the public URL path.
 * Used by Admin Opportunities and Programs (and any other feature that needs image upload).
 */
export async function saveImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null
  const dir = path.join(process.cwd(), 'public', 'uploads', 'images')
  await mkdir(dir, { recursive: true })
  const ext = path.extname(file.name) || '.jpg'
  const base = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filePath = path.join(dir, base)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)
  return `/uploads/images/${base}`
}
