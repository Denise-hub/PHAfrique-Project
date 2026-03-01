'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const LOGO_PATH = '/assets/logos/TRANSPARENT-MAIN-LOGO-ico.png'
const MIN_DISPLAY_MS = 1200
const FADEOUT_MS = 500
const MAX_DISPLAY_MS = 4000

export default function LoadingSplash() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [hiding, setHiding] = useState(false)

  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) {
      setVisible(false)
      return
    }
    const start = Date.now()
    const hide = () => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      setTimeout(() => {
        setHiding(true)
        setTimeout(() => setVisible(false), FADEOUT_MS)
      }, remaining)
    }
    if (typeof document === 'undefined') return
    if (document.readyState === 'complete') hide()
    else window.addEventListener('load', hide)
    const maxTimer = setTimeout(hide, MAX_DISPLAY_MS)
    return () => {
      window.removeEventListener('load', hide)
      clearTimeout(maxTimer)
    }
  }, [isAdmin])

  if (isAdmin || !visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#FFFCFF] dark:bg-neutral-950 transition-opacity duration-500 ease-out ${hiding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      aria-hidden
    >
      <div className="flex flex-col items-center justify-center gap-4 w-[200px] md:w-[240px]">
        <div className="relative flex justify-center animate-pulse">
          <Image
            src={LOGO_PATH}
            alt="Public Health Corps Africa"
            width={200}
            height={80}
            className="h-20 w-auto object-contain md:h-24"
            priority
            unoptimized
          />
        </div>
        <div className="flex justify-center gap-1.5" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-[#044444] dark:bg-[#44AAAA] animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF0000] animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#044444] dark:bg-[#44AAAA] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
