'use client'

import React from 'react'

/**
 * No-op permission gate: renders children. RBAC is enforced in AdminShell (nav) and API (requireSection).
 * Kept for backward compatibility if any admin page imports this.
 */
export default function PermissionGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return <>{children}</>
}
