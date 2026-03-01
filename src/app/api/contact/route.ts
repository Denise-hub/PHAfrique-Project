import { NextRequest, NextResponse } from 'next/server'

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
    
    // TODO: Send email to info@phafrique.com
    // TODO: Optionally save to database for record keeping
    
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
    
    // In production, implement email sending here
    // For now, return success (email integration can be added without changing frontend)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact] Error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
