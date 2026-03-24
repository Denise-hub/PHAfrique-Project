/**
 * RBAC: role definitions and section permissions.
 * Sections match admin nav: dashboard, programs, projects, opportunities, applications, news, content, gallery.
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  // ADMIN has full access to all admin sections (same as SUPER_ADMIN)
  ADMIN: 'ADMIN',
  CO_FOUNDER: 'CO_FOUNDER',
  SOCIAL_MEDIA_MANAGER: 'SOCIAL_MEDIA_MANAGER',
  NEWSLETTER_MANAGER: 'NEWSLETTER_MANAGER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export type AdminSection =
  | 'dashboard'
  | 'programs'
  | 'projects'
  | 'opportunities'
  | 'applications'
  | 'news'
  | 'content'
  | 'gallery'
  | 'users'
  | 'profile'

const SECTION_ACCESS: Record<Role, AdminSection[]> = {
  [ROLES.SUPER_ADMIN]: [
    'dashboard',
    'opportunities',
    'applications',
    'content',
    'users',
    'profile',
  ],
  [ROLES.ADMIN]: [
    'dashboard',
    'opportunities',
    'applications',
    'content',
    'users',
    'profile',
  ],
  [ROLES.CO_FOUNDER]: [
    'dashboard',
    'opportunities',
    'applications',
    'content',
    'users',
    'profile',
  ],
  [ROLES.SOCIAL_MEDIA_MANAGER]: [
    'dashboard',
    'opportunities',
    'applications',
    'content',
    'users',
    'profile',
  ],
  [ROLES.NEWSLETTER_MANAGER]: ['dashboard', 'opportunities', 'profile'],
}

export function canAccessSection(role: string | null | undefined, section: AdminSection): boolean {
  if (!role) return false
  const sections = SECTION_ACCESS[role as Role]
  if (!sections) return false
  return sections.includes(section)
}

/** Resolve effective role for display/UI: missing role (legacy session) is treated as SUPER_ADMIN so sidebar and access work. */
export function effectiveRole(role: string | null | undefined): string {
  if (role && SECTION_ACCESS[role as Role]) return role
  return ROLES.SUPER_ADMIN
}

export function getSectionsForRole(role: string | null | undefined): AdminSection[] {
  const r = effectiveRole(role)
  return SECTION_ACCESS[r as Role] ?? []
}
