'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { navigation } from '@/lib/landing/content'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [surface, setSurface] = useState<'clear' | 'warm' | 'deep'>('clear')

  useEffect(() => {
    const onScroll = () => {
      const runway = document.getElementById('runway')
      const pivot = runway ? runway.offsetTop + runway.offsetHeight * 0.58 : Infinity
      if (window.scrollY > pivot) setSurface('deep')
      else if (window.scrollY > 72) setSurface('warm')
      else setSurface('clear')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const go = (id: string) => {
    setMenuOpen(false)
    // On this page we scroll to the section; on any other page we route to the
    // landing page's anchor, where LandingScrollTarget picks it up after load.
    if (typeof document !== 'undefined' && document.getElementById(id)) scrollToId(id)
    else window.location.assign('/#' + id)
  }

  return (
    <>
      <header className={`site-header header-${surface}`}>
        <button className="wordmark" onClick={() => go('top')} aria-label="Fresco home">
          Fres<span>co</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) =>
            item.href ? (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ) : (
              <button key={item.label} onClick={() => item.id && go(item.id)}>
                {item.label}
              </button>
            )
          )}
        </nav>
        <div className="header-actions">
          <a className="header-link" href="/auth/login">
            Sign In
          </a>
          <a className="header-cta" href="/marketplace">
            Enter Marketplace <ArrowRight size={14} aria-hidden="true" />
          </a>
          <button
            className="menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-menu-links">
              {navigation.map((item, index) =>
                item.href ? (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index, duration: 0.35 }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </motion.a>
                ) : (
                  <motion.button
                    key={item.label}
                    onClick={() => item.id && go(item.id)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index, duration: 0.35 }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </motion.button>
                )
              )}
              <motion.a
                href="/marketplace"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35 }}
                className="mobile-menu-cta"
              >
                Enter Marketplace <ArrowRight size={16} aria-hidden="true" />
              </motion.a>
            </div>
            <motion.p
              className="demo-note mobile-menu-note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
            >
              Demo experience · no live farmer data
            </motion.p>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}