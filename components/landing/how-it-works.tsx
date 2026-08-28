'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import Image from 'next/image'
import { howItWorksSteps } from '@/lib/landing/content'

const stepVisuals = [
  '/assets/how/step1.jpg',
  '/assets/how/step2.jpg',
  '/assets/how/step3.jpg',
  '/assets/how/step4.jpg',
]

interface HiwConfig {
  xMultiplier: number
  yMultiplier: number
  rotationMultiplier: number
  scaleReduction: number
}

const getConfig = (width: number): HiwConfig => {
  if (width < 640) {
    return { xMultiplier: 96, yMultiplier: 18, rotationMultiplier: 7, scaleReduction: 0.07 }
  }
  if (width < 1024) {
    return { xMultiplier: 140, yMultiplier: 26, rotationMultiplier: 9, scaleReduction: 0.1 }
  }
  return { xMultiplier: 200, yMultiplier: 32, rotationMultiplier: 10, scaleReduction: 0.12 }
}

function useOffsetTransform(progress: MotionValue<number>, index: number) {
  return useTransform(progress, (p) => index - p)
}

function HiwCard({
  visual,
  step,
  index,
  progress,
  config,
  reduced,
}: {
  visual: string
  step: (typeof howItWorksSteps)[number]
  index: number
  progress: MotionValue<number>
  config: HiwConfig
  reduced: boolean
}) {
  const offset = useOffsetTransform(progress, index)

  const eased = useTransform(offset, (o) => {
    const t = Math.max(-1, Math.min(1, o / 2))
    const s = t * t * (3 - 2 * Math.abs(t))
    return s * 2
  })

  const x = useTransform(eased, (o) => o * config.xMultiplier)
  const rotate = useTransform(eased, (o) => o * config.rotationMultiplier)
  const y = useTransform(eased, (o) => Math.abs(o) * config.yMultiplier)
  const scale = useTransform(eased, (o) => 1 - Math.abs(o) * config.scaleReduction)
  const opacity = useTransform(
    eased,
    [-2, -1.25, 0, 1.25, 2],
    [0, 1, 1, 1, 0],
  )
  const zIndex = useTransform(eased, (o) => Math.round(100 - Math.abs(o) * 10))
  const blurAmount = useTransform(eased, (o) => (reduced ? 0 : Math.abs(o) * 4))
  const blur = useTransform(blurAmount, (b) => `blur(${b}px)`)

  return (
    <motion.div className="hiw-card" style={{ x, rotate, y, scale, opacity, zIndex, filter: blur }}>
      <div className="hiw-card-art">
        <Image src={visual} alt="" fill sizes="(max-width: 640px) 200px, 340px" />
        <span className="hiw-card-number" aria-hidden="true">
          {step.index}
        </span>
      </div>
      <div className="hiw-card-body">
        <span className="hiw-tag">Step {step.index}</span>
        <h3>{step.name}</h3>
        <p>{step.description}</p>
      </div>
    </motion.div>
  )
}

export function HowItWorksCarousel() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const total = howItWorksSteps.length
  const config = getConfig(width || 1200)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  // Reach the final step before the pinned section un-pins (the sticky holds for
  // the first 75% of the section), then clamp so the cards never drift after the
  // animation completes — the remaining scroll only scrolls the section away.
  const scrollStep = useTransform(scrollYProgress, [0, 0.7], [0, total - 1])
  const counterStep = useSpring(
    scrollStep,
    reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 140, damping: 26, mass: 0.45 },
  )

const [direction, setDirection] = useState<1 | -1>(1)

  useEffect(() => {
    let previous = active
    return counterStep.on('change', (value) => {
      const next = Math.min(Math.max(Math.round(value), 0), total - 1)
      if (next !== previous) {
        setDirection(next > previous ? 1 : -1)
        previous = next
        setActive(next)
      }
    })
  }, [counterStep, total])

  const activeStep = howItWorksSteps[active]

  return (
    <section id="how" ref={sectionRef} className="hiw-scroll section-canvas" aria-labelledby="how-title">
      <div className="hiw-sticky">
        <div className="section-head hiw-head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">
            From crate to capital <em className="line-italic">in four steps</em>
          </h2>
          <p className="section-lead">
            Amaka&apos;s business is real — regular customers, steady sales, good produce. But almost none of it is written down in a form a bank can read.
          </p>
        </div>

        <div className="hiw-stage">
          <span className="sr-only" aria-live="polite">
            Step {activeStep.index} of {total}: {activeStep.name}
          </span>
          {howItWorksSteps.map((step, index) => (
            <HiwCard
              key={step.index}
              visual={stepVisuals[index]}
              step={step}
              index={index}
              progress={scrollStep}
              config={config}
              reduced={!!reduced}
            />
          ))}
        </div>

        <div className="hiw-status">
          <div className="hiw-counter" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeStep.index}
                initial={
                  reduced
                    ? { opacity: 0 }
                    : {
                        y: direction === 1 ? '100%' : '-100%',
                        clipPath: direction === 1 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
                      }
                }
                animate={reduced ? { opacity: 1 } : { y: '0%', clipPath: 'inset(0 0 0% 0)' }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.08 }}
              >
                {activeStep.index}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="hiw-caption">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep.index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduced ? 0 : 0.25 }}
              >
                <h3>{activeStep.name}</h3>
                <p>{activeStep.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="hiw-progress" aria-hidden="true">
            <i style={{ width: `${((active + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}