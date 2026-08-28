'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { Check } from 'lucide-react'
import { wemaDashboard } from '@/lib/landing/content'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function useIsWide() {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)')
    const update = () => setWide(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return wide
}

function CountText({
  progress,
  from,
  to,
  n,
  naira,
}: {
  progress: MotionValue<number>
  from: number
  to: number
  n: number
  naira?: boolean
}) {
  const t = useTransform(progress, [from, to], [0, 1])
  const eased = useTransform(t, (p) => p * p * (3 - 2 * p))
  const text = useTransform(eased, (p) => {
    const r = Math.round(p * n)
    return naira ? `₦${r}M` : r.toLocaleString('en-US')
  })
  return <motion.strong>{text}</motion.strong>
}

function InViewCount({ n, naira }: { n: number; naira?: boolean }) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1200
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * n))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, n])

  return <strong ref={ref}>{naira ? `₦${count}M` : count.toLocaleString('en-US')}</strong>
}

function StatCell({
  stat,
  index,
  progress,
  pinned,
  reduced,
}: {
  stat: (typeof wemaDashboard.aggregate.stats)[number]
  index: number
  progress: MotionValue<number>
  pinned: boolean
  reduced: boolean
}) {
  if (reduced) {
    return (
      <span>
        <strong>{stat.value}</strong>
        {stat.label}
      </span>
    )
  }
  if (pinned) {
    const from = 0.2 + index * 0.012
    const to = 0.3 + index * 0.012
    return (
      <span>
        <CountText progress={progress} from={from} to={to} n={stat.n} naira={stat.value.startsWith('₦')} />
        {stat.label}
      </span>
    )
  }
  return (
    <span>
      <InViewCount n={stat.n} naira={stat.value.startsWith('₦')} />
      {stat.label}
    </span>
  )
}

function ProfileRow({
  row,
  index,
  progress,
  pinned,
  reduced,
}: {
  row: (typeof wemaDashboard.profile.rows)[number]
  index: number
  progress: MotionValue<number>
  pinned: boolean
  reduced: boolean
}) {
  const from = 0.34 + index * 0.018
  const to = 0.44 + index * 0.018
  const y = useTransform(progress, [from, to], [14, 0])
  const opacity = useTransform(progress, [from, to], [0, 1])

  if (reduced || !pinned) {
    return (
      <li>
        <span>{row.label}</span>
        <strong>{row.value}</strong>
      </li>
    )
  }
  return (
    <motion.li style={{ y, opacity }}>
      <span>{row.label}</span>
      <strong>{row.value}</strong>
    </motion.li>
  )
}

