'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff, UserPlus } from 'lucide-react'
import { getRoleAuthConfig, type AuthMode, type RoleKey } from './role-auth-config'
import { ROLE_AUTH_CSS } from '@/lib/auth/role-auth-css'
import HolographicBeams from '@/components/shared/holographic-beams'
import { createClientSession } from '@/lib/auth/client-session'
import { createClient } from '@/lib/supabase/client'

const SPEED = 900
const EASE = 'cubic-bezier(.77,0,.18,1)'

const ROLE_META: Record<RoleKey, string> = {
  farmer: 'FARMER',
  consumer: 'CONSUMER',
  wema: 'WEMA_ANALYST',
}

const GOOGLE_ICON = (
  <svg width="25" height="25" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.7 33.7 29.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2L38.3 8.5C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20.2-7.4 20.2-21 0-1.4-.2-2.7-.6-4z" />
    <path fill="#FF3D00" d="M6.3 14.7 12.9 19.5C14.7 15.3 18.9 12 24 12c3.3 0 6.3 1.2 8.6 3.2L38.3 8.5C34.5 5.1 29.6 3 24 3 16 3 9.1 7.5 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 45c5.5 0 10.1-1.8 13.5-4.8l-6.2-5.1C29.6 36.3 27 37 24 37c-5.1 0-9.3-3.3-10.9-7.8l-6.5 5C9.4 40.4 16.1 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3c-1.1 3.1-3.5 5.4-6 7.1l6.2 5.1C39.1 36.8 45.2 31.1 45.2 24c0-1.4-.2-2.7-.6-4z" />
  </svg>
)

const APPLE_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M16.9 12.7c0-2.2 1.8-3.3 1.9-3.4-1-.4-2.5-1.3-3.8-1.3-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.2-.9-1.7 0-3.3 1-4.1 2.6-1.8 3.1-.4 7.7 1.3 10.2.8 1.2 1.8 2.5 3.1 2.5 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.1-2.4 1-1.4 1.4-2.9 1.4-3 0 0-2.6-1-2.6-3.8zM14.5 6.4c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.3-.6.7-1.2 1.8-1 2.9 1 .1 2-.5 2.7-1.2z" />
  </svg>
)

const FACEBOOK_ICON = (
  <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="#1877F2" />
    <path d="M18.3 25v-7h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.3 1.4-1.3h1.5V9.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v1.7h-2.6V17H15v7h3.3z" fill="#fff" />
  </svg>
)

