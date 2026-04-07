'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'
import { imageSrc } from '@/lib/image-url'

import InternshipHeroImg from '../../../public/assets/images/opportunities/internship-hero.jpg'
import PublicHealthInternImg from '../../../public/assets/images/programs/public-health-research-intern.jpg'
import CapacityBuildingImg from '../../../public/assets/images/programs/capacity-building.jpg'
import VolunteerHeroImg from '../../../public/assets/images/portfolios/2.jpg'
import VolunteerWithPhaImg from '../../../public/assets/images/programs/SOS MENHEMA - Project Hope/IMG_5851.jpeg'

type Opp = {
  id: string
  title: string
  slug: string
  type: string // INTERNSHIP | VOLUNTEER (or legacy internship/volunteering)
  description: string | null
  imageUrl?: string | null
  location?: string | null
  duration?: string | null
  roleOverview?: string | null
  requirements?: string | null
  whatYouGain?: string | null
  startDate?: string | null
  expiryDate?: string | null
  isActive: boolean
}

// Types for interns and volunteers (backend-ready structure)
type Intern = {
  id: string
  name: string
  role: string
  imageUrl: string | null
  bio: string | null
  linkedInUrl: string | null
  sortOrder: number
}

type Volunteer = {
  id: string
  name: string
  role: string
  imageUrl: string | null
  bio: string | null
  linkedInUrl: string | null
  sortOrder: number
}

// ============================================
// INTERNSHIP CONFIGURATION
// ============================================
// Toggle this to open/close internship applications
const INTERNSHIP_CONFIG = {
  internshipsOpen: true, // Set to false to close applications
  nextOpeningDate: 'March 1, 2026', // Next opening date when closed
}

// Resolve opportunity image: API may return relative path (e.g. uploads/images/x.jpg) or absolute (/uploads/...). Use placeholder when missing.
const OPPORTUNITY_IMAGE_PLACEHOLDER = '/assets/images/opportunities/internship-hero.jpg'
function opportunityImageUrl(url: string | null | undefined): string {
  if (url == null || String(url).trim() === '') return OPPORTUNITY_IMAGE_PLACEHOLDER
  return imageSrc(String(url).trim())
}

