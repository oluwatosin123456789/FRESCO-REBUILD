import { describe, expect, it } from 'vitest'
import {
  band,
  clamp01,
  lerp,
  PIVOT_END,
  PIVOT_START,
  pivotAmount,
  ramp,
  smoothstep,
  STAGE_COUNT,
  STAGE_WIDTH,
  stageBand,
  stageIndexAt,
  stageWindow,
} from './runway-progress'
import { stages } from './content'

describe('runway progress helpers', () => {
  it('describes the same four stages as the runway content', () => {
    expect(STAGE_COUNT).toBe(stages.length)
    expect(STAGE_WIDTH).toBeCloseTo(1 / 4, 10)
  })

  it('clamps and interpolates', () => {
    expect(clamp01(-3)).toBe(0)
    expect(clamp01(2.4)).toBe(1)
    expect(clamp01(0.42)).toBe(0.42)
    expect(clamp01(Number.NaN)).toBe(0)
    expect(lerp(10, 20, 0.25)).toBe(12.5)
  })

  it('smoothsteps with flat ends and a half-way midpoint', () => {
    expect(smoothstep(0.2, 0.8, 0.1)).toBe(0)
    expect(smoothstep(0.2, 0.8, 0.9)).toBe(1)
    expect(smoothstep(0.2, 0.8, 0.5)).toBeCloseTo(0.5, 10)
    expect(smoothstep(0.5, 0.5, 0.6)).toBe(1)
  })

  it('bands a window into 0..1 and ramps linearly', () => {
    expect(band(0, 0.25, 0.75)).toBe(0)
    expect(band(1, 0.25, 0.75)).toBe(1)
    expect(band(0.5, 0.25, 0.75)).toBeCloseTo(0.5, 10)
    expect(ramp(0.375, 0.25, 0.75)).toBeCloseTo(0.25, 10)
    expect(ramp(2, 0.25, 0.75)).toBe(1)
  })

  it('gives every stage a contiguous, non-overlapping window', () => {
    for (let i = 0; i < STAGE_COUNT; i += 1) {
      const [start, end] = stageWindow(i)
      expect(end - start).toBeCloseTo(STAGE_WIDTH, 10)
      if (i > 0) expect(start).toBeCloseTo(stageWindow(i - 1)[1], 10)
    }
    expect(stageWindow(0)[0]).toBe(0)
    expect(stageWindow(STAGE_COUNT - 1)[1]).toBeCloseTo(1, 10)
  })

  it('maps progress to the stage index the overlay uses', () => {
    expect(stageIndexAt(0)).toBe(0)
    expect(stageIndexAt(0.17)).toBe(0)
    expect(stageIndexAt(0.5)).toBe(2)
    expect(stageIndexAt(0.76)).toBe(3)
    expect(stageIndexAt(1)).toBe(STAGE_COUNT - 1)
    expect(stageIndexAt(4)).toBe(STAGE_COUNT - 1)
  })

  it('runs a stage band from 0 to 1 inside its own window', () => {
    const [start, end] = stageWindow(2)
    expect(stageBand(start, 2)).toBe(0)
    expect(stageBand(start - 0.05, 2)).toBe(0)
    expect(stageBand(end, 2)).toBe(1)
    expect(stageBand((start + end) / 2, 2)).toBeCloseTo(0.5, 10)
    // an inset window completes before the stage hands over
    expect(stageBand(end - 0.02, 2, 0.02)).toBe(1)
  })

  it('pivots from the warm world to the deep world between stages 03 and 04', () => {
    expect(pivotAmount(PIVOT_START - 0.01)).toBe(0)
    expect(pivotAmount(PIVOT_END + 0.01)).toBe(1)
    expect(pivotAmount((PIVOT_START + PIVOT_END) / 2)).toBeCloseTo(0.5, 10)
    // the pivot straddles the 03 → 04 boundary (0.75) and occupies roughly a tenth of the runway
    expect(PIVOT_START).toBeLessThan(0.75)
    expect(PIVOT_END).toBeGreaterThan(0.75)
    expect(PIVOT_END - PIVOT_START).toBeCloseTo(0.12, 10)
  })
})
