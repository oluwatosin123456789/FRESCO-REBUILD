'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { getRoleAuthConfig, type RoleKey } from './role-auth-config'
import { createClient } from '@/lib/supabase/client'
import { ROLE_AUTH_CSS } from '@/lib/auth/role-auth-css'
import HolographicBeams from '@/components/shared/holographic-beams'

/**
 * Password reset for each role. `?type=recovery` switches the form from
 * "request a reset link" to "set a new password" (the state Supabase returns
 * users to after the emailed recovery link is followed).
 */
export function RoleResetPage({ role }: { role: RoleKey }) {
  const cfg = getRoleAuthConfig(role)
  const [isRecovery, setIsRecovery] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()
  const Icon = cfg.icon

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = requestAnimationFrame(() => {
      setIsRecovery(new URLSearchParams(window.location.search).get('type') === 'recovery')
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const go = (to: string) => {
    if (typeof window !== 'undefined') window.location.assign(to)
  }

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/${role}/reset?type=recovery`
          : undefined
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })
      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }
      setSuccess(`Reset link sent to ${email.trim()}. Follow it to choose a new password.`)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
      setSuccess('Password updated. Sign in with your new password.')
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const shellVars = {
    '--roleauth-accent': cfg.accent,
    '--roleauth-accent-dark': cfg.accentDark,
    '--roleauth-ring': cfg.ring,
    '--roleauth-shadow': cfg.shadow,
    '--roleauth-glow-orb': cfg.glowOrb[0],
    '--roleauth-glow-orb2': cfg.glowOrb[1],
    '--roleauth-form-bg': cfg.formBg,
    '--roleauth-top': cfg.visual.gradient[0],
    '--roleauth-bottom': cfg.visual.gradient[1],
  } as React.CSSProperties

  return (
    <div className="roleauth-page">
      <section className="roleauth-shell" style={shellVars} aria-label="Password reset">
        <HolographicBeams className="roleauth-beams" opacity={70} />
        <section className="roleauth-panel roleauth-form-panel">

          <a
            href={`/${role}/login`}
            className="roleauth-back"
            onClick={(e) => {
              e.preventDefault()
              go(`/${role}/login`)
            }}
          >
            <ArrowLeft size={14} /> Back to sign in
          </a>

          <div className="roleauth-form-wrap">
            <div className="roleauth-form" style={{ animation: 'roleauth-rise .55s cubic-bezier(.77,0,.18,1) both' }}>
              <span className="roleauth-reset-icon">
                <Icon size={24} strokeWidth={1.8} />
              </span>

              <h1 className="roleauth-title">{isRecovery ? 'New Password' : 'Forgot Password?'}</h1>
              <p className="roleauth-eyebrow">
                {isRecovery
                  ? 'Choose a new password for your ' + cfg.roleLabel + ' account.'
                  : `We'll email you a secure link to reset your ${cfg.roleLabel} password.`}
              </p>

              {!isRecovery ? (
                <form onSubmit={requestReset}>
                  <div className="roleauth-field">
                    <label htmlFor="rr-email">Email</label>
                    <div className="roleauth-control">
                      <input
                        id="rr-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <button className="roleauth-primary" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              ) : (
                <form onSubmit={setNewPassword}>
                  <div className="roleauth-field">
                    <label htmlFor="rr-password">New password</label>
                    <div className="roleauth-control">
                      <input
                        id="rr-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        className="roleauth-password-toggle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  <div className="roleauth-field">
                    <label htmlFor="rr-confirm">Confirm new password</label>
                    <div className="roleauth-control">
                      <input
                        id="rr-confirm"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat your new password"
                      />
                    </div>
                  </div>

                  <button className="roleauth-primary" type="submit" disabled={loading}>
                    {loading ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              )}

              {error ? <p className="roleauth-alert">{error}</p> : null}
              {success ? <p className="roleauth-success">{success}</p> : null}

              <div className="roleauth-switch-line">
                Remembered your password?{' '}
                <a className="roleauth-switch-link" href={`/${role}/login`}>
                  Sign In
                </a>
              </div>
              <div className="roleauth-mini-note">Demo environment · email delivery is simulated.</div>
            </div>
          </div>
        </section>

        <aside className="roleauth-panel roleauth-visual-panel" aria-label="Product preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative full-bleed visual */}
          <img className="roleauth-visual-img" src={cfg.visual.image} alt="" />
          <div className="roleauth-visual-brand">
            <span className="roleauth-visual-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22V12M12 12C12 12 8 10 5 5c4 1 7 3 7 7zM12 12c0 0 4-2 7-7-4 1-7 3-7 7z" />
              </svg>
            </span>
            <span className="roleauth-visual-wordmark">
              fres<span style={{ color: '#c8a84b' }}>co</span>
            </span>
          </div>
          <div className="roleauth-visual-badge">{cfg.roleLabel}</div>
          <div className="roleauth-visual-copy">
            <p>{cfg.visual.title}</p>
            <span>{cfg.visual.sub}</span>
          </div>
        </aside>
      </section>

      <style>{ROLE_AUTH_CSS}</style>
      <style>{'.roleauth-reset-icon{display:inline-grid;place-items:center;width:58px;height:58px;border-radius:16px;background:' + cfg.iconBg + ';color:#fff;margin:0 auto 20px;box-shadow:0 12px 26px ' + cfg.shadow + '}'}</style>
    </div>
  )
}