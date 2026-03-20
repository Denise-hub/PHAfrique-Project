import { NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  need: string | null
  message: string
  createdAt: string
}

function parseMessages(value: string | null | undefined): ContactMessage[] {
  if (value == null || value.trim() === '') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as ContactMessage[]) : []
  } catch {
    return []
  }
}

export async function GET() {
  const unauth = await requireSection('content')
  if (unauth) return unauth

  try {
    const row = await prisma.content.findUnique({ where: { key: 'contact_messages' } })
    const list = parseMessages(row?.value).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    return NextResponse.json(list)
  } catch (error) {
    console.error('admin contact-messages GET', error)
    return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 })
  }
}

