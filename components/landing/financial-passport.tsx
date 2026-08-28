'use client'

import { useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import type { PassportStage, PassportStageTone } from '@/lib/landing/content'
import { methodology, passportStages } from '@/lib/landing/content'

function StageSheet({
  stage,
  index,
  tone,
}: {
  stage: PassportStage
  index: number
  tone: PassportStageTone
}) {
  const factor = methodology[index]
  return (
    <div className={`stack-sheet${tone === 'green' ? ' stack-sheet-green' : ''}`}>
      <div className="stack-sheet-copy">
        <h3>{stage.title}</h3>
        <p className="stack-sheet-copy-text">{stage.copy}</p>
        <div className="passport-factor-weight">
          <span className="passport-factor-bar" aria-hidden="true">
            <i style={{ width: `${(factor.contribution / 30) * 100}%` }} />
          </span>
          <span className="passport-factor-meta">
            <strong>{factor.weight}%</strong> weight
            <span className="passport-factor-contrib">+{factor.contribution}</span>
          </span>
        </div>
        <p className="demo-note">DETERMINISTIC CONTRIBUTION · {factor.hint}</p>
      </div>
      <div className="stack-sheet-art">
        <div className={`passport-field-card passport-card-${index}`}>
          <span>AMAKA / FEAP</span>
          <strong>{stage.artifact}</strong>
          <em>{stage.value}</em>
        </div>
        <div className="passport-red-thread" aria-hidden="true" />
      </div>
    </div>
  )
}

export function FinancialPassport() {
  const [activeProject, setActiveProject] = useState(0)
  const stackRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(5, Math.floor(v * 7))
    setActiveProject((prev) => (prev !== next ? next : prev))
  })

  const scrollToProject = (index: number) => {
    const stack = stackRef.current
    if (!stack) return
    const top = stack.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + index * (window.innerHeight - 44), behavior: 'smooth' })
  }

  return (
    <section id="passport" className="passport-section section-canvas" aria-labelledby="passport-title">
      <div className="passport-kicker">03 / THE PASSPORT</div>
      <div className="passport-intro">
        <h2 id="passport-title">A score that <em className="line-italic">must be earned</em></h2>
        <p>FEAP is a deterministic 0–100 score computed from verified business records — not manually entered claims. Six stacked sheets, six factors, one record.</p>
      </div>

      <div className="passport-stack" ref={stackRef}>
        {passportStages.map((stage, i) => (
          <article
            key={stage.label}
            className={`stack-project stack-project-${i + 1}${i === activeProject ? ' stack-project-active' : ''}`}
            style={{ zIndex: i + 1 }}
          >
            <button className="stack-cap" onClick={() => scrollToProject(i)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {stage.label}
            </button>
            <div className="stack-project-inner">
              <div className="stack-project-head">
                <span>FACTOR {String(i + 1).padStart(2, '0')} / {stage.label}</span>
              </div>
              <StageSheet stage={stage} index={i} tone={stage.tone} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}