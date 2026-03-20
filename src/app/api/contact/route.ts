import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Contact form submission endpoint.
 * 
 * Accepts JSON with: name, email, phone (optional), need (optional), message
 * Validates required fields and returns success/error response.
 * 
 * Email Integration:
 * To send emails to info@phafrique.com, integrate an email service:
 * - Option 1: Use Nodemailer with SMTP
 * - Option 2: Use SendGrid, Resend, or similar service
 * - Option 3: Use serverless email API
 * 
 * Example with Nodemailer:
 * ```typescript
 * import nodemailer from 'nodemailer'
 * const transporter = nodemailer.createTransport({
 *   host: process.env.SMTP_HOST,
 *   port: 587,
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASS,
 *   },
 * })
 * await transporter.sendMail({
 *   from: email,
 *   to: 'info@phafrique.com',
 *   subject: `Contact Form: ${need || 'General Inquiry'}`,
 *   html: `<p>From: ${name} (${email}${phone ? `, ${phone}` : ''})</p><p>${message}</p>`,
 * })
 * ```
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, need, message } = body
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    // Validate message length
    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }
    
    // Save contact messages for admin visibility (in addition to normal email handling).
    const messageEntry = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : null,
      need: need ? String(need).trim() : null,
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    }
    try {
      const existing = await prisma.content.findUnique({ where: { key: 'contact_messages' } })
      let previous: unknown[] = []
      if (existing?.value) {
        try {
          const parsed = JSON.parse(existing.value)
          previous = Array.isArray(parsed) ? parsed : []
        } catch {
          previous = []
        }
      }
      const next = [messageEntry, ...previous].slice(0, 1000)
      await prisma.content.upsert({
        where: { key: 'contact_messages' },
        update: { value: JSON.stringify(next) },
        create: { key: 'contact_messages', value: JSON.stringify(next) },
      })
    } catch (storageError) {
      // Contact endpoint should still succeed even if log storage fails.
      console.error('[contact] Failed to store message for admin view:', storageError)
    }
    
    // Log in development for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('[contact]', {
        name,
        email,
        phone: phone || 'N/A',
        need: need || 'General inquiry',
        message: message?.slice(0, 100) + (message.length > 100 ? '...' : ''),
      })
      console.log('[contact] Email would be sent to: info@phafrique.com')
    }
    
    // In production, implement email sending here (messages are already stored above).

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact] Error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
