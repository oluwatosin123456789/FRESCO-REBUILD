'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { Check } from 'lucide-react'
import { explainability, opportunityTeaser } from '@/lib/landing/content'
import type { OpportunityStackCard } from '@/lib/landing/content'

function OpportunityStackCard({
  card,
  index,
  total,
  progress,
  active,
  reduced,
}: {
  card: OpportunityStackCard
  index: number
  total: number
  progress: MotionValue<number>
  active: boolean
  reduced: boolean
}) {
  const rawPosition = useTransform(progress, (p) => {
    const u = ((p - index) % total + total) % total
    return u < 1 ? u * (total - 1) : total - u
  })
  const pos = useSpring(
    rawPosition,
    reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 150, damping: 26, mass: 0.45 },
  )

  const y = useTransform(pos, (p) => p * 26)
  const x = useTransform(pos, (p) => p * 6)
  const rotate = useTransform(pos, (p) => p * 1.1)
  const scale = useTransform(pos, (p) => 1 - p * 0.045)
  const zIndex = useTransform(pos, (p) => Math.round(80 - p * 18))
  const detailOpacity = useTransform(pos, [0, 0.55, 1.4], [1, 1, 0])

  const cardClass = [
    'opportunity-card',
    active ? 'opportunity-card-active' : '',
    card.reasons.length > 0 ? 'opportunity-card-has-reasons' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.div className="opportunity-card-wrap" style={{ zIndex }} aria-hidden={!active}>
      <motion.article className={cardClass} style={{ y, x, rotate, scale }}>
        <span className="opportunity-card-step" aria-hidden="true">
          {card.step}
        </span>
        <p className="eyebrow">{card.eyebrow}</p>
        <motion.div className="opportunity-card-detail" style={{ opacity: detailOpacity }}>
          <p className="opportunity-card-caption">{card.caption}</p>
          {card.reasons.length > 0 && (
            <>
              <p className="opportunity-card-why">{explainability.title}</p>
              <ul className="opportunity-card-reasons">
                {card.reasons.map((reason) => (
                  <li key={reason}>
                    <Check size={12} aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.div>
        <div className="opportunity-card-foot">
          <strong className={card.value.length > 8 ? 'opportunity-card-value-long' : ''}>{card.value}</strong>
          <p className="opportunity-card-label">{card.label}</p>
        </div>
      </motion.article>
    </motion.div>
  )
}

export function OpportunitySection() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)

  const total = opportunityTeaser.stack.length
  const activeCard = opportunityTeaser.stack[active]
  const [headlineMain, headlineAccent] = opportunityTeaser.headline.split('·').map((s) => s.trim())

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const scrollStep = useTransform(scrollYProgress, [0, 1], [0, total - 1])
  const counterStep = useSpring(
    scrollStep,
    reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 150, damping: 26, mass: 0.45 },
  )

  useEffect(() => {
    return counterStep.on('change', (value) => {
      setActive(Math.min(Math.max(Math.round(value), 0), total - 1))
    })
  }, [counterStep, total])

  return (
    <section
      id="opportunity"
      ref={sectionRef}
      className="opportunity-scroll"
      aria-labelledby="opportunity-title"
    >
      <div className="opportunity-sticky">
        <div className="opportunity-stack-grid">
          <div className="opportunity-copy">
            <p className="section-kicker">{opportunityTeaser.eyebrow}</p>
            <h2 id="opportunity-title">
              <span className="opportunity-headline-main">{headlineMain}</span>
              <em className="line-italic opportunity-headline-accent">{headlineAccent}</em>
            </h2>
            <p>{opportunityTeaser.copy}</p>
          </div>
          <div className="opportunity-stage">
            <span className="sr-only" aria-live="polite">
              Card {active + 1} of {total}: {activeCard.label}
            </span>
            {opportunityTeaser.stack.map((card, index) => (
              <OpportunityStackCard
                key={card.step}
                card={card}
                index={index}
                total={total}
                progress={scrollStep}
                active={index === active}
                reduced={!!reduced}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}