import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Upsert to handle returning subscribers (set isActive back to true if it existed as false)
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, isActive: true },
    })

    return NextResponse.json({ success: true, subscriber })
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
