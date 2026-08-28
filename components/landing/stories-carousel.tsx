'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { stories } from '@/lib/landing/content'

const VISIBLE_COUNT = 5
const AUTO_PLAY_MS = 5000

const RADII = {
  desktop: { rx: 290, ry: 130 },
  medium: { rx: 190, ry: 95 },
  mobile: { rx: 100, ry: 60 },
} as const

type Breakpoint = keyof typeof RADII

type Position = {
  x: number
  y: number
  scale: number
  opacity: number
  zIndex: number
}

function getItemPosition(index: number, activeIndex: number, total: number, rx: number, ry: number): Position | null {
  const offset = index - activeIndex
  const half = Math.floor(VISIBLE_COUNT / 2)
  let adjustedOffset = offset
  if (offset > half) adjustedOffset = offset - total
  if (offset < -half) adjustedOffset = offset + total
  if (Math.abs(adjustedOffset) > half * 2) return null

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI
  const x = Math.sin(angle) * rx
  const y = -Math.cos(angle) * ry

  const distance = Math.abs(adjustedOffset)
  const maxDistance = half + 1
  const scale = Math.max(0.82, 1 - (distance / maxDistance) * 0.18)
  const opacity = Math.max(0.65, 1 - (distance / maxDistance) * 0.35)
  const zIndex = VISIBLE_COUNT - distance

  return { x, y, scale, opacity, zIndex }
}

export function StoriesCarousel() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [paused, setPaused] = useState(false)
  const touchStart = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 640px)')
    const medium = window.matchMedia('(max-width: 1024px)')
    const update = () => {
      if (mobile.matches) setBreakpoint('mobile')
      else if (medium.matches) setBreakpoint('medium')
      else setBreakpoint('desktop')
    }
    update()
    mobile.addEventListener('change', update)
    medium.addEventListener('change', update)
    return () => {
      mobile.removeEventListener('change', update)
      medium.removeEventListener('change', update)
    }
  }, [])

  const total = stories.length

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % total) + total) % total)
    },
    [total],
  )

  const next = useCallback(() => goTo(active + 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])

  useEffect(() => {
    if (paused || reduced) return
    const interval = setInterval(next, AUTO_PLAY_MS)
    return () => clearInterval(interval)
  }, [next, paused, reduced])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prev()
    }
  }

  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = event.changedTouches[0].clientX - touchStart.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) prev()
      else next()
    }
    touchStart.current = null
  }

  const { rx, ry } = RADII[breakpoint]

  const numberAnim = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { y: 24, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -24, opacity: 0 } }

  const numberTransition = reduced ? { duration: 0.2 } : { duration: 0.45, ease: 'easeOut' as const }
  const cardTransition = reduced ? { duration: 0.25 } : { duration: 0.6, ease: 'easeOut' as const }

  return (
    <section
      id="stories"
      className="stories"
      aria-label="Voices from the field"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className="stories-head">
        <div>
          <p className="eyebrow">Voices from the network</p>
          <h2>From seed to settlement, in their words.</h2>
        </div>
      </div>

      <div className="stories-band">
        <div
          className="story-track"
          ref={trackRef}
          role="listbox"
          aria-label="Stories"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <span className="sr-only" aria-live="polite">
            Story {active + 1} of {total}: {stories[active].name}
          </span>

          <div className="story-counter" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active}
                initial={numberAnim.initial}
                animate={numberAnim.animate}
                exit={numberAnim.exit}
                transition={numberTransition}
              >
                {String(active + 1).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <small>of {String(total).padStart(2, '0')}</small>
          </div>

          <AnimatePresence mode="popLayout">
            {stories.map((story, index) => {
              const pos = getItemPosition(index, active, total, rx, ry)
              if (!pos) return null
              const isActive = index === active
              return (
                <motion.button
                  key={story.name}
                  layout
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  animate={{
                    x: pos.x,
                    y: pos.y,
                    scale: pos.scale,
                    opacity: pos.opacity,
                    zIndex: pos.zIndex,
                  }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                  transition={cardTransition}
                  onClick={() => goTo(index)}
                  aria-label={`Story ${index + 1}: ${story.name}`}
                  aria-selected={isActive}
                  role="option"
                  className={`story-orb${isActive ? ' story-orb-active' : ''}`}
                >
                  <span className="story-orb-head">
                    <span className="story-avatar-thumb" aria-hidden="true">
                      {story.portrait ? (
                        <Image src={story.portrait} alt="" fill sizes="38px" />
                      ) : (
                        <span>{story.initials}</span>
                      )}
                    </span>
                    <span className="story-tag">{story.role}</span>
                  </span>
                  <span className="story-orb-body">
                    <span className="story-orb-name">{story.name}</span>
                    <span className="story-orb-quote">{story.quote}</span>
                    <span className="story-orb-proof">{story.proof}</span>
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="story-controls">
        <button className="story-control" onClick={prev} aria-label="Previous story">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="story-dots" role="tablist" aria-label="Story selector">
          {stories.map((story, index) => (
            <button
              key={story.name}
              className={`story-dot ${index === active ? 'story-dot-active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Story ${index + 1}: ${story.name}`}
              aria-current={index === active}
            />
          ))}
        </div>
        <button className="story-control" onClick={next} aria-label="Next story">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <button className="button button-dark story-next" onClick={next}>
          Next field note <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="demo-note">Verified farmer and institutional case studies from the Fresco Network.</p>
    </section>
  )
}