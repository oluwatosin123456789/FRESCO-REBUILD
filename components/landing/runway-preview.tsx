'use client'

/**
 * Development preview harness for the 3D runway.
 *
 * Reachable at /dev/runway in development only · the route calls notFound() in production.
 *
 * It exists because the runway is 620vh of scroll: judging a change to stage 04 otherwise
 * means scrolling to roughly 58% of a very tall section and hoping you landed on the beat.
 * Here you scrub straight to any progress value, jump to a stage centre, watch the frame rate,
 * and tune tone-mapping exposure live without a rebuild.
 *
 * Nothing here is imported by the landing page.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { stages } from '@/lib/landing/content'
import { pivotAmount, stageIndexAt, STAGE_WIDTH } from '@/lib/landing/runway-progress'
import { DEFAULT_EXPOSURE } from '@/components/landing/runway-scene'

const RunwayScene = dynamic(() => import('@/components/landing/runway-scene'), {
  ssr: false,
  loading: () => <div style={{ position: 'absolute', inset: 0, background: '#f3efe5' }} />,
})

const panel: React.CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 16,
  zIndex: 100,
  width: 'min(420px, calc(100vw - 32px))',
  padding: '14px 16px',
  borderRadius: 12,
  background: 'rgba(12, 12, 10, 0.86)',
  color: '#f3efe5',
  font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
  backdropFilter: 'blur(8px)',
}

const row: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }

const chip = (active: boolean): React.CSSProperties => ({
  padding: '4px 8px',
  borderRadius: 6,
  border: `1px solid ${active ? '#c8a84b' : 'rgba(243,239,229,0.25)'}`,
  background: active ? 'rgba(200,168,75,0.18)' : 'transparent',
  color: active ? '#c8a84b' : 'rgba(243,239,229,0.7)',
  cursor: 'pointer',
  font: 'inherit',
})

export function RunwayPreview() {
  // progressRef is what the scene reads each frame; targetRef is the requested scrub value.
  // A small RAF lerp moves progressRef toward targetRef so scrubbing stays buttery now that
  // the scene itself does no extra smoothing (it expects the caller to smooth).
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [exposure, setExposure] = useState(DEFAULT_EXPOSURE)
  const [showVeils, setShowVeils] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [fps, setFps] = useState(0)
  const [frameStats, setFrameStats] = useState({ avg: 0, p95: 0 })

  const apply = useCallback((value: number) => {
    targetRef.current = value
    setProgress(value)
  }, [])

  // Drive progressRef toward the requested target at RAF cadence.
  useEffect(() => {
    let id = 0
    const tick = () => {
      progressRef.current += (targetRef.current - progressRef.current) * 0.6
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  // frame-rate + frame-time meter: the cheapest signal that the tier budget and the
  // adaptive quality controller are holding a smooth rate on this device.
  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let windowTimes: number[] = []
    let lastFrame = performance.now()
    let id = 0
    const tick = () => {
      frames += 1
      const now = performance.now()
      windowTimes.push(now - lastFrame)
      lastFrame = now
      if (now - last >= 500) {
        const sorted = [...windowTimes].sort((a, b) => a - b)
        const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0
        const avg = windowTimes.reduce((a, b) => a + b, 0) / Math.max(1, windowTimes.length)
        setFrameStats({ avg, p95 })
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        windowTimes = []
        last = now
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!playing) return
    let id = 0
    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      const next = targetRef.current + (now - last) / 24000
      last = now
      apply(next > 1 ? 0 : next)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [playing, apply])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 0.01 : 0.001
      if (event.key === 'ArrowRight') apply(Math.min(1, progressRef.current + step))
      else if (event.key === 'ArrowLeft') apply(Math.max(0, progressRef.current - step))
      else if (event.key === ' ') {
        event.preventDefault()
        setPlaying((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [apply])

  const stage = stageIndexAt(progress)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <RunwayScene getProgress={() => progressRef.current} exposure={exposure} />
      {showVeils && (
        <>
          <div
            className="runway-veil runway-veil-warm"
            style={{ opacity: 1 - pivotAmount(progress) }}
          />
          <div className="runway-veil runway-veil-deep" style={{ opacity: pivotAmount(progress) }} />
        </>
      )}

      <div style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ color: '#c8a84b' }}>
            {stages[stage].index} {stages[stage].name}
          </strong>
          <span style={{ color: fps < 40 ? '#e0724d' : 'rgba(243,239,229,0.6)' }}>{fps} fps</span>
        </div>
        <div style={{ marginTop: 4, color: 'rgba(243,239,229,0.45)' }}>
          avg {frameStats.avg.toFixed(1)}ms · p95 {frameStats.p95.toFixed(1)}ms
          {frameStats.avg > 20 && <span style={{ color: '#e0724d' }}> · throttled</span>}
        </div>

        <div style={{ marginTop: 6, color: 'rgba(243,239,229,0.6)' }}>
          p {progress.toFixed(4)} · stage-local {(((progress % STAGE_WIDTH) / STAGE_WIDTH) || 0).toFixed(2)} ·
          pivot {pivotAmount(progress).toFixed(2)}
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.0005}
          value={progress}
          onChange={(event) => apply(Number(event.target.value))}
          style={{ width: '100%', marginTop: 10, accentColor: '#c8a84b' }}
          aria-label="Runway scroll progress"
        />

        <div style={row}>
          {stages.map((entry, index) => (
            <button
              key={entry.index}
              style={chip(index === stage)}
              onClick={() => apply((index + 0.5) / stages.length)}
            >
              {entry.index}
            </button>
          ))}
          <button style={chip(playing)} onClick={() => setPlaying((value) => !value)}>
            {playing ? 'pause' : 'play'}
          </button>
          <button style={chip(showVeils)} onClick={() => setShowVeils((value) => !value)}>
            veils
          </button>
        </div>

        <label style={{ display: 'block', marginTop: 12, color: 'rgba(243,239,229,0.6)' }}>
          exposure {exposure.toFixed(2)}
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.01}
            value={exposure}
            onChange={(event) => setExposure(Number(event.target.value))}
            style={{ width: '100%', accentColor: '#c8a84b' }}
          />
        </label>

        <p style={{ margin: '10px 0 0', color: 'rgba(243,239,229,0.4)' }}>
          ← → scrub (shift = coarse) · space plays · settle on a value you like, then set
          DEFAULT_EXPOSURE in runway-scene.tsx and the keys in lib/landing/runway-framing.ts
        </p>
      </div>
    </div>
  )
}
