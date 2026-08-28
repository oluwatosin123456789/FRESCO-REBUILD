'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, LogOut, X } from 'lucide-react'
import { getRoleAuthConfig, type RoleKey } from '@/components/auth/role-auth-config'
import { clearClientSession, readClientSession } from '@/lib/auth/client-session'
import type { WorkspaceUser } from './workspace-shell'

/**
 * Role-aware sign-out confirmation dialog. Mounted once from the shared
 * workspace shell so every role (farmer, consumer, wema) gets a consistent,
 * professionally styled sign-out flow tinted with the role's workspace accent.
 */
export function SignOutDialog({
  open,
  onClose,
  role,
  user,
}: {
  open: boolean
  onClose: () => void
  role: RoleKey
  user: WorkspaceUser
}) {
  const cfg = getRoleAuthConfig(role)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const confirmSignOut = () => {
    clearClientSession()
    window.location.assign(cfg.loginPath)
  }

  const session = typeof window === 'undefined' ? null : readClientSession()
  const displayName = session?.name || user.name

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="signout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="signout-layer">
            <motion.div
              className="signout-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Sign out"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="signout-close" type="button" onClick={onClose} aria-label="Close dialog">
                <X size={16} strokeWidth={2.2} />
              </button>

              <span className="signout-icon">
                <LogOut size={21} strokeWidth={2.2} />
              </span>

              <div className="signout-eyebrow">{cfg.workspace}</div>
              <h2>Sign out of Fresco?</h2>

              <div className="signout-profile">
                <span className="signout-avatar">{user.initials}</span>
                <div>
                  <strong>{displayName}</strong>
                  <span>{user.sub}</span>
                </div>
              </div>

              <p className="signout-note">
                You&rsquo;ll be returned to the {role} sign-in page and can sign back in at any time.
              </p>

              <div className="signout-actions">
                <button className="signout-cancel" type="button" onClick={onClose}>
                  Cancel
                </button>
                <button className="signout-confirm" type="button" onClick={confirmSignOut}>
                  Sign out <ArrowRight size={14} strokeWidth={2.4} />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}