import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Plus_Jakarta_Sans, Playfair_Display, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import ConditionalHeaderFooter from '@/components/ui/ConditionalHeaderFooter'
import LoadingSplash from '@/components/ui/LoadingSplash'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Theme: prevent flash of dark mode by clearing dark class before paint
const themeScript = `(function(){try{var d=typeof document!=='undefined'?document.documentElement:null;if(d)d.classList.remove('dark');}catch(e){}})();`

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PHAfrique Project | Public Health en Afrique — Advancing Health Across the Continent',
  description: 'PHAfrique Project advances public health in Africa through innovative programs, community resilience, mental health advocacy, and partnerships that address social determinants of health.',
  keywords: 'public health, Africa, PHAfrique, health programs, community health, mental health, WASH, maternal health',
  authors: [{ name: 'PHAfrique Project' }],
  openGraph: {
    title: 'PHAfrique Project',
    description: 'A healthier Africa where every individual and community thrives.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" className={`${sans.variable} ${playfair.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#FFFCFF] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased">
        <Script id="ph-theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <ThemeProvider>
          <LoadingSplash />
          <ConditionalHeaderFooter>{children}</ConditionalHeaderFooter>
        </ThemeProvider>
      </body>
    </html>
  )
}

