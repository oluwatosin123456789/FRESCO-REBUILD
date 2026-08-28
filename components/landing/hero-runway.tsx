'use client'

import { useCallback, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import dynamic from 'next/dynamic'
import { ArrowDown, Check } from 'lucide-react'
import { stages } from '@/lib/landing/content'
import { PIVOT_END, PIVOT_START, STAGE_WIDTH, stageIndexAt } from '@/lib/landing/runway-progress'

/**
 * The Three.js runway world is code-split and client-only: three never enters the
 * initial landing bundle, and the rest of the page never waits on it.
 */
const RunwayScene = dynamic(() => import('@/components/landing/runway-scene'), {
  ssr: false,
  loading: () => <div className="runway-scene-loading" aria-hidden="true" />,
})

const W = STAGE_WIDTH

/** Stage 2's subject sits far beyond the field rows · its copy is delayed until the camera reaches it. */
const stageShift = (i: number) => (i === 1 ? 0.025 : 0)

const fadePoints = (i: number) => {
  const a = i * W
  const b = (i + 1) * W
  const s = stageShift(i)
  return [i === 0 ? 0 : a + 0.012 + s, a + 0.05 + s, b - 0.05, i === 3 ? 1 : b - 0.012]
}

const revealPoints = (i: number) => {
  const a = i * W
  const s = stageShift(i)
  return [i === 0 ? 0 : a + 0.022 + s, i === 0 ? 0.05 : a + 0.085 + s]
}

const settlePoints = (i: number) => {
  const a = i * W
  const s = stageShift(i)
  return [a + 0.02 + s, a + 0.1 + s]
}

export function HeroRunway() {
  const reduced = useReducedMotion()
  const runwayRef = useRef<HTMLElement | null>(null)
  const [activeStage, setActiveStage] = useState(0)
  // When the browser refuses a WebGL context (blocked, lost, exhausted), we drop the 3D
  // scene and keep the DOM copy over the flat runway-canvas background instead of spamming
  // renderer-creation attempts that all fail.
  const [webglFailed, setWebglFailed] = useState(false)

  const { scrollYProgress } = useScroll({ target: runwayRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, {
    stiffness: 450,
    damping: 38,
    mass: 0.2,
  })

  // The WebGL reads the exact same spring the DOM overlay animates, every frame, so the
  // 3D world and the copy stay perfectly locked during fast scrolls with zero extra lag.
  const readProgress = useCallback(() => smooth.get(), [smooth])

  const fade0 = useTransform(smooth, fadePoints(0), [0, 1, 1, 0])
  const fade1 = useTransform(smooth, fadePoints(1), [0, 1, 1, 0])
  const fade2 = useTransform(smooth, fadePoints(2), [0, 1, 1, 0])
  const fade3 = useTransform(smooth, fadePoints(3), [0, 1, 1, 0])

  const clip0 = useTransform(smooth, revealPoints(0), ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'])
  const clip1 = useTransform(smooth, revealPoints(1), ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'])
  const clip2 = useTransform(smooth, revealPoints(2), ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'])
  const clip3 = useTransform(smooth, revealPoints(3), ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'])

  const y0 = useTransform(smooth, revealPoints(0), [18, 0])
  const y1 = useTransform(smooth, revealPoints(1), [18, 0])
  const y2 = useTransform(smooth, revealPoints(2), [18, 0])
  const y3 = useTransform(smooth, revealPoints(3), [18, 0])

  const scale0 = useTransform(smooth, settlePoints(0), [1.03, 1])
  const scale1 = useTransform(smooth, settlePoints(1), [1.03, 1])
  const scale2 = useTransform(smooth, settlePoints(2), [1.03, 1])
  const scale3 = useTransform(smooth, settlePoints(3), [1.03, 1])

  const deepOpacity = useTransform(smooth, [PIVOT_START, PIVOT_END], [0, 1])
  const warmVeil = useTransform(smooth, [PIVOT_START, PIVOT_END], [1, 0])
  const deepVeil = useTransform(smooth, [PIVOT_START, PIVOT_END], [0, 1])
  const copyColor = useTransform(smooth, [PIVOT_START, PIVOT_END], ['#171713', '#F3EFE5'])
  const threadLength = useTransform(smooth, [0.36, 0.96], [0, 1])
  const threadOpacity = useTransform(smooth, [0.34, 0.46, 0.56, 0.68, 0.78], [0, 0.9, 0.3, 0.9, 1])
  const frescoBadge = useTransform(smooth, [0.24, 0.32], [0, 1])
  const stageIndex = useTransform(smooth, [0, 1], [1, 4])
  const stageLabel = useTransform(stageIndex, (value) => String(Math.round(value)).padStart(2, '0'))

  useMotionValueEvent(smooth, 'change', (value) => {
    const stage = stageIndexAt(value)
    // stage 2's pedestal is deep in the field · its card must wait until the camera arrives
    const nextStage = stage === 1 && value < 0.2 ? 0 : stage
    setActiveStage((prev) => (prev !== nextStage ? nextStage : prev))
  })

  const scrollToStage = (index: number) => {
    const el = runwayRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const height = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (index / 4) * height, behavior: 'smooth' })
  }

  return (
    <section id="runway" className="runway" ref={runwayRef} data-scroll-section aria-label="Amaka's economic journey">
      <div className="runway-sticky">
        <div className="runway-canvas" />
        {!webglFailed && (
          <RunwayScene getProgress={readProgress} onFailure={() => setWebglFailed(true)} />
        )}
        <motion.div className="runway-veil runway-veil-warm" style={{ opacity: warmVeil }} aria-hidden="true" />
        <motion.div className="runway-veil runway-veil-deep" style={{ opacity: deepVeil }} aria-hidden="true" />

        <div className="runway-stage-index" aria-hidden="true">
          <motion.span>{stageLabel}</motion.span>
          <span>/ 04</span>
        </div>

        <div className="runway-stages" style={{ '--copy-color': copyColor } as React.CSSProperties}>
          <motion.div
            className="runway-stage runway-stage-copy"
            style={{ opacity: fade0, clipPath: clip0, y: y0 }}
          >
            <div className="stage-copy-inner">
              <p className="stage-card-indicator" aria-hidden="true">
                <span className="stage-indicator-dot" />
                <span>{stages[0].index}</span>
                <span>{stages[0].name}</span>
              </p>
              <p className="eyebrow">{stages[0].eyebrow}</p>
              <h2>
                {stages[0].headline[0]}
                <br />
                <em className="line-italic">{stages[0].headline[1]}</em>
              </h2>
              <p className="stage-copy">{stages[0].copy}</p>
              <button className="stage-cta" onClick={() => scrollToStage(1)}>
                {stages[0].cta} <ArrowDown size={14} aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          <motion.div
            className="runway-stage runway-stage-copy runway-stage-right"
            style={{ opacity: fade1, clipPath: clip1, y: y1 }}
          >
            <div className="stage-copy-inner">
              <p className="stage-card-indicator" aria-hidden="true">
                <span className="stage-indicator-dot" />
                <span>{stages[1].index}</span>
                <span>{stages[1].name}</span>
              </p>
              <p className="eyebrow">{stages[1].eyebrow}</p>
              <h2>
                {stages[1].headline[0]}
                <br />
                <em className="line-italic">{stages[1].headline[1]}</em>
              </h2>
              <p className="stage-copy">{stages[1].copy}</p>
            </div>
          </motion.div>

          <motion.div
            className="runway-stage runway-stage-copy"
            style={{ opacity: fade2, clipPath: clip2, y: y2 }}
          >
            <div className="stage-copy-inner">
              <p className="stage-card-indicator" aria-hidden="true">
                <span className="stage-indicator-dot" />
                <span>{stages[2].index}</span>
                <span>{stages[2].name}</span>
              </p>
              <p className="eyebrow">{stages[2].eyebrow}</p>
              <h2>
                {stages[2].headline[0]}
                <br />
                <em className="line-italic">{stages[2].headline[1]}</em>
              </h2>
              <p className="stage-copy">{stages[2].copy}</p>
            </div>
          </motion.div>

          <motion.div
            className="runway-stage runway-stage-copy runway-stage-deep-copy"
            style={{ opacity: fade3, clipPath: clip3, y: y3 }}
          >
            <div className="stage-copy-inner">
              <p className="stage-card-indicator" aria-hidden="true">
                <span className="stage-indicator-dot" />
                <span>{stages[3].index}</span>
                <span>{stages[3].name}</span>
              </p>
              <p className="eyebrow">{stages[3].eyebrow}</p>
              <h2>
                {stages[3].headline[0]}
                <br />
                <em className="line-italic">{stages[3].headline[1]}</em>
              </h2>
              <p className="stage-copy">{stages[3].copy}</p>
            </div>
          </motion.div>
        </div>

        <motion.div className="runway-stage runway-stage-visual" style={{ opacity: fade0, scale: scale0 }}>
          <motion.div className="fresco-badge" style={{ opacity: frescoBadge }}>
            <Check size={12} aria-hidden="true" />
            Fresco verified
          </motion.div>
        </motion.div>

        <motion.div className="runway-stage runway-stage-visual runway-scan-visual" style={{ opacity: fade1, scale: scale1 }}>
          <FrescoScanSweep active={activeStage === 1} />
        </motion.div>

        <motion.div className="runway-stage runway-stage-visual runway-order-visual" style={{ opacity: fade2, scale: scale2 }}>
          <OrderEvent active={activeStage === 2} />
        </motion.div>

        <motion.div className="runway-stage runway-stage-visual runway-delivery-visual" style={{ opacity: fade3, scale: scale3 }}>
          <DeliveryEvent active={activeStage === 3} />
        </motion.div>

        <EconomicThread length={threadLength} opacity={threadOpacity} />
      </div>
    </section>
  )
}



export function FrescoScanSweep({ active }: { active: boolean }) {
  return (
    <div className="scan-stage">
      <div className="scan-hud-card">
        <div className="scan-hud-head">
          <span className="scan-hud-tag">
            <span className="scan-pulse-dot" /> Fresco AI Inspection
          </span>
          <span className="scan-batch">TOM-2026-030</span>
        </div>
        {active && (
          <>
            <div className="scan-panel-grid">
              <div className="scan-metric">
                <strong>92%</strong>
                <span>Freshness</span>
              </div>
              <div className="scan-metric">
                <strong>5d</strong>
                <span>Shelf life</span>
              </div>
              <div className="scan-metric">
                <strong>Grade A</strong>
                <span>Quality</span>
              </div>
            </div>
            <div className="scan-hud-status">
              <Check size={12} className="text-success" aria-hidden="true" />
              <span>Laser verified & recorded</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function OrderEvent({ active }: { active: boolean }) {
  return (
    <div className="order-stage">
      <div className="order-card-runway">
        <div className="order-card-head">
          <span>HVL-ORD-100047</span>
          <span className="order-status"><Check size={11} aria-hidden="true" /> Verified</span>
        </div>
        <div className="order-summary-row">
          <strong className="order-product-compact">Premium Tomatoes</strong>
          <span className="order-meta-compact">2 crates · N12,500</span>
        </div>
        {active && (
          <div className="order-states-compact">
            <span className="order-state-pill">Order confirmed</span>
            <span className="order-state-pill order-state-gold">Payment locked</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function DeliveryEvent({ active }: { active: boolean }) {
  return (
    <div className="delivery-stage">
      <div className="delivery-card-runway">
        <div className="order-card-head">
          <span>HVL-ORD-100047</span>
          <span className="order-status order-status-transit">
            <span className="transit-pulse" /> In transit
          </span>
        </div>
        <div className="delivery-summary-row">
          <strong className="delivery-product-compact">Tracked Delivery · 2 Crates</strong>
          <span className="delivery-meta-compact">Market → Amaka&apos;s dock · 2.4 km</span>
        </div>
        {active && (
          <div className="delivery-route-compact">
            <div className="delivery-route-bar">
              <motion.div
                className="delivery-route-indicator"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <div className="delivery-route-endpoints">
              <span>Loaded</span>
              <span className="text-gold font-medium">Payout Settled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function EconomicThread({
  length,
  opacity,
}: {
  length: MotionValue<number>
  opacity: MotionValue<number>
}) {
  return (
    <motion.svg
      className="economic-thread"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <path
        id="thread-path"
        d="M 10 86 C 30 74, 34 44, 52 36 S 86 20, 90 16"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.45"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={{ pathLength: length } as React.CSSProperties}
      />
      <circle cx="10" cy="86" r="1.6" fill="var(--gold)" />
      <circle cx="90" cy="16" r="1.6" fill="var(--gold)" />
    </motion.svg>
  )
}