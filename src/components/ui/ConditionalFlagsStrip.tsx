'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import CountryFlagsStrip from './CountryFlagsStrip'

export default function ConditionalFlagsStrip() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    return null
  }
  
  return <CountryFlagsStrip />
}
