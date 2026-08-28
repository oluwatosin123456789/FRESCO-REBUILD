import { describe, expect, it } from 'vitest'
import {
  evaluateQuality,
  FRAME_BUDGET_60,
  idleFrameSkip,
  initialQuality,
  PIXEL_RATIO_STEPS,
  pixelRatioFor,
  WATCHDOG_FIRST_WINDOW,
  WATCHDOG_WINDOW,
} from './quality'

describe('quality controller', () => {
  it('starts at the highest quality with shadows enabled', () => {
    const q = initialQuality()
    expect(q).toEqual({ pixelRatioStep: 0, shadowsDisabled: false })
    expect(pixelRatioFor(q.pixelRatioStep)).toBe(1)
  })

  it('holds its setting when the device is comfortably within budget', () => {
    const q = evaluateQuality(initialQuality(), FRAME_BUDGET_60)
    expect(q.pixelRatioStep).toBe(0)
    expect(q.shadowsDisabled).toBe(false)
  })

  it('steps pixel ratio down when the device is too slow', () => {
    const slow = FRAME_BUDGET_60 + 20
    const q1 = evaluateQuality(initialQuality(), slow)
    expect(q1.pixelRatioStep).toBe(1)
    expect(pixelRatioFor(q1.pixelRatioStep)).toBe(PIXEL_RATIO_STEPS[1])
  })

  it('walks down through every pixel-ratio step before disabling shadows', () => {
    const slow = FRAME_BUDGET_60 + 20
    let q = initialQuality()
    const steps = PIXEL_RATIO_STEPS.length - 1
    for (let i = 0; i < steps; i += 1) {
      q = evaluateQuality(q, slow)
      expect(q.shadowsDisabled).toBe(false)
      expect(q.pixelRatioStep).toBe(i + 1)
    }
    // At the floor of pixel ratio, the next step disables shadows.
    q = evaluateQuality(q, slow)
    expect(q.shadowsDisabled).toBe(true)
  })

  it('recovers quality when the device has comfortable headroom', () => {
    const fast = FRAME_BUDGET_60 - 20
    let q = { pixelRatioStep: 3, shadowsDisabled: true }
    q = evaluateQuality(q, fast)
    expect(q.shadowsDisabled).toBe(false)
    q = evaluateQuality(q, fast)
    expect(q.pixelRatioStep).toBe(2)
  })

  it('clamps pixel-ratio lookups', () => {
    expect(pixelRatioFor(-5)).toBe(PIXEL_RATIO_STEPS[0])
    expect(pixelRatioFor(99)).toBe(PIXEL_RATIO_STEPS[PIXEL_RATIO_STEPS.length - 1])
    expect(pixelRatioFor(1.4)).toBe(PIXEL_RATIO_STEPS[1])
  })
})

describe('idle cadence', () => {
  it('skips the most frames on the lowest tier and none on the top tier', () => {
    expect(idleFrameSkip(0)).toBeGreaterThan(idleFrameSkip(1))
    expect(idleFrameSkip(2)).toBe(0)
  })
})

describe('watchdog windows', () => {
  it('responds to an obviously slow device sooner on the first check', () => {
    expect(WATCHDOG_FIRST_WINDOW).toBeLessThan(WATCHDOG_WINDOW)
    expect(WATCHDOG_WINDOW).toBeGreaterThan(0)
  })

  it('never treats a normal 60fps frame as slow', () => {
    // Regression: idle-throttled gaps used to inflate the sampled frame time and wrongly
    // step quality down. A clean budget-level frame must leave quality untouched.
    const q = evaluateQuality(initialQuality(), FRAME_BUDGET_60)
    expect(q.pixelRatioStep).toBe(0)
    expect(q.shadowsDisabled).toBe(false)
  })
})
