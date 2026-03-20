import React from 'react'
import Link from 'next/link'

const SOCIAL = [
  { 
    href: 'https://wa.me/27766510576', 
    label: 'WhatsApp',
    icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:from-green-600 hover:to-green-700',
  },
  { 
    href: 'https://twitter.com/ph_afrique', 
    label: 'X (Twitter)',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    color: 'from-neutral-800 to-neutral-900',
    hoverColor: 'hover:from-neutral-900 hover:to-black',
  },
  { 
    href: 'https://www.linkedin.com/company/public-health-en-afrique', 
    label: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    color: 'from-blue-600 to-blue-700',
    hoverColor: 'hover:from-blue-700 hover:to-blue-800',
  },
  { 
    href: 'https://www.instagram.com/ph_afrique/', 
    label: 'Instagram',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    color: 'from-purple-500 via-pink-500 to-orange-500',
    hoverColor: 'hover:from-purple-600 hover:via-pink-600 hover:to-orange-600',
  },
  { 
    href: 'https://m.facebook.com/phafrique/', 
    label: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    color: 'from-blue-600 to-blue-700',
    hoverColor: 'hover:from-blue-700 hover:to-blue-800',
  },
  {
    href: 'https://www.youtube.com/@PublicHealthenAfrique',
    label: 'YouTube',
    icon: 'M23.498 6.186a2.945 2.945 0 00-2.073-2.082C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.425.504A2.945 2.945 0 00.502 6.186 30.11 30.11 0 000 12a30.11 30.11 0 00.502 5.814 2.945 2.945 0 002.073 2.082C4.4 20.4 12 20.4 12 20.4s7.6 0 9.425-.504a2.945 2.945 0 002.073-2.082A30.11 30.11 0 0024 12a30.11 30.11 0 00-.502-5.814zM9.6 15.6V8.4L15.84 12 9.6 15.6z',
    color: 'from-red-600 to-red-700',
    hoverColor: 'hover:from-red-700 hover:to-red-800',
  },
  {
    href: 'https://www.tiktok.com/@phafrique_2024?is_from_webapp=1&sender_device=pc',
    label: 'TikTok',
    icon: 'M16.707 0c.356 3.39 2.284 5.433 5.293 5.64V9.1c-1.797.11-3.266-.47-5.2-1.74v7.29c0 5.26-5.73 8.94-10.79 6.74-2.21-.96-3.85-3.11-4-5.73-.37-6.17 5.61-10.1 11.4-7.85v3.72c-.33-.1-.65-.16-.98-.18-2.34-.14-4.34 1.86-4.21 4.21.09 1.63 1.23 3.03 2.81 3.39 2.03.47 3.92-.99 3.92-2.92V0h2.74z',
    color: 'from-neutral-800 to-neutral-900',
    hoverColor: 'hover:from-neutral-900 hover:to-black',
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
      <div className="container-custom py-6 md:py-8">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-5 w-full">
            <div className="inline-flex items-center gap-3">
              <span className="hidden sm:inline-block h-[2px] w-10 sm:w-14 rounded-full bg-gradient-to-r from-[#044444] to-[#FF0000]" />
              <h3 className="text-neutral-900 dark:text-white font-extrabold text-xl sm:text-2xl tracking-tight">
                Contact Us
              </h3>
              <span className="hidden sm:inline-block h-[2px] w-10 sm:w-14 rounded-full bg-gradient-to-r from-[#FF0000] to-[#044444]" />
            </div>

            <div className="mt-5 w-full max-w-md mx-auto space-y-4 sm:translate-x-12 md:translate-x-16 lg:translate-x-20">
              {/* Location */}
              <div className="grid grid-cols-[48px_1fr] items-start gap-4 text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/10">
                  <svg className="h-5 w-5 text-neutral-700 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-neutral-600 dark:text-white/80 uppercase">
                    Our Location
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-semibold text-neutral-900 dark:text-white break-words">
                    Rosebank, Johannesburg, South Africa
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-[48px_1fr] items-start gap-4 text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/10">
                  <svg className="h-5 w-5 text-neutral-700 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3l2 5-2 1c1.2 2.8 3.4 5 6.2 6.2l1-2 5 2v3a2 2 0 01-2 2c-8.284 0-15-6.716-15-15z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-neutral-600 dark:text-white/80 uppercase">
                    Phone Number
                  </p>
                  <a
                    href="tel:+27766510576"
                    className="mt-1 inline-block text-sm sm:text-base font-semibold text-neutral-900 dark:text-white hover:text-[#044444] dark:hover:text-white/90 transition-colors"
                  >
                    +27 76 651 0576
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-[48px_1fr] items-start gap-4 text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/10">
                  <svg className="h-5 w-5 text-neutral-700 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-neutral-600 dark:text-white/80 uppercase">
                    Email
                  </p>
                  <a
                    href="mailto:info@phafrique.com"
                    className="mt-1 inline-block text-sm sm:text-base font-semibold text-neutral-900 dark:text-white hover:text-[#044444] dark:hover:text-white/90 transition-colors break-all"
                  >
                    info@phafrique.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            {SOCIAL.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${social.color} ${social.hoverColor} text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-0.5`}
                aria-label={social.label}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d={social.icon} />
                </svg>
                {/* Tooltip on hover */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom bar stays black in both modes */}
      <div className="bg-neutral-900 text-neutral-200">
        <div className="container-custom py-4">
          <p className="text-xs sm:text-sm font-medium text-center">
            ©{year} All rights reserved. Public Health en Afrique{' '}
            <span className="text-neutral-400">|</span>{' '}
            <Link
              href="/admin/login"
              className="text-neutral-200 hover:text-[#044444] transition-colors"
              aria-label="Admin login"
            >
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
