'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { newsletter } from '@/lib/landing/content'

const photoStack = [
  { src: '/assets/harvest-letter.jpg', alt: 'Farm harvest in fertile agricultural field', rotation: -7, layer: -16 },
  { src: '/assets/how/step1.jpg', alt: 'AI biometric produce quality scan', rotation: 1, layer: 0 },
  { src: '/assets/how/step3.jpg', alt: 'Verified agricultural financial passport', rotation: 6, layer: 12 },
]

const restPoses = [
  { x: 0, y: 0, rotate: -7, scale: 1, boxShadow: '0 10px 24px -10px rgba(23, 23, 19, 0.3)' },
  { x: 0, y: 0, rotate: 1, scale: 1, boxShadow: '0 10px 24px -10px rgba(23, 23, 19, 0.3)' },
  { x: 0, y: 0, rotate: 6, scale: 1, boxShadow: '0 10px 24px -10px rgba(23, 23, 19, 0.3)' },
]

const fanPoses = [
  { x: -34, y: -14, rotate: -12, scale: 1.05, boxShadow: '0 26px 48px -20px rgba(23, 23, 19, 0.45)' },
  { x: 0, y: -24, rotate: 0, scale: 1.07, boxShadow: '0 32px 58px -22px rgba(23, 23, 19, 0.5)' },
  { x: 34, y: -14, rotate: 12, scale: 1.05, boxShadow: '0 26px 48px -20px rgba(23, 23, 19, 0.45)' },
]

export function NewsletterPhotoStack() {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const spread = pinned || hovered
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const backY = useTransform(scrollYProgress, [0, 1], [16, -16])
  const frontY = useTransform(scrollYProgress, [0, 1], [-12, 12])
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

  return (
    <div
      ref={ref}
      className="newsletter-stack"
      aria-hidden="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setPinned((value) => !value)}
    >
      {photoStack.map((photo, index) => (
        <motion.div
          key={photo.src}
          className="newsletter-photo"
          style={{
            y: index === 0 ? backY : index === 2 ? frontY : 0,
            zIndex: index,
          }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="newsletter-photo-card"
            initial={false}
            animate={spread ? fanPoses[index] : restPoses[index]}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.5, ease, delay: spread ? index * 0.06 : 0 }
            }
          >
            <motion.img src={photo.src} alt={photo.alt} className="newsletter-photo-card-img" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setMessage('Please enter a valid email address.')
      setState('error')
      return
    }
    setState('submitting')
    setMessage('')
    window.setTimeout(() => {
      setState('success')
      setMessage('Thank you for subscribing to The Harvest Letter.')
    }, 700)
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email">Email address</label>
      <div className="newsletter-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (state === 'error') setState('idle')
          }}
          placeholder={newsletter.placeholder}
          aria-invalid={state === 'error'}
          aria-describedby="newsletter-message"
          autoComplete="email"
        />
        <button
          className="newsletter-submit"
          type="submit"
          aria-label={newsletter.buttonLabel}
          disabled={state === 'submitting'}
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
      <p id="newsletter-message" className={`newsletter-message newsletter-message-${state}`} role="status" aria-live="polite">
        {state === 'idle' && 'Join 3,400+ subscribers receiving verified monthly market intelligence.'}
        {state === 'submitting' && 'Subscribing…'}
        {state === 'success' && message}
        {state === 'error' && message}
      </p>
    </form>
  )
}

export function Newsletter() {
  return (
    <section id="newsletter" className="newsletter section-rust" aria-labelledby="newsletter-eyebrow">
      <div className="newsletter-panel">
        <span className="newsletter-watermark" aria-hidden="true">
          {newsletter.watermark}
        </span>
        <div className="newsletter-content">
          <div className="newsletter-copy">
            <p id="newsletter-eyebrow" className="eyebrow">{newsletter.eyebrow}</p>
            <p>{newsletter.copy}</p>
          </div>
          <NewsletterForm />
        </div>
        <NewsletterPhotoStack />
      </div>
    </section>
  )
}