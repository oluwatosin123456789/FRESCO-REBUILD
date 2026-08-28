'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { trustClosing, trustLayers } from '@/lib/landing/content'

export function TrustArchitecture() {
  const reduced = useReducedMotion()
  return (
    <section id="trust" className="trust section-canvas" aria-labelledby="trust-title">
      <div className="section-head">
        <p className="eyebrow">System map</p>
        <h2 id="trust-title">
          One signal. <em className="line-italic">Five layers of trust.</em>
        </h2>
      </div>
      <div className="trust-layers">
        <motion.div
          className="trust-thread"
          initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
        {trustLayers.map((layer, index) => (
          <motion.div
            key={layer.layer}
            className="trust-layer"
            initial={reduced ? { opacity: 1 } : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: index * 0.12 }}
          >
            <span className="trust-node" aria-hidden="true" />
            <span className="trust-index">{String(index + 1).padStart(2, '0')}</span>
            <strong>{layer.layer}</strong>
            <p>{layer.meaning}</p>
          </motion.div>
        ))}
      </div>
      <motion.p
        className="trust-closing"
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {trustClosing}
      </motion.p>
    </section>
  )
}