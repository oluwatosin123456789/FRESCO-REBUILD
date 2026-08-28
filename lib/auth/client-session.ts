'use client'

export type ClientSession = {
  role: string
  name: string
  email: string
  avatar?: string
}

/**
 * Persists a demo workspace session so role pages resolve correctly.
 * Mirrors the previous simulation-based login: a localStorage record plus a
 * cookie consumed by the shell/navigation. Safe to call from any client page.
 */
export function createClientSession(role: string, name: string, email: string, avatar?: string) {
  if (typeof window === 'undefined') return
  const session: ClientSession = { role, name, email, avatar }
  window.localStorage.setItem('fresco_session', JSON.stringify(session))
  window.localStorage.setItem('fresco_role', role)
  document.cookie = `fresco_session=${role}; path=/; max-age=86400`
}

export function readClientSession(): ClientSession | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem('fresco_session')
  if (!raw) return null
  try {
    return JSON.parse(raw) as ClientSession
  } catch {
    return null
  }
}

export function clearClientSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('fresco_session')
  window.localStorage.removeItem('fresco_role')
  document.cookie = 'fresco_session=; path=/; max-age=0'
}