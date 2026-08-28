'use client'

import { useEffect } from 'react'

/**
 * Handles `/#section` deep-links on the landing page. The Fresco preloader holds
 * the page (and locks scroll) while assets load, so we wait for the `fresco:ready`
 * event before scrolling to the target section — that way the jump is smooth and
 * never fights the loading curtain.
 */
export function LandingScrollTarget() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.location.hash.replace('#', '')
    if (!id || !document.getElementById(id)) return

    const scroll = () => {
      const target = document.getElementById(id)
      if (!target) return
      document.documentElement.style.scrollBehavior = 'smooth'
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const onReady = () => scroll()
    window.addEventListener('fresco:ready', onReady)
    // Fallback: if the preloader already finished before this mounted, just scroll.
    const fallback = setTimeout(scroll, 2800)

    return () => {
      window.removeEventListener('fresco:ready', onReady)
      clearTimeout(fallback)
    }
  }, [])

  return null
}