// Split multiline text into non-empty lines for bullet list display
function linesToBullets(text: string | null | undefined): string[] {
  if (text == null || String(text).trim() === '') return []
  return String(text)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Type checks: handle both uppercase (INTERNSHIP, VOLUNTEER) and lowercase (internship, volunteering) for SQLite compatibility
function isInternshipOpportunity(type: string | undefined): boolean {
  const t = (type ?? '').toLowerCase()
  return t === 'internship'
}
function isVolunteerOpportunity(type: string | undefined): boolean {
  const t = (type ?? '').toLowerCase()
  return t === 'volunteer' || t === 'volunteering'
}

export default function OpportunitiesPage() {
  const [list, setList] = useState<Opp[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [applyFor, setApplyFor] = useState<Opp | null>(null)
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    country: '', 
    publicHealthIssues: '', 
    qualification: '', 
    resumeUrl: '', 
    internshipInterest: '',
    cvFile: null as File | null,
    resumeFile: null as File | null
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const [discoverModalType, setDiscoverModalType] = useState<'internship' | 'volunteer' | null>(null)

  // Load opportunities and participants (interns/volunteers) from API – only admin-added data is shown
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch('/api/opportunities').then((r) => r.json()).catch(() => []),
      fetch('/api/participants')
        .then(async (r) => {
          if (!r.ok) return []
          const j = await r.json()
          return Array.isArray(j) ? j : []
        })
        .catch(() => []),
    ]).then(([oppList, participantList]) => {
      if (cancelled) return
      setList(Array.isArray(oppList) ? oppList : [])
      const all = Array.isArray(participantList) ? participantList : []
      const internList = all
        .filter((p: { type: string }) => String(p.type).toUpperCase() === 'INTERN')
        .map((p: { id: string; name: string; role: string; imageUrl: string | null; bio: string | null; linkedInUrl?: string | null; sortOrder: number }) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          imageUrl: p.imageUrl || null,
          bio: p.bio || null,
          linkedInUrl: p.linkedInUrl || null,
          sortOrder: p.sortOrder ?? 0,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
      const volunteerList = all
        .filter((p: { type: string }) => String(p.type).toUpperCase() === 'VOLUNTEER')
        .map((p: { id: string; name: string; role: string; imageUrl: string | null; bio: string | null; linkedInUrl?: string | null; sortOrder: number }) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          imageUrl: p.imageUrl || null,
          bio: p.bio || null,
          linkedInUrl: p.linkedInUrl || null,
          sortOrder: p.sortOrder ?? 0,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
      setInterns(internList)
      setVolunteers(volunteerList)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Refetch opportunities when Discover modal opens so the list is up to date from admin
  useEffect(() => {
    if (discoverModalType == null) return
    fetch('/api/opportunities')
      .then((r) => r.json())
      .then(setList)
      .catch(() => {})
  }, [discoverModalType])

  // Refetch participants when window gains focus (e.g. after adding in admin in another tab)
  useEffect(() => {
    function onFocus() {
      fetch('/api/participants')
        .then(async (r) => {
          if (!r.ok) return []
          const j = await r.json()
          return Array.isArray(j) ? j : []
        })
        .catch(() => [])
        .then((all) => {
          const internList = all
            .filter((p: { type: string }) => String(p.type).toUpperCase() === 'INTERN')
            .map((p: { id: string; name: string; role: string; imageUrl: string | null; bio: string | null; linkedInUrl?: string | null; sortOrder: number }) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              imageUrl: p.imageUrl || null,
              bio: p.bio || null,
              linkedInUrl: p.linkedInUrl || null,
              sortOrder: p.sortOrder ?? 0,
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder)
          const volunteerList = all
            .filter((p: { type: string }) => String(p.type).toUpperCase() === 'VOLUNTEER')
            .map((p: { id: string; name: string; role: string; imageUrl: string | null; bio: string | null; linkedInUrl?: string | null; sortOrder: number }) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              imageUrl: p.imageUrl || null,
              bio: p.bio || null,
              linkedInUrl: p.linkedInUrl || null,
              sortOrder: p.sortOrder ?? 0,
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder)
          setInterns(internList)
          setVolunteers(volunteerList)
        })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  function openApply(o: Opp) {
    setApplyFor(o)
    setForm({ 
      name: '', 
      email: '', 
      phone: '', 
      country: '', 
      publicHealthIssues: '', 
      qualification: '', 
      resumeUrl: '', 
      internshipInterest: '',
      cvFile: null,
      resumeFile: null
    })
    setDone(false)
    setErr('')
  }
  
  function openInternshipApplication() {
    if (!INTERNSHIP_CONFIG.internshipsOpen) return
    const first = internships[0]
    if (!first) return
    setApplyFor(first)
    setForm({ name: '', email: '', phone: '', country: '', publicHealthIssues: '', qualification: '', resumeUrl: '', internshipInterest: '', cvFile: null, resumeFile: null })
    setDone(false)
    setErr('')
  }
  function openVolunteerApplication() {
    const first = volunteering[0]
    if (!first) return
    setApplyFor(first)
    setForm({
      name: '',
      email: '',
      phone: '',
      country: '',
      publicHealthIssues: '',
      qualification: '',
      resumeUrl: '',
      internshipInterest: '',
      cvFile: null,
      resumeFile: null,
    })
    setDone(false)
    setErr('')
  }
  function closeApply() {
    setApplyFor(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!applyFor) return
    if (!form.name.trim() || !form.email.trim()) { setErr('Name and email are required'); return }

    const isInternshipForm = isInternshipOpportunity(applyFor.type)
    if (isInternshipForm) {
      if (!form.country.trim()) { 
        setErr('Country of Residence is required'); 
        return 
      }
      if (!form.qualification.trim()) {
        setErr('School / University is required')
        return 
      }
      if (!form.publicHealthIssues.trim()) {
        setErr('Major / Field of study is required')
        return 
      }
      if (!form.internshipInterest.trim()) {
        setErr('Year of study is required')
        return 
      }
      if (!form.cvFile) { 
        setErr('Please upload your CV'); 
        return 
      }
    }
    
    setBusy(true)
    setErr('')
    
    // Prepare form data
    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('email', form.email.trim())
    if (form.phone.trim()) formData.append('phone', form.phone.trim())

    if (isInternshipForm) {
      formData.append('country', form.country.trim())
      formData.append('internshipInterest', form.internshipInterest)
      formData.append('publicHealthIssues', form.publicHealthIssues.trim())
      formData.append('qualification', form.qualification.trim())
      if (form.cvFile) formData.append('cv', form.cvFile)
    } else {
      if (form.publicHealthIssues.trim()) formData.append('message', form.publicHealthIssues.trim())
      if (form.resumeFile) formData.append('cv', form.resumeFile)
    }
    
    const r = await fetch(`/api/opportunities/${applyFor.id}/apply`, {
      method: 'POST',
      body: formData,
    })
    const j = await r.json()
    setBusy(false)
    if (!r.ok) { setErr(j.error || 'Application failed'); return }
    setDone(true)
  }

  const inp = 'w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm shadow-sm focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all duration-200'

  // Dynamic list for Discover modal only; main page card is static
  const internships = list.filter((o) => isInternshipOpportunity(o.type))
  const volunteering = list.filter((o) => isVolunteerOpportunity(o.type))
  const now = new Date()

  return (
    <div className="pt-20">
      <PageHero title="Internships & Volunteering" />

      {/* Internships Section */}
      <section className="pt-6 md:pt-8 pb-12 md:pb-16 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          {/* Visual Hero Banner - Similar to Volunteering but with #044444 */}
          <div className="relative rounded-3xl overflow-hidden mb-12 md:mb-16 h-64 md:h-80">
            <Image
              src={InternshipHeroImg}
              alt="Internship Opportunities"
              fill
              className="object-cover"
              sizes="100vw"
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#044444]/40 via-[#044444]/55 to-[#044444]/75" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="h-0.5 w-12 bg-white/60" aria-hidden />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    Internships
                  </h2>
                  <div className="h-0.5 w-12 bg-white/60" aria-hidden />
                </div>
                <p className="text-white text-base md:text-lg max-w-2xl mx-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  Gain hands-on experience in public health initiatives and contribute to meaningful projects across Africa
                </p>
              </div>
            </div>
          </div>

          {/* Hero Card - Static content (no dynamic admin data); Discover button opens the modal */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-800/60 rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-700/50">
              <div className="flex flex-col md:flex-row">
                {/* Left Side - Static content */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                      Internship Program
                    </h3>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                        The PHA Internship Program offers early-career public health students and graduates an
                        opportunity to gain hands-on experience in community-focused public health across our four
                        pillars: Mental Health, Environmental Health, Ethics, and Maternal &amp; Child Health. This fully
                        online program connects interns across Africa giving them the flexibility to contribute
                        meaningfully to real organisational projects while building practical skills in research,
                        writing, content development, digital advocacy, teamwork, and professional communication.
                      </p>
                      <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                        Interns work within their respective portfolios, completing weekly tasks, collaborating with
                        peers, and producing tangible outputs such as educational materials, articles, social media
                        content, campaign resources, newsletters, and grant-related documents. The program is designed
                        to support personal and professional growth, offering mentorship, feedback, leadership
                        opportunities, and the chance to remain involved with PHA after completion.
                      </p>
                      <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
                        If you are passionate about public health, eager to learn, and excited to contribute to a
                        pan-African organisation rooted in the ethos “Put Africa First,” this program offers a
                        meaningful space to grow, create, and make an impact. Download the full Internship Program
                        Booklet below to learn more about the structure, expectations, and opportunities available.
                      </p>
                    </div>
                  </div>

                  {/* Download booklet (or Coming Soon) */}
                  <div className="mt-6">
                    {!INTERNSHIP_CONFIG.internshipsOpen ? (
                      <div className="bg-gradient-to-r from-[#044444]/10 via-[#044444]/5 to-[#044444]/10 dark:from-[#044444]/20 dark:via-[#044444]/10 dark:to-[#044444]/20 rounded-xl p-6 border-2 border-[#044444]/30 dark:border-[#044444]/40">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <svg className="h-7 w-7 text-[#044444] dark:text-[#44AAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-[#044444] dark:text-[#44AAAA] text-lg">
                            Coming Soon
                          </h4>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="h-5 w-5 text-[#044444] dark:text-[#44AAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300">
                            We will resume intake on <strong className="text-[#044444] dark:text-[#44AAAA]">{INTERNSHIP_CONFIG.nextOpeningDate}</strong>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href="https://drive.google.com/file/d/170YcjMbMM8SdgPQWk7xjnpVH1v2NxY-9/view"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full md:w-auto items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-[#044444] to-[#033333] hover:from-[#033333] hover:to-[#022222] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          Download Booklet
                        </a>
                        <button
                          type="button"
                          onClick={openInternshipApplication}
                          className="inline-flex w-full md:w-auto items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF0000] to-[#CC0000] hover:from-[#CC0000] hover:to-[#990000] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          Apply Today
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Side - Sequential images (fully visible) */}
                <div className="w-full md:w-1/2 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 h-64 md:h-full">
                    <div className="relative flex-1 min-h-[88px] rounded-2xl overflow-hidden shadow-md bg-neutral-50 dark:bg-neutral-900/40">
                      <Image
                        src={PublicHealthInternImg}
                        alt="PHA internship program — interns collaborating"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder="blur"
                      />
                    </div>
                    <div className="relative flex-1 min-h-[88px] rounded-2xl overflow-hidden shadow-md bg-neutral-50 dark:bg-neutral-900/40">
                      <Image
                        src={CapacityBuildingImg}
                        alt="Capacity building session"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder="blur"
                      />
                    </div>
                    <div className="relative flex-1 min-h-[88px] rounded-2xl overflow-hidden shadow-md bg-neutral-50 dark:bg-neutral-900/40">
                      <Image
                        src={PublicHealthInternImg}
                        alt="Public health research internship"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder="blur"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteering Section - static hero card + Discover button (same pattern as Internship) */}
      <section id="volunteering-section" className="scroll-mt-28 pt-12 md:pt-16 pb-12 md:pb-16 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          {/* Visual Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-12 md:mb-16 h-64 md:h-80">
            <Image
              src={VolunteerHeroImg}
              alt="Volunteer Opportunities"
              fill
              className="object-cover"
              sizes="100vw"
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF0000]/40 via-[#FF0000]/55 to-[#FF0000]/75" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="h-0.5 w-12 bg-white/60" aria-hidden />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                    Volunteering
                  </h2>
                  <div className="h-0.5 w-12 bg-white/60" aria-hidden />
                </div>
                <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
                  Make a meaningful impact by volunteering your time and skills to support public health initiatives
                </p>
              </div>
            </div>
          </div>

          {/* Hero Card - Static content; Discover button opens volunteer-only modal */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-800/60 rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-700/50">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                      Volunteer with PHA
                    </h3>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                        Join our volunteer network and contribute to public health programs across Africa. Whether you support community outreach, health education, or program coordination, your time and skills help drive real impact.
                      </p>
                      <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
                        Explore current volunteer roles below and apply to the opportunity that fits your interests and availability.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={openVolunteerApplication}
                      className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#990000] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Apply Today
                    </button>
                  </div>
                </div>
                <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                  <Image
                    src={VolunteerWithPhaImg}
                    alt="Volunteer with PHA"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    placeholder="blur"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Modal - internships or volunteering from admin (filtered by discoverModalType) */}
      {discoverModalType !== null && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-20 md:pt-24">
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl max-h-[calc(100vh-6rem)] border-2 border-[#044444]/20 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-700 shrink-0 bg-white dark:bg-neutral-800">
              <h2 className="text-xl font-bold text-[#044444] dark:text-[#44AAAA]">
                {discoverModalType === 'internship' ? 'Discover Internship Opportunities' : 'Discover Volunteering Opportunities'}
              </h2>
              <button
                type="button"
                onClick={() => setDiscoverModalType(null)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 min-h-0">
              {(() => {
                const listToShow = discoverModalType === 'internship' ? internships : volunteering
                const emptyMessage = discoverModalType === 'internship'
                  ? 'No internship opportunities at the moment. Check back later.'
                  : 'No volunteer opportunities at the moment. Check back later.'
                if (listToShow.length === 0) {
                  return (
                    <p className="text-neutral-500 text-center py-8 break-words">{emptyMessage}</p>
                  )
                }
                return listToShow.map((opp) => {
                  const closed = opp.expiryDate ? new Date(opp.expiryDate) < now : false
                  const postedDate = opp.startDate ? new Date(opp.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null
                  const expiresDate = opp.expiryDate ? new Date(opp.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null
                  return (
                    <article
                      key={opp.id}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-800/80 shadow-md hover:shadow-lg hover:border-[#044444]/50 transition-all duration-200 flex flex-col max-h-[min(75vh,640px)]"
                    >
                      <div className="flex-1 flex flex-col min-w-0 min-h-0 p-4 sm:p-5">
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                          {/* Floated image on desktop, full-width on mobile */}
                          <div className="w-full mb-3 sm:float-left sm:w-56 sm:mr-6 sm:mb-4 rounded-xl overflow-hidden shadow-md bg-neutral-200 dark:bg-neutral-700 shrink-0">
                            <div className="relative w-full h-[180px] sm:h-[200px]">
                              <Image
                                src={opportunityImageUrl(opp.imageUrl)}
                                alt={opp.title}
                                fill
                                className="object-cover object-top"
                                sizes="(max-width: 640px) 100vw, 224px"
                              />
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 shrink-0">{opp.title}</h3>
                          {opp.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 break-words whitespace-pre-wrap">{opp.description}</p>
                          )}
                          {opp.roleOverview && (
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed break-words whitespace-pre-wrap">{opp.roleOverview}</p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-1">
                            {postedDate && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-700/80 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Posted {postedDate}
                              </span>
                            )}
                            {expiresDate && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-700/80 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Closes {expiresDate}
                              </span>
                            )}
                            {opp.location && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-700/80 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {opp.location}
                              </span>
                            )}
                            {opp.duration && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-700/80 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {opp.duration}
                              </span>
                            )}
                          </div>

                          {opp.requirements && (() => {
                            const bullets = linesToBullets(opp.requirements)
                            if (bullets.length === 0) return null
                            return (
                              <div className="mt-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/50 p-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Requirements</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                  {bullets.map((line, i) => (
                                    <li key={i}>{line}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          })()}

                          {opp.whatYouGain && (() => {
                            const bullets = linesToBullets(opp.whatYouGain)
                            if (bullets.length === 0) return null
                            return (
                              <div className="mt-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/50 p-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">What you&apos;ll gain</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                  {bullets.map((line, i) => (
                                    <li key={i}>{line}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          })()}

                          <div className="clear-both" />
                        </div>

                        <div className="shrink-0 pt-3 mt-auto border-t border-neutral-100 dark:border-neutral-700/50 flex justify-center">
                          {closed ? (
                            <span className="inline-block w-fit px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed">
                              Applications Closed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openApply(opp)}
                              className="w-full sm:w-fit sm:px-6 rounded-xl bg-gradient-to-r from-[#044444] to-[#033333] hover:from-[#033333] hover:to-[#022222] text-white font-semibold px-4 py-2.5 text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {applyFor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-2xl max-h-[92vh] rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl border border-[#044444]/20 flex flex-col overflow-hidden"
            role="dialog"
            aria-labelledby="application-sheet-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between shrink-0 p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-[#044444]/10 to-[#FF0000]/10 dark:from-[#044444]/20 dark:to-[#FF0000]/20">
              <div className="flex-1 min-w-0 pr-3">
                {isInternshipOpportunity(applyFor.type) ? (
                  <h2 id="application-sheet-title" className="text-lg md:text-2xl font-extrabold text-[#044444] dark:text-[#44AAAA]">
                    Internship Application Form
                  </h2>
                ) : (
                  <>
                    <h2 id="application-sheet-title" className="text-lg md:text-2xl font-extrabold text-[#044444] dark:text-[#44AAAA]">
                      Volunteer Application Form
                    </h2>
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300">
                      Apply to volunteer with Public Health en Afrique
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={closeApply}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shrink-0"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0">
            {done ? (
              <div className="py-6 md:py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#044444] dark:text-[#44AAAA] font-semibold mb-2">Application submitted successfully!</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">We&apos;ll review your application and get back to you soon.</p>
                <button type="button" onClick={closeApply} className="rounded-xl bg-gradient-to-r from-[#044444] to-[#033333] hover:from-[#033333] hover:to-[#022222] text-white font-semibold px-5 py-2.5 text-sm shadow-md hover:shadow-lg transition-all duration-200">Close</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5 pb-4">
                {err && (
                  <div className="rounded-lg border border-[#FF0000]/30 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-[#FF0000]">
                    {err}
                  </div>
                )}
                {applyFor && isInternshipOpportunity(applyFor.type) ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name *</label>
                      <input placeholder="Your full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inp} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Email *</label>
                      <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inp} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Contact Number</label>
                      <input type="tel" placeholder="Optional" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Country of Residence *</label>
                      <input placeholder="Your country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className={inp} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        School / University studying at *
                      </label>
                      <input
                        placeholder="e.g. University of Johannesburg"
                        value={form.qualification}
                        onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                        className={inp}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        Major / Field of study *
                      </label>
                      <input
                        placeholder="e.g. Public Health"
                        value={form.publicHealthIssues}
                        onChange={(e) => setForm((f) => ({ ...f, publicHealthIssues: e.target.value }))}
                        className={inp}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        Year of study *
                      </label>
                      <input
                        placeholder="e.g. Year 2 / 2026"
                        value={form.internshipInterest}
                        onChange={(e) => setForm((f) => ({ ...f, internshipInterest: e.target.value }))}
                        className={inp}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        Upload your CV *
                      </label>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">One file, max 10 MB. PDF or Word.</p>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setForm((f) => ({ ...f, cvFile: file, resumeUrl: file.name }))
                          }
                        }}
                        className="block w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#044444] file:text-white hover:file:bg-[#033333] cursor-pointer"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Name *</label>
                      <input placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inp} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Email *</label>
                      <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inp} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">Phone</label>
                      <input type="tel" placeholder="Optional" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Message / cover note</label>
                      <textarea placeholder="Your message" value={form.publicHealthIssues} onChange={(e) => setForm((f) => ({ ...f, publicHealthIssues: e.target.value }))} className={inp} rows={3} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        Upload your resume / CV
                      </label>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">One file, max 10 MB. PDF or Word.</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setForm((f) => ({ ...f, resumeFile: file }))
                        }}
                        className="block w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#044444] file:text-white hover:file:bg-[#033333] cursor-pointer"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-gradient-to-r from-[#044444] to-[#033333] hover:from-[#033333] hover:to-[#022222] text-white font-semibold px-5 py-3 text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100">
                    {busy ? 'Sending...' : 'Submit Application'}
                  </button>
                  <button type="button" onClick={closeApply} className="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-colors duration-200">
                    Cancel
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