export function WemaDashboard() {
  const reduced = useReducedMotion() ?? false
  const wide = useIsWide()
  const animated = !reduced
  const pinned = !reduced && wide
  const sectionRef = useRef<HTMLElement | null>(null)
  const [headlineMain, headlineAccent] = wemaDashboard.headline.split('·').map((s) => s.trim())

  const offset = pinned
    ? (['start start', 'end end'] as ['start start', 'end end'])
    : (['start 0.85', 'end 0.4'] as ['start 0.85', 'end 0.4'])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset })
  const smooth = useSpring(
    scrollYProgress,
    reduced ? { stiffness: 600, damping: 60 } : { stiffness: 150, damping: 26, mass: 0.4 },
  )

  const headOpacity = useTransform(smooth, [0, 0.05, 0.12], [1, 1, 0])
  const headY = useTransform(smooth, [0, 0.12], [0, -40])

  const networkY = useTransform(smooth, [0.16, 0.28], [70, 0])
  const networkOpacity = useTransform(smooth, [0.16, 0.22, 0.28], [0, 1, 1])
  const networkRotateX = useTransform(smooth, [0.16, 0.28], [16, 0])
  const networkScale = useTransform(smooth, [0.55, 1], [0.985, 1.03])

  const oppY = useTransform(smooth, [0.24, 0.3], [26, 0])
  const oppOpacity = useTransform(smooth, [0.24, 0.3], [0, 1])

  const profileY = useTransform(smooth, [0.3, 0.42], [130, 0])
  const profileOpacity = useTransform(smooth, [0.3, 0.36, 0.42], [0, 1, 1])
  const profileRotateY = useTransform(smooth, [0.3, 0.42], [20, 0])
  const profileScale = useTransform(smooth, [0.55, 1], [0.985, 1.03])

  const threadScale = useTransform(smooth, [0.28, 0.44], [0, 1])
  const cursorTop = useTransform(smooth, [0.28, 0.44], ['4%', '96%'])
  const glowOpacity = useTransform(smooth, [0.2, 0.5], [0, 1])
  const glowLateOpacity = useTransform(smooth, [0.42, 0.8], [0, 1])

  const enterAnim = !pinned && animated

  return (
    <section
      id="wema"
      ref={sectionRef}
      className={animated ? 'wema-dashboard wema-scroll' : 'wema-dashboard'}
      aria-labelledby="wema-title"
    >
      <motion.div className="wema-head" style={pinned ? { opacity: headOpacity, y: headY } : undefined}>
        <div className="section-head">
          <p className="eyebrow">{wemaDashboard.eyebrow}</p>
          <h2 id="wema-title">
            {headlineMain} <em className="line-italic">{headlineAccent}</em>
          </h2>
          <p className="section-lead">{wemaDashboard.copy}</p>
        </div>
      </motion.div>

      <div className="wema-sticky">
        <div className="wema-stage">
          {pinned && (
            <>
              <motion.div className="wema-glow" style={{ opacity: glowOpacity }} aria-hidden="true" />
              <motion.div className="wema-glow wema-glow-late" style={{ opacity: glowLateOpacity }} aria-hidden="true" />
              <motion.div className="wema-thread" style={{ scaleY: threadScale }} aria-hidden="true" />
              <motion.div className="wema-cursor" style={{ top: cursorTop }} aria-hidden="true" />
            </>
          )}

          <div className="wema-dashboard-grid">
            <motion.div
              className="wema-interface"
              style={
                pinned
                  ? { y: networkY, opacity: networkOpacity, rotateX: networkRotateX, scale: networkScale }
                  : undefined
              }
              initial={enterAnim ? { opacity: 0, y: 60, rotateX: 12 } : undefined}
              whileInView={enterAnim ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
              viewport={enterAnim ? { once: true, amount: 0.2 } : undefined}
              transition={enterAnim ? { duration: 0.8, ease: EASE } : undefined}
            >
              <div className="wema-interface-head">
                <div>
                  <span className="eyebrow">{wemaDashboard.aggregate.eyebrow}</span>
                  <strong>{wemaDashboard.aggregate.title}</strong>
                </div>
                <div className="wema-interface-feap">
                  {pinned ? (
                    <CountText progress={smooth} from={0.2} to={0.3} n={wemaDashboard.pipeline.n} />
                  ) : reduced ? (
                    <strong>{wemaDashboard.pipeline.value}</strong>
                  ) : (
                    <InViewCount n={wemaDashboard.pipeline.n} />
                  )}
                  <span>{wemaDashboard.pipeline.label}</span>
                </div>
              </div>

              <div className="wema-interface-stats">
                {wemaDashboard.aggregate.stats.map((stat, i) => (
                  <StatCell key={stat.label} stat={stat} index={i} progress={smooth} pinned={pinned} reduced={reduced} />
                ))}
              </div>

              <motion.div
                className="opportunity-engine-card"
                style={pinned ? { y: oppY, opacity: oppOpacity } : undefined}
              >
                <span className="opportunity-product">{wemaDashboard.opportunity.eyebrow}</span>
                <strong className="opportunity-amount">{wemaDashboard.opportunity.value}</strong>
                <ul className="opportunity-reasons">
                  {wemaDashboard.opportunity.reasons.map((reason) => (
                    <li key={reason}>
                      <Check size={14} aria-hidden="true" />
                      {reason}
                    </li>
                  ))}
                </ul>
                <p className="opportunity-disclaimer">{wemaDashboard.opportunity.disclaimer}</p>
              </motion.div>
            </motion.div>

            <motion.div
              className="wema-profile-card"
              style={
                pinned
                  ? { y: profileY, opacity: profileOpacity, rotateY: profileRotateY, scale: profileScale }
                  : undefined
              }
              initial={enterAnim ? { opacity: 0, y: 70, rotateY: 16 } : undefined}
              whileInView={enterAnim ? { opacity: 1, y: 0, rotateY: 0 } : undefined}
              viewport={enterAnim ? { once: true, amount: 0.15 } : undefined}
              transition={enterAnim ? { duration: 0.8, delay: 0.1, ease: EASE } : undefined}
            >
              <div className="wema-profile-head">
                <span className="eyebrow">{wemaDashboard.profile.eyebrow}</span>
                <h3>{wemaDashboard.profile.name}</h3>
                <p>{wemaDashboard.profile.meta}</p>
              </div>
              <div className="wema-profile-feap">
                {pinned ? (
                  <CountText progress={smooth} from={0.32} to={0.42} n={wemaDashboard.profile.feapN} />
                ) : reduced ? (
                  <strong>{wemaDashboard.profile.feap}</strong>
                ) : (
                  <InViewCount n={wemaDashboard.profile.feapN} />
                )}
                <span>FEAP</span>
                <span className="wema-profile-maturity">{wemaDashboard.profile.maturity}</span>
              </div>
              <ul className="wema-data">
                {wemaDashboard.profile.rows.map((row, i) => (
                  <ProfileRow key={row.label} row={row} index={i} progress={smooth} pinned={pinned} reduced={reduced} />
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}