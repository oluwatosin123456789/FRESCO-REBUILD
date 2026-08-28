'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LETTERS = ['F', 'R', 'E', 'S', 'C', 'O']

/**
 * Full-viewport brand preloader shown while the landing page finishes loading.
 * Each letter of "FRESCO" bounces in sequence, then the curtain lifts once the
 * window has fully loaded (and a minimum display time has passed), so the page
 * is always revealed fully ready.
 */
export function FrescoPreloader() {
  const [done, setDone] = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    const minTime = new Promise((resolve) => setTimeout(resolve, 1500))
    const fullyLoaded = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(true)
        return
      }
      window.addEventListener('load', () => resolve(true), { once: true })
      // Safety net · never trap the user behind the curtain.
      setTimeout(() => resolve(true), 3500)
    })
    Promise.all([minTime, fullyLoaded]).then(() => setDone(true))
  }, [])

  useEffect(() => {
    if (removed) return
    // Lock scrolling on both roots — the landing header also manages body.overflow,
    // so pin the documentElement too so nothing re-enables scroll under the curtain.
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [removed])

  // Tell listeners (e.g. LandingScrollTarget) the curtain is gone and scroll is
  // unlocked, so deep-link scrolling can start from a ready page.
  useEffect(() => {
    if (!removed || typeof window === 'undefined') return
    window.dispatchEvent(new Event('fresco:ready'))
  }, [removed])

  if (removed) return null

  return (
    <AnimatePresence onExitComplete={() => setRemoved(true)}>
      {!done && (
        <motion.div
          className="fresco-preloader"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="fresco-preloader-inner">
            <div className="fresco-preloader-letters">
              {LETTERS.map((letter, index) => (
                <motion.span
                  key={letter}
                  className="fresco-preloader-letter"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -26, 0] }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.11,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    ease: 'easeInOut',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="fresco-preloader-tag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              From harvest to opportunity
            </motion.p>

            <div className="fresco-preloader-track">
              <motion.i
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}