export function RoleAuth({ role, mode }: { role: RoleKey; mode: AuthMode }) {
  const cfg = getRoleAuthConfig(role)
  const [signup, setSignup] = useState(mode === 'signup')
  const [animating, setAnimating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [extra, setExtra] = useState<Record<string, string>>({})
  const [avatar, setAvatar] = useState('')
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const switchMode = (next: 'login' | 'signup') => {
    if (animating || signup === (next === 'signup')) return
    setAnimating(true)
    setSignup(next === 'signup')
    setShowPassword(false)
    setError('')
    setMessage('')
    window.setTimeout(() => setAnimating(false), SPEED)
  }

  const go = (to: string) => {
    if (typeof window !== 'undefined') window.location.assign(to)
  }

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      const resolved =
        cfg.demo.email === loginEmail.trim().toLowerCase()
          ? cfg.demo.name
          : loginEmail.trim().split('@')[0] || cfg.demo.name
      createClientSession(role, resolved, loginEmail.trim())
      window.setTimeout(() => go(cfg.destination), 450)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    doLogin(email, password)
  }

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG or WebP).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const displayName = name.trim() || email.trim().split('@')[0] || cfg.demo.name
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: displayName, role: ROLE_META[role], avatar: avatar || undefined },
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
      if (data.session) {
        createClientSession(role, displayName, email.trim(), avatar || undefined)
        window.setTimeout(() => go(cfg.destination), 550)
      } else {
        setMessage(`Check ${email.trim()} to confirm your account, then sign in.`)
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed')
      setLoading(false)
    }
  }

  const demoSignIn = () => {
    doLogin(cfg.demo.email, cfg.demo.password)
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
      <section className={`roleauth-shell ${signup ? 'signup' : ''}`} style={shellVars} aria-label="Authentication">
        <HolographicBeams className="roleauth-beams" opacity={70} />
        {/* ── FORM PANEL ── */}
        <section className="roleauth-panel roleauth-form-panel">

          <button
            type="button"
            className="roleauth-back"
            onClick={() => go('/auth/login')}
            aria-label="Back to choose a role"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>

          <div className="roleauth-form-wrap">
            <div key={signup ? 'signup' : 'login'} className="roleauth-form" style={{ animation: `roleauth-rise .55s ${EASE} both` }}>
              {signup ? (
                <>
                  <h1 className="roleauth-title">Create Account</h1>
                  <p className="roleauth-eyebrow">{cfg.formEyebrow.signup}</p>

                  <form onSubmit={handleSignup}>
                    <div className="roleauth-avatar">
                      <div
                        className="roleauth-avatar-preview"
                        style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
                      >
                        {!avatar && <UserPlus size={22} strokeWidth={1.8} />}
                      </div>
                      <div className="roleauth-avatar-actions">
                        <span className="roleauth-avatar-label">Profile photo</span>
                        <div className="roleauth-avatar-row">
                          <button
                            type="button"
                            className="roleauth-avatar-btn"
                            onClick={() => avatarInputRef.current?.click()}
                          >
                            {avatar ? 'Change photo' : 'Upload photo'}
                          </button>
                          {avatar && (
                            <button
                              type="button"
                              className="roleauth-avatar-btn ghost"
                              onClick={() => setAvatar('')}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarFile}
                        />
                      </div>
                    </div>

                    <div className="roleauth-field">
                      <label htmlFor="ra-name">Full Name</label>
                      <div className="roleauth-control">
                        <input id="ra-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                      </div>
                    </div>
                    <div className="roleauth-field">
                      <label htmlFor="ra-email">Email</label>
                      <div className="roleauth-control">
                        <input id="ra-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                      </div>
                    </div>
                    <div className="roleauth-field">
                      <label htmlFor="ra-password">Password</label>
                      <div className="roleauth-control">
                        <input id="ra-password" type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                        <button type="button" className="roleauth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)}>
                          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>
                    </div>

                    {cfg.signupFields.map((field) => (
                      <div className="roleauth-field" key={field.key}>
                        <label htmlFor={`ra-${field.key}`}>{field.label}</label>
                        <div className="roleauth-control">
                          <input id={`ra-${field.key}`} type="text" value={extra[field.key] ?? ''} onChange={(e) => setExtra((s) => ({ ...s, [field.key]: e.target.value }))} placeholder={field.placeholder} />
                        </div>
                      </div>
                    ))}

                    <button className="roleauth-primary" type="submit" disabled={loading}>
                      {loading ? 'Creating…' : 'Create Account'}
                    </button>
                  </form>

                  {error ? <p className="roleauth-alert">{error}</p> : null}
                  {message ? <p className="roleauth-success">{message}</p> : null}

                  <div className="roleauth-switch-line">
                    Already have an account?{' '}
                    <a className="roleauth-switch-link" href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>
                      Sign In
                    </a>
                  </div>
                  <div className="roleauth-mini-note">{cfg.signupNote}</div>
                </>
              ) : (
                <>
                  <h1 className="roleauth-title">Hello Again!</h1>
                  <p className="roleauth-eyebrow">{cfg.formEyebrow.login}</p>

                  <form onSubmit={handleLogin}>
                    <div className="roleauth-field">
                      <label htmlFor="ra-email">Email</label>
                      <div className="roleauth-control">
                        <input id="ra-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                      </div>
                    </div>
                    <div className="roleauth-field">
                      <label htmlFor="ra-password">Password</label>
                      <div className="roleauth-control">
                        <input id="ra-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                        <button type="button" className="roleauth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)}>
                          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>
                    </div>

                    <div className="roleauth-meta">
                      <a className="roleauth-text-link" href={`/${role}/reset`}>
                        Recovery Password
                      </a>
                    </div>

                    <button className="roleauth-primary" type="submit" disabled={loading}>
                      {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>

                  {error ? <p className="roleauth-alert">{error}</p> : null}
                  {message ? <p className="roleauth-success">{message}</p> : null}

                  <div className="roleauth-or">
                    <span>Or continue with</span>
                  </div>

                  <div className="roleauth-socials">
                    <button className="roleauth-social" onClick={demoSignIn} aria-label="Continue with Google">
                      {GOOGLE_ICON}
                    </button>
                    <button className="roleauth-social" onClick={demoSignIn} aria-label="Continue with Apple">
                      {APPLE_ICON}
                    </button>
                    <button className="roleauth-social" onClick={demoSignIn} aria-label="Continue with Facebook">
                      {FACEBOOK_ICON}
                    </button>
                  </div>

                  <p className="roleauth-demo-hint">
                    One-click demo access · <strong>{cfg.demo.email}</strong>
                  </p>

                  <div className="roleauth-switch-line">
                    Don&rsquo;t have an account?{' '}
                    <a className="roleauth-switch-link" href="#" onClick={(e) => { e.preventDefault(); switchMode('signup') }}>
                      Sign Up
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── VISUAL PANEL ── */}
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
            <div className="roleauth-visual-controls">
              <button className="roleauth-circle" aria-label="Switch to sign in" onClick={() => switchMode('login')}>
                <ChevronLeft size={21} />
              </button>
              <button className="roleauth-circle" aria-label="Switch to sign up" onClick={() => switchMode('signup')}>
                <ChevronRight size={21} />
              </button>
            </div>
          </div>
        </aside>
      </section>

      <style>{ROLE_AUTH_CSS}</style>
    </div>
  )
}

export function RoleAuthPage({ role, mode }: { role: RoleKey; mode: AuthMode }) {
  return <RoleAuth role={role} mode={mode} />
}