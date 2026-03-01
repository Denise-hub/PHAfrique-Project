'use client'

import React from 'react'
import { useState } from 'react'
import PageHero from '@/components/ui/PageHero'

const NEED_OPTIONS = [
  { value: '', label: '— Select —' },
  { value: 'partnership', label: 'Partnership opportunities' },
  { value: 'volunteer', label: 'Volunteering' },
  { value: 'internship', label: 'Internship' },
  { value: 'donation', label: 'Support / Donation' },
  { value: 'programs', label: 'Program information' },
  { value: 'media', label: 'Media enquiry' },
  { value: 'general', label: 'General inquiry' },
  { value: 'other', label: 'Other' },
]

const SOCIAL = [
  { href: 'https://twitter.com/ph_afrique', label: 'X (Twitter)', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { href: 'https://www.instagram.com/ph_afrique/', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { href: 'https://wa.me/27766510576', label: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
  { href: 'https://m.facebook.com/phafrique/', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { href: 'https://www.youtube.com/@PublicHealthenAfrique', label: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { href: 'https://www.linkedin.com/company/public-health-en-afrique', label: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
]

const inputClass =
  'w-full rounded-lg border-0 bg-neutral-50 dark:bg-neutral-800/50 px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 shadow-md shadow-neutral-200/50 dark:shadow-neutral-900/50 focus:bg-white dark:focus:bg-neutral-800 focus:shadow-lg focus:shadow-[#044444]/20 focus:outline-none transition-all duration-200'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', need: '', message: '' })
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {}
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!form.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setStatus('sending')
    setErrors({})
    
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          need: form.need || undefined,
          message: form.message.trim(),
        }),
      })
      const j = await r.json()
      if (r.ok && j.ok) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', need: '', message: '' })
        // Scroll to success message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="pt-20">
      <PageHero title="Get in Touch" />

      {/* Form + Contact */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24 bg-neutral-50 dark:bg-neutral-950">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0 overflow-hidden rounded-3xl shadow-2xl">
              {/* Form Section - Left Side */}
              <div className="bg-white dark:bg-neutral-900 p-6 md:p-7 lg:p-8">
                {/* Header with icon */}
                <div className="mb-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#044444]/10 dark:bg-[#044444]/20">
                      <svg className="h-4.5 w-4.5 text-[#044444] dark:text-[#044444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      Send Us a Message
                    </h2>
                  </div>
                </div>
                
                {/* Success message */}
                {status === 'success' && (
                  <div className="mb-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Message sent successfully!</p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">We&apos;ll get back to you soon.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {status === 'error' && (
                  <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-900/15 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-[#FF0000] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-[#FF0000]">Something went wrong</p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">Please try again or email us at <a href="mailto:info@phafrique.com" className="underline">info@phafrique.com</a>.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Your Name <span className="text-[#FF0000]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`${inputClass} ${errors.name ? 'bg-red-50/50 dark:bg-red-900/5 focus:bg-red-50/50 dark:focus:bg-red-900/5' : ''}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-[#FF0000] flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Your Email <span className="text-[#FF0000]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`${inputClass} ${errors.email ? 'bg-red-50/50 dark:bg-red-900/5 focus:bg-red-50/50 dark:focus:bg-red-900/5' : ''}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#FF0000] flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="need" className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Subject
                    </label>
                    <select
                      id="need"
                      name="need"
                      value={form.need}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {NEED_OPTIONS.map((o) => (
                        <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Message <span className="text-[#FF0000]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      className={`${inputClass} resize-none ${errors.message ? 'bg-red-50/50 dark:bg-red-900/5 focus:bg-red-50/50 dark:focus:bg-red-900/5' : ''}`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-[#FF0000] flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full rounded-lg font-semibold py-2.5 px-4 text-sm shadow-lg hover:shadow-xl hover:shadow-[#044444]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ 
                      background: 'linear-gradient(135deg, #044444 0%, #044444 50%, #044444 100%)',
                      color: '#FF0000'
                    }}
                  >
                    {status === 'sending' ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" style={{ color: '#FF0000' }}>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FF0000' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information Section - Right Side with Brand Color Background */}
              <div className="relative p-6 md:p-7 lg:p-8 text-white overflow-hidden" style={{ 
                background: 'linear-gradient(135deg, #044444 0%, #044444 50%, #044444 100%)'
              }}>
                {/* Professional gradient accent overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#044444]/90 via-transparent to-[#044444]/80" aria-hidden />
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#044444]/15 via-[#044444]/5 to-transparent rounded-full blur-3xl" aria-hidden />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-[#044444]/20 via-[#044444]/8 to-transparent rounded-full blur-2xl" aria-hidden />
                <div className="absolute top-1/2 right-1/4 w-36 h-36 bg-gradient-to-r from-[#044444]/8 via-[#044444]/3 to-transparent rounded-full blur-xl" aria-hidden />
                
                <div className="relative z-10">
                  {/* Header with icon */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <svg className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold" style={{ color: '#FF0000' }}>
                        Contact Information
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4 mb-5">
                    {/* Location */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-0.5">OUR LOCATION</p>
                        <p className="text-white text-xs leading-relaxed">Rosebank, Johannesburg, South Africa</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-0.5">PHONE NUMBER</p>
                        <a href="tel:+27766510576" className="text-white text-xs hover:text-white/80 transition-colors">
                          +27 76 651 0576
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2.5">FOLLOW US</p>
                    <div className="flex flex-wrap gap-2">
                      {SOCIAL.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-200 hover:scale-110"
                          aria-label={s.label}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d={s.icon} />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
