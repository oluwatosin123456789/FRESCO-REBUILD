/**
 * Scroll-progress helpers shared by the runway overlay and the Three.js runway scene.
 *
 * These are deliberately pure (no DOM, no React, no three) so the scroll → stage
 * mapping can be unit tested and so the 3D scene and the DOM overlay stay aligned
 * on exactly the same windows.
 */

/** Four narrative stages: 01 THE FIELD … 04 THE DELIVERY. */
export const STAGE_COUNT = 4

/** Width of a single stage inside the 0..1 runway progress space. */
export const STAGE_WIDTH = 1 / STAGE_COUNT

/**
 * Warm → deep world pivot window.
 * Kept identical to the overlay's existing deep-veil transform so the 3D world,
 * the legibility veils and the copy colour all turn over together.
 * Straddles the 03 THE MARKET → 04 THE DELIVERY boundary (0.75).
 */
export const PIVOT_START = 0.64
export const PIVOT_END = 0.76

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return value < 0 ? 0 : value > 1 ? 1 : value
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Hermite smoothstep, clamped to 0..1. */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/**
 * Remap a progress window into a smoothstepped 0..1 band.
 * Mirrors the reference project's `band(p, start, end)` helper and is the single
 * driver for every stage animation in the scene.
 */
export function band(progress: number, start: number, end: number): number {
  return smoothstep(start, end, progress)
}

/** Linear (un-eased) remap of a window into 0..1 · used for sweeps and travel timing. */
export function ramp(progress: number, start: number, end: number): number {
  if (start === end) return progress < start ? 0 : 1
  return clamp01((progress - start) / (end - start))
}

/** Inclusive-start, exclusive-end progress window owned by a stage. */
export function stageWindow(index: number): readonly [number, number] {
  const i = Math.min(STAGE_COUNT - 1, Math.max(0, Math.floor(index)))
  return [i * STAGE_WIDTH, (i + 1) * STAGE_WIDTH]
}

/**
 * Smoothstepped 0..1 band across a stage's own window.
 * `inset` shrinks the window from both ends so an animation can complete before
 * the stage hands over to the next one.
 */
export function stageBand(progress: number, index: number, inset = 0): number {
  const [start, end] = stageWindow(index)
  const pad = Math.min(inset, (end - start) / 2 - 1e-6)
  return band(progress, start + pad, end - pad)
}

/** Zero-based stage index (0..3) currently owning the progress value. */
export function stageIndexAt(progress: number): number {
  return Math.min(STAGE_COUNT - 1, Math.max(0, Math.floor(clamp01(progress) * STAGE_COUNT)))
}

/** 0 = fully warm agricultural world, 1 = fully deep evergreen financial world. */
export function pivotAmount(progress: number): number {
  return smoothstep(PIVOT_START, PIVOT_END, progress)
}
