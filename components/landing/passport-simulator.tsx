'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { feapNextActions, feapSimulations, growthCoach, passport } from '@/lib/landing/content'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.7, delay, ease: EASE },
  }
}

function Gauge({
  target,
  scrollP,
  reduced,
}: {
  target: number
  scrollP: MotionValue<number>
  reduced: boolean
}) {
  const size = 220
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const drawn = useSpring(
    target,
    reduced ? { stiffness: 900, damping: 80 } : { stiffness: 120, damping: 22, mass: 0.4 },
  )
  const scrollDrawn = useTransform([drawn, scrollP], (latest) => (latest[0] as number) * (latest[1] as number))
  const score = reduced ? drawn : scrollDrawn
  const offset = useTransform(score, (v) => circumference * (1 - Math.min(100, Math.max(0, v)) / 100))
  const text = useTransform(score, (v) => String(Math.round(v)))

  return (
    <div className="simulator-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(243, 239, 229, 0.22)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="simulator-gauge-center">
        <motion.strong>{text}</motion.strong>
        <span>FEAP</span>
      </div>
    </div>
  )
}

export function PassportSimulator() {
  const reduced = useReducedMotion() ?? false
  const sectionRef = useRef<HTMLElement | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.95', 'end 0.6'] as ['start 0.95', 'end 0.6'],
  })
  const scrollP = useSpring(
    scrollYProgress,
    reduced ? { stiffness: 600, damping: 60 } : { stiffness: 130, damping: 26, mass: 0.3 },
  )

  const targetScore = selected === null ? passport.score : feapSimulations[selected].simulatedScore

  return (
    <section id="simulate" ref={sectionRef} className="simulator-section" aria-labelledby="simulate-title">
      <motion.div className="section-head" {...(reduced ? {} : reveal())}>
        <p className="eyebrow">Simulate</p>
        <h2 id="simulate-title">
          What moves <em className="line-italic">the score</em>
        </h2>
        <p className="section-lead">Deterministic rules mean Amaka can see exactly what each improvement is worth.</p>
      </motion.div>

      <div className="simulator-shell">
        <motion.div className="simulator-gauge-wrap" {...(reduced ? {} : reveal(0.05))}>
          <Gauge target={targetScore} scrollP={scrollP} reduced={reduced} />
          <p className="simulator-delta" role="status">
            {selected === null
              ? `FEAP ${passport.score} · choose an option`
              : `FEAP ${passport.score} → ${targetScore} · ${feapSimulations[selected].label}`}
          </p>
        </motion.div>

        <div className="simulator-options">
          {feapSimulations.map((sim, i) => (
            <motion.button
              key={sim.label}
              className={`simulation-card${selected === i ? ' simulation-card-active' : ''}`}
              onClick={() => setSelected(selected === i ? null : i)}
              {...(reduced ? {} : reveal(0.1 + 0.08 * i))}
            >
              <span className="simulation-label">{sim.label}</span>
              <span className="simulation-arrow">{sim.from} → {sim.to}</span>
              <strong>{sim.simulatedScore}</strong>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="simulator-band">
        <motion.div className="passport-coach" {...(reduced ? {} : reveal(0.1))}>
          <span className="passport-coach-badge">{growthCoach.label}</span>
          <p>{growthCoach.insight}</p>
        </motion.div>
        <motion.div className="simulator-actions" {...(reduced ? {} : reveal(0.18))}>
          <p>Next actions to build the record</p>
          <ul>
            {feapNextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.p className="simulator-disclaimer" {...(reduced ? {} : reveal(0.24))}>
        Simulations are illustrative · FEAP reflects verified activity, not promises.
      </motion.p>
    </section>
  )